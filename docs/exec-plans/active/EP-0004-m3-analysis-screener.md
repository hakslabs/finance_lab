# Execution Plan — EP-0004 · M3 Analysis + Screener

## Goal

Deliver the M3 local surfaces for `/analysis` and `/screener`: cache-backed
market-analysis tabs, a factor screener, and honest saved-screen/watchlist
states that do not bypass RLS while the app still uses temporary M0 auth.

## Context

- Depends on EP-0002 M1 cache/dashboard work and EP-0003 M2 stock-detail routes.
- Product specs: `docs/product-specs/analysis.md` and
  `docs/product-specs/screener.md`.
- Frontend constraints: `docs/FRONTEND.md`.
- M3 pages read Supabase cache tables only. They do not call upstream data
  providers during render.
- `saved_screens` and `watchlists` are user-scoped RLS tables; temporary M0 auth
  does not create a real Supabase `auth.uid()`.

## Tasks

- [x] Draft PS-06, PS-07, and this EP-0004 plan.
- [x] Add generated database types for `saved_screens`.
- [x] Add schema regression coverage for the `saved_screens` RLS `USING` and
      `WITH CHECK` policy.
- [x] Implement `app/_lib/analysis/analysis-data.ts` with typed Supabase cache
      reads and deterministic empty fallbacks.
- [x] Implement `/analysis` with hub cards and four server-rendered tabs:
      market overview, sentiment, technical, and financial.
- [x] Implement `app/_lib/screener/screener-data.ts` and pure filter/scoring
      helpers over cached securities, quotes, daily quotes, and financials.
- [x] Implement `/screener` with URL-param filters, result table, heatmap/chart
      previews, row links, and disabled saved-screen/watchlist controls.
- [x] Add Vitest coverage for analysis aggregation, screener filter/scoring, and
      saved-screen schema/RLS expectations.
- [x] Extend Playwright smoke to cover login → analysis and login → screener →
      stock detail.
- [x] Verify focused tests, full tests, e2e, build, typecheck, and a guardrail
      search for forbidden render-time provider calls.

## Done When

- `/analysis` and `/screener` render on a logged-in temporary session.
- `/analysis` exposes four M3 tabs via URL state and uses only cache data.
- `/screener` filters and scores cached KR / US securities deterministically.
- Save-screen and watchlist actions do not pretend to work under temporary auth;
  they explain that real Supabase auth is required.
- No M3 page imports providers, cron helpers, admin Supabase clients, or
  service-key paths.
- `pnpm test`, Playwright smoke, `pnpm build`, and post-build `pnpm typecheck`
  pass.

## Notes

- Production saved-screen and watchlist writes remain blocked until OAuth / real
  Supabase auth sessions replace the M0 temporary cookie.
- Financial and technical metrics are best-effort until daily quote and
  financial pipelines are fully populated.
- 2026-05-07 slice: local M3 Analysis + Screener is complete for `/analysis`
  and `/screener`. Both routes are temporary-auth protected, server-rendered,
  cache-backed, and show disabled saved-screen/watchlist states instead of
  bypassing RLS. Focused M3 tests, full Vitest, Playwright smoke, `next build`,
  post-build `typecheck`, and forbidden render-time import searches pass.
