import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type MutableRefObject,
  type ReactNode,
  type SetStateAction,
} from "react";
import type { LearningSpec } from "../learning/catalog";
import type {
  KnowledgeCheck,
  LearningPhase,
  LiveCoachPhase,
  PersonalizationContext,
} from "../data/learning/learningSessionTypes";
import type { PathTopic } from "../data/learning/pathTopics";
import type { LiveCanvasPayload } from "../learning/liveCanvasTypes";
import {
  parseLiveCanvasToolArgsWithResult,
  type ParseLiveCanvasResult,
} from "../learning/liveCanvasTypes";
import { extractKnowledgeCheckFromSpec } from "../lib/extractKnowledgeCheck";
import { deriveCompletionTakeaway } from "../lib/deriveCompletionTakeaway";
import { useOptionalAgentContext } from "./AgentContextProvider";
import {
  formatIntakePersonalizationDetail,
  learningPhaseLabel,
  learningPhaseToActivityArea,
} from "../data/agent-context/employeeActivityLog";
import { getDirectReport } from "../data/directReports";
import { buildPathReadyCoachSpeech } from "../data/learnerLivePrompt";
import { streamLearningPath } from "../lib/streamLearningPath";
import type { WebSearchSource } from "../lib/groundingSources";

export type CoachActivityPhase = "idle" | "processing" | "updating_canvas";

export type CoachActivity = {
  phase: CoachActivityPhase;
  message: string | null;
};

const IDLE_COACH_ACTIVITY: CoachActivity = { phase: "idle", message: null };

export type VoiceSessionRequest = {
  topicTitle?: string;
  livePhase: LiveCoachPhase;
  kickoffText?: string;
  replaceExisting?: boolean;
  knowledgeCheck?: {
    question: string;
    evaluationHints: string;
  };
};

type LearningSessionContextValue = {
  goal: string;
  setGoal: (goal: string) => void;
  phase: LearningPhase;
  selectedTopic: PathTopic | null;
  personalization: PersonalizationContext | null;
  knowledgeCheck: KnowledgeCheck | null;
  completionFeedback: string | null;
  completionTakeaway: string | null;
  intakeQuestionsAnswered: number;
  spec: LearningSpec | null;
  pathResearchSources: WebSearchSource[];
  liveCanvas: LiveCanvasPayload | null;
  isGenerating: boolean;
  canvasUpdateVersion: number;
  canvasSyncError: string | null;
  generateError: string | null;
  generatePath: (goalText?: string) => Promise<void>;
  generatePersonalizedPath: (input: PersonalizationContext) => Promise<void>;
  selectTopic: (topic: PathTopic) => void;
  startFreeform: () => void;
  startManagerCoach: (focusEmployeeId?: string | null) => void;
  startRehearse: () => void;
  managerCoachFocusEmployeeId: string | null;
  advancePhase: (next: LearningPhase) => void;
  recordIntakeAnswer: () => void;
  applyLiveCanvas: (toolArgs: unknown) => ParseLiveCanvasResult;
  isLiveConnected: boolean;
  setIsLiveConnected: (live: boolean) => void;
  coachActivity: CoachActivity;
  setCoachActivity: Dispatch<SetStateAction<CoachActivity>>;
  voiceSessionRequest: VoiceSessionRequest | null;
  clearVoiceSessionRequest: () => void;
  sendCoachTextRef: MutableRefObject<((text: string) => void) | null>;
  stopLiveLearnerConversationRef: MutableRefObject<(() => void) | null>;
  beginAssessment: () => void;
  markPathComplete: (feedback: string, takeaway?: string) => void;
  /** Stop voice + clear learner transcript; reset to topic picker. */
  returnToCoachHome: () => void;
};

const LearningSessionContext = createContext<LearningSessionContextValue | null>(null);

export function LearningSessionProvider({ children }: { children: ReactNode }) {
  const agentContext = useOptionalAgentContext();
  const [goal, setGoal] = useState("");
  const [phase, setPhase] = useState<LearningPhase>("select_topic");
  const [selectedTopic, setSelectedTopic] = useState<PathTopic | null>(null);
  const [personalization, setPersonalization] = useState<PersonalizationContext | null>(null);
  const [knowledgeCheck, setKnowledgeCheck] = useState<KnowledgeCheck | null>(null);
  const [completionFeedback, setCompletionFeedback] = useState<string | null>(null);
  const [completionTakeaway, setCompletionTakeaway] = useState<string | null>(null);
  const [intakeQuestionsAnswered, setIntakeQuestionsAnswered] = useState(0);
  const [spec, setSpec] = useState<LearningSpec | null>(null);
  const [pathResearchSources, setPathResearchSources] = useState<WebSearchSource[]>([]);
  const [liveCanvas, setLiveCanvas] = useState<LiveCanvasPayload | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [canvasUpdateVersion, setCanvasUpdateVersion] = useState(0);
  const [canvasSyncError, setCanvasSyncError] = useState<string | null>(null);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [coachActivity, setCoachActivity] = useState<CoachActivity>(IDLE_COACH_ACTIVITY);
  const [managerCoachFocusEmployeeId, setManagerCoachFocusEmployeeId] = useState<string | null>(
    null
  );
  const [voiceSessionRequest, setVoiceSessionRequest] = useState<VoiceSessionRequest | null>(
    null
  );
  const sendCoachTextRef = useRef<((text: string) => void) | null>(null);
  const stopLiveLearnerConversationRef = useRef<(() => void) | null>(null);
  const lastLoggedCanvasTopicRef = useRef<string | null>(null);
  const phaseRef = useRef<LearningPhase>(phase);
  phaseRef.current = phase;

  const clearVoiceSessionRequest = useCallback(() => {
    setVoiceSessionRequest(null);
  }, []);

  const selectTopic = useCallback((topic: PathTopic) => {
    setSelectedTopic(topic);
    setGoal(topic.title);
    setPhase("intake");
    setPersonalization(null);
    setKnowledgeCheck(null);
    setCompletionFeedback(null);
    setCompletionTakeaway(null);
    setIntakeQuestionsAnswered(0);
    setSpec(null);
    setPathResearchSources([]);
    setLiveCanvas(null);
    setGenerateError(null);
    setCanvasSyncError(null);
    lastLoggedCanvasTopicRef.current = null;
    agentContext?.logEmployeeActivity({
      area: "Learning path",
      action: `Started path: ${topic.title}`,
      detail: "Voice intake — three personalization questions.",
    });

    setVoiceSessionRequest({
      topicTitle: topic.title,
      livePhase: "intake",
      kickoffText: `[The learner chose the "${topic.title}" path from the menu. Intake starts now—they have not answered any questions yet. Say you're getting into ${topic.title}, then ask question 1 about prior knowledge only. Do not say "sounds good" or treat this message as their answer.]`,
      replaceExisting: true,
    });
  }, [agentContext]);

  const startFreeform = useCallback(() => {
    setSelectedTopic(null);
    setManagerCoachFocusEmployeeId(null);
    setPhase("freeform");
    setPersonalization(null);
    setKnowledgeCheck(null);
    setIntakeQuestionsAnswered(0);
    setSpec(null);
    setLiveCanvas(null);
    setGenerateError(null);
    setCanvasSyncError(null);
    lastLoggedCanvasTopicRef.current = null;
    agentContext?.logEmployeeActivity({
      area: "Explore",
      action: "Opened Explore freely",
      detail: "Voice + live canvas; open-ended learning topic.",
    });

    setVoiceSessionRequest({
      livePhase: "freeform",
      replaceExisting: true,
      kickoffText:
        "I'm exploring freely. Welcome me briefly, put a starter frame on the canvas for what I might ask, and ask what I want to learn.",
    });
  }, [agentContext]);

  const startRehearse = useCallback(() => {
    setSelectedTopic(null);
    setManagerCoachFocusEmployeeId(null);
    setPhase("rehearse");
    setPersonalization(null);
    setKnowledgeCheck(null);
    setSpec(null);
    setLiveCanvas(null);
    setGenerateError(null);
    setCanvasSyncError(null);
    agentContext?.logEmployeeActivity({
      area: "Rehearse",
      action: "Opened Rehearse with Mark",
      detail: "Meet-style rating delivery roleplay on Coach canvas.",
    });

    setVoiceSessionRequest(null);
    setCoachActivity(IDLE_COACH_ACTIVITY);
  }, [agentContext]);

  const returnToCoachHome = useCallback(() => {
    const leavingPhase = phaseRef.current;
    const pathTopic = selectedTopic?.title;

    stopLiveLearnerConversationRef.current?.();
    setPhase("select_topic");
    setSelectedTopic(null);
    setManagerCoachFocusEmployeeId(null);
    setSpec(null);
    setPathResearchSources([]);
    setLiveCanvas(null);
    setKnowledgeCheck(null);
    setCompletionFeedback(null);
    setCompletionTakeaway(null);
    setPersonalization(null);
    setIntakeQuestionsAnswered(0);
    setGoal("");
    setGenerateError(null);
    setCanvasSyncError(null);
    setIsGenerating(false);
    setVoiceSessionRequest(null);
    setCoachActivity(IDLE_COACH_ACTIVITY);
    lastLoggedCanvasTopicRef.current = null;

    if (agentContext && leavingPhase !== "select_topic") {
      agentContext.logEmployeeActivity({
        area: learningPhaseToActivityArea(leavingPhase),
        action: `Left ${learningPhaseLabel(leavingPhase)}`,
        detail: pathTopic ? `Topic: ${pathTopic}` : undefined,
      });
    }
  }, [agentContext, selectedTopic]);


  const startManagerCoach = useCallback((focusEmployeeId?: string | null) => {
    const focus = focusEmployeeId?.trim() || null;
    setSelectedTopic(null);
    setManagerCoachFocusEmployeeId(focus);
    setPhase("manager_coach");
    setPersonalization(null);
    setKnowledgeCheck(null);
    setIntakeQuestionsAnswered(0);
    setSpec(null);
    setLiveCanvas(null);
    setGenerateError(null);
    setCanvasSyncError(null);
    const focusName = focus ? getDirectReport(focus)?.name : null;
    lastLoggedCanvasTopicRef.current = null;

    agentContext?.logEmployeeActivity({
      area: "Manager copilot",
      action: "Opened Manager copilot",
      detail: focusName
        ? `May focus on ${focusName}; voice + canvas for planning and frameworks.`
        : "Voice + canvas for performance, leadership, and team questions.",
    });

    setVoiceSessionRequest({
      livePhase: "manager_coach",
      replaceExisting: true,
      kickoffText: focus
        ? `I'm using the manager copilot. I may have questions about the direct report in session focus or anything else about leading the team. Welcome me briefly and ask what I want to work on.`
        : "I'm using the manager copilot. Welcome me briefly and ask what I want to work on—performance, leadership, a direct report, or how our process works.",
    });
  }, [agentContext]);

  const advancePhase = useCallback((next: LearningPhase) => {
    setPhase(next);
  }, []);

  const recordIntakeAnswer = useCallback(() => {
    setIntakeQuestionsAnswered((count) => Math.min(count + 1, 3));
  }, []);

  const applyLiveCanvas = useCallback((toolArgs: unknown): ParseLiveCanvasResult => {
    const result = parseLiveCanvasToolArgsWithResult(toolArgs);
    if (result.ok === false) {
      console.warn("[learning] Canvas update rejected:", result.error, toolArgs);
      setCanvasSyncError(result.error);
      return result;
    }

    setLiveCanvas(result.payload);
    setSpec(null);
    setGenerateError(null);
    setCanvasSyncError(null);
    setCanvasUpdateVersion((v) => v + 1);
    if (phaseRef.current === "freeform" || phaseRef.current === "manager_coach") {
      setPhase(phaseRef.current);
    }
    if (result.payload.topic) {
      setGoal((prev) => prev || result.payload.topic);
    }

    const canvasPhase = phaseRef.current;
    if (
      agentContext &&
      (canvasPhase === "freeform" || canvasPhase === "manager_coach") &&
      result.payload.topic &&
      result.payload.topic !== lastLoggedCanvasTopicRef.current
    ) {
      lastLoggedCanvasTopicRef.current = result.payload.topic;
      agentContext.logEmployeeActivity({
        area: learningPhaseToActivityArea(canvasPhase),
        action: `Canvas updated: ${result.payload.topic}`,
        detail: result.payload.subtitle?.trim() || undefined,
      });
    }

    return result;
  }, [agentContext]);

  const generatePath = useCallback(async (goalText?: string) => {
    const trimmed = (goalText ?? goal).trim();
    if (!trimmed) {
      setGenerateError("Add a learning goal first.");
      return;
    }
    setGoal(trimmed);
    if (!isLiveConnected) {
      setLiveCanvas(null);
    }
    setIsGenerating(true);
    setGenerateError(null);

    await streamLearningPath(trimmed, {
      onSpec: (partial) => setSpec(partial),
      onDone: (final) => {
        setSpec(final);
        setIsGenerating(false);
      },
      onError: (message) => {
        setGenerateError(message);
        setIsGenerating(false);
      },
    });
  }, [goal, isLiveConnected]);

  const generatePersonalizedPath = useCallback(
    async (input: PersonalizationContext) => {
      if (!selectedTopic) {
        setGenerateError("Pick a topic first.");
        return;
      }

      setPersonalization(input);
      setPhase("generating");
      setPathResearchSources([]);
      setLiveCanvas(null);
      setIsGenerating(true);
      setGenerateError(null);

      try {
        const employeeMd = agentContext?.employeeMarkdown ?? "";

        const res = await fetch("/api/learning/generate-personalized-path", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            topicId: selectedTopic.id,
            topicTitle: selectedTopic.title,
            answers: input.answers,
            summary: input.summary,
            employeeMd,
          }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(
            typeof err.error === "string" ? err.error : "Could not build your path."
          );
        }

        const payload = (await res.json()) as LearningSpec & {
          pathResearchSources?: WebSearchSource[];
        };
        const { pathResearchSources: sources, ...fullSpec } = payload;
        const { contentSpec, knowledgeCheck: check } = extractKnowledgeCheckFromSpec(fullSpec);

        setPathResearchSources(Array.isArray(sources) ? sources : []);
        setSpec(contentSpec);
        setKnowledgeCheck(check);
        setPhase("path");
        setIsGenerating(false);
        setCoachActivity({ phase: "idle", message: null });

        agentContext?.logEmployeeActivity({
          area: "Learning path",
          action: `Path ready: ${selectedTopic.title}`,
          detail: formatIntakePersonalizationDetail(input.summary, input.answers),
        });

        setVoiceSessionRequest({
          topicTitle: selectedTopic.title,
          livePhase: "path",
          replaceExisting: true,
          kickoffText: buildPathReadyCoachSpeech(selectedTopic.title),
        });
      } catch (err) {
        setGenerateError(err instanceof Error ? err.message : "Could not build your path.");
        setPhase("intake");
        setIsGenerating(false);
      }
    },
    [selectedTopic, agentContext, setCoachActivity]
  );

  const beginAssessment = useCallback(() => {
    if (!knowledgeCheck || !selectedTopic) return;
    if (phaseRef.current === "assessment" || phaseRef.current === "complete") return;
    setPhase("assessment");

    agentContext?.logEmployeeActivity({
      area: "Learning path",
      action: `Started knowledge check: ${selectedTopic.title}`,
      detail: knowledgeCheck.question,
    });

    setVoiceSessionRequest({
      topicTitle: selectedTopic.title,
      livePhase: "assessment",
      replaceExisting: true,
      knowledgeCheck: {
        question: knowledgeCheck.question,
        evaluationHints: knowledgeCheck.evaluationHints,
      },
      kickoffText: [
        "I'm ready for the knowledge check. This is the final step. The course ends after this.",
        `Question on screen: "${knowledgeCheck.question}"`,
        `Evaluation hints (do not read aloud): ${knowledgeCheck.evaluationHints}`,
        `Expected answer shape (do not reveal): ${knowledgeCheck.expectedAnswer}`,
        "When I pass, call complete_path immediately. Do not offer a next section or more content.",
        "Read the question aloud now and listen for my spoken answer.",
      ].join(" "),
    });
  }, [agentContext, knowledgeCheck, selectedTopic]);

  const markPathComplete = useCallback(
    (feedback: string, takeaway?: string) => {
      if (!selectedTopic || phaseRef.current === "complete") return;
      const resolvedTakeaway = deriveCompletionTakeaway(
        takeaway,
        feedback,
        selectedTopic.title
      );
      setCompletionFeedback(feedback);
      setCompletionTakeaway(resolvedTakeaway);
      setPhase("complete");
      agentContext?.logEmployeeActivity({
        area: "Learning path",
        action: `Completed path: ${selectedTopic.title}`,
        detail: `Takeaway: ${resolvedTakeaway}. Coach pass note: ${feedback}`,
      });
    },
    [selectedTopic, agentContext]
  );


  const value = useMemo(
    () => ({
      goal,
      setGoal,
      phase,
      selectedTopic,
      personalization,
      knowledgeCheck,
      completionFeedback,
      completionTakeaway,
      intakeQuestionsAnswered,
      spec,
      pathResearchSources,
      liveCanvas,
      isGenerating,
      canvasUpdateVersion,
      canvasSyncError,
      generateError,
      generatePath,
      generatePersonalizedPath,
      selectTopic,
      startFreeform,
      startManagerCoach,
      startRehearse,
      managerCoachFocusEmployeeId,
      advancePhase,
      recordIntakeAnswer,
      applyLiveCanvas,
      isLiveConnected,
      setIsLiveConnected,
      coachActivity,
      setCoachActivity,
      voiceSessionRequest,
      clearVoiceSessionRequest,
      sendCoachTextRef,
      stopLiveLearnerConversationRef,
      beginAssessment,
      markPathComplete,
      returnToCoachHome,
    }),
    [
      goal,
      phase,
      selectedTopic,
      personalization,
      knowledgeCheck,
      completionFeedback,
      completionTakeaway,
      intakeQuestionsAnswered,
      spec,
      pathResearchSources,
      liveCanvas,
      isGenerating,
      canvasUpdateVersion,
      canvasSyncError,
      generateError,
      generatePath,
      generatePersonalizedPath,
      selectTopic,
      startFreeform,
      startManagerCoach,
      startRehearse,
      managerCoachFocusEmployeeId,
      advancePhase,
      recordIntakeAnswer,
      applyLiveCanvas,
      isLiveConnected,
      coachActivity,
      voiceSessionRequest,
      clearVoiceSessionRequest,
      beginAssessment,
      markPathComplete,
      returnToCoachHome,
    ]
  );

  return (
    <LearningSessionContext.Provider value={value}>
      {children}
    </LearningSessionContext.Provider>
  );
}

export function useLearningSession() {
  const ctx = useContext(LearningSessionContext);
  if (!ctx) {
    throw new Error("useLearningSession must be used within LearningSessionProvider");
  }
  return ctx;
}

export function useOptionalLearningSession() {
  return useContext(LearningSessionContext);
}
