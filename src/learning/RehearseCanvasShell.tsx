import { useLayoutEffect, useRef } from "react";
import { useCoachSession } from "../context/CoachSessionContext";

export function RehearseCanvasShell() {
  const { attachStudioSlot } = useCoachSession();
  const mountRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const node = mountRef.current;
    if (!node) return;
    attachStudioSlot(node);
    return () => attachStudioSlot(null);
  }, [attachStudioSlot]);

  return (
    <div className="learning-canvas learning-canvas--rehearse">
      <div ref={mountRef} className="coach-embedded__slot" />
    </div>
  );
}
