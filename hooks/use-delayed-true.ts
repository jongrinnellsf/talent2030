import { useEffect, useState } from "react";

/** Becomes true only after `active` stays true for `delayMs` (resets when inactive). */
export function useDelayedTrue(active: boolean, delayMs: number): boolean {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!active) {
      setVisible(false);
      return;
    }

    const timer = window.setTimeout(() => setVisible(true), delayMs);
    return () => {
      window.clearTimeout(timer);
      setVisible(false);
    };
  }, [active, delayMs]);

  return visible;
}
