import { defineCatalog } from "@json-render/core";
import { shadcnComponentDefinitions } from "@json-render/shadcn/catalog";
import { schema } from "@json-render/react/schema";
import { z } from "zod";

export const learningCatalog = defineCatalog(schema, {
  components: {
    Card: shadcnComponentDefinitions.Card,
    Stack: shadcnComponentDefinitions.Stack,
    Badge: shadcnComponentDefinitions.Badge,
    Heading: shadcnComponentDefinitions.Heading,
    Separator: shadcnComponentDefinitions.Separator,
    Text: shadcnComponentDefinitions.Text,
    Grid: shadcnComponentDefinitions.Grid,
    Table: shadcnComponentDefinitions.Table,
    Alert: shadcnComponentDefinitions.Alert,
    Canvas: {
      props: z.object({
        title: z.string(),
        subtitle: z.string().nullable().optional(),
      }),
      description: "Freeform canvas frame. Children are the sections, in order.",
      slots: ["default"],
    },
    Callout: {
      props: z.object({
        label: z.string().nullable().optional(),
        body: z.string(),
      }),
      description: "Short highlighted insight.",
    },
    TextBlock: {
      props: z.object({
        heading: z.string().nullable().optional(),
        body: z.string(),
      }),
      description: "Heading plus a paragraph.",
    },
    BulletList: {
      props: z.object({
        heading: z.string().nullable().optional(),
        items: z.array(z.string()),
      }),
      description: "Disc list of short points.",
    },
    Steps: {
      props: z.object({
        heading: z.string().nullable().optional(),
        items: z.array(z.string()),
      }),
      description: "Numbered steps. Do not prefix items with 1. or 2.",
    },
    Compare: {
      props: z.object({
        heading: z.string().nullable().optional(),
        leftTitle: z.string(),
        rightTitle: z.string(),
        leftPoints: z.array(z.string()),
        rightPoints: z.array(z.string()),
      }),
      description: "Two-column comparison.",
    },
    PromptList: {
      props: z.object({
        heading: z.string().nullable().optional(),
        prompts: z.array(
          z.object({
            title: z.string(),
            text: z.string(),
            note: z.string().nullable().optional(),
          })
        ),
      }),
      description: "Copy-ready prompt cards.",
    },
    Figure: {
      props: z.object({
        variant: z.enum(["flow", "stack", "compare"]),
        caption: z.string().nullable().optional(),
      }),
      description:
        "Built-in diagram. variant is flow, stack, or compare. No image URLs.",
    },
    Accordion: {
      props: z.object({
        heading: z.string().nullable().optional(),
        items: z.array(z.object({ title: z.string(), body: z.string() })),
      }),
      description: "Expandable extra detail. The learner opens one item at a time.",
    },
    Choice: {
      props: z.object({
        choices: z.array(z.string()).length(4),
        correctIndex: z.number().int().min(0).max(3),
      }),
      description: "Multiple choice. correctIndex is not shown to the learner.",
    },
    LearningPath: {
      props: z.object({
        title: z.string().nullable().optional(),
      }),
      description:
        "Container for the personalized path. Put slide element keys in children in order.",
      slots: ["default"],
    },
    IntroSlide: {
      props: z.object({
        title: z.string(),
        subtitle: z.string().nullable().optional(),
      }),
      description:
        "Opening framing slide. Only component where the model writes freeform copy.",
    },
    ContentBlock: {
      props: z.object({
        assetId: z.string(),
      }),
      description:
        "Renders content by assetId from LMS or connected systems (Slack, Gmail, Meet, etc.).",
    },
    VideoSlide: {
      props: z.object({
        assetId: z.string(),
      }),
      description: "Renders a video-style asset by assetId.",
    },
    QuizSlide: {
      props: z.object({
        assetId: z.string(),
      }),
      description: "Renders an existing quiz by assetId.",
    },
    SurveySlide: {
      props: z.object({
        assetId: z.string(),
      }),
      description: "Renders an existing survey by assetId.",
    },
    GeneratedSlide: {
      props: z.object({
        title: z.string(),
        body: z.string(),
        bullets: z.array(z.string()).optional(),
      }),
      description: "AI-generated teaching slide with title, body, and optional bullets.",
    },
    KnowledgeCheckSlide: {
      props: z.object({
        question: z.string(),
        choices: z.array(z.string()).length(4),
        correctIndex: z.number().int().min(0).max(3),
        explanation: z.string().nullable().optional(),
      }),
      description:
        "Multiple-choice knowledge check. The learner selects one choice. correctIndex is the correct option and must not be labeled in the question.",
    },
  },
  actions: {},
});

export type LearningSpec = {
  root: string;
  elements: Record<
    string,
    {
      type: string;
      props: Record<string, unknown>;
      children?: string[];
    }
  >;
};
