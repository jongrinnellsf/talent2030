/** Default Gemini Live API model for Talent2030 voice sessions. */
export const GEMINI_LIVE_MODEL = "gemini-3.8-live";

/** Text model for path generation, research, and other non-Live calls. */
export const GEMINI_TEXT_MODEL = "gemini-3.8-flash";

/** Server-side model id; optional override via GEMINI_LIVE_MODEL env. */
export function resolveGeminiLiveModel(): string {
  const fromEnv = process.env.GEMINI_LIVE_MODEL?.trim();
  return fromEnv || GEMINI_LIVE_MODEL;
}
