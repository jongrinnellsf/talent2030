import type { ReactNode } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { GearIcon } from "@radix-ui/react-icons";
import { PlatformBrand } from "../brand/PlatformBrand";
import { TalentTopbarAccount } from "./TalentTopbarAccount";
import { useOptionalCoachSession } from "../../context/CoachSessionContext";
import { useOptionalLearningSession } from "../../context/LearningSessionContext";
import { isTalentCoachPath, ROUTES } from "../../routes";

type AppShellProps = {
  children: ReactNode;
  title: string;
  subtitle?: string;
  action?: ReactNode;
  status?: ReactNode;
  fullHeight?: boolean;
  shellClassName?: string;
  showModuleNav?: boolean;
};

function talentNavLinkClass(isActive: boolean): string {
  return `nav-link ${isActive ? "nav-link--active" : ""}`;
}

export function AppShell({
  children,
  title,
  subtitle,
  action,
  status,
  fullHeight = false,
  shellClassName,
  showModuleNav = true,
}: AppShellProps) {
  const location = useLocation();
  const learningSession = useOptionalLearningSession();
  const coachSession = useOptionalCoachSession();

  const moduleNav = (
    <>
      <NavLink
        to={ROUTES.talent.root}
        end
        className={({ isActive }) => talentNavLinkClass(isActive)}
      >
        Team
      </NavLink>
      <NavLink
        to={ROUTES.talent.coach}
        end
        className={({ isActive }) => talentNavLinkClass(isActive)}
        onClick={(event) => {
          if (
            !learningSession ||
            !isTalentCoachPath(location.pathname) ||
            learningSession.phase === "select_topic"
          ) {
            return;
          }
          event.preventDefault();
          coachSession?.stopRehearseSessionRef.current?.();
          learningSession.returnToCoachHome();
        }}
      >
        Coach
      </NavLink>
    </>
  );

  return (
    <div className={`app-shell app-shell--talent ${shellClassName ?? ""}`.trim()}>
      <aside className="app-sidebar">
        <div className="app-sidebar__brand">
          <PlatformBrand />
        </div>

        {showModuleNav && (
          <nav className="app-sidebar__nav" aria-label="Main">
            {moduleNav}
          </nav>
        )}

        <div className="app-sidebar__footer">
          <NavLink
            to={ROUTES.settings}
            className={({ isActive }) =>
              `nav-link sidebar-settings-link${isActive ? " nav-link--active sidebar-settings-link--active" : ""}`
            }
          >
            <GearIcon className="sidebar-settings-link__icon" aria-hidden />
            Settings
          </NavLink>
          <span className="app-sidebar__footer-meta">Talent2030</span>
        </div>
      </aside>

      <div className="app-main">
        {showModuleNav && (
          <nav className="mobile-nav" aria-label="Mobile">
            {moduleNav}
            <NavLink
              to={ROUTES.settings}
              className={({ isActive }) => talentNavLinkClass(isActive)}
            >
              Settings
            </NavLink>
          </nav>
        )}

        <header className="app-topbar">
          <div className="app-topbar__titles">
            <h1 className="app-topbar__title">{title}</h1>
            {subtitle && <p className="app-topbar__subtitle">{subtitle}</p>}
          </div>
          <div className="app-topbar__actions">
            {status}
            {action}
            <TalentTopbarAccount />
          </div>
        </header>

        <div
          className={`app-content${fullHeight ? " app-content--full-height" : ""}`}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

export function AppShellLink({
  to,
  children,
}: {
  to: string;
  children: ReactNode;
}) {
  return (
    <Link to={to} className="btn-ghost inline-flex items-center gap-2 px-3 py-2 text-[0.8125rem]">
      {children}
    </Link>
  );
}
