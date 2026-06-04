import type { LearningSpec } from "../learning/catalog";

export type LearningStreamEvent =
  | { type: "start"; goal?: LearningSpec }
  | { type: "spec"; spec: LearningSpec }
  | { type: "done"; spec: LearningSpec }
  | { type: "error"; message: string };

export async function streamLearningPath(
  goal: string,
  handlers: {
    onSpec: (spec: LearningSpec) => void;
    onDone: (spec: LearningSpec) => void;
    onError: (message: string) => void;
  }
): Promise<void> {
  const response = await fetch("/api/learning/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ goal }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    handlers.onError(
      typeof err.error === "string" ? err.error : "Failed to generate learning path."
    );
    return;
  }

  const reader = response.body?.getReader();
  if (!reader) {
    handlers.onError("No response stream.");
    return;
  }

  const decoder = new TextDecoder();
  let buffer = "";

  let receivedDone = false;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      try {
        const event = JSON.parse(line.slice(6)) as LearningStreamEvent;
        if (event.type === "spec" && event.spec) {
          handlers.onSpec(event.spec);
        }
        if (event.type === "done" && event.spec) {
          receivedDone = true;
          handlers.onDone(event.spec);
        }
        if (event.type === "error") {
          handlers.onError(event.message);
        }
      } catch {
        // skip malformed chunk
      }
    }
  }

  if (!receivedDone) {
    handlers.onError("Generation stream ended early.");
  }
}
