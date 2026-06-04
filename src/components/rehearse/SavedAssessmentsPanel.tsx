import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDownIcon, Cross2Icon } from "@radix-ui/react-icons";
import type { SavedSessionAssessment } from "../../types";
import { SessionAssessmentContent } from "./SessionAssessmentContent";

type SavedAssessmentsPanelProps = {
  assessments: SavedSessionAssessment[];
  onDismiss: (id: string) => void;
  onExpand?: (assessment: SavedSessionAssessment) => void;
};

export function SavedAssessmentsPanel({
  assessments,
  onDismiss,
  onExpand,
}: SavedAssessmentsPanelProps) {
  const [expandedId, setExpandedId] = useState<string | null>(
    assessments[0]?.id ?? null
  );

  if (assessments.length === 0) return null;

  return (
    <section className="saved-assessments" aria-label="Saved simulation assessments">
      <div className="saved-assessments__header">
        <p className="section-label">Saved for this session</p>
        <p className="saved-assessments__hint">Temporary — cleared when you refresh the page.</p>
      </div>

      <div className="saved-assessments__list">
        <AnimatePresence initial={false}>
          {assessments.map((entry) => {
            const expanded = expandedId === entry.id;
            return (
              <motion.article
                key={entry.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className={`saved-assessment-card${expanded ? " saved-assessment-card--expanded" : ""}`}
              >
                <div className="saved-assessment-card__header">
                  <button
                    type="button"
                    className="saved-assessment-card__toggle"
                    aria-expanded={expanded}
                    onClick={() => {
                      const next = expanded ? null : entry.id;
                      setExpandedId(next);
                      if (!expanded) onExpand?.(entry);
                    }}
                  >
                    <span className="saved-assessment-card__title">{entry.title}</span>
                    <span className="saved-assessment-card__meta">{entry.employeeName}</span>
                    <ChevronDownIcon
                      className={`saved-assessment-card__chevron${expanded ? " saved-assessment-card__chevron--open" : ""}`}
                    />
                  </button>
                  <button
                    type="button"
                    className="saved-assessment-card__dismiss btn-ghost"
                    aria-label={`Dismiss ${entry.title}`}
                    onClick={() => onDismiss(entry.id)}
                  >
                    <Cross2Icon className="h-3.5 w-3.5" />
                  </button>
                </div>

                <p className="saved-assessment-card__preview">{entry.assessment.summary}</p>

                <AnimatePresence initial={false}>
                  {expanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="saved-assessment-card__body"
                    >
                      <SessionAssessmentContent assessment={entry.assessment} compact />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.article>
            );
          })}
        </AnimatePresence>
      </div>
    </section>
  );
}
