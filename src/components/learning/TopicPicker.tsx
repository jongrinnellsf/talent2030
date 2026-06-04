import { ChevronRightIcon } from "@radix-ui/react-icons";
import { PATH_TOPICS, type PathTopic } from "../../data/learning/pathTopics";
import { useCoachSession } from "../../context/CoachSessionContext";
import { useLearningSession } from "../../context/LearningSessionContext";
import { DEFAULT_EMPLOYEE_ID, getDirectReport } from "../../data/directReports";

type TopicPickerProps = {
  onSelect?: (topic: PathTopic) => void;
};

export function TopicPicker({ onSelect }: TopicPickerProps) {
  const { selectTopic, startFreeform, startManagerCoach, startRehearse } =
    useLearningSession();
  const { updateConfig } = useCoachSession();
  const mark = getDirectReport(DEFAULT_EMPLOYEE_ID);

  const beginRehearse = () => {
    startRehearse();
    updateConfig({
      employeeId: DEFAULT_EMPLOYEE_ID,
      employeeName: mark?.name ?? "Mark Webb",
      autoStartSession: false,
      simulateScenario: "default",
      liveCoachingEnabled: true,
    });
  };

  return (
    <div className="topic-picker">
      <header className="topic-picker__header">
        <p className="topic-picker__eyebrow">Get started</p>
        <h2 className="topic-picker__title">What do you want to do?</h2>
        <p className="topic-picker__lead">
          Plan and learn on the canvas, rehearse a conversation with Mark, or explore any
          topic with voice.
        </p>
      </header>

      <div className="topic-picker__mode-row topic-picker__mode-row--triple">
        <button
          type="button"
          className="topic-picker__mode-card topic-picker__mode-card--coach"
          onClick={() => startManagerCoach()}
        >
          <span className="topic-picker__mode-body">
            <span className="topic-picker__mode-title">Manager copilot</span>
            <span className="topic-picker__mode-desc">
              Performance, feedback, and leadership questions.
            </span>
          </span>
          <ChevronRightIcon className="topic-picker__mode-chevron" aria-hidden />
        </button>

        <button
          type="button"
          className="topic-picker__mode-card topic-picker__mode-card--rehearse"
          onClick={beginRehearse}
        >
          <span className="topic-picker__mode-body">
            <span className="topic-picker__mode-title">Rehearse with Mark</span>
            <span className="topic-picker__mode-desc">
              Meet-style roleplay for rating delivery.
            </span>
          </span>
          <ChevronRightIcon className="topic-picker__mode-chevron" aria-hidden />
        </button>

        <button
          type="button"
          className="topic-picker__mode-card topic-picker__mode-card--explore"
          onClick={startFreeform}
        >
          <span className="topic-picker__mode-body">
            <span className="topic-picker__mode-title">Explore freely</span>
            <span className="topic-picker__mode-desc">
              Open topic—canvas updates as you talk.
            </span>
          </span>
          <ChevronRightIcon className="topic-picker__mode-chevron" aria-hidden />
        </button>
      </div>

      <section className="topic-picker__paths" aria-labelledby="topic-picker-paths-heading">
        <div className="topic-picker__paths-head">
          <h3 id="topic-picker-paths-heading" className="topic-picker__section-title">
            Guided skill paths
          </h3>
          <p className="topic-picker__section-lead">
            Three quick voice questions, then a personalized five-slide course.
          </p>
        </div>

        <div className="topic-picker__grid" role="list">
          {PATH_TOPICS.map((topic) => (
            <button
              key={topic.id}
              type="button"
              role="listitem"
              data-topic={topic.id}
              className="topic-picker__card"
              onClick={() => {
                selectTopic(topic);
                onSelect?.(topic);
              }}
            >
              <span className="topic-picker__card-title">{topic.title}</span>
              <span className="topic-picker__card-desc">{topic.description}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
