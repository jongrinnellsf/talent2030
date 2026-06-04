import type { LearningSpec } from "../learning/catalog";
import type { KnowledgeCheck } from "../data/learning/learningSessionTypes";

export function extractKnowledgeCheckFromSpec(
  spec: LearningSpec
): { contentSpec: LearningSpec; knowledgeCheck: KnowledgeCheck | null } {
  const root = spec.elements[spec.root];
  if (!root?.children?.length) {
    return { contentSpec: spec, knowledgeCheck: null };
  }

  const contentChildren: string[] = [];
  let knowledgeCheck: KnowledgeCheck | null = null;

  for (const key of root.children) {
    const el = spec.elements[key];
    if (el?.type === "KnowledgeCheckSlide") {
      const props = el.props ?? {};
      const question = typeof props.question === "string" ? props.question : "";
      const expectedAnswer =
        typeof props.expectedAnswer === "string" ? props.expectedAnswer : "";
      const evaluationHints =
        typeof props.evaluationHints === "string" ? props.evaluationHints : "";
      if (question) {
        knowledgeCheck = { question, expectedAnswer, evaluationHints };
      }
      continue;
    }
    contentChildren.push(key);
  }

  return {
    contentSpec: {
      ...spec,
      elements: {
        ...spec.elements,
        [spec.root]: {
          ...root,
          children: contentChildren,
        },
      },
    },
    knowledgeCheck,
  };
}
