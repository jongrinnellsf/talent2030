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
        expectedAnswer: z.string(),
        evaluationHints: z.string(),
      }),
      description:
        "End-of-path knowledge check. Question is shown to learner; expectedAnswer and evaluationHints are coach-only.",
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
