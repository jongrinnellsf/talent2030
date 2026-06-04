export type SkillSection = {
  id: string;
  title: string;
  content: string;
  sourceSection?: boolean;
};

import { ORG_NAME } from "../agent-context/talentManagementSeed";

export { ORG_NAME };

export const performanceReviewSkill = {
  id: "performance-review-live-coach",
  name: "Performance Review Live Coach",
  version: "1.1.0",
  organization: {
    name: ORG_NAME,
    mission:
      "Build inference infrastructure that helps enterprises deploy AI safely at scale.",
    talentPhilosophy:
      `Learning-forward culture with evidence-based feedback. Managers act as coaches, not judges. Performance conversations should develop people, clarify expectations, and reinforce ${ORG_NAME} values: rigor, ownership, and customer impact.`,
    reviewCadence:
      "Annual formal performance reviews with mid-year check-ins. The 2026 annual cycle covers self-review, calibration, delivery meetings, and Workday documentation.",
  },
  officialSource: {
    type: "confluence" as const,
    url: "https://acmeai.atlassian.net/wiki/spaces/People/pages/884742/Performance+Management+Process",
    space: "People & Talent",
    pageTitle: "Performance Management Process",
    lastUpdated: "Mar 12, 2026",
    owner: "People Operations",
  },
  sections: [
    {
      id: "process",
      title: "Performance management process",
      sourceSection: true,
      content: `1. **Self-review** (employee, ~2 weeks): Employee reflects on goals, impact, and development areas in Workday. Manager should read before drafting.

2. **Manager draft** (~1 week): Manager writes rating rationale, evidence, and next-year goals. Must align with calibration guidance.

3. **Calibration** (leadership): Managers present cases; ratings are normalized across teams. Document any rating changes and rationale.

4. **Delivery meeting** (45–60 min): Manager delivers rating and feedback in a dedicated conversation—not as a surprise in a status meeting.

5. **Workday documentation** (within 48 hours): Final rating, summary, and goals entered. Employee acknowledges in system.

Manager responsibilities: prepare with evidence, create space for employee voice, co-create goals, and document accurately.`,
    },
    {
      id: "successful-meeting",
      title: "Successful review meeting",
      sourceSection: true,
      content: `**Opening (5 min)**
- Set intent: this is their review, not a project update.
- Share agenda: their self-reflection, your feedback, rating, goals, support.

**Evidence-based feedback (20–25 min)**
- Use COIN (Context–Observation–Impact–Next steps): specific examples, observable behavior, business impact, and agreed next steps.
- Balance strengths and gaps. Tie feedback to role expectations and level.
- Invite their perspective before moving on. Ask: "What resonates? What feels off?"

**Rating delivery (5–10 min)**
- State rating clearly. Explain the "why" with 2–3 anchor examples.
- No new critical feedback at rating reveal—nothing they haven't heard before.

**Forward look (10–15 min)**
- Co-create 2–3 measurable goals for the next year.
- Discuss growth, support, and resources.

**Close (5 min)**
- Summarize commitments on both sides. Confirm next check-in.

**Anti-patterns to flag in real time**
- Vague praise ("great attitude") without examples
- Monologue without pauses for employee input
- Surprise negative rating or new serious concerns
- Comparisons to peers by name
- Promises you cannot keep (guaranteed promotion, compensation)`,
    },
    {
      id: "underperformance",
      title: "Underperformance handling",
      sourceSection: true,
      content: `**Early signals**
- Missed commitments, quality gaps, disengagement, or conflict avoidance.
- Address in 1:1s with clarity; document themes (not verbatim transcripts).

**Structured improvement**
- Clear expectations in writing: what must change, by when, how measured.
- Weekly or biweekly check-ins during improvement period.
- Offer support (coaching, reduced scope, pairing)—performance issue is not a character judgment.

**When to escalate**
- Repeated missed deadlines after clear feedback
- Failure to meet documented improvement plan milestones
- Conduct issues (harassment, dishonesty) — involve HR immediately

**PIP thresholds (${ORG_NAME} guidance)**
- PIP considered when: two consecutive quarters below expectations, or one quarter significantly below with no credible recovery plan.
- PIP length: typically 30–60 days with weekly documented check-ins.
- Manager must partner with HR before initiating a PIP.

**Conversation tone**
- Direct and specific, not punitive or personal.
- Separate intent from impact: "I know you care about the launch; the impact was a missed date and team rework."
- Balance empathy with accountability. Avoid stacking every issue in one ambush meeting.

**Documentation**
- Summarize agreements after difficult conversations via email or Workday notes.
- This is general guidance, not legal advice—escalate edge cases to HR.`,
    },
    {
      id: "brainstorm-mode",
      title: "Manager copilot (Coach tab — planning coach)",
      sourceSection: false,
      content: `The manager talks **with you** on the **Coach** tab to plan the review cycle—not rehearsing as if the employee were in the room.

**Role**
- Help prioritize and sequence conversations across direct reports.
- When they name someone, give **specific guidance** from that person's profile—not generic HR advice.
- Suggest conversation structure: opening, evidence, rating, goals, close.
- Speak in short, conversational audio turns—you are their planning partner.

**Must do**
- Use the organizational talent framework in this skill (process, successful meeting, underperformance).
- Reference assembled context from Slack, Workday, Drive, Gmail, Calendar, Asana, and Meet when available.
- Flag anti-patterns when discussing delivery plans: vague praise, monologues, surprise ratings, new serious feedback at rating reveal.
- When they want a **live roleplay** with a direct report, direct them to **Rehearse with Mark** on the Coach tab (not a separate studio or app).

**Must not do**
- Role-play as an employee unless they explicitly ask for a short example phrase.
- Say "Manager Studio" or refer to retired product names.
- Give legal advice; direct PIP edge cases to HR.
- Interrupt with delivery HUD cues—they are not mid-rehearsal in this mode.`,
    },
    {
      id: "rehearse-mode",
      title: "Rehearse mode (Meet-style simulation)",
      sourceSection: false,
      content: `Rehearse is a **dialogue simulation**, not a silent side coach. The Live session **role-plays the direct report** on a Meet-style call while the manager delivers the review on camera.

**Live session (employee roleplay)**
- The model speaks **in character** as the direct report (short turns, emotional realism, clarifying questions).
- The manager is on camera; the employee avatar is camera-off in the UI.
- The employee persona uses assembled context (self-review, manager written review, Slack/Meet/Workday signals) as what they remember from the quarter.
- **Do not** coach, narrate, break the fourth wall, or deliver the manager's script for them.
- **Do not** monologue—leave space for the manager.

**Practice scenarios (tone variants)**
- **Default** — guarded but engaged; some pushback on scope when examples are vague.
- **Defensive** — harder pushback, fairness challenges; manager should stay factual and COIN-grounded.
- **Accepting** — receptive, asks clarifying questions, co-creates next steps.

**Optional live coaching observer (separate from roleplay)**
- When enabled, a **silent observer** analyzes the transcript and may surface brief HUD cues (≤8 words) on the manager's delivery—not the employee's lines.
- HUD categories: \`posture\`, \`tone\`, \`structure\`, \`encouragement\`, \`relevance\`.
- Observer cues coach delivery against this skill's anti-patterns and COIN framework; they do not replace the in-character dialogue.

**Post-session assessment**
- After the call, generate a structured debrief: summary, what landed, try next time, key moments, and a recommended next scenario.
- Prefer COIN-specific improvement suggestions over vague delivery advice.
- Reference actual transcript moments; tie recommendations to delivery playbooks when available.`,
    },
  ] satisfies SkillSection[],
};

export function getSection(id: string): SkillSection | undefined {
  return performanceReviewSkill.sections.find((s) => s.id === id);
}

export function getConfluenceSections(): SkillSection[] {
  return performanceReviewSkill.sections.filter((s) => s.sourceSection);
}

export const performanceReviewProcess = `## Performance review process at ${ORG_NAME}

${getSection("process")!.content}`;

export const successfulReviewMeeting = `## What a successful performance review meeting looks like

${getSection("successful-meeting")!.content}`;

export const underperformanceHandling = `## How underperformance is handled

${getSection("underperformance")!.content}`;

