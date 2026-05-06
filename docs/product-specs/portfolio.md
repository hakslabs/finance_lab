# Feature Spec — Portfolio (4 Tabs)

**ID:** PS-03 · **Milestone:** M5 · **Path:** `/portfolio`

## Problem

Users want to know whether their personal returns are tracking, beating, or
trailing the market. Without a benchmark comparison, raw return numbers
mean nothing.

## Scope

Tabs (in order):

1. **Summary** — Total assets hero (KRW-converted) · asset allocation
   donut · sector exposure · my return vs. market average (1Y / 5Y).
2. **Holdings** — Holdings table (qty, avg price, current price, P&L,
   weight).
3. **Transactions** — Last 10 entries plus a deep link to
   `/me/transactions` (the actual surface).
4. **Performance** — 1-year report · monthly heatmap · capital gains tax
   simulator.

## User Actions

- Holding row click → stock detail.
- "+ Transaction" button on the summary tab → transactions modal.
- Performance heatmap month click → drilldown for that month's
  transactions.

## Data Dependencies

`holdings`, `transactions`, `quotes`, `indices` (benchmark).

## Constraints

- `holdings` is a derived table maintained by `transactions` triggers; the
  app never writes to `holdings` directly.
- Currency conversion uses the FX from `indices` cron; stale FX shows a
  badge.
- The capital-gains tax simulator is informational only ("참고용"); the
  app does not file taxes.
- Server-rendered. Donuts and heatmap are SVG components rendered on the
  server with hydration only for tooltips.

## Constraints — Privacy

- Portfolio data is RLS-protected. There is no public sharing surface.
- Logs reference `user_id` only.

## Done When

- A user with at least 5 transactions sees correct holdings, sector, and
  return-vs-benchmark figures.
- Transactions trigger recomputation of `holdings` within one second of
  insert.
- Playwright covers add transaction → see updated summary → drill into
  performance.
- Capital gains simulator output matches a hand-computed reference for a
  reference dataset (US-only sample, KR-only sample, mixed sample).
