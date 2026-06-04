export function coachMessageIndicatesPass(text: string): boolean {
  const normalized = text.toLowerCase();
  const hasPassSignal =
    /\byou passed\b/.test(normalized) ||
    /\bpassed this\b/.test(normalized) ||
    /\bpassed the\b/.test(normalized) ||
    /\bperfect(ly)?\b/.test(normalized) ||
    /\bnailed it\b/.test(normalized) ||
    /\bthat's (right|correct)\b/.test(normalized) ||
    /\byou got it\b/.test(normalized) ||
    /\bgreat answer\b/.test(normalized);

  const hasFailSignal =
    /\bnot quite\b/.test(normalized) ||
    /\btry again\b/.test(normalized) ||
    /\bnot quite there\b/.test(normalized) ||
    /\bpartially there\b/.test(normalized) ||
    /\bpartially correct\b/.test(normalized);

  return hasPassSignal && !hasFailSignal;
}
