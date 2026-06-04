import { GroupIcon } from "@radix-ui/react-icons";
import {
  type AgentVisualizerState,
} from "@/hooks/agents-ui/use-agent-audio-visualizer-wave";
import { useAnalyserVolume } from "@/hooks/use-audio-analyser-volume";
import { SESSION_MODE_DESCRIPTIONS } from "../data/sessionModes";
import { manager } from "../data/manager";
import type { HudCueItem } from "../types";
import { PracticeHud } from "./practice/PracticeHud";
import { SimulateMeetStage } from "./simulate/SimulateMeetStage";

const VOLUME_THRESHOLD = 0.02;

function deriveVisualizerState(
  isConnected: boolean,
  isConnecting: boolean,
  coachPlaying: boolean,
  coachVolume: number,
  isMicActive: boolean,
  micVolume: number
): { state: AgentVisualizerState; volume: number } {
  if (!isConnected && !isConnecting) {
    return { state: "disconnected", volume: 0 };
  }
  if (isConnecting) {
    return { state: "connecting", volume: 0 };
  }
  if (coachPlaying || coachVolume > VOLUME_THRESHOLD) {
    return { state: "speaking", volume: coachVolume };
  }
  if (isMicActive && micVolume > VOLUME_THRESHOLD) {
    return { state: "listening", volume: micVolume };
  }
  return { state: "thinking", volume: 0 };
}

const STATE_LABELS: Record<AgentVisualizerState, string> = {
  disconnected: "Ready to rehearse",
  connecting: "Connecting…",
  initializing: "Starting session…",
  listening: "Mark listening",
  thinking: "Mark thinking",
  speaking: "Mark speaking",
};

type CoachSessionVisualizerProps = {
  isConnected: boolean;
  isConnecting: boolean;
  isMicActive: boolean;
  coachPlaying: boolean;
  micAnalyser: AnalyserNode | null;
  coachAnalyser: AnalyserNode | null;
  employeeName: string;
  employeePhotoUrl?: string;
  variant?: "default" | "studio";
  awaitingSelection?: boolean;
  hudCues?: HudCueItem[];
  liveCoachingEnabled?: boolean;
};

export function CoachSessionVisualizer({
  isConnected,
  isConnecting,
  isMicActive,
  coachPlaying,
  micAnalyser,
  coachAnalyser,
  employeeName,
  employeePhotoUrl,
  variant = "default",
  awaitingSelection = false,
  hudCues = [],
  liveCoachingEnabled = false,
}: CoachSessionVisualizerProps) {
  const micVolume = useAnalyserVolume(micAnalyser);
  const coachVolume = useAnalyserVolume(coachAnalyser);
  const { state, volume } = deriveVisualizerState(
    isConnected,
    isConnecting,
    coachPlaying,
    coachVolume,
    isMicActive,
    micVolume
  );
  const liveSession = isConnected || isConnecting;
  const stageClass =
    variant === "studio"
      ? `audio-stage audio-stage--studio${
          liveSession ? " audio-stage--simulate-meet" : ""
        }`
      : "audio-stage relative flex min-h-[280px] flex-1 flex-col items-center justify-center overflow-hidden px-6 md:min-h-[380px]";

  const showRehearseMeet = liveSession;
  const managerIsSpeaking = state === "listening";

  const idleDescription = awaitingSelection
    ? "Choose someone on Team, then return here to rehearse."
    : `${SESSION_MODE_DESCRIPTIONS.rehearse} · ${employeeName}`;

  return (
    <div className={stageClass}>
      {showRehearseMeet && (
        <SimulateMeetStage
          managerName={manager.name}
          managerPhotoUrl={manager.photoUrl}
          managerIsSpeaking={managerIsSpeaking}
          employeeName={employeeName}
          employeePhotoUrl={employeePhotoUrl}
          markIsSpeaking={state === "speaking"}
          statusLabel={STATE_LABELS[state]}
        />
      )}

      {liveSession && liveCoachingEnabled && <PracticeHud cues={hudCues} />}

      {!showRehearseMeet ? (
        <div className="relative z-10 flex w-full max-w-[560px] flex-col items-center gap-3 px-4 text-center">
          <GroupIcon className="h-8 w-8 text-white/40" />
          <p className="text-sm font-medium text-white/70">
            {STATE_LABELS.disconnected}
          </p>
          <p className="max-w-[280px] text-[0.8125rem] leading-relaxed text-white/45">
            {idleDescription}
          </p>
        </div>
      ) : null}
    </div>
  );
}
