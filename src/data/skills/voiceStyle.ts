import { voiceDnaSkill } from "./voiceDnaSkill";

export type VoiceDnaPromptMode = "spoken" | "written" | "micro" | "roleplay";

function getSection(id: string): string {
  const section = voiceDnaSkill.sections.find((s) => s.id === id);
  return section?.content ?? "";
}

const SPOKEN_BANNED_SUMMARY = `- Never use: delve, leverage, harness, unpack, landscape, robust, furthermore, additionally, "in today's", "it's worth noting", "I'd be happy to help"
- FATAL: any "This isn't X. This is Y." or negation-runway pattern ("Not X. Not Y. [claim].") — state the positive claim directly
- No staccato fragment stacks (3+ fragments starting with the same word)
- No em dashes — use commas, periods, colons, semicolons, or parentheses`;

const MICRO_BANNED_SUMMARY = `- Direct and specific — no AI cringe (unlock, supercharge, leverage, delve)
- FATAL: no negation-runway or "isn't X / is Y" patterns
- No staccato fragment stacks
- Plain English, contractions OK`;

export function voiceDnaPromptBlock(mode: VoiceDnaPromptMode): string {
  switch (mode) {
    case "spoken":
      return `## Voice and style (required)

${getSection("writing-rules")}

Spoken output: keep turns short (1-3 sentences). Get to the point. Use contractions. Be specific when you reference evidence from the roster.

### Never use
${SPOKEN_BANNED_SUMMARY}`;

    case "written":
      return `## Voice and style (required)

${getSection("writing-rules")}

${getSection("formatting-rules")}

## ${voiceDnaSkill.sections.find((s) => s.id === "banned-phrases")!.title}

${getSection("banned-phrases")}`;

    case "micro":
      return `## Voice (required — max 8 words per cue)

- Write like a sharp human, not a language model
- Be specific to this moment; no generic coaching filler
${MICRO_BANNED_SUMMARY}`;

    case "roleplay":
      return `## Voice (required — in-character dialogue)

- Sound like a real person on a tense performance review call, not a language model, podcast host, or HR script
- Use contractions naturally; keep turns short (1-3 sentences)
- Be specific when pushing back or agreeing: name concrete things from the quarter, not vague generalities
- **Delivery:** measured pace, flat or tight tone. Not upbeat, not cheerful, not "great question" energy
- Defensiveness, frustration, and controlled irritation are in character when the scenario calls for it
- Normal conversational disagreement is fine ("That's not how I remember it"). Avoid copywriter negation-runway ("Not X. Not Y. [grand claim].")

### Never use
${SPOKEN_BANNED_SUMMARY}

These rules shape how you talk, not what you believe. Stay fully in character.`;

    default: {
      const _exhaustive: never = mode;
      return _exhaustive;
    }
  }
}
