import { useLearningSession } from "../../context/LearningSessionContext";
import { renderLearningInline } from "../../lib/renderInlineMarkdown";

export function KnowledgeCheckStage() {
  const { knowledgeCheck, selectedTopic } = useLearningSession();

  if (!knowledgeCheck) return null;

  return (
    <div className="knowledge-check-stage">
      <header className="knowledge-check-stage__header">
        <p className="knowledge-check-stage__eyebrow">Knowledge check</p>
        {selectedTopic && (
          <p className="knowledge-check-stage__topic">{selectedTopic.title}</p>
        )}
      </header>

      <div className="knowledge-check-stage__card">
        <p className="knowledge-check-stage__question">
          {renderLearningInline(knowledgeCheck.question)}
        </p>
      </div>

      <p className="knowledge-check-stage__hint">
        Answer out loud. Your coach is listening and will give you feedback.
      </p>
    </div>
  );
}
