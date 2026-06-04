export const ROUTES = {
  home: "/",
  settings: "/settings",
  talent: {
    root: "/talent",
    coach: "/talent/coach",
  },
} as const;

/** Unified Coach tab (copilot, paths, explore, rehearsal). */
export function buildCoachPath(
  search: URLSearchParams | Record<string, string | undefined> | string = {}
): string {
  const params =
    typeof search === "string"
      ? new URLSearchParams(search.startsWith("?") ? search.slice(1) : search)
      : search instanceof URLSearchParams
        ? search
        : new URLSearchParams(
            Object.entries(search).flatMap(([key, value]) =>
              value != null && value !== "" ? [[key, value]] : []
            )
          );
  const query = params.toString();
  return query ? `${ROUTES.talent.coach}?${query}` : ROUTES.talent.coach;
}

/** Rehearsal with a direct report (Meet-style roleplay on the Coach canvas). */
export function buildRehearsePath(
  search: URLSearchParams | Record<string, string | undefined> | string = {}
): string {
  const params =
    typeof search === "string"
      ? new URLSearchParams(search.startsWith("?") ? search.slice(1) : search)
      : search instanceof URLSearchParams
        ? search
        : new URLSearchParams(
            Object.entries(search).flatMap(([key, value]) =>
              value != null && value !== "" ? [[key, value]] : []
            )
          );
  params.set("surface", "rehearse");
  return buildCoachPath(params);
}

export function isTalentCoachPath(pathname: string): boolean {
  return pathname.startsWith(ROUTES.talent.coach);
}
