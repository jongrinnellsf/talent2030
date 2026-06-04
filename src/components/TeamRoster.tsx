import type { DirectReport } from "../types";

type TeamRosterProps = {
  reports: DirectReport[];
  selectedId: string;
  onSelect: (id: string) => void;
  disabled?: boolean;
};

export function TeamRoster({
  reports,
  selectedId,
  onSelect,
  disabled,
}: TeamRosterProps) {
  return (
    <div>
      <p className="section-label">Direct reports</p>
      <div className="mt-2 flex flex-col gap-0.5">
        {reports.map((report) => {
          const selected = report.id === selectedId;
          return (
            <button
              key={report.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(report.id)}
              className={`roster-card ${selected ? "roster-card--selected" : ""}`}
            >
              {report.photoUrl ? (
                <img
                  src={report.photoUrl}
                  alt=""
                  className="roster-avatar roster-avatar--photo"
                />
              ) : (
                <div
                  className="roster-avatar"
                  style={{
                    backgroundColor: `${report.accentColor}14`,
                    color: report.accentColor,
                  }}
                >
                  {report.initials}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="roster-card__name">{report.name}</div>
                <div className="roster-card__role">{report.role}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
