import { useMemo, useState } from "react";
import { CopyIcon } from "@radix-ui/react-icons";
import { useAgentContext } from "../../context/AgentContextProvider";
import { ORG_NAME } from "../../data/agent-context/talentManagementSeed";
import { getDirectReport } from "../../data/directReports";

type SettingsTab = "about" | "talent" | "employee";

export function AgentContextSettings() {
  const {
    talentManagementMarkdown,
    employeeMarkdown,
    employeeLastUpdatedAt,
    sessionFocusEmployeeId,
    sessionFocusMarkdown,
  } = useAgentContext();

  const [tab, setTab] = useState<SettingsTab>("about");
  const [copied, setCopied] = useState<"talent" | "employee" | null>(null);
  const [showFocus, setShowFocus] = useState(true);

  const focusName = sessionFocusEmployeeId
    ? getDirectReport(sessionFocusEmployeeId)?.name
    : null;

  const updatedLabel = useMemo(() => {
    if (!employeeLastUpdatedAt) return null;
    const seconds = Math.round((Date.now() - employeeLastUpdatedAt) / 1000);
    if (seconds < 8) return "Updated just now";
    if (seconds < 60) return `Updated ${seconds}s ago`;
    return `Updated ${Math.round(seconds / 60)}m ago`;
  }, [employeeLastUpdatedAt, employeeMarkdown]);

  const handleCopy = async (which: "talent" | "employee") => {
    const text = which === "talent" ? talentManagementMarkdown : employeeMarkdown;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(which);
      window.setTimeout(() => setCopied(null), 1800);
    } catch {
      setCopied(null);
    }
  };

  const tabs: { id: SettingsTab; label: string; hint?: string }[] = [
    { id: "about", label: "Overview" },
    { id: "talent", label: "talentmanagement.md", hint: "Shared" },
    { id: "employee", label: "employee.md", hint: "Shared" },
  ];

  return (
    <div className="agent-context-settings">
      <nav className="agent-context-settings__nav" aria-label="Settings sections">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`agent-context-settings__nav-item${
              tab === item.id ? " agent-context-settings__nav-item--active" : ""
            }`}
            onClick={() => setTab(item.id)}
          >
            <span className="agent-context-settings__nav-label">{item.label}</span>
            {item.hint && (
              <span className="agent-context-settings__nav-hint">{item.hint}</span>
            )}
          </button>
        ))}
      </nav>

      <div className="agent-context-settings__panel">
        {tab === "about" && (
          <div className="agent-context-settings__about admin-explainer__about">
            <section className="demo-settings-callout">
              <p className="demo-settings-callout__eyebrow">{ORG_NAME}</p>
              <h2 className="demo-settings-callout__title">How agent context works</h2>
              <p className="demo-settings-callout__lead">
                These demos ground Gemini Live in markdown files—your company process and the
                person using the app—instead of a black-box prompt. What you see here is what the
                coach receives at session start (plus ephemeral updates as you use the demo).
              </p>
            </section>

            <section className="admin-explainer__section">
              <h3 className="admin-explainer__section-title">Two context files</h3>
              <ul className="admin-explainer__list">
                <li>
                  <strong>talentmanagement.md</strong> — Performance cycle, rating scale, COIN
                  delivery framework, and underperformance guidance. Shared context used wherever
                  it is relevant.
                </li>
                <li>
                  <strong>employee.md</strong> — The manager profile (Will Ray): role, team,
                  tools, learning interests, and an <strong>activity log</strong> that grows as you
                  use the demos.
                </li>
              </ul>
            </section>

            <section className="admin-explainer__section">
              <h3 className="admin-explainer__section-title">Blended context across demos</h3>
              <p className="admin-explainer__paragraph">
                These markdown files are shared context, not module-specific files. They can carry
                blended performance + learning context for the same person, and the app uses the
                relevant portions by phase.
              </p>
            </section>

            <section className="admin-explainer__section">
              <h3 className="admin-explainer__section-title">Session focus</h3>
              <p className="admin-explainer__paragraph">
                When direct-report context is active, additional person-specific workplace signals
                are injected into the prompt. This is ephemeral context shown below when present.
              </p>
              {sessionFocusMarkdown && focusName ? (
                <details className="agent-context-inspector__focus" open={showFocus}>
                  <summary
                    className="agent-context-inspector__focus-summary"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowFocus((v) => !v);
                    }}
                  >
                    Also injected this session — {focusName}
                  </summary>
                  <pre className="agent-context-inspector__focus-body">
                    {sessionFocusMarkdown}
                  </pre>
                </details>
              ) : (
                <p className="admin-explainer__paragraph admin-explainer__paragraph--muted">
                  Session-specific context appears here when available.
                </p>
              )}
            </section>

            <section className="admin-explainer__section">
              <h3 className="admin-explainer__section-title">Live updates</h3>
              <p className="admin-explainer__paragraph">
                <code className="admin-explainer__code">employee.md</code> updates in memory during
                the session (team browsing, rehearsals, learning paths).{" "}
                <code className="admin-explainer__code">talentmanagement.md</code> is seeded from
                your HR process doc and stays stable in this demo.
              </p>
            </section>
          </div>
        )}

        {tab === "talent" && (
          <div className="admin-explainer__skill agent-context-settings__file">
            <div className="admin-explainer__skill-toolbar">
              <div>
                <p className="admin-explainer__skill-path">
                  <code>talentmanagement.md</code>
                </p>
                <p className="agent-context-settings__file-desc">
                  Shared company process and coaching frameworks.
                </p>
              </div>
              <button
                type="button"
                className="admin-explainer__copy"
                onClick={() => void handleCopy("talent")}
              >
                <CopyIcon className="h-3.5 w-3.5" aria-hidden />
                {copied === "talent" ? "Copied" : "Copy markdown"}
              </button>
            </div>
            <pre
              className="admin-explainer__skill-source admin-explainer__skill-source--solo agent-context-settings__source agent-context-settings__source--markdown"
              aria-label="talentmanagement.md source"
            >
              {talentManagementMarkdown}
            </pre>
          </div>
        )}

        {tab === "employee" && (
          <div className="admin-explainer__skill agent-context-settings__file">
            <div className="admin-explainer__skill-toolbar">
              <div>
                <p className="admin-explainer__skill-path">
                  <code>employee.md</code>
                  {updatedLabel && (
                    <span className="agent-context-inspector__updated badge badge--idle">
                      {updatedLabel}
                    </span>
                  )}
                </p>
                <p className="agent-context-settings__file-desc">
                  Manager profile and blended activity log across demos.
                </p>
              </div>
              <button
                type="button"
                className="admin-explainer__copy"
                onClick={() => void handleCopy("employee")}
              >
                <CopyIcon className="h-3.5 w-3.5" aria-hidden />
                {copied === "employee" ? "Copied" : "Copy markdown"}
              </button>
            </div>
            <pre
              className="admin-explainer__skill-source admin-explainer__skill-source--solo agent-context-settings__source agent-context-settings__source--markdown"
              aria-label="employee.md source"
            >
              {employeeMarkdown}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
