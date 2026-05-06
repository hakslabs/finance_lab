# Execution Plan — EP-0002 · M1 Quotes + Home Dashboard

## Goal

Deliver the home dashboard backed by live cron-driven quote, index, and
sentiment data, satisfying the spec in
`docs/product-specs/home-dashboard.md`.

## Context

- Depends on EP-0001 (M0) being complete.
- Plan reference: `STOCKLAB-Project-Plan.md` Roadmap row M1 (2 weeks).
- Reliability and quota constraints: see `docs/RELIABILITY.md`.
- UI spec: see `docs/product-specs/home-dashboard.md`.
- Symbol universe and source-reduction plan: see
  [EP-0011](./EP-0011-data-source-reduction.md).
- Owner decision on 2026-05-06: M1 default tickers should be selected from the
  top KOSPI and S&P 500 constituents by market cap / index weight, not from an
  arbitrary hand-picked list.

## Tasks

- [x] Seed `securities_master` from FinanceDatabase for US and South Korea
      before quote cron targets are finalized.
- [x] Build the quote target list from `securities_master` plus curated
      defaults instead of hard-coded symbols. Curated defaults start with the
      top KOSPI and S&P 500 constituents by market cap / index weight.
- [x] Add shared cron ingestion foundation helpers for `cron_logs`, `api_quota`,
      and US/KR quote target preparation. Provider-backed cron handlers remain
      pending.
- [ ] Implement `app/api/cron/quotes-us/route.ts` — Finnhub fetch every 15
      minutes during sessions. Bearer-protected. Updates `quotes` and
      `api_quota`.
- [ ] Implement `app/api/cron/quotes-kr/route.ts` — KRX fetch once at
      18:30 KST. Updates `quotes_daily`.
- [ ] Implement `app/api/cron/indices/route.ts` — KOSPI / KOSDAQ / S&P 500
      / Nasdaq / Dow / KOSPI 200, every 15 minutes.
- [ ] Implement `app/api/cron/sentiment/route.ts` — VIX, F&G, V-KOSPI, etc.
      every 15 minutes.
- [ ] Add `vercel.json` cron schedules for the four jobs.
- [ ] Build the home page (`app/(auth)/page.tsx`) with the 9 widgets per
      spec. Server-rendered shell + targeted client islands (sentiment
      gauge, theme toggle).
- [ ] Build the global header (logo + nav + theme toggle + alerts bell +
      `⌘K` palette stub).
- [ ] Wire `★` watchlist add / remove on the quick-view widget.
- [x] Add `/api/search` endpoint (stocks first; masters / terms / reports
      land in later milestones).
- [ ] Implement empty / error states from `STOCKLAB-Project-Plan.md`
      §States for every widget on the home page.
- [ ] Add Vitest unit tests for cron handlers (mock the upstream API).
- [ ] Add a Playwright smoke: login → home → click first index card →
      stock detail loads (stubbed if M2 is not yet ready).
- [ ] Add Lighthouse CI for `/`. Target: Performance ≥ 90, Accessibility
      ≥ 95.

## Done When

- The home dashboard renders all 9 widgets with live data on a logged-in
  Vercel preview deployment.
- Stock search and default quote targets are backed by `securities_master`.
- All four crons run on schedule for at least 48 hours without failures.
- `api_quota` shows daily usage well below the limits documented in
  `docs/RELIABILITY.md`.
- LCP < 2.5 s on the Vercel preview measured by Lighthouse CI.
- Empty state for "no watchlist" shows the 7 suggested tickers and add
  flow.
- Playwright smoke passes against the preview.

## Notes

- Do not implement the full stock detail screen yet — M2 owns it.
- The "내 수익률 vs 시장 평균" widget can show a placeholder for a user
  without `holdings`; full computation is scope-shared with M5.
- 2026-05-06 slice: `securities_master`-backed stock search and default quote
  target selection are complete. Cron handlers, home widgets, and UI search
  surfaces remain pending M1 work.
- 2026-05-06 slice: shared cron ingestion foundation is complete for run
  logging, quota accounting, and quote target preparation. No provider adapters,
  schedules, or live cron handlers were added.
- 2026-05-06 slice: atomic `claim_api_quota` RPC prep and provider-neutral US
  quote ingestion orchestration are complete. The live `quotes-us` route,
  provider client, and schedule remain pending.
- 2026-05-06 slice: US quote ingestion now skips zero-request runs with a
  `no_requests` skip result before quota claim, and `incrementApiQuotaUsage` is
  fenced as non-atomic (live ingestion must continue using `claimApiQuotaUsage`).
- 2026-05-07 reconciliation: checked items above are verified against committed
  code. All four live cron handlers, vercel.json cron schedules, home page
  widgets, global header, watchlist wiring, empty/error states, Vitest cron
  tests, Playwright smoke, and Lighthouse CI for `/` remain pending. No
  overclaiming: `quotes-us` route, provider client, and schedule are not yet
  live.
- 2026-05-07 slice: provider-neutral `quotes-us` route harness and route-level
  tests exist for auth ordering, logged ingestion success, and logged failure.
  Live Finnhub provider wiring and cron schedule remain pending.
