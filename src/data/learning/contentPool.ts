import { lmsCourses } from "../lms/courses";
import type { LmsAsset, LmsCourse } from "../lms/types";
import {
  integrationLearningAssets,
  integrationVideoAssets,
} from "./integrationSnippets";
import type { LearningAsset, LearningContentSource } from "./types";

function lmsToLearningAsset(asset: LmsAsset, course: LmsCourse): LearningAsset {
  return {
    ...asset,
    source: "lms",
    sourceTitle: course.title,
    packageLabel: course.scormPackageId ?? "LMS catalog",
  };
}

const allAssets: LearningAsset[] = [
  ...integrationLearningAssets,
  ...integrationVideoAssets,
  ...lmsCourses.flatMap((course) =>
    course.assets.map((asset) => lmsToLearningAsset(asset, course))
  ),
];

const assetIndex = new Map<string, LearningAsset>();
const courseByAsset = new Map<string, LmsCourse>();

for (const course of lmsCourses) {
  for (const asset of course.assets) {
    courseByAsset.set(asset.id, course);
  }
}

for (const asset of allAssets) {
  assetIndex.set(asset.id, asset);
}

export function getLearningAsset(assetId: string): LearningAsset | undefined {
  return assetIndex.get(assetId);
}

export function getLearningCourseForAsset(assetId: string): LmsCourse | undefined {
  return courseByAsset.get(assetId);
}

export function getAllLearningAssetIds(): string[] {
  return [...assetIndex.keys()];
}

export function getSourcesInAssets(assetIds: string[]): LearningContentSource[] {
  const sources = new Set<LearningContentSource>();
  for (const id of assetIds) {
    const asset = assetIndex.get(id);
    if (asset) sources.add(asset.source);
  }
  return [...sources];
}

export { allAssets as learningContentPool };
