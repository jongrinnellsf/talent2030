export type HudCueCategory =
  | "posture"
  | "tone"
  | "structure"
  | "encouragement"
  | "relevance";

export type HudCue = {
  text: string;
  category: HudCueCategory;
};

export type HudCueItem = HudCue & {
  id: string;
  createdAt: number;
};

export type ChatMessage = {
  id: string;
  role: "user" | "manager";
  text: string;
  isFinished?: boolean;
};

export type IntegrationSource =
  | "slack"
  | "workday"
  | "drive"
  | "gmail"
  | "calendar"
  | "meet"
  | "asana";

export type ReviewStatus =
  | "review-due"
  | "pip-watch"
  | "promotion-track"
  | "on-track"
  | "new-hire";

export type DirectReport = {
  id: string;
  name: string;
  role: string;
  level: string;
  tenure: string;
  initials: string;
  accentColor: string;
  photoUrl?: string;
  reviewStatus: ReviewStatus;
  statusLabel: string;
  observationTldr: string;
  conversationPointer: string;
  summary: string;
};

export type ContextArtifact = {
  id: string;
  source: IntegrationSource;
  title: string;
  date: string;
  preview: string;
  detail: string;
  observation?: string;
};

export type SelfPerformanceReview = {
  cycleLabel: string;
  submittedDate: string;
  selfRating: string;
  accomplishments: string;
  challenges: string;
  developmentFocus: string;
  nextPeriodGoals: string;
};

export type ManagerWrittenReview = {
  cycleLabel: string;
  completedDate: string;
  overallRating: string;
  calibrationNote?: string;
  summary: string;
  strengths: string;
  areasForDevelopment: string;
  forwardGoals: string;
  deliveryNotes: string;
};

export type WorkObservation = {
  id: string;
  source: IntegrationSource;
  title: string;
  date: string;
  example: string;
  observation: string;
};

export type ObservationSection = {
  source: IntegrationSource;
  label: string;
  items: WorkObservation[];
};

export type PlaybookConfidence = "high" | "medium" | "low";

export type PlaybookReaction = {
  id: string;
  title: string;
  description: string;
  confidence: PlaybookConfidence;
  practiceHref: string;
};

export type DeliveryPlaybook = {
  employeeId: string;
  headlineTension: string;
  signalsSummary: string;
  deliveryConsiderations: string[];
  potentialReactions: PlaybookReaction[];
  recommendedPractice: {
    reactionId: string;
    rationale: string;
  };
};

export type SessionMode = "rehearse";

export type SessionActivity = {
  coachPlaying: boolean;
  isConnecting: boolean;
  elapsed: string;
};

export type SessionAssessment = {
  summary: string;
  strengths: string[];
  improvements: string[];
  keyMoments: Array<{ moment: string; suggestion: string }>;
  recommendedScenarioId?: string;
  recommendedScenarioTitle?: string;
  recommendedPracticeRationale?: string;
};

export type SavedSessionAssessment = {
  id: string;
  title: string;
  createdAt: number;
  assessment: SessionAssessment;
  scenarioId?: string;
  employeeName: string;
};

export type TranscriptLine = {
  role: "user" | "manager";
  text: string;
};

export type CoachStartPayload = {
  type: "start";
  employeeId: string;
  sessionMode: SessionMode;
  scenario?: string;
};

export type EmployeeContextBundle = {
  employeeId: string;
  selfReview: SelfPerformanceReview;
  managerReview: ManagerWrittenReview;
  deliveryPlaybook: DeliveryPlaybook;
  observationSections: ObservationSection[];
  signalCount: number;
};

