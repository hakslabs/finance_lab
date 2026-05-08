# Execution Plan — EP-0003 · M2 Stock Detail

## Goal

Deliver the `/stock/[ticker]` detail surface with an eight-tab server-rendered
shell, cache-backed stock data, and honest empty states for pipelines that are
not implemented yet.

## Context

- Depends on EP-0002 M1 local cache/dashboard work.
- Product spec: `docs/product-specs/stock-detail.md`.
- Frontend constraints: `docs/FRONTEND.md`.
- No external API calls happen during page render; detail data reads from
  Supabase cache tables populated by cron/import jobs.
- Chart drawing persistence is client-only and can be added as a leaf island.

## Tasks

- [x] Add generated database types needed by stock detail: `financials`,
      `news`, `master_profiles`, `master_holdings`, `watchlists`, `holdings`,
      `transactions`, and `notes`.
- [x] Implement `app/_lib/stock/stock-detail-data.ts` with typed Supabase cache
      reads and deterministic fallbacks.
- [x] Implement `app/(auth)/stock/[ticker]/page.tsx` route shell with stock
      header, action stubs, right rail, and note-panel stub.
- [x] Render exactly eight tabs: Overview, Chart, Financials, Valuation,
      Filings & Earnings, News, Supply / Demand, and Target Price.
- [x] Add a lightweight SVG chart preview for the Overview/Chart surfaces;
      defer drawing tools until a dedicated client island is scoped.
- [x] Add Vitest coverage for stock-detail data fallbacks and server-rendered
      tab structure.
- [x] Update Playwright smoke to cover login → home → stock detail route.
- [x] Verify `pnpm test`, `pnpm build`, and post-build `pnpm typecheck`.

## Done When

- `/stock/AAPL` and `/stock/005930` render all eight tabs on a logged-in
  session without external API calls.
- The stock header shows cached quote/daily quote data when available and a
  clear stale/empty state when absent.
- Missing financials, filings, supply/demand, notes, and target-price data show
  product-consistent empty states, not fake metrics.
- Markdown-like report excerpts render as plain text unless a sanitized
  DOMPurify renderer is added and tested.
- Playwright smoke reaches a stock detail page from the home dashboard.

## Notes

- Watchlist and note mutations require real Supabase auth user IDs; temporary M0
  sessions can only render action stubs.
- Supply/demand and target-price widgets are partial until their data pipelines
  land in later milestones.
- 2026-05-07 slice: local M2 stock detail shell is complete for `/stock/[ticker]`.
  The route is temporary-auth protected, renders exactly eight server-rendered
  tab panels, reads only Supabase cache tables, and shows action/data stubs for
  auth- or pipeline-gated features. Focused Vitest regression, Playwright smoke,
  `next build`, and post-build `typecheck` pass.
