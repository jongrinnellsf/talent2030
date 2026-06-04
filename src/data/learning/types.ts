import type { IntegrationSource } from "../../types";
import type { LmsAsset, LmsCourse } from "../lms/types";

export type LearningContentSource = IntegrationSource | "lms";

export type LearningAsset = LmsAsset & {
  source: LearningContentSource;
  sourceTitle: string;
  packageLabel?: string;
};

export type LearningSearchHit = {
  asset: LearningAsset;
  course?: LmsCourse;
  score: number;
};

export type LearningSearchResult = {
  goal: string;
  courses: LmsCourse[];
  hits: LearningSearchHit[];
  allowedAssetIds: string[];
};
