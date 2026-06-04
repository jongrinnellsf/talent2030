import { SpeakerOffIcon } from "@radix-ui/react-icons";

type SimulateMeetStageProps = {
  managerName: string;
  managerPhotoUrl: string;
  managerIsSpeaking: boolean;
  employeeName: string;
  employeePhotoUrl?: string;
  markIsSpeaking: boolean;
  statusLabel: string;
};

export function SimulateMeetStage({
  managerName,
  managerPhotoUrl,
  managerIsSpeaking,
  employeeName,
  employeePhotoUrl = "/employees/markwebb.png",
  markIsSpeaking,
  statusLabel,
}: SimulateMeetStageProps) {
  return (
    <div className="meet-stage">
      <div className="meet-stage__chrome">
        <span className="meet-stage__meeting-label">Performance review</span>
      </div>

      <div
        className={`meet-canvas-mark${markIsSpeaking ? " meet-canvas-mark--speaking" : ""}`}
        role="status"
        aria-live={markIsSpeaking ? "polite" : "off"}
      >
        <div className="meet-canvas-mark__avatar-wrap">
          <img
            src={employeePhotoUrl}
            alt=""
            className="meet-canvas-mark__photo"
          />
          {markIsSpeaking && (
            <div className="meet-canvas-mark__speaking-ring" aria-hidden />
          )}
        </div>
        <div className="meet-canvas-mark__footer">
          <span className="meet-canvas-mark__name">{employeeName}</span>
          {markIsSpeaking ? (
            <div className="meet-participant__speaking-meta">
              <span className="meet-participant__wave" aria-hidden>
                <span />
                <span />
                <span />
              </span>
              <span className="meet-participant__badge">Speaking</span>
            </div>
          ) : (
            <SpeakerOffIcon className="meet-participant__mic-off" aria-hidden />
          )}
        </div>
      </div>

      <div
        className={`practice-webcam practice-webcam--simulate-pip practice-webcam--profile${
          managerIsSpeaking ? " practice-webcam--speaking" : ""
        }`}
        role="status"
        aria-live={managerIsSpeaking ? "polite" : "off"}
        aria-label={managerIsSpeaking ? `${managerName} speaking` : managerName}
      >
        <img
          src={managerPhotoUrl}
          alt=""
          className="practice-webcam__photo"
        />
        {managerIsSpeaking && (
          <div className="meet-participant__speaking-ring" aria-hidden />
        )}
        <div className="practice-webcam__pip-footer">
          <span className="practice-webcam__pip-name">{managerName}</span>
          {managerIsSpeaking ? (
            <div className="meet-participant__speaking-meta">
              <span className="meet-participant__wave" aria-hidden>
                <span />
                <span />
                <span />
              </span>
              <span className="meet-participant__badge">Speaking</span>
            </div>
          ) : (
            <SpeakerOffIcon className="meet-participant__mic-off" aria-hidden />
          )}
        </div>
      </div>

      <p className="meet-stage__status">{statusLabel}</p>
    </div>
  );
}
