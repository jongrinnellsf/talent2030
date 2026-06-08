import { PathLoadingSkeleton } from "../components/learning/PathLoadingSkeleton";
import {
  CANVAS_UPDATE_LOADING_MESSAGES,
  COACH_PROCESSING_LOADING_MESSAGES,
  PATH_GENERATION_LOADING_MESSAGES,
} from "../data/learning/loadingMessages";
import type { CoachActivity } from "../context/LearningSessionContext";
import { TopicPicker } from "../components/learning/TopicPicker";
import { IntakeStage } from "../components/learning/IntakeStage";
import { KnowledgeCheckStage } from "../components/learning/KnowledgeCheckStage";
import { CourseCompletionStage } from "../components/learning/CourseCompletionStage";
import { useLearningSession } from "../context/LearningSessionContext";
import type { LearningSpec } from "./catalog";
import { CanvasPendingHint } from "./components/CanvasPendingHint";
import { LearnerLiveCanvasStage } from "./LearnerLiveCanvasStage";
import { LearnerPathStage } from "./LearnerPathStage";
import { RehearseCanvasShell } from "./RehearseCanvasShell";

type LearningCanvasProps = {
  spec: LearningSpec | null;
  loading?: boolean;
  error?: string | null;
};

function canvasPendingMessages(coachActivity: CoachActivity): readonly string[] {
  return coachActivity.phase === "updating_canvas"
    ? CANVAS_UPDATE_LOADING_MESSAGES
    : COACH_PROCESSING_LOADING_MESSAGES;
}

function isCanvasPending(
  isLiveConnected: boolean,
  coachActivity: CoachActivity
): boolean {
  return (
    isLiveConnected &&
    (coachActivity.phase === "processing" || coachActivity.phase === "updating_canvas")
  );
}

function FreeformEmptyState({
  canvasPending,
  pendingMessages,
  managerCopilot,
}: {
  canvasPending: boolean;
  pendingMessages: readonly string[];
  managerCopilot?: boolean;
}) {
  return (
    <>
      <CanvasPendingHint
        active={canvasPending}
        messages={canvasPending ? pendingMessages : undefined}
        placement="center"
      />
      <p className="learning-canvas__status">
        {managerCopilot
          ? "Start talking. Ask about ratings, difficult conversations, 1:1s, a direct report, or leadership habits—the canvas updates as you go."
          : "Start talking. The canvas fills in as you learn. Try “how does our perf process work?” or “given my profile, what skills or knowledge should I focus on?”"}
      </p>
    </>
  );
}

export function LearningCanvas({ spec, loading, error }: LearningCanvasProps) {
  const {
    phase,
    isLiveConnected,
    liveCanvas,
    canvasUpdateVersion,
    canvasSyncError,
    coachActivity,
  } = useLearningSession();

  const canvasPending = isCanvasPending(isLiveConnected, coachActivity);
  const pendingMessages = canvasPendingMessages(coachActivity);

  if (error) {
    return (
      <div className="learning-canvas learning-canvas--error panel">
        <p className="learning-canvas__status">{error}</p>
      </div>
    );
  }

  if (phase === "rehearse") {
    return <RehearseCanvasShell />;
  }

  if (phase === "select_topic") {
    return (
      <div className="learning-canvas learning-canvas--empty panel">
        <TopicPicker />
      </div>
    );
  }

  if (phase === "freeform" || phase === "manager_coach") {
    if (liveCanvas) {
      return (
        <div className="learning-canvas">
          {canvasSyncError && isLiveConnected && (
            <p className="learning-canvas__banner learning-canvas__banner--warn" role="status">
              Canvas sync issue. Coach may retry. ({canvasSyncError})
            </p>
          )}
          <LearnerLiveCanvasStage
            payload={liveCanvas}
            updateVersion={canvasUpdateVersion}
            canvasPending={canvasPending}
            canvasPendingMessages={pendingMessages}
          />
        </div>
      );
    }

    return (
      <div className="learning-canvas learning-canvas--empty panel">
        <FreeformEmptyState
          canvasPending={canvasPending}
          pendingMessages={pendingMessages}
          managerCopilot={phase === "manager_coach"}
        />
      </div>
    );
  }

  if (phase === "intake") {
    return (
      <div className="learning-canvas learning-canvas--intake panel">
        <IntakeStage />
      </div>
    );
  }

  const pathLoading =
    phase === "generating" || (loading && !spec && phase !== "freeform");

  if (pathLoading) {
    return (
      <div className="learning-canvas learning-canvas--loading">
        <PathLoadingSkeleton
          messages={
            canvasPending ? pendingMessages : PATH_GENERATION_LOADING_MESSAGES
          }
        />
      </div>
    );
  }

  if (phase === "assessment") {
    return (
      <div className="learning-canvas learning-canvas--assessment panel">
        <KnowledgeCheckStage />
      </div>
    );
  }

  if (phase === "complete") {
    return (
      <div className="learning-canvas learning-canvas--complete panel">
        <CourseCompletionStage />
      </div>
    );
  }

  if (!spec?.root || !spec.elements?.[spec.root]) {
    return (
      <div className="learning-canvas learning-canvas--empty panel">
        <TopicPicker />
      </div>
    );
  }

  return (
    <div className="learning-canvas">
      {loading && (
        <p className="learning-canvas__banner" aria-live="polite">
          Updating your path…
        </p>
      )}
      <LearnerPathStage
        spec={spec}
        loading={loading}
        isGenerating={loading}
        canvasPending={canvasPending}
        canvasPendingMessages={pendingMessages}
      />
    </div>
  );
}
