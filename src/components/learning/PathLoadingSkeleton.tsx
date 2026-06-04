import { useRotatingMessage } from "@/hooks/use-rotating-message";
import {
  LOADING_MESSAGE_INTERVAL_MS,
  PATH_GENERATION_LOADING_MESSAGES,
} from "../../data/learning/loadingMessages";

type PathLoadingSkeletonProps = {
  label?: string;
  /** When set, label cycles every few seconds while the skeleton is mounted. */
  messages?: readonly string[];
  rotateIntervalMs?: number;
  compact?: boolean;
};

export function PathLoadingSkeleton({
  label = "Building your personalized path…",
  messages,
  rotateIntervalMs = LOADING_MESSAGE_INTERVAL_MS,
  compact = false,
}: PathLoadingSkeletonProps) {
  const rotate = Boolean(messages?.length);
  const rotatingLabel = useRotatingMessage(
    messages ?? PATH_GENERATION_LOADING_MESSAGES,
    rotate,
    rotateIntervalMs
  );
  const displayLabel = rotate ? rotatingLabel : label;

  return (
    <div
      className={`path-loading${compact ? " path-loading--compact" : ""}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="path-loading__preview" aria-hidden>
        <div className="path-loading__line path-loading__line--title" />
        <div className="path-loading__line path-loading__line--lead" />
        <div className="path-loading__body">
          <div className="path-loading__line" />
          <div className="path-loading__line" />
          <div className="path-loading__line path-loading__line--short" />
        </div>
      </div>
      <p key={displayLabel} className="path-loading__label">
        {displayLabel}
      </p>
    </div>
  );
}
