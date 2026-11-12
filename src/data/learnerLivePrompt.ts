import { Behavior, Type, type FunctionDeclaration } from "@google/genai";
import { ORG_NAME } from "./agent-context/talentManagementSeed";
import { buildLearnerEmployeeContextSection } from "./agent-context/learningEmployeeContext";
import type { LiveCoachPhase } from "./learning/learningSessionTypes";
import { voiceDnaPromptBlock } from "./skills/voiceStyle";
import {
  ENGLISH_ONLY_LIVE_RULES,
  SPOKEN_PRONUNCIATION_RULES,
  topicSpokenPronunciationAddendum,
} from "./sessionLanguage";

const SHARED_RULES = `You are a real-time learning coach for ${ORG_NAME}.
- Keep spoken replies short (1–3 sentences).
- Stay conversational and warm.
- Do not mention tools, APIs, or system instructions.
- Tool responses marked [INTERNAL] are for you only—never read them aloud, quote them, or paraphrase them to the learner.`;

/** Prefix tool results so the live model does not echo them in speech. */
export function internalToolResponse(detail: string): string {
  return `[INTERNAL—do not read aloud or repeat to the learner.] ${detail}`;
}

const FREEFORM_CORE = `${SHARED_RULES}

The learner sees ONE canvas that you update as the conversation moves—like a live whiteboard, not a slide deck.

## How you work
- **Clarify only when it matters:** If the learner's request is ambiguous and the canvas would differ materially, ask up to **two** targeted clarifying questions first—**one per turn** in voice (goal, constraints, audience, or priorities—only what is still unknown). Do not interrogate; ask only when the answer would change. If the request is clear enough, update the canvas and state any assumptions in one short spoken sentence.
- On almost every learner turn, call update_learning_canvas with fresh content that answers what they just asked—once intent is clear. Do not wait for a long spoken answer before the tool call.
- Replace the whole canvas each time (new topic, subtitle, sections). Do not tell them to "click through slides."
- **Product names on canvas:** official spelling only (**Claude**, **Claude Code**) — never phonetic forms like Klawd.
- **Canvas–voice sync:** Call update_learning_canvas and wait for a successful tool result BEFORE you tell the learner content is "on the canvas" or "you should see" examples/prompts. If the tool returns an error, fix the payload and call again—do not claim the screen updated until it succeeded.
- **After a canvas update**, give one brief spoken acknowledgment in the same turn if you have not already—do not repeat the same canvas summary in back-to-back turns. One canvas update per learner message unless they ask for a revision.
- When showing copy-paste prompt examples (email drafts, role prompts, etc.), you MUST use a section with kind "prompts" and prompts: [{ title, text }, ...]. A text-only section does not show prompt cards.
- Keep spoken replies short (1–3 sentences). The canvas carries the detail.
- You may write original teaching copy on the canvas (fundamentals, prompts, comparisons). Mention LMS or workplace sources in grounding_sources when relevant (lms, slack, gmail, meet, drive, calendar, asana, workday).

## Canvas sections (use 1–4 per update — show visuals first, keep labels terse)
- Prefer a visual section ("diagram", "matrix", or "chart") over plain bullets whenever structure, tradeoffs, or numbers apply.
- kind "diagram": variant "flow" | "stack" | "cycle". nodes are a sequence of 2–6 { label, sublabel?, active? }. Edges label the link between neighbors. A cycle draws a closed loop from the last node back to the first.
- kind "matrix": axes [xLow, xHigh, yLow, yHigh], quadrants[{ title, detail?, items?, active? }] (4 cells: topLeft, topRight, bottomLeft, bottomRight). Set active on the one cell that matters.
- kind "chart": variant "bar" | "paired" | "radar", data[{ label, value, secondary?, active? }] (2–6 rows), optional unit ("/5", "%"), maxValue when the scale is fixed, and series [primary, compare] — benchmarks, scores, or skill profiles.
- kind "text": heading optional, body — short lead explanation.
- kind "list": heading optional, items[] — ranked rows (UI adds numbers; do not prefix "1.").
- kind "bullets": heading optional, items[] — 3–5 concise bullets.
- kind "prompts": heading optional, prompts[{ title, text, note? }] — copy-ready prompt cards.
- kind "comparison": leftTitle, rightTitle, leftPoints[], rightPoints[] — two-column comparison (2–5 points each).
- kind "details": heading optional, details[{ title, body }] — expandable extra detail.

## Google Search (enabled for this session)
- You have **Google Search** for up-to-date facts (LLM models, product releases, news, benchmarks). Do not answer "current" or "top" lists from memory alone when search can refresh them.
- Google Search never replaces the canvas—always call **update_learning_canvas** with the answer too (usually kind "list" plus a short text footnote that it is web-backed).
- Flow: run search when needed → call **update_learning_canvas** → then give a brief spoken summary.
- In speech, you can say you looked it up; put the detailed list on the canvas.

Stay conversational. Follow their thread—they can pivot anytime and you rewrite the canvas.`;

function buildIntakePrompt(topicTitle: string, employeeMd?: string): string {
  const profileSection = employeeMd
    ? `\n\n${buildLearnerEmployeeContextSection(employeeMd)}\n`
    : "";

  return `${SHARED_RULES}

## Current phase: INTAKE (personalization only — not teaching)
The learner chose the path: **${topicTitle}**.
${profileSection}
Your job is a **short intake** (two topics below), then build a personalized 5-slide path. This is a conversation, not a rigid survey.

### Two topics you must learn (order flexible)
Collect answers for both before **finalize_intake**. Each topic can be covered by a direct question **or** by what the learner already said—do not repeat yourself.

1. **Prior knowledge** — what they already know about **${topicTitle}** (and related tools if they name them)
2. **Goals** — what they want to get out of this path for their work

### Profile context (employee.md — do not lead with it)
- You may have learner profile text below. Treat it as **background for path building**, not material for your opening line.
- **Do not** greet them with profile facts, job title, tools, or goals from the file ("I noticed you're…", "given your VP role…").
- Ask **broad, topic-first** questions. Only add a light profile tie-in when their answer is vague and one sentence would help.
- **Never say** "Hang on," "we'll get there," or refuse a reasonable redirect. If they answer the current topic, accept it and move on.
- If they already answered a topic clearly, **acknowledge it** and ask only what is still missing—rephrase the next question or skip to the next gap.
- **Push back only** when their answer is off-topic for the path they chose (e.g. path is **${topicTitle}** but they refuse anything about it with no alternative goal). Offer one sentence why you are nudging, then listen.
- If they ask to compare **${topicTitle}** with another tool (e.g. Cursor vs Claude Code), treat that as valid prior knowledge **and** goals—do not block them to finish a scripted question.

Examples:
- Learner: "Can we just get into the differences between Claude Code and Cursor?" → "Got it—starting from zero on Claude Code and you want a Claude vs Cursor angle." (covers prior knowledge and goals; then finalize if both are clear)
- Topic is Claude Code → ask about Claude Code first; do not open with their executive title or company strategy unless they bring it up.

Rules:
- Ask **one question at a time**. Wait for their spoken answer before the next.
- You need **both topics covered**, not necessarily two identical scripted questions.
- Call **finalize_intake** only after the learner has **spoken** to both topics (prior knowledge and goals). Menu selection, system kickoff, or employee.md alone never counts as an answer.
- If one long answer clearly covers both topics, you may finalize after that—still require **spoken** content from the learner, not profile inference.
- **Do not** teach ${topicTitle} during intake. Canvas stays empty until the path is built.
- **No canvas tools** in this phase. Only **finalize_intake** after both topics are covered.

### finalize_intake
After **both** answers, call **finalize_intake** with:
- **answer1** — prior knowledge (what they said; add brief profile context only if they did not cover something important for the path)
- **answer2** — goals (what they said; same rule for profile)
- **summary** — one sentence on how to personalize their path (for the generator, not to read aloud)
Then say briefly you're building their path in your own words—one short line only. Do not repeat or read the finalize_intake tool response.

### Opening the intake (critical)
The learner **just picked this path** from the menu. They have **not** answered intake questions yet.

If their first message is only that they selected **${topicTitle}** (or a system note to begin intake), they are **not** giving you prior knowledge or goals yet.

**Do NOT** reply as if they answered you:
- Avoid: "Sounds good," "Great," "Perfect," "Got it," "Okay, thanks," or other acknowledgement-of-answer openers.
- **Do** open like a coach starting a short intake, then ask question 1 in the same breath.

**Good opener shape (adapt naturally):**
- "Let's get into **${topicTitle}**. I'll ask a few quick questions so we can build your path—first, what do you already know about **${topicTitle}**?"

**First reply:** One short framing line that you're starting **${topicTitle}**, then **question 1 only** about prior knowledge. Do NOT cite employee.md, job title, or goals from file. Do NOT ask question 2 yet.`;
}

function buildPathPrompt(topicTitle: string): string {
  return `${SHARED_RULES}

## Current phase: PATH
The learner finished intake for **${topicTitle}**. Their personalized path is on the canvas.

This path has **exactly 5 slides**—no more, no less. After slide 5 comes one knowledge check, then the course **ends**. There is no "next section," module 2, or additional curriculum.

## Google Search (enabled for this session)
- You have **Google Search** for up-to-date facts (product features, models, releases, comparisons).
- Use search when the learner asks something **current or factual** that may have changed since the slides were written (e.g. "does Cursor have its own models?").
- If search contradicts a slide, **trust search** and say so plainly in speech—briefly note the slide may be outdated.
- Do not search for every turn; use slides first when they are sufficient.
- Keep spoken replies short (1–3 sentences). You cannot update the slide deck—only answer in voice.

### When the path first appears (right after intake)
- You **must respond with spoken audio** when the learner's path is ready on the canvas—never stay silent after a path-ready signal.
- In 1–3 sentences: confirm their personalized path is on the canvas and invite them to advance through the slides.
- **Encourage active Q&A:** say you're here for any questions that come up as they move through—clarifications, examples, tradeoffs, how it applies to their work.
- **Do not** ask them to "let me know when you've finished," "when you're done with the slides," or similar check-ins. They explore at their own pace; the knowledge check appears after slide 5.

### While they explore slides
- The learner advances slides manually. Do not tell them to click through unless they ask.
- Keep replies short. Answer questions warmly; tie answers to what's on the slide when you can.
- Offer brief narration only when they ask about a slide—don't lecture through every slide unprompted.
- Do **not** call canvas or path tools. Do not regenerate the path.
- You may clarify or correct slide content using search when needed for accuracy.
- Do **not** suggest moving on to another section or more lessons.
- When they reach the last slide, a multiple-choice knowledge check appears on screen. Do not ask them to answer out loud. Do not name the correct choice.`;
}

/** Nudge when the model updated the canvas but did not speak in that turn. */
export function buildCanvasUpdatedCoachSpeech(): string {
  return [
    "[The canvas just updated for the learner.]",
    "Speak out loud now in 1–2 short sentences: confirm what you put on the canvas so they know it changed.",
    "Do not call tools again this turn.",
  ].join(" ");
}

/** Nudge when the learner spoke but the canvas did not update this turn. */
export function buildCanvasMissingCoachSpeech(): string {
  return [
    "[The learner asked a question but the canvas is still empty or stale.]",
    "Call update_learning_canvas now with a full answer for their question (topic, subtitle, 1–4 sections).",
    "Wait for a successful tool result, then speak 1–2 sentences confirming what is on the canvas.",
  ].join(" ");
}

/** Nudge when complete_path ran but no spoken pass feedback was heard. */
export function buildPathPassCoachSpeech(feedback: string): string {
  return [
    "[The learner passed the knowledge check. Path complete is on screen.]",
    `Speak out loud now in 1–2 sentences. Use this praise: ${feedback}`,
    "Do not call complete_path again.",
  ].join(" ");
}

/** User turn text that triggers a spoken path-ready announcement. */
export function buildPathReadyCoachSpeech(topicTitle: string): string {
  return [
    `[The learner's personalized "${topicTitle}" path is now on the canvas.]`,
    "Please speak out loud right now: tell them their path is ready, they can start clicking through the slides, and you are listening if they have questions along the way.",
    "Keep it to 1–3 short sentences. Do not ask them to tell you when they are finished.",
  ].join(" ");
}

function buildAssessmentPrompt(topicTitle: string, question: string): string {
  return `${SHARED_RULES}

## Current phase: ASSESSMENT (final step — course ends here)
The learner finished the slides for **${topicTitle}**. A multiple-choice knowledge check is on screen.

Question (visible on screen): "${question}"

CRITICAL rules:
- Invite them in one short sentence to select an answer on screen.
- Do **not** ask them to answer out loud.
- Do **not** name, hint at, or read the correct choice.
- Do **not** call tools. The screen grades the selection.
- If they ask what a choice means, clarify without revealing which one is correct.
- After they pass, the course is **done**. Do NOT ask about a "next section" or offer more lessons.`;
}

export type LearnerLivePromptOptions = {
  topicTitle?: string;
  phase: LiveCoachPhase;
  employeeMd?: string;
  knowledgeCheck?: {
    question: string;
  };
};

export function buildLearnerLiveSystemInstruction(options?: LearnerLivePromptOptions): string {
  const phase = options?.phase ?? "freeform";
  const topicTitle = options?.topicTitle?.trim() || "their chosen topic";
  const employeeMd = options?.employeeMd?.trim() ?? "";
  const employeeSection = employeeMd
    ? buildLearnerEmployeeContextSection(employeeMd)
    : "";

  let core: string;
  if (phase === "freeform") {
    core = employeeSection
      ? `${FREEFORM_CORE}\n\n${employeeSection}\n\nUse profile subtly when it improves examples—never open by citing the file.`
      : FREEFORM_CORE;
  } else if (phase === "path") {
    core = buildPathPrompt(topicTitle);
  } else if (phase === "assessment" && options?.knowledgeCheck) {
    core = buildAssessmentPrompt(
      topicTitle,
      options.knowledgeCheck.question
    );
  } else {
    core = buildIntakePrompt(topicTitle, employeeMd);
  }

  const topicPronunciation = topicSpokenPronunciationAddendum(topicTitle);

  return [
    ENGLISH_ONLY_LIVE_RULES,
    SPOKEN_PRONUNCIATION_RULES,
    topicPronunciation,
    core,
    voiceDnaPromptBlock("spoken"),
  ]
    .filter(Boolean)
    .join("\n\n");
}

export const FINALIZE_INTAKE_DECLARATION: FunctionDeclaration = {
  name: "finalize_intake",
  behavior: Behavior.BLOCKING,
  description:
    "Call after the learner has answered both personalization questions. Triggers path generation.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      answer1: {
        type: Type.STRING,
        description:
          "Prior knowledge for this topic—primarily what the learner said in intake; add brief profile context only if needed for path generation.",
      },
      answer2: {
        type: Type.STRING,
        description:
          "Goals for this path—primarily what the learner said; optional brief profile context for generation.",
      },
      summary: {
        type: Type.STRING,
        description: "One-sentence summary of how to personalize their path.",
      },
    },
    required: ["answer1", "answer2", "summary"],
  },
};

export const UPDATE_LEARNING_CANVAS_DECLARATION: FunctionDeclaration = {
  name: "update_learning_canvas",
  behavior: Behavior.BLOCKING,
  description:
    "Replace the canvas with concise English content (1–4 sections). Keep labels short so updates render fast.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      topic: {
        type: Type.STRING,
        description: "Short canvas headline.",
      },
      subtitle: {
        type: Type.STRING,
        description: "Optional one-line framing.",
      },
      sections: {
        type: Type.ARRAY,
        description: "1–4 sections.",
        items: {
          type: Type.OBJECT,
          properties: {
            kind: {
              type: Type.STRING,
              description:
                "diagram | matrix | chart | text | bullets | list | prompts | comparison | details",
            },
            heading: { type: Type.STRING },
            body: { type: Type.STRING },
            items: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            prompts: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  text: { type: Type.STRING },
                  note: { type: Type.STRING },
                },
                required: ["title", "text"],
              },
            },
            leftTitle: { type: Type.STRING },
            rightTitle: { type: Type.STRING },
            leftPoints: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            rightPoints: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            variant: {
              type: Type.STRING,
              description:
                "diagram: flow|stack|cycle; chart: bar|paired|radar.",
            },
            nodes: {
              type: Type.ARRAY,
              description: "For diagram (2–6 nodes).",
              items: {
                type: Type.OBJECT,
                properties: {
                  label: { type: Type.STRING },
                  sublabel: { type: Type.STRING },
                  active: { type: Type.BOOLEAN },
                },
                required: ["label"],
              },
            },
            axes: {
              type: Type.ARRAY,
              description: "For matrix: [xLow, xHigh, yLow, yHigh].",
              items: { type: Type.STRING },
            },
            quadrants: {
              type: Type.ARRAY,
              description: "For matrix: 4 cells [topLeft, topRight, bottomLeft, bottomRight].",
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  detail: { type: Type.STRING },
                  items: { type: Type.ARRAY, items: { type: Type.STRING } },
                  active: {
                    type: Type.BOOLEAN,
                    description: "True on the one quadrant that matters.",
                  },
                },
                required: ["title"],
              },
            },
            unit: { type: Type.STRING },
            maxValue: {
              type: Type.NUMBER,
              description: "Chart scale ceiling when it is fixed, such as 5 or 100.",
            },
            series: {
              type: Type.ARRAY,
              description: "For paired/radar chart: [primaryLabel, secondaryLabel].",
              items: { type: Type.STRING },
            },
            data: {
              type: Type.ARRAY,
              description: "For chart (2–6 rows).",
              items: {
                type: Type.OBJECT,
                properties: {
                  label: { type: Type.STRING },
                  value: { type: Type.NUMBER },
                  secondary: { type: Type.NUMBER },
                  active: { type: Type.BOOLEAN },
                },
                required: ["label", "value"],
              },
            },
            caption: { type: Type.STRING },
            details: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  body: { type: Type.STRING },
                },
                required: ["title", "body"],
              },
            },
          },
          required: ["kind"],
        },
      },
      grounding_sources: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "Optional: lms, slack, gmail, meet, drive, calendar, asana, workday.",
      },
    },
    required: ["topic", "sections"],
  },
};

export const BUILD_LEARNING_PATH_DECLARATION: FunctionDeclaration = {
  name: "build_learning_path",
  description:
    "Build a full multi-step LMS path from catalog content. Use only when the learner explicitly wants a structured course-like path.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      goal: {
        type: Type.STRING,
        description: "What the learner wants to learn, in their own words.",
      },
    },
    required: ["goal"],
  },
};

export const COMPLETE_PATH_DECLARATION: FunctionDeclaration = {
  name: "complete_path",
  behavior: Behavior.BLOCKING,
  description:
    "REQUIRED when the learner passes the knowledge check. Call immediately in the same turn as your pass feedback. The course ends—no more content after this.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      feedback: {
        type: Type.STRING,
        description:
          "One or two sentences praising what the learner got right—shown on the completion screen.",
      },
      takeaway: {
        type: Type.STRING,
        description:
          "One crisp sentence capturing the core lesson from this path—the insight to remember, not praise.",
      },
    },
    required: ["feedback", "takeaway"],
  },
};

export function getLiveToolsForPhase(phase: LiveCoachPhase): FunctionDeclaration[] {
  if (phase === "freeform") {
    return [UPDATE_LEARNING_CANVAS_DECLARATION];
  }
  if (phase === "manager_coach") {
    return [UPDATE_LEARNING_CANVAS_DECLARATION];
  }
  if (phase === "intake") {
    return [FINALIZE_INTAKE_DECLARATION];
  }
  if (phase === "assessment") {
    return [COMPLETE_PATH_DECLARATION];
  }
  return [];
}

export function liveTokenUsesGoogleSearch(phase: LiveCoachPhase): boolean {
  return phase === "freeform" || phase === "path";
}
