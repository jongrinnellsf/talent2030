export type ContextHubNodeData = {
  label: string;
  sublabel?: string;
  kind?:
    | "contextFile"
    | "transcript"
    | "chat"
    | "mail"
    | "tasks"
    | "ratings"
    | "docs"
    | "calendar";
};
