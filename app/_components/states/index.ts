/**
 * Shared empty / error / refresh state components for STOCKLAB routes.
 *
 * Exports six state variants (per `docs/product-specs/mobile-pwa.md`) plus
 * a `RefreshTimestamp` component with three patterns. All components are
 * server-renderable (no client interactivity required) and accept simple
 * primitive props so they can be exercised in unit tests without a DOM.
 *
 * Use these instead of writing per-route empty/error markup.
 */

export {
  EmptyWatchlist,
  EmptyPortfolio,
  ErrorRefreshFailed,
  ErrorApiQuota,
  ErrorNetwork,
  ErrorTickerNotFound,
  RefreshTimestamp,
} from "./states";
export type {
  EmptyWatchlistProps,
  EmptyPortfolioProps,
  ErrorRefreshFailedProps,
  ErrorApiQuotaProps,
  ErrorNetworkProps,
  ErrorTickerNotFoundProps,
  RefreshTimestampProps,
  RefreshStatus,
} from "./states";
export { classifyRefreshStatus } from "./refresh-status";
