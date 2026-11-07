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
