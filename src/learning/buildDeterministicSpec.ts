import type { LearningSearchResult } from "../data/learning/types";
import type { LearningSpec } from "./catalog";
import { sanitizeLearningSpec } from "./validateSpec";

function slideTypeForKind(
  kind: string
): "ContentBlock" | "VideoSlide" | "QuizSlide" | "SurveySlide" | null {
  switch (kind) {
    case "content":
      return "ContentBlock";
    case "video":
      return "VideoSlide";
    case "quiz":
      return "QuizSlide";
    case "survey":
      return "SurveySlide";
    default:
      return null;
  }
}

/** Build a valid path from search hits with source diversity when possible. */
export function buildDeterministicSpec(
  goal: string,
  search: LearningSearchResult
): LearningSpec | null {
  const allowed = new Set(search.allowedAssetIds);
  const children: string[] = ["intro"];
  const elements: LearningSpec["elements"] = {
    "path-root": {
      type: "LearningPath",
      props: {
        title: goal.length > 80 ? `${goal.slice(0, 77)}…` : goal || "Your learning path",
      },
      children,
    },
    intro: {
      type: "IntroSlide",
      props: {
        title: goal || "Your learning goal",
        subtitle: "A short sequence built for what you asked for.",
      },
    },
  };

  let slideIndex = 0;
  const seenIds = new Set<string>();
  const seenSources = new Set<string>();
  const orderedHits: typeof search.hits = [];

  for (const hit of search.hits) {
    if (seenIds.has(hit.asset.id)) continue;
    if (!seenSources.has(hit.asset.source)) {
      orderedHits.push(hit);
      seenIds.add(hit.asset.id);
      seenSources.add(hit.asset.source);
    }
  }
  for (const hit of search.hits) {
    if (seenIds.has(hit.asset.id)) continue;
    orderedHits.push(hit);
    seenIds.add(hit.asset.id);
  }

  for (const hit of orderedHits) {
    if (slideIndex >= 7) break;
    const { asset } = hit;
    if (!allowed.has(asset.id) || seenIds.has(asset.id)) continue;
    const slideType = slideTypeForKind(asset.kind);
    if (!slideType) continue;
    seenIds.add(asset.id);
    seenSources.add(asset.source);
    const key = `slide-${slideIndex}`;
    elements[key] = { type: slideType, props: { assetId: asset.id } };
    children.push(key);
    slideIndex += 1;
  }

  if (children.length < 2) return null;

  elements["path-root"].children = children;
  return sanitizeLearningSpec({ root: "path-root", elements }, allowed);
}
