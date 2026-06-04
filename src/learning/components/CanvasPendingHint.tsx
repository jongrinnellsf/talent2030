import { useDelayedTrue } from "@/hooks/use-delayed-true";
import { useRotatingMessage } from "@/hooks/use-rotating-message";
import {
  CANVAS_UPDATE_LOADING_MESSAGES,
  LOADING_MESSAGE_INTERVAL_MS,
} from "../../data/learning/loadingMessages";

export const CANVAS_PENDING_DELAY_MS = 4000;

type CanvasPendingHintProps = {
  active: boolean;
  message?: string | null;
  /** Rotating status lines while active (takes precedence over `message`). */
  messages?: readonly string[];
  rotateIntervalMs?: number;
  /** Corner chip on live canvas; centered whisper on empty canvas. */
  placement?: "corner" | "center";
};

export function CanvasPendingHint({
  active,
  message = null,
  messages,
  rotateIntervalMs = LOADING_MESSAGE_INTERVAL_MS,
  placement = "corner",
}: CanvasPendingHintProps) {
  const rotate = Boolean(messages?.length) && active;
  const rotatingText = useRotatingMessage(
    messages ?? CANVAS_UPDATE_LOADING_MESSAGES,
    rotate,
    rotateIntervalMs
  );
  const displayText = rotate ? rotatingText : message;
  const show = useDelayedTrue(Boolean(active && displayText), CANVAS_PENDING_DELAY_MS);

  if (!show || !displayText) return null;

  return (
    <div
      className={`learning-canvas__pending-hint learning-canvas__pending-hint--${placement} learning-canvas__pending-hint--in`}
      role="status"
      aria-live="polite"
    >
      <span className="learning-canvas__pending-hint-pulse" aria-hidden />
      <span key={displayText} className="learning-canvas__pending-hint-text">
        {displayText}
      </span>
    </div>
  );
}
