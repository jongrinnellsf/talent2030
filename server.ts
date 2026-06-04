import "dotenv/config";
import express from "express";
import path from "path";
import {
  GoogleGenAI,
  LiveServerMessage,
  Modality,
  Session,
  ThinkingLevel,
} from "@google/genai";
import { WebSocketServer, WebSocket, RawData } from "ws";
import {
  buildAgentEmployeeBriefing,
  buildAgentPrompt,
  resolveSubjectEmployeeId,
  type AgentContextSnapshot,
} from "./src/data/buildAgentPrompt.ts";
import { buildEmployeeMarkdown } from "./src/data/agent-context/buildEmployeeMarkdown.ts";
import { buildTalentManagementMarkdown } from "./src/data/agent-context/talentManagementSeed.ts";
import { getDirectReport, DEFAULT_EMPLOYEE_ID } from "./src/data/directReports.ts";
import { normalizeSessionMode } from "./src/data/sessionModes.ts";
import { parseSimulateScenario } from "./src/data/simulateScenarios.ts";
import { rehearseEmployeeVoiceName, LIVE_COACH_VOICE } from "./src/data/rehearseLiveConfig.ts";
import {
  generateRehearseHudCue,
  generateSessionAssessment,
} from "./src/data/buildRehearseAnalysis.ts";
import { mergeStreamingTranscript } from "./src/lib/transcriptMerge.ts";
import { LIVE_SESSION_LANGUAGE } from "./src/data/sessionLanguage.ts";
import type { SessionMode, TranscriptLine } from "./src/types.ts";
import { handleLearningGenerate } from "./server/learning/generatePath.ts";
import { handlePersonalizedPathGenerate } from "./server/learning/generatePersonalizedPath.ts";
import { createLearnerLiveToken } from "./server/learning/liveToken.ts";

function parseSessionMode(value: unknown): SessionMode {
  if (typeof value === "string") {
    return normalizeSessionMode(value);
  }
  return "rehearse";
}

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

type StartPayload = {
  type: "start";
  employeeId: string;
  sessionMode?: SessionMode;
  scenario?: string;
  contextSnapshot?: AgentContextSnapshot;
};

function isStartPayload(payload: unknown): payload is StartPayload {
  return (
    typeof payload === "object" &&
    payload !== null &&
    (payload as StartPayload).type === "start" &&
    typeof (payload as StartPayload).employeeId === "string" &&
    (payload as StartPayload).employeeId.length > 0
  );
}

function resolveSessionStart(
  employeeId: string,
  _sessionModeInput?: SessionMode
): { employeeId: string; sessionMode: SessionMode } {
  const resolved = getDirectReport(employeeId)?.id ?? DEFAULT_EMPLOYEE_ID;
  return { employeeId: resolved, sessionMode: "rehearse" };
}

function defaultContextSnapshot(): AgentContextSnapshot {
  return {
    talentManagementMd: buildTalentManagementMarkdown(),
    employeeMd: buildEmployeeMarkdown(),
  };
}

function resolveContextSnapshot(raw: unknown): AgentContextSnapshot {
  if (
    typeof raw === "object" &&
    raw !== null &&
    typeof (raw as AgentContextSnapshot).talentManagementMd === "string" &&
    typeof (raw as AgentContextSnapshot).employeeMd === "string"
  ) {
    const snapshot = raw as AgentContextSnapshot;
    if (
      snapshot.talentManagementMd.trim().length > 0 &&
      snapshot.employeeMd.trim().length > 0
    ) {
      return snapshot;
    }
  }
  return defaultContextSnapshot();
}

function isValidSessionStart(employeeId: string, sessionMode: SessionMode): boolean {
  return (
    sessionMode === "rehearse" &&
    employeeId === DEFAULT_EMPLOYEE_ID &&
    !!getDirectReport(DEFAULT_EMPLOYEE_ID)
  );
}

type SessionHandlers = {
  sessionMode: SessionMode;
  employeeId: string;
  simulateScenario: ReturnType<typeof parseSimulateScenario>;
  sessionRef: { current: Session | null };
};

function handleGeminiMessage(
  clientWs: WebSocket,
  message: LiveServerMessage,
  _handlers: SessionHandlers
) {
  const content = message.serverContent;
  if (!content) return;

  if (content.interrupted) {
    clientWs.send(JSON.stringify({ interrupted: true }));
  }

  if (content.modelTurn?.parts) {
    for (const part of content.modelTurn.parts) {
      if (part.inlineData?.data) {
        clientWs.send(JSON.stringify({ audio: part.inlineData.data }));
      }
    }
  }

  const managerTextParts: string[] = [];

  if (content.outputTranscription?.text) {
    managerTextParts.push(content.outputTranscription.text);
  } else if (content.modelTurn?.parts) {
    for (const part of content.modelTurn.parts) {
      if (typeof part.text === "string" && part.text.trim().length > 0) {
        managerTextParts.push(part.text);
      }
    }
  }

  if (content.inputTranscription?.text) {
    clientWs.send(
      JSON.stringify({
        inputText: content.inputTranscription.text,
        inputFinished: content.inputTranscription.finished ?? false,
      })
    );
  }

  const joinedText = managerTextParts
    .reduce((acc, part) => mergeStreamingTranscript(acc, part), "")
    .trim();

  if (joinedText.length > 0 || content.turnComplete) {
    clientWs.send(
      JSON.stringify({
        text: joinedText,
        turnComplete: content.turnComplete,
      })
    );
  }
}

export type CreateAppOptions = {
  /** Start HTTP listener (local dev / Node hosting). */
  listen?: boolean;
  /** Attach WebSocket `/live` for rehearsal (requires listen). */
  webSocket?: boolean;
  /** Vite HMR middleware (local dev only). */
  useVite?: boolean;
};

export async function createApp(options: CreateAppOptions = {}) {
  const listen = options.listen ?? false;
  const webSocket = options.webSocket ?? false;
  const useVite = options.useVite ?? false;

  const app = express();
  app.use(express.json({ limit: "2mb" }));
  const PORT = Number(process.env.PORT) || 3000;

  if (!process.env.GEMINI_API_KEY) {
    console.error(
      "GEMINI_API_KEY is missing. Copy .env.example to .env and add your key from https://aistudio.google.com/apikey"
    );
  } else {
    console.log("Gemini API key loaded");
  }

  app.post("/api/rehearse/hud-cue", async (req, res) => {
    try {
      if (!process.env.GEMINI_API_KEY) {
        res.status(503).json({ error: "Gemini API key not configured." });
        return;
      }

      const employeeId =
        typeof req.body?.employeeId === "string" ? req.body.employeeId : DEFAULT_EMPLOYEE_ID;
      const scenarioId = parseSimulateScenario(req.body?.scenarioId);
      const transcript = Array.isArray(req.body?.transcript)
        ? (req.body.transcript as TranscriptLine[])
        : [];

      const cue = await generateRehearseHudCue(ai, employeeId, scenarioId, transcript);
      res.json({ cue });
    } catch (err) {
      console.error("HUD cue generation failed:", err);
      res.status(500).json({ error: "Failed to generate coaching cue." });
    }
  });

  app.post("/api/learning/generate", async (req, res) => {
    try {
      if (!process.env.GEMINI_API_KEY) {
        res.status(503).json({ error: "Gemini API key not configured." });
        return;
      }
      await handleLearningGenerate(ai, req.body ?? {}, res);
    } catch (err) {
      console.error("Learning generate route failed:", err);
      if (!res.headersSent) {
        res.status(500).json({ error: "Failed to generate learning path." });
      }
    }
  });

  app.post("/api/learning/generate-personalized-path", async (req, res) => {
    try {
      if (!process.env.GEMINI_API_KEY) {
        res.status(503).json({ error: "Gemini API key not configured." });
        return;
      }
      await handlePersonalizedPathGenerate(ai, req.body ?? {}, res);
    } catch (err) {
      console.error("Personalized path generate failed:", err);
      if (!res.headersSent) {
        res.status(500).json({ error: "Failed to generate personalized path." });
      }
    }
  });

  app.post("/api/learning/live-token", async (req, res) => {
    try {
      if (!process.env.GEMINI_API_KEY) {
        res.status(503).json({ error: "Gemini API key not configured." });
        return;
      }
      const payload = await createLearnerLiveToken(req.body ?? {});
      res.json(payload);
    } catch (err) {
      console.error("Learner live token failed:", err);
      const detail =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: unknown }).message)
          : undefined;
      res.status(500).json({
        error: "Failed to create voice session token.",
        ...(detail ? { detail } : {}),
      });
    }
  });

  app.post("/api/rehearse/assess", async (req, res) => {
    try {
      if (!process.env.GEMINI_API_KEY) {
        res.status(503).json({ error: "Gemini API key not configured." });
        return;
      }

      const employeeId =
        typeof req.body?.employeeId === "string" ? req.body.employeeId : DEFAULT_EMPLOYEE_ID;
      const scenarioId = parseSimulateScenario(req.body?.scenarioId);
      const transcript = Array.isArray(req.body?.transcript)
        ? (req.body.transcript as TranscriptLine[])
        : [];
      const durationSeconds =
        typeof req.body?.durationSeconds === "number" ? req.body.durationSeconds : undefined;

      const assessment = await generateSessionAssessment(
        ai,
        employeeId,
        scenarioId,
        transcript,
        durationSeconds
      );
      res.json({ assessment });
    } catch (err) {
      console.error("Session assessment failed:", err);
      res.status(500).json({ error: "Failed to assess session." });
    }
  });

  if (webSocket && !listen) {
    throw new Error("WebSocket rehearsal requires listen: true");
  }

  const server = listen
    ? app.listen(PORT, "0.0.0.0", () => {
        console.log(`Server running on http://localhost:${PORT}`);
      })
    : null;

  if (webSocket && server) {
    const wss = new WebSocketServer({ server, path: "/live" });

    wss.on("connection", (clientWs) => {
    console.log("Client connected to /live");

    const sessionRef: { current: Session | null } = { current: null };
    let sessionStarting = false;
    let startReceived = false;
    let activeEmployeeId = "";
    const pendingMediaPayloads: string[] = [];

    const handlers: SessionHandlers = {
      sessionMode: "rehearse",
      employeeId: "",
      simulateScenario: "default",
      sessionRef,
    };

    const startTimeout = setTimeout(() => {
      if (!startReceived && clientWs.readyState === WebSocket.OPEN) {
        console.error("No start payload received within 15s — closing socket");
        clientWs.send(
          JSON.stringify({
            error:
              "Session not configured. Select a mode and restart the session.",
          })
        );
        clientWs.close();
      }
    }, 15_000);

    const forwardToGemini = (raw: RawData | string) => {
      if (!sessionRef.current) return;
      try {
        const text =
          typeof raw === "string"
            ? raw
            : Buffer.isBuffer(raw)
              ? raw.toString()
              : Buffer.from(raw as ArrayBuffer).toString();
        const payload = JSON.parse(text);

        if (payload.audioStreamEnd) {
          sessionRef.current.sendRealtimeInput({ audioStreamEnd: true });
        }
        if (payload.text && typeof payload.text === "string") {
          const trimmed = payload.text.trim();
          if (trimmed.length > 0) {
            sessionRef.current.sendClientContent({
              turns: [{ role: "user", parts: [{ text: trimmed }] }],
              turnComplete: true,
            });
          }
        }
        if (payload.audio) {
          sessionRef.current.sendRealtimeInput({
            audio: { data: payload.audio, mimeType: "audio/pcm;rate=16000" },
          });
        }
        if (payload.video && typeof payload.video === "string") {
          if (handlers.sessionMode === "rehearse") {
            sessionRef.current.sendRealtimeInput({
              video: { data: payload.video, mimeType: "image/jpeg" },
            });
          }
        }
      } catch (err) {
        console.error("Error processing client message", err);
      }
    };

    const startGeminiSession = async (
      employeeId: string,
      sessionMode: SessionMode,
      contextSnapshot: AgentContextSnapshot
    ) => {
      if (sessionMode === "rehearse") {
        const report = getDirectReport(employeeId);
        if (!report) {
          clientWs.send(
            JSON.stringify({ error: `Unknown employee: ${employeeId}` })
          );
          clientWs.close();
          return;
        }
      }

      if (sessionRef.current || sessionStarting) return;

      sessionStarting = true;
      activeEmployeeId = employeeId;
      handlers.sessionMode = sessionMode;
      handlers.employeeId = employeeId;

      let systemInstruction: string;
      let employeeBriefing: string;
      const subjectEmployeeId = resolveSubjectEmployeeId(employeeId, sessionMode);
      try {
        systemInstruction = buildAgentPrompt({
          sessionMode,
          subjectEmployeeId,
          context: contextSnapshot,
          scenarioId: handlers.simulateScenario,
        });
        employeeBriefing = buildAgentEmployeeBriefing({
          sessionMode,
          subjectEmployeeId,
          context: contextSnapshot,
          scenarioId: handlers.simulateScenario,
        });
      } catch (err) {
        console.error("Failed to build coach prompt:", err);
        clientWs.send(JSON.stringify({ error: "Failed to build coach context." }));
        clientWs.close();
        sessionStarting = false;
        return;
      }

      const sessionLabel = getDirectReport(employeeId)?.name ?? employeeId;

      console.log(
        `Starting Gemini Live for ${sessionLabel} (${sessionMode}) — prompt ${systemInstruction.length} chars`
      );

      try {
        const connectTimeout = new Promise<never>((_, reject) => {
          setTimeout(
            () => reject(new Error("Gemini Live connect timed out after 20s")),
            20_000
          );
        });

        const connectConfig: Parameters<typeof ai.live.connect>[0]["config"] = {
          responseModalities: [Modality.AUDIO],
          thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
          speechConfig: {
            languageCode: LIVE_SESSION_LANGUAGE,
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName:
                  sessionMode === "rehearse"
                    ? rehearseEmployeeVoiceName(employeeId, handlers.simulateScenario)
                    : LIVE_COACH_VOICE,
              },
            },
          },
          systemInstruction: { parts: [{ text: systemInstruction }] },
          inputAudioTranscription: {},
          outputAudioTranscription: {},
        };

        sessionRef.current = await Promise.race([
          ai.live.connect({
            model: "gemini-3.1-flash-live-preview",
            callbacks: {
              onmessage: (message: LiveServerMessage) => {
                if (clientWs.readyState === WebSocket.OPEN) {
                  handleGeminiMessage(clientWs, message, handlers);
                }
              },
              onerror: (error) => {
                console.error("Gemini Live session error:", error);
                if (clientWs.readyState === WebSocket.OPEN) {
                  clientWs.send(
                    JSON.stringify({ error: "Gemini Live session error." })
                  );
                }
              },
              onclose: () => {
                console.log("Gemini Live session closed");
              },
            },
            config: connectConfig,
          }),
          connectTimeout,
        ]);

        sessionRef.current.sendClientContent({
          turns: [
            {
              role: "user",
              parts: [
                {
                  text: `Internal coach briefing loaded for this session. Use this as ground truth about the employee. Do not read this aloud. Do not respond verbally to this message.\n\n${employeeBriefing}`,
                },
              ],
            },
          ],
          turnComplete: false,
        });

        for (const payload of pendingMediaPayloads) {
          forwardToGemini(payload);
        }
        pendingMediaPayloads.length = 0;

        if (clientWs.readyState === WebSocket.OPEN) {
          clientWs.send(JSON.stringify({ ready: true, employeeId, sessionMode }));
          console.log(
            `Gemini Live session ready for ${sessionLabel} (${sessionMode})`
          );
        }
      } catch (err) {
        console.error("Failed to connect to Gemini Live:", err);
        if (clientWs.readyState === WebSocket.OPEN) {
          clientWs.send(
            JSON.stringify({
              error:
                err instanceof Error
                  ? err.message
                  : "Failed to connect to Gemini Live.",
            })
          );
          clientWs.close();
        }
      } finally {
        sessionStarting = false;
      }
    };

    clientWs.on("message", (data) => {
      try {
        const text = data.toString();
        const payload = JSON.parse(text);

        if (isStartPayload(payload)) {
          handlers.simulateScenario = parseSimulateScenario(payload.scenario);
          const { employeeId, sessionMode } = resolveSessionStart(
            payload.employeeId,
            parseSessionMode(payload.sessionMode)
          );
          if (!isValidSessionStart(employeeId, sessionMode)) {
            clientWs.send(
              JSON.stringify({ error: "Invalid session configuration." })
            );
            clientWs.close();
            return;
          }
          startReceived = true;
          clearTimeout(startTimeout);
          const contextSnapshot = resolveContextSnapshot(payload.contextSnapshot);
          void startGeminiSession(employeeId, sessionMode, contextSnapshot);
          return;
        }
      } catch {
        // Not JSON control message — fall through to media forwarding.
      }

      if (!sessionRef.current) {
        pendingMediaPayloads.push(data.toString());
        return;
      }
      forwardToGemini(data);
    });

    clientWs.on("close", () => {
      clearTimeout(startTimeout);
      console.log("Client disconnected");
      sessionRef.current?.close();
      sessionRef.current = null;
    });
    });
  } else if (!webSocket) {
    app.all("/live", (_req, res) => {
      res.status(503).json({
        error:
          "Rehearsal WebSocket is not available on this host. Use manager copilot, skill paths, or freeform explore, or run the app locally / on a Node server with WebSocket support.",
      });
    });
  }

  if (useVite) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  return { app, server };
}

function shouldStartStandaloneServer(): boolean {
  if (process.env.VERCEL) return false;
  const entry = process.argv[1] ?? "";
  return /server\.(ts|cjs|js)$/.test(entry);
}

if (shouldStartStandaloneServer()) {
  void createApp({
    listen: true,
    webSocket: true,
    useVite: process.env.NODE_ENV !== "production",
  });
}
