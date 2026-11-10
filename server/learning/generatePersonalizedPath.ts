import type { GoogleGenAI } from "@google/genai";
import type { Response } from "express";
import { buildLearnerEmployeeContextSection } from "../../src/data/agent-context/learningEmployeeContext.ts";
import { buildEmployeeMarkdown } from "../../src/data/agent-context/buildEmployeeMarkdown.ts";
import { learningCatalog } from "../../src/learning/catalog.ts";
import type { LearningSpec } from "../../src/learning/catalog.ts";
import { parseModelSpec } from "../../src/learning/parseModelSpec.ts";
import { voiceDnaPromptBlock } from "../../src/data/skills/voiceStyle.ts";
import { GEMINI_TEXT_MODEL } from "../../src/data/liveModel.ts";
import { researchPathTopic } from "./researchPathTopic.ts";

export type PersonalizedPathRequest = {
  topicId?: string;
  topicTitle?: string;
  answers?: string[];
  summary?: string;
  employeeMd?: string;
};

function buildPersonalizedPrompt(
  topicTitle: string,
  answers: string[],
  summary: string,
  employeeMd: string,
  researchNotes: string
): string {
  const profileBlock = employeeMd.trim()
    ? `\n\n${buildLearnerEmployeeContextSection(employeeMd)}\n`
    : "";
  const catalogPrompt = learningCatalog.prompt({
    system:
      "You output a json-render LearningSpec for a personalized 5-slide learning path plus a knowledge check.",
    customRules: [
      "Return a single flat JSON object with root and elements.",
      "Root element type must be LearningPath.",
      "children on LearningPath must list exactly 6 keys in order: intro, slide-1, slide-2, slide-3, slide-4, knowledge-check.",
      "intro: IntroSlide with personalized title and subtitle based on learner answers.",
      "slide-1 through slide-4: GeneratedSlide with title (string), body (string), bullets (optional string array, 2-4 items).",
      "knowledge-check: KnowledgeCheckSlide with question (string), choices (array of exactly 4 strings), correctIndex (integer 0-3), and explanation (string, one sentence shown only after a correct selection).",
      "Write original teaching copy tailored to the learner's answers. Keep each slide focused and scannable.",
      "Every learner-visible string is English. Do not write another language.",
      "When web research notes are provided below, treat them as authoritative for current product facts—prefer them over stale training knowledge.",
      "The knowledge check is multiple choice. One choice is clearly correct from the slides. The other three are plausible and wrong. Do not use 'all of the above'.",
      "Do not use Canvas, Callout, BulletList, Steps, Compare, PromptList, Figure, Diagram, Matrix2x2, MetricChart, Accordion, or Choice in this path. Slides stay IntroSlide, GeneratedSlide, and KnowledgeCheckSlide.",
    ],
  });

  return `${catalogPrompt}

${voiceDnaPromptBlock("written")}
${profileBlock}
Topic: ${topicTitle}

Use the intake answers as the primary signal. Use employee.md only when it improves examples. Do not over-index on job title or tools unless the learner brought them up.

Learner personalization summary: ${summary}

Answer 1 (prior knowledge): ${answers[0] ?? ""}
Answer 2 (goals): ${answers[1] ?? ""}
${
  researchNotes.trim()
    ? `

## Web research (current facts — use for slide content)

${researchNotes.trim()}`
    : ""
}

Example shape:
{
  "root": "path-root",
  "elements": {
    "path-root": {
      "type": "LearningPath",
      "props": { "title": "Your ${topicTitle} path" },
      "children": ["intro", "slide-1", "slide-2", "slide-3", "slide-4", "knowledge-check"]
    },
    "intro": {
      "type": "IntroSlide",
      "props": { "title": "...", "subtitle": "..." }
    },
    "slide-1": {
      "type": "GeneratedSlide",
      "props": { "title": "...", "body": "...", "bullets": ["...", "..."] }
    },
    "knowledge-check": {
      "type": "KnowledgeCheckSlide",
      "props": {
        "question": "...",
        "choices": ["...", "...", "...", "..."],
        "correctIndex": 0,
        "explanation": "..."
      }
    }
  }
}`;
}

function fallbackPersonalizedSpec(topicTitle: string, summary: string): LearningSpec {
  return {
    root: "path-root",
    elements: {
      "path-root": {
        type: "LearningPath",
        props: { title: `Your ${topicTitle} path` },
        children: ["intro", "slide-1", "slide-2", "slide-3", "slide-4", "knowledge-check"],
      },
      intro: {
        type: "IntroSlide",
        props: {
          title: topicTitle,
          subtitle: summary || "Built from your intake answers.",
        },
      },
      "slide-1": {
        type: "GeneratedSlide",
        props: {
          title: "Start here",
          body: `We'll cover ${topicTitle} at the depth you picked.`,
          bullets: ["Core concepts", "Examples you can use"],
        },
      },
      "slide-2": {
        type: "GeneratedSlide",
        props: {
          title: "Key ideas",
          body: "The ideas that matter most for your goal.",
          bullets: ["Foundation", "Patterns to recognize"],
        },
      },
      "slide-3": {
        type: "GeneratedSlide",
        props: {
          title: "In practice",
          body: "How this shows up when you use it at work.",
          bullets: ["Try this next", "Watch for this"],
        },
      },
      "slide-4": {
        type: "GeneratedSlide",
        props: {
          title: "Next steps",
          body: "Where to go after you finish this path.",
          bullets: ["Keep practicing", "Apply it this week"],
        },
      },
      "knowledge-check": {
        type: "KnowledgeCheckSlide",
        props: {
          question: `Which step best matches how to use ${topicTitle} after this path?`,
          choices: [
            "Apply the main idea from the slides to a real task",
            "Skip practice and rely on memory alone",
            "Ignore the examples and switch tools",
            "Treat the slides as optional background",
          ],
          correctIndex: 0,
          explanation: `Use the main idea from ${topicTitle} on a real task.`,
        },
      },
    },
  };
}

function sanitizePersonalizedSpec(raw: unknown, topicTitle: string): LearningSpec | null {
  if (!raw || typeof raw !== "object") return null;
  const spec = raw as LearningSpec;
  if (!spec.root || !spec.elements?.[spec.root]) return null;

  const root = spec.elements[spec.root];
  if (root.type !== "LearningPath" || !Array.isArray(root.children)) return null;

  const allowedTypes = new Set([
    "IntroSlide",
    "GeneratedSlide",
    "KnowledgeCheckSlide",
  ]);

  for (const key of root.children) {
    const el = spec.elements[key];
    if (!el || !allowedTypes.has(el.type)) return null;
  }

  if (!root.props?.title) {
    root.props = { ...root.props, title: `Your ${topicTitle} path` };
  }

  return spec;
}

async function generatePersonalizedSpec(
  ai: GoogleGenAI,
  topicTitle: string,
  answers: string[],
  summary: string,
  employeeMd: string,
  researchNotes: string
): Promise<LearningSpec> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 50_000);
  try {
    const response = await ai.models.generateContent({
      model: GEMINI_TEXT_MODEL,
      contents: buildPersonalizedPrompt(
        topicTitle,
        answers,
        summary,
        employeeMd,
        researchNotes
      ),
      config: {
        responseMimeType: "application/json",
        abortSignal: controller.signal,
      },
    });

    const text = response.text?.trim() ?? "";
    const parsed = parseModelSpec(text);
    const sanitized = parsed ? sanitizePersonalizedSpec(parsed, topicTitle) : null;
    if (sanitized) return sanitized;

    return fallbackPersonalizedSpec(topicTitle, summary);
  } catch (err) {
    console.error("[learning] Personalized spec generation failed, using fallback:", err);
    return fallbackPersonalizedSpec(topicTitle, summary);
  } finally {
    clearTimeout(timer);
  }
}

export async function handlePersonalizedPathGenerate(
  ai: GoogleGenAI,
  body: PersonalizedPathRequest,
  res: Response
) {
  const topicTitle = typeof body.topicTitle === "string" ? body.topicTitle.trim() : "";
  const summary = typeof body.summary === "string" ? body.summary.trim() : "";
  const answers = Array.isArray(body.answers)
    ? body.answers.map((a) => (typeof a === "string" ? a.trim() : "")).slice(0, 2)
    : [];

  while (answers.length < 2) answers.push("");

  if (!topicTitle) {
    res.status(400).json({ error: "topicTitle is required." });
    return;
  }

  const employeeMd =
    typeof body.employeeMd === "string" && body.employeeMd.trim()
      ? body.employeeMd.trim()
      : buildEmployeeMarkdown();

  const started = Date.now();
  console.log(`[learning] Personalized path started: ${topicTitle}`);

  const { notes: researchNotes, sources: researchSources } = await researchPathTopic(
    ai,
    topicTitle,
    answers,
    summary
  );

  const spec = await generatePersonalizedSpec(
    ai,
    topicTitle,
    answers,
    summary,
    employeeMd,
    researchNotes
  );

  res.json({
    ...spec,
    pathResearchSources: researchSources.length > 0 ? researchSources : undefined,
  });
  console.log(`[learning] Personalized path ready in ${Date.now() - started}ms: ${topicTitle}`);
}
