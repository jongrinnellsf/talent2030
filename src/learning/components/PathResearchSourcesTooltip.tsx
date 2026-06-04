import { useId } from "react";
import { InfoCircledIcon } from "@radix-ui/react-icons";
import type { WebSearchSource } from "../../lib/groundingSources";

type PathResearchSourcesTooltipProps = {
  sources: WebSearchSource[];
};

export function PathResearchSourcesTooltip({ sources }: PathResearchSourcesTooltipProps) {
  const panelId = useId();
  if (sources.length === 0) return null;

  return (
    <span className="path-sources-tooltip">
      <button
        type="button"
        className="path-sources-tooltip__trigger"
        aria-describedby={panelId}
      >
        <InfoCircledIcon className="path-sources-tooltip__icon" aria-hidden />
        Path built with web sources
      </button>
      <span
        id={panelId}
        role="tooltip"
        className="path-sources-tooltip__panel"
      >
        <span className="path-sources-tooltip__panel-title">Sources</span>
        <ul className="path-sources-tooltip__list">
          {sources.slice(0, 8).map((source) => (
            <li key={source.uri}>
              <a href={source.uri} target="_blank" rel="noopener noreferrer">
                {source.title}
              </a>
            </li>
          ))}
        </ul>
      </span>
    </span>
  );
}
