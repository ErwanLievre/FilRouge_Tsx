import type { Board as BoardType } from '../../types/game'
import { Cell } from './Cell'

interface BoardProps {
  board: BoardType
  interactive?: boolean
  onCellClick?: (row: number, column: number) => void
}

export function Board({ board, interactive = false, onCellClick }: BoardProps) {
  return (
    <div className="board" role="grid" aria-label="Grille de bataille navale">
      {board.map((row, rowIndex) =>
        row.map((state, columnIndex) => (
          <Cell
            key={`${rowIndex}-${columnIndex}`}
            state={state}
            row={rowIndex}
            column={columnIndex}
            onClick={interactive ? () => onCellClick?.(rowIndex, columnIndex) : undefined}
          />
        )),
      )}
    </div>
  )
}