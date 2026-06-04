import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAgentContext } from "../context/AgentContextProvider";
import { manager } from "../data/manager";
import { getContextForEmployee } from "../data/context";
import { directReports, getDirectReport } from "../data/directReports";
import { resolveEmployeeIdFromSearch } from "../lib/resolveEmployeeId";
import { AppShell } from "./layout/AppShell";
import { ContextBrowser } from "./ContextBrowser";
import { TeamRoster } from "./TeamRoster";

export function DemoWorkspace() {
  const { setSessionFocusEmployeeId, logEmployeeActivity } = useAgentContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const lastActivityReportRef = useRef<string | null>(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(() =>
    resolveEmployeeIdFromSearch(window.location.search)
  );
  const [contextSyncKey, setContextSyncKey] = useState(0);
  const [showSyncFlash, setShowSyncFlash] = useState(false);

  useEffect(() => {
    setSelectedEmployeeId(resolveEmployeeIdFromSearch(searchParams.toString()));
  }, [searchParams]);

  useEffect(() => {
    setSessionFocusEmployeeId(selectedEmployeeId);
  }, [selectedEmployeeId, setSessionFocusEmployeeId]);

  useEffect(() => {
    const report = getDirectReport(selectedEmployeeId);
    if (!report) return;

    const timer = window.setTimeout(() => {
      if (lastActivityReportRef.current === selectedEmployeeId) return;
      lastActivityReportRef.current = selectedEmployeeId;
      logEmployeeActivity({
        area: "Team",
        action: `Reviewed context for ${report.name}`,
        detail: `${report.role} (${report.level}) — ${report.statusLabel}. Browsed self-review, manager review, and workplace signals.`,
      });
    }, 600);

    return () => window.clearTimeout(timer);
  }, [selectedEmployeeId, logEmployeeActivity]);

  const selectedReport = getDirectReport(selectedEmployeeId) ?? directReports[0];
  const contextBundle = useMemo(
    () => getContextForEmployee(selectedEmployeeId),
    [selectedEmployeeId]
  );

  const handleSelectEmployee = useCallback(
    (id: string) => {
      setSelectedEmployeeId(id);
      setSearchParams({ employee: id }, { replace: true });
      setContextSyncKey((k) => k + 1);
      setShowSyncFlash(true);
      window.setTimeout(() => setShowSyncFlash(false), 1800);
    },
    [setSearchParams]
  );

  return (
    <AppShell
      title="Team"
      subtitle={`${manager.name} · ${manager.reviewCycle}`}
      status={
        showSyncFlash ? (
          <span className="badge badge--idle context-sync-flash">Synced</span>
        ) : null
      }
    >
      <section>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[240px_1fr]">
          <TeamRoster
            reports={directReports}
            selectedId={selectedEmployeeId}
            onSelect={handleSelectEmployee}
          />

          <div className="panel min-h-[480px] p-5">
            <ContextBrowser
              report={selectedReport}
              selfReview={contextBundle.selfReview}
              managerReview={contextBundle.managerReview}
              deliveryPlaybook={contextBundle.deliveryPlaybook}
              syncKey={`${selectedEmployeeId}-${contextSyncKey}`}
            />
          </div>
        </div>
      </section>
    </AppShell>
  );
}
