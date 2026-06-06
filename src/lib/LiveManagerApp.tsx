import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { GoogleGenAI, type LiveServerMessage, type Session } from "@google/genai";
import { PlayIcon, SpeakerLoudIcon, SpeakerOffIcon, StopIcon } from "@radix-ui/react-icons";
import { AnimatePresence, motion } from "motion/react";
import { CoachMark } from "../components/CoachMark";
import { CoachSessionVisualizer } from "../components/CoachSessionVisualizer";
import { LiveCoachingToggle } from "../components/rehearse/LiveCoachingToggle";
import { AssessmentLoadingBanner } from "../components/rehearse/AssessmentLoadingBanner";
import { SavedAssessmentsPanel } from "../components/rehearse/SavedAssessmentsPanel";
import { SessionAssessmentPanel } from "../components/rehearse/SessionAssessmentPanel";
import { useAgentContext } from "../context/AgentContextProvider";
import { useCoachSession } from "../context/CoachSessionContext";
import { DEFAULT_EMPLOYEE_ID, getDirectReport } from "../data/directReports";
import { SIMULATE_SCENARIOS, type SimulateScenarioId } from "../data/simulateScenarios";
import { isRehearseMode } from "../data/sessionModes";
import {
  ChatMessage,
  HudCue,
  HudCueItem,
  SessionAssessment,
  SavedSessionAssessment,
  SessionMode,
  SessionActivity,
  TranscriptLine,
} from "../types";
import {
  encodePcmToBuffer,
  bufferToBase64,
  resampleToRate,
  LIVE_INPUT_SAMPLE_RATE,
  LIVE_OUTPUT_SAMPLE_RATE,
} from "./audioUtils";
import { summarizeTranscriptForActivity } from "../data/agent-context/employeeActivityLog";
import { formatSimulationAssessmentTitle } from "./formatAssessmentTitle";
import { mergeStreamingTranscript, polishFinishedTranscript } from "./transcriptMerge";

type LiveManagerAppProps = {
  employeeId: string;
  employeeName: string;
  sessionMode: SessionMode;
  simulateScenario?: SimulateScenarioId;
  autoStartSession?: boolean;
  sessionReady?: boolean;
  onSessionActiveChange?: (active: boolean) => void;
  onSessionActivityChange?: (activity: SessionActivity | null) => void;
  layout?: "default" | "studio" | "embedded";
};

const HUD_OBSERVER_INTERVAL_MS = 18_000;

function formatDurationMinutes(seconds: number | undefined): string {
  if (seconds == null || seconds < 60) return "under 1 min";
  const min = Math.round(seconds / 60);
  return min === 1 ? "1 min" : `${min} min`;
}

export default function LiveManagerApp({
  employeeId,
  employeeName,
  sessionMode,
  simulateScenario = "default",
  autoStartSession = false,
  sessionReady = true,
  onSessionActiveChange,
  onSessionActivityChange,
  layout = "default",
}: LiveManagerAppProps) {
  const { getContextSnapshot, logEmployeeActivity } = useAgentContext();
  const { config, updateConfig, stopRehearseSessionRef } = useCoachSession();
  const liveCoachingEnabled = config.liveCoachingEnabled;
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isMicActive, setIsMicActive] = useState(true);
  const [coachPlaying, setCoachPlaying] = useState(false);
  const [sessionStart, setSessionStart] = useState<Date | null>(null);
  const [elapsed, setElapsed] = useState("00:00");
  const [micAnalyser, setMicAnalyser] = useState<AnalyserNode | null>(null);
  const [coachAnalyser, setCoachAnalyser] = useState<AnalyserNode | null>(null);
  const [hudCues, setHudCues] = useState<HudCueItem[]>([]);
  const [sessionAssessment, setSessionAssessment] = useState<SessionAssessment | null>(null);
  const [sessionAssessmentTitle, setSessionAssessmentTitle] = useState<string>(
    "How to improve next time"
  );
  const [savedAssessments, setSavedAssessments] = useState<SavedSessionAssessment[]>([]);
  const [isAssessing, setIsAssessing] = useState(false);

  const employeePhotoUrl = useMemo(() => {
    const report = getDirectReport(employeeId);
    return report?.photoUrl ?? "/employees/markwebb.png";
  }, [employeeId]);

  const sessionRef = useRef<Session | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const playbackCtxRef = useRef<AudioContext | null>(null);
  const coachOutputRef = useRef<AnalyserNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const scheduledSourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const logContainerRef = useRef<HTMLDivElement>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const connectTimeoutRef = useRef<number | null>(null);
  const stoppingRef = useRef(false);
  const isConnectingRef = useRef(false);
  const isConnectedRef = useRef(isConnected);
  const sessionIdentityRef = useRef<{ sessionMode: SessionMode; employeeId: string } | null>(
    null
  );
  const employeeIdRef = useRef(employeeId);
  const sessionModeRef = useRef(sessionMode);
  const simulateScenarioRef = useRef(simulateScenario);
  const autoStartTriggeredRef = useRef(false);
  const hudQueueRef = useRef<HudCueItem[]>([]);
  const hudDisplayTimerRef = useRef<number | null>(null);
  const hudShowingRef = useRef(false);
  const hudVisibleRef = useRef<HudCueItem | null>(null);
  const liveCoachingEnabledRef = useRef(liveCoachingEnabled);
  const messagesRef = useRef<ChatMessage[]>([]);
  const hudObserverTimerRef = useRef<number | null>(null);
  const lastHudObserverAtRef = useRef(0);
  const assessedThisSessionRef = useRef(false);
  const endedDurationSecondsRef = useRef<number | undefined>(undefined);

  liveCoachingEnabledRef.current = liveCoachingEnabled;
  messagesRef.current = messages;

  const HUD_DUPLICATE_WINDOW_MS = 8_000;
  const HUD_MIN_DISPLAY_MS = 4_500;
  sessionModeRef.current = sessionMode;
  simulateScenarioRef.current = simulateScenario;
  employeeIdRef.current = employeeId;
  isConnectedRef.current = isConnected;

  const resetRehearseSession = () => {
    setHudCues([]);
    hudQueueRef.current = [];
    hudShowingRef.current = false;
    hudVisibleRef.current = null;
    if (hudDisplayTimerRef.current) {
      window.clearTimeout(hudDisplayTimerRef.current);
      hudDisplayTimerRef.current = null;
    }
    if (hudObserverTimerRef.current) {
      window.clearInterval(hudObserverTimerRef.current);
      hudObserverTimerRef.current = null;
    }
  };

  const buildTranscriptLines = (): TranscriptLine[] =>
    messagesRef.current
      .filter((message) => message.text.trim().length > 0)
      .map((message) => ({
        role: message.role,
        text: message.text,
      }));

  const transcriptActivitySummary = (): string | undefined =>
    summarizeTranscriptForActivity(
      buildTranscriptLines().map((line) => ({
        role: line.role === "manager" ? "coach" : "user",
        text: line.text,
        isFinished: true,
      }))
    );

  const fetchObserverHudCue = async () => {
    if (!liveCoachingEnabledRef.current || !isConnectedRef.current) return;
    if (sessionModeRef.current !== "rehearse") return;

    const transcript = buildTranscriptLines();
    if (transcript.length < 2) return;

    const now = Date.now();
    if (now - lastHudObserverAtRef.current < HUD_OBSERVER_INTERVAL_MS - 2000) return;
    lastHudObserverAtRef.current = now;

    try {
      const response = await fetch("/api/rehearse/hud-cue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: DEFAULT_EMPLOYEE_ID,
          scenarioId: simulateScenarioRef.current,
          transcript,
        }),
      });
      if (!response.ok) return;
      const data = (await response.json()) as { cue?: HudCue | null };
      if (data.cue?.text) {
        showHudCue(data.cue);
      }
    } catch {
      // Observer cues are best-effort during live rehearsal.
    }
  };

  const handleAssessSession = async () => {
    if (isAssessing || messages.length === 0) return;

    setIsAssessing(true);
    setConnectionError(null);

    try {
      const durationSeconds =
        endedDurationSecondsRef.current ??
        (sessionStart
          ? Math.round((Date.now() - sessionStart.getTime()) / 1000)
          : undefined);
      const response = await fetch("/api/rehearse/assess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: DEFAULT_EMPLOYEE_ID,
          scenarioId: simulateScenarioRef.current,
          transcript: buildTranscriptLines(),
          durationSeconds,
        }),
      });

      if (!response.ok) {
        throw new Error("Assessment failed");
      }

      const data = (await response.json()) as { assessment: SessionAssessment };
      const createdAt = Date.now();
      const title = formatSimulationAssessmentTitle(new Date(createdAt));
      const savedEntry: SavedSessionAssessment = {
        id: `${createdAt}-${Math.random().toString(36).slice(2, 8)}`,
        title,
        createdAt,
        assessment: data.assessment,
        scenarioId: simulateScenarioRef.current,
        employeeName,
      };

      setSavedAssessments((prev) => [savedEntry, ...prev]);
      setSessionAssessmentTitle(title);
      setSessionAssessment(data.assessment);
      assessedThisSessionRef.current = true;
      const scenario = SIMULATE_SCENARIOS[simulateScenarioRef.current];
      const transcriptNote = transcriptActivitySummary();
      logEmployeeActivity({
        area: "Rehearse",
        action: `Completed rehearsal with ${employeeName}`,
        detail: [
          `${scenario.title} · ${formatDurationMinutes(durationSeconds)}`,
          `Assessment: ${data.assessment.summary}`,
          transcriptNote,
        ]
          .filter(Boolean)
          .join(" · "),
      });
    } catch {
      setConnectionError("Could not assess the session. Try again in a moment.");
    } finally {
      setIsAssessing(false);
    }
  };

  const flushNextHudCue = () => {
    if (hudShowingRef.current) return;

    const next = hudQueueRef.current.shift();
    if (!next) return;

    hudShowingRef.current = true;
    hudVisibleRef.current = next;
    setHudCues([next]);

    if (hudDisplayTimerRef.current) {
      window.clearTimeout(hudDisplayTimerRef.current);
    }

    hudDisplayTimerRef.current = window.setTimeout(() => {
      hudShowingRef.current = false;
      hudVisibleRef.current = null;
      setHudCues([]);
      hudDisplayTimerRef.current = null;
      flushNextHudCue();
    }, HUD_MIN_DISPLAY_MS);
  };

  const showHudCue = (cue: HudCue) => {
    const now = Date.now();
    const trimmed = cue.text.trim();
    if (!trimmed) return;

    const isDuplicate = (item: HudCueItem) =>
      item.text === trimmed &&
      item.category === cue.category &&
      now - item.createdAt < HUD_DUPLICATE_WINDOW_MS;

    const visible = hudVisibleRef.current;
    if (visible && isDuplicate(visible)) return;
    if (hudQueueRef.current.some(isDuplicate)) return;

    hudQueueRef.current.push({
      text: trimmed,
      category: cue.category,
      id: `${now}-${Math.random().toString(36).slice(2, 8)}`,
      createdAt: now,
    });
    flushNextHudCue();
  };

  const finalizeOpenTranscriptLines = () => {
    setMessages((prev) =>
      prev.map((message) =>
        message.isFinished
          ? message
          : {
              ...message,
              text: polishFinishedTranscript(message.text),
              isFinished: true,
            }
      )
    );
  };

  useEffect(() => {
    onSessionActiveChange?.(isConnected);
  }, [isConnected, onSessionActiveChange]);

  useEffect(() => {
    if (!isConnected && !isConnecting) {
      onSessionActivityChange?.(null);
      return;
    }
    onSessionActivityChange?.({
      coachPlaying,
      isConnecting,
      elapsed,
    });
  }, [
    isConnected,
    isConnecting,
    coachPlaying,
    elapsed,
    onSessionActivityChange,
  ]);

  useEffect(() => {
    if (!isConnected || !liveCoachingEnabled || sessionMode !== "rehearse") {
      if (hudObserverTimerRef.current) {
        window.clearInterval(hudObserverTimerRef.current);
        hudObserverTimerRef.current = null;
      }
      return;
    }

    void fetchObserverHudCue();
    hudObserverTimerRef.current = window.setInterval(() => {
      void fetchObserverHudCue();
    }, HUD_OBSERVER_INTERVAL_MS);

    return () => {
      if (hudObserverTimerRef.current) {
        window.clearInterval(hudObserverTimerRef.current);
        hudObserverTimerRef.current = null;
      }
    };
  }, [isConnected, liveCoachingEnabled, sessionMode]);

  const handleRehearseMessage = (message: LiveServerMessage) => {
    const content = message.serverContent;
    if (!content) return;

    if (content.interrupted) {
      clearAudioQueue();
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last && last.role === "manager" && !last.isFinished) {
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
    }

    if (content.modelTurn?.parts) {
      for (const part of content.modelTurn.parts) {
        if (part.inlineData?.data) {
          playAudioChunk(part.inlineData.data);
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
      appendUserText(
        content.inputTranscription.text,
        content.inputTranscription.finished ?? false
      );
    }

    const joinedText = managerTextParts
      .reduce((acc, part) => mergeStreamingTranscript(acc, part), "")
      .trim();

    if (joinedText.length > 0) {
      appendManagerText(joinedText, false);
    }

    if (content.turnComplete) {
      appendManagerText("", true);
    }
  };

  useLayoutEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  useEffect(() => {
    if (!isConnected || !sessionStart) return;
    const tick = () => {
      const secs = Math.floor((Date.now() - sessionStart.getTime()) / 1000);
      const m = String(Math.floor(secs / 60)).padStart(2, "0");
      const s = String(secs % 60).padStart(2, "0");
      setElapsed(`${m}:${s}`);
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [isConnected, sessionStart]);

  const clearAudioQueue = () => {
    for (const source of scheduledSourcesRef.current) {
      try {
        source.stop();
      } catch {
        // Already stopped.
      }
    }
    scheduledSourcesRef.current = [];
    setCoachPlaying(false);
    if (playbackCtxRef.current) {
      nextStartTimeRef.current = playbackCtxRef.current.currentTime;
    }
  };

  const playAudioChunk = (base64: string) => {
    const output = coachOutputRef.current;
    if (!playbackCtxRef.current || !output) return;

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

    const ctx = playbackCtxRef.current;
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
      scheduledSourcesRef.current = scheduledSourcesRef.current.filter(
        (s) => s !== source
      );
      if (scheduledSourcesRef.current.length === 0) {
        setCoachPlaying(false);
      }
    };
  };

  const appendManagerText = (text: string, turnComplete?: boolean) => {
    setMessages((prev) => {
      const last = prev[prev.length - 1];
      if (last && last.role === "manager" && !last.isFinished) {
        const merged = mergeStreamingTranscript(last.text, text);
        const finished = turnComplete ?? last.isFinished;
        return [
          ...prev.slice(0, -1),
          {
            ...last,
            text: finished ? polishFinishedTranscript(merged) : merged,
            isFinished: finished,
          },
        ];
      }
      if (text) {
        const finished = Boolean(turnComplete);
        return [
          ...prev,
          {
            id: Date.now().toString() + Math.random(),
            role: "manager",
            text: finished ? polishFinishedTranscript(text) : text,
            isFinished: finished,
          },
        ];
      }
      if (turnComplete && last?.role === "manager" && !last.isFinished) {
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
  };

  const appendUserText = (text: string, finished?: boolean) => {
    setMessages((prev) => {
      const last = prev[prev.length - 1];
      if (last && last.role === "user" && !last.isFinished) {
        const merged = mergeStreamingTranscript(last.text, text);
        const isFinished = finished ?? last.isFinished;
        return [
          ...prev.slice(0, -1),
          {
            ...last,
            text: isFinished ? polishFinishedTranscript(merged) : merged,
            isFinished,
          },
        ];
      }
      const isFinished = Boolean(finished);
      return [
        ...prev,
        {
          id: Date.now().toString() + Math.random(),
          role: "user",
          text: isFinished ? polishFinishedTranscript(text) : text,
          isFinished,
        },
      ];
    });
  };

  const toggleMic = () => {
    const nextActive = !isMicActive;
    setIsMicActive(nextActive);
    if (!nextActive && sessionRef.current) {
      sessionRef.current.sendRealtimeInput({ audioStreamEnd: true });
    }
  };

  const toggleConnection = async () => {
    if (isConnected) {
      stopSession();
    } else {
      await startSession();
    }
  };

  const logEndedWithoutAssessment = (durationSeconds: number | undefined) => {
    if (sessionModeRef.current !== "rehearse" || assessedThisSessionRef.current) return;
    const scenario = SIMULATE_SCENARIOS[simulateScenarioRef.current];
    const transcriptNote = transcriptActivitySummary();
    logEmployeeActivity({
      area: "Rehearse",
      action: `Ended rehearsal with ${employeeName} (no assessment)`,
      detail: [
        `${scenario.title} · ${formatDurationMinutes(durationSeconds)}`,
        "Ended before assessment",
        transcriptNote,
      ]
        .filter(Boolean)
        .join(" · "),
    });
  };

  const startSession = async () => {
    if (isConnectedRef.current || isConnectingRef.current) return;

    if (messagesRef.current.some((m) => m.text.trim().length > 0)) {
      logEndedWithoutAssessment(endedDurationSecondsRef.current);
    }

    setConnectionError(null);
    setIsConnecting(true);
    isConnectingRef.current = true;
    stoppingRef.current = false;
    setMessages([]);
    endedDurationSecondsRef.current = undefined;
    assessedThisSessionRef.current = false;
    setSessionAssessment(null);
    resetRehearseSession();
    if (isRehearseMode(sessionModeRef.current)) {
      updateConfig({ liveCoachingEnabled: true });
    }

    connectTimeoutRef.current = window.setTimeout(() => {
      if (isConnectingRef.current) {
        setConnectionError("Connection timed out. Try again in a moment.");
        stopSession();
      }
    }, 20_000);

    try {
      const tokenRes = await fetch("/api/rehearse/live-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: DEFAULT_EMPLOYEE_ID,
          scenario: simulateScenarioRef.current,
          contextSnapshot: getContextSnapshot(),
        }),
      });
      if (!tokenRes.ok) {
        const err = await tokenRes.json().catch(() => ({}));
        throw new Error(
          typeof err.error === "string"
            ? err.error
            : "Could not start rehearsal session."
        );
      }

      const { token, model, employeeBriefing } = (await tokenRes.json()) as {
        token: string;
        model: string;
        employeeBriefing: string;
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
          onmessage: handleRehearseMessage,
          onerror: () => {
            setConnectionError("Voice session error. Try reconnecting.");
            stopSession();
          },
          onclose: () => {
            if (!stoppingRef.current) {
              if (isConnectingRef.current) {
                setConnectionError("Connection closed before session started.");
              }
              stopSession();
            }
          },
        },
      });

      sessionRef.current = session;

      session.sendClientContent({
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

      if (connectTimeoutRef.current) {
        clearTimeout(connectTimeoutRef.current);
        connectTimeoutRef.current = null;
      }

      startMediaProcessing(stream, audioCtx);

      isConnectingRef.current = false;
      isConnectedRef.current = true;
      setIsConnected(true);
      setIsConnecting(false);
      setSessionStart(new Date());

      if (sessionModeRef.current === "rehearse") {
        const scenario = SIMULATE_SCENARIOS[simulateScenarioRef.current];
        logEmployeeActivity({
          area: "Rehearse",
          action: `Started live rehearsal with ${employeeName}`,
          detail: `${scenario.title} — voice session with Mark (camera off).`,
        });
      }
    } catch (err) {
      console.error("Error starting rehearsal session", err);
      setIsConnecting(false);
      isConnectingRef.current = false;
      setConnectionError(
        err instanceof Error
          ? err.message
          : "Could not start rehearsal session."
      );
      stopSession();
    }
  };

  const stopSession = () => {
    if (sessionStart) {
      endedDurationSecondsRef.current = Math.round(
        (Date.now() - sessionStart.getTime()) / 1000
      );
    }

    stoppingRef.current = true;
    isConnectingRef.current = false;
    isConnectedRef.current = false;
    setIsConnected(false);
    setIsConnecting(false);
    setCoachPlaying(false);
    setSessionStart(null);
    setElapsed("00:00");
    setMicAnalyser(null);
    setCoachAnalyser(null);
    coachOutputRef.current = null;
    resetRehearseSession();
    setConnectionError(null);
    if (connectTimeoutRef.current) {
      clearTimeout(connectTimeoutRef.current);
      connectTimeoutRef.current = null;
    }
    clearAudioQueue();

    sessionRef.current?.close();
    sessionRef.current = null;
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
    if (playbackCtxRef.current) {
      playbackCtxRef.current.close();
      playbackCtxRef.current = null;
    }
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
  };

  const startMediaProcessing = (stream: MediaStream, audioCtx: AudioContext) => {
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
      const pcm = e.inputBuffer.getChannelData(0);
      const resampled = resampleToRate(
        pcm,
        audioCtx.sampleRate,
        LIVE_INPUT_SAMPLE_RATE
      );
      const pcmBuffer = encodePcmToBuffer(resampled);
      const base64Audio = bufferToBase64(pcmBuffer);
      sessionRef.current.sendRealtimeInput({
        audio: {
          data: base64Audio,
          mimeType: `audio/pcm;rate=${LIVE_INPUT_SAMPLE_RATE}`,
        },
      });
    };
  };

  const isMicActiveRef = useRef(isMicActive);
  isMicActiveRef.current = isMicActive;

  useEffect(() => {
    const nextIdentity = { sessionMode, employeeId };
    const prevIdentity = sessionIdentityRef.current;
    sessionIdentityRef.current = nextIdentity;

    if (prevIdentity !== null) {
      const identityChanged =
        prevIdentity.sessionMode !== sessionMode ||
        prevIdentity.employeeId !== employeeId;

      if (
        identityChanged &&
        (isConnectedRef.current || isConnectingRef.current)
      ) {
        stopSession();
        if (sessionReady && autoStartSession) {
          void startSession();
        }
      }
    }
  }, [sessionMode, employeeId, sessionReady]);

  useEffect(() => {
    if (
      autoStartSession &&
      sessionReady &&
      !autoStartTriggeredRef.current &&
      !isConnectedRef.current &&
      !isConnectingRef.current
    ) {
      autoStartTriggeredRef.current = true;
      void startSession();
    }
    if (!autoStartSession) {
      autoStartTriggeredRef.current = false;
    }
  }, [autoStartSession, sessionReady, isConnected, isConnecting]);

  useEffect(() => {
    stopRehearseSessionRef.current = () => {
      if (isConnectedRef.current || isConnectingRef.current) {
        stopSession();
        return;
      }
      setMessages([]);
      setConnectionError(null);
      resetRehearseSession();
    };
    return () => {
      stopRehearseSessionRef.current = null;
    };
  }, [stopRehearseSessionRef]);

  const agentTranscriptLabel = employeeName;

  const isStudio = layout === "studio";
  const isEmbedded = layout === "embedded";
  const canAssessSession =
    !isConnected && !isConnecting && messages.length > 0;
  const rootClass = isEmbedded
    ? "coach-embedded__panel"
    : isStudio
      ? "coach-studio__panel panel min-h-0"
      : "panel overflow-hidden";
  const gridClass = isEmbedded
    ? "coach-embedded__grid"
    : isStudio
      ? "coach-studio__grid"
      : "flex min-h-[440px] flex-col gap-0 md:flex-row";
  const stageClass = isEmbedded
    ? "coach-embedded__stage"
    : isStudio
      ? "coach-studio__stage"
      : "flex min-h-0 min-w-0 flex-1 flex-col border-b border-[var(--border-default)] md:border-b-0 md:border-r";
  const transcriptClass = isEmbedded
    ? "coach-embedded__transcript"
    : isStudio
      ? "coach-studio__transcript"
      : "flex w-full flex-col md:w-[340px]";

  return (
    <div className={rootClass}>
      {connectionError && (
        <div className="alert-error mx-5 mt-4 px-4 py-2.5 text-sm">{connectionError}</div>
      )}

      <div className={gridClass}>
        <section className={stageClass}>
          <div className="coach-studio__stage-toolbar">
            <LiveCoachingToggle
              enabled={liveCoachingEnabled}
              onChange={(enabled) => updateConfig({ liveCoachingEnabled: enabled })}
            />
          </div>
          <CoachSessionVisualizer
            isConnected={isConnected}
            isConnecting={isConnecting}
            isMicActive={isMicActive}
            coachPlaying={coachPlaying}
            micAnalyser={micAnalyser}
            coachAnalyser={coachAnalyser}
            employeeName={employeeName}
            employeePhotoUrl={employeePhotoUrl}
            variant={isStudio || isEmbedded ? "studio" : "default"}
            awaitingSelection={false}
            hudCues={hudCues}
            liveCoachingEnabled={liveCoachingEnabled}
          />

          <div className="coach-studio__controls">
            <div className="coach-studio__controls-primary">
              <button
                onClick={toggleConnection}
                disabled={isConnecting || (!isConnected && !sessionReady)}
                className={`inline-flex items-center gap-2 px-6 py-3 disabled:opacity-50 ${
                  isConnected ? "btn-danger" : "btn-primary"
                }`}
              >
                {isConnecting ? (
                  "Connecting…"
                ) : isConnected ? (
                  <>
                    <StopIcon className="h-3.5 w-3.5" />
                    End
                  </>
                ) : !sessionReady ? (
                  "Start session"
                ) : (
                  <>
                    <PlayIcon className="h-3.5 w-3.5" />
                    Start session
                  </>
                )}
              </button>
              {canAssessSession && (
                <button
                  type="button"
                  onClick={() => void handleAssessSession()}
                  disabled={isAssessing}
                  aria-busy={isAssessing}
                  className="btn-secondary inline-flex items-center gap-2 px-4 py-3 text-[0.8125rem] disabled:opacity-50"
                >
                  {isAssessing ? (
                    <>
                      <span className="assess-session-btn__spinner" aria-hidden />
                      Assessing…
                    </>
                  ) : (
                    "Assess session"
                  )}
                </button>
              )}
              {isAssessing && (
                <StatusChip label="Assessing" variant="pending" />
              )}
              {isConnected && (
                <span className="font-mono text-xs tabular-nums text-[var(--text-muted)]">
                  {elapsed}
                </span>
              )}
              <StatusChip
                label={isConnected ? "Live" : isConnecting ? "Connecting" : "Ready"}
                variant={isConnected ? "live" : isConnecting ? "pending" : "idle"}
              />
            </div>

            <div className="coach-studio__controls-secondary">
              <ControlToggle
                disabled={!isConnected}
                active={isMicActive}
                onClick={toggleMic}
                activeIcon={<SpeakerLoudIcon className="h-4 w-4" />}
                inactiveIcon={<SpeakerOffIcon className="h-4 w-4" />}
                label="Mic"
              />
            </div>
          </div>
        </section>

        <aside className={transcriptClass}>
          <div className="coach-studio__transcript-header">
            <p className="section-label">Transcript</p>
            <p className="text-[0.8125rem] text-[var(--text-muted)]">
              {`Live dialog · ${employeeName}`}
            </p>
          </div>

          <div ref={logContainerRef} className="coach-studio__transcript-body transcript-scroll">
              <AnimatePresence mode="popLayout">
                {messages.length === 0 ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex h-full min-h-[160px] flex-col items-center justify-center px-4 text-center"
                  >
                    {isConnected ? (
                      <div className="note-coach w-full p-3.5 text-left">
                        <p className="text-[13px] font-medium text-[var(--text-primary)]">
                          Session active
                        </p>
                        <p className="mt-1 text-[13px] leading-relaxed text-[var(--text-muted)]">
                          Your lines and {employeeName}&apos;s responses appear here.
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1 py-6 text-center">
                        <div className="icon-tile mb-2 h-10 w-10 text-[var(--text-muted)]">
                          <CoachMark />
                        </div>
                        <p className="text-[13px] font-medium text-[var(--text-secondary)]">
                          No notes yet
                        </p>
                        <p className="max-w-[220px] text-[12px] leading-relaxed text-[var(--text-muted)]">
                          Start a session to begin capturing your delivery.
                        </p>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <div className="coach-studio__transcript-list">
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25 }}
                      className={
                        msg.role === "user" ? "note-user px-3.5 py-3" : "note-coach px-3.5 py-3"
                      }
                    >
                      <div className="mb-1 flex items-center justify-between gap-2">
                        <span
                          className={`font-mono text-[10px] font-medium uppercase tracking-wide ${
                            msg.role === "user"
                              ? "text-[var(--text-muted)]"
                              : "text-[var(--accent-brand)]"
                          }`}
                        >
                          {msg.role === "user" ? "You" : agentTranscriptLabel}
                        </span>
                        <span className="text-[10px] text-[var(--text-muted)]">
                          {msg.isFinished ? "Done" : "Live"}
                        </span>
                      </div>
                      <p className="text-[13px] leading-relaxed text-[var(--text-secondary)]">
                        {msg.text}
                        {!msg.isFinished && (
                          <span className="ml-0.5 inline-block h-3 w-0.5 animate-pulse bg-[var(--accent-brand)]" />
                        )}
                      </p>
                    </motion.div>
                  ))}
                  </div>
                )}
              </AnimatePresence>
              <div ref={transcriptEndRef} aria-hidden className="h-px shrink-0" />
          </div>
        </aside>
      </div>

      {sessionMode === "rehearse" && isAssessing && <AssessmentLoadingBanner />}

      {sessionMode === "rehearse" && savedAssessments.length > 0 && (
        <SavedAssessmentsPanel
          assessments={savedAssessments}
          onDismiss={(id) =>
            setSavedAssessments((prev) => prev.filter((entry) => entry.id !== id))
          }
          onExpand={(entry) => {
            setSessionAssessmentTitle(entry.title);
            setSessionAssessment(entry.assessment);
          }}
        />
      )}

      {sessionAssessment && (
        <SessionAssessmentPanel
          assessment={sessionAssessment}
          title={sessionAssessmentTitle}
          onClose={() => setSessionAssessment(null)}
        />
      )}
    </div>
  );
}

function StatusChip({
  label,
  variant,
}: {
  label: string;
  variant: "live" | "pending" | "idle";
}) {
  const variantClass =
    variant === "live"
      ? "badge--live"
      : variant === "pending"
        ? "badge--pending"
        : "badge--idle";

  return (
    <span className={`badge ${variantClass}`}>
      {variant === "live" && (
        <span className="status-live h-1.5 w-1.5 rounded-full bg-[var(--accent-live)]" />
      )}
      {variant === "pending" && (
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--accent-warning)]" />
      )}
      {label}
    </span>
  );
}

function ControlToggle({
  disabled,
  active,
  onClick,
  activeIcon,
  inactiveIcon,
  label,
}: {
  disabled: boolean;
  active: boolean;
  onClick: () => void;
  activeIcon: ReactNode;
  inactiveIcon: ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`control-btn ${active ? "control-btn--on" : ""}`}
    >
      {active ? activeIcon : inactiveIcon}
      {label}
    </button>
  );
}
