import type { LearningPhase, LiveCoachPhase } from "../learning/learningSessionTypes";

export type EmployeeActivityArea =
  | "Team"
  | "Coach"
  | "Learning path"
  | "Rehearse"
  | "Explore"
  | "Manager copilot";

export type EmployeeActivityEntry = {
  area: EmployeeActivityArea;
  action: string;
  detail?: string;
};

const MAX_DETAIL_CHARS = 200;
const MAX_ACTION_CHARS = 120;

export function truncateActivityText(text: string, max = MAX_DETAIL_CHARS): string {
  const trimmed = text.replace(/\s+/g, " ").trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1)}…`;
}

export function formatEmployeeActivityLine(entry: EmployeeActivityEntry): string {
  const action = truncateActivityText(entry.action, MAX_ACTION_CHARS);
  const detail = entry.detail?.trim();
  if (detail) {
    return `[${entry.area}] ${action} — ${truncateActivityText(detail)}`;
  }
  return `[${entry.area}] ${action}`;
}

export function learningPhaseToActivityArea(phase: LearningPhase): EmployeeActivityArea {
  switch (phase) {
    case "freeform":
      return "Explore";
    case "manager_coach":
      return "Manager copilot";
    case "rehearse":
      return "Rehearse";
    case "intake":
    case "generating":
    case "path":
    case "assessment":
    case "complete":
      return "Learning path";
    default:
      return "Coach";
  }
}

export function liveCoachPhaseToActivityArea(phase: LiveCoachPhase): EmployeeActivityArea {
  switch (phase) {
    case "freeform":
      return "Explore";
    case "manager_coach":
      return "Manager copilot";
    case "intake":
    case "path":
    case "assessment":
      return "Learning path";
    default:
      return "Coach";
  }
}

export function learningPhaseLabel(phase: LearningPhase): string {
  switch (phase) {
    case "select_topic":
      return "Coach home";
    case "freeform":
      return "Explore freely";
    case "manager_coach":
      return "Manager copilot";
    case "rehearse":
      return "Rehearse with Mark";
    case "intake":
      return "Learning path intake";
    case "generating":
      return "Path generation";
    case "path":
      return "Learning path";
    case "assessment":
      return "Knowledge check";
    case "complete":
      return "Path completion";
    default:
      return phase;
  }
}

export function summarizeTranscriptForActivity(
  lines: { role: "user" | "coach"; text: string; isFinished?: boolean }[]
): string | undefined {
  const finished = lines.filter((line) => line.text.trim() && line.isFinished !== false);
  if (finished.length === 0) return undefined;

  const lastUser = [...finished].reverse().find((line) => line.role === "user");
  const lastCoach = [...finished].reverse().find((line) => line.role === "coach");
  const parts: string[] = [];

  if (lastUser) {
    parts.push(`Learner: ${truncateActivityText(lastUser.text, 90)}`);
  }
  if (lastCoach) {
    parts.push(`Coach: ${truncateActivityText(lastCoach.text, 90)}`);
  }

  const userTurns = finished.filter((line) => line.role === "user").length;
  if (userTurns > 1) {
    parts.push(`${userTurns} learner turns`);
  }

  return parts.length > 0 ? parts.join(" · ") : undefined;
}

export function formatIntakePersonalizationDetail(
  summary: string,
  answers?: string[]
): string {
  const parts = [summary.trim()];
  if (answers?.length) {
    const condensed = answers
      .map((answer, index) => `Q${index + 1}: ${truncateActivityText(answer, 70)}`)
      .join(" | ");
    parts.push(condensed);
  }
  return truncateActivityText(parts.filter(Boolean).join(" — "));
}
