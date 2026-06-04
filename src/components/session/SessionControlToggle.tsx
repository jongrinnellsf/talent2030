import type { ReactNode } from "react";

export function SessionControlToggle({
  disabled,
  active,
  onClick,
  activeIcon,
  inactiveIcon,
  label,
  compact = false,
}: {
  disabled: boolean;
  active: boolean;
  onClick: () => void;
  activeIcon: ReactNode;
  inactiveIcon: ReactNode;
  label: string;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      title={label}
      aria-label={label}
      aria-pressed={active}
      className={`control-btn${active ? " control-btn--on" : ""}${
        compact ? " control-btn--icon-only" : ""
      }`}
    >
      {active ? activeIcon : inactiveIcon}
      {!compact && label}
    </button>
  );
}
