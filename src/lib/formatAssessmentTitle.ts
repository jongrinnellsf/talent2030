export function formatSimulationAssessmentTitle(date = new Date()): string {
  const formatted = new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);

  return `Simulation assessment · ${formatted}`;
}
