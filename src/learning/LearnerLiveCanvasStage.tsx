import { JSONUIProvider, Renderer } from "@json-render/react";
import { memo, useLayoutEffect, useMemo, useRef } from "react";
import type { LiveCanvasPayload } from "./liveCanvasTypes";
import { compileLiveCanvasSpec } from "./compileLiveCanvasSpec";
import { CANVAS_UPDATE_LOADING_MESSAGES } from "../data/learning/loadingMessages";
import { CanvasPendingHint } from "./components/CanvasPendingHint";
import { LearningCanvasChrome } from "./components/LearningCanvasChrome";
import { registry } from "./registry";

type LearnerLiveCanvasStageProps = {
  payload: LiveCanvasPayload;
  /** Bumps on each voice canvas update — triggers a brief highlight without extra React state. */
  updateVersion?: number;
  /** Coach is updating the live canvas (rotating status in the corner). */
  canvasPending?: boolean;
  canvasPendingMessages?: readonly string[];
};

function LearnerLiveCanvasStageInner({
  payload,
  updateVersion = 0,
  canvasPending = false,
  canvasPendingMessages,
}: LearnerLiveCanvasStageProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const spec = useMemo(() => compileLiveCanvasSpec(payload), [payload]);

  useLayoutEffect(() => {
    if (updateVersion === 0) return;
    const el = viewportRef.current;
    if (!el) return;
    el.classList.add("learner-live-canvas-stage__viewport--flash");
    const t = window.setTimeout(() => {
      el.classList.remove("learner-live-canvas-stage__viewport--flash");
    }, 120);
    return () => window.clearTimeout(t);
  }, [updateVersion]);

  return (
    <div className="learner-live-canvas-stage">
      <div ref={viewportRef} className="learner-live-canvas-stage__viewport panel">
        <CanvasPendingHint
          active={canvasPending}
          messages={
            canvasPending
              ? (canvasPendingMessages ?? CANVAS_UPDATE_LOADING_MESSAGES)
              : undefined
          }
        />
        <LearningCanvasChrome>
          <div className="learner-json-render" data-topic={payload.topic}>
            <JSONUIProvider registry={registry} initialState={{}}>
              <Renderer spec={spec} registry={registry} />
            </JSONUIProvider>
          </div>
        </LearningCanvasChrome>
      </div>
    </div>
  );
}

export const LearnerLiveCanvasStage = memo(LearnerLiveCanvasStageInner);
