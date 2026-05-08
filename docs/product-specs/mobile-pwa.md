# Feature Spec — Mobile + PWA + State Library

**ID:** PS-11 · **Milestone:** M8 · **Path:** (responsive), `/manifest.json`

## Problem

The platform works on desktop but is unusable on a phone. Korean retail
investors check prices on mobile constantly. Without a mobile-friendly
experience, the platform loses its primary use case.

## Scope

Three deliverables:

### 1. PWA Shell

- `manifest.json` with app name, icons (192px, 512px), theme color,
  background color, display mode `standalone`.
- Service worker for offline caching of static assets and previously
  visited stock pages.
- Apple touch icon and meta tags for iOS Safari "Add to Home Screen".

### 2. Mobile Layouts (Home + Stock Detail)

Priority surfaces only. Other pages remain desktop-optimized with a
responsive fallback.

**Home (`/`):**
- Horizontal scrollable index strip (KOSPI, KOSDAQ, S&P 500, NASDAQ).
- Compact widget cards (watchlist preview, top movers, market sentiment
  summary).
- Bottom tab bar with five slots: Home, Analysis, Search, Portfolio,
  More.

**Stock Detail (`/stock/[ticker]`):**
- Horizontal scrollable tab bar replacing the desktop sidebar.
- Full-width chart with pinch-to-zoom.
- Collapsible sections for financials, filings, news, flow.
- Bottom action bar: Add Note, Add Transaction.

### 3. Empty / Error State Library

A shared component library applied consistently across all data widgets:

| State | Treatment |
| --- | --- |
| Empty — no watchlist items | Star icon + guidance + recommended ticker chips (top 7 by market cap) |
| Empty — portfolio first visit | Chart icon + guidance + (Add Transaction / CSV Import) + recently viewed tickers |
| Error — refresh failed | Previous data at 50% opacity + warning badge + refresh timestamp + retry button |
| Error — API quota exceeded | Warning box + next refresh time + yesterday's close as fallback |
| Error — network failure | X icon + guidance + retry button |
| Error — ticker not found | Search icon + input value + format guide + example chips |
| Refresh timestamp | Normal (green), delayed (yellow), failed-retry (red) — three patterns |

## User Actions

- Bottom tab bar navigates between priority surfaces.
- Horizontal scroll on index strip and tab bar.
- Pinch-to-zoom on stock chart.
- Collapsible sections expand/collapse on tap.
- Bottom action bar opens note or transaction modals.
- Retry button on error states re-fetches data.

## Data Dependencies

Same as existing home and stock-detail routes. No new tables.

## Constraints

- Mobile layouts are responsive CSS, not a separate app or React Native.
- PWA targets iOS Safari and Chrome on Android. No native app track.
- Service worker caches static assets only; dynamic data is always
  fetched fresh (with stale-while-revalidate for previously visited
  stock pages).
- Offline mode shows cached last-known data with a clear "offline"
  banner. No offline write actions.
- The bottom tab bar is a client component. Tab state uses URL params
  for shareability.
- Empty/error state components are shared across all routes. No
  per-route custom error handling.

## Constraints — Privacy

- Service worker does not cache user-specific data (portfolio,
  transactions) to localStorage or IndexedDB.
- Offline cached stock pages are public market data only.

## Local Adaptation — EP-0009

- This local slice implements responsive CSS, PWA manifest, and the
  empty/error state component library.
- Service worker registration and offline caching work in local
  development.
- Bottom tab bar and mobile layouts render on localhost with viewport
  simulation.
- No production PWA deployment or app store submission in this slice.

## Done When

- Home and stock detail render correctly on a 375px viewport in
  Playwright mobile emulation.
- PWA manifest is valid and service worker registers without errors.
- All six empty/error state variants render correctly with sample data.
- Refresh timestamp patterns (normal, delayed, failed) are visually
  distinct.
- Bottom tab bar navigates between priority surfaces on mobile.
- Lighthouse mobile score is measured and documented (target >= 90 for
  home and stock detail).
