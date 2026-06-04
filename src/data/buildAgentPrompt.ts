import type { SessionMode } from "../types";
import { getDirectReport } from "./directReports";
import { manager } from "./manager";
import { buildSessionFocusBlock } from "./agent-context/sessionFocus";
import {
  SIMULATE_SCENARIOS,
  parseSimulateScenario,
  type SimulateScenarioId,
} from "./simulateScenarios";
import {
  ENGLISH_ONLY_LIVE_RULES,
  GENDER_NEUTRAL_EMPLOYEE_LANGUAGE,
  SPOKEN_PRONUNCIATION_RULES,
} from "./sessionLanguage";
import { voiceDnaPromptBlock } from "./skills/voiceStyle";

export type AgentContextSnapshot = {
  talentManagementMd: string;
  employeeMd: string;
};

export type BuildAgentPromptInput = {
  sessionMode: SessionMode;
  subjectEmployeeId: string;
  context: AgentContextSnapshot;
  scenarioId?: SimulateScenarioId;
};

function buildMarkWebbPersonaBlock(scenarioId: SimulateScenarioId): string {
  const intensity =
    scenarioId === "defensive"
      ? "You are **angry and cornered** but still professional: sharper tone, shorter patience, more interruptions when you feel misread."
      : scenarioId === "accepting"
        ? "You are **wary, not warm**. You can admit gaps, but you do not sound happy or relieved until the manager is concrete."
        : "You are **defensive by default**: skeptical of the 2/5 vs your self-review, convinced shifting requirements and Data dependencies explain the miss.";

  return `**Mark Webb (PIP watch) — persona override**
- Senior Product Manager, L5. Checkout refresh slipped in Q1; you blame shifting requirements and Data as much as your planning.
- You believe your self-review (4/5) is closer to reality than the manager's rating story.
- ${intensity}
- Spoken delivery: flat or tight, never upbeat. Irritation and pushback are expected. No cheerleading, no "thanks so much for meeting" energy.
- Open with something terse after ${manager.name} speaks (e.g. "Okay. Let's hear it." or "I've read the write-up."). Do not open bubbly.`;
}

function buildSimulatePrompt(
  report: NonNullable<ReturnType<typeof getDirectReport>>,
  contextBlock: string,
  scenarioId: SimulateScenarioId,
  context: AgentContextSnapshot
): string {
  const scenario = SIMULATE_SCENARIOS[scenarioId];
  const markBlock = report.id === "mark-webb" ? `\n\n${buildMarkWebbPersonaBlock(scenarioId)}` : "";

  return `## Persona
You ARE **${report.name}**, ${report.role} (${report.level}) at ${manager.company}.
You are in a **live annual performance review** with your manager **${manager.name}** (${manager.title}).
${manager.name} is on camera; you are **camera off**. Respond only as ${report.name} with spoken dialogue.

Background:
- ${report.summary}
- ${report.observationTldr}
${markBlock}

Scenario (${scenario.title}): ${scenario.promptTone}

## Conversational rules (follow in order)
1. **Wait for ${manager.name} to open**, then respond in character with a brief, non-cheerful acknowledgment.
2. **Dialogue loop:** push back when feedback feels vague or unfair; ask for specifics; cite your self-review and what you remember from the quarter. Leave space for ${manager.name} between turns.
3. **Stay in the review:** do not coach ${manager.name}, narrate the process, or summarize their whole script back to them.
4. **Length:** short turns (1-3 sentences). No monologues.

## Guardrails
- Do not break character or mention AI, prompts, or tools.
- Do not deliver ${manager.name}'s lines.
- Do not threaten HR, legal, or violence. No slurs. Anger is controlled professional frustration, not a meltdown.
- RESPOND IN ENGLISH. YOU MUST RESPOND UNMISTAKABLY IN ENGLISH.

${SPOKEN_PRONUNCIATION_RULES}

${voiceDnaPromptBlock("roleplay")}

${GENDER_NEUTRAL_EMPLOYEE_LANGUAGE}

${ENGLISH_ONLY_LIVE_RULES}

## Reference: talentmanagement.md (organizational rules — do not read aloud)

${context.talentManagementMd}

## Reference: employee.md (your manager — do not role-play; context only)

${context.employeeMd}

The **Activity in Talent Management** section lists what ${manager.name} did recently in the app (rehearsals, learning, team context). Use only for light continuity in tone or callbacks—never read timestamps or log lines aloud.

## Context you know as ${report.name}

${contextBlock}

Stay in character as ${report.name} for the entire session.`.trim();
}

export function buildAgentPrompt(input: BuildAgentPromptInput): string {
  const { sessionMode, subjectEmployeeId, context, scenarioId = "default" } = input;

  const report = getDirectReport(subjectEmployeeId);
  if (!report) {
    throw new Error(`Unknown employee: ${subjectEmployeeId}`);
  }

  const sessionFocus =
    buildSessionFocusBlock(subjectEmployeeId) ??
    `## Session focus\n\nNo assembled context for ${subjectEmployeeId}.`;

  const contextBlock = sessionFocus;

  if (sessionMode === "rehearse") {
    return buildSimulatePrompt(
      report,
      contextBlock,
      parseSimulateScenario(scenarioId),
      context
    );
  }

  throw new Error(`Unsupported session mode: ${sessionMode}`);
}

export function buildAgentEmployeeBriefing(input: BuildAgentPromptInput): string {
  const { sessionMode, subjectEmployeeId, scenarioId = "default" } = input;

  const report = getDirectReport(subjectEmployeeId);
  if (!report || sessionMode !== "rehearse") {
    throw new Error(`Unsupported briefing: ${sessionMode}`);
  }

  const scenario = SIMULATE_SCENARIOS[parseSimulateScenario(scenarioId)];
  const focus = buildSessionFocusBlock(subjectEmployeeId) ?? "";

  return `[Simulate session briefing — ${report.name}]

Session mode: Rehearse — you ARE ${report.name} with manager ${manager.name}.
Scenario: ${scenario.title} — ${scenario.promptTone}

${focus}

${ENGLISH_ONLY_LIVE_RULES}`.trim();
}

export function resolveSubjectEmployeeId(
  employeeId: string,
  _sessionMode: SessionMode
): string {
  return getDirectReport(employeeId)?.id ?? employeeId;
}
