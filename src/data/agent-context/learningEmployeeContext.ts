/** Prompt section injected into learner live + path generation when employee.md is available. */
export function buildLearnerEmployeeContextSection(employeeMd: string): string {
  const trimmed = employeeMd.trim();
  if (!trimmed) return "";

  return `## Learner profile (employee.md — background only)

Use this file **quietly** to shape examples and path content when it genuinely helps. The learner should not feel surveilled.

- **Do not** open with profile callouts ("I see you're a VP…", "your development goal…", "from employee.md…").
- **Do not** force every question through job title, AI strategy, or tools listed here.
- **Do** ask broad, topic-first questions during intake; weave in profile only when their answer is thin or they ask for role-specific help.
- **Do** accept clear on-topic answers and move on—do not re-ask facts already stated here or in their last reply.
- You may **nudge once** if they chose a path but refuse anything about that topic with no alternative goal.
- **Activity in Talent Management** (newest first) records what they did in this app—paths, explore, copilot, team context. Use lightly for continuity; never read log lines or timestamps aloud.

${trimmed}`;
}
