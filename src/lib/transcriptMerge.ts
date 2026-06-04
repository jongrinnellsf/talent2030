/**
 * Merge streaming ASR/transcription chunks from Gemini Live.
 * Handles cumulative updates, overlapping fragments, and missing word boundaries.
 */
/** Min length before treating `next` as a duplicate fragment already in `prev`. */
const DUPLICATE_FRAGMENT_MIN = 12;

export function mergeStreamingTranscript(existing: string, incoming: string): string {
  if (!incoming) return normalizeTranscriptWhitespace(existing);
  if (!existing) return normalizeTranscriptWhitespace(incoming);

  const prev = normalizeTranscriptWhitespace(existing);
  const next = normalizeTranscriptWhitespace(incoming);
  if (!prev) return next;
  if (!next) return prev;

  const cumulative = mergeCumulativeTranscript(prev, next);
  if (cumulative) return cumulative;

  const duplicate = mergeDuplicateFragment(prev, next);
  if (duplicate) return duplicate;

  const maxOverlap = Math.min(prev.length, next.length);
  for (let size = maxOverlap; size >= 2; size--) {
    const overlapInPrev = prev.slice(prev.length - size);
    const overlapInNext = next.slice(0, size);
    if (overlapInPrev !== overlapInNext) continue;

    const charBeforeOverlap = prev[prev.length - size - 1];
    if (!isTranscriptWordBoundary(charBeforeOverlap)) continue;

    return normalizeTranscriptWhitespace(prev + next.slice(size));
  }

  return normalizeTranscriptWhitespace(
    prev + (needsSpaceBetween(prev, next) ? " " : "") + next
  );
}

function mergeCumulativeTranscript(prev: string, next: string): string | null {
  if (next.startsWith(prev)) return next;
  if (prev.startsWith(next)) return prev;

  const prevLower = prev.toLowerCase();
  const nextLower = next.toLowerCase();
  if (nextLower.startsWith(prevLower)) return next;
  if (prevLower.startsWith(nextLower)) return prev;

  return null;
}

/**
 * Live API sometimes re-sends a tail segment (not cumulative from the start).
 * Appending it duplicates the end of the turn — drop if already present.
 */
function mergeDuplicateFragment(prev: string, next: string): string | null {
  if (next.length < DUPLICATE_FRAGMENT_MIN) return null;

  const prevLower = prev.toLowerCase();
  const nextLower = next.toLowerCase();

  if (prevLower.endsWith(nextLower)) return prev;
  if (prevLower.includes(nextLower)) return prev;

  return null;
}

function isTranscriptWordBoundary(char: string | undefined): boolean {
  if (char === undefined) return true;
  return /[\s.,!?;:\-—(\[{]/.test(char);
}

function needsSpaceBetween(prev: string, next: string): boolean {
  const prevChar = prev[prev.length - 1];
  const nextChar = next[0];

  if (nextChar === "'" && /[a-zA-Z]$/.test(prev)) return false;
  if (prevChar === "-" && /[a-zA-Z]/.test(nextChar)) return false;
  if (/[(\[{]$/.test(prev)) return false;
  if (/^[.,!?;:'")\]}]/.test(next)) return false;

  if (/[,.:;!?]$/.test(prev) && /[a-zA-Z("'(\[]/.test(nextChar)) return true;
  if (/[a-zA-Z0-9]$/.test(prev) && /[a-zA-Z0-9("'(\[]/.test(nextChar)) return true;

  return false;
}

export function normalizeTranscriptWhitespace(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

import { stripLeakedToolCalls } from "./sanitizeCoachSpeech";

/**
 * Light cleanup when a transcript turn is finalized.
 * Fixes common merge/ASR artifacts without rewriting content.
 */
export function polishFinishedTranscript(text: string): string {
  let polished = stripLeakedToolCalls(text);

  const phraseFixes: Array<[RegExp, string]> = [
    [/\bgover\b/gi, "go over"],
    [/\bgoin to\b/gi, "going to"],
    [/\s+([,.!?;:])(?=\s|$)/g, "$1"],
  ];

  for (const [pattern, replacement] of phraseFixes) {
    polished = polished.replace(pattern, replacement);
  }

  return polished;
}
