import { getLearningAsset } from "../data/learning/contentPool";
import type { LearningSpec } from "./catalog";

const SLIDE_TYPES = new Set([
  "IntroSlide",
  "ContentBlock",
  "VideoSlide",
  "QuizSlide",
  "SurveySlide",
]);

const ASSET_TYPES = new Set(["ContentBlock", "VideoSlide", "QuizSlide", "SurveySlide"]);

export function sanitizeLearningSpec(
  raw: unknown,
  allowedAssetIds: Set<string>
): LearningSpec | null {
  if (!raw || typeof raw !== "object") return null;
  const spec = raw as LearningSpec;
  if (!spec.root || typeof spec.root !== "string" || !spec.elements) return null;

  const elements: LearningSpec["elements"] = {};
  const rootEl = spec.elements[spec.root];
  if (!rootEl || rootEl.type !== "LearningPath") return null;

  for (const [key, el] of Object.entries(spec.elements)) {
    if (!el || typeof el.type !== "string") continue;
    if (key === spec.root) {
      elements[key] = {
        type: "LearningPath",
        props: el.props ?? {},
        children: Array.isArray(el.children) ? el.children : [],
      };
      continue;
    }
    if (!SLIDE_TYPES.has(el.type)) continue;

    const props = { ...(el.props ?? {}) } as Record<string, unknown>;
    if (ASSET_TYPES.has(el.type)) {
      const assetId = props.assetId;
      if (typeof assetId !== "string" || !allowedAssetIds.has(assetId)) continue;
      const asset = getLearningAsset(assetId);
      if (!asset) continue;
      const expectedKind =
        el.type === "ContentBlock"
          ? "content"
          : el.type === "VideoSlide"
            ? "video"
            : el.type === "QuizSlide"
              ? "quiz"
              : "survey";
      if (asset.kind !== expectedKind) continue;
    }

    if (el.type === "IntroSlide") {
      if (typeof props.title !== "string" || !props.title.trim()) continue;
    }

    elements[key] = {
      type: el.type,
      props,
      children: Array.isArray(el.children) ? el.children : undefined,
    };
  }

  if (!elements[spec.root]) return null;

  const childKeys = elements[spec.root].children ?? [];
  elements[spec.root].children = childKeys.filter((k) => elements[k]);

  if ((elements[spec.root].children?.length ?? 0) === 0) return null;

  return { root: spec.root, elements };
}

export function fallbackLearningSpec(message: string): LearningSpec {
  return {
    root: "path",
    elements: {
      path: {
        type: "LearningPath",
        props: { title: "Learning path" },
        children: ["intro"],
      },
      intro: {
        type: "IntroSlide",
        props: {
          title: "We couldn't build a path",
          subtitle: message,
        },
      },
    },
  };
}
