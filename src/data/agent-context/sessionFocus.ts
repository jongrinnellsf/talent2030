import { getContextForEmployee } from "../context";
import { getDirectReport } from "../directReports";
import { manager } from "../manager";

export function buildSessionFocusBlock(employeeId: string): string | null {
  const report = getDirectReport(employeeId);
  if (!report) return null;

  const { selfReview, managerReview, observationSections } =
    getContextForEmployee(employeeId);

  const selfReviewBlock = `### WORKDAY — SELF-REVIEW
- **${selfReview.cycleLabel}** (Submitted ${selfReview.submittedDate})
- Self-rating: ${selfReview.selfRating}
- Accomplishments: ${selfReview.accomplishments}
- Challenges cited: ${selfReview.challenges}
- Development focus: ${selfReview.developmentFocus}
- Next-period goals: ${selfReview.nextPeriodGoals}`;

  const managerReviewBlock = `### WORKDAY — MANAGER WRITTEN REVIEW (${manager.name})
- **${managerReview.cycleLabel}** (Completed ${managerReview.completedDate})
- Overall rating: ${managerReview.overallRating}
${managerReview.calibrationNote ? `- Calibration: ${managerReview.calibrationNote}` : ""}
- Summary: ${managerReview.summary}
- Strengths: ${managerReview.strengths}
- Areas for development: ${managerReview.areasForDevelopment}
- Forward goals: ${managerReview.forwardGoals}
- Delivery notes: ${managerReview.deliveryNotes}`;

  const observationBlock = observationSections
    .map((section) => {
      const lines = section.items
        .map(
          (item) =>
            `- **${item.title}** (${item.date})\n  Example: ${item.example}\n  Observation: ${item.observation}`
        )
        .join("\n");
      return `### ${section.label.toUpperCase()}\n${lines}`;
    })
    .join("\n\n");

  return `## Session focus — ${report.name}

**Role:** ${report.role} (${report.level}) · **Tenure:** ${report.tenure}
**Status:** ${report.statusLabel}
**Summary:** ${report.summary}
**Coaching pointer:** ${report.conversationPointer}

### Organizational signals (assembled for this session)

${selfReviewBlock}

${managerReviewBlock}

${observationBlock}`;
}
