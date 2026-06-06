import { GoogleGenAI, Modality, ThinkingLevel } from "@google/genai";
import {
  buildAgentEmployeeBriefing,
  buildAgentPrompt,
  resolveSubjectEmployeeId,
  type AgentContextSnapshot,
} from "../../src/data/buildAgentPrompt.ts";
import { DEFAULT_EMPLOYEE_ID, getDirectReport } from "../../src/data/directReports.ts";
import {
  parseSimulateScenario,
  type SimulateScenarioId,
} from "../../src/data/simulateScenarios.ts";
import { rehearseEmployeeVoiceName } from "../../src/data/rehearseLiveConfig.ts";
import { LIVE_SESSION_LANGUAGE } from "../../src/data/sessionLanguage.ts";

export type RehearseLiveTokenRequest = {
  employeeId?: string;
  scenario?: string;
  contextSnapshot?: AgentContextSnapshot;
};

export async function createRehearseLiveToken(
  employeeId: string,
  scenarioId: SimulateScenarioId,
  contextSnapshot: AgentContextSnapshot
) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY not configured");
  }

  const report = getDirectReport(employeeId);
  if (!report || employeeId !== DEFAULT_EMPLOYEE_ID) {
    throw new Error("Invalid rehearsal employee.");
  }

  const subjectEmployeeId = resolveSubjectEmployeeId(employeeId, "rehearse");
  const systemInstruction = buildAgentPrompt({
    sessionMode: "rehearse",
    subjectEmployeeId,
    context: contextSnapshot,
    scenarioId,
  });
  const employeeBriefing = buildAgentEmployeeBriefing({
    sessionMode: "rehearse",
    subjectEmployeeId,
    context: contextSnapshot,
    scenarioId,
  });
  const voiceName = rehearseEmployeeVoiceName(employeeId, scenarioId);

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: { apiVersion: "v1alpha" },
  });

  const expireTime = new Date(Date.now() + 30 * 60 * 1000).toISOString();
  const newSessionExpireTime = new Date(Date.now() + 5 * 60 * 1000).toISOString();

  const token = await ai.authTokens.create({
    config: {
      uses: 10,
      expireTime,
      newSessionExpireTime,
      liveConnectConstraints: {
        model: "gemini-3.1-flash-live-preview",
        config: {
          responseModalities: [Modality.AUDIO],
          thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
          speechConfig: {
            languageCode: LIVE_SESSION_LANGUAGE,
            voiceConfig: { prebuiltVoiceConfig: { voiceName } },
          },
          systemInstruction: {
            parts: [{ text: systemInstruction }],
          },
          inputAudioTranscription: {},
          outputAudioTranscription: {},
        },
      },
    },
  });

  if (!token.name) {
    throw new Error("Ephemeral token missing name");
  }

  return {
    token: token.name,
    expiresAt: expireTime,
    model: "gemini-3.1-flash-live-preview",
    employeeBriefing,
  };
}

export function parseRehearseLiveTokenRequest(
  body: RehearseLiveTokenRequest | null | undefined
): { employeeId: string; scenarioId: SimulateScenarioId } {
  const employeeId =
    typeof body?.employeeId === "string" && body.employeeId.length > 0
      ? (getDirectReport(body.employeeId)?.id ?? DEFAULT_EMPLOYEE_ID)
      : DEFAULT_EMPLOYEE_ID;
  const scenarioId = parseSimulateScenario(body?.scenario);
  return { employeeId, scenarioId };
}
