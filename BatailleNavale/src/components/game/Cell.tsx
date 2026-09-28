export type CellState = "unknown" | "miss" | "hit" | "sunk" | "ship";

type CellProps = {
  state: CellState;
  onClick: () => void;
  disabled?: boolean;
};

export default function Cell({ state, onClick, disabled }: CellProps) {
  return (
    <button
      type="button"
      className={`gamecell gamecell--${state}`}
      onClick={onClick}
      disabled={disabled}
      aria-label={
        state === "hit"
          ? "Bateau touché"
          : state === "sunk"
            ? "Bateau coulé"
          : state === "miss"
            ? "Tir manqué"
            : state === "ship"
              ? "Bateau"
              : "Case inconnue"
      }
    >
      {state === "hit" && (
        <svg
          className="gamecell-explosion"
          viewBox="0 0 24 24"
          aria-hidden="true"
          focusable="false"
        >
          <path
            className="gamecell-explosion-rays"
            d="M12 1.5 14 7l4-3-1 5.4 5.4-.7-4 4.1 4.1 2.3-5.7.7 1.1 5.5-4.7-3-2.2 5.2-2-5.4-4.1 3 .9-5.6-5.3.3 3.8-3.8L.5 13l5.7-1L4.8 6.8l4.8 2.8z"
          />
          <circle className="gamecell-explosion-core" cx="12" cy="13" r="4.2" />
        </svg>
      )}
    </button>
  );
}