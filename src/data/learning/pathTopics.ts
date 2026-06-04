export type PathTopic = {
  id: string;
  title: string;
  description: string;
};

export const PATH_TOPICS: PathTopic[] = [
  {
    id: "gemini-ai",
    title: "Gemini AI",
    description: "Google's Gemini models: capabilities, prompting, APIs, and using them well at work.",
  },
  {
    id: "claude-code",
    title: "Claude Code",
    description: "Agentic coding with Claude: setup, workflows, and when to trust the agent.",
  },
  {
    id: "openai-codex",
    title: "Codex (OpenAI)",
    description: "OpenAI's coding agent: CLI setup, delegation, and shipping changes safely.",
  },
  {
    id: "cursor",
    title: "Cursor",
    description: "The AI-native IDE: agents, Composer, rules, and building with context.",
  },
];

export function getPathTopic(id: string): PathTopic | undefined {
  return PATH_TOPICS.find((topic) => topic.id === id);
}
