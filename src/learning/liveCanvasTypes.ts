import { z } from "zod";
import { normalizeCanvasWrittenProductNames } from "../data/sessionLanguage";
import type { LearningSpec } from "./catalog";

const promptItemSchema = z.object({
  title: z.string(),
  text: z.string(),
  note: z.string().nullable().optional(),
});

const sectionSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("text"),
    heading: z.string().nullable().optional(),
    body: z.string(),
  }),
  z.object({
    kind: z.literal("bullets"),
    heading: z.string().nullable().optional(),
    items: z.array(z.string()),
  }),
  z.object({
    kind: z.literal("list"),
    heading: z.string().nullable().optional(),
    items: z.array(z.string()),
  }),
  z.object({
    kind: z.literal("prompts"),
    heading: z.string().nullable().optional(),
    prompts: z.array(promptItemSchema),
  }),
  z.object({
    kind: z.literal("comparison"),
    heading: z.string().nullable().optional(),
    leftTitle: z.string(),
    rightTitle: z.string(),
    leftPoints: z.array(z.string()),
    rightPoints: z.array(z.string()),
  }),
]);

export const liveCanvasPayloadSchema = z.object({
  topic: z.string(),
  subtitle: z.string().nullable().optional(),
  sections: z.array(sectionSchema).min(1),
  sources: z.array(z.string()).nullable().optional(),
});

export type LiveCanvasPayload = z.infer<typeof liveCanvasPayloadSchema>;
export type LiveCanvasSection = LiveCanvasPayload["sections"][number];

export type ParseLiveCanvasResult =
  | { ok: true; payload: LiveCanvasPayload }
  | { ok: false; error: string };

/** Strip "1." / "2)" prefixes; ranked lists get numbers from the UI. */
export function stripOrderedListItemPrefix(item: string): string {
  const trimmed = item.trim();
  const stripped = trimmed.replace(/^\d+[.)]\s+/, "");
  return stripped.length > 0 ? stripped : trimmed;
}

function normalizeListItems(items: string[]): string[] {
  return items.map(stripOrderedListItemPrefix).filter((item) => item.length > 0);
}

const KIND_ALIASES: Record<string, string> = {
  prompt: "prompts",
  prompts: "prompts",
  example: "prompts",
  examples: "prompts",
  sample: "prompts",
  samples: "prompts",
  bullet: "bullets",
  bullets: "bullets",
  list: "list",
  compare: "comparison",
  comparison: "comparison",
};

function normalizeKind(raw: string | undefined): string {
  if (!raw) return "text";
  const k = raw.toLowerCase().trim();
  return KIND_ALIASES[k] ?? k;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((i): i is string => typeof i === "string" && i.trim().length > 0);
}

function normalizePromptItem(raw: unknown, index: number) {
  if (typeof raw === "string" && raw.trim()) {
    return { title: `Example ${index + 1}`, text: raw.trim() };
  }
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const text =
    (typeof o.text === "string" && o.text) ||
    (typeof o.body === "string" && o.body) ||
    (typeof o.content === "string" && o.content) ||
    (typeof o.prompt === "string" && o.prompt) ||
    (typeof o.message === "string" && o.message) ||
    "";
  if (!text.trim()) return null;
  const title =
    (typeof o.title === "string" && o.title.trim()) ||
    (typeof o.name === "string" && o.name.trim()) ||
    (typeof o.label === "string" && o.label.trim()) ||
    `Example ${index + 1}`;
  return {
    title,
    text: text.trim(),
    note: typeof o.note === "string" ? o.note : undefined,
  };
}

function extractPromptsArray(s: Record<string, unknown>): unknown[] | null {
  const raw =
    s.prompts ??
    s.examples ??
    s.example_prompts ??
    s.prompt_list ??
    s.samples;
  if (!raw) return null;
  if (Array.isArray(raw)) return raw;
  return [raw];
}

function normalizePromptsSection(s: Record<string, unknown>): LiveCanvasSection | null {
  let promptsRaw = extractPromptsArray(s);
  if (!promptsRaw && Array.isArray(s.items)) {
    promptsRaw = s.items;
  }
  if (!promptsRaw) return null;

  const prompts = promptsRaw
    .map((p, i) => normalizePromptItem(p, i))
    .filter((p): p is NonNullable<typeof p> => p !== null);
  if (prompts.length === 0) return null;

  return {
    kind: "prompts",
    heading: typeof s.heading === "string" ? s.heading : undefined,
    prompts,
  };
}

export function isLiveCanvasSpec(spec: LearningSpec | null): boolean {
  if (!spec?.root) return false;
  const root = spec.elements[spec.root];
  if (root?.type === "LiveCanvas") return true;
  return (
    root?.type === "Card" && root.props?.className === "learner-live-canvas"
  );
}

function normalizeSection(raw: unknown): LiveCanvasSection | null {
  if (!raw || typeof raw !== "object") return null;
  const s = raw as Record<string, unknown>;
  const kind = normalizeKind(typeof s.kind === "string" ? s.kind : undefined);

  if (kind === "prompts" || extractPromptsArray(s)) {
    const promptsSection = normalizePromptsSection(s);
    if (promptsSection) return promptsSection;
  }

  if ((kind === "bullets" || kind === "list") && Array.isArray(s.items)) {
    const rawItems = asStringArray(s.items);
    if (rawItems.length === 0) return null;
    const items =
      kind === "list" ? normalizeListItems(rawItems) : rawItems;
    return {
      kind: kind === "bullets" ? "bullets" : "list",
      heading: typeof s.heading === "string" ? s.heading : undefined,
      items,
    };
  }

  if (kind === "comparison") {
    const leftPoints = asStringArray(
      s.leftPoints ?? s.left_items ?? s.leftItems
    );
    const rightPoints = asStringArray(
      s.rightPoints ?? s.right_items ?? s.rightItems
    );
    if (
      typeof s.leftTitle === "string" &&
      typeof s.rightTitle === "string" &&
      leftPoints.length > 0
    ) {
      return {
        kind: "comparison",
        heading: typeof s.heading === "string" ? s.heading : undefined,
        leftTitle: s.leftTitle,
        rightTitle: s.rightTitle,
        leftPoints,
        rightPoints,
      };
    }
  }

  const body =
    (typeof s.body === "string" && s.body) ||
    (typeof s.text === "string" && s.text) ||
    (typeof s.content === "string" && s.content) ||
    "";
  if (!body.trim()) return null;
  return {
    kind: "text",
    heading: typeof s.heading === "string" ? s.heading : undefined,
    body: body.trim(),
  };
}

function normalizeSectionsRaw(sectionsRaw: unknown): unknown[] {
  if (typeof sectionsRaw === "string") {
    try {
      return normalizeSectionsRaw(JSON.parse(sectionsRaw));
    } catch {
      return [];
    }
  }
  if (Array.isArray(sectionsRaw)) return sectionsRaw;
  if (sectionsRaw && typeof sectionsRaw === "object") {
    return Object.values(sectionsRaw as Record<string, unknown>);
  }
  return [];
}

function sanitizeCanvasText(text: string): string {
  return normalizeCanvasWrittenProductNames(text);
}

function sanitizeLiveCanvasPayload(payload: LiveCanvasPayload): LiveCanvasPayload {
  return {
    ...payload,
    topic: sanitizeCanvasText(payload.topic),
    subtitle: payload.subtitle ? sanitizeCanvasText(payload.subtitle) : null,
    sections: payload.sections.map((section) => {
      if (section.kind === "text") {
        return {
          ...section,
          heading: section.heading ? sanitizeCanvasText(section.heading) : section.heading,
          body: sanitizeCanvasText(section.body),
        };
      }
      if (section.kind === "list" || section.kind === "bullets") {
        return {
          ...section,
          heading: section.heading ? sanitizeCanvasText(section.heading) : section.heading,
          items: section.items.map(sanitizeCanvasText),
        };
      }
      if (section.kind === "prompts") {
        return {
          ...section,
          heading: section.heading ? sanitizeCanvasText(section.heading) : section.heading,
          prompts: section.prompts.map((p) => ({
            ...p,
            title: sanitizeCanvasText(p.title),
            text: sanitizeCanvasText(p.text),
            note: p.note ? sanitizeCanvasText(p.note) : p.note,
          })),
        };
      }
      if (section.kind === "comparison") {
        return {
          ...section,
          heading: section.heading ? sanitizeCanvasText(section.heading) : section.heading,
          leftTitle: sanitizeCanvasText(section.leftTitle),
          rightTitle: sanitizeCanvasText(section.rightTitle),
          leftPoints: section.leftPoints.map(sanitizeCanvasText),
          rightPoints: section.rightPoints.map(sanitizeCanvasText),
        };
      }
      return section;
    }),
  };
}

/** Parse Live API tool args (loose JSON) into a canvas payload with explicit errors. */
export function parseLiveCanvasToolArgsWithResult(
  args: unknown
): ParseLiveCanvasResult {
  if (!args || typeof args !== "object") {
    return { ok: false, error: "Tool args were empty or not an object." };
  }
  const raw = args as Record<string, unknown>;

  const sections = normalizeSectionsRaw(raw.sections)
    .map(normalizeSection)
    .filter((s): s is LiveCanvasSection => s !== null);

  const topic =
    typeof raw.topic === "string" && raw.topic.trim()
      ? raw.topic.trim()
      : typeof raw.title === "string"
        ? raw.title.trim()
        : "";

  if (!topic) {
    return { ok: false, error: "Missing topic (headline). Set topic to a short title." };
  }
  if (sections.length === 0) {
    return {
      ok: false,
      error:
        'No renderable sections. For copy-paste examples use kind:"prompts" with prompts:[{title:"...",text:"..."}] (text is required). Do not only describe prompts in a text section.',
    };
  }

  const payload: LiveCanvasPayload = {
    topic,
    subtitle: typeof raw.subtitle === "string" ? raw.subtitle : null,
    sections,
    sources: Array.isArray(raw.sources)
      ? raw.sources.filter((s): s is string => typeof s === "string")
      : Array.isArray(raw.grounding_sources)
        ? raw.grounding_sources.filter((s): s is string => typeof s === "string")
        : [],
  };

  const validated = liveCanvasPayloadSchema.safeParse(payload);
  if (!validated.success) {
    return { ok: false, error: "Sections failed validation after normalization." };
  }

  return { ok: true, payload: sanitizeLiveCanvasPayload(validated.data) };
}
