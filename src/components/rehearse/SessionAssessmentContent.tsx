import { Link } from "react-router-dom";
import { PlayIcon } from "@radix-ui/react-icons";
import { buildRehearsePath } from "../../routes";
import type { SessionAssessment } from "../../types";
import { SIMULATE_SCENARIOS } from "../../data/simulateScenarios";

type SessionAssessmentContentProps = {
  assessment: SessionAssessment;
  compact?: boolean;
};

export function SessionAssessmentContent({
  assessment,
  compact = false,
}: SessionAssessmentContentProps) {
  const recommendedScenario = assessment.recommendedScenarioId
    ? SIMULATE_SCENARIOS[assessment.recommendedScenarioId as keyof typeof SIMULATE_SCENARIOS]
    : null;

  const practiceHref = buildRehearsePath(
    assessment.recommendedScenarioId
      ? { scenario: assessment.recommendedScenarioId, autostart: "1" }
      : { autostart: "1" }
  );

  return (
    <>
      <p className={`session-assessment__summary${compact ? " session-assessment__summary--compact" : ""}`}>
        {assessment.summary}
      </p>

      {assessment.strengths.length > 0 && (
        <section className="session-assessment__block session-assessment__block--positive">
          <p className="session-assessment__block-label">What landed</p>
          <ul className="session-assessment__list session-assessment__list--positive">
            {assessment.strengths.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      )}

      {assessment.improvements.length > 0 && (
        <section className="session-assessment__block session-assessment__block--improve">
          <p className="session-assessment__block-label">Try next time</p>
          <ul className="session-assessment__list session-assessment__list--improve">
            {assessment.improvements.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      )}

      {assessment.keyMoments.length > 0 && (
        <section className="session-assessment__block session-assessment__block--moments">
          <p className="session-assessment__block-label">Key moments</p>
          <ul className="session-assessment__moments">
            {assessment.keyMoments.map((item) => (
              <li key={`${item.moment}-${item.suggestion}`}>
                <p className="session-assessment__moment">{item.moment}</p>
                <p className="session-assessment__suggestion">{item.suggestion}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {recommendedScenario && (
        <section className="session-assessment__recommended">
          <p className="session-assessment__block-label">Recommended next practice</p>
          <p className="session-assessment__recommended-title">
            {assessment.recommendedScenarioTitle ?? recommendedScenario.title}
          </p>
          {assessment.recommendedPracticeRationale && (
            <p className="session-assessment__recommended-rationale">
              {assessment.recommendedPracticeRationale}
            </p>
          )}
          <Link
            to={practiceHref}
            className="btn-primary inline-flex items-center gap-2 px-4 py-2 text-[0.8125rem]"
          >
            <PlayIcon className="h-3.5 w-3.5" />
            Practice this scenario
          </Link>
        </section>
      )}
    </>
  );
}
