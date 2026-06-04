/** Fallback when the coach omits a dedicated takeaway string. */
export function deriveCompletionTakeaway(
  takeaway: string | undefined,
  feedback: string,
  topicTitle?: string
): string {
  const trimmed = takeaway?.trim();
  if (trimmed) return trimmed;

  const firstSentence = feedback.match(/^[^.!?]+[.!?]/)?.[0]?.trim();
  if (firstSentence && firstSentence.length >= 20 && firstSentence.length <= 220) {
    return firstSentence;
  }

  if (topicTitle) {
    return `The core idea from ${topicTitle} is what you'll want to remember.`;
  }

  return "Carry the main idea from this path with you.";
}
