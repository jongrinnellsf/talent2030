import { defineRegistry } from "@json-render/react";
import { shadcnComponents } from "@json-render/shadcn";
import { learningCatalog } from "./catalog";
import {
  ContentBlockView,
  QuizSlideView,
  SurveySlideView,
  VideoSlideView,
} from "./components/LearningSlideViews";
import {
  GeneratedSlideView,
  KnowledgeCheckSlideView,
} from "./components/GeneratedSlideViews";
import { IntroSlideView } from "./components/IntroSlideView";
import {
  AccordionBlock,
  BulletListBlock,
  CalloutBlock,
  CanvasBoard,
  ChoiceList,
  CompareBlock,
  FigureBlock,
  PromptListBlock,
  StepsBlock,
  TextBlock,
  type FigureVariant,
} from "./components/canvasBlocks";
import {
  DiagramBlock,
  Matrix2x2Block,
  MetricChartBlock,
  type DiagramVariant,
  type MetricChartVariant,
} from "./components/visualBlocks";
import type {
  DiagramEdgeItem,
  DiagramNodeItem,
  MatrixQuadrantItem,
  MetricChartRow,
} from "./liveCanvasTypes";

export const { registry } = defineRegistry(learningCatalog, {
  components: {
    Card: shadcnComponents.Card,
    Stack: shadcnComponents.Stack,
    Badge: shadcnComponents.Badge,
    Heading: shadcnComponents.Heading,
    Separator: shadcnComponents.Separator,
    Text: shadcnComponents.Text,
    Grid: shadcnComponents.Grid,
    Table: shadcnComponents.Table,
    Alert: shadcnComponents.Alert,
    Canvas: ({ props, children }) => (
      <CanvasBoard
        title={String(props.title ?? "")}
        subtitle={typeof props.subtitle === "string" ? props.subtitle : null}
      >
        {children}
      </CanvasBoard>
    ),
    Callout: ({ props }) => (
      <CalloutBlock
        label={typeof props.label === "string" ? props.label : "Insight"}
        body={String(props.body ?? "")}
      />
    ),
    TextBlock: ({ props }) => (
      <TextBlock
        heading={typeof props.heading === "string" ? props.heading : null}
        body={String(props.body ?? "")}
      />
    ),
    BulletList: ({ props }) => (
      <BulletListBlock
        heading={typeof props.heading === "string" ? props.heading : null}
        items={Array.isArray(props.items) ? props.items.map(String) : []}
      />
    ),
    Steps: ({ props }) => (
      <StepsBlock
        heading={typeof props.heading === "string" ? props.heading : null}
        items={Array.isArray(props.items) ? props.items.map(String) : []}
      />
    ),
    Compare: ({ props }) => (
      <CompareBlock
        heading={typeof props.heading === "string" ? props.heading : null}
        leftTitle={String(props.leftTitle ?? "")}
        rightTitle={String(props.rightTitle ?? "")}
        leftPoints={Array.isArray(props.leftPoints) ? props.leftPoints.map(String) : []}
        rightPoints={Array.isArray(props.rightPoints) ? props.rightPoints.map(String) : []}
      />
    ),
    PromptList: ({ props }) => (
      <PromptListBlock
        heading={typeof props.heading === "string" ? props.heading : null}
        prompts={Array.isArray(props.prompts) ? props.prompts.flatMap(readPrompt) : []}
      />
    ),
    Figure: ({ props }) => (
      <FigureBlock
        variant={readFigureVariant(props.variant)}
        caption={typeof props.caption === "string" ? props.caption : null}
      />
    ),
    Diagram: ({ props }) => (
      <DiagramBlock
        heading={typeof props.heading === "string" ? props.heading : null}
        variant={readDiagramVariant(props.variant)}
        nodes={Array.isArray(props.nodes) ? props.nodes.flatMap(readDiagramNode) : []}
        edges={Array.isArray(props.edges) ? props.edges.flatMap(readDiagramEdge) : undefined}
        caption={typeof props.caption === "string" ? props.caption : null}
      />
    ),
    Matrix2x2: ({ props }) => (
      <Matrix2x2Block
        heading={typeof props.heading === "string" ? props.heading : null}
        axes={readAxes(props.axes)}
        quadrants={readQuadrants(props.quadrants)}
        caption={typeof props.caption === "string" ? props.caption : null}
      />
    ),
    MetricChart: ({ props }) => (
      <MetricChartBlock
        heading={typeof props.heading === "string" ? props.heading : null}
        variant={readChartVariant(props.variant)}
        unit={typeof props.unit === "string" ? props.unit : null}
        maxValue={typeof props.maxValue === "number" ? props.maxValue : null}
        series={readSeries(props.series)}
        data={Array.isArray(props.data) ? props.data.flatMap(readChartRow) : []}
        caption={typeof props.caption === "string" ? props.caption : null}
      />
    ),
    Accordion: ({ props }) => (
      <AccordionBlock
        heading={typeof props.heading === "string" ? props.heading : null}
        items={Array.isArray(props.items) ? props.items.flatMap(readDetail) : []}
      />
    ),
    Choice: ({ props }) => (
      <ChoiceList
        choices={Array.isArray(props.choices) ? props.choices.map(String) : []}
        correctIndex={Number(props.correctIndex)}
      />
    ),
    LearningPath: ({ children }) => <div className="learning-path">{children}</div>,
    IntroSlide: ({ props }) => (
      <IntroSlideView
        title={String(props.title)}
        subtitle={
          props.subtitle != null && props.subtitle !== ""
            ? String(props.subtitle)
            : undefined
        }
      />
    ),
    ContentBlock: ({ props }) => (
      <ContentBlockView assetId={String(props.assetId)} />
    ),
    VideoSlide: ({ props }) => <VideoSlideView assetId={String(props.assetId)} />,
    QuizSlide: ({ props }) => <QuizSlideView assetId={String(props.assetId)} />,
    SurveySlide: ({ props }) => <SurveySlideView assetId={String(props.assetId)} />,
    GeneratedSlide: ({ props }) => (
      <GeneratedSlideView
        title={String(props.title)}
        body={String(props.body)}
        bullets={Array.isArray(props.bullets) ? props.bullets.map(String) : undefined}
      />
    ),
    KnowledgeCheckSlide: ({ props }) => (
      <KnowledgeCheckSlideView question={String(props.question)} />
    ),
  },
  actions: {},
});

function readPrompt(value: unknown): { title: string; text: string; note?: string | null }[] {
  if (!value || typeof value !== "object") return [];
  const row = value as Record<string, unknown>;
  const text = typeof row.text === "string" ? row.text : "";
  const title = typeof row.title === "string" ? row.title : "";
  if (!text || !title) return [];
  return [{ title, text, note: typeof row.note === "string" ? row.note : null }];
}

function readDetail(value: unknown): { title: string; body: string }[] {
  if (!value || typeof value !== "object") return [];
  const row = value as Record<string, unknown>;
  const title = typeof row.title === "string" ? row.title : "";
  const body = typeof row.body === "string" ? row.body : "";
  if (!title || !body) return [];
  return [{ title, body }];
}

function readFigureVariant(value: unknown): FigureVariant {
  return value === "stack" || value === "compare" ? value : "flow";
}

function readDiagramVariant(value: unknown): DiagramVariant {
  return value === "stack" || value === "cycle" ? value : "flow";
}

function readDiagramNode(value: unknown): DiagramNodeItem[] {
  if (!value || typeof value !== "object") return [];
  const row = value as Record<string, unknown>;
  const label = typeof row.label === "string" ? row.label : "";
  if (!label) return [];
  const id = typeof row.id === "string" && row.id ? row.id : label;
  return [
    {
      id,
      label,
      sublabel: typeof row.sublabel === "string" ? row.sublabel : null,
      active: Boolean(row.active),
    },
  ];
}

function readDiagramEdge(value: unknown): DiagramEdgeItem[] {
  if (!value || typeof value !== "object") return [];
  const row = value as Record<string, unknown>;
  const from = typeof row.from === "string" ? row.from : "";
  const to = typeof row.to === "string" ? row.to : "";
  if (!from || !to) return [];
  return [{ from, to, label: typeof row.label === "string" ? row.label : null }];
}

function readAxes(value: unknown): [string, string, string, string] {
  if (Array.isArray(value) && value.length >= 4) {
    return [
      String(value[0] ?? "Low"),
      String(value[1] ?? "High"),
      String(value[2] ?? "Low"),
      String(value[3] ?? "High"),
    ];
  }
  return ["Low", "High", "Low", "High"];
}

function readSingleQuadrant(value: unknown): MatrixQuadrantItem {
  if (!value || typeof value !== "object") return { title: "—" };
  const row = value as Record<string, unknown>;
  return {
    title: typeof row.title === "string" && row.title ? row.title : "—",
    detail: typeof row.detail === "string" ? row.detail : null,
    items: Array.isArray(row.items) ? row.items.map(String) : undefined,
  };
}

function readQuadrants(
  value: unknown
): [MatrixQuadrantItem, MatrixQuadrantItem, MatrixQuadrantItem, MatrixQuadrantItem] {
  const list = Array.isArray(value) ? value : [];
  return [
    readSingleQuadrant(list[0]),
    readSingleQuadrant(list[1]),
    readSingleQuadrant(list[2]),
    readSingleQuadrant(list[3]),
  ];
}

function readChartVariant(value: unknown): MetricChartVariant {
  return value === "paired" || value === "radar" ? value : "bar";
}

function readSeries(value: unknown): [string, string] | null {
  if (Array.isArray(value) && value.length >= 2) {
    return [String(value[0]), String(value[1])];
  }
  return null;
}

function readChartRow(value: unknown): MetricChartRow[] {
  if (!value || typeof value !== "object") return [];
  const row = value as Record<string, unknown>;
  const label = typeof row.label === "string" ? row.label : "";
  const num = typeof row.value === "number" ? row.value : Number(row.value);
  if (!label || !Number.isFinite(num)) return [];
  const sec =
    typeof row.secondary === "number" && Number.isFinite(row.secondary)
      ? row.secondary
      : null;
  return [
    {
      label,
      value: num,
      secondary: sec,
      active: Boolean(row.active),
    },
  ];
}
