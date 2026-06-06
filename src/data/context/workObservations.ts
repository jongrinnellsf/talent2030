import type { IntegrationSource, WorkObservation } from "../../types";

export const workObservations: Record<string, WorkObservation[]> = {
  "mark-webb": [
    {
      id: "obs-mw-slack-1",
      source: "slack",
      title: "#product-growth: scope pushback",
      date: "May 8, 2026",
      example:
        "Mark: \"We already committed to this in the roadmap deck. Changing scope now is unfair to my product group.\"",
      observation:
        "Public tone reads defensive. Priya offered a technical compromise; Mark didn't acknowledge it or propose alternative phasing.",
    },
    {
      id: "obs-mw-slack-2",
      source: "slack",
      title: "DM: missed 1:1 follow-up",
      date: "May 5, 2026",
      example:
        "You asked for the Q1 retro doc before 1:1. No reply. Doc arrived 3 days late.",
      observation:
        "Action items keep slipping. That contrasts with Mark's self-review claim of steady product group leadership.",
    },
    {
      id: "obs-mw-slack-3",
      source: "slack",
      title: "DM: launch postmortem",
      date: "Apr 22, 2026",
      example:
        "Mark: \"The dependency on Data was the real issue, not our planning.\"",
      observation:
        "Mark points mostly at external teams. Mark's postmortem section is still light on product group decision quality.",
    },
    {
      id: "obs-mw-gmail-1",
      source: "gmail",
      title: "Re: Q1 goals alignment thread",
      date: "Jan 8, 2026",
      example:
        "You confirmed goals in writing. Mark replied \"Acknowledged\" but later cited \"changing requirements\" in self-review.",
      observation:
        "Written trail shows goals were agreed. Useful counter if Mark disputes fairness during delivery.",
    },
    {
      id: "obs-mw-gmail-2",
      source: "gmail",
      title: "Follow-up: 1:1 action items",
      date: "Apr 4, 2026",
      example:
        "You emailed summary of commitments after 1:1. Mark did not confirm receipt.",
      observation:
        "Weak closed-loop communication. Mark didn't mention this in their self-review development areas.",
    },
    {
      id: "obs-mw-gmail-3",
      source: "gmail",
      title: "Re: Q1 checkout metrics (Finance readout)",
      date: "Apr 8, 2026",
      example:
        "Finance follow-up to product leadership: checkout completion flat all quarter after the refresh slipped. Notes the March scope standoff on checkout.",
      observation:
        "Direct negative product impact. Use this when Mark frames misses as process-only or disputes whether their calls affected customers and revenue.",
    },
    {
      id: "obs-mw-meet-1",
      source: "meet",
      title: "1:1: postmortem ownership",
      date: "Apr 10, 2026",
      example:
        "When asked who owns the product group planning section, Mark pivoted to Data team delays for most of the call.",
      observation:
        "Live tone matches Slack defensiveness. Needs COIN on specific behaviors, not a pile of missed items.",
    },
    {
      id: "obs-mw-meet-2",
      source: "meet",
      title: "Product group sync: scope discussion",
      date: "May 6, 2026",
      example:
        "Mark spoke ~70% of airtime on roadmap pushback. Priya offered a phased cut; Mark did not engage.",
      observation:
        "Recording shows a missed chance to model collaborative leadership under pressure.",
    },
    {
      id: "obs-mw-drive-1",
      source: "drive",
      title: "1:1 notes (Apr 3, 2026)",
      date: "Apr 3, 2026",
      example:
        "Agreed Mark would own postmortem section by Apr 10. Not completed on time.",
      observation:
        "Good COIN example: specific commitment, missed deadline, impact on team trust, next step agreed.",
    },
    {
      id: "obs-mw-drive-2",
      source: "drive",
      title: "Checkout redesign retro (partial)",
      date: "Apr 24, 2026",
      example:
        "Mark's section emphasizes external blockers; light on product group decision quality.",
      observation:
        "Compare to Priya's engineering retro in the same folder. Shows a gap in Mark's ownership narrative.",
    },
    {
      id: "obs-mw-cal-1",
      source: "calendar",
      title: "Calibration: Product org",
      date: "May 17, 2026",
      example:
        "Mark's case: below expectations for Q1; no PIP yet if improvement plan agreed.",
      observation:
        "Calibrated outcome is \"below expectations.\" Align delivery language and co-create Q3 recovery goals.",
    },
    {
      id: "obs-mw-asana-1",
      source: "asana",
      title: "Checkout redesign: milestone overdue",
      date: "Mar 28, 2026",
      example:
        "Beta launch task slipped 18 days with no status update until you asked in standup.",
      observation:
        "Project hygiene gap. Contrasts with Mark's self-review claim of steady delivery management.",
    },
    {
      id: "obs-mw-asana-2",
      source: "asana",
      title: "Postmortem action items",
      date: "Apr 15, 2026",
      example:
        "\"Own product group planning section\" still open 5 days past due; marked complete without attached doc.",
      observation:
        "Concrete accountability example. Pair with the Drive retro gap for the rating conversation.",
    },
    {
      id: "obs-mw-wd-1",
      source: "workday",
      title: "Q1 goals: outcome summary",
      date: "Mar 31, 2026",
      example:
        "Checkout redesign missed Q1. Completion goal missed; never moved off baseline.",
      observation:
        "Two of three KRs missed. Sharp contrast with Mark's 4/5 self-rating and \"80% delivered\" framing.",
    },
  ],
  "priya-reddy": [
    {
      id: "obs-pn-slack-1",
      source: "slack",
      title: "#platform: migration win",
      date: "May 10, 2026",
      example:
        "Priya shared migration completion 11 days early. Team reacted with 40+ emoji.",
      observation:
        "Solid impact evidence. Priya led cutover with zero incidents and credited junior engineers publicly.",
    },
    {
      id: "obs-pn-slack-2",
      source: "slack",
      title: "DM: promotion interest",
      date: "May 3, 2026",
      example: "Priya: \"I'd like to discuss principal track scope in our next 1:1.\"",
      observation:
        "Self-initiated career conversation. Aligns with Staff expectations and the calibration slate.",
    },
    {
      id: "obs-pn-gmail-1",
      source: "gmail",
      title: "Promotion calibration pre-work",
      date: "May 6, 2026",
      example: "Impact summary received for calibration deck. Strong packet.",
      observation:
        "Self-review claims match external evidence. Ready for principal-track dialogue.",
    },
    {
      id: "obs-pn-meet-1",
      source: "meet",
      title: "Migration go/no-go",
      date: "Apr 18, 2026",
      example:
        "Priya led 45-minute cutover review with clear risks, rollback plan, and owner assignments.",
      observation:
        "Executive-ready facilitation. Strong principal-track signal beyond individual contribution.",
    },
    {
      id: "obs-pn-meet-2",
      source: "meet",
      title: "1:1: principal track scope",
      date: "May 4, 2026",
      example:
        "Articulated next-level expectations: org-wide architecture influence and mentoring bar.",
      observation:
        "Self-initiated and specific. Good anchor for promotion calibration discussion.",
    },
    {
      id: "obs-pn-drive-1",
      source: "drive",
      title: "Platform migration RFC",
      date: "Mar 2026",
      example: "Architecture doc cited by two other teams.",
      observation:
        "Org-wide technical influence beyond Priya's product group. Anchor for exceeds / promotion case.",
    },
    {
      id: "obs-pn-cal-1",
      source: "calendar",
      title: "Calibration: Staff+ candidates",
      date: "May 18, 2026",
      example: "Priya on principal-track slate.",
      observation:
        "Rating language should match calibration outcome. Leave time for career path discussion.",
    },
    {
      id: "obs-pn-asana-1",
      source: "asana",
      title: "Platform migration epic",
      date: "Apr 4, 2026",
      example:
        "All 14 migration milestones closed 11 days ahead of plan; dependencies flagged early.",
      observation:
        "Delivery evidence backs the Slack win. Use for exceeds / promotion narrative.",
    },
    {
      id: "obs-pn-asana-2",
      source: "asana",
      title: "Mentoring & onboarding tasks",
      date: "May 2026",
      example:
        "Three junior engineer onboarding checklists owned by Priya; 100% on-time with documented handoffs.",
      observation:
        "People leadership at Staff level. Supports principal-track case beyond technical wins.",
    },
  ],
  "jordan-lee": [
    {
      id: "obs-jl-slack-1",
      source: "slack",
      title: "DM: design critique request",
      date: "May 9, 2026",
      example: "Jordan asked for feedback on checkout flows before stakeholder review.",
      observation:
        "Proactive quality signal. Jordan wants clearer decision authority on final UX calls.",
    },
    {
      id: "obs-jl-slack-2",
      source: "slack",
      title: "#design-system: contribution",
      date: "Apr 30, 2026",
      example: "Shipped token updates adopted by two other product groups.",
      observation:
        "Positive cross-team impact. Supports meets/exceeds narrative in self-review.",
    },
    {
      id: "obs-jl-gmail-1",
      source: "gmail",
      title: "Stakeholder feedback on design reviews",
      date: "May 4, 2026",
      example: "PM noted Jordan's designs are strong but decisions slow at times.",
      observation:
        "Balanced third-party read. Matches Jordan's own development focus on ownership.",
    },
    {
      id: "obs-jl-meet-1",
      source: "meet",
      title: "Design critique: checkout flows",
      date: "May 8, 2026",
      example:
        "Jordan presented three options clearly but deferred final call to PM twice when asked directly.",
      observation:
        "Craft is strong; ownership hesitation shows live. Coach toward decisive recommendations.",
    },
    {
      id: "obs-jl-meet-2",
      source: "meet",
      title: "Cross-product group design review",
      date: "Apr 25, 2026",
      example:
        "Token system walkthrough praised by Platform and Growth leads; Jordan fielded edge cases well.",
      observation:
        "Positive org visibility. Balance recognition with stretch goal on end-to-end ownership.",
    },
    {
      id: "obs-jl-drive-1",
      source: "drive",
      title: "Portfolio: H1 highlights",
      date: "May 2026",
      example: "Checkout flows, design system tokens, usability study.",
      observation:
        "Concrete artifacts for affirming craft. Pair with stretch goal on end-to-end ownership.",
    },
    {
      id: "obs-jl-asana-1",
      source: "asana",
      title: "Design system token rollout",
      date: "Apr 30, 2026",
      example:
        "Eight token update tasks completed on schedule; two product groups tagged as adopters in comments.",
      observation:
        "Cross-team impact with clean execution. Supports meets/exceeds self-review narrative.",
    },
    {
      id: "obs-jl-asana-2",
      source: "asana",
      title: "Checkout flow revisions",
      date: "May 2026",
      example:
        "Three tasks blocked on \"PM sign-off\" for 9+ days; Jordan did not escalate until you nudged.",
      observation:
        "Ownership gap in task tracking. Aligns with stakeholder feedback on slow decisions.",
    },
  ],
  "alex-rivera": [
    {
      id: "obs-ar-slack-1",
      source: "slack",
      title: "DM: stakeholder question",
      date: "May 11, 2026",
      example:
        "Alex: \"Not sure if I should reply to VP request or loop you in first.\"",
      observation:
        "Appropriate escalation instinct. Coach on confident, concise exec communication.",
    },
    {
      id: "obs-ar-slack-2",
      source: "slack",
      title: "#data: dashboard delivery",
      date: "May 1, 2026",
      example: "Delivered onboarding funnel dashboard on time with documentation.",
      observation:
        "Strong early win. Supports self-review ramp narrative at 6-month check-in.",
    },
    {
      id: "obs-ar-gmail-1",
      source: "gmail",
      title: "Re: prioritization framework",
      date: "May 2026",
      example: "You shared team prioritization doc after Alex's question.",
      observation:
        "Manager support action to reference. Shows you're investing in Alex's development focus.",
    },
    {
      id: "obs-ar-meet-1",
      source: "meet",
      title: "6-month check-in prep",
      date: "May 12, 2026",
      example:
        "Alex asked clarifying questions on rating criteria and L3 expectations before the session.",
      observation:
        "Good prep instinct. Affirm proactive learning; coach on concise exec summaries next.",
    },
    {
      id: "obs-ar-meet-2",
      source: "meet",
      title: "Data team intro: stakeholder mapping",
      date: "Apr 14, 2026",
      example:
        "Intro call ran 10 minutes over; Alex covered context thoroughly but lost time for Q&A.",
      observation:
        "Early communication pattern. Pair with development focus on stakeholder brevity.",
    },
    {
      id: "obs-ar-drive-1",
      source: "drive",
      title: "Onboarding funnel analysis",
      date: "Apr 2026",
      example: "Insight led to experiment backlog prioritization.",
      observation:
        "Business impact beyond task completion. Good evidence for on-track L3 rating.",
    },
    {
      id: "obs-ar-asana-1",
      source: "asana",
      title: "Onboarding dashboard workstream",
      date: "May 1, 2026",
      example:
        "All seven dashboard tasks closed on due dates with README and data dictionary attached.",
      observation:
        "Strong ramp execution. Concrete win to open check-in conversation.",
    },
    {
      id: "obs-ar-asana-2",
      source: "asana",
      title: "Exec summary draft",
      date: "May 9, 2026",
      example:
        "VP-facing one-pager marked complete; comments show two revision rounds before share-out.",
      observation:
        "Shows iterative quality. Coach on getting to a crisp first draft faster.",
    },
  ],
  "taylor-brooks": [
    {
      id: "obs-tb-slack-1",
      source: "slack",
      title: "DM: scope concern",
      date: "May 7, 2026",
      example:
        "Taylor: \"Running three launches with same headcount isn't sustainable.\"",
      observation:
        "Retention signal. Pair review with comp band facts and scope path options before rating.",
    },
    {
      id: "obs-tb-slack-2",
      source: "slack",
      title: "#program-mgmt: launch coordination",
      date: "Apr 28, 2026",
      example: "Coordinated cross-team launch with zero sev-1 incidents.",
      observation:
        "Consistent high execution. Lead with this recognition; Taylor's self-review undersells the sustainability concern.",
    },
    {
      id: "obs-tb-gmail-1",
      source: "gmail",
      title: "Comp review (People team)",
      date: "May 9, 2026",
      example: "Taylor at top of L5 band; merit budget 3.2% this cycle.",
      observation:
        "Have facts ready. Performance is strong; the conversation is about scope and retention.",
    },
    {
      id: "obs-tb-meet-1",
      source: "meet",
      title: "Launch war room: Q2 cutover",
      date: "Apr 29, 2026",
      example:
        "Taylor kept standup to 15 minutes, assigned owners live, and closed with clear go/no-go criteria.",
      observation:
        "Recent leadership under pressure. Strong opener before scope/retention discussion.",
    },
    {
      id: "obs-tb-meet-2",
      source: "meet",
      title: "1:1: scope and sustainability",
      date: "May 7, 2026",
      example:
        "Taylor named three parallel launches and asked for explicit tradeoffs. Taylor was proposing options, not venting.",
      observation:
        "Retention signal delivered constructively. Engage with options, not defensiveness.",
    },
    {
      id: "obs-tb-drive-1",
      source: "drive",
      title: "Launch playbook v3",
      date: "Feb 2026",
      example: "Taylor authored org-wide program template.",
      observation:
        "Impact beyond direct product group. Supports exceeds rating rationale.",
    },
    {
      id: "obs-tb-cal-1",
      source: "calendar",
      title: "Launch retrospective (Program)",
      date: "May 8, 2026",
      example: "Taylor facilitated. Strong feedback from eng leads.",
      observation:
        "Recent leadership signal. Use to open review on a positive note before scope discussion.",
    },
    {
      id: "obs-tb-asana-1",
      source: "asana",
      title: "Q2 launch program board",
      date: "May 2026",
      example:
        "94% of cross-team tasks on time across three launches; blockers escalated within 24 hours.",
      observation:
        "Execution data backs Slack coordination win. Supports exceeds rating rationale.",
    },
    {
      id: "obs-tb-asana-2",
      source: "asana",
      title: "Launch playbook rollout",
      date: "Mar 2026",
      example:
        "Playbook adoption tasks for four product groups completed two weeks ahead of org deadline.",
      observation:
        "Org-wide impact beyond direct product group. Use when discussing scope expansion vs. sustainability.",
    },
  ],
};

const sectionOrder: IntegrationSource[] = [
  "slack",
  "gmail",
  "meet",
  "drive",
  "calendar",
  "asana",
  "workday",
];

const sectionLabels: Record<IntegrationSource, string> = {
  slack: "Slack",
  gmail: "Gmail",
  meet: "Google Meet",
  drive: "Google Drive",
  calendar: "Calendar",
  asana: "Asana",
  workday: "Workday",
};

export function getWorkObservations(employeeId: string): WorkObservation[] {
  return workObservations[employeeId] ?? [];
}

export function getObservationSections(employeeId: string) {
  const items = getWorkObservations(employeeId);
  return sectionOrder
    .map((source) => ({
      source,
      label: sectionLabels[source],
      items: items.filter((item) => item.source === source),
    }))
    .filter((section) => section.items.length > 0);
}
