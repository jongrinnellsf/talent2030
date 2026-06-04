import { currentCycle, cycleTimeline } from "../performanceCycle";

export const ORG_NAME = "Acme AI Co.";
export const ORG_TAGLINE = "Inference Infrastructure";
export const ORG_LOGO_PATH = "/brand/acmelogo.png";

const OFFICIAL_SOURCE = {
  pageTitle: "Performance Management Process",
  url: "https://acmeai.atlassian.net/wiki/spaces/People/pages/884742/Performance+Management+Process",
  space: "People & Talent",
  lastUpdated: "Mar 12, 2026",
};

function formatCyclePhase(status: string): string {
  if (status === "current") return " (in progress)";
  if (status === "completed") return " (complete)";
  return "";
}

export function buildTalentManagementMarkdown(): string {
  const cycleLines = cycleTimeline
    .map(
      (phase) =>
        `- **${phase.title}** (${phase.dateRange}): ${phase.description}${formatCyclePhase(phase.status)}`
    )
    .join("\n");

  return `# Talent management: ${ORG_NAME}

Agent context file describing how performance management works at ${ORG_NAME}. Use this as organizational ground truth for coaching, planning, and review delivery.

## Organization

**Mission:** Build inference infrastructure that helps enterprises deploy AI safely at scale.

**Talent philosophy:** Learning-forward culture with evidence-based feedback. Managers act as coaches, not judges. Performance conversations should develop people, clarify expectations, and reinforce values: rigor, ownership, and customer impact.

**Review cadence:** Annual formal performance reviews with mid-year check-ins. The 2026 annual cycle covers self-review, calibration, delivery meetings, and Workday documentation.

**Official policy:** [${OFFICIAL_SOURCE.pageTitle}](${OFFICIAL_SOURCE.url}) (${OFFICIAL_SOURCE.space}, updated ${OFFICIAL_SOURCE.lastUpdated})

## Current review cycle

**${currentCycle.name}**. Current phase: ${currentCycle.currentPhaseLabel}

${cycleLines}

## Performance management process

1. **Self-review** (employee, ~2 weeks): Employee reflects on goals, impact, and development areas in Workday. Manager should read before drafting.

2. **Manager draft** (~1 week): Manager writes rating rationale, evidence, and next-year goals. Must align with calibration guidance.

3. **Calibration** (leadership): Managers present cases; ratings are normalized across teams. Document any rating changes and rationale.

4. **Delivery meeting** (45–60 min): Manager delivers rating and feedback in a dedicated conversation, not as a surprise in a status meeting.

5. **Workday documentation** (within 48 hours): Final rating, summary, and goals entered. Employee acknowledges in system.

**Manager responsibilities:** prepare with evidence, create space for employee voice, co-create goals, and document accurately.

## Rating scale (annual review)

${ORG_NAME} uses a **1–5 scale** in Workday. Ratings must be supported by evidence and calibration.

| Rating | Label | Guidance |
|--------|--------|----------|
| 1/5 | Significantly below expectations | Sustained misses on core commitments; immediate improvement plan required; partner with HR. |
| 2/5 | Below expectations | Missed goals or material gaps; clear recovery plan and frequent check-ins. |
| 3/5 | Meets expectations | Delivers role expectations reliably; balanced strengths and growth areas. |
| 4/5 | Exceeds expectations | Consistent high impact beyond role; strong evidence across multiple quarters. |
| 5/5 | Significantly exceeds expectations | Exceptional, org-visible impact; often promotion or scope expansion case. |

**Calibration note:** Ratings are normalized across teams. Managers must explain the "why" with 2–3 anchor examples at delivery.

## Successful review meeting

**Opening (5 min)**
- Set intent: this is their review, not a project update.
- Share agenda: their self-reflection, your feedback, rating, goals, support.

**Evidence-based feedback (20–25 min)**
- Use **COIN** (Context–Observation–Impact–Next steps): specific examples, observable behavior, business impact, and agreed next steps.
- Balance strengths and gaps. Tie feedback to role expectations and level.
- Invite their perspective before moving on. Ask: "What resonates? What feels off?"

**Rating delivery (5–10 min)**
- State rating clearly. Explain the "why" with 2–3 anchor examples.
- No new critical feedback at rating reveal. Nothing they haven't heard before.

**Forward look (10–15 min)**
- Co-create 2–3 measurable goals for the next year.
- Discuss growth, support, and resources.

**Close (5 min)**
- Summarize commitments on both sides. Confirm next check-in.

**Anti-patterns to flag**
- Vague praise ("great attitude") without examples
- Monologue without pauses for employee input
- Surprise negative rating or new serious concerns
- Comparisons to peers by name
- Promises you cannot keep (guaranteed promotion, compensation)

## Underperformance handling

**Early signals:** missed commitments, quality gaps, disengagement, or conflict avoidance. Address in 1:1s with clarity; document themes.

**Structured improvement:** clear written expectations, weekly or biweekly check-ins, offer support (coaching, reduced scope, pairing).

**PIP thresholds:** two consecutive quarters below expectations, or one quarter significantly below with no credible recovery plan. PIP typically 30–60 days with weekly documented check-ins. Partner with HR before initiating.

**Conversation tone:** direct and specific, not punitive. Separate intent from impact.

## Connected systems

Assemble employee and team context from:

- **Slack**: tone, collaboration, team dynamics
- **Gmail**: written communication and stakeholder threads
- **Google Meet**: meeting behavior and delivery patterns
- **Google Drive**: work artifacts and document quality
- **Calendar**: 1:1 cadence and follow-through
- **Asana**: commitments, ownership, and delivery tracking
- **Workday**: self-reviews, ratings, goals, and org structure
`;
}
