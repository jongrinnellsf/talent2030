type LiveCoachingToggleProps = {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  disabled?: boolean;
};

export function LiveCoachingToggle({
  enabled,
  onChange,
  disabled = false,
}: LiveCoachingToggleProps) {
  return (
    <label
      className={`live-coaching-toggle${enabled ? " live-coaching-toggle--on" : ""}${
        disabled ? " live-coaching-toggle--disabled" : ""
      }`}
    >
      <span className="live-coaching-toggle__label">Live coaching</span>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        disabled={disabled}
        onClick={() => onChange(!enabled)}
        className="live-coaching-toggle__switch"
      >
        <span className="live-coaching-toggle__thumb" />
      </button>
    </label>
  );
}
