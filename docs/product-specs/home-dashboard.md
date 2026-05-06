# Feature Spec — Home Dashboard

**ID:** PS-01 · **Milestone:** M1 · **Path:** `/`

## Problem

After login, the user wants a single scroll that answers two questions: "What
is happening in the market right now?" and "How am I doing relative to it?"
Today the answers live across multiple sites.

## Scope

A single authenticated landing page composed of these widgets, in this
order:

1. Greeting hero (user name + greeting + last-updated badge).
2. Index strip — KR (KOSPI, KOSDAQ, KOSPI 200) and US (S&P 500, Nasdaq, Dow)
   with sparkline.
3. US "major stocks" strip and KR "major stocks" strip (top tickers).
4. Market sentiment gauge (composite of `sentiment` rows).
5. Watchlist quick view.
6. Top news (AI-summarized).
7. Mini market map (heat map preview).
8. **My return vs. market average** (1Y / 5Y toggles).
9. This week's calendar (earnings, dividends, macro events).

## User Actions

- Index card click → analysis market overview.
- Stock card click → stock detail.
- Sentiment gauge click → analysis market sentiment.
- Watchlist row click → stock detail.

## Data Dependencies

`quotes`, `quotes_daily`, `indices`, `sentiment`, `news`, `holdings`,
`watchlists`.

## Constraints

- Server-rendered. Client islands only for the sentiment gauge animation
  and the theme toggle.
- LCP < 2.5 s; Lighthouse Performance ≥ 90.
- Stale data shows the last cached value at `opacity 0.5` plus a `⚠`
  badge.
- Empty watchlist shows a friendly empty state with seven suggested
  tickers.
- No external API call happens on render — all data comes from Supabase
  caches populated by cron.

## Done When

- All nine widgets render with live Supabase data on a logged-in session.
- Lighthouse Performance ≥ 90 on a Vercel preview deployment.
- LCP measured by Vercel Analytics is < 2.5 s on real sessions for one
  full week.
- Empty / error states match the table in
  `STOCKLAB-Project-Plan.md` §States.
- `pnpm test` and the Playwright smoke "login → home → stock detail" pass.
