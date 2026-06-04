import { AnimatePresence, motion } from "motion/react";
import type { HudCueCategory, HudCueItem } from "../../types";

const CATEGORY_LABELS: Record<HudCueCategory, string> = {
  posture: "Posture",
  tone: "Tone",
  structure: "Structure",
  encouragement: "Nice",
  relevance: "Relevance",
};

type PracticeHudProps = {
  cues: HudCueItem[];
};

export function PracticeHud({ cues }: PracticeHudProps) {
  const activeCue = cues[0];

  return (
    <div className="practice-hud-stream" aria-live="polite" aria-relevant="additions">
      <AnimatePresence initial={false} mode="wait">
        {activeCue ? (
          <motion.div
            key={activeCue.id}
            initial={{ opacity: 0, y: 18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.98 }}
            transition={{
              opacity: { duration: 0.32 },
              y: { type: "spring", stiffness: 320, damping: 28, mass: 0.85 },
              scale: { duration: 0.28 },
            }}
            className={`practice-hud__item practice-hud__item--${activeCue.category}`}
            role="status"
          >
            <span className="practice-hud__category">{CATEGORY_LABELS[activeCue.category]}</span>
            <span className="practice-hud__text">{activeCue.text}</span>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
