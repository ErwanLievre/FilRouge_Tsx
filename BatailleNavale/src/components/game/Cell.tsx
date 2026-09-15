import type { CellState } from '../../types/game'

interface CellProps {
  state: CellState
  row: number
  column: number
  onClick?: () => void
}

export function Cell({ state, row, column, onClick }: CellProps) {
  const label = `${String.fromCharCode(65 + column)}${row + 1}`

  return (
    <button
      className={`cell cell--${state}`}
      type="button"
      aria-label={`Case ${label}`}
      onClick={onClick}
      disabled={!onClick}
    >
      {state === 'hit' && 'X'}
      {state === 'miss' && '•'}
    </button>
  )
}