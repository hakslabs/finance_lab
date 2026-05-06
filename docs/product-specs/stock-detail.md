# Feature Spec — Stock Detail (8 Tabs)

**ID:** PS-02 · **Milestone:** M2 · **Path:** `/stock/[ticker]`

## Problem

A user evaluating a single ticker needs price, fundamentals, valuation,
filings, news, supply / demand, and analyst targets in one place. Going
between sites loses focus and produces mistakes.

## Scope

Header (shared across tabs):

- Logo, name, ticker, exchange, sector.
- Price + day change + market cap.
- Actions: `★` watchlist · 📝 note · `+` transaction.
- Right rail: similar tickers, sticky.
- Top-right slide: note panel.

Tabs (always exactly eight):

| Tab | Role |
| --- | --- |
| Overview | 1Y price chart + 8 key metrics + technical signals + recent earnings + valuation summary + master holdings + company overview |
| Chart | TradingView-like SVG engine, 11 drawing tools (left rail), 40+ indicators (right rail), 3 sub-panels (volume, RSI, MACD); drawings persist to `localStorage` |
| Financials | IS / BS / CF toggle + annual / quarterly toggle + 5-year trend + ratios + IS table with CAGR + industry average |
| Valuation | PER / PBR / EV-EBITDA / Dividend cards + 5-year PER / PBR trend + 3 valuation methods + peer comparison |
| Filings & Earnings | 20-quarter earnings trend + next-earnings consensus + filing timeline (filter: all / earnings / amendments / governance / M&A) |
| News | AI summary hero + keyword trends + 30-day sentiment + article list (KR / EN filter + category chips) |
| Supply / Demand | Foreign / institutional / individual flow (KR daily, US quarterly 13F) + 90-day short interest + top institutional holders |
| Target Price | Average / high / low target + opinion distribution (strong buy → strong sell) + recent analyst reports + 6 master holders cards |

## Data Dependencies

`quotes`, `quotes_daily`, `financials`, `news`, `master_holdings`,
`reports`, user `notes`, `holdings`.

## Constraints

- Server-rendered shell. Chart tab and drawing tools are a client component.
- Tab data fetches in parallel; switching tabs uses cached server payloads.
- LCP < 2.5 s; Lighthouse Performance ≥ 90.
- Markdown rendering (analyst report excerpts, master philosophy snippets)
  goes through DOMPurify.
- Drawing state persists per ticker in `localStorage` keyed by user ID +
  ticker; never sent to the server.
- All flow / 13F data on the Supply / Demand tab carries a "데이터 출처:
  EDGAR / KRX" footnote.

## Done When

- All eight tabs render on a logged-in session for at least one US ticker
  (`AAPL`) and one KR ticker (`005930`).
- Drawing tools persist across page reloads.
- Lighthouse Performance ≥ 90 on the Overview tab.
- Playwright covers tab navigation and the "+ transaction" path.
- Empty / error states match the table in `STOCKLAB-Project-Plan.md`.
