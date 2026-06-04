import type { IntegrationSource } from "../types";

const logoSrc: Record<IntegrationSource, string> = {
  slack: "/integrations/slack.svg",
  workday: "/integrations/workday.svg",
  drive: "/integrations/googledrive.svg",
  gmail: "/integrations/gmail.svg",
  calendar: "/integrations/googlecalendar.svg",
  meet: "/integrations/googlemeet.svg",
  asana: "/integrations/asana.svg",
};

export const integrationSourceLabels: Record<IntegrationSource, string> = {
  slack: "Slack",
  workday: "Workday",
  drive: "Google Drive",
  gmail: "Gmail",
  calendar: "Calendar",
  meet: "Google Meet",
  asana: "Asana",
};

type IntegrationLogoProps = {
  source: IntegrationSource;
  className?: string;
  variant?: "mark" | "wordmark";
};

export function IntegrationLogo({
  source,
  className,
  variant = "mark",
}: IntegrationLogoProps) {
  const defaultClass =
    variant === "wordmark" && source === "workday"
      ? "integration-logo integration-logo--wordmark"
      : "integration-logo";

  return (
    <img
      src={logoSrc[source]}
      alt=""
      aria-hidden
      className={className ?? defaultClass}
    />
  );
}
