# Execution Plan — EP-0009 · M8 Mobile + PWA + State Library

## Goal

Deliver the M8 local runtime surfaces for mobile-responsive layouts, PWA
shell, and the shared empty/error state component library.

## Context

- Depends on M1 home dashboard and M2 stock-detail routes being
  functionally complete.
- Product spec: `docs/product-specs/mobile-pwa.md`.
- Mobile layouts are responsive CSS, not a separate app. No React Native.
- PWA targets iOS Safari and Chrome on Android. No app store submission.
- Service worker caches static assets only; dynamic data is always fetched
  fresh (with stale-while-revalidate for previously visited stock pages).
- Empty/error state components are shared across all routes. No per-route
  custom error handling.

## Tasks

- [x] Draft this EP-0009 plan with local milestone adaptations.
- [x] Create `app/_components/states/` with shared empty/error state
      components: `EmptyWatchlist`, `EmptyPortfolio`, `ErrorRefreshFailed`,
      `ErrorApiQuota`, `ErrorNetwork`, `ErrorTickerNotFound`,
      `RefreshTimestamp`.
- [x] Add focused Vitest coverage for all six empty/error state variants
      and the three refresh timestamp patterns
      (`tests/unit/m8-states.test.tsx`).
- [x] Create `public/manifest.json` with app name, icons (192px, 512px),
      theme color, background color, and `display: standalone`.
- [x] Create Apple touch icon and meta tags for iOS Safari "Add to Home
      Screen" in the root layout.
- [x] Implement service worker registration in the app layout with static
      asset caching and stale-while-revalidate for stock pages.
- [x] Add responsive CSS utilities (`sl-mobile-only`, `sl-mobile-pb-tabbar`,
      `sl-mobile-scroll-x`) and a mobile bottom tab bar (Home, Analysis,
      Search, Portfolio, More).
- [ ] Add responsive CSS for stock detail: horizontal scrollable tab bar,
      full-width chart with pinch-to-zoom, collapsible sections, bottom
      action bar (Add Note, Add Transaction). (Tab bar / pinch-to-zoom
      gestures still pending; mobile tab bar wired into stock detail.)
- [ ] Replace existing per-route empty/error handling with shared state
      components across M1-M5 routes. (Library shipped; route adoption
      tracked separately to keep this slice focused.)
- [x] Add Playwright smoke coverage for mobile emulation (375px viewport)
      on home and stock detail (`tests/e2e/m8-mobile.spec.ts`).
- [ ] Run Lighthouse mobile audit on home and stock detail; document
      baseline score (production-deployment gated).

## Done When

- Home and stock detail render correctly on a 375px viewport in Playwright
  mobile emulation.
- PWA manifest is valid and service worker registers without errors in
  local development.
- All six empty/error state variants render correctly with sample data.
- Refresh timestamp patterns (normal, delayed, failed) are visually
  distinct.
- Bottom tab bar navigates between priority surfaces on mobile.
- Shared state components replace any per-route custom error handling in
  M1-M5 routes.
- Lighthouse mobile baseline is measured and documented (target >= 90 for
  home and stock detail).
- Focused M8 Vitest coverage and mobile smoke coverage pass.

## External Evidence Gates

- Production PWA deployment requires Vercel hosting with HTTPS, not
  claimed by this local foundation slice.
- Lighthouse >= 90 target must be verified on the production deployment,
  not just localhost.
- iOS Safari "Add to Home Screen" behavior must be tested on a real
  device, not just emulation.
- Service worker caching behavior under production network conditions
  (slow 3G, offline) is not verified locally.
