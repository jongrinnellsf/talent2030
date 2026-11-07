import type { LearningSpec } from "../learning/catalog";
import type { KnowledgeCheck } from "../data/learning/learningSessionTypes";

function parseKnowledgeCheck(props: Record<string, unknown>): KnowledgeCheck | null {
  const question = typeof props.question === "string" ? props.question.trim() : "";
  if (!question) return null;

  const rawChoices = Array.isArray(props.choices) ? props.choices : [];
  const choices = rawChoices
    .map((choice) => (typeof choice === "string" ? choice.trim() : ""))
    .filter(Boolean);
  const correctIndex =
    typeof props.correctIndex === "number"
      ? props.correctIndex
      : Number(props.correctIndex);
  const explanation =
    typeof props.explanation === "string" && props.explanation.trim()
      ? props.explanation.trim()
      : undefined;

  if (
    choices.length === 4 &&
    Number.isInteger(correctIndex) &&
    correctIndex >= 0 &&
    correctIndex <= 3
  ) {
    return {
      question,
      choices: choices as KnowledgeCheck["choices"],
      correctIndex,
      explanation,
    };
  }

  return {
    question,
    choices: [
      "Use the main idea from the slides in real work",
      "Skip practice and rely on memory alone",
      "Ignore the examples and switch tools",
      "Treat the slides as optional background",
    ],
    correctIndex: 0,
    explanation,
  };
}

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
      knowledgeCheck = parseKnowledgeCheck(el.props ?? {});
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
