import type { LearningSpec } from "./catalog";
import type { LiveCanvasPayload, LiveCanvasSection } from "./liveCanvasTypes";

function compileSection(section: LiveCanvasSection): LearningSpec["elements"][string] {
  switch (section.kind) {
    case "text":
      if (!section.heading) {
        return { type: "Callout", props: { label: "Insight", body: section.body } };
      }
      return { type: "TextBlock", props: { heading: section.heading, body: section.body } };
    case "bullets":
      return {
        type: "BulletList",
        props: { heading: section.heading ?? null, items: section.items },
      };
    case "list":
      return { type: "Steps", props: { heading: section.heading ?? null, items: section.items } };
    case "prompts":
      return {
        type: "PromptList",
        props: { heading: section.heading ?? null, prompts: section.prompts },
      };
    case "comparison":
      return {
        type: "Compare",
        props: {
          heading: section.heading ?? null,
          leftTitle: section.leftTitle,
          rightTitle: section.rightTitle,
          leftPoints: section.leftPoints,
          rightPoints: section.rightPoints,
        },
      };
    case "figure":
      return {
        type: "Figure",
        props: { variant: section.variant, caption: section.caption ?? null },
      };
    case "diagram":
      return {
        type: "Diagram",
        props: {
          heading: section.heading ?? null,
          variant: section.variant,
          nodes: section.nodes,
          edges: section.edges,
          caption: section.caption ?? null,
        },
      };
    case "matrix":
      return {
        type: "Matrix2x2",
        props: {
          heading: section.heading ?? null,
          axes: section.axes,
          quadrants: section.quadrants,
          caption: section.caption ?? null,
        },
      };
    case "chart":
      return {
        type: "MetricChart",
        props: {
          heading: section.heading ?? null,
          variant: section.variant,
          unit: section.unit ?? null,
          maxValue: section.maxValue ?? null,
          series: section.series ?? null,
          data: section.data,
          caption: section.caption ?? null,
        },
      };
    case "details":
      return {
        type: "Accordion",
        props: { heading: section.heading ?? null, items: section.details },
      };
    default:
      return { type: "TextBlock", props: { body: "" } };
  }
}

/** Turn a voice canvas payload into a json-render spec using the shared catalog. */
export function compileLiveCanvasSpec(payload: LiveCanvasPayload): LearningSpec {
  const elements: LearningSpec["elements"] = {};
  const children: string[] = [];

  payload.sections.forEach((section, index) => {
    const id = `section-${index}`;
    elements[id] = compileSection(section);
    children.push(id);
  });

  elements.canvas = {
    type: "Canvas",
    props: {
      title: payload.topic,
      subtitle: payload.subtitle ?? null,
    },
    children,
  };

  return { root: "canvas", elements };
}
