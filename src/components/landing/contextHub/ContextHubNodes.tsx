import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import {
  Calendar,
  FileText,
  Files,
  ListTodo,
  Mail,
  MessageSquare,
  ScrollText,
  Star,
  type LucideIcon,
} from "lucide-react";
import type { ContextHubNodeData } from "./types";

const ICONS: Record<NonNullable<ContextHubNodeData["kind"]>, LucideIcon> = {
  contextFile: ScrollText,
  transcript: FileText,
  chat: MessageSquare,
  mail: Mail,
  tasks: ListTodo,
  ratings: Star,
  docs: Files,
  calendar: Calendar,
};

function HiddenHandle({
  type,
  position,
}: {
  type: "source" | "target";
  position: Position;
}) {
  return (
    <Handle
      type={type}
      position={position}
      isConnectable={false}
      className="context-hub-flow__handle"
    />
  );
}

export function HubNode({ data }: NodeProps<Node<ContextHubNodeData>>) {
  return (
    <div className="context-hub-node context-hub-node--hub">
      <HiddenHandle type="target" position={Position.Left} />
      <HiddenHandle type="source" position={Position.Right} />
      <span className="context-hub-node__hub-title">{data.label}</span>
      {data.sublabel ? (
        <span className="context-hub-node__hub-sub">{data.sublabel}</span>
      ) : null}
    </div>
  );
}

export function SignalNode({ data }: NodeProps<Node<ContextHubNodeData>>) {
  const isContextFile = data.kind === "contextFile";
  const Icon = data.kind ? ICONS[data.kind] : FileText;

  return (
    <div
      className={[
        "context-hub-node context-hub-node--signal",
        isContextFile ? "context-hub-node--signal-context-file" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <HiddenHandle type="source" position={Position.Right} />
      {!isContextFile ? (
        <Icon className="context-hub-node__icon" aria-hidden strokeWidth={1.5} />
      ) : null}
      <div className="context-hub-node__signal-copy">
        <span className="context-hub-node__label">{data.label}</span>
        {data.sublabel ? (
          <span className="context-hub-node__signal-sub">{data.sublabel}</span>
        ) : null}
      </div>
    </div>
  );
}

export function FileNode({ data }: NodeProps<Node<ContextHubNodeData>>) {
  return (
    <div className="context-hub-node context-hub-node--file">
      <HiddenHandle type="target" position={Position.Left} />
      <HiddenHandle type="source" position={Position.Right} />
      <span className="context-hub-node__file-label">{data.label}</span>
      {data.sublabel ? (
        <span className="context-hub-node__file-sub">{data.sublabel}</span>
      ) : null}
    </div>
  );
}

export function OutcomeNode({ data }: NodeProps<Node<ContextHubNodeData>>) {
  return (
    <div className="context-hub-node context-hub-node--outcome">
      <HiddenHandle type="target" position={Position.Left} />
      <span className="context-hub-node__outcome-label">{data.label}</span>
    </div>
  );
}
