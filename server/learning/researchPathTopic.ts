import type { GoogleGenAI } from "@google/genai";
import { extractWebSearchSources } from "../../src/lib/groundingSources.ts";

const RESEARCH_MODEL = "gemini-2.5-flash";

function buildResearchPrompt(
  topicTitle: string,
  answers: string[],
  summary: string
): string {
  return `You are preparing factual notes for a short workplace learning path on **${topicTitle}**.

Use **Google Search** to gather **current, accurate** information (product capabilities, models, pricing tiers if relevant, recent releases, how it compares to alternatives). Do not rely on memory alone for fast-moving products.

Learner intake (use to focus research, not to skip search):
- Prior knowledge: ${answers[0] || "(not provided)"}
- Goals: ${answers[1] || "(not provided)"}
- Depth preference: ${answers[2] || "(not provided)"}
- Summary: ${summary || "(not provided)"}

Return concise research notes (bullet lists OK, max ~600 words) that a course author will turn into 4 teaching slides. Include:
- What ${topicTitle} is today (not outdated marketing)
- Capabilities learners care about for their stated goals
- Common misconceptions to correct
- 1–2 practical tips grounded in current docs

Mark anything time-sensitive (e.g. "as of search date"). Do not output JSON.`;
}

export type PathTopicResearch = {
  notes: string;
  sources: { title: string; uri: string }[];
};

export async function researchPathTopic(
  ai: GoogleGenAI,
  topicTitle: string,
  answers: string[],
  summary: string
): Promise<PathTopicResearch> {
  try {
    const response = await ai.models.generateContent({
      model: RESEARCH_MODEL,
      contents: buildResearchPrompt(topicTitle, answers, summary),
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const notes = response.text?.trim() ?? "";
    const sources = extractWebSearchSources(
      response.candidates?.[0]?.groundingMetadata
    );

    if (!notes) {
      return { notes: "", sources: [] };
    }

    return { notes, sources };
  } catch (err) {
    console.warn("[learning] Path topic web research failed:", err);
    return { notes: "", sources: [] };
  }
}
