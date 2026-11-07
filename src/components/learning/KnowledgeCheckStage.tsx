import { useLearningSession } from "../../context/LearningSessionContext";
import { renderLearningInline } from "../../lib/renderInlineMarkdown";
import { ChoiceList } from "../../learning/components/canvasBlocks";

export function KnowledgeCheckStage() {
  const { knowledgeCheck, selectedTopic, markPathComplete } = useLearningSession();

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

      <ChoiceList
        choices={[...knowledgeCheck.choices]}
        correctIndex={knowledgeCheck.correctIndex}
        onCorrect={(choice) =>
          markPathComplete(
            "You selected the right answer.",
            knowledgeCheck.explanation || choice
          )
        }
      />
    </div>
  );
}
