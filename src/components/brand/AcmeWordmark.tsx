import { Link } from "react-router-dom";
import { ORG_LOGO_PATH, ORG_NAME } from "../../data/agent-context/talentManagementSeed";
import { ROUTES } from "../../routes";

export const ACME_LOGO_ALT = `${ORG_NAME} logo`;

type AcmeWordmarkProps = {
  tagline?: string;
  linkToHome?: boolean;
  size?: "hero" | "default" | "compact";
  className?: string;
};

export function AcmeWordmark({
  tagline,
  linkToHome = false,
  size = "default",
  className = "",
}: AcmeWordmarkProps) {
  const content = (
    <div className={`wordmark wordmark--${size} ${className}`.trim()}>
      <img
        src={ORG_LOGO_PATH}
        alt={ACME_LOGO_ALT}
        className="wordmark__logo"
        width={400}
        height={80}
        decoding="async"
      />
      {tagline && <p className="wordmark__tagline">{tagline}</p>}
    </div>
  );

  if (linkToHome) {
    return (
      <Link to={ROUTES.home} className="wordmark__link">
        {content}
      </Link>
    );
  }

  return content;
}
