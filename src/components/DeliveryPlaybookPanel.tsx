import { Link } from "react-router-dom";
import { PlayIcon } from "@radix-ui/react-icons";
import type { DeliveryPlaybook, PlaybookConfidence } from "../types";

type DeliveryPlaybookPanelProps = {
  playbook: DeliveryPlaybook;
};

const CONFIDENCE_LABELS: Record<PlaybookConfidence, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

function ConfidencePill({ confidence }: { confidence: PlaybookConfidence }) {
  return (
    <span className={`playbook-confidence playbook-confidence--${confidence}`}>
      {CONFIDENCE_LABELS[confidence]} confidence
    </span>
  );
}

export function DeliveryPlaybookPanel({ playbook }: DeliveryPlaybookPanelProps) {
  const recommendedReaction = playbook.potentialReactions.find(
    (reaction) => reaction.id === playbook.recommendedPractice.reactionId
  );

  return (
    <div className="delivery-playbook">
      <p className="delivery-playbook__sources">
        Synthesized from Slack, Google Meet, Asana, Gmail, Calendar, and Workday
      </p>

      {recommendedReaction && (
        <section className="delivery-playbook__recommended">
          <p className="delivery-playbook__recommended-label">Recommended practice</p>
          <p className="delivery-playbook__recommended-title">{recommendedReaction.title}</p>
          <p className="delivery-playbook__recommended-rationale">
            {playbook.recommendedPractice.rationale}
          </p>
          <Link
            to={recommendedReaction.practiceHref}
            className="btn-primary inline-flex items-center gap-2 px-4 py-2 text-[0.8125rem]"
          >
            <PlayIcon className="h-3.5 w-3.5" />
            Practice this scenario
          </Link>
        </section>
      )}

      <section className="delivery-playbook__section">
        <h4 className="delivery-playbook__heading">Headline tension</h4>
        <p className="delivery-playbook__lead">{playbook.headlineTension}</p>
      </section>

      <section className="delivery-playbook__section">
        <h4 className="delivery-playbook__heading">What the signals say</h4>
        <p className="delivery-playbook__body">{playbook.signalsSummary}</p>
      </section>

      <section className="delivery-playbook__section">
        <h4 className="delivery-playbook__heading">Delivery considerations</h4>
        <ul className="delivery-playbook__list">
          {playbook.deliveryConsiderations.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="delivery-playbook__section">
        <h4 className="delivery-playbook__heading">Potential reactions</h4>
        <ul className="delivery-playbook__reactions">
          {playbook.potentialReactions.map((reaction) => (
            <li key={reaction.id} className="playbook-reaction">
              <div className="playbook-reaction__header">
                <p className="playbook-reaction__title">{reaction.title}</p>
                <ConfidencePill confidence={reaction.confidence} />
              </div>
              <p className="playbook-reaction__description">{reaction.description}</p>
              <Link
                to={reaction.practiceHref}
                className="playbook-reaction__practice btn-secondary inline-flex items-center gap-1.5 px-3 py-1.5 text-[0.75rem]"
              >
                <PlayIcon className="h-3 w-3" />
                Practice this
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
