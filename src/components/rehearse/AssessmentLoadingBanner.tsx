import { motion } from "motion/react";

export function AssessmentLoadingBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      className="assessment-loading-banner"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="assessment-loading-banner__pulse" aria-hidden />
      <div className="assessment-loading-banner__copy">
        <p className="assessment-loading-banner__title">Generating simulation assessment</p>
        <p className="assessment-loading-banner__hint">
          Reviewing your transcript and delivery. This usually takes a few seconds.
        </p>
      </div>
      <div className="assessment-loading-banner__bars" aria-hidden>
        <span />
        <span />
        <span />
      </div>
    </motion.div>
  );
}
