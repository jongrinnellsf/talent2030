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
