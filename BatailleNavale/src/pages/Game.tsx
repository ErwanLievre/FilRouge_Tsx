import { useState } from "react";
import Board from "../components/game/Board";
import { type CellState } from "../components/game/Cell";
import { type Ship } from "../types";

type GamePhase = "placing" | "playing" | "won" | "lost";

function areAllShipsSunk(ships: Ship[]): boolean {
  return ships.every((ship) => ship.hits === ship.cells.length);
}

const ROWS = 8;
const COLS = 12;

const FLEET_SIZES = [2, 2, 3, 3, 3, 4, 4, 5];

function createEmptyGrid(): CellState[][] {
  return Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => "unknown")
  );
}

function getShipCells(
  x: number,
  y: number,
  size: number,
  orientation: "horizontal" | "vertical"
): { x: number; y: number }[] {
  const cells: { x: number; y: number }[] = [];
  for (let i = 0; i < size; i++) {
    const cx = orientation === "horizontal" ? x + i : x;
    const cy = orientation === "horizontal" ? y : y + i;
    cells.push({ x: cx, y: cy });
  }
  return cells;
}

function isValidPlacement(cells: { x: number; y: number }[], grid: CellState[][]): boolean {
  return cells.every(
    ({ x, y }) => x >= 0 && x < COLS && y >= 0 && y < ROWS && grid[y][x] !== "ship"
  );
}

function tryPlaceShip(size: number, occupied: boolean[][]): { x: number; y: number }[] | null {
  const horizontal = Math.random() < 0.5;
  const maxX = horizontal ? COLS - size : COLS - 1;
  const maxY = horizontal ? ROWS - 1 : ROWS - size;
  if (maxX < 0 || maxY < 0) return null;

  const startX = Math.floor(Math.random() * (maxX + 1));
  const startY = Math.floor(Math.random() * (maxY + 1));

  const cells: { x: number; y: number }[] = [];
  for (let i = 0; i < size; i++) {
    const x = horizontal ? startX + i : startX;
    const y = horizontal ? startY : startY + i;
    if (occupied[y][x]) return null;
    cells.push({ x, y });
  }
  return cells;
}

// Placement bot
function placeFleet(): { grid: CellState[][]; ships: Ship[] } {
  const grid = createEmptyGrid();
  const occupied: boolean[][] = Array.from({ length: ROWS }, () => Array(COLS).fill(false));
  const ships: Ship[] = [];

  FLEET_SIZES.forEach((size, index) => {
    let cells: { x: number; y: number }[] | null = null;
    while (!cells) {
      cells = tryPlaceShip(size, occupied);
    }
    cells.forEach(({ x, y }) => {
      occupied[y][x] = true;
      grid[y][x] = "ship";
    });
    ships.push({ id: index, cells, hits: 0 });
  });

  return { grid, ships };
}

function findShipAt(ships: Ship[], x: number, y: number): Ship | null {
  return ships.find((ship) => ship.cells.some((c) => c.x === x && c.y === y)) ?? null;
}

function applyShot(grid: CellState[][], ships: Ship[], x: number, y: number) {
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


//att bot
function pickRandomTarget(grid: CellState[][]): { x: number; y: number } | null {
  const candidates: { x: number; y: number }[] = [];
  grid.forEach((row, y) =>
    row.forEach((state, x) => {
      if (state === "unknown" || state === "ship") candidates.push({ x, y });
    })
  );
  if (candidates.length === 0) return null;
  return candidates[Math.floor(Math.random() * candidates.length)];
}

export default function Game() {
  const [phase, setPhase] = useState<GamePhase>("placing");

  const [placingIndex, setPlacingIndex] = useState(0);
  const [orientation, setOrientation] = useState<"horizontal" | "vertical">("horizontal");
  const [myGrid, setMyGrid] = useState<CellState[][]>(createEmptyGrid());
  const [myShips, setMyShips] = useState<Ship[]>([]);

  const [opponentFleet] = useState(() => placeFleet());
  const [opponentGrid, setOpponentGrid] = useState<CellState[][]>(createEmptyGrid());
  const [opponentShips, setOpponentShips] = useState<Ship[]>(opponentFleet.ships);

  const [isPlayerTurn, setIsPlayerTurn] = useState(true);

  function handlePlaceShip(x: number, y: number) {
    if (phase !== "placing") return;

    const size = FLEET_SIZES[placingIndex];
    const cells = getShipCells(x, y, size, orientation);

    if (!isValidPlacement(cells, myGrid)) return;

    const nextGrid = myGrid.map((row) => [...row]);
    cells.forEach(({ x: cx, y: cy }) => (nextGrid[cy][cx] = "ship"));
    setMyGrid(nextGrid);

    const newShip: Ship = { id: placingIndex, cells, hits: 0 };
    setMyShips((prev) => [...prev, newShip]);

    if (placingIndex + 1 === FLEET_SIZES.length) {
      setPhase("playing");
    } else {
      setPlacingIndex(placingIndex + 1);
    }
  }

  function toggleOrientation() {
    setOrientation((prev) => (prev === "horizontal" ? "vertical" : "horizontal"));
  }

  function handleAttack(x: number, y: number) {
    if (phase !== "playing") return;
    if (!isPlayerTurn || opponentGrid[y][x] !== "unknown") return;

    const result = applyShot(opponentGrid, opponentShips, x, y);
    setOpponentGrid(result.grid);
    setOpponentShips(result.ships);

    if (areAllShipsSunk(result.ships)) {
      setPhase("won");
      return;
    }

    setIsPlayerTurn(false);

    setTimeout(() => {
      const target = pickRandomTarget(myGrid);
      if (!target) return;
      const botResult = applyShot(myGrid, myShips, target.x, target.y);
      setMyGrid(botResult.grid);
      setMyShips(botResult.ships);

      if (areAllShipsSunk(botResult.ships)) {
        setPhase("lost");
        return;
      }

      setIsPlayerTurn(true);
    }, 600);
  }

  if (phase === "placing") {
    const currentSize = FLEET_SIZES[placingIndex];
    return (
      <div style={{ padding: "20px" }}>
        <h2>Place tes bateaux</h2>
        <p>
          Bateau {placingIndex + 1} / {FLEET_SIZES.length} — taille {currentSize} —
          orientation : {orientation === "horizontal" ? "horizontale" : "verticale"}
        </p>
        <button onClick={toggleOrientation}>Changer l'orientation</button>
        <Board grid={myGrid} onPlay={handlePlaceShip} playable={true} />
      </div>
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      {phase === "won" && <h1 style={{ color: "green" }}>🎉 Victoire !</h1>}
      {phase === "lost" && <h1 style={{ color: "red" }}>💀 Défaite...</h1>}

      <h2>Ta grille</h2>
      <Board grid={myGrid} onPlay={() => {}} playable={false} />

      <h2>Grille adverse {isPlayerTurn && phase === "playing" ? "(à toi de jouer)" : ""}</h2>
      <Board
        grid={opponentGrid}
        onPlay={handleAttack}
        playable={isPlayerTurn && phase === "playing"}
      />
    </div>
  );
}
import { useState } from "react";
import Board from "../components/game/Board";
import { type CellState } from "../components/game/Cell";
import { type Ship } from "../types";

type GamePhase = "placing" | "playing" | "won" | "lost";

function areAllShipsSunk(ships: Ship[]): boolean {
  return ships.every((ship) => ship.hits === ship.cells.length);
}

const ROWS = 8;
const COLS = 12;

const FLEET_SIZES = [2, 2, 3, 3, 3, 4, 4, 5];

function createEmptyGrid(): CellState[][] {
  return Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => "unknown")
  );
}

function getShipCells(
  x: number,
  y: number,
  size: number,
  orientation: "horizontal" | "vertical"
): { x: number; y: number }[] {
  const cells: { x: number; y: number }[] = [];
  for (let i = 0; i < size; i++) {
    const cx = orientation === "horizontal" ? x + i : x;
    const cy = orientation === "horizontal" ? y : y + i;
    cells.push({ x: cx, y: cy });
  }
  return cells;
}

function isValidPlacement(cells: { x: number; y: number }[], grid: CellState[][]): boolean {
  return cells.every(
    ({ x, y }) => x >= 0 && x < COLS && y >= 0 && y < ROWS && grid[y][x] !== "ship"
  );
}

function tryPlaceShip(size: number, occupied: boolean[][]): { x: number; y: number }[] | null {
  const horizontal = Math.random() < 0.5;
  const maxX = horizontal ? COLS - size : COLS - 1;
  const maxY = horizontal ? ROWS - 1 : ROWS - size;
  if (maxX < 0 || maxY < 0) return null;

  const startX = Math.floor(Math.random() * (maxX + 1));
  const startY = Math.floor(Math.random() * (maxY + 1));

  const cells: { x: number; y: number }[] = [];
  for (let i = 0; i < size; i++) {
    const x = horizontal ? startX + i : startX;
    const y = horizontal ? startY : startY + i;
    if (occupied[y][x]) return null;
    cells.push({ x, y });
  }
  return cells;
}

// Placement bot
function placeFleet(): { grid: CellState[][]; ships: Ship[] } {
  const grid = createEmptyGrid();
  const occupied: boolean[][] = Array.from({ length: ROWS }, () => Array(COLS).fill(false));
  const ships: Ship[] = [];

  FLEET_SIZES.forEach((size, index) => {
    let cells: { x: number; y: number }[] | null = null;
    while (!cells) {
      cells = tryPlaceShip(size, occupied);
    }
    cells.forEach(({ x, y }) => {
      occupied[y][x] = true;
      grid[y][x] = "ship";
    });
    ships.push({ id: index, cells, hits: 0 });
  });

  return { grid, ships };
}

function findShipAt(ships: Ship[], x: number, y: number): Ship | null {
  return ships.find((ship) => ship.cells.some((c) => c.x === x && c.y === y)) ?? null;
}

function applyShot(grid: CellState[][], ships: Ship[], x: number, y: number) {
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


//att bot
function pickRandomTarget(grid: CellState[][]): { x: number; y: number } | null {
  const candidates: { x: number; y: number }[] = [];
  grid.forEach((row, y) =>
    row.forEach((state, x) => {
      if (state === "unknown" || state === "ship") candidates.push({ x, y });
    })
  );
  if (candidates.length === 0) return null;
  return candidates[Math.floor(Math.random() * candidates.length)];
}

export default function Game() {
  const [phase, setPhase] = useState<GamePhase>("placing");

  const [placingIndex, setPlacingIndex] = useState(0);
  const [orientation, setOrientation] = useState<"horizontal" | "vertical">("horizontal");
  const [myGrid, setMyGrid] = useState<CellState[][]>(createEmptyGrid());
  const [myShips, setMyShips] = useState<Ship[]>([]);

  const [opponentFleet] = useState(() => placeFleet());
  const [opponentGrid, setOpponentGrid] = useState<CellState[][]>(createEmptyGrid());
  const [opponentShips, setOpponentShips] = useState<Ship[]>(opponentFleet.ships);

  const [isPlayerTurn, setIsPlayerTurn] = useState(true);

  function handlePlaceShip(x: number, y: number) {
    if (phase !== "placing") return;

    const size = FLEET_SIZES[placingIndex];
    const cells = getShipCells(x, y, size, orientation);

    if (!isValidPlacement(cells, myGrid)) return;

    const nextGrid = myGrid.map((row) => [...row]);
    cells.forEach(({ x: cx, y: cy }) => (nextGrid[cy][cx] = "ship"));
    setMyGrid(nextGrid);

    const newShip: Ship = { id: placingIndex, cells, hits: 0 };
    setMyShips((prev) => [...prev, newShip]);

    if (placingIndex + 1 === FLEET_SIZES.length) {
      setPhase("playing");
    } else {
      setPlacingIndex(placingIndex + 1);
    }
  }

  function toggleOrientation() {
    setOrientation((prev) => (prev === "horizontal" ? "vertical" : "horizontal"));
  }

  function handleAttack(x: number, y: number) {
    if (phase !== "playing") return;
    if (!isPlayerTurn || opponentGrid[y][x] !== "unknown") return;

    const result = applyShot(opponentGrid, opponentShips, x, y);
    setOpponentGrid(result.grid);
    setOpponentShips(result.ships);

    if (areAllShipsSunk(result.ships)) {
      setPhase("won");
      return;
    }

    setIsPlayerTurn(false);

    setTimeout(() => {
      const target = pickRandomTarget(myGrid);
      if (!target) return;
      const botResult = applyShot(myGrid, myShips, target.x, target.y);
      setMyGrid(botResult.grid);
      setMyShips(botResult.ships);

      if (areAllShipsSunk(botResult.ships)) {
        setPhase("lost");
        return;
      }

      setIsPlayerTurn(true);
    }, 600);
  }

  if (phase === "placing") {
    const currentSize = FLEET_SIZES[placingIndex];
    return (
      <div style={{ padding: "20px" }}>
        <h2>Place tes bateaux</h2>
        <p>
          Bateau {placingIndex + 1} / {FLEET_SIZES.length} — taille {currentSize} —
          orientation : {orientation === "horizontal" ? "horizontale" : "verticale"}
        </p>
        <button onClick={toggleOrientation}>Changer l'orientation</button>
        <Board grid={myGrid} onPlay={handlePlaceShip} playable={true} />
      </div>
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      {phase === "won" && <h1 style={{ color: "green" }}>🎉 Victoire !</h1>}
      {phase === "lost" && <h1 style={{ color: "red" }}>💀 Défaite...</h1>}

      <h2>Ta grille</h2>
      <Board grid={myGrid} onPlay={() => {}} playable={false} />

      <h2>Grille adverse {isPlayerTurn && phase === "playing" ? "(à toi de jouer)" : ""}</h2>
      <Board
        grid={opponentGrid}
        onPlay={handleAttack}
        playable={isPlayerTurn && phase === "playing"}
      />
    </div>
  );
}