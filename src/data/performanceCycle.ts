export type TimelinePhaseStatus = "completed" | "current" | "upcoming";

export type TimelinePhase = {
  id: string;
  title: string;
  dateRange: string;
  description: string;
  status: TimelinePhaseStatus;
};

export const currentCycle = {
  name: "2026 Annual Performance Review",
  currentPhaseId: "delivery",
  currentPhaseLabel: "Delivery meetings",
};

export const cycleTimeline: TimelinePhase[] = [
  {
    id: "kickoff",
    title: "Cycle kickoff",
    dateRange: "Mar 24 – Mar 28",
    description: "People Ops publishes guidance. Managers align teams on timeline and expectations.",
    status: "completed",
  },
  {
    id: "self-review",
    title: "Self-review",
    dateRange: "Mar 31 – Apr 15",
    description: "Employees reflect on goals, impact, and development areas in Workday.",
    status: "completed",
  },
  {
    id: "manager-draft",
    title: "Manager draft",
    dateRange: "Apr 16 – May 10",
    description: "Managers write rating rationale, evidence, and next-year goals.",
    status: "completed",
  },
  {
    id: "calibration",
    title: "Calibration",
    dateRange: "May 12 – May 16",
    description: "Leadership normalizes ratings across teams. Document any changes and rationale.",
    status: "completed",
  },
  {
    id: "delivery",
    title: "Delivery meetings",
    dateRange: "May 19 – Jun 6",
    description: "Dedicated 45–60 min conversations to deliver rating, feedback, and co-create goals.",
    status: "current",
  },
  {
    id: "documentation",
    title: "Workday close-out",
    dateRange: "Jun 9 – Jun 13",
    description: "Final rating, summary, and goals entered within 48 hours of each meeting. Employee acknowledges.",
    status: "upcoming",
  },
];
