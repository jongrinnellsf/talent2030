import { z } from "zod";
import { normalizeCanvasWrittenProductNames } from "../data/sessionLanguage";
import type { LearningSpec } from "./catalog";

const promptItemSchema = z.object({
  title: z.string(),
  text: z.string(),
  note: z.string().nullable().optional(),
});

const diagramNodeSchema = z.object({
  id: z.string(),
  label: z.string(),
  sublabel: z.string().nullable().optional(),
  active: z.boolean().optional(),
});

const diagramEdgeSchema = z.object({
  from: z.string(),
  to: z.string(),
  label: z.string().nullable().optional(),
});

const matrixQuadrantSchema = z.object({
  title: z.string(),
  detail: z.string().nullable().optional(),
  items: z.array(z.string()).optional(),
});

const chartRowSchema = z.object({
  label: z.string(),
  value: z.number(),
  secondary: z.number().nullable().optional(),
  active: z.boolean().optional(),
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
  z.object({
    kind: z.literal("figure"),
    heading: z.string().nullable().optional(),
    variant: z.enum(["flow", "stack", "compare"]),
    caption: z.string().nullable().optional(),
  }),
  z.object({
    kind: z.literal("diagram"),
    heading: z.string().nullable().optional(),
    variant: z.enum(["flow", "stack", "cycle"]),
    nodes: z.array(diagramNodeSchema).min(2).max(6),
    edges: z.array(diagramEdgeSchema).optional(),
    caption: z.string().nullable().optional(),
  }),
  z.object({
    kind: z.literal("matrix"),
    heading: z.string().nullable().optional(),
    axes: z.tuple([z.string(), z.string(), z.string(), z.string()]),
    quadrants: z.tuple([
      matrixQuadrantSchema,
      matrixQuadrantSchema,
      matrixQuadrantSchema,
      matrixQuadrantSchema,
    ]),
    caption: z.string().nullable().optional(),
  }),
  z.object({
    kind: z.literal("chart"),
    heading: z.string().nullable().optional(),
    variant: z.enum(["bar", "paired", "radar"]),
    unit: z.string().nullable().optional(),
    maxValue: z.number().positive().nullable().optional(),
    series: z.tuple([z.string(), z.string()]).nullable().optional(),
    data: z.array(chartRowSchema).min(2).max(6),
    caption: z.string().nullable().optional(),
  }),
  z.object({
    kind: z.literal("details"),
    heading: z.string().nullable().optional(),
    details: z.array(z.object({ title: z.string(), body: z.string() })).min(1),
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
export type DiagramNodeItem = z.infer<typeof diagramNodeSchema>;
export type DiagramEdgeItem = z.infer<typeof diagramEdgeSchema>;
export type MatrixQuadrantItem = z.infer<typeof matrixQuadrantSchema>;
export type MetricChartRow = z.infer<typeof chartRowSchema>;

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
  figure: "figure",
  diagram: "diagram",
  flowchart: "diagram",
  flow: "diagram",
  process: "diagram",
  cycle: "diagram",
  stack: "diagram",
  architecture: "diagram",
  timeline: "diagram",
  matrix: "matrix",
  matrix2x2: "matrix",
  "2x2": "matrix",
  quadrant: "matrix",
  quadrants: "matrix",
  grid: "matrix",
  chart: "chart",
  metricchart: "chart",
  "metric-chart": "chart",
  bar: "chart",
  "paired-bar": "chart",
  paired: "chart",
  radar: "chart",
  metrics: "chart",
  graph: "chart",
  distribution: "chart",
  scores: "chart",
  details: "details",
  accordion: "details",
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

function readCaption(s: Record<string, unknown>): string | undefined {
  if (typeof s.caption === "string" && s.caption.trim()) return s.caption.trim();
  if (typeof s.note === "string" && s.note.trim()) return s.note.trim();
  return undefined;
}

function splitLabelAndDetail(raw: string): { label: string; detail?: string } {
  const cleaned = stripOrderedListItemPrefix(raw);
  const match = cleaned.match(/^([^:—–-]{2,36})\s*(?::|—|–|\s-\s)\s*(.+)$/);
  if (match) {
    return { label: match[1].trim(), detail: match[2].trim() };
  }
  return { label: cleaned };
}

function normalizeDiagramVariant(
  rawVariant: unknown,
  rawKind: string | undefined
): "flow" | "stack" | "cycle" {
  const v =
    typeof rawVariant === "string"
      ? rawVariant.toLowerCase().trim()
      : (rawKind ?? "").toLowerCase().trim();
  if (v === "stack" || v === "layers" || v === "layered" || v === "architecture") {
    return "stack";
  }
  if (v === "cycle" || v === "loop" || v === "circular") {
    return "cycle";
  }
  return "flow";
}

function normalizeDiagramNode(raw: unknown, index: number): DiagramNodeItem | null {
  if (typeof raw === "string" && raw.trim()) {
    const { label, detail } = splitLabelAndDetail(raw);
    if (!label) return null;
    return {
      id: `n${index + 1}`,
      label,
      ...(detail ? { sublabel: detail } : {}),
    };
  }
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const rawLabel =
    (typeof o.label === "string" && o.label) ||
    (typeof o.title === "string" && o.title) ||
    (typeof o.name === "string" && o.name) ||
    (typeof o.step === "string" && o.step) ||
    (typeof o.text === "string" && o.text) ||
    "";
  const label = stripOrderedListItemPrefix(rawLabel);
  if (!label) return null;

  const sublabel =
    (typeof o.sublabel === "string" && o.sublabel.trim()) ||
    (typeof o.detail === "string" && o.detail.trim()) ||
    (typeof o.description === "string" && o.description.trim()) ||
    (typeof o.subtitle === "string" && o.subtitle.trim()) ||
    (typeof o.note === "string" && o.note.trim()) ||
    undefined;

  const active = Boolean(o.active ?? o.emphasis ?? o.highlight ?? o.current);
  const id =
    typeof o.id === "string" && o.id.trim() ? o.id.trim() : `n${index + 1}`;

  return {
    id,
    label,
    ...(sublabel ? { sublabel } : {}),
    ...(active ? { active: true } : {}),
  };
}

function normalizeDiagramSection(
  s: Record<string, unknown>,
  rawKind: string | undefined
): LiveCanvasSection | null {
  const nodesSource = s.nodes ?? s.steps ?? s.stages ?? s.items;
  if (!Array.isArray(nodesSource)) return null;

  const nodes = nodesSource
    .map((item, i) => normalizeDiagramNode(item, i))
    .filter((n): n is DiagramNodeItem => n !== null)
    .slice(0, 6);

  if (nodes.length < 2) return null;

  const nodeIds = new Set(nodes.map((n) => n.id));
  const edges = Array.isArray(s.edges)
    ? s.edges
        .map((e): DiagramEdgeItem | null => {
          if (!e || typeof e !== "object") return null;
          const row = e as Record<string, unknown>;
          const from = typeof row.from === "string" ? row.from.trim() : "";
          const to = typeof row.to === "string" ? row.to.trim() : "";
          if (!from || !to || !nodeIds.has(from) || !nodeIds.has(to)) return null;
          const label =
            typeof row.label === "string" && row.label.trim()
              ? row.label.trim()
              : undefined;
          return { from, to, ...(label ? { label } : {}) };
        })
        .filter((e): e is DiagramEdgeItem => e !== null)
    : undefined;

  return {
    kind: "diagram",
    heading: typeof s.heading === "string" ? s.heading : undefined,
    variant: normalizeDiagramVariant(s.variant, rawKind),
    nodes,
    ...(edges && edges.length > 0 ? { edges } : {}),
    caption: readCaption(s),
  };
}

function splitAxisPair(raw: string, fallbackName: string): [string, string] {
  const trimmed = raw.trim();
  const arrowParts = trimmed.split(/\s*(?:→|->|↔|—|–|\bvs\.?\b|\bto\b)\s*/i);
  if (arrowParts.length >= 2 && arrowParts[0] && arrowParts[1]) {
    return [arrowParts[0].trim(), arrowParts[1].trim()];
  }
  const label = trimmed || fallbackName;
  return [`Low ${label}`, `High ${label}`];
}

function extractMatrixAxes(
  s: Record<string, unknown>
): [string, string, string, string] {
  if (Array.isArray(s.axes)) {
    const strs = s.axes
      .filter((a): a is string => typeof a === "string" && a.trim().length > 0)
      .map((a) => a.trim());
    if (strs.length >= 4) {
      return [strs[0], strs[1], strs[2], strs[3]];
    }
    if (strs.length === 2) {
      const [xLow, xHigh] = splitAxisPair(strs[0], "X");
      const [yLow, yHigh] = splitAxisPair(strs[1], "Y");
      return [xLow, xHigh, yLow, yHigh];
    }
  }

  const xDirectLow =
    (typeof s.xAxisLow === "string" && s.xAxisLow.trim()) ||
    (typeof s.xLow === "string" && s.xLow.trim());
  const xDirectHigh =
    (typeof s.xAxisHigh === "string" && s.xAxisHigh.trim()) ||
    (typeof s.xHigh === "string" && s.xHigh.trim());
  const yDirectLow =
    (typeof s.yAxisLow === "string" && s.yAxisLow.trim()) ||
    (typeof s.yLow === "string" && s.yLow.trim());
  const yDirectHigh =
    (typeof s.yAxisHigh === "string" && s.yAxisHigh.trim()) ||
    (typeof s.yHigh === "string" && s.yHigh.trim());

  const [xLow, xHigh] =
    xDirectLow && xDirectHigh
      ? [xDirectLow, xDirectHigh]
      : typeof s.xAxis === "string"
        ? splitAxisPair(s.xAxis, "X")
        : ["Low", "High"];

  const [yLow, yHigh] =
    yDirectLow && yDirectHigh
      ? [yDirectLow, yDirectHigh]
      : typeof s.yAxis === "string"
        ? splitAxisPair(s.yAxis, "Y")
        : ["Low", "High"];

  return [xLow, xHigh, yLow, yHigh];
}

function normalizeQuadrant(raw: unknown, index: number): MatrixQuadrantItem | null {
  if (typeof raw === "string" && raw.trim()) {
    const { label, detail } = splitLabelAndDetail(raw);
    return { title: label || `Quadrant ${index + 1}`, ...(detail ? { detail } : {}) };
  }
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const title =
    (typeof o.title === "string" && o.title.trim()) ||
    (typeof o.label === "string" && o.label.trim()) ||
    (typeof o.heading === "string" && o.heading.trim()) ||
    (typeof o.name === "string" && o.name.trim()) ||
    "";
  const detail =
    (typeof o.detail === "string" && o.detail.trim()) ||
    (typeof o.body === "string" && o.body.trim()) ||
    (typeof o.description === "string" && o.description.trim()) ||
    (typeof o.subtitle === "string" && o.subtitle.trim()) ||
    undefined;
  const items = normalizeListItems(
    asStringArray(o.items ?? o.points ?? o.bullets ?? o.examples)
  ).slice(0, 4);

  if (!title && !detail && items.length === 0) return null;

  return {
    title: title || `Quadrant ${index + 1}`,
    ...(detail ? { detail } : {}),
    ...(items.length > 0 ? { items } : {}),
  };
}

function normalizeMatrixSection(s: Record<string, unknown>): LiveCanvasSection | null {
  const rawQuads = s.quadrants ?? s.cells ?? s.boxes;
  let quadList: unknown[] = [];
  if (Array.isArray(rawQuads)) {
    quadList = rawQuads;
  } else if (rawQuads && typeof rawQuads === "object") {
    const q = rawQuads as Record<string, unknown>;
    quadList = [
      q.topLeft ?? q.tl ?? q.q1,
      q.topRight ?? q.tr ?? q.q2,
      q.bottomLeft ?? q.bl ?? q.q3,
      q.bottomRight ?? q.br ?? q.q4,
    ].filter((v) => v !== undefined);
  }

  const parsed = quadList
    .map((item, idx) => normalizeQuadrant(item, idx))
    .filter((q): q is MatrixQuadrantItem => q !== null)
    .slice(0, 4);

  if (parsed.length < 2) return null;
  while (parsed.length < 4) {
    parsed.push({ title: "—", detail: "" });
  }

  return {
    kind: "matrix",
    heading: typeof s.heading === "string" ? s.heading : undefined,
    axes: extractMatrixAxes(s),
    quadrants: [parsed[0], parsed[1], parsed[2], parsed[3]],
    caption: readCaption(s),
  };
}

function parseLooseNumber(
  raw: unknown
): { value: number; inferredUnit?: string } | null {
  if (typeof raw === "number" && Number.isFinite(raw)) {
    return { value: raw };
  }
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const slashMatch = trimmed.match(/^(-?\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)$/);
  if (slashMatch) {
    return {
      value: Number(slashMatch[1]),
      inferredUnit: `/${slashMatch[2]}`,
    };
  }

  const pctMatch = trimmed.match(/^(-?\d+(?:\.\d+)?)\s*%$/);
  if (pctMatch) {
    return { value: Number(pctMatch[1]), inferredUnit: "%" };
  }

  const numMatch = trimmed.match(/-?\d+(?:\.\d+)?/);
  if (numMatch) {
    const parsed = Number(numMatch[0]);
    if (Number.isFinite(parsed)) return { value: parsed };
  }
  return null;
}

function normalizeChartVariant(
  rawVariant: unknown,
  rawKind: string | undefined,
  hasSecondary: boolean,
  rowCount: number
): "bar" | "paired" | "radar" {
  const v =
    typeof rawVariant === "string"
      ? rawVariant.toLowerCase().trim()
      : (rawKind ?? "").toLowerCase().trim();
  if (v === "radar" || v === "spider" || v === "profile") {
    return rowCount >= 3 ? "radar" : hasSecondary ? "paired" : "bar";
  }
  if (
    hasSecondary ||
    v === "paired" ||
    v === "paired-bar" ||
    v === "grouped" ||
    v === "dual"
  ) {
    return "paired";
  }
  return "bar";
}

function normalizeChartSection(
  s: Record<string, unknown>,
  rawKind: string | undefined
): LiveCanvasSection | null {
  const rawData = s.data ?? s.bars ?? s.metrics ?? s.values ?? s.rows ?? s.items;
  if (!Array.isArray(rawData)) return null;

  let detectedUnit: string | undefined;
  const rows: MetricChartRow[] = [];

  for (const item of rawData) {
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    const label =
      (typeof o.label === "string" && o.label.trim()) ||
      (typeof o.name === "string" && o.name.trim()) ||
      (typeof o.title === "string" && o.title.trim()) ||
      (typeof o.category === "string" && o.category.trim()) ||
      (typeof o.metric === "string" && o.metric.trim()) ||
      "";
    if (!label) continue;

    const primaryParsed = parseLooseNumber(
      o.value ?? o.score ?? o.primary ?? o.count ?? o.rating
    );
    if (!primaryParsed) continue;
    if (primaryParsed.inferredUnit && !detectedUnit) {
      detectedUnit = primaryParsed.inferredUnit;
    }

    const secondaryParsed = parseLooseNumber(
      o.secondary ?? o.secondaryValue ?? o.compareValue ?? o.target ?? o.managerValue
    );
    const active = Boolean(o.active ?? o.highlight ?? o.emphasis);

    rows.push({
      label,
      value: primaryParsed.value,
      ...(secondaryParsed ? { secondary: secondaryParsed.value } : {}),
      ...(active ? { active: true } : {}),
    });
    if (rows.length >= 6) break;
  }

  if (rows.length < 2) return null;

  const hasSecondary = rows.some((r) => typeof r.secondary === "number");
  const variant = normalizeChartVariant(s.variant, rawKind, hasSecondary, rows.length);

  const unit =
    typeof s.unit === "string" && s.unit.trim()
      ? s.unit.trim()
      : detectedUnit;

  const maxParsed = parseLooseNumber(s.maxValue ?? s.max ?? s.scale);
  const maxValue =
    maxParsed && maxParsed.value > 0 ? maxParsed.value : undefined;

  const rawSeries = asStringArray(s.series ?? s.seriesLabels ?? s.legend);
  const series: [string, string] | undefined =
    rawSeries.length >= 2 ? [rawSeries[0], rawSeries[1]] : undefined;

  return {
    kind: "chart",
    heading: typeof s.heading === "string" ? s.heading : undefined,
    variant,
    ...(unit ? { unit } : {}),
    ...(maxValue ? { maxValue } : {}),
    ...(series ? { series } : {}),
    data: rows,
    caption: readCaption(s),
  };
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
  const rawKind = typeof s.kind === "string" ? s.kind : undefined;
  const kind = normalizeKind(rawKind);

  if (kind === "diagram") {
    const diagram = normalizeDiagramSection(s, rawKind);
    if (diagram) return diagram;
  }

  if (kind === "matrix" || Array.isArray(s.quadrants) || (s.quadrants && typeof s.quadrants === "object")) {
    const matrix = normalizeMatrixSection(s);
    if (matrix) return matrix;
  }

  if (kind === "chart" || Array.isArray(s.data) || Array.isArray(s.bars)) {
    const chart = normalizeChartSection(s, rawKind);
    if (chart) return chart;
  }

  if (kind === "figure") {
    const upgradedDiagram = normalizeDiagramSection(s, rawKind);
    if (upgradedDiagram) return upgradedDiagram;

    const variant = s.variant === "stack" || s.variant === "compare" ? s.variant : "flow";
    const caption =
      (typeof s.caption === "string" && s.caption.trim()) ||
      (typeof s.body === "string" && s.body.trim()) ||
      undefined;
    return {
      kind: "figure",
      heading: typeof s.heading === "string" ? s.heading : undefined,
      variant,
      caption,
    };
  }

  if (kind === "details") {
    const rawDetails = Array.isArray(s.details) ? s.details : Array.isArray(s.items) ? s.items : [];
    const details = rawDetails
      .map((item) => {
        if (!item || typeof item !== "object") return null;
        const row = item as Record<string, unknown>;
        const title = typeof row.title === "string" ? row.title.trim() : "";
        const body =
          (typeof row.body === "string" && row.body.trim()) ||
          (typeof row.text === "string" && row.text.trim()) ||
          "";
        if (!title || !body) return null;
        return { title, body };
      })
      .filter((item): item is { title: string; body: string } => item !== null);
    if (details.length === 0) return null;
    return {
      kind: "details",
      heading: typeof s.heading === "string" ? s.heading : undefined,
      details,
    };
  }

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

  // Graceful fallback if diagram/list was sent with string items under an unrecognized visual kind
  if (Array.isArray(s.nodes) || Array.isArray(s.steps)) {
    const fallbackDiagram = normalizeDiagramSection(s, rawKind);
    if (fallbackDiagram) return fallbackDiagram;
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
      if (section.kind === "figure") {
        return {
          ...section,
          heading: section.heading ? sanitizeCanvasText(section.heading) : section.heading,
          caption: section.caption ? sanitizeCanvasText(section.caption) : section.caption,
        };
      }
      if (section.kind === "diagram") {
        return {
          ...section,
          heading: section.heading ? sanitizeCanvasText(section.heading) : section.heading,
          nodes: section.nodes.map((node) => ({
            ...node,
            label: sanitizeCanvasText(node.label),
            sublabel: node.sublabel ? sanitizeCanvasText(node.sublabel) : node.sublabel,
          })),
          edges: section.edges?.map((edge) => ({
            ...edge,
            label: edge.label ? sanitizeCanvasText(edge.label) : edge.label,
          })),
          caption: section.caption ? sanitizeCanvasText(section.caption) : section.caption,
        };
      }
      if (section.kind === "matrix") {
        return {
          ...section,
          heading: section.heading ? sanitizeCanvasText(section.heading) : section.heading,
          axes: [
            sanitizeCanvasText(section.axes[0]),
            sanitizeCanvasText(section.axes[1]),
            sanitizeCanvasText(section.axes[2]),
            sanitizeCanvasText(section.axes[3]),
          ],
          quadrants: [
            sanitizeQuadrant(section.quadrants[0]),
            sanitizeQuadrant(section.quadrants[1]),
            sanitizeQuadrant(section.quadrants[2]),
            sanitizeQuadrant(section.quadrants[3]),
          ],
          caption: section.caption ? sanitizeCanvasText(section.caption) : section.caption,
        };
      }
      if (section.kind === "chart") {
        return {
          ...section,
          heading: section.heading ? sanitizeCanvasText(section.heading) : section.heading,
          unit: section.unit ? sanitizeCanvasText(section.unit) : section.unit,
          series: section.series
            ? [sanitizeCanvasText(section.series[0]), sanitizeCanvasText(section.series[1])]
            : section.series,
          data: section.data.map((row) => ({
            ...row,
            label: sanitizeCanvasText(row.label),
          })),
          caption: section.caption ? sanitizeCanvasText(section.caption) : section.caption,
        };
      }
      if (section.kind === "details") {
        return {
          ...section,
          heading: section.heading ? sanitizeCanvasText(section.heading) : section.heading,
          details: section.details.map((item) => ({
            title: sanitizeCanvasText(item.title),
            body: sanitizeCanvasText(item.body),
          })),
        };
      }
      return section;
    }),
  };
}

function sanitizeQuadrant(q: MatrixQuadrantItem): MatrixQuadrantItem {
  return {
    title: sanitizeCanvasText(q.title),
    ...(q.detail ? { detail: sanitizeCanvasText(q.detail) } : {}),
    ...(q.items ? { items: q.items.map(sanitizeCanvasText) } : {}),
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
        'No renderable sections. Use kind: "diagram" | "matrix" | "chart" | "text" | "bullets" | "list" | "prompts" | "comparison" | "details".',
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
