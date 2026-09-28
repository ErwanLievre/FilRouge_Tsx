import Cell, { type CellState } from "./Cell";

type BoardProps = {
  grid: CellState[][];
  onPlay: (x: number, y: number) => void;
  playable?: boolean;
};

export default function Board({ grid, onPlay, playable = true }: BoardProps) {
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
    </div>
  );
}