import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Board from "../components/game/Board";
import type { CellState } from "../components/game/Cell";
import { getGame, updateGameState } from "../services/api";
import { useAuth } from "../context/AuthContext";
import type { Game as ServerGame } from "../types/game";
import type { Ship } from "../types";

const ROWS = 8, COLS = 12, FLEET_SIZES = [2, 2, 3, 3, 3, 4, 4, 5];
type Fleet = { grid: CellState[][]; ships: Ship[] };
type NavalState = { phase: "placing" | "playing"; boards: Record<string, Fleet> };
const emptyGrid = (): CellState[][] => Array.from({ length: ROWS }, () => Array.from({ length: COLS }, () => "unknown" as CellState));
const getCells = (x: number, y: number, size: number, orientation: "horizontal" | "vertical") => Array.from({ length: size }, (_, i) => ({ x: orientation === "horizontal" ? x + i : x, y: orientation === "horizontal" ? y : y + i }));
const sunk = (ships: Ship[]) => ships.every((ship) => ship.hits === ship.cells.length);
const parseState = (value: string): NavalState => { try { const state = JSON.parse(value) as NavalState; return state.boards ? state : { phase: "placing", boards: {} }; } catch { return { phase: "placing", boards: {} }; } };
const applyShot = (fleet: Fleet, x: number, y: number): Fleet => {
    const grid = fleet.grid.map((row) => [...row]);
    const ship = fleet.ships.find((s) => s.cells.some((cell) => cell.x === x && cell.y === y));
    if (!ship) { grid[y][x] = "miss"; return { grid, ships: fleet.ships }; }
    const ships = fleet.ships.map((s) => s.id === ship.id ? { ...s, hits: s.hits + 1 } : s);
    const hit = ships.find((s) => s.id === ship.id)!;
    if (hit.hits === hit.cells.length) hit.cells.forEach((cell) => { grid[cell.y][cell.x] = "sunk"; }); else grid[y][x] = "hit";
    return { grid, ships };
};

export default function Game() {
    const { gameId } = useParams(); const { user } = useAuth();
    const [game, setGame] = useState<ServerGame | null>(null); const [error, setError] = useState<string | null>(null);
    const [placingIndex, setPlacingIndex] = useState(0); const [orientation, setOrientation] = useState<"horizontal" | "vertical">("horizontal");
    const [draft, setDraft] = useState<Fleet>({ grid: emptyGrid(), ships: [] });
    const id = Number(gameId);
    const load = async () => { try { setGame(await getGame(id)); setError(null); } catch (e) { setError(e instanceof Error ? e.message : "Impossible de charger la partie."); } };
    useEffect(() => { void load(); const timer = window.setInterval(() => void load(), 3000); return () => window.clearInterval(timer); }, [id]);
    if (!user) return null;
    if (!game) return <main className="page"><p>{error ?? "Chargement…"}</p></main>;
    const state = parseState(game.state); const opponent = game.players.find((p) => p.id !== user.id);
    const myFleet = state.boards[String(user.id)]; const opponentFleet = opponent ? state.boards[String(opponent.id)] : undefined;
    const result = game.endData ? JSON.parse(game.endData) as { winnerId?: number } : null;

    const place = (x: number, y: number) => {
        if (!game.isYourTurn || state.phase !== "placing") return;
        const cells = getCells(x, y, FLEET_SIZES[placingIndex], orientation);
        if (!cells.every((cell) => cell.x >= 0 && cell.x < COLS && cell.y >= 0 && cell.y < ROWS && draft.grid[cell.y][cell.x] !== "ship")) return;
        const grid = draft.grid.map((row) => [...row]); cells.forEach((cell) => { grid[cell.y][cell.x] = "ship"; });
        const next = { grid, ships: [...draft.ships, { id: placingIndex, cells, hits: 0 }] };
        setDraft(next);
        if (placingIndex < FLEET_SIZES.length - 1) { setPlacingIndex(placingIndex + 1); return; }
        const boards = { ...state.boards, [user.id]: next }; const nextPlayer = game.players.find((p) => p.id !== user.id)!;
        const nextState: NavalState = { phase: Object.keys(boards).length === 2 ? "playing" : "placing", boards };
        void updateGameState(id, { state: JSON.stringify(nextState), currentTurnUserId: Object.keys(boards).length === 2 ? game.creatorId : nextPlayer.id }).then(setGame).catch((e: unknown) => setError(e instanceof Error ? e.message : "Erreur"));
    };
    const attack = (x: number, y: number) => {
        if (!game.isYourTurn || state.phase !== "playing" || !opponent || !opponentFleet || opponentFleet.grid[y][x] !== "unknown") return;
        const target = applyShot(opponentFleet, x, y); const boards = { ...state.boards, [opponent.id]: target };
        const ended = sunk(target.ships);
        void updateGameState(id, ended ? { state: JSON.stringify({ ...state, boards }), ended: true, endData: JSON.stringify({ winnerId: user.id }) } : { state: JSON.stringify({ ...state, boards }), currentTurnUserId: opponent.id }).then(setGame).catch((e: unknown) => setError(e instanceof Error ? e.message : "Erreur"));
    };

    if (game.status === "ended") return <main className="page"><section className="card"><h1>{result?.winnerId === user.id ? "🎉 Victoire !" : "💀 Défaite..."}</h1><p>La partie #{game.id} est terminée.</p><Link className="button" to="/history">Voir l'historique</Link></section></main>;
    if (state.phase === "placing") return <main className="page"><section className="card"><h1>Partie #{game.id}</h1>{game.isYourTurn ? <><h2>Place tes bateaux</h2><p>Bateau {placingIndex + 1}/{FLEET_SIZES.length}, taille {FLEET_SIZES[placingIndex]} — {orientation === "horizontal" ? "horizontal" : "vertical"}</p><button className="button" onClick={() => setOrientation(orientation === "horizontal" ? "vertical" : "horizontal")}>Changer l'orientation</button><Board grid={draft.grid} onPlay={place} /></> : <p>En attente que {game.players.find((p) => p.id === game.currentTurnUserId)?.email} place sa flotte…</p>}{error && <p role="alert">{error}</p>}</section></main>;
    if (!myFleet || !opponentFleet) return <main className="page"><p>Synchronisation de la partie…</p></main>;
    const targetGrid = opponentFleet.grid.map((row) => row.map((cell) => cell === "ship" ? "unknown" : cell));
    return <main className="page"><section className="card"><h1>Partie #{game.id}</h1><p>{game.isYourTurn ? "À toi de jouer !" : `Tour de ${game.players.find((p) => p.id === game.currentTurnUserId)?.email}.`}</p><h2>Ta grille</h2><Board grid={myFleet.grid} onPlay={() => undefined} playable={false} /><h2>Grille adverse</h2><Board grid={targetGrid} onPlay={attack} playable={game.isYourTurn} />{error && <p role="alert">{error}</p>}</section></main>;
}
