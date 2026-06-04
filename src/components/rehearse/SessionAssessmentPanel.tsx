import { Cross2Icon } from "@radix-ui/react-icons";
import type { SessionAssessment } from "../../types";
import { SessionAssessmentContent } from "./SessionAssessmentContent";

type SessionAssessmentPanelProps = {
  assessment: SessionAssessment;
  title?: string;
  onClose: () => void;
};

export function SessionAssessmentPanel({
  assessment,
  title = "How to improve next time",
  onClose,
}: SessionAssessmentPanelProps) {
  return (
    <div className="session-assessment-overlay" onClick={onClose}>
      <div
        className="session-assessment__dialog"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-labelledby="session-assessment-title"
      >
        <div className="session-assessment__header">
          <div>
            <p className="session-assessment__label">Session assessment</p>
            <h3 id="session-assessment-title" className="session-assessment__title">
              {title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="session-assessment__close btn-ghost"
            aria-label="Close assessment"
          >
            <Cross2Icon className="h-4 w-4" />
          </button>
        </div>

        <SessionAssessmentContent assessment={assessment} />
      </div>
    </div>
  );
}
