import { manager } from "../../data/manager";

/** Simulated signed-in manager on Talent2030 demo screens. */
export function TalentTopbarAccount() {
  return (
    <div
      className="talent-topbar-account"
      aria-label={`Signed in as ${manager.name} (demo instance)`}
    >
      <span className="talent-topbar-account__demo-badge">Demo instance</span>
      <div className="talent-topbar-account__profile">
        <img
          src={manager.photoUrl}
          alt=""
          className="talent-topbar-account__avatar"
          width={36}
          height={36}
        />
        <div className="talent-topbar-account__meta">
          <span className="talent-topbar-account__name">{manager.name}</span>
          <span className="talent-topbar-account__title">{manager.title}</span>
        </div>
      </div>
    </div>
  );
}
