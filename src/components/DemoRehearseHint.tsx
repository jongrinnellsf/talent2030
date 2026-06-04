import { useId } from "react";
import { InfoCircledIcon } from "@radix-ui/react-icons";

/** Shown when delivery playbook practice links are disabled (demo is Mark-only). */
export function DemoRehearseHint() {
  const panelId = useId();

  return (
    <p className="delivery-playbook__demo-hint">
      <span className="path-sources-tooltip path-sources-tooltip--inline">
        <button
          type="button"
          className="path-sources-tooltip__trigger"
          aria-describedby={panelId}
        >
          <InfoCircledIcon className="path-sources-tooltip__icon" aria-hidden />
          Practice rehearsal
        </button>
        <span id={panelId} role="tooltip" className="path-sources-tooltip__panel">
          In this demo, only Mark Webb has an active Meet-style practice scenario.
        </span>
      </span>
    </p>
  );
}
