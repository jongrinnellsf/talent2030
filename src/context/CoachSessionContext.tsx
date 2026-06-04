import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { buildRehearsePath } from "../routes";
import LiveManagerApp from "../lib/LiveManagerApp";
import { ActiveSessionFloater } from "../components/ActiveSessionFloater";
import { DEFAULT_EMPLOYEE_ID } from "../data/directReports";
import type { SimulateScenarioId } from "../data/simulateScenarios";
import type { SessionActivity, SessionMode } from "../types";

export type { SessionActivity };

export type CoachSessionConfig = {
  employeeId: string;
  employeeName: string;
  sessionMode: SessionMode;
  sessionReady: boolean;
  autoStartSession: boolean;
  simulateScenario: SimulateScenarioId;
  /** HUD delivery cues during Rehearse (on by default; user can toggle off). */
  liveCoachingEnabled: boolean;
};

type CoachSessionContextValue = {
  config: CoachSessionConfig;
  updateConfig: (patch: Partial<CoachSessionConfig>) => void;
  attachStudioSlot: (element: HTMLElement | null) => void;
  isSessionLive: boolean;
  setIsSessionLive: (live: boolean) => void;
  sessionActivity: SessionActivity | null;
  setSessionActivity: (activity: SessionActivity | null) => void;
  studioPath: string;
  stopRehearseSessionRef: MutableRefObject<(() => void) | null>;
};

const defaultConfig: CoachSessionConfig = {
  employeeId: DEFAULT_EMPLOYEE_ID,
  employeeName: "Mark Webb",
  sessionMode: "rehearse",
  sessionReady: true,
  autoStartSession: false,
  simulateScenario: "default",
  liveCoachingEnabled: true,
};

const CoachSessionContext = createContext<CoachSessionContextValue | null>(null);

function buildStudioPath(config: CoachSessionConfig): string {
  const params = new URLSearchParams();
  if (config.simulateScenario !== "default") {
    params.set("scenario", config.simulateScenario);
  }
  return buildRehearsePath(params);
}

function createSessionHostElement(): HTMLDivElement {
  const host = document.createElement("div");
  host.className = "coach-studio__session-mount session-keepalive__inner";
  host.setAttribute("aria-hidden", "true");
  return host;
}

export function CoachSessionProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<CoachSessionConfig>(defaultConfig);
  const [isSessionLive, setIsSessionLive] = useState(false);
  const [sessionActivity, setSessionActivity] = useState<SessionActivity | null>(null);
  const [portalReady, setPortalReady] = useState(false);

  const configRef = useRef(config);
  const keepAliveRef = useRef<HTMLDivElement>(null);
  const sessionHostRef = useRef<HTMLDivElement | null>(null);
  const studioSlotRef = useRef<HTMLElement | null>(null);
  const stopRehearseSessionRef = useRef<(() => void) | null>(null);

  configRef.current = config;

  if (!sessionHostRef.current && typeof document !== "undefined") {
    sessionHostRef.current = createSessionHostElement();
  }

  const reparentSessionHost = useCallback(() => {
    const host = sessionHostRef.current;
    const keepAlive = keepAliveRef.current;
    if (!host || !keepAlive) return;

    const studioSlot = studioSlotRef.current;
    const parent = studioSlot ?? keepAlive;

    if (studioSlot) {
      host.className = "coach-studio__session-mount";
      host.removeAttribute("aria-hidden");
    } else {
      host.className = "coach-studio__session-mount session-keepalive__inner";
      host.setAttribute("aria-hidden", "true");
    }

    if (host.parentElement !== parent) {
      parent.appendChild(host);
    }
  }, []);

  const attachStudioSlot = useCallback(
    (element: HTMLElement | null) => {
      studioSlotRef.current = element;
      reparentSessionHost();
    },
    [reparentSessionHost]
  );

  const updateConfig = useCallback((patch: Partial<CoachSessionConfig>) => {
    setConfig((prev) => ({ ...prev, ...patch }));
  }, []);

  useLayoutEffect(() => {
    reparentSessionHost();
    setPortalReady(Boolean(sessionHostRef.current));
  }, [reparentSessionHost]);

  const studioPath = useMemo(() => buildStudioPath(config), [config]);

  const value = useMemo(
    () => ({
      config,
      updateConfig,
      attachStudioSlot,
      isSessionLive,
      setIsSessionLive,
      sessionActivity,
      setSessionActivity,
      studioPath,
      stopRehearseSessionRef,
    }),
    [config, updateConfig, attachStudioSlot, isSessionLive, sessionActivity, studioPath]
  );

  return (
    <CoachSessionContext.Provider value={value}>
      {children}
      <ActiveSessionFloater />
      <div ref={keepAliveRef} className="session-keepalive" />
      {portalReady &&
        sessionHostRef.current &&
        createPortal(
          <LiveManagerApp
            layout="embedded"
            employeeId={config.employeeId}
            employeeName={config.employeeName}
            sessionMode={config.sessionMode}
            simulateScenario={config.simulateScenario}
            autoStartSession={config.autoStartSession}
            sessionReady={config.sessionReady}
            onSessionActiveChange={setIsSessionLive}
            onSessionActivityChange={setSessionActivity}
          />,
          sessionHostRef.current
        )}
    </CoachSessionContext.Provider>
  );
}

export function useCoachSession() {
  const ctx = useContext(CoachSessionContext);
  if (!ctx) {
    throw new Error("useCoachSession must be used within CoachSessionProvider");
  }
  return ctx;
}

export function useOptionalCoachSession() {
  return useContext(CoachSessionContext);
}
