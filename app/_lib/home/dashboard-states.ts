/**
 * Dashboard widget state types and fixture data for M1 home dashboard.
 *
 * Server-renderable — no hooks, no browser globals, no live fetches.
 * Consumed by dashboard-state-card.tsx and future widget shells.
 */

// ── Types ────────────────────────────────────────────────────────────────

/** Suggested ticker for the empty watchlist state. */
export interface SuggestedTicker {
  readonly symbol: string;
  readonly name: string;
  readonly exchange: "NYSE" | "Nasdaq" | "KOSPI" | "KOSDAQ";
}

/** Stale data metadata attached to a widget that has cached-but-expired content. */
export interface StaleBadgeProps {
  /** ISO-8601 timestamp of when the data was last refreshed. */
  readonly cachedAt: string;
  /** Human-readable staleness label (e.g. "2h ago", "yesterday"). */
  readonly ageLabel: string;
}

/** Generic empty-state payload for any widget. */
export interface WidgetEmptyState {
  /** Widget identifier used in aria-label / test ids. */
  readonly widgetId: string;
  /** Short title shown above the empty illustration area. */
  readonly title: string;
  /** Descriptive sentence below the title. */
  readonly description: string;
}

/** Generic error-state payload for any widget. */
export interface WidgetErrorState {
  /** Widget identifier used in aria-label / test ids. */
  readonly widgetId: string;
  /** User-facing error summary (not raw stack traces). */
  readonly message: string;
  /** Whether a retry action is available (caller wires the button). */
  readonly retryable: boolean;
}

/** Union discriminator for dashboard card states. */
export type DashboardCardState =
  | { readonly kind: "loading" }
  | { readonly kind: "stale"; readonly stale: StaleBadgeProps }
  | { readonly kind: "empty_watchlist" }
  | { readonly kind: "widget_empty"; readonly empty: WidgetEmptyState }
  | { readonly kind: "widget_error"; readonly error: WidgetErrorState };

// ── Fixtures ─────────────────────────────────────────────────────────────

/**
 * Seven suggested tickers for the empty watchlist state.
 * US/KR sensible mix — large-cap tech, Korean blue-chips, and widely-held names.
 */
export const SUGGESTED_TICKERS: readonly SuggestedTicker[] = [
  { symbol: "AAPL", name: "Apple Inc.", exchange: "Nasdaq" },
  { symbol: "MSFT", name: "Microsoft Corp.", exchange: "Nasdaq" },
  { symbol: "NVDA", name: "NVIDIA Corp.", exchange: "Nasdaq" },
  { symbol: "005930", name: "Samsung Electronics", exchange: "KOSPI" },
  { symbol: "000660", name: "SK Hynix", exchange: "KOSPI" },
  { symbol: "377300", name: "NAVER Corp.", exchange: "KOSDAQ" },
  { symbol: "035420", name: "NAVER Corp.", exchange: "KOSPI" },
] as const;

/** Example stale badge fixture for screenshot / storybook usage. */
export const STALE_BADGE_FIXTURE: StaleBadgeProps = {
  cachedAt: "2026-05-07T06:30:00Z",
  ageLabel: "2h ago",
} as const;

/** Example generic widget empty state fixture. */
export const WIDGET_EMPTY_FIXTURE: WidgetEmptyState = {
  widgetId: "market-sentiment",
  title: "No sentiment data yet",
  description: "Market sentiment will appear after the next cron refresh.",
} as const;

/** Example generic widget error state fixture. */
export const WIDGET_ERROR_FIXTURE: WidgetErrorState = {
  widgetId: "indices",
  message: "Unable to load index data. Please try again later.",
  retryable: true,
} as const;

/** Pre-built dashboard card state fixtures for testing and development. */
export const DASHBOARD_STATE_FIXTURES: Readonly<Record<string, DashboardCardState>> = {
  loading: { kind: "loading" },
  stale: { kind: "stale", stale: STALE_BADGE_FIXTURE },
  empty_watchlist: { kind: "empty_watchlist" },
  widget_empty: { kind: "widget_empty", empty: WIDGET_EMPTY_FIXTURE },
  widget_error: { kind: "widget_error", error: WIDGET_ERROR_FIXTURE },
} as const;
