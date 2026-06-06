import type { DirectReport } from "../types";

export const directReports: DirectReport[] = [
  {
    id: "mark-webb",
    name: "Mark Webb",
    role: "Senior Product Manager",
    level: "L5",
    tenure: "2 years 4 months",
    initials: "MW",
    accentColor: "#dc2626",
    photoUrl: "/employees/jordan.png",
    reviewStatus: "pip-watch",
    statusLabel: "PIP watch",
    observationTldr:
      "Checkout refresh slipped in Q1; completion never improved. Defensive in Slack when challenged on scope. 1:1 follow-through slipping.",
    conversationPointer:
      "Lead with COIN on accountability: one checkout impact example, then behavior. Separate intent from impact.",
    summary:
      "Checkout refresh slipped in Q1; completion never improved. Inconsistent 1:1 follow-through. Defensive tone in Slack when challenged on scope.",
  },
  {
    id: "priya-reddy",
    name: "Priya Reddy",
    role: "Staff Engineer",
    level: "L6",
    tenure: "4 years 1 month",
    initials: "PN",
    accentColor: "#059669",
    photoUrl: "/employees/priya.png",
    reviewStatus: "promotion-track",
    statusLabel: "Promotion track",
    observationTldr:
      "Led platform migration ahead of schedule. Mentors two engineers. Strong calibration case for principal track.",
    conversationPointer:
      "Frame as a growth conversation. Anchor promotion evidence with business impact and peer feedback.",
    summary:
      "Led platform migration ahead of schedule. Mentors two engineers. Ready for principal-track conversation.",
  },
  {
    id: "jordan-lee",
    name: "Jordan Lee",
    role: "Product Designer",
    level: "L4",
    tenure: "1 year 8 months",
    initials: "JL",
    accentColor: "#2563eb",
    photoUrl: "/employees/markwebb.png",
    reviewStatus: "on-track",
    statusLabel: "On track",
    observationTldr:
      "Solid craft and collaboration. Still building end-to-end ownership on the Growth product group.",
    conversationPointer:
      "Balance recognition with one clear ownership stretch goal. Co-create measurable next-year targets.",
    summary:
      "Solid craft and collaboration. Needs clearer ownership of end-to-end design decisions on Growth product group.",
  },
  {
    id: "alex-rivera",
    name: "Alex Rivera",
    role: "Data Analyst",
    level: "L3",
    tenure: "6 months",
    initials: "AR",
    accentColor: "#7c3aed",
    photoUrl: "/employees/alex.png",
    reviewStatus: "new-hire",
    statusLabel: "6-month check-in",
    observationTldr:
      "Strong analytical foundation at six months. Still ramping on stakeholder communication and prioritization.",
    conversationPointer:
      "Treat as a developmental check-in: specific feedback on communication, not a formal rating deep-dive.",
    summary:
      "Strong analytical foundation. Still ramping on stakeholder communication and prioritization under ambiguity.",
  },
  {
    id: "taylor-brooks",
    name: "Taylor Brooks",
    role: "Program Manager",
    level: "L5",
    tenure: "5 years 3 months",
    initials: "TB",
    accentColor: "#b45309",
    photoUrl: "/employees/taylor.png",
    reviewStatus: "review-due",
    statusLabel: "Retention risk",
    observationTldr:
      "Reliable operator across three launches. Has flagged compensation and scope concerns in recent 1:1s.",
    conversationPointer:
      "Listen first on retention drivers before rating delivery. Avoid dismissive tone on comp concerns.",
    summary:
      "Reliable operator across three launches. Has flagged compensation and scope concerns in recent 1:1s.",
  },
];

export const DEFAULT_EMPLOYEE_ID = "mark-webb";

export function getDirectReport(id: string): DirectReport | undefined {
  return directReports.find((r) => r.id === id);
}
