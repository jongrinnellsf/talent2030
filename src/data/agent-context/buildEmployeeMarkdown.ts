import { directReports } from "../directReports";
import { manager } from "../manager";
import { ORG_NAME } from "./talentManagementSeed";

export type EmployeeMarkdownInput = {
  activityLines?: string[];
};

const MANAGER_TOOLS = [
  "Slack",
  "Gmail",
  "Google Meet",
  "Google Drive",
  "Calendar",
  "Asana",
  "Workday",
];

const COLLABORATION_DEMO = [
  "Weekly 1:1s with all five direct reports",
  "Product leadership channel (#product-leads) — daily async",
  "Calibration prep with VP Engineering and People Ops",
  "Cross-functional partner: Priya Reddy (platform), Jordan Lee (design)",
];

const LEARNING_DEMO = [
  "AI product strategy and responsible deployment",
  "Executive communication for difficult conversations",
];

export function buildEmployeeMarkdown(input: EmployeeMarkdownInput = {}): string {
  const activityLines = input.activityLines ?? [];
  const roster = directReports
    .map(
      (report) =>
        `### ${report.name}

- **Role:** ${report.role} (${report.level})
- **Tenure:** ${report.tenure}
- **Status:** ${report.statusLabel}
- **Signals:** ${report.observationTldr}`
    )
    .join("\n\n");

  const activityBlock =
    activityLines.length > 0
      ? activityLines.map((line) => `- ${line}`).join("\n")
      : "_No activity recorded yet in this demo session._";

  return `# Employee context — ${manager.name}

Agent context file for the **manager using Talent Management** (not a direct report file). This profile updates in real time as the manager uses the app.

## Profile

- **Name:** ${manager.name}
- **Title:** ${manager.title}
- **Company:** ${ORG_NAME}
- **Is people manager:** Yes — ${directReports.length} direct reports
- **Review cycle:** ${manager.reviewCycle} (${manager.cyclePhase})
- **Delivery window:** ${manager.deliveryWindow}

## Team

${roster}

## Tools used

${MANAGER_TOOLS.map((tool) => `- ${tool}`).join("\n")}

## Learning and interests

${LEARNING_DEMO.map((item) => `- ${item}`).join("\n")}

## Collaboration patterns

${COLLABORATION_DEMO.map((item) => `- ${item}`).join("\n")}

## Activity in Talent Management

Recent actions in this demo (newest first). Use for continuity—reference lightly, do not read verbatim.

${activityBlock}
`;
}

export function formatActivityTimestamp(): string {
  return new Date().toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
