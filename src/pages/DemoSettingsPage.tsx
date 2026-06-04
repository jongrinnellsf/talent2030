import { Link } from "react-router-dom";
import { AgentContextSettings } from "../components/settings/AgentContextSettings";
import { ORG_NAME } from "../data/agent-context/talentManagementSeed";
import { AppShell } from "../components/layout/AppShell";
import { ROUTES } from "../routes";

export function DemoSettingsPage() {
  return (
    <AppShell
      title="Settings"
      subtitle="Shared markdown context used across the talent demo"
      showModuleNav={false}
      action={
        <Link
          to={ROUTES.talent.root}
          className="btn-ghost inline-flex items-center gap-2 px-3 py-2 text-[0.8125rem]"
        >
          Back to demo
        </Link>
      }
      shellClassName="app-shell--settings"
    >
      <div className="demo-settings-page">
        <div className="demo-settings-page__hero">
          <div className="demo-settings-page__hero-badges">
            <span className="admin-explainer__badge">Live context</span>
            <span className="admin-explainer__badge admin-explainer__badge--muted">Demo</span>
          </div>
          <p className="demo-settings-page__hero-text">
            Inspect and copy the shared markdown context the coach reads across demos. These files
            are blended context for the same employee and process, reused throughout{" "}
            {ORG_NAME}.
          </p>
        </div>
        <AgentContextSettings />
      </div>
    </AppShell>
  );
}
