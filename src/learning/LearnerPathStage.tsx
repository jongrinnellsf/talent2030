import { JSONUIProvider, Renderer } from "@json-render/react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import { useLearningSession } from "../context/LearningSessionContext";
import { getLearningAsset } from "../data/learning/contentPool";
import type { LearningSpec } from "./catalog";
import { PathLoadingSkeleton } from "../components/learning/PathLoadingSkeleton";
import {
  CANVAS_UPDATE_LOADING_MESSAGES,
  SLIDE_BUILD_LOADING_MESSAGES,
} from "../data/learning/loadingMessages";
import { CanvasPendingHint } from "./components/CanvasPendingHint";
import { LearningCanvasChrome } from "./components/LearningCanvasChrome";
import { PathResearchSourcesTooltip } from "./components/PathResearchSourcesTooltip";
import { registry } from "./registry";

type LearnerPathStageProps = {
  spec: LearningSpec;
  loading?: boolean;
  isGenerating?: boolean;
  canvasPending?: boolean;
  canvasPendingMessages?: readonly string[];
};

function getSlideKeys(spec: LearningSpec): string[] {
  const root = spec.elements[spec.root];
  return root?.children ?? [];
}

function getAssetIdFromElement(el: LearningSpec["elements"][string] | undefined): string | null {
  if (!el?.props || typeof el.props.assetId !== "string") return null;
  return el.props.assetId;
}

function getSlideLabel(
  el: LearningSpec["elements"][string] | undefined,
  index: number
): string {
  if (!el) return `Step ${index + 1}`;
  if (el.type === "IntroSlide") return "Intro";
  if (el.type === "GeneratedSlide" && typeof el.props.title === "string") {
    return el.props.title.slice(0, 24);
  }
  return (
    getLearningAsset(getAssetIdFromElement(el) ?? "")?.title?.slice(0, 24) ?? `Step ${index + 1}`
  );
}

function buildSlideSpec(
  spec: LearningSpec,
  slideKey: string
): LearningSpec | null {
  const el = spec.elements[slideKey];
  if (!el) return null;
  return {
    root: slideKey,
    elements: { [slideKey]: el },
  };
}

export function LearnerPathStage({
  spec,
  loading,
  isGenerating,
  canvasPending = false,
  canvasPendingMessages,
}: LearnerPathStageProps) {
  const { beginAssessment, pathResearchSources } = useLearningSession();
  const slideKeys = useMemo(() => getSlideKeys(spec), [spec]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex((prev) => {
      if (slideKeys.length === 0) return 0;
      if (isGenerating && slideKeys.length > 0) {
        return slideKeys.length - 1;
      }
      return Math.min(prev, slideKeys.length - 1);
    });
  }, [slideKeys.length, isGenerating]);

  const activeKey = slideKeys[activeIndex] ?? slideKeys[0];
  const activeSpec = activeKey ? buildSlideSpec(spec, activeKey) : null;
  const isLastSlide = activeIndex >= slideKeys.length - 1;

  const pathTitle =
    typeof spec.elements[spec.root]?.props?.title === "string"
      ? spec.elements[spec.root].props.title
      : null;

  const goPrev = useCallback(() => {
    setActiveIndex((i) => Math.max(0, i - 1));
  }, []);

  const goNext = useCallback(() => {
    setActiveIndex((i) => {
      if (i >= slideKeys.length - 1) {
        beginAssessment();
        return i;
      }
      return i + 1;
    });
  }, [beginAssessment, slideKeys.length]);

  return (
    <div className="learner-path-stage">
      <header className="learner-path-stage__header">
        <div className="learner-path-stage__header-copy">
          {pathTitle && <h2 className="learner-path-stage__title">{pathTitle}</h2>}
          <p className="learner-path-stage__meta">
            <span>
              Step {activeIndex + 1} of {slideKeys.length}
              {loading && " · Updating…"}
            </span>
            {pathResearchSources.length > 0 && (
              <>
                <span className="learner-path-stage__meta-sep" aria-hidden>
                  ·
                </span>
                <PathResearchSourcesTooltip sources={pathResearchSources} />
              </>
            )}
          </p>
        </div>
      </header>

      <div className="learner-path-stage__viewport panel">
        <CanvasPendingHint
          active={canvasPending}
          messages={
            canvasPending
              ? (canvasPendingMessages ?? CANVAS_UPDATE_LOADING_MESSAGES)
              : undefined
          }
        />
        <LearningCanvasChrome
          slideIndex={activeSpec ? activeIndex + 1 : undefined}
          slideTotal={activeSpec ? slideKeys.length : undefined}
        >
          {isGenerating && !activeSpec && (
            <PathLoadingSkeleton compact messages={SLIDE_BUILD_LOADING_MESSAGES} />
          )}
          <AnimatePresence mode="wait">
            {activeSpec && (
              <motion.div
                key={activeKey}
                className="learner-path-stage__slide"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              >
                <JSONUIProvider registry={registry} initialState={{}}>
                  <Renderer spec={activeSpec} registry={registry} />
                </JSONUIProvider>
              </motion.div>
            )}
          </AnimatePresence>
        </LearningCanvasChrome>
      </div>

      <footer className="learner-path-stage__footer">
        <div className="learner-path-stage__rail" role="tablist" aria-label="Path steps">
          {slideKeys.map((key, index) => {
            const el = spec.elements[key];
            const label = getSlideLabel(el, index);
            return (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={index === activeIndex}
                className={`learner-path-stage__dot${index === activeIndex ? " learner-path-stage__dot--active" : ""}${index < slideKeys.length - 1 && isGenerating ? "" : ""}`}
                title={label}
                onClick={() => setActiveIndex(index)}
              />
            );
          })}
        </div>
        <div className="learner-path-stage__nav">
          <button
            type="button"
            className="learner-path-stage__nav-btn"
            onClick={goPrev}
            disabled={activeIndex <= 0}
            aria-label="Previous step"
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="learner-path-stage__nav-btn"
            onClick={goNext}
            aria-label={isLastSlide ? "Start knowledge check" : "Next step"}
          >
            <ChevronRightIcon className="h-4 w-4" />
          </button>
        </div>
      </footer>
    </div>
  );
}
