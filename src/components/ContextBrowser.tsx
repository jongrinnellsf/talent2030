import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { IntegrationLogo } from "./IntegrationLogo";
import { DeliveryPlaybookPanel } from "./DeliveryPlaybookPanel";
import type {
  DeliveryPlaybook,
  DirectReport,
  ManagerWrittenReview,
  SelfPerformanceReview,
} from "../types";
import { manager } from "../data/manager";

type ContextView = "self-review" | "my-review" | "playbook";

type ContextBrowserProps = {
  report: DirectReport;
  selfReview: SelfPerformanceReview;
  managerReview: ManagerWrittenReview;
  deliveryPlaybook: DeliveryPlaybook;
  syncKey: string;
};

function splitReviewPoints(text: string): string[] {
  return text
    .split(/(?<=\.)\s+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function SelfReviewPanel({ review }: { review: SelfPerformanceReview }) {
  const sections = [
    { label: "Self-rating", bullets: [review.selfRating] },
    { label: "Accomplishments", bullets: splitReviewPoints(review.accomplishments) },
    { label: "Challenges cited", bullets: splitReviewPoints(review.challenges) },
    { label: "Development focus", bullets: splitReviewPoints(review.developmentFocus) },
    { label: "Next-period goals", bullets: splitReviewPoints(review.nextPeriodGoals) },
  ];

  return (
    <div className="self-review-panel">
      <div className="self-review-panel__meta">
        <span className="self-review-panel__source">
          <IntegrationLogo
            source="workday"
            variant="wordmark"
            className="integration-logo integration-logo--wordmark integration-logo--inline"
          />
          Self-review
        </span>
        <time className="self-review-panel__date">Submitted {review.submittedDate}</time>
      </div>
      <p className="self-review-panel__cycle">{review.cycleLabel}</p>
      <ul className="self-review-panel__list">
        {sections.map((section) => (
          <li key={section.label} className="self-review-section">
            <span className="self-review-section__label">{section.label}</span>
            <ul className="self-review-section__items">
              {section.bullets.map((point, index) => (
                <li key={`${section.label}-${index}`}>{point}</li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ManagerReviewPanel({ review }: { review: ManagerWrittenReview }) {
  const sections = [
    { label: "Overall rating", bullets: [review.overallRating] },
    { label: "Summary", bullets: splitReviewPoints(review.summary) },
    { label: "Strengths", bullets: splitReviewPoints(review.strengths) },
    { label: "Areas for development", bullets: splitReviewPoints(review.areasForDevelopment) },
    { label: "Goals for next period", bullets: splitReviewPoints(review.forwardGoals) },
  ];

  return (
    <div className="self-review-panel manager-review-panel">
      <div className="self-review-panel__meta">
        <span className="self-review-panel__source">
          <IntegrationLogo
            source="workday"
            variant="wordmark"
            className="integration-logo integration-logo--wordmark integration-logo--inline"
          />
          Manager review · {manager.name}
        </span>
        <span className="badge badge--brand manager-review-panel__status">Completed</span>
      </div>
      <p className="self-review-panel__cycle">{review.cycleLabel}</p>
      <time className="manager-review-panel__date">Completed {review.completedDate}</time>
      <p className="manager-review-panel__hint">
        Written for your direct report: the language they will hear in the review conversation.
      </p>
      <ul className="self-review-panel__list">
        {sections.map((section) => (
          <li key={section.label} className="self-review-section">
            <span className="self-review-section__label">{section.label}</span>
            <ul className="self-review-section__items">
              {section.bullets.map((point, index) => (
                <li key={`${section.label}-${index}`}>{point}</li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ContextBrowser({
  report,
  selfReview,
  managerReview,
  deliveryPlaybook,
  syncKey,
}: ContextBrowserProps) {
  const [activeView, setActiveView] = useState<ContextView>("self-review");

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="mb-4">
        <p className="section-label">Context</p>
        <h3 className="section-title">{report.name}</h3>
      </div>

      <div className="context-view-tabs">
        <button
          type="button"
          onClick={() => setActiveView("self-review")}
          className={`context-view-tab ${activeView === "self-review" ? "context-view-tab--active" : ""}`}
        >
          Self-review
        </button>
        <button
          type="button"
          onClick={() => setActiveView("my-review")}
          className={`context-view-tab ${activeView === "my-review" ? "context-view-tab--active" : ""}`}
        >
          My Review
        </button>
        <button
          type="button"
          onClick={() => setActiveView("playbook")}
          className={`context-view-tab ${activeView === "playbook" ? "context-view-tab--active" : ""}`}
        >
          Delivery playbook
        </button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${syncKey}-${activeView}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="context-view-content flex-1"
        >
          {activeView === "self-review" ? (
            <SelfReviewPanel review={selfReview} />
          ) : activeView === "my-review" ? (
            <ManagerReviewPanel review={managerReview} />
          ) : (
            <DeliveryPlaybookPanel playbook={deliveryPlaybook} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
