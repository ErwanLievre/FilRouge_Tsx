import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Board from "../components/game/Board";
import { type CellState } from "../components/game/Cell";
import type { Ship } from "../types";
import { finishGame, getGame, saveGame } from "../types/api";

type Orientation = "horizontal" | "vertical";
type GamePhase = "placing" | "playing" | "won" | "lost";
type PlayerIndex = 0 | 1;

const ROWS = 8;
const COLS = 12;
const FLEET_SIZES = [2, 2, 3, 3, 3, 4, 4, 5];

function createEmptyGrid(): CellState[][] {
    return Array.from({ length: ROWS }, () => Array.from({ length: COLS }, () => "unknown"));
}

function getShipCells(x: number, y: number, size: number, orientation: Orientation) {
    return Array.from({ length: size }, (_, i) => ({
        x: orientation === "horizontal" ? x + i : x,
        y: orientation === "horizontal" ? y : y + i,
    }));
}

function isValidPlacement(cells: { x: number; y: number }[], grid: CellState[][]) {
    return cells.every(({ x, y }) => x >= 0 && x < COLS && y >= 0 && y < ROWS && grid[y][x] !== "ship");
}

function findShipAt(ships: Ship[], x: number, y: number) {
    return ships.find(ship => ship.cells.some(cell => cell.x === x && cell.y === y)) ?? null;
}

function applyShot(grid: CellState[][], ships: Ship[], x: number, y: number) {
    const ship = findShipAt(ships, x, y);
    const nextGrid = grid.map(row => [...row]);

    if (!ship) {
        nextGrid[y][x] = "miss";
        return { grid: nextGrid, ships };
    }

    const nextShips = ships.map(item => item.id === ship.id ? { ...item, hits: item.hits + 1 } : item);
    const updatedShip = nextShips.find(item => item.id === ship.id)!;

    if (updatedShip.hits === updatedShip.cells.length) {
        updatedShip.cells.forEach(({ x, y }) => nextGrid[y][x] = "sunk");
    } else {
        nextGrid[y][x] = "hit";
    }

    return { grid: nextGrid, ships: nextShips };
}

function areAllShipsSunk(ships: Ship[]) {
    return ships.every(ship => ship.hits === ship.cells.length);
}

function hideShips(grid: CellState[][]): CellState[][] {
    return grid.map(row => row.map(state => state === "ship" ? "unknown" : state));
}

export default function Game() {
    const { id } = useParams();
    const navigate = useNavigate();
    const gameId = Number(id);

    const [loading, setLoading] = useState(true);
    const [phase, setPhase] = useState<GamePhase>("placing");
    const [orientation, setOrientation] = useState<Orientation>("horizontal");

    const [myGrid, setMyGrid] = useState<CellState[][]>(createEmptyGrid());
    const [myShips, setMyShips] = useState<Ship[]>([]);

    const [opponentGrid, setOpponentGrid] = useState<CellState[][]>(createEmptyGrid());
    const [opponentShips, setOpponentShips] = useState<Ship[]>([]);

    const [isPlayerTurn, setIsPlayerTurn] = useState(true);

    const [player2Ready, setPlayer2Ready] = useState(false);

    const currentPlayer: PlayerIndex = isPlayerTurn ? 0 : 1;
    const placingPlayer: PlayerIndex = myShips.length < FLEET_SIZES.length ? 0 : 1;
    const placingShips = placingPlayer === 0 ? myShips : opponentShips;
    const placingIndex = placingShips.length;

    useEffect(() => {
        async function loadGame() {
            try {
                const game = await getGame(gameId);

                setPhase(game.phase);
                setOrientation(game.orientation);
                setMyGrid(game.myGrid.length ? game.myGrid : createEmptyGrid());
                setMyShips(game.myShips);
                setOpponentGrid(game.opponentGrid.length ? game.opponentGrid : createEmptyGrid());
                setOpponentShips(game.opponentShips);
                setIsPlayerTurn(game.isPlayerTurn);
            } catch (error) {
                console.error(error);
                navigate("/games");
            } finally {
                setLoading(false);
            }
        }

        if (Number.isFinite(gameId)) loadGame();
        else navigate("/games");
    }, [gameId, navigate]);

    async function handlePlaceShip(x: number, y: number) {
        if (phase !== "placing") return;

        const grid = placingPlayer === 0 ? myGrid : opponentGrid;
        const cells = getShipCells(x, y, FLEET_SIZES[placingIndex], orientation);

        if (!isValidPlacement(cells, grid)) return;

        const nextGrid = grid.map(row => [...row]);
        cells.forEach(({ x, y }) => nextGrid[y][x] = "ship");

        const nextShips = [...placingShips, { id: placingIndex, cells, hits: 0 }];
        const bothDone = placingPlayer === 1 && nextShips.length === FLEET_SIZES.length;
        const nextPhase: GamePhase = bothDone ? "playing" : "placing";

        const nextMyGrid = placingPlayer === 0 ? nextGrid : myGrid;
        const nextMyShips = placingPlayer === 0 ? nextShips : myShips;
        const nextOpponentGrid = placingPlayer === 1 ? nextGrid : opponentGrid;
        const nextOpponentShips = placingPlayer === 1 ? nextShips : opponentShips;

        setMyGrid(nextMyGrid);
        setMyShips(nextMyShips);
        setOpponentGrid(nextOpponentGrid);
        setOpponentShips(nextOpponentShips);
        setPhase(nextPhase);
        setIsPlayerTurn(true);

        const game = await getGame(gameId);

        await saveGame({
            ...game,
            phase: nextPhase,
            myGrid: nextMyGrid,
            myShips: nextMyShips,
            opponentGrid: nextOpponentGrid,
            opponentShips: nextOpponentShips,
            placingIndex: Math.min(nextShips.length, FLEET_SIZES.length - 1),
            orientation,
            isPlayerTurn: true,
        });
    }

    function toggleOrientation() {
        setOrientation(current => current === "horizontal" ? "vertical" : "horizontal");
    }

    function startPlayer2Placement() {
        setOrientation("horizontal");
        setPlayer2Ready(true);
    }

    async function handleAttack(target: PlayerIndex, x: number, y: number) {
        if (phase !== "playing" || target === currentPlayer) return;

        const targetGrid = target === 0 ? myGrid : opponentGrid;
        const targetShips = target === 0 ? myShips : opponentShips;
        const cellState = targetGrid[y][x];

        if (cellState !== "unknown" && cellState !== "ship") return;

        const result = applyShot(targetGrid, targetShips, x, y);

        const nextMyGrid = target === 0 ? result.grid : myGrid;
        const nextMyShips = target === 0 ? result.ships : myShips;
        const nextOpponentGrid = target === 1 ? result.grid : opponentGrid;
        const nextOpponentShips = target === 1 ? result.ships : opponentShips;

        const outcome: "won" | "lost" = currentPlayer === 0 ? "won" : "lost";
        const finished = areAllShipsSunk(result.ships);
        const nextPhase: GamePhase = finished ? outcome : "playing";
        const nextTurn = finished ? isPlayerTurn : !isPlayerTurn;

        setMyGrid(nextMyGrid);
        setMyShips(nextMyShips);
        setOpponentGrid(nextOpponentGrid);
        setOpponentShips(nextOpponentShips);
        setPhase(nextPhase);
        setIsPlayerTurn(nextTurn);

        const game = await getGame(gameId);

        const nextGame = {
            ...game,
            phase: nextPhase,
            myGrid: nextMyGrid,
            myShips: nextMyShips,
            opponentGrid: nextOpponentGrid,
            opponentShips: nextOpponentShips,
            isPlayerTurn: nextTurn,
        };

        if (finished) await finishGame(nextGame, outcome);
        else await saveGame(nextGame);
    }

    if (loading) return <p>Chargement de la partie...</p>;

    if (phase === "placing") {
        if (placingPlayer === 1 && opponentShips.length === 0 && !player2Ready) {
            return (
                <div>
                    <h2>Joueur 1 a placé ses bateaux</h2>
                    <p>Passe l'écran au Joueur 2. Le plateau du Joueur 1 est caché.</p>
                    <button onClick={startPlayer2Placement}>Je suis le Joueur 2, je suis prêt</button>
                </div>
            );
        }

        return (
            <div>
                <h2>Joueur {placingPlayer + 1} : place tes bateaux</h2>
                <p>L'autre joueur ne doit pas regarder l'écran.</p>
                <p>
                    Bateau {placingIndex + 1} / {FLEET_SIZES.length} — taille {FLEET_SIZES[placingIndex]} —{" "}
                    {orientation === "horizontal" ? "horizontal" : "vertical"}
                </p>
                <button onClick={toggleOrientation}>Changer l'orientation</button>
                <Board
                    grid={placingPlayer === 0 ? myGrid : opponentGrid}
                    onPlay={handlePlaceShip}
                    playable
                    ships={placingShips}
                    showShips
                />
            </div>
        );
    }

    const finished = phase === "won" || phase === "lost";

    return (
        <div>
            {finished ? (
                <>
                    <h1>🎉 Le Joueur {phase === "won" ? 1 : 2} a gagné !</h1>
                    <button onClick={() => navigate("/games")}>Retour aux parties</button>
                </>
            ) : (
                <h2>Au tour du Joueur {currentPlayer + 1} : clique sur le plateau adverse</h2>
            )}

            <div style={{ display: "flex", gap: "40px", flexWrap: "wrap" }}>
                {([0, 1] as PlayerIndex[]).map(i => {
                    const grid = i === 0 ? myGrid : opponentGrid;

                    return (
                        <div key={i}>
                            <h3>Plateau du Joueur {i + 1}</h3>
                            <Board
                                grid={finished ? grid : hideShips(grid)}
                                onPlay={(x, y) => handleAttack(i, x, y)}
                                playable={phase === "playing" && i !== currentPlayer}
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
}