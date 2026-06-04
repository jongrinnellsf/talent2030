import { useAnalyserVolume } from "@/hooks/use-audio-analyser-volume";
import { useRotatingMessage } from "@/hooks/use-rotating-message";
import type { CoachActivity } from "../context/LearningSessionContext";
import {
  CANVAS_UPDATE_LOADING_MESSAGES,
  COACH_PROCESSING_LOADING_MESSAGES,
  LOADING_MESSAGE_INTERVAL_MS,
  PATH_GENERATION_LOADING_MESSAGES,
} from "../data/learning/loadingMessages";

const VOLUME_THRESHOLD = 0.02;

function SpeakingBars({ active }: { active: boolean }) {
  return (
    <div
      className={`live-learner-voice-meter__bars${active ? " live-learner-voice-meter__bars--active" : ""}`}
      aria-hidden
    >
      <span />
      <span />
      <span />
    </div>
  );
}

function ThinkingBars() {
  return (
    <div className="live-learner-voice-meter__bars live-learner-voice-meter__bars--thinking" aria-hidden>
      <span />
      <span />
      <span />
    </div>
  );
}

function thinkingMessages(coachActivity: CoachActivity, pathGenerating: boolean): readonly string[] {
  if (coachActivity.phase === "updating_canvas") {
    return CANVAS_UPDATE_LOADING_MESSAGES;
  }
  if (pathGenerating) {
    return PATH_GENERATION_LOADING_MESSAGES;
  }
  return COACH_PROCESSING_LOADING_MESSAGES;
}

type LearnerSessionVisualizerProps = {
  isConnected: boolean;
  isConnecting: boolean;
  isMicActive: boolean;
  coachPlaying: boolean;
  micAnalyser: AnalyserNode | null;
  coachAnalyser: AnalyserNode | null;
  coachActivity: CoachActivity;
  pathGenerating?: boolean;
};

export function LearnerSessionVisualizer({
  isConnected,
  isConnecting,
  isMicActive,
  coachPlaying,
  micAnalyser,
  coachAnalyser,
  coachActivity,
  pathGenerating = false,
}: LearnerSessionVisualizerProps) {
  const micVolume = useAnalyserVolume(micAnalyser);
  const coachVolume = useAnalyserVolume(coachAnalyser);
  const liveSession = isConnected || isConnecting;

  const coachSpeaking =
    liveSession &&
    !isConnecting &&
    (coachPlaying || coachVolume > VOLUME_THRESHOLD);
  const userSpeaking =
    liveSession &&
    !isConnecting &&
    !coachSpeaking &&
    isMicActive &&
    micVolume > VOLUME_THRESHOLD;
  const isSpeaking = coachSpeaking || userSpeaking;
  const isThinking =
    liveSession &&
    !isConnecting &&
    !isSpeaking &&
    (coachActivity.phase === "processing" || coachActivity.phase === "updating_canvas");

  const thinkingLabel = useRotatingMessage(
    thinkingMessages(coachActivity, pathGenerating),
    isThinking,
    LOADING_MESSAGE_INTERVAL_MS
  );

  let label = "Listening";
  if (!isConnected && !isConnecting) label = "Ready to learn";
  else if (isConnecting) label = "Connecting…";
  else if (coachSpeaking) label = "Coach speaking";
  else if (userSpeaking) label = "Listening to you";
  else if (isThinking) label = thinkingLabel;

  return (
    <div
      className={`live-learner-voice-meter${liveSession ? " live-learner-voice-meter--live" : ""}${
        isThinking ? " live-learner-voice-meter--thinking" : ""
      }`}
      aria-live="polite"
      role="status"
    >
      {liveSession && (
        <div className="live-learner-voice-meter__indicator">
          {isThinking ? (
            <ThinkingBars />
          ) : (
            <SpeakingBars active={isSpeaking} />
          )}
        </div>
      )}
      <p className="live-learner-voice-meter__status">{label}</p>
      {!liveSession && (
        <p className="live-learner-voice-meter__hint">
          Start voice and the canvas updates as you talk.
        </p>
      )}
    </div>
  );
}
