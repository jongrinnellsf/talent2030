import { useLearningSession } from "../../context/LearningSessionContext";

export function IntakeStage() {
  const { selectedTopic, intakeQuestionsAnswered, isLiveConnected } = useLearningSession();

  if (!selectedTopic) return null;

  return (
    <div className="intake-stage">
      <p className="intake-stage__eyebrow">Getting started</p>
      <h2 className="intake-stage__title">{selectedTopic.title}</h2>
      <p className="intake-stage__lead">
        {isLiveConnected
          ? "Answer out loud. Your coach will ask three short questions, then build your path."
          : "Connecting voice coach…"}
      </p>
      <div className="intake-stage__progress" aria-label="Personalization progress">
        {[1, 2, 3].map((step) => (
          <span
            key={step}
            className={`intake-stage__dot${
              step <= intakeQuestionsAnswered ? " intake-stage__dot--done" : ""
            }${step === intakeQuestionsAnswered + 1 ? " intake-stage__dot--active" : ""}`}
          />
        ))}
      </div>
      <p className="intake-stage__meta">
        Question {Math.min(intakeQuestionsAnswered + 1, 3)} of 3
      </p>
    </div>
  );
}
