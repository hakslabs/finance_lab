# Product Sense

## Problem

Retail investors who track both Korean and US markets juggle multiple
single-purpose sites. Quotes live in one place, financial statements in
another, 13F filings in a third, analyst reports in a fourth, and "how am I
doing relative to the market" lives nowhere at all. The cognitive overhead
discourages the kind of slow, comparative thinking that good investing
needs.

## Target Users

### Primary — Invited Friends (~50–100 people)

- Self-directed retail investors comfortable with English headlines but
  Korean-first for explanations.
- Already trade through Korean brokers (Kiwoom / Mirae / Toss) and at least
  one US broker (IBKR / Schwab / Robinhood).
- Want a single-screen daily view of "the market today" plus their own
  performance, with deeper drills available on demand.

### Secondary — Future Self (1 person)

- The project owner uses the platform end-to-end. Anything painful to use
  daily is a bug to fix, not a feature to ship.

## Value Proposition

1. **One screen, one mental model.** "What is happening, and how am I
   doing?" answered in a single scroll on the home dashboard.
2. **Compare to the market, always.** Personal returns shown next to a
   benchmark of the user's choice.
3. **Follow the masters.** 24 well-known investors with 13F-tracked Top 10
   holdings and quarterly deltas, hand-curated philosophy notes.
4. **AI-summarized macro and academic reports.** RSS-collected reports run
   through Docling and Gemini so users can decide what to read in seconds.
5. **Stock detail in eight focused tabs.** Each tab answers one question;
   no infinite scroll.

## Non-Goals

- No order placement, no automated trading.
- No minute-level KR quote feed (no compliant free source).
- No KR analyst consensus data (no compliant free source).
- No news body scraping from Naver / Daum (terms violation).
- No KIS-style brokerage OpenAPI integration (account-bound and
  redistribution-banned).

## Success Metrics

| Metric | Target | Measurement |
| --- | --- | --- |
| Active invited friends | ≥ 30 of ~50 invited at week 4 of M9 | Supabase MAU |
| Daily session length | ≥ 5 min on active days | Vercel Analytics |
| Stock detail engagement | ≥ 3 of 8 tabs viewed per session that opens stock detail | Vercel Analytics events |
| AI summary helpfulness | ≥ 70 % positive on the in-product 👍 / 👎 widget | First-party events |
| Quota safety | Zero days hit any external API quota for 30 consecutive days | `api_quota` table |
| Cron stability | Zero `cron_logs` failures > 3 consecutive on any job for 30 days | `cron_logs` table |

## Known Tensions

- Free tier limits cap how aggressively we can refresh data. The user-facing
  promise is "frequent enough to feel current," not "real time."
- The friends-only audience tolerates rough edges in admin tooling but is
  unforgiving about misleading data; data correctness wins over ergonomics
  when they conflict.
- Mobile is intentionally narrow (home + stock detail only) until the M8
  milestone. Earlier mobile work is deferred.
