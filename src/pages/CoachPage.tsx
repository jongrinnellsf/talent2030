import { useCallback, useEffect, useRef } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { AppShell } from "../components/layout/AppShell";
import { CoachBackButton } from "../components/learning/CoachBackButton";
import { useCoachSession } from "../context/CoachSessionContext";
import { useLearningSession } from "../context/LearningSessionContext";
import { DEFAULT_EMPLOYEE_ID, getDirectReport } from "../data/directReports";
import { parseSimulateScenario } from "../data/simulateScenarios";
import { LearningCanvas } from "../learning/LearningCanvas";
import LiveLearnerApp from "../lib/LiveLearnerApp";
import { isTalentCoachPath } from "../routes";

function coachSubtitle(phase: string, employeeName: string): string {
  if (phase === "rehearse") {
    return `Rehearse · ${employeeName}`;
  }
  if (phase === "manager_coach") {
    return "Performance, leadership, and team questions with voice + canvas";
  }
  if (phase === "freeform") {
    return "Explore freely with voice—the canvas updates as you go";
  }
  if (phase === "select_topic") {
    return "Plan, learn, explore, or rehearse delivery";
  }
  if (phase === "path" || phase === "intake" || phase === "generating") {
    return "Guided skill path with voice coach";
  }
  if (phase === "assessment" || phase === "complete") {
    return "Skill path";
  }
  return "Voice coach and live canvas";
}

function rehearseIntentKey(params: URLSearchParams): string | null {
  if (params.get("surface") !== "rehearse" && params.get("mode") !== "rehearse") {
    return null;
  }
  return `rehearse:${params.get("scenario") ?? "default"}:${params.get("autostart") ?? ""}`;
}

export function CoachPage() {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { updateConfig, stopRehearseSessionRef } = useCoachSession();
  const {
    spec,
    isGenerating,
    generateError,
    phase,
    startManagerCoach,
    startFreeform,
    startRehearse,
    returnToCoachHome,
  } = useLearningSession();
  const handledIntentRef = useRef<string | null>(null);

  const handleBackToCoachHome = useCallback(() => {
    stopRehearseSessionRef.current?.();
    handledIntentRef.current = null;
    returnToCoachHome();
  }, [returnToCoachHome, stopRehearseSessionRef]);

  const markReport = getDirectReport(DEFAULT_EMPLOYEE_ID);
  const employeeName = markReport?.name ?? "Mark Webb";

  useEffect(() => {
    if (!isTalentCoachPath(location.pathname)) {
      handledIntentRef.current = null;
      return;
    }

    const surface = searchParams.get("surface");
    const legacyMode = searchParams.get("mode");
    const rehearseKey = rehearseIntentKey(searchParams);

    if (rehearseKey) {
      if (handledIntentRef.current === rehearseKey && phase === "rehearse") {
        return;
      }

      handledIntentRef.current = rehearseKey;
      const scenario = parseSimulateScenario(searchParams.get("scenario"));
      const autostart = searchParams.get("autostart") === "1";

      startRehearse();
      updateConfig({
        employeeId: DEFAULT_EMPLOYEE_ID,
        employeeName,
        autoStartSession: autostart,
        simulateScenario: scenario,
        liveCoachingEnabled: true,
      });

      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.delete("surface");
          next.delete("mode");
          if (autostart) next.delete("autostart");
          return next;
        },
        { replace: true }
      );
      return;
    }

    if (legacyMode === "brainstorm" || searchParams.get("mode") === "coach") {
      const intentKey = `coach:${searchParams.get("employee") ?? ""}`;
      if (handledIntentRef.current === intentKey && phase === "manager_coach") {
        return;
      }
      handledIntentRef.current = intentKey;

      const employeeId = searchParams.get("employee")?.trim() || null;
      if (employeeId && !getDirectReport(employeeId)) {
        startManagerCoach(null);
      } else {
        startManagerCoach(employeeId);
      }
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.delete("mode");
          if (next.get("autostart") === "1") next.delete("autostart");
          return next;
        },
        { replace: true }
      );
      return;
    }

    if (surface === "freeform") {
      if (handledIntentRef.current === "freeform" && phase === "freeform") {
        return;
      }
      handledIntentRef.current = "freeform";
      startFreeform();
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.delete("surface");
          return next;
        },
        { replace: true }
      );
    }
  }, [
    location.pathname,
    phase,
    searchParams,
    setSearchParams,
    startManagerCoach,
    startFreeform,
    startRehearse,
    updateConfig,
    employeeName,
  ]);

  useEffect(() => {
    if (phase !== "rehearse") return;
    if (searchParams.get("autostart") !== "1") return;

    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete("autostart");
        return next;
      },
      { replace: true }
    );
    updateConfig({ autoStartSession: false });
  }, [phase, searchParams, setSearchParams, updateConfig]);

  const title =
    phase === "rehearse"
      ? "Coach · Rehearse"
      : phase === "manager_coach"
        ? "Coach · Manager copilot"
        : "Coach";

  const topbarAction =
    phase !== "select_topic" ? (
      <CoachBackButton onClick={handleBackToCoachHome} />
    ) : undefined;

  return (
    <AppShell
      title={title}
      subtitle={coachSubtitle(phase, employeeName)}
      action={topbarAction}
      fullHeight
      shellClassName="app-shell--learner"
    >
      <div
        className={`learner-layout${phase === "rehearse" ? " learner-layout--rehearse" : ""}`}
      >
        <section className="learner-layout__canvas">
          <LearningCanvas
            spec={spec}
            loading={isGenerating}
            error={generateError}
          />
        </section>

        {phase !== "rehearse" && (
          <aside className="learner-layout__aside">
            <LiveLearnerApp />
          </aside>
        )}
      </div>
    </AppShell>
  );
}
