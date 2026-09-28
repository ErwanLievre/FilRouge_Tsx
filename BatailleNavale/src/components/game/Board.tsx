import Cell, { type CellState } from "./Cell";
import type { Ship } from "../../types";

type BoardProps = {
  grid: CellState[][];
  onPlay: (x: number, y: number) => void;
  playable?: boolean;
  ships?: Ship[];
  showShips?: boolean;
  showSunkShipsOnly?: boolean;
};

const CELL_SIZE = 30;

export default function Board({
  grid,
  onPlay,
  playable = true,
  ships = [],
  showShips = false,
  showSunkShipsOnly = false,
}: BoardProps) {
  return (
    <div className="gameboard">
      {grid.map((row, y) => (
        <div className="gameboard-row" key={y}>
          {row.map((cellState, x) => (
            <Cell
              key={`${x}-${y}`}
              state={cellState}
              onClick={() => onPlay(x, y)}
              disabled={!playable}
            />
          ))}
        </div>
      ))}
      {showShips && ships.map(ship => {
        const isSunk = ship.hits >= ship.cells.length
          || ship.cells.every(({ x, y }) => grid[y]?.[x] === "sunk");
        if (showSunkShipsOnly && !isSunk) return null;

        const hasVisibleShip = ship.cells.some(({ x, y }) => {
          const state = grid[y]?.[x];
          return state === "ship" || state === "hit" || state === "sunk";
        });
        if (!hasVisibleShip) return null;

        const vertical = ship.cells.every(({ x }) => x === ship.cells[0].x);
        const x = Math.min(...ship.cells.map(cell => cell.x));
        const y = Math.min(...ship.cells.map(cell => cell.y));
        const width = vertical ? CELL_SIZE : ship.cells.length * CELL_SIZE;
        const height = vertical ? ship.cells.length * CELL_SIZE : CELL_SIZE;
        const hullPath = vertical
          ? `M3 2 V${height - 10} L15 ${height - 2} L27 ${height - 10} V2 L15 9 Z`
          : `M2 3 H${width - 10} L${width - 2} 15 L${width - 10} 27 H2 L9 15 Z`;
        const deck = vertical
          ? { x: 8, y: height * 0.35, width: 14, height: height * 0.3 }
          : { x: width * 0.35, y: 8, width: width * 0.3, height: 14 };

        return (
          <svg
            key={ship.id}
            className={`gameboard-ship${vertical ? " gameboard-ship--vertical" : ""}${isSunk ? " gameboard-ship--sunk" : ""}`}
            style={{ left: x * CELL_SIZE, top: y * CELL_SIZE, width, height }}
            viewBox={`0 0 ${width} ${height}`}
            aria-hidden="true"
            focusable="false"
          >
            <path className="gameboard-ship-hull" d={hullPath} />
            <rect
              className="gameboard-ship-deck"
              x={deck.x}
              y={deck.y}
              width={deck.width}
              height={deck.height}
              rx="3"
            />
            <circle
              className="gameboard-ship-window"
              cx={vertical ? 15 : width * 0.5}
              cy={vertical ? height * 0.5 : 15}
              r="2"
            />
          </svg>
        );
      })}
    </div>
  );
}