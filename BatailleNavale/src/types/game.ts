export type CellState = 'empty' | 'ship' | 'hit' | 'miss'

export type Board = CellState[][]

export type Player = 'player' | 'opponent'

export interface Coordinate {
  row: number
  column: number
}

export interface Ship {
  name: string
  size: number
  positions: Coordinate[]
}