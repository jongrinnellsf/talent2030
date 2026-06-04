import { Link, useLocation } from "react-router-dom";
import { isTalentCoachPath } from "../routes";
import { SESSION_MODE_LABELS } from "../data/sessionModes";
import { useCoachSession } from "../context/CoachSessionContext";

function SessionFloaterBars({ speaking }: { speaking: boolean }) {
  return (
    <div
      className={`session-floater__bars${speaking ? " session-floater__bars--speaking" : ""}`}
      aria-hidden
    >
      <span className="session-floater__bar" />
      <span className="session-floater__bar" />
      <span className="session-floater__bar" />
      <span className="session-floater__bar" />
    </div>
  );
}

export function ActiveSessionFloater() {
  const location = useLocation();
  const { isSessionLive, sessionActivity, config, studioPath } = useCoachSession();

  const onStudio = isTalentCoachPath(location.pathname);
  if (!isSessionLive || onStudio) return null;

  const modeLabel = SESSION_MODE_LABELS[config.sessionMode];
  const detail = config.employeeName;
  const speaking = sessionActivity?.coachPlaying ?? false;
  const elapsed = sessionActivity?.elapsed;

  return (
    <div className="session-floater" role="status" aria-live="polite">
      <Link to={studioPath} className="session-floater__link">
        <SessionFloaterBars speaking={speaking} />
        <div className="session-floater__copy">
          <span className="session-floater__live">
            <span className="session-floater__live-dot" aria-hidden />
            Live
          </span>
          <span className="session-floater__title">
            {modeLabel}
            <span className="session-floater__sep" aria-hidden>
              ·
            </span>
            {detail}
          </span>
        </div>
        {elapsed && <span className="session-floater__elapsed">{elapsed}</span>}
        <span className="session-floater__action">Coach</span>
      </Link>
    </div>
  );
}
