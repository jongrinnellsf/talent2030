import type { GoogleGenAI } from "@google/genai";
import type { Response } from "express";
import { searchLearningContent } from "../../src/data/learning/searchLearningContent.ts";
import type { LearningSearchResult } from "../../src/data/learning/types.ts";
import { buildDeterministicSpec } from "../../src/learning/buildDeterministicSpec.ts";
import { learningCatalog } from "../../src/learning/catalog.ts";
import { parseModelSpec } from "../../src/learning/parseModelSpec.ts";
import {
  fallbackLearningSpec,
  sanitizeLearningSpec,
} from "../../src/learning/validateSpec.ts";
import type { LearningSpec } from "../../src/learning/catalog.ts";
import { voiceDnaPromptBlock } from "../../src/data/skills/voiceStyle.ts";

const GENERATE_MODEL = "gemini-2.5-flash";

function buildAssetCatalogPrompt(search: LearningSearchResult): string {
  const lines = search.hits.map((hit) => {
    const a = hit.asset;
    const ctx = hit.course?.title ?? a.sourceTitle;
    return `- ${a.id} (${a.kind}) · source: ${a.source} · ${a.title} · ${ctx}`;
  });
  return lines.join("\n");
}

function buildGeneratePrompt(goal: string, search: LearningSearchResult): string {
  const catalogPrompt = learningCatalog.prompt({
    system:
      "You output a json-render spec for a personalized learner path. Pull from LMS catalog and connected workplace systems.",
    customRules: [
      "Use SpecStream JSONL patches (one JSON object per line) OR a single flat JSON object with root and elements.",
      "Root element must be type LearningPath.",
      "Start with one IntroSlide (framing for this learner goal).",
      "Then sequence 4-8 slides using ContentBlock, VideoSlide, QuizSlide, SurveySlide.",
      "Mix sources when possible: lms, slack, gmail, meet, drive, calendar, asana, workday.",
      "Every asset slide must use assetId from the allowed list exactly.",
      "Never write quiz questions, survey prompts, or content body text except IntroSlide title/subtitle.",
      "IntroSlide title and subtitle are learner-visible: write them in the Voice DNA style below.",
      "children on LearningPath lists slide element keys in order.",
    ],
  });

  return `${catalogPrompt}

${voiceDnaPromptBlock("written")}

Learner goal: ${goal}

Content is drawn from the LMS (SCORM) and from Slack, Gmail, Google Meet, Google Drive, Calendar, Asana, and Workday.

Allowed asset IDs (use only these):
${search.allowedAssetIds.join("\n")}

Asset catalog:
${buildAssetCatalogPrompt(search)}

Example shape:
{
  "root": "path-root",
  "elements": {
    "path-root": {
      "type": "LearningPath",
      "props": { "title": "Your AI-forward path" },
      "children": ["intro", "slide-1"]
    },
    "intro": {
      "type": "IntroSlide",
      "props": { "title": "...", "subtitle": "..." }
    },
    "slide-1": {
      "type": "ContentBlock",
      "props": { "assetId": "ext-slack:ai-forward-channel" }
    }
  }
}`;
}

async function generateSpec(
  ai: GoogleGenAI,
  goal: string,
  search: LearningSearchResult
): Promise<LearningSpec> {
  const response = await ai.models.generateContent({
    model: GENERATE_MODEL,
    contents: buildGeneratePrompt(goal, search),
    config: {
      responseMimeType: "application/json",
    },
  });

  const text = response.text?.trim() ?? "";
  const parsed = parseModelSpec(text);
  const allowed = new Set(search.allowedAssetIds);

  if (parsed) {
    const sanitized = sanitizeLearningSpec(parsed, allowed);
    if (sanitized) return sanitized;
  }

  const deterministic = buildDeterministicSpec(goal, search);
  if (deterministic) return deterministic;

  return fallbackLearningSpec(
    parsed
      ? "We couldn't map that goal to catalog content. Try AI-forward work, prompting, or safe-use themes."
      : "The model returned a path we couldn't read. Try a shorter goal."
  );
}

function streamSpecProgressively(res: Response, spec: LearningSpec) {
  const rootKey = spec.root;
  const root = spec.elements[rootKey];
  const childKeys = root?.children ?? [];

  const send = (payload: object) => {
    res.write(`data: ${JSON.stringify(payload)}\n\n`);
  };

  const partialElements: LearningSpec["elements"] = {
    [rootKey]: {
      type: "LearningPath",
      props: root.props ?? {},
      children: [],
    },
  };

  send({ type: "start" });

  for (const childKey of childKeys) {
    partialElements[rootKey].children = [
      ...(partialElements[rootKey].children ?? []),
      childKey,
    ];
    const el = spec.elements[childKey];
    if (el) {
      partialElements[childKey] = el;
    }
    send({
      type: "spec",
      spec: { root: rootKey, elements: { ...partialElements } },
    });
  }

  send({ type: "done", spec });
  res.end();
}

export async function handleLearningGenerate(
  ai: GoogleGenAI,
  body: { goal?: string },
  res: Response
) {
  const goal = typeof body.goal === "string" ? body.goal.trim() : "";
  if (!goal) {
    res.status(400).json({ error: "goal is required" });
    return;
  }

  const search = searchLearningContent(goal);

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    const spec = await generateSpec(ai, goal, search);
    streamSpecProgressively(res, spec);
  } catch (err) {
    console.error("Learning generate failed:", err);
    if (!res.headersSent) {
      res.status(500).json({ error: "Failed to generate learning path." });
      return;
    }
    res.write(
      `data: ${JSON.stringify({
        type: "error",
        message: "Failed to generate learning path.",
      })}\n\n`
    );
    res.end();
  }
}
