export type CellState = "unknown" | "miss" | "hit" | "sunk" | "ship";

type CellProps = {
  state: CellState;
  onClick: () => void;
  disabled?: boolean;
};

export default function Cell({ state, onClick, disabled }: CellProps) {
  return (
    <button
      className={`gamecell gamecell--${state}`}
      onClick={onClick}
      disabled={disabled}
    />
  );
}