import { GoogleGenAI, Modality } from "@google/genai";
import { resolveGeminiLiveModel } from "../../src/data/liveModel.ts";
import type { LiveCoachPhase } from "../../src/data/learning/learningSessionTypes.ts";
import {
  buildLearnerLiveSystemInstruction,
  getLiveToolsForPhase,
  liveTokenUsesGoogleSearch,
} from "../../src/data/learnerLivePrompt.ts";
import {
  buildManagerCoachLiveSystemInstruction,
  getManagerCoachLiveTools,
} from "../../src/data/managerCoachLivePrompt.ts";
import { LIVE_COACH_VOICE } from "../../src/data/rehearseLiveConfig.ts";
import { LIVE_SESSION_LANGUAGE } from "../../src/data/sessionLanguage.ts";

export type LearnerLiveTokenRequest = {
  topicTitle?: string;
  phase?: LiveCoachPhase;
  employeeMd?: string;
  talentManagementMd?: string;
  focusEmployeeId?: string | null;
  knowledgeCheck?: {
    question: string;
  };
};

export async function createLearnerLiveToken(request: LearnerLiveTokenRequest = {}) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY not configured");
  }

  const topicTitle = request.topicTitle?.trim() || "their chosen topic";
  const phase = request.phase ?? "freeform";
  const functionDeclarations =
    phase === "manager_coach"
      ? getManagerCoachLiveTools()
      : getLiveToolsForPhase(phase);

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: { apiVersion: "v1alpha" },
  });

  const expireTime = new Date(Date.now() + 30 * 60 * 1000).toISOString();
  const newSessionExpireTime = new Date(Date.now() + 5 * 60 * 1000).toISOString();

  const tools: Array<{ googleSearch?: Record<string, never>; functionDeclarations?: typeof functionDeclarations }> = [];
  if (liveTokenUsesGoogleSearch(phase)) {
    tools.push({ googleSearch: {} });
  }
  if (functionDeclarations.length > 0) {
    tools.push({ functionDeclarations });
  }

  const liveModel = resolveGeminiLiveModel();

  const token = await ai.authTokens.create({
    config: {
      uses: 10,
      expireTime,
      newSessionExpireTime,
      liveConnectConstraints: {
        model: liveModel,
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            languageCode: LIVE_SESSION_LANGUAGE,
            voiceConfig: { prebuiltVoiceConfig: { voiceName: LIVE_COACH_VOICE } },
          },
          systemInstruction: {
            parts: [
              {
                text:
                  phase === "manager_coach"
                    ? buildManagerCoachLiveSystemInstruction({
                        talentManagementMd: request.talentManagementMd?.trim() ?? "",
                        employeeMd: request.employeeMd?.trim() ?? "",
                        focusEmployeeId: request.focusEmployeeId ?? null,
                      })
                    : buildLearnerLiveSystemInstruction({
                        topicTitle,
                        phase,
                        employeeMd: request.employeeMd,
                        knowledgeCheck: request.knowledgeCheck,
                      }),
              },
            ],
          },
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          tools: tools.length > 0 ? tools : undefined,
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
    model: liveModel,
  };
}
