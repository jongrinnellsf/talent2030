import { useEffect, useState } from "react";

/**
 * Cycles through `messages` while `active` is true. Resets to the first line when inactive.
 */
export function useRotatingMessage(
  messages: readonly string[],
  active: boolean,
  intervalMs: number
): string {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!active || messages.length === 0) {
      setIndex(0);
      return;
    }

    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % messages.length);
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [active, messages, intervalMs]);

  if (messages.length === 0) return "";
  return messages[index] ?? messages[0];
}
