import type { GoogleGenAI } from "@google/genai";
import { getDeliveryPlaybook } from "./context/deliveryPlaybooks";
import { getDirectReport } from "./directReports";
import { manager } from "./manager";
import {
  SIMULATE_SCENARIOS,
  parseSimulateScenario,
  type SimulateScenarioId,
} from "./simulateScenarios";
import type { HudCueCategory, SessionAssessment, TranscriptLine } from "../types";
import { englishOnlyAssessmentRules, GENDER_NEUTRAL_EMPLOYEE_LANGUAGE } from "./sessionLanguage";
import { voiceDnaPromptBlock } from "./skills/voiceStyle";

const ANALYSIS_MODEL = "gemini-flash-lite-latest";

const HUD_CATEGORIES: HudCueCategory[] = [
  "posture",
  "tone",
  "structure",
  "encouragement",
  "relevance",
];

function formatTranscript(lines: TranscriptLine[]): string {
  return lines
    .filter((line) => line.text.trim().length > 0)
    .map((line) => `${line.role === "user" ? manager.name : "Employee"}: ${line.text}`)
    .join("\n");
}

function buildScenarioBlock(scenarioId: SimulateScenarioId): string {
  const scenario = SIMULATE_SCENARIOS[scenarioId];
  return `${scenario.title} — ${scenario.description}. Tone: ${scenario.promptTone}`;
}

export async function generateRehearseHudCue(
  ai: GoogleGenAI,
  employeeId: string,
  scenarioId: SimulateScenarioId,
  transcript: TranscriptLine[]
): Promise<{ text: string; category: HudCueCategory } | null> {
  const report = getDirectReport(employeeId);
  if (!report || transcript.length < 2) return null;

  const playbook = getDeliveryPlaybook(employeeId);
  const prompt = `You are a silent executive coach observing ${manager.name} rehearse a performance review delivery with ${report.name} on a video call.

Scenario: ${buildScenarioBlock(scenarioId)}
Headline tension: ${playbook.headlineTension}

Recent transcript:
${formatTranscript(transcript.slice(-12))}

If you have a specific, actionable delivery cue (max 8 words), respond with JSON:
{"cue": "short cue text", "category": "posture|tone|structure|encouragement|relevance"}

If nothing useful to say right now, respond with:
{"cue": null}

Rules:
- One cue only. No quotes from the transcript.
- Focus on ${manager.name}'s delivery (tone, structure, pacing, presence)—not ${report.name}'s lines.
- Be specific to this moment in the conversation.
- All cues must be in English.
${voiceDnaPromptBlock("micro")}
${englishOnlyAssessmentRules(manager.name)}`;

  try {
    const response = await ai.models.generateContent({
      model: ANALYSIS_MODEL,
      contents: prompt,
      config: { responseMimeType: "application/json" },
    });

    const raw = response.text?.trim();
    if (!raw) return null;

    const parsed = JSON.parse(raw) as { cue?: string | null; category?: string };
    if (!parsed.cue || typeof parsed.cue !== "string") return null;

    const category = HUD_CATEGORIES.includes(parsed.category as HudCueCategory)
      ? (parsed.category as HudCueCategory)
      : "tone";

    return { text: parsed.cue.trim().slice(0, 80), category };
  } catch {
    return null;
  }
}

export async function generateSessionAssessment(
  ai: GoogleGenAI,
  employeeId: string,
  scenarioId: SimulateScenarioId,
  transcript: TranscriptLine[],
  durationSeconds?: number
): Promise<SessionAssessment> {
  const report = getDirectReport(employeeId);
  if (!report) {
    throw new Error(`Unknown employee: ${employeeId}`);
  }

  const playbook = getDeliveryPlaybook(employeeId);
  const scenario = SIMULATE_SCENARIOS[scenarioId];
  const reactionOptions = playbook.potentialReactions
    .map((reaction) => `- ${reaction.id}: ${reaction.title}`)
    .join("\n");

  const prompt = `You are an executive coach reviewing ${manager.name}'s rehearsal of a performance review delivery with ${report.name}.

Session scenario practiced: ${buildScenarioBlock(scenarioId)}
Duration: ${durationSeconds ?? "unknown"} seconds

Delivery playbook context:
- Tension: ${playbook.headlineTension}
- Considerations: ${playbook.deliveryConsiderations.join("; ")}

Full transcript:
${formatTranscript(transcript)}

Potential reaction scenarios for next practice:
${reactionOptions}

Respond with JSON matching this schema:
{
  "summary": "2-3 sentences on overall delivery",
  "strengths": ["...", "..."],
  "improvements": ["...", "..."],
  "keyMoments": [{"moment": "...", "suggestion": "..."}],
  "recommendedScenarioId": "one of the reaction ids above or a simulate scenario id (default|defensive|accepting)",
  "recommendedScenarioTitle": "short title",
  "recommendedPracticeRationale": "one sentence why practice that next"
}

Be direct and specific. Reference actual moments from the transcript. When suggesting improvements, prefer COIN (Context–Observation–Impact–Next steps) over vague delivery advice. recommendedScenarioId for Mark should be default, defensive, or accepting when applicable.

${voiceDnaPromptBlock("written")}

${GENDER_NEUTRAL_EMPLOYEE_LANGUAGE}

Language rules:
${englishOnlyAssessmentRules(manager.name)}`;

  const response = await ai.models.generateContent({
    model: ANALYSIS_MODEL,
    contents: prompt,
    config: { responseMimeType: "application/json" },
  });

  const raw = response.text?.trim();
  if (!raw) {
    throw new Error("Empty assessment response");
  }

  const parsed = JSON.parse(raw) as SessionAssessment;
  parsed.recommendedScenarioId = parseSimulateScenario(parsed.recommendedScenarioId);

  return {
    summary: parsed.summary ?? "Session complete.",
    strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
    improvements: Array.isArray(parsed.improvements) ? parsed.improvements : [],
    keyMoments: Array.isArray(parsed.keyMoments) ? parsed.keyMoments : [],
    recommendedScenarioId: parsed.recommendedScenarioId,
    recommendedScenarioTitle: parsed.recommendedScenarioTitle,
    recommendedPracticeRationale: parsed.recommendedPracticeRationale,
  };
}
