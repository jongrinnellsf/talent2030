import type { SelfPerformanceReview } from "../../types";

export const selfReviews: Record<string, SelfPerformanceReview> = {
  "mark-webb": {
    cycleLabel: "2026 Annual Performance Review",
    submittedDate: "Apr 14, 2026",
    selfRating: "4/5: Exceeds some expectations",
    accomplishments:
      "I led the checkout redesign through two major milestones even as requirements kept shifting. We hit about 80% of what I'd committed to for Q1. Morale on the product group stayed steady through a rough quarter.",
    challenges:
      "Leadership changed scope mid-quarter, which made the original Q1 goals hard to hit. Data team dependencies slowed a few key integrations. We were running three parallel initiatives on a stretched team.",
    developmentFocus:
      "I want to get better at flagging scope shifts early and keeping stakeholders aligned before plans drift.",
    nextPeriodGoals:
      "Ship the checkout refresh with a firm launch date. Cut experiment cycle time by 20%. Tighten cross-functional planning with Eng and Design.",
  },
  "priya-reddy": {
    cycleLabel: "2026 Annual Performance Review",
    submittedDate: "Apr 12, 2026",
    selfRating: "5/5: Exceeds expectations",
    accomplishments:
      "I finished the platform migration 11 days ahead of schedule with zero customer incidents. Wrote an architecture RFC that two teams adopted. Mentored two L4 engineers with documented growth outcomes.",
    challenges:
      "On-call load during the cutover ate into time I would've spent on broader org work. Principal-track scope still isn't formal on paper, and I'd like clearer leveling criteria.",
    developmentFocus:
      "Expand org-wide technical influence and make the principal-track impact story explicit in writing.",
    nextPeriodGoals:
      "Lead the multi-region failover initiative. Give an external talk on the migration approach. Sponsor one engineer toward Staff promotion.",
  },
  "jordan-lee": {
    cycleLabel: "2026 Annual Performance Review",
    submittedDate: "Apr 16, 2026",
    selfRating: "3/5: Meets expectations",
    accomplishments:
      "Shipped checkout flow updates and a design system token refresh that two product groups picked up. Ran a usability study that reshuffled the experiment backlog.",
    challenges:
      "I still wait for PM direction on some final UX calls when I probably could've decided myself. Growth moves fast; I'm still calibrating when to escalate vs. when to just call it.",
    developmentFocus:
      "Own the full arc on Growth: discovery through launch metrics, not just the scoped design work.",
    nextPeriodGoals:
      "Own checkout experiment UX end to end. Lead one cross-product group design critique per month. Finish a facilitation workshop.",
  },
  "alex-rivera": {
    cycleLabel: "6-month check-in",
    submittedDate: "Apr 18, 2026",
    selfRating: "3/5: On track for tenure",
    accomplishments:
      "Delivered the onboarding funnel dashboard on time with docs. Built SQL models used in two experiment readouts. Ramped quickly on the internal data stack.",
    challenges:
      "Prioritization gets messy when three stakeholders want ad hoc analysis at once. I'm still building confidence in exec-facing readouts.",
    developmentFocus:
      "A clearer prioritization framework and sharper stakeholder communication at the L3 bar.",
    nextPeriodGoals:
      "Own one experiment analysis end to end. Present insights in product group review. Roll out an intake template with PM to cut ad hoc thrash.",
  },
  "taylor-brooks": {
    cycleLabel: "2026 Annual Performance Review",
    submittedDate: "Apr 13, 2026",
    selfRating: "4/5: Exceeds expectations",
    accomplishments:
      "Coordinated three major launches with zero sev-1 incidents. Wrote launch playbook v3, which teams are using org-wide. Kept cross-team dependencies on track through Q1 crunch.",
    challenges:
      "Three concurrent launches on the same headcount isn't sustainable. Scope has grown without matching resources or a comp adjustment.",
    developmentFocus:
      "Clarity on role scope and a workload model I can actually run long term. I'm interested in a platform-programs path vs. staying on growth launches.",
    nextPeriodGoals:
      "Cap concurrent launches at two. Formalize program health metrics. Define a scope path with my manager by June.",
  },
};

export function getSelfReview(employeeId: string): SelfPerformanceReview {
  const review = selfReviews[employeeId];
  if (!review) {
    throw new Error(`No self-review for employee: ${employeeId}`);
  }
  return review;
}
