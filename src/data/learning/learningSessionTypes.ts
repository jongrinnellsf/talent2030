import type { PathTopic } from "./pathTopics";

export type LearningPhase =
  | "select_topic"
  | "freeform"
  | "manager_coach"
  | "rehearse"
  | "intake"
  | "generating"
  | "path"
  | "assessment"
  | "complete";

export type LiveCoachPhase =
  | "freeform"
  | "manager_coach"
  | "intake"
  | "path"
  | "assessment";

export type PersonalizationContext = {
  answers: [string, string, string];
  summary: string;
};

export type KnowledgeCheck = {
  question: string;
  expectedAnswer: string;
  evaluationHints: string;
};

export type SelectTopicPayload = PathTopic;
