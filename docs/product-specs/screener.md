# Feature Spec — Screener

**ID:** PS-07 · **Milestone:** M3 · **Path:** `/screener`

## Problem

Users need a factor-based way to discover KR and US stocks without leaving
STOCKLAB or manually stitching together quote, financial, and security-master
tables.

## Scope

The M3 local scope is one authenticated `/screener` route with:

- Left filter rail: market, sector, market-cap bucket, valuation bands, quality
  bands, 6-month return band, and four quant-factor chips.
- Results area: table, heatmap preview, and chart preview modes.
- Result rows: symbol, name, market, sector, latest price/change, valuation
  fields when available, and a computed score.
- Actions: row click links to stock detail; save-screen and watchlist controls
  render disabled states until real Supabase auth replaces temporary M0 auth.

## User Actions

- Filters are represented in URL query params so the route remains
  server-rendered and shareable.
- Row click → `/stock/[ticker]`.
- Save screen → disabled explanatory state under temporary auth; real writes
  target `saved_screens` after OAuth session plumbing lands.
- `★` add → disabled explanatory state under temporary auth; real writes target
  `watchlists` after OAuth session plumbing lands.

## Data Dependencies

`securities_master`, `quotes`, `quotes_daily`, `financials`, `saved_screens`,
`watchlists`.

## Constraints

- Server-rendered by default; no client fetch loop and no external API calls on
  render.
- `saved_screens` and `watchlists` are RLS user tables. The app must not bypass
  RLS with the service key for normal user saves.
- `holdings` remains read-only and unrelated to M3 screener writes.
- Filter logic must tolerate sparse financial rows and show unavailable metrics
  as empty cells.

## Done When

- `/screener` renders on a logged-in temporary session.
- URL query params filter the local result set deterministically.
- Result rows link to stock-detail routes for US and KR symbols.
- Save/watchlist controls are honest disabled stubs under temporary auth.
- Vitest covers screener filtering/scoring and Playwright covers login →
  screener → stock detail.
