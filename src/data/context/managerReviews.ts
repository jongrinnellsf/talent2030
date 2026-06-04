import type { ManagerWrittenReview } from "../../types";

export const managerReviews: Record<string, ManagerWrittenReview> = {
  "mark-webb": {
    cycleLabel: "2026 Annual Performance Review",
    completedDate: "May 9, 2026",
    overallRating: "2/5: Below expectations",
    calibrationNote:
      "Calibrated down from self-rating (4/5). HR aligned on PIP watch if the Q3 recovery plan misses milestones.",
    summary:
      "Mark hit partial Q1 outcomes and kept product group morale up, but missed launch commitments and hasn't consistently owned follow-through when plans changed. We agreed on written goals in January; citing shifting requirements alone doesn't explain the gap between what was committed and what shipped. On checkout, the refresh slipped out of Q1 after Mark blocked a phased rollout in March. Completion never moved off where we started the quarter.",
    strengths:
      "Mark kept the product group engaged through a difficult quarter. The checkout redesign reached real milestones despite dependency delays. Mark clearly cares about team outcomes even when delivery slips.",
    areasForDevelopment:
      "Mark needs stronger accountability for product group planning and closed-loop communication on 1:1 commitments. In cross-functional forums, Mark should name tradeoffs and propose alternatives instead of pointing mostly at other teams. Mark has to connect planning and scope calls to product outcomes: checkout completion flatlined when the launch slipped. Mark should follow through on a documented recovery plan with weekly check-ins we agree on together.",
    forwardGoals:
      "Mark will ship the checkout refresh with a committed launch date and phased plan by Jun 15. Mark will publish a product group retro with explicit ownership sections (not a dependency-only story). Mark will have zero missed 1:1 action items for 8 consecutive weeks.",
    deliveryNotes:
      "Nothing new at the rating reveal: reference prior 1:1s and written follow-ups. Use COIN on specific Slack and meeting behaviors. Anchor one example on checkout (launch slipped, completion never improved). Separate intent from impact. Co-create a recovery plan; partner with HR if milestones slip.",
  },
  "priya-nair": {
    cycleLabel: "2026 Annual Performance Review",
    completedDate: "May 8, 2026",
    overallRating: "5/5: Exceeds expectations",
    calibrationNote:
      "Strong promotion-track case in calibration. Principal scope is still informal on paper; address leveling criteria in delivery.",
    summary:
      "Priya led the platform migration 11 days ahead of schedule with zero customer incidents, wrote an architecture RFC two teams adopted, and mentored two L4 engineers with documented growth. Priya's impact is org-wide and matches the Staff-level bar. We still need clearer criteria and scope for principal-track work beyond strong execution.",
    strengths:
      "Technical leadership on the migration with measurable business risk reduction. RFC quality and adoption across teams. Mentorship with documented outcomes for two engineers. Solid on-call judgment during the cutover window.",
    areasForDevelopment:
      "Priya should widen org-wide influence beyond execution: sponsor cross-team design reviews and build external visibility through a talk or blog post. Priya should work with Eng leadership to formalize principal-track scope and leveling criteria by end of Q3.",
    forwardGoals:
      "Priya will lead the multi-region failover initiative. Priya will publish an external talk on the migration approach. Priya will sponsor one engineer toward Staff promotion with a written growth plan co-owned with leadership.",
    deliveryNotes:
      "Frame this as a growth and impact conversation, not just recognition. Anchor promotion evidence with business outcomes and peer feedback. Ask for Priya's read on principal scope before you state the rating.",
  },
  "jordan-lee": {
    cycleLabel: "2026 Annual Performance Review",
    completedDate: "May 7, 2026",
    overallRating: "3/5: Meets expectations",
    summary:
      "Jordan shipped checkout flow updates and a design system token refresh that two product groups adopted. Jordan's usability study reshuffled experiment prioritization. Jordan is still building end-to-end ownership on Growth: sometimes they wait for PM direction on final UX calls instead of driving the decision.",
    strengths:
      "Solid craft and collaboration with Eng and PM. Design system work adopted beyond Growth. Usability research tied directly to the experiment backlog.",
    areasForDevelopment:
      "Jordan should own the full arc from discovery through launch metrics, not just scoped design delivery. Jordan should escalate faster when the product group is blocked on a UX call. Jordan should lead one cross-product group critique monthly to build influence outside their immediate team.",
    forwardGoals:
      "Jordan will own checkout experiment UX end to end, including success metrics at 30 days post-launch. Jordan will lead one cross-product group design critique per month. Jordan will complete a facilitation workshop by August.",
    deliveryNotes:
      "Balance recognition with one clear ownership stretch. Co-create measurable Q3 targets. Ask what resonates before you move to the rating.",
  },
  "alex-rivera": {
    cycleLabel: "6-month check-in",
    completedDate: "May 6, 2026",
    overallRating: "On track for L3 tenure",
    summary:
      "At six months, Alex delivered the onboarding funnel dashboard on time with documentation and built SQL models used in two experiment readouts. Alex has a strong analytical foundation. Alex is still ramping on prioritization under ambiguity and exec-facing communication.",
    strengths:
      "Fast ramp on the internal data stack. Reliable delivery on scoped asks. Good documentation on the dashboard handoff. Curiosity and follow-through on ad hoc analysis.",
    areasForDevelopment:
      "Alex needs a prioritization framework when multiple stakeholders request analysis at once. Alex should build structure and confidence in exec-facing readouts. Alex should cut ad hoc thrash with an intake template and clear SLA expectations with partners.",
    forwardGoals:
      "Alex will own one experiment analysis end to end, including a recommendation. Alex will present insights in product group review by July. Alex will deploy an analysis intake template with the PM partner.",
    deliveryNotes:
      "Developmental check-in, not a full annual rating deep-dive. Give specific feedback on communication and prioritization. Set clear Q3 expectations for the L3 bar.",
  },
  "taylor-brooks": {
    cycleLabel: "2026 Annual Performance Review",
    completedDate: "May 9, 2026",
    overallRating: "4/5: Exceeds expectations",
    calibrationNote:
      "Performance is strong; retention conversation required. Comp and scope concerns came up in recent 1:1s.",
    summary:
      "Taylor coordinated three major launches with zero sev-1 incidents and wrote launch playbook v3, which teams use org-wide. Taylor is a reliable operator under Q1 crunch. Taylor has also raised sustainability of concurrent launch load and compensation alignment; those topics deserve direct discussion alongside delivery outcomes.",
    strengths:
      "Launch execution with zero sev-1 incidents across three programs. Playbook v3 adoption across teams. Cross-team dependency management during crunch. Leadership trusts Taylor when timelines are tight.",
    areasForDevelopment:
      "Taylor needs a sustainable workload model; concurrent launches should cap at two. Taylor should formalize program health metrics, not just launch dates. Taylor should clarify career path (platform programs vs. growth launches) with written scope agreed with leadership.",
    forwardGoals:
      "Taylor will reduce concurrent launch load to two max. Taylor will define scope and compensation path outcomes in writing by June. Taylor will formalize a program health dashboard for leadership.",
    deliveryNotes:
      "Listen first on retention drivers; don't dismiss comp concerns. Then deliver the rating with 2–3 anchor examples. Don't promise promotion or comp changes you can't commit to.",
  },
};

export function getManagerReview(employeeId: string): ManagerWrittenReview {
  const review = managerReviews[employeeId];
  if (!review) {
    throw new Error(`No manager review for employee: ${employeeId}`);
  }
  return review;
}
