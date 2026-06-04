import { Position, type Edge, type Node } from "@xyflow/react";
import type { ContextHubNodeData } from "./types";

const SIGNAL_X = 40;
const SIGNAL_ROW = 48;
const SIGNAL_START_Y = 28;
const HUB_X = 268;
const HUB_SIZE = 120;
const FILE_X = 428;
const OUTCOME_X = 588;

const SIGNALS: Array<{
  id: string;
  label: string;
  sublabel?: string;
  kind: ContextHubNodeData["kind"];
}> = [
  {
    id: "talent",
    label: "talentmanagement.md",
    sublabel: "Perf blueprint",
    kind: "contextFile",
  },
  { id: "transcripts", label: "Meeting transcripts", kind: "transcript" },
  { id: "chat", label: "Team chat", kind: "chat" },
  { id: "mail", label: "Email threads", kind: "mail" },
  { id: "tasks", label: "Tasks & goals", kind: "tasks" },
  { id: "ratings", label: "Perf ratings", kind: "ratings" },
  { id: "docs", label: "Docs & sheets", kind: "docs" },
  { id: "calendar", label: "Calendar & 1:1s", kind: "calendar" },
];

const OUTCOMES = [
  { id: "advice", label: "Manager advice" },
  { id: "simulation", label: "Review simulation" },
  { id: "learning", label: "Personalized skill paths" },
] as const;

function signalPosition(index: number) {
  return {
    x: SIGNAL_X,
    y: SIGNAL_START_Y + index * SIGNAL_ROW,
  };
}

function hubY(signalCount: number) {
  const top = SIGNAL_START_Y;
  const bottom = SIGNAL_START_Y + (signalCount - 1) * SIGNAL_ROW + 40;
  return (top + bottom) / 2 - HUB_SIZE / 2 + 8;
}

export function buildContextHubNodes(): Node<ContextHubNodeData>[] {
  const hubCenterY = hubY(SIGNALS.length);

  const nodes: Node<ContextHubNodeData>[] = SIGNALS.map((signal, index) => ({
    id: signal.id,
    type: "signal",
    position: signalPosition(index),
    data: {
      label: signal.label,
      sublabel: signal.sublabel,
      kind: signal.kind,
    },
    sourcePosition: Position.Right,
    draggable: false,
    selectable: false,
  }));

  nodes.push({
    id: "hub",
    type: "hub",
    position: { x: HUB_X, y: hubCenterY },
    data: { label: "Agentic coach", sublabel: "Synthesizes context" },
    targetPosition: Position.Left,
    sourcePosition: Position.Right,
    draggable: false,
    selectable: false,
  });

  nodes.push({
    id: "employee",
    type: "file",
    position: { x: FILE_X, y: hubCenterY + 16 },
    data: { label: "employee.md", sublabel: "Structured ledger" },
    targetPosition: Position.Left,
    sourcePosition: Position.Right,
    draggable: false,
    selectable: false,
  });

  OUTCOMES.forEach((outcome, index) => {
    nodes.push({
      id: outcome.id,
      type: "outcome",
      position: {
        x: OUTCOME_X,
        y: hubCenterY - 52 + index * 56,
      },
      data: { label: outcome.label },
      targetPosition: Position.Left,
      draggable: false,
      selectable: false,
    });
  });

  return nodes;
}

export function buildContextHubEdges(): Edge[] {
  const flowEdge = {
    type: "smoothstep" as const,
    animated: true,
    className: "context-hub-edge context-hub-edge--flow context-hub-edge--signal-in",
  };

  const signalEdges: Edge[] = SIGNALS.map((signal, index) => ({
    id: `e-${signal.id}-hub`,
    source: signal.id,
    target: "hub",
    ...flowEdge,
    pathOptions: { borderRadius: 14, offset: 6 + index * 3 },
  }));

  const trunkEdge = {
    type: "smoothstep" as const,
    animated: true,
    pathOptions: { borderRadius: 20, offset: 12 },
    className: "context-hub-edge context-hub-edge--flow context-hub-edge--primary",
  };

  return [
    ...signalEdges,
    {
      id: "e-hub-employee",
      source: "hub",
      target: "employee",
      ...trunkEdge,
    },
    ...OUTCOMES.map((outcome) => ({
      id: `e-employee-${outcome.id}`,
      source: "employee",
      target: outcome.id,
      type: "smoothstep" as const,
      animated: true,
      pathOptions: { borderRadius: 16, offset: 10 },
      className: "context-hub-edge context-hub-edge--flow context-hub-edge--outcome",
    })),
  ];
}

export const CONTEXT_HUB_BOUNDS = { width: 760, height: 440 };
