import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { GoogleGenAI, type LiveServerMessage, type Session } from "@google/genai";
import { PlayIcon, SpeakerLoudIcon, SpeakerOffIcon, StopIcon } from "@radix-ui/react-icons";
import {
  LIVE_INPUT_SAMPLE_RATE,
  LIVE_OUTPUT_SAMPLE_RATE,
  bufferToBase64,
  encodePcmToBuffer,
  resampleToRate,
} from "./audioUtils";
import { LearnerSessionVisualizer } from "../components/LearnerSessionVisualizer";
import { SessionControlToggle } from "../components/session/SessionControlToggle";
import { useAgentContext } from "../context/AgentContextProvider";
import {
  formatIntakePersonalizationDetail,
  liveCoachPhaseToActivityArea,
  summarizeTranscriptForActivity,
} from "../data/agent-context/employeeActivityLog";
import { useLearningSession } from "../context/LearningSessionContext";
import type { PersonalizationContext, LiveCoachPhase } from "../data/learning/learningSessionTypes";
import type { VoiceSessionRequest } from "../context/LearningSessionContext";
import { extractWebSearchSources, type WebSearchSource } from "./groundingSources";
import {
  buildCanvasMissingCoachSpeech,
  buildCanvasUpdatedCoachSpeech,
  buildPathPassCoachSpeech,
  buildPathReadyCoachSpeech,
  internalToolResponse,
} from "../data/learnerLivePrompt";
import { coachMessageIndicatesPass } from "./detectAssessmentPass";
import { mergeStreamingTranscript, polishFinishedTranscript } from "./transcriptMerge";
import {
  parseLeakedCompletePath,
  sanitizeCoachSpeech,
  stripLeakedToolCalls,
} from "./sanitizeCoachSpeech";

function coachHintForPhase(phase: string): string {
  switch (phase) {
    case "manager_coach":
      return "Ask about performance, leadership, your team, or how things work here.";
    case "freeform":
      return "Talk naturally. The canvas updates as you go.";
    case "intake":
      return "Answer out loud. Three tailored questions using your profile.";
    case "path":
      return "Advance slides on the canvas. Ask anything—coach can search the web for current facts.";
    case "assessment":
      return "Answer the knowledge check out loud.";
    case "generating":
      return "Researching sources and building your path…";
    case "complete":
      return "Path complete. Head back to paths or take another course.";
    default:
      return "Pick a path or explore freely with voice.";
  }
}

function buildReconnectRequest(
  phase: string,
  selectedTopic: { title: string } | null
): VoiceSessionRequest {
  if (phase === "manager_coach") {
    return { livePhase: "manager_coach" };
  }
  if (phase === "freeform" || phase === "select_topic") {
    return { livePhase: "freeform" };
  }
  if (!selectedTopic) {
    return { livePhase: "freeform" };
  }
  if (phase === "assessment") {
    return {
      topicTitle: selectedTopic.title,
      livePhase: "assessment",
      kickoffText: "I'm ready for the knowledge check.",
    };
  }
  if (phase === "path") {
    return {
      topicTitle: selectedTopic.title,
      livePhase: "path",
      kickoffText: buildPathReadyCoachSpeech(selectedTopic.title),
    };
  }
  return {
    topicTitle: selectedTopic.title,
    livePhase: "intake",
    kickoffText: `[The learner chose the "${selectedTopic.title}" path from the menu. Intake starts now—they have not answered any questions yet. Say you're getting into ${selectedTopic.title}, then ask question 1 about prior knowledge only. Do not say "sounds good" or treat this message as their answer.]`,
  };
}

export default function LiveLearnerApp() {
  const {
    applyLiveCanvas,
    generatePath,
    generatePersonalizedPath,
    markPathComplete,
    setIsLiveConnected,
    setCoachActivity,
    coachActivity,
    phase,
    goal,
    voiceSessionRequest,
    clearVoiceSessionRequest,
    sendCoachTextRef,
    stopLiveLearnerConversationRef,
    recordIntakeAnswer,
    selectedTopic,
    spec,
    startFreeform,
    managerCoachFocusEmployeeId,
  } = useLearningSession();
  const { employeeMarkdown, talentManagementMarkdown, logEmployeeActivity } = useAgentContext();

  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isMicActive, setIsMicActive] = useState(true);
  const [coachPlaying, setCoachPlaying] = useState(false);
  const [transcript, setTranscript] = useState<
    { role: "user" | "coach"; text: string; isFinished: boolean }[]
  >([]);
  const [webSearchSources, setWebSearchSources] = useState<WebSearchSource[]>([]);
  const [micAnalyser, setMicAnalyser] = useState<AnalyserNode | null>(null);
  const [coachAnalyser, setCoachAnalyser] = useState<AnalyserNode | null>(null);

  const sessionRef = useRef<Session | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const playbackCtxRef = useRef<AudioContext | null>(null);
  const coachOutputRef = useRef<AnalyserNode | null>(null);
  const nextStartTimeRef = useRef(0);
  const scheduledSourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const stoppingRef = useRef(false);
  const isConnectingRef = useRef(false);
  const isMicActiveRef = useRef(isMicActive);
  const phaseRef = useRef(phase);
  isMicActiveRef.current = isMicActive;
  phaseRef.current = phase;
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const coachResponseStartedRef = useRef(false);
  const userSpokeThisTurnRef = useRef(false);
  const programmaticTurnRef = useRef(false);
  const pendingRequestRef = useRef<VoiceSessionRequest | null>(null);
  const sessionLivePhaseRef = useRef<LiveCoachPhase>("freeform");
  const completePathHandledRef = useRef(false);
  const pendingPathCompletionRef = useRef<{
    feedback: string;
    takeaway?: string;
  } | null>(null);
  const canvasUpdatedThisTurnRef = useRef(false);
  const pathKickoffAttemptedRef = useRef<string | null>(null);
  const transcriptRef = useRef(transcript);
  const lastCanvasTopicRef = useRef<string | null>(null);
  transcriptRef.current = transcript;

  const flushPendingPathCompletion = useCallback(() => {
    const pending = pendingPathCompletionRef.current;
    if (!pending) return;
    pendingPathCompletionRef.current = null;
    markPathComplete(pending.feedback, pending.takeaway);
  }, [markPathComplete]);

  const commitTextTurn = useCallback((session: Session, text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    programmaticTurnRef.current = true;
    session.sendRealtimeInput({ text: trimmed });
    session.sendRealtimeInput({ audioStreamEnd: true });
  }, []);

  const sendCoachText = useCallback(
    (text: string) => {
      const session = sessionRef.current;
      if (!session) return;
      commitTextTurn(session, text);
    },
    [commitTextTurn]
  );

  useEffect(() => {
    sendCoachTextRef.current = sendCoachText;
    return () => {
      sendCoachTextRef.current = null;
    };
  }, [sendCoachText, sendCoachTextRef]);

  const beginCanvasUpdate = useCallback(() => {
    setCoachActivity({ phase: "updating_canvas", message: null });
  }, [setCoachActivity]);

  const markCoachResponding = useCallback(() => {
    coachResponseStartedRef.current = true;
    setCoachActivity({ phase: "idle", message: null });
  }, [setCoachActivity]);

  const clearCoachActivity = useCallback(() => {
    coachResponseStartedRef.current = false;
    setCoachActivity({ phase: "idle", message: null });
  }, [setCoachActivity]);

  const clearAudioQueue = useCallback(() => {
    for (const source of scheduledSourcesRef.current) {
      try {
        source.stop();
      } catch {
        /* already stopped */
      }
    }
    scheduledSourcesRef.current = [];
    nextStartTimeRef.current = 0;
    setCoachPlaying(false);
  }, []);

  const playAudioChunk = useCallback(
    (base64: string) => {
      const output = coachOutputRef.current;
      const ctx = playbackCtxRef.current;
      if (!output || !ctx) return;

      const binaryString = window.atob(base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const sampleCount = bytes.length / 2;
      const samples = new Float32Array(sampleCount);
      const view = new DataView(bytes.buffer);
      for (let i = 0; i < sampleCount; i++) {
        samples[i] = view.getInt16(i * 2, true) / 32768;
      }

      const buffer = ctx.createBuffer(1, sampleCount, LIVE_OUTPUT_SAMPLE_RATE);
      buffer.copyToChannel(samples, 0);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(output);
      const startAt = Math.max(ctx.currentTime, nextStartTimeRef.current);
      source.start(startAt);
      nextStartTimeRef.current = startAt + buffer.duration;
      scheduledSourcesRef.current.push(source);
      setCoachPlaying(true);
      source.onended = () => {
        scheduledSourcesRef.current = scheduledSourcesRef.current.filter((s) => s !== source);
        if (scheduledSourcesRef.current.length === 0) setCoachPlaying(false);
      };
    },
    []
  );

  const formatCoachTranscriptLine = useCallback((text: string, turnComplete: boolean) => {
    if (turnComplete) return polishFinishedTranscript(text);
    return stripLeakedToolCalls(text);
  }, []);

  const appendCoachText = useCallback((text: string, turnComplete?: boolean) => {
    setTranscript((prev) => {
      let next = prev;
      const last = prev[prev.length - 1];
      if (last?.role === "coach" && !last.isFinished) {
        const merged = mergeStreamingTranscript(last.text, text);
        const isFinished = Boolean(turnComplete);
        next = [
          ...prev.slice(0, -1),
          {
            role: "coach",
            text: formatCoachTranscriptLine(merged, isFinished),
            isFinished,
          },
        ];
      } else if (text) {
        const isFinished = Boolean(turnComplete);
        next = [
          ...prev,
          {
            role: "coach",
            text: formatCoachTranscriptLine(text, isFinished),
            isFinished,
          },
        ];
      } else if (turnComplete && last?.role === "coach" && !last.isFinished) {
        next = [
          ...prev.slice(0, -1),
          {
            ...last,
            text: polishFinishedTranscript(last.text),
            isFinished: true,
          },
        ];
      }

      if (turnComplete && phaseRef.current === "assessment" && !completePathHandledRef.current) {
        const lastCoach = [...next].reverse().find((line) => line.role === "coach" && line.isFinished);
        if (lastCoach) {
          const leaked = parseLeakedCompletePath(lastCoach.text);
          const spoken = sanitizeCoachSpeech(lastCoach.text);
          if (leaked || coachMessageIndicatesPass(spoken)) {
            completePathHandledRef.current = true;
            queueMicrotask(() =>
              markPathComplete(leaked?.feedback ?? spoken, leaked?.takeaway)
            );
          }
        }
      }

      return next;
    });
  }, [formatCoachTranscriptLine, markPathComplete]);

  const appendUserText = useCallback((text: string, turnComplete?: boolean) => {
    setTranscript((prev) => {
      const last = prev[prev.length - 1];
      if (last?.role === "user" && !last.isFinished) {
        const merged = mergeStreamingTranscript(last.text, text);
        const isFinished = Boolean(turnComplete);
        return [
          ...prev.slice(0, -1),
          {
            role: "user",
            text: isFinished ? polishFinishedTranscript(merged) : merged,
            isFinished,
          },
        ];
      }
      if (text) {
        const isFinished = Boolean(turnComplete);
        return [
          ...prev,
          {
            role: "user",
            text: isFinished ? polishFinishedTranscript(text) : text,
            isFinished,
          },
        ];
      }
      if (turnComplete && last?.role === "user" && !last.isFinished) {
        return [
          ...prev.slice(0, -1),
          {
            ...last,
            text: polishFinishedTranscript(last.text),
            isFinished: true,
          },
        ];
      }
      return prev;
    });
  }, []);

  const handleToolCalls = useCallback(
    (message: LiveServerMessage) => {
      const toolCall = message.toolCall;
      const session = sessionRef.current;
      if (!toolCall?.functionCalls?.length || !session) return;

      const livePhase = sessionLivePhaseRef.current;
      const isCanvasPhase =
        livePhase === "freeform" || livePhase === "manager_coach";
      const deferredPaths: string[] = [];

      const hasCanvasUpdate = toolCall.functionCalls.some(
        (call) => call.name === "update_learning_canvas"
      );
      if (hasCanvasUpdate && isCanvasPhase) {
        beginCanvasUpdate();
      }

      const functionResponses = toolCall.functionCalls.map((call) => {
        const name = call.name ?? "";
        const args = call.args ?? {};

        if (name === "update_learning_canvas") {
          if (!isCanvasPhase) {
            return {
              id: call.id,
              name,
              response: {
                output: internalToolResponse(
                  "Canvas updates are disabled during structured path mode."
                ),
              },
            };
          }
          const result = applyLiveCanvas(args);
          if (result.ok) {
            canvasUpdatedThisTurnRef.current = true;
            if (result.payload.topic) {
              lastCanvasTopicRef.current = result.payload.topic;
            }
          }
          return {
            id: call.id,
            name,
            response: {
              output: result.ok
                ? internalToolResponse(
                    "Canvas update succeeded. Speak 1–2 sentences out loud confirming what changed. Do not call tools again this turn."
                  )
                : internalToolResponse(
                    `Canvas update failed—learner still sees previous content: ${result.error}. Fix the payload and call again.`
                  ),
            },
          };
        }

        if (name === "build_learning_path") {
          if (livePhase !== "freeform") {
            return {
              id: call.id,
              name,
              response: {
                output: internalToolResponse("Tool disabled in structured path mode."),
              },
            };
          }
          const pathGoal =
            typeof args.goal === "string" && args.goal.trim() ? args.goal.trim() : goal;
          deferredPaths.push(pathGoal);
          return {
            id: call.id,
            name,
            response: {
              output: internalToolResponse(
                "Use update_learning_canvas with kind prompts for examples—not build_learning_path."
              ),
            },
          };
        }

        if (name === "finalize_intake") {
          if (sessionLivePhaseRef.current !== "intake") {
            return {
              id: call.id,
              name,
              response: {
                output: internalToolResponse("Intake already complete."),
              },
            };
          }

          const answer1 = typeof args.answer1 === "string" ? args.answer1.trim() : "";
          const answer2 = typeof args.answer2 === "string" ? args.answer2.trim() : "";
          const answer3 = typeof args.answer3 === "string" ? args.answer3.trim() : "";
          const summary = typeof args.summary === "string" ? args.summary.trim() : "";

          if (!answer1 || !answer2 || !answer3 || !summary) {
            return {
              id: call.id,
              name,
              response: {
                output: internalToolResponse(
                  "Missing answers or summary. Ask the learner for what is still missing—do not call finalize_intake again until you have all three topics."
                ),
              },
            };
          }

          const payload: PersonalizationContext = {
            answers: [answer1, answer2, answer3],
            summary,
          };

          const pathTitle = selectedTopic?.title ?? "learning path";
          logEmployeeActivity({
            area: "Learning path",
            action: `Finished intake: ${pathTitle}`,
            detail: formatIntakePersonalizationDetail(summary, payload.answers),
          });

          void generatePersonalizedPath(payload);

          return {
            id: call.id,
            name,
            response: {
              output: internalToolResponse(
                "Intake saved; personalized path is generating off-screen (canvas empty until ready). If you already told them you are building their path, stop speaking for this turn—do not repeat this message."
              ),
            },
          };
        }

        if (name === "complete_path") {
          if (phaseRef.current !== "assessment") {
            return {
              id: call.id,
              name,
              response: {
                output: internalToolResponse("Knowledge check is not active."),
              },
            };
          }

          const feedback =
            typeof args.feedback === "string" && args.feedback.trim()
              ? args.feedback.trim()
              : "You passed the knowledge check. Nice work.";
          const takeaway =
            typeof args.takeaway === "string" ? args.takeaway.trim() : undefined;

          completePathHandledRef.current = true;
          pendingPathCompletionRef.current = { feedback, takeaway };

          return {
            id: call.id,
            name,
            response: {
              output: internalToolResponse(
                "Pass recorded. Congratulate the learner out loud in this turn if you have not yet. Completion screen appears when this turn ends. Then stop."
              ),
            },
          };
        }

        return {
          id: call.id,
          name,
          response: { error: `Unknown function: ${name}` },
        };
      });

      session.sendToolResponse({ functionResponses });

      for (const pathGoal of deferredPaths) {
        void generatePath(pathGoal);
      }

      if (!coachResponseStartedRef.current) {
        setCoachActivity((prev) => {
          if (prev.phase === "updating_canvas") return prev;
          if (phaseRef.current === "generating") {
            return { phase: "processing", message: null };
          }
          if (isCanvasPhase && hasCanvasUpdate) {
            return prev;
          }
          if (isCanvasPhase) {
            return { phase: "processing", message: null };
          }
          return { phase: "processing", message: null };
        });
      }
    },
    [
      applyLiveCanvas,
      beginCanvasUpdate,
      generatePath,
      generatePersonalizedPath,
      goal,
      logEmployeeActivity,
      markPathComplete,
      selectedTopic,
      setCoachActivity,
    ]
  );

  const handleMessage = useCallback(
    (message: LiveServerMessage) => {
      if (message.toolCall) {
        void handleToolCalls(message);
      }

      const content = message.serverContent;
      if (!content) return;

      if (content.interrupted) {
        clearAudioQueue();
        clearCoachActivity();
      }

      if (content.inputTranscription?.text) {
        if (!programmaticTurnRef.current) {
          userSpokeThisTurnRef.current = true;
        }
        if (!programmaticTurnRef.current) {
          appendUserText(content.inputTranscription.text, false);
        }
      }
      if (content.outputTranscription?.text) {
        markCoachResponding();
        appendCoachText(content.outputTranscription.text, false);
      }

      const webSources = extractWebSearchSources(content.groundingMetadata);
      if (webSources.length > 0) {
        setWebSearchSources(webSources);
      }

      if (content.modelTurn?.parts) {
        for (const part of content.modelTurn.parts) {
          if (part.inlineData?.data) {
            markCoachResponding();
            playAudioChunk(part.inlineData.data);
          }
        }
      }

      if (content.turnComplete) {
        appendCoachText("", true);
        if (!programmaticTurnRef.current) {
          appendUserText("", true);
        }
        if (userSpokeThisTurnRef.current && phaseRef.current === "intake") {
          recordIntakeAnswer();
        }

        const coachSpokeThisTurn = coachResponseStartedRef.current;
        const pendingCompletion = pendingPathCompletionRef.current;
        const livePhase = sessionLivePhaseRef.current;
        const userSpokeThisTurn = userSpokeThisTurnRef.current;
        const canvasUpdatedThisTurn = canvasUpdatedThisTurnRef.current;

        if (pendingCompletion) {
          if (coachSpokeThisTurn) {
            flushPendingPathCompletion();
          } else {
            sendCoachText(buildPathPassCoachSpeech(pendingCompletion.feedback));
          }
        } else if (
          canvasUpdatedThisTurn &&
          !coachSpokeThisTurn &&
          (livePhase === "freeform" || livePhase === "manager_coach")
        ) {
          sendCoachText(buildCanvasUpdatedCoachSpeech());
        } else if (
          (livePhase === "freeform" || livePhase === "manager_coach") &&
          userSpokeThisTurn &&
          !canvasUpdatedThisTurn &&
          !programmaticTurnRef.current
        ) {
          sendCoachText(buildCanvasMissingCoachSpeech());
        }

        canvasUpdatedThisTurnRef.current = false;
        userSpokeThisTurnRef.current = false;
        programmaticTurnRef.current = false;
        if (coachResponseStartedRef.current) {
          clearCoachActivity();
        } else if (phaseRef.current === "generating") {
          setCoachActivity({ phase: "processing", message: null });
        } else if (userSpokeThisTurn && phaseRef.current === "freeform") {
          setCoachActivity((prev) =>
            prev.phase === "updating_canvas" ? prev : { phase: "processing", message: null }
          );
        }
      }
    },
    [
      appendCoachText,
      appendUserText,
      clearAudioQueue,
      clearCoachActivity,
      flushPendingPathCompletion,
      handleToolCalls,
      markCoachResponding,
      playAudioChunk,
      recordIntakeAnswer,
      sendCoachText,
      setCoachActivity,
    ]
  );

  const stopSession = useCallback(() => {
    const livePhase = sessionLivePhaseRef.current;
    const transcriptSummary = summarizeTranscriptForActivity(transcriptRef.current);
    const canvasNote = lastCanvasTopicRef.current;
    if (transcriptSummary || canvasNote) {
      const detailParts = [
        transcriptSummary,
        canvasNote ? `Last canvas: ${canvasNote}` : undefined,
      ].filter(Boolean);
      logEmployeeActivity({
        area: liveCoachPhaseToActivityArea(livePhase),
        action: "Voice session ended",
        detail: detailParts.join(" · "),
      });
    }

    stoppingRef.current = true;
    isConnectingRef.current = false;
    setIsConnected(false);
    setIsConnecting(false);
    setIsLiveConnected(false);
    setCoachPlaying(false);
    clearAudioQueue();
    setTranscript([]);
    setWebSearchSources([]);
    setConnectionError(null);
    clearCoachActivity();
    setMicAnalyser(null);
    setCoachAnalyser(null);
    coachOutputRef.current = null;
    sessionLivePhaseRef.current = "freeform";

    processorRef.current?.disconnect();
    processorRef.current = null;
    mediaStreamRef.current?.getTracks().forEach((t) => t.stop());
    mediaStreamRef.current = null;
    sessionRef.current?.close();
    sessionRef.current = null;
    void audioCtxRef.current?.close();
    void playbackCtxRef.current?.close();
    audioCtxRef.current = null;
    playbackCtxRef.current = null;
    lastCanvasTopicRef.current = null;
  }, [clearAudioQueue, clearCoachActivity, logEmployeeActivity, setIsLiveConnected]);

  useEffect(() => {
    stopLiveLearnerConversationRef.current = stopSession;
    return () => {
      stopLiveLearnerConversationRef.current = null;
    };
  }, [stopLiveLearnerConversationRef, stopSession]);

  const startSession = useCallback(
    async (request: VoiceSessionRequest) => {
      if (request.replaceExisting && (sessionRef.current || isConnectingRef.current)) {
        stopSession();
        await new Promise((resolve) => setTimeout(resolve, 200));
      }
      if (isConnectingRef.current || sessionRef.current) return;

      sessionLivePhaseRef.current = request.livePhase;
      setTranscript([]);
      setWebSearchSources([]);
      if (request.livePhase === "assessment") {
        completePathHandledRef.current = false;
      }

      setConnectionError(null);
      setIsConnecting(true);
      isConnectingRef.current = true;
      stoppingRef.current = false;

      try {
        const tokenRes = await fetch("/api/learning/live-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            topicTitle: request.topicTitle,
            phase: request.livePhase,
            employeeMd: employeeMarkdown,
            talentManagementMd: talentManagementMarkdown,
            focusEmployeeId: managerCoachFocusEmployeeId,
            knowledgeCheck: request.knowledgeCheck,
          }),
        });
        if (!tokenRes.ok) {
          const err = await tokenRes.json().catch(() => ({}));
          throw new Error(
            typeof err.error === "string" ? err.error : "Could not start voice session."
          );
        }
        const { token, model } = (await tokenRes.json()) as {
          token: string;
          model: string;
        };

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;

        const audioCtx = new AudioContext();
        await audioCtx.resume();
        audioCtxRef.current = audioCtx;

        const playbackCtx = new AudioContext();
        await playbackCtx.resume();
        playbackCtxRef.current = playbackCtx;
        const outputAnalyser = playbackCtx.createAnalyser();
        outputAnalyser.fftSize = 512;
        outputAnalyser.smoothingTimeConstant = 0.55;
        outputAnalyser.connect(playbackCtx.destination);
        coachOutputRef.current = outputAnalyser;
        setCoachAnalyser(outputAnalyser);
        nextStartTimeRef.current = 0;
        scheduledSourcesRef.current = [];

        const ai = new GoogleGenAI({
          apiKey: token,
          httpOptions: { apiVersion: "v1alpha" },
        });

        const session = await ai.live.connect({
          model: model ?? "gemini-3.1-flash-live-preview",
          callbacks: {
            onmessage: handleMessage,
            onerror: (e) => {
              console.error("Learner live error", e);
              setConnectionError("Voice session error. Try reconnecting.");
            },
            onclose: () => {
              if (!stoppingRef.current) stopSession();
            },
          },
        });

        sessionRef.current = session;

        const source = audioCtx.createMediaStreamSource(stream);
        const micAnalyserNode = audioCtx.createAnalyser();
        micAnalyserNode.fftSize = 512;
        micAnalyserNode.smoothingTimeConstant = 0.55;
        source.connect(micAnalyserNode);
        setMicAnalyser(micAnalyserNode);

        const processor = audioCtx.createScriptProcessor(4096, 1, 1);
        const silentGain = audioCtx.createGain();
        silentGain.gain.value = 0;
        processorRef.current = processor;
        micAnalyserNode.connect(processor);
        processor.connect(silentGain);
        silentGain.connect(audioCtx.destination);

        processor.onaudioprocess = (e) => {
          if (!isMicActiveRef.current || !sessionRef.current) return;
          const input = e.inputBuffer.getChannelData(0);
          const resampled = resampleToRate(input, audioCtx.sampleRate, LIVE_INPUT_SAMPLE_RATE);
          const pcm = encodePcmToBuffer(resampled);
          sessionRef.current.sendRealtimeInput({
            audio: {
              data: bufferToBase64(pcm),
              mimeType: `audio/pcm;rate=${LIVE_INPUT_SAMPLE_RATE}`,
            },
          });
        };

        setIsConnected(true);
        setIsLiveConnected(true);
        setIsConnecting(false);
        isConnectingRef.current = false;

        logEmployeeActivity({
          area: liveCoachPhaseToActivityArea(request.livePhase),
          action: "Voice session started",
          detail: request.topicTitle
            ? `Topic: ${request.topicTitle}`
            : `Mode: ${request.livePhase}`,
        });

        if (request.kickoffText?.trim()) {
          commitTextTurn(session, request.kickoffText);
        }
      } catch (err) {
        console.error(err);
        setConnectionError(
          err instanceof Error ? err.message : "Could not start voice session."
        );
        stopSession();
        setIsConnecting(false);
        isConnectingRef.current = false;
      }
    },
    [
      commitTextTurn,
      employeeMarkdown,
      talentManagementMarkdown,
      logEmployeeActivity,
      managerCoachFocusEmployeeId,
      handleMessage,
      setIsLiveConnected,
      stopSession,
    ]
  );

  useEffect(() => () => stopSession(), [stopSession]);

  useEffect(() => {
    if (phase === "rehearse" && (isConnected || isConnecting)) {
      stopSession();
    }
  }, [phase, isConnected, isConnecting, stopSession]);

  useEffect(() => {
    if (phase !== "complete" || !isConnected) return;
    setIsMicActive(false);
    const startedAt = Date.now();
    let timer = 0;
    const tick = () => {
      const elapsed = Date.now() - startedAt;
      if (!coachPlaying && elapsed >= 1500) {
        stopSession();
        return;
      }
      if (elapsed >= 12_000) {
        stopSession();
        return;
      }
      timer = window.setTimeout(tick, 250);
    };
    timer = window.setTimeout(tick, 400);
    return () => window.clearTimeout(timer);
  }, [phase, isConnected, coachPlaying, stopSession]);

  useEffect(() => {
    if (phase === "assessment") {
      completePathHandledRef.current = false;
      pendingPathCompletionRef.current = null;
    }
    if (phase === "intake" || phase === "select_topic") {
      pathKickoffAttemptedRef.current = null;
    }
  }, [phase]);

  /** Fallback if path UI is ready but live session is still on intake token. */
  useEffect(() => {
    if (phase !== "path" || !selectedTopic || !spec) return;

    const topicId = selectedTopic.id;
    if (pathKickoffAttemptedRef.current === topicId) return;

    const timer = window.setTimeout(() => {
      if (sessionLivePhaseRef.current === "path") {
        pathKickoffAttemptedRef.current = topicId;
        return;
      }
      pathKickoffAttemptedRef.current = topicId;
      void startSession({
        topicTitle: selectedTopic.title,
        livePhase: "path",
        replaceExisting: true,
        kickoffText: buildPathReadyCoachSpeech(selectedTopic.title),
      });
    }, 600);

    return () => window.clearTimeout(timer);
  }, [phase, spec, selectedTopic, startSession]);

  useEffect(() => {
    if (!voiceSessionRequest) return;
    if (voiceSessionRequest.livePhase === "path" && selectedTopic) {
      pathKickoffAttemptedRef.current = selectedTopic.id;
    }
    pendingRequestRef.current = voiceSessionRequest;
    clearVoiceSessionRequest();
    void startSession(voiceSessionRequest);
  }, [voiceSessionRequest, clearVoiceSessionRequest, startSession, selectedTopic]);

  useLayoutEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [transcript, webSearchSources]);

  const toggleConnection = () => {
    if (isConnected) {
      stopSession();
      return;
    }
    if (phase === "select_topic") {
      startFreeform();
      void startSession({ livePhase: "freeform" });
      return;
    }
    void startSession(buildReconnectRequest(phase, selectedTopic));
  };

  if (phase === "rehearse") {
    return null;
  }

  const showManualStart =
    phase === "select_topic" || phase === "freeform" || phase === "manager_coach";
  const coachLabel =
    phase === "manager_coach" ? "Manager copilot" : "Learning coach";

  return (
    <div className="live-learner panel">
      <div className="live-learner__header">
        <p className="section-label">{coachLabel}</p>
        <p className="live-learner__hint">{coachHintForPhase(phase)}</p>
      </div>

      {connectionError && (
        <p className="live-learner__error" role="alert">
          {connectionError}
        </p>
      )}

      <div
        className={`live-learner-voice-card${
          isConnected || isConnecting ? " live-learner-voice-card--live" : ""
        }`}
      >
        <LearnerSessionVisualizer
          isConnected={isConnected}
          isConnecting={isConnecting}
          isMicActive={isMicActive}
          coachPlaying={coachPlaying}
          micAnalyser={micAnalyser}
          coachAnalyser={coachAnalyser}
          coachActivity={coachActivity}
          pathGenerating={phase === "generating"}
        />

        <div className="live-learner-voice-card__actions">
          <button
            type="button"
            onClick={toggleConnection}
            disabled={isConnecting}
            className={`live-learner-voice-card__session-btn inline-flex items-center justify-center gap-1.5 disabled:opacity-50 ${
              isConnected ? "btn-danger" : "btn-primary"
            }`}
          >
            {isConnecting ? (
              "Connecting…"
            ) : isConnected ? (
              <>
                <StopIcon className="h-3.5 w-3.5" aria-hidden />
                End
              </>
            ) : (
              <>
                <PlayIcon className="h-3.5 w-3.5" aria-hidden />
                {showManualStart ? "Start voice" : "Reconnect"}
              </>
            )}
          </button>
          {isConnected && (
            <SessionControlToggle
              compact
              disabled={!isConnected}
              active={isMicActive}
              onClick={() => setIsMicActive((v) => !v)}
              activeIcon={<SpeakerLoudIcon className="h-4 w-4" />}
              inactiveIcon={<SpeakerOffIcon className="h-4 w-4" />}
              label={isMicActive ? "Mute microphone" : "Unmute microphone"}
            />
          )}
        </div>
      </div>

      {transcript.length > 0 && (
        <div className="live-learner__transcript transcript-scroll" aria-live="polite">
          {transcript.map((line, i) => (
            <p key={i} className={`live-learner__line live-learner__line--${line.role}`}>
              <span className="live-learner__role">
                {line.role === "user" ? "You" : "Coach"}
              </span>
              {line.text}
            </p>
          ))}
          <div ref={transcriptEndRef} className="live-learner__transcript-anchor" aria-hidden />
        </div>
      )}

      {webSearchSources.length > 0 && (
        <div className="live-learner__web-sources" aria-label="Web sources from Google Search">
          <p className="live-learner__web-sources-label">Web sources</p>
          <ul className="live-learner__web-sources-list">
            {webSearchSources.slice(0, 5).map((source) => (
              <li key={source.uri}>
                <a href={source.uri} target="_blank" rel="noopener noreferrer">
                  {source.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
