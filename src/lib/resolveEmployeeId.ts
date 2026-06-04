import { DEFAULT_EMPLOYEE_ID, getDirectReport } from "../data/directReports";

export function resolveEmployeeIdFromSearch(search: string): string {
  const params = new URLSearchParams(search);
  const employee = params.get("employee") ?? params.get("demo");
  if (employee && getDirectReport(employee)) return employee;
  if (employee === "marcus" || employee === "mark") return DEFAULT_EMPLOYEE_ID;
  return DEFAULT_EMPLOYEE_ID;
}
