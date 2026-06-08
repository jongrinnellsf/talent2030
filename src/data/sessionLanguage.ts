/** BCP-47 code used for Live API speech + transcription hints. */
export const LIVE_SESSION_LANGUAGE = "en-US";

export const ENGLISH_ONLY_LIVE_RULES = `## Language (required)
- **English only** for the entire session — all spoken dialogue and responses.
- Never switch to another language, even briefly or for emphasis.
- If audio is unclear, ask for clarification in English — do not respond in another language.`;

/** Fix TTS pronunciation bleed-through in written canvas copy. */
export function normalizeCanvasWrittenProductNames(text: string): string {
  return text
    .replace(/\bKLAWD\s+KOHD\b/gi, "Claude Code")
    .replace(/\bKLAWD\s+CODE\b/gi, "Claude Code")
    .replace(/\bKLAWD\b/gi, "Claude")
    .replace(/\b[Kk]lawd\s+[Kk]oh?d\b/g, "Claude Code")
    .replace(/\b[Kk]lawd\s+[Cc]ode\b/g, "Claude Code")
    .replace(/\b[Kk]lawd\b/g, "Claude");
}

/** Guides Live API audio output; keep official spellings in canvas/tools. */
export const SPOKEN_PRONUNCIATION_RULES = `## Claude product name — written vs spoken (CRITICAL)

**Written output (canvas, tools, lists, prompts, subtitles):**
- Always **Claude** and **Claude Code** — official Anthropic spelling only.
- **Never** write Klawd, klawd, KLAWD, "klawd kohd", or any phonetic spelling on the canvas or in tool payloads.

**Spoken audio only:**
- The TTS model often misreads **Claude** as **"cloud"** (weather). That is wrong.
- Say **klawd** (rhymes with flawed) for Claude; **klawd kohd** for Claude Code — audio only, never in written text.
- If you are about to say "cloud", stop and say **klawd** instead.

You may clarify once per session in speech: "Claude—I'm saying klawd, like flawed, not cloud." Do not repeat every turn.`;

/** Extra emphasis when the session topic names Claude. */
export function topicSpokenPronunciationAddendum(topicTitle: string): string {
  if (!/\bclaude\b/i.test(topicTitle)) return "";
  return `## Topic pronunciation (${topicTitle}) — highest priority

This session is about **${topicTitle}**.

**Canvas and tools:** write **Claude** / **Claude Code** only — never Klawd or phonetic spellings.

**Spoken audio only:** say **klawd** / **klawd kohd** so TTS does not read "cloud". Forbidden in audio: "cloud", "clode".`;
}

export const GENDER_NEUTRAL_EMPLOYEE_LANGUAGE = `## Employee references (required)
- Refer to direct reports with they/them/their, or by name. Do not assume gender.
- Do not use he, she, him, her, his, or hers for employees unless quoting verbatim speech.`;

export function englishOnlyAssessmentRules(managerName: string): string {
  return `- All feedback must be in English.
- Do not claim ${managerName} switched languages unless their transcript lines clearly contain non-English speech.
- Ignore transcription glitches and misheard words — do not treat them as code-switching.
- Never suggest "stay in English" unless non-English text from ${managerName} appears verbatim in the transcript.`;
}
