interface TurnMessageProps {
  playerName: string
  message: string
}

export function TurnMessage({ playerName, message }: TurnMessageProps) {
  return (
    <div className="turn-message" role="status">
      <span className="turn-message__dot" aria-hidden="true" />
      <div>
        <strong>{playerName}</strong>
        <p>{message}</p>
      </div>
    </div>
  )
}