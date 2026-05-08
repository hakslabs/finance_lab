# Feature Spec — Analysis Hub + 4 Tabs

**ID:** PS-06 · **Milestone:** M3 · **Path:** `/analysis`

## Problem

Users need a single market-wide analysis surface that turns cached quotes,
indices, sentiment, and financial data into tools for answering "what is
driving the market?" before they drill into a stock.

## Scope

The M3 local scope is one authenticated `/analysis` route with a server-rendered
hub and four tool tabs controlled by URL state:

1. **Market Overview** — six index cards, sector return bars, country snapshot,
   and top movers split by KR / US.
2. **Market Sentiment** — nine gauge slots grouped as US, KR, and global macro.
   Gauges without a licensed/cache source render honest unavailable states.
3. **Technical** — 52-week high/low counts, MA200 breadth placeholder, RSI
   distribution placeholder, and signal table derived from cached quote rows.
4. **Financial** — sector average cards and a market comparison table derived
   from cached financial rows where available.

The top of the page also renders the eight analysis-tool cards from the product
plan: market map, market sentiment, technical analysis, financial comparison,
sector rotation, correlation, economic indicators, and FX tracking.

## User Actions

- Tool card click updates the analysis tab URL state.
- Index cards and stock rows link to existing stock-detail routes where a
  specific ticker is available.
- Disabled or data-pipeline-gated tools explain what source or milestone is
  missing rather than showing fake values.

## Data Dependencies

`indices`, `sentiment`, `quotes`, `quotes_daily`, `financials`,
`securities_master`.

## Constraints

- Server-rendered by default. URL params are the local M3 state boundary.
- No external API call happens during render; all values come from Supabase
  cache tables populated by cron/import jobs.
- Missing sentiment gauges and unavailable technical/financial metrics render
  empty states, not fabricated numbers.
- All market-data views carry the global investment-responsibility disclaimer.

## Done When

- `/analysis` renders on a logged-in temporary session.
- The four M3 tabs are visible and addressable with URL state.
- Cached index, sentiment, quote, and financial data appear when available.
- Empty states explain source gaps for unavailable gauges and metrics.
- Vitest covers data aggregation and Playwright covers login → analysis.
