import type { Ship as ShipType } from '../../types/game'

interface ShipProps {
  ship: ShipType
}

export function Ship({ ship }: ShipProps) {
  return (
    <div className="ship-card">
      <span className="ship-card__name">{ship.name}</span>
      <span className="ship-card__size">{ship.size} cases</span>
    </div>
  )
}