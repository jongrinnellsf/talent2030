import type { ReactNode } from "react";
import { ORG_NAME } from "../../data/agent-context/talentManagementSeed";
import { PERSONAL_SITE } from "../../data/personalSite";

type LandingShellProps = {
  children: ReactNode;
};

export function LandingShell({ children }: LandingShellProps) {
  return (
    <div className="landing-shell">
      <main className="landing-shell__main">{children}</main>

      <footer className="landing-footer">
        <p className="landing-footer__byline">
          Built by{" "}
          <a
            className="landing-footer__link"
            href={PERSONAL_SITE.linkedInUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {PERSONAL_SITE.authorName}
          </a>
          . Personal research, not a shipped product.
        </p>
        <p className="landing-footer__legal">
          {ORG_NAME} is fictitious. Demo prototypes only.
        </p>
      </footer>
    </div>
  );
}
