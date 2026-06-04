import type { SimulateScenarioId } from "./simulateScenarios";

/** Coach voice (Learn manager copilot). */
export const LIVE_COACH_VOICE = "Pulcherrima";

/** Employee roleplay voice (Mark Webb and other directs). */
export const REHEARSE_EMPLOYEE_VOICE = "Iapetus";

export function rehearseEmployeeVoiceName(
  _employeeId: string,
  _scenarioId: SimulateScenarioId
): string {
  return REHEARSE_EMPLOYEE_VOICE;
}
