import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  buildEmployeeMarkdown,
  formatActivityTimestamp,
} from "../data/agent-context/buildEmployeeMarkdown";
import {
  formatEmployeeActivityLine,
  type EmployeeActivityEntry,
} from "../data/agent-context/employeeActivityLog";
import { buildSessionFocusBlock } from "../data/agent-context/sessionFocus";
import { buildTalentManagementMarkdown } from "../data/agent-context/talentManagementSeed";
import type { AgentContextSnapshot } from "../data/buildAgentPrompt";

type AgentContextValue = {
  talentManagementMarkdown: string;
  employeeMarkdown: string;
  employeeLastUpdatedAt: number | null;
  sessionFocusEmployeeId: string | null;
  sessionFocusMarkdown: string | null;
  getContextSnapshot: () => AgentContextSnapshot;
  appendEmployeeActivity: (line: string) => void;
  logEmployeeActivity: (entry: EmployeeActivityEntry) => void;
  recordLearning: (topic: string) => void;
  setSessionFocusEmployeeId: (employeeId: string | null) => void;
};

const AgentContext = createContext<AgentContextValue | null>(null);

export function AgentContextProvider({ children }: { children: ReactNode }) {
  const [talentManagementMarkdown] = useState(() => buildTalentManagementMarkdown());
  const [activityLines, setActivityLines] = useState<string[]>([]);
  const [employeeLastUpdatedAt, setEmployeeLastUpdatedAt] = useState<number | null>(null);
  const [sessionFocusEmployeeId, setSessionFocusEmployeeIdState] = useState<string | null>(
    null
  );

  const employeeMarkdown = useMemo(
    () => buildEmployeeMarkdown({ activityLines }),
    [activityLines]
  );

  const sessionFocusMarkdown = useMemo(() => {
    if (!sessionFocusEmployeeId) return null;
    return buildSessionFocusBlock(sessionFocusEmployeeId);
  }, [sessionFocusEmployeeId]);

  const touchEmployee = useCallback(() => {
    setEmployeeLastUpdatedAt(Date.now());
  }, []);

  const appendEmployeeActivity = useCallback(
    (line: string) => {
      const trimmed = line.trim();
      if (!trimmed) return;
      const stamped = `${formatActivityTimestamp()} — ${trimmed}`;
      setActivityLines((prev) => {
        if (prev[0] === stamped) return prev;
        return [stamped, ...prev].slice(0, 32);
      });
      touchEmployee();
    },
    [touchEmployee]
  );

  const logEmployeeActivity = useCallback(
    (entry: EmployeeActivityEntry) => {
      appendEmployeeActivity(formatEmployeeActivityLine(entry));
    },
    [appendEmployeeActivity]
  );

  const recordLearning = useCallback(
    (topic: string) => {
      logEmployeeActivity({
        area: "Learning path",
        action: `Studied ${topic.trim()}`,
        detail: "Guided skill path activity in Coach.",
      });
    },
    [logEmployeeActivity]
  );

  const setSessionFocusEmployeeId = useCallback((employeeId: string | null) => {
    setSessionFocusEmployeeIdState(employeeId);
  }, []);

  const getContextSnapshot = useCallback(
    (): AgentContextSnapshot => ({
      talentManagementMd: talentManagementMarkdown,
      employeeMd: employeeMarkdown,
    }),
    [talentManagementMarkdown, employeeMarkdown]
  );

  const value = useMemo(
    () => ({
      talentManagementMarkdown,
      employeeMarkdown,
      employeeLastUpdatedAt,
      sessionFocusEmployeeId,
      sessionFocusMarkdown,
      getContextSnapshot,
      appendEmployeeActivity,
      logEmployeeActivity,
      recordLearning,
      setSessionFocusEmployeeId,
    }),
    [
      talentManagementMarkdown,
      employeeMarkdown,
      employeeLastUpdatedAt,
      sessionFocusEmployeeId,
      sessionFocusMarkdown,
      getContextSnapshot,
      appendEmployeeActivity,
      logEmployeeActivity,
      recordLearning,
      setSessionFocusEmployeeId,
    ]
  );

  return <AgentContext.Provider value={value}>{children}</AgentContext.Provider>;
}

export function useAgentContext(): AgentContextValue {
  const ctx = useContext(AgentContext);
  if (!ctx) {
    throw new Error("useAgentContext must be used within AgentContextProvider");
  }
  return ctx;
}

export function useOptionalAgentContext(): AgentContextValue | null {
  return useContext(AgentContext);
}
