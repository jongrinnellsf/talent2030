/** BCP-47 code used for Live API speech + transcription hints. */
export const LIVE_SESSION_LANGUAGE = "en-US";

export const ENGLISH_ONLY_LIVE_RULES = `## Language (required)
- **English only** for the entire session — all spoken dialogue and responses.
- Never switch to another language, even briefly or for emphasis.
- If audio is unclear, ask for clarification in English — do not respond in another language.`;

/** Guides Live API audio output; keep official spellings in canvas/tools. */
export const SPOKEN_PRONUNCIATION_RULES = `## Spoken pronunciation (CRITICAL — audio only)

The TTS model often misreads **Claude** as **"cloud"** (weather). That is **wrong**. Never say "cloud" when you mean the Anthropic product.

**Mandatory spoken forms (use these sounds every time in audio):**
- **Claude** → **"klawd"** (one syllable, rhymes with **flawed**; not **cloud**, not **clode**, not the letter C-L-O-U-D)
- **Claude Code** → **"klawd kohd"** (two words: **KLAWD** then **KOHD**)

**Written output:** canvas, tools, and transcripts keep the official spelling **Claude** / **Claude Code**. Only your **spoken** delivery uses **klawd** / **klawd kohd**.

**Before speaking the product name:** mentally substitute **klawd** (or **klawd kohd**). If you are about to say "cloud", stop and say **klawd** instead.

You may clarify once per session: "Claude—I'm saying klawd, like flawed, not cloud." Do not repeat every turn.`;

/** Extra emphasis when the session topic names Claude. */
export function topicSpokenPronunciationAddendum(topicTitle: string): string {
  if (!/\bclaude\b/i.test(topicTitle)) return "";
  return `## Topic pronunciation (${topicTitle}) — highest priority

This session is about **${topicTitle}**. You will say the product name often in audio.

- Every spoken **Claude** → **klawd** (KLAWD, rhymes with flawed)
- Every spoken **Claude Code** → **klawd kohd** (KLAWD KOHD)
- **Forbidden in audio:** "cloud", "clode", or spelling out C-L-O-U-D like the weather

Keep written **Claude** / **Claude Code** on the canvas; only audio uses klawd / klawd kohd.`;
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
