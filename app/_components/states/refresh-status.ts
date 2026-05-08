/**
 * Pure helper that classifies a refresh state into the visual pattern
 * (`normal` green, `delayed` yellow, `failed-retry` red).
 *
 * `normal` — refreshed within freshness window.
 * `delayed` — refresh older than `freshnessSeconds` but no failure yet.
 * `failed-retry` — last refresh attempt failed.
 */

export type RefreshStatusKind = "normal" | "delayed" | "failed-retry";

export interface RefreshStatusInput {
  readonly lastRefreshIso: string | null;
  readonly nowIso: string;
  readonly freshnessSeconds: number;
  readonly lastAttemptFailed: boolean;
}

export function classifyRefreshStatus(input: RefreshStatusInput): RefreshStatusKind {
  if (input.lastAttemptFailed) return "failed-retry";
  if (!input.lastRefreshIso) return "delayed";
  const age =
    (new Date(input.nowIso).getTime() - new Date(input.lastRefreshIso).getTime()) /
    1000;
  if (age <= input.freshnessSeconds) return "normal";
  return "delayed";
}
