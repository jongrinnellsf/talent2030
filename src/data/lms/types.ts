export type LmsAssetKind = "content" | "video" | "quiz" | "survey";

export type LmsContentBlock = {
  id: string;
  kind: "content";
  courseId: string;
  title: string;
  body: string;
  tags: string[];
  scormPackageId?: string;
  estimatedMinutes?: number;
};

export type LmsVideoAsset = {
  id: string;
  kind: "video";
  courseId: string;
  title: string;
  description: string;
  durationMinutes: number;
  posterLabel: string;
  tags: string[];
};

export type LmsQuizQuestion = {
  prompt: string;
  options: string[];
  correctIndex?: number;
};

export type LmsQuizAsset = {
  id: string;
  kind: "quiz";
  courseId: string;
  title: string;
  tags: string[];
  questions: LmsQuizQuestion[];
};

export type LmsSurveyAsset = {
  id: string;
  kind: "survey";
  courseId: string;
  title: string;
  tags: string[];
  prompts: string[];
};

export type LmsAsset = LmsContentBlock | LmsVideoAsset | LmsQuizAsset | LmsSurveyAsset;

export type LmsCourse = {
  id: string;
  title: string;
  summary: string;
  tags: string[];
  scormPackageId?: string;
  assets: LmsAsset[];
};

export type LmsSearchHit = {
  asset: LmsAsset;
  course: LmsCourse;
  score: number;
};

export type LmsSearchResult = {
  goal: string;
  courses: LmsCourse[];
  hits: LmsSearchHit[];
  allowedAssetIds: string[];
};
