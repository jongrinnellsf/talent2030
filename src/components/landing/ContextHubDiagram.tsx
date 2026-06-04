import { useMemo } from "react";
import { ReactFlow, ReactFlowProvider } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  buildContextHubEdges,
  buildContextHubNodes,
} from "./contextHub/buildContextHubGraph";
import {
  FileNode,
  HubNode,
  OutcomeNode,
  SignalNode,
} from "./contextHub/ContextHubNodes";
import { ContextHubSpine } from "./contextHub/ContextHubSpine";

const nodeTypes = {
  hub: HubNode,
  signal: SignalNode,
  file: FileNode,
  outcome: OutcomeNode,
};

function ContextHubFlow() {
  const nodes = useMemo(() => buildContextHubNodes(), []);
  const edges = useMemo(() => buildContextHubEdges(), []);

  return (
    <ReactFlow
      className="context-hub-flow"
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      nodesDraggable={false}
      nodesConnectable={false}
      elementsSelectable={false}
      panOnDrag={false}
      zoomOnScroll={false}
      zoomOnPinch={false}
      zoomOnDoubleClick={false}
      preventScrolling={false}
      fitView
      fitViewOptions={{ padding: 0.08, minZoom: 0.45, maxZoom: 1 }}
      minZoom={0.4}
      maxZoom={1.05}
      proOptions={{ hideAttribution: true }}
      aria-label="Work signals flow through an agentic coach and employee context file into advice, simulation, and learning outputs"
    />
  );
}

export function ContextHubDiagram() {
  return (
    <figure className="context-hub-diagram">
      <ReactFlowProvider>
        <div className="context-hub-diagram__canvas">
          <ContextHubSpine />
          <ContextHubFlow />
        </div>
      </ReactFlowProvider>
      <figcaption className="context-hub-diagram__caption">
        Every signal has its own line into the agent. Outputs run through{" "}
        <code>employee.md</code>: advice, review simulation, and skill paths.
      </figcaption>
    </figure>
  );
}
