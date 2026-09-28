import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Board from "../components/game/Board";
import { type CellState } from "../components/game/Cell";
import type { Ship } from "../types";
import { finishGame, getGame, saveGame } from "../types/api";

type Orientation = "horizontal" | "vertical";
type GamePhase = "placing" | "playing" | "won" | "lost";

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

function placeFleet() {
    const occupied = Array.from({ length: ROWS }, () => Array(COLS).fill(false));
    const ships: Ship[] = [];

    FLEET_SIZES.forEach((size, id) => {
        let cells: { x: number; y: number }[] | null = null;

        while (!cells) {
            const horizontal = Math.random() < 0.5;
            const maxX = horizontal ? COLS - size : COLS - 1;
            const maxY = horizontal ? ROWS - 1 : ROWS - size;
            const x = Math.floor(Math.random() * (maxX + 1));
            const y = Math.floor(Math.random() * (maxY + 1));
            const candidate = getShipCells(x, y, size, horizontal ? "horizontal" : "vertical");

            if (!candidate.some(({ x, y }) => occupied[y][x])) cells = candidate;
        }

        cells.forEach(({ x, y }) => {
            occupied[y][x] = true;
        });

        ships.push({ id, cells, hits: 0 });
    });

    return ships;
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

function pickRandomTarget(grid: CellState[][]) {
    const candidates: { x: number; y: number }[] = [];

    grid.forEach((row, y) => row.forEach((state, x) => {
        if (state === "unknown" || state === "ship") candidates.push({ x, y });
    }));

    return candidates.length ? candidates[Math.floor(Math.random() * candidates.length)] : null;
}

export default function Game() {
    const { id } = useParams();
    const navigate = useNavigate();
    const gameId = Number(id);

    const [loading, setLoading] = useState(true);
    const [phase, setPhase] = useState<GamePhase>("placing");
    const [placingIndex, setPlacingIndex] = useState(0);
    const [orientation, setOrientation] = useState<Orientation>("horizontal");
    const [myGrid, setMyGrid] = useState<CellState[][]>(createEmptyGrid());
    const [myShips, setMyShips] = useState<Ship[]>([]);
    const [opponentGrid, setOpponentGrid] = useState<CellState[][]>(createEmptyGrid());
    const [opponentShips, setOpponentShips] = useState<Ship[]>([]);
    const [isPlayerTurn, setIsPlayerTurn] = useState(true);

    useEffect(() => {
        async function loadGame() {
            try {
                const game = await getGame(gameId);
                const nextMyGrid = game.myGrid.length ? game.myGrid : createEmptyGrid();
                let nextOpponentGrid = game.opponentGrid.length ? game.opponentGrid : createEmptyGrid();
                let nextOpponentShips = game.opponentShips;

                if (!nextOpponentShips.length) {
                    nextOpponentShips = placeFleet();
                    nextOpponentGrid = createEmptyGrid();
                    await saveGame({ ...game, myGrid: nextMyGrid, opponentGrid: nextOpponentGrid, opponentShips: nextOpponentShips });
                }

                setPhase(game.phase);
                setPlacingIndex(game.placingIndex);
                setOrientation(game.orientation);
                setMyGrid(nextMyGrid);
                setMyShips(game.myShips);
                setOpponentGrid(nextOpponentGrid);
                setOpponentShips(nextOpponentShips);
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

        const size = FLEET_SIZES[placingIndex];
        const cells = getShipCells(x, y, size, orientation);

        if (!isValidPlacement(cells, myGrid)) return;

        const nextGrid = myGrid.map(row => [...row]);
        cells.forEach(({ x, y }) => nextGrid[y][x] = "ship");

        const nextShips = [...myShips, { id: placingIndex, cells, hits: 0 }];
        const lastShip = placingIndex + 1 === FLEET_SIZES.length;
        const nextPhase: GamePhase = lastShip ? "playing" : "placing";
        const nextIndex = lastShip ? placingIndex : placingIndex + 1;

        setMyGrid(nextGrid);
        setMyShips(nextShips);
        setPhase(nextPhase);
        setPlacingIndex(nextIndex);

        const game = await getGame(gameId);

        await saveGame({
            ...game,
            phase: nextPhase,
            myGrid: nextGrid,
            myShips: nextShips,
            placingIndex: nextIndex,
            orientation,
        });
    }

    function toggleOrientation() {
        setOrientation(current => current === "horizontal" ? "vertical" : "horizontal");
    }

    async function handleAttack(x: number, y: number) {
        if (phase !== "playing" || !isPlayerTurn || opponentGrid[y][x] !== "unknown") return;

        const result = applyShot(opponentGrid, opponentShips, x, y);

        setOpponentGrid(result.grid);
        setOpponentShips(result.ships);

        if (areAllShipsSunk(result.ships)) {
            setPhase("won");

            const game = await getGame(gameId);

            await finishGame({
                ...game,
                phase: "won",
                myGrid,
                myShips,
                opponentGrid: result.grid,
                opponentShips: result.ships,
                isPlayerTurn: true,
            }, "won");

            return;
        }

        setIsPlayerTurn(false);

        const game = await getGame(gameId);

        await saveGame({
            ...game,
            phase: "playing",
            myGrid,
            myShips,
            opponentGrid: result.grid,
            opponentShips: result.ships,
            isPlayerTurn: false,
        });

        setTimeout(async () => {
            const target = pickRandomTarget(myGrid);
            if (!target) return;

            const botResult = applyShot(myGrid, myShips, target.x, target.y);

            setMyGrid(botResult.grid);
            setMyShips(botResult.ships);

            if (areAllShipsSunk(botResult.ships)) {
                setPhase("lost");

                const latestGame = await getGame(gameId);

                await finishGame({
                    ...latestGame,
                    phase: "lost",
                    myGrid: botResult.grid,
                    myShips: botResult.ships,
                    opponentGrid: result.grid,
                    opponentShips: result.ships,
                    isPlayerTurn: false,
                }, "lost");

                return;
            }

            setIsPlayerTurn(true);

            const latestGame = await getGame(gameId);

            await saveGame({
                ...latestGame,
                phase: "playing",
                myGrid: botResult.grid,
                myShips: botResult.ships,
                opponentGrid: result.grid,
                opponentShips: result.ships,
                isPlayerTurn: true,
            });
        }, 600);
    }

    if (loading) return <p>Chargement de la partie...</p>;

    if (phase === "placing") {
        return (
            <div>
                <h2>Place tes bateaux</h2>
                <p>
                    Bateau {placingIndex + 1} / {FLEET_SIZES.length} — taille {FLEET_SIZES[placingIndex]} —{" "}
                    {orientation === "horizontal" ? "horizontal" : "vertical"}
                </p>
                <button onClick={toggleOrientation}>Changer l'orientation</button>
                <Board
                    grid={myGrid}
                    onPlay={handlePlaceShip}
                    playable
                    ships={myShips}
                    showShips
                />
            </div>
        );
    }

    return (
        <div>
            {phase === "won" && <h1>🎉 Victoire !</h1>}
            {phase === "lost" && <h1>💀 Défaite...</h1>}

            <h2>Ta grille</h2>
            <Board
                grid={myGrid}
                onPlay={() => {}}
                playable={false}
                ships={myShips}
                showShips
            />

            <h2>
                Grille adverse {phase === "playing" && isPlayerTurn ? "(à toi de jouer)" : ""}
            </h2>

            <Board
                grid={opponentGrid}
                onPlay={handleAttack}
                playable={phase === "playing" && isPlayerTurn}
                ships={opponentShips}
                showShips
            />
        </div>
    );
}