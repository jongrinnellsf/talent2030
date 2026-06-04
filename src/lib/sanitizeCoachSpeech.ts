import { normalizeTranscriptWhitespace } from "./transcriptMerge";

/** Tool names the Live API may leak into output transcription instead of real tool calls. */
const LEAKED_TOOL_NAMES =
  "complete_path|update_learning_canvas|finalize_intake|build_learning_path";

const LEAKED_TOOL_CALL_PATTERN = new RegExp(
  `\\s*(?:${LEAKED_TOOL_NAMES})\\s*(?:\\{[^}]*\\}|\\([^)]*\\))\\s*`,
  "gi"
);

export function stripLeakedToolCalls(text: string): string {
  if (!text) return "";
  return normalizeTranscriptWhitespace(text.replace(LEAKED_TOOL_CALL_PATTERN, " "));
}

export type LeakedCompletePath = {
  feedback: string;
  takeaway?: string;
};

/**
 * Recover structured completion when the model speaks/writes a tool call
 * (e.g. complete_path{feedback:...,takeaway:...}) instead of invoking the tool.
 */
export function parseLeakedCompletePath(text: string): LeakedCompletePath | null {
  const open = text.match(/complete_path\s*\{/i);
  if (!open || open.index === undefined) return null;

  const bodyStart = open.index + open[0].length;
  const body = text.slice(bodyStart);
  const takeawaySplit = body.search(/,?\s*takeaway:\s*/i);
  if (takeawaySplit < 0) return null;

  const feedback = body
    .slice(0, takeawaySplit)
    .replace(/^feedback:\s*/i, "")
    .trim();
  const afterTakeaway = body.slice(takeawaySplit).replace(/^,?\s*takeaway:\s*/i, "");
  const closeBrace = afterTakeaway.lastIndexOf("}");
  if (closeBrace < 0) return null;

  const takeaway = afterTakeaway.slice(0, closeBrace).trim();
  if (!feedback) return null;

  return { feedback, takeaway: takeaway || undefined };
}

export function sanitizeCoachSpeech(text: string): string {
  return stripLeakedToolCalls(text);
}
