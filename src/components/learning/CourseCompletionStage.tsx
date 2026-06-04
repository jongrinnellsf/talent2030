import { CheckCircledIcon } from "@radix-ui/react-icons";
import { useLearningSession } from "../../context/LearningSessionContext";

export function CourseCompletionStage() {
  const {
    selectedTopic,
    completionFeedback,
    completionTakeaway,
    returnToCoachHome,
    selectTopic,
  } = useLearningSession();

  if (!selectedTopic) return null;

  return (
    <div className="course-completion">
      <div className="course-completion__icon" aria-hidden>
        <CheckCircledIcon />
      </div>
      <p className="course-completion__eyebrow">Path complete</p>
      <h2 className="course-completion__title">{selectedTopic.title}</h2>
      <p className="course-completion__lead">
        {completionFeedback ??
          "You finished the path and passed the knowledge check. Nice work."}
      </p>

      {completionTakeaway ? (
        <div className="course-completion__takeaway">
          <p className="course-completion__takeaway-label">Key takeaway</p>
          <p className="course-completion__takeaway-text">{completionTakeaway}</p>
        </div>
      ) : null}

      <div className="course-completion__actions">
        <button
          type="button"
          className="btn-primary course-completion__primary"
          onClick={returnToCoachHome}
        >
          Back to Coach home
        </button>
        <button
          type="button"
          className="btn-ghost course-completion__retake"
          onClick={() => selectTopic(selectedTopic)}
        >
          Take again
        </button>
      </div>
    </div>
  );
}
