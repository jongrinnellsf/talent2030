import { Link } from "react-router-dom";
import { ROUTES } from "../../routes";
import { AcmeWordmark } from "./AcmeWordmark";

type PlatformBrandProps = {
  compact?: boolean;
  showHomeLink?: boolean;
  showSubtitle?: boolean;
};

export function PlatformBrand({
  compact = false,
  showHomeLink = true,
}: PlatformBrandProps) {
  return (
    <div className="platform-brand">
      {showHomeLink ? (
        <Link to={ROUTES.home} className="platform-brand__org-link">
          <AcmeWordmark size={compact ? "compact" : "default"} />
        </Link>
      ) : (
        <AcmeWordmark size={compact ? "compact" : "default"} />
      )}
    </div>
  );
}
