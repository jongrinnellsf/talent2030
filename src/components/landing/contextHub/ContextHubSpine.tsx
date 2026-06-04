/** Straight vertical guide behind the signal column (edges fan into the agent). */
export function ContextHubSpine() {
  const signalCount = 8;
  const top = 52;
  const bottom = 28 + (signalCount - 1) * 48 + 52;
  const mergeX = 200;

  return (
    <svg
      className="context-hub-spine"
      viewBox="0 0 760 440"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
    >
      <line
        className="context-hub-spine__track"
        x1={mergeX}
        y1={top}
        x2={mergeX}
        y2={bottom}
      />
      <line
        className="context-hub-spine__pulse"
        x1={mergeX}
        y1={top}
        x2={mergeX}
        y2={bottom}
      />
    </svg>
  );
}
