export type SimulateScenarioId = "default" | "defensive" | "accepting";

export type SimulateScenario = {
  id: SimulateScenarioId;
  title: string;
  description: string;
  promptTone: string;
};

export const SIMULATE_SCENARIOS: Record<SimulateScenarioId, SimulateScenario> = {
  default: {
    id: "default",
    title: "Default",
    description: "Guarded, skeptical, quick to push back on fairness.",
    promptTone:
      "You are defensive and skeptical of the rating gap. You challenge vague feedback, cite shifting requirements and Data dependencies, and only soften when the manager is specific and factual. Do not sound upbeat, cheerful, or eager to please.",
  },
  defensive: {
    id: "defensive",
    title: "Defensive",
    description: "Sharper pushback; irritated and harder to win over.",
    promptTone:
      "You are noticeably irritated and confrontational. You question whether examples are cherry-picked, push back hard on fairness, and sound tense or angry while staying professional (no threats, no slurs, no yelling). Do not sound friendly or cooperative until the manager earns it with specifics.",
  },
  accepting: {
    id: "accepting",
    title: "Accepting",
    description: "Wary but willing to engage and plan next steps.",
    promptTone:
      "You are still guarded and a little skeptical, but you listen. You push back once or twice, then acknowledge gaps and co-create next steps if the manager is clear. Still not upbeat: measured and serious, not peppy.",
  },
};

export function parseSimulateScenario(value: string | null | undefined): SimulateScenarioId {
  if (value && value in SIMULATE_SCENARIOS) {
    return value as SimulateScenarioId;
  }
  return "default";
}
