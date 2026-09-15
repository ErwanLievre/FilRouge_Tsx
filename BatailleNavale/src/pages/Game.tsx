import { useState } from 'react'
import { Board } from '../components/game/Board'
import { Ship } from '../components/game/Ship'
import { TurnMessage } from '../components/game/TurnMessage'
import type { Board as BoardType, Ship as ShipType } from '../types/game'

const size = 10

function createBoard(): BoardType {
  return Array.from({ length: size }, () => Array.from({ length: size }, () => 'empty' as const))
}

const playerBoard = createBoard()
playerBoard[1][1] = 'ship'
playerBoard[1][2] = 'ship'
playerBoard[1][3] = 'ship'
playerBoard[5][6] = 'ship'
playerBoard[6][6] = 'ship'

const ships: ShipType[] = [
  { name: 'Destroyer', size: 3, positions: [{ row: 1, column: 1 }] },
  { name: 'Patrouilleur', size: 2, positions: [{ row: 5, column: 6 }] },
]

export function Game() {
  const [enemyBoard, setEnemyBoard] = useState<BoardType>(createBoard)
  const [shots, setShots] = useState(0)

  function fire(row: number, column: number) {
    if (enemyBoard[row][column] !== 'empty') return

    setEnemyBoard((currentBoard) =>
      currentBoard.map((currentRow, currentRowIndex) =>
        currentRow.map((state, currentColumnIndex) =>
          currentRowIndex === row && currentColumnIndex === column ? 'miss' : state,
        ),
      ),
    )
    setShots((currentShots) => currentShots + 1)
  }

  return (
    <main className="game-page">
      <header className="game-header">
        <div>
          <p className="eyebrow">Bataille navale</p>
          <h1>À vous de jouer</h1>
        </div>
        <div className="score" aria-label={`${shots} tirs effectués`}>
          <span>Tirs</span>
          <strong>{shots.toString().padStart(2, '0')}</strong>
        </div>
      </header>

      <TurnMessage playerName="Votre tour" message="Choisissez une case sur la flotte adverse." />

      <section className="boards" aria-label="Plateaux de jeu">
        <div className="board-panel">
          <div className="board-panel__heading">
            <div>
              <p className="eyebrow">Joueur 1</p>
              <h2>Votre flotte</h2>
            </div>
            <span className="board-status">En place</span>
          </div>
          <Board board={playerBoard} />
          <div className="fleet-list">
            {ships.map((ship) => <Ship key={ship.name} ship={ship} />)}
          </div>
        </div>

        <div className="board-panel board-panel--enemy">
          <div className="board-panel__heading">
            <div>
              <p className="eyebrow">Joueur 2</p>
              <h2>Flotte adverse</h2>
            </div>
            <span className="board-status board-status--active">À viser</span>
          </div>
          <Board board={enemyBoard} interactive onCellClick={fire} />
          <p className="board-help">Les cases déjà ciblées ne peuvent pas être rejouées.</p>
        </div>
      </section>
    </main>
  )
}