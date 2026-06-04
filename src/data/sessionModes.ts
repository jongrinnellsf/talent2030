import type { SessionMode } from "../types";

export const SESSION_MODE_LABELS: Record<SessionMode, string> = {
  rehearse: "Rehearse",
};

export const SESSION_MODE_DESCRIPTIONS: Record<SessionMode, string> = {
  rehearse:
    "Practice the conversation with Mark Webb in a Meet-style roleplay. Live coaching HUD cues on by default; post-session assessment when you end.",
};

/** Legacy URLs used mode=brainstorm; rehearse is the only studio mode now. */
export function normalizeSessionMode(_value: string | null | undefined): SessionMode {
  return "rehearse";
}

export function isRehearseMode(mode: SessionMode): boolean {
  return mode === "rehearse";
}
