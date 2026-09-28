import { useState } from "react";
import Board from "../components/game/Board";
import { type CellState } from "../components/game/Cell";
import { type Ship } from "../types";

type GamePhase = "placing" | "handoff" | "playing" | "finished";
type PlayerIndex = 0 | 1;
type Orientation = "horizontal" | "vertical";

type PlayerState = {
  grid: CellState[][];
  ships: Ship[];
};

const ROWS = 8;
const COLS = 12;

// 2 bateaux de taille 2, 3 de taille 3, 2 de taille 4, 1 de taille 5
const FLEET_SIZES = [2, 2, 3, 3, 3, 4, 4, 5];

function createEmptyGrid(): CellState[][] {
  return Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => "unknown")
  );
}

function createPlayer(): PlayerState {
  return { grid: createEmptyGrid(), ships: [] };
}

function getShipCells(
  x: number,
  y: number,
  size: number,
  orientation: Orientation
): { x: number; y: number }[] {
  const cells: { x: number; y: number }[] = [];
  for (let i = 0; i < size; i++) {
    cells.push({
      x: orientation === "horizontal" ? x + i : x,
      y: orientation === "horizontal" ? y : y + i,
    });
  }
  return cells;
}

function isValidPlacement(cells: { x: number; y: number }[], grid: CellState[][]): boolean {
  return cells.every(
    ({ x, y }) => x >= 0 && x < COLS && y >= 0 && y < ROWS && grid[y][x] !== "ship"
  );
}

function findShipAt(ships: Ship[], x: number, y: number): Ship | null {
  return ships.find((ship) => ship.cells.some((c) => c.x === x && c.y === y)) ?? null;
}

function applyShot(grid: CellState[][], ships: Ship[], x: number, y: number): PlayerState {
  const targetShip = findShipAt(ships, x, y);
  const nextGrid = grid.map((row) => [...row]);

  if (!targetShip) {
    nextGrid[y][x] = "miss";
    return { grid: nextGrid, ships };
  }

  const nextShips = ships.map((ship) =>
    ship.id === targetShip.id ? { ...ship, hits: ship.hits + 1 } : ship
  );
  const updatedShip = nextShips.find((s) => s.id === targetShip.id)!;

  if (updatedShip.hits === updatedShip.cells.length) {
    updatedShip.cells.forEach(({ x: cx, y: cy }) => (nextGrid[cy][cx] = "sunk"));
  } else {
    nextGrid[y][x] = "hit";
  }

  return { grid: nextGrid, ships: nextShips };
}

function areAllShipsSunk(ships: Ship[]): boolean {
  return ships.every((ship) => ship.hits === ship.cells.length);
}

function hideShips(grid: CellState[][]): CellState[][] {
  return grid.map((row) => row.map((state) => (state === "ship" ? "unknown" : state)));
}

export default function Game() {
  const [phase, setPhase] = useState<GamePhase>("placing");
  const [players, setPlayers] = useState<[PlayerState, PlayerState]>(() => [
    createPlayer(),
    createPlayer(),
  ]);
  const [currentPlayer, setCurrentPlayer] = useState<PlayerIndex>(0);
  const [placingIndex, setPlacingIndex] = useState(0);
  const [orientation, setOrientation] = useState<Orientation>("horizontal");
  const [winner, setWinner] = useState<PlayerIndex | null>(null);

  function updatePlayer(index: PlayerIndex, newState: PlayerState) {
    setPlayers((prev) => (index === 0 ? [newState, prev[1]] : [prev[0], newState]));
  }

  function handlePlaceShip(x: number, y: number) {
    if (phase !== "placing") return;

    const me = players[currentPlayer];
    const size = FLEET_SIZES[placingIndex];
    const cells = getShipCells(x, y, size, orientation);

    if (!isValidPlacement(cells, me.grid)) return; 

    const nextGrid = me.grid.map((row) => [...row]);
    cells.forEach(({ x: cx, y: cy }) => (nextGrid[cy][cx] = "ship"));
    const newShip: Ship = { id: placingIndex, cells, hits: 0 };
    updatePlayer(currentPlayer, { grid: nextGrid, ships: [...me.ships, newShip] });

    if (placingIndex + 1 < FLEET_SIZES.length) {
      setPlacingIndex(placingIndex + 1);
      return;
    }

    if (currentPlayer === 0) {
      setPhase("handoff"); 
    } else {
      setCurrentPlayer(0); 
      setPhase("playing");
    }
  }

  function startPlayer2Placement() {
    setCurrentPlayer(1);
    setPlacingIndex(0);
    setOrientation("horizontal");
    setPhase("placing");
  }

  function handleAttack(targetIndex: PlayerIndex, x: number, y: number) {
    if (phase !== "playing" || targetIndex === currentPlayer) return;

    const target = players[targetIndex];
    const cellState = target.grid[y][x];
    if (cellState !== "unknown" && cellState !== "ship") return; 

    const result = applyShot(target.grid, target.ships, x, y);
    updatePlayer(targetIndex, result);

    if (areAllShipsSunk(result.ships)) {
      setWinner(currentPlayer);
      setPhase("finished");
      return;
    }

    setCurrentPlayer(targetIndex);
  }

  function resetGame() {
    setPhase("placing");
    setPlayers([createPlayer(), createPlayer()]);
    setCurrentPlayer(0);
    setPlacingIndex(0);
    setOrientation("horizontal");
    setWinner(null);
  }

  if (phase === "placing") {
    const currentSize = FLEET_SIZES[placingIndex];
    return (
      <div style={{ padding: "20px" }}>
        <h2>Joueur {currentPlayer + 1} : place tes bateaux</h2>
        <p>L'autre joueur ne doit pas regarder l'écran.</p>
        <p>
          Bateau {placingIndex + 1} / {FLEET_SIZES.length} — taille {currentSize} — orientation :{" "}
          {orientation === "horizontal" ? "horizontale" : "verticale"}
        </p>
        <button
          onClick={() =>
            setOrientation((prev) => (prev === "horizontal" ? "vertical" : "horizontal"))
          }
        >
          Changer l'orientation
        </button>
        <Board grid={players[currentPlayer].grid} onPlay={handlePlaceShip} playable={true} />
      </div>
    );
  }

  if (phase === "handoff") {
    return (
      <div style={{ padding: "20px" }}>
        <h2>Joueur 1 a placé ses bateaux</h2>
        <p>Passe l'écran au Joueur 2. Le plateau du Joueur 1 est caché.</p>
        <button onClick={startPlayer2Placement}>Je suis le Joueur 2, je suis prêt</button>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      {phase === "finished" && winner !== null ? (
        <>
          <h1 style={{ color: "green" }}>🎉 Le Joueur {winner + 1} a gagné !</h1>
          <button onClick={resetGame}>Rejouer</button>
        </>
      ) : (
        <h2>Au tour du Joueur {currentPlayer + 1} : clique sur le plateau adverse</h2>
      )}

      <div style={{ display: "flex", gap: "40px", flexWrap: "wrap" }}>
        {([0, 1] as PlayerIndex[]).map((i) => (
          <div key={i}>
            <h3>Plateau du Joueur {i + 1}</h3>
            <Board
              grid={phase === "finished" ? players[i].grid : hideShips(players[i].grid)}
              onPlay={(x, y) => handleAttack(i, x, y)}
              playable={phase === "playing" && i !== currentPlayer}
            />
          </div>
        ))}
      </div>
    </div>
  );
}