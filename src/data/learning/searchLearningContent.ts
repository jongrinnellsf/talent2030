import { lmsCourses } from "../lms/courses";
import type { LmsCourse } from "../lms/types";
import { learningContentPool } from "./contentPool";
import type { LearningAsset, LearningSearchHit, LearningSearchResult } from "./types";

const STOP_WORDS = new Set([
  "a",
  "an",
  "the",
  "to",
  "for",
  "and",
  "or",
  "in",
  "on",
  "at",
  "be",
  "is",
  "are",
  "i",
  "my",
  "me",
  "want",
  "learn",
  "about",
  "how",
  "with",
  "using",
  "use",
  "get",
  "become",
]);

const GOAL_SYNONYMS: Record<string, string[]> = {
  "ai-forward": ["ai", "forward", "artificial", "intelligence", "tools", "copilot", "genai"],
  prompting: ["prompt", "prompts", "prompting", "write", "asks"],
  governance: ["safe", "safety", "responsible", "policy", "security", "privacy", "compliance"],
  workflow: ["work", "workflow", "job", "role", "daily"],
  fundamentals: ["basics", "fundamental", "intro", "introduction", "literacy"],
};

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOP_WORDS.has(t));
}

function expandTokens(tokens: string[]): Set<string> {
  const expanded = new Set(tokens);
  for (const token of tokens) {
    for (const [tag, synonyms] of Object.entries(GOAL_SYNONYMS)) {
      if (synonyms.some((s) => token.includes(s) || s.includes(token))) {
        expanded.add(tag);
      }
    }
    if (token.includes("ai")) expanded.add("ai-forward");
  }
  return expanded;
}

function scoreAsset(asset: LearningAsset, course: LmsCourse | undefined, queryTokens: Set<string>): number {
  let score = 0;
  const haystack = [
    asset.title,
    asset.sourceTitle,
    asset.packageLabel ?? "",
    course?.title ?? "",
    course?.summary ?? "",
    ...asset.tags,
    asset.kind === "content" ? asset.body : "",
    asset.kind === "video" ? asset.description : "",
  ]
    .join(" ")
    .toLowerCase();

  for (const token of queryTokens) {
    if (haystack.includes(token)) score += 2;
    if (asset.tags.includes(token)) score += 4;
    if (course && (course.tags.includes(token) || course.title.toLowerCase().includes(token))) {
      score += 3;
    }
  }

  if (queryTokens.has("ai-forward") && asset.tags.includes("ai-forward")) score += 3;

  if (asset.source !== "lms") score += 1;

  return score;
}

function pickWithSourceDiversity(hits: LearningSearchHit[], limit: number): LearningSearchHit[] {
  const picked: LearningSearchHit[] = [];
  const seenSources = new Set<string>();
  const seenIds = new Set<string>();

  for (const hit of hits) {
    if (picked.length >= limit) break;
    if (seenIds.has(hit.asset.id)) continue;
    const src = hit.asset.source;
    if (!seenSources.has(src) || picked.length < 3) {
      picked.push(hit);
      seenIds.add(hit.asset.id);
      seenSources.add(src);
    }
  }

  for (const hit of hits) {
    if (picked.length >= limit) break;
    if (seenIds.has(hit.asset.id)) continue;
    picked.push(hit);
    seenIds.add(hit.asset.id);
  }

  return picked;
}

export function searchLearningContent(goal: string, limit = 14): LearningSearchResult {
  const tokens = expandTokens(tokenize(goal));
  const hits: LearningSearchHit[] = [];

  const courseById = new Map(lmsCourses.map((c) => [c.id, c]));

  for (const asset of learningContentPool) {
    const course =
      asset.source === "lms" ? courseById.get(asset.courseId) : undefined;
    const score = scoreAsset(asset, course, tokens);
    if (score > 0) {
      hits.push({ asset, course, score });
    }
  }

  hits.sort((a, b) => b.score - a.score);

  let topHits = pickWithSourceDiversity(hits, limit);

  if (topHits.length === 0) {
    const fallback = learningContentPool
      .filter((a) => a.tags.includes("ai-forward"))
      .slice(0, limit)
      .map((asset) => ({
        asset,
        course: asset.source === "lms" ? courseById.get(asset.courseId) : undefined,
        score: 1,
      }));
    topHits = pickWithSourceDiversity(fallback, limit);
  }

  const courseIds = new Set(
    topHits.filter((h) => h.course).map((h) => h.course!.id)
  );
  const courses = lmsCourses.filter((c) => courseIds.has(c.id));

  return {
    goal,
    courses: courses.length > 0 ? courses : lmsCourses,
    hits: topHits,
    allowedAssetIds: topHits.map((h) => h.asset.id),
  };
}
