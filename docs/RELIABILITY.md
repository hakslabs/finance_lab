# Reliability

STOCKLAB runs on free tiers. Reliability is largely a quota-management
problem. This document is the canonical record of what we promise and how we
keep that promise.

## Platform Constraints

| Platform | Constraint | Impact |
| --- | --- | --- |
| Vercel Hobby | 10 s execution per cron invocation | Cron handlers must be short; heavy work moves to GitHub Actions |
| Supabase Free | 500 MB DB, 50K MAU | Archive policy at 350 MB; user-cap not currently a risk |
| GitHub Actions | 2,000 minutes / month free | Docling + Gemini jobs share the budget |
| Finnhub Free | 60 req / min, 15-minute delay | OK for US quote refresh at 15-min cadence |
| NewsAPI | 100 req / day | Tight; KR news prefers Naver/Daum RSS |
| Gemini 1.5 Flash | 1,500 req / day free | Comfortable for ~65 reports / day |
| Alpha Vantage | 25 req / day, 5 / min | Strict; used only as FX / CPI fallback |
| KRX OpenAPI | ~10K / day | Comfortable for daily KR refresh |
| DART | 10K / day | Comfortable |
| SEC EDGAR | Unlimited | No quota risk |
| FRED | Unlimited | No quota risk |

## Cron Budget

| Job | Cadence | Calls / run | Daily total | API | Limit | Status |
| --- | --- | --- | --- | --- | --- | --- |
| US quotes (during sessions) | 15 min × 32 / day | 600 | 19,200 | Finnhub | 86,400 / day | Safe |
| KR quotes (daily) | 18:30 KST | 1 bulk | 1 | KRX | 10K / day | Safe |
| Indices + FX | 15 min × 96 | 12 | 1,152 | Finnhub + FRED | Comfortable | Safe |
| Sentiment | 15 min × 96 | 6 | 576 | Finnhub + scrape | Comfortable | Safe |
| Financials | Daily 03:00 KST | ~500 | 500 | DART + EDGAR | DART 10K, EDGAR ∞ | Safe |
| News | 30 min × 48 | ~10 | 480 | RSS + NewsAPI | RSS ∞, NewsAPI 100 | Tight |
| 13F | Quarterly | ~10 | ~0.1 | EDGAR | ∞ | Safe |
| Alert evaluation | Every minute | 0 | 0 | DB-only | — | Safe |
| Reports RSS poll | 2 / day | ~30 | ~60 | RSS | ∞ | Safe |
| Docling worker | 1 / day | varies | ~1–2 min / report | none | GH Actions 2K min | Safe |
| Gemini summary | 1 / day | ~65 | ~65 | Gemini | 1,500 / day | Safe |

"Sessions" means KST 09:00–15:30 + 22:30–05:00 (≈ 8 h, 32 fifteen-minute
slots). Adding any new external call requires updating this table.

## Caching Strategy

- **Quotes** (`quotes`) — TTL 15 minutes; client revalidates on cron cadence.
- **Indices and FX** — TTL 15 minutes.
- **Daily quotes** (`quotes_daily`) — invalidate after 18:30 KST refresh.
- **Financials** — invalidate after the 03:00 KST refresh.
- **News** — TTL 30 minutes.
- **Reports** — invalidate as the Gemini summary lands.
- **Stock detail bundle** (`/api/stock/[ticker]`) — 5-minute Edge cache to
  smooth the fan-out into the eight tabs.

## Error Handling and Observability

- All cron handlers wrap their work in a single try/catch that writes an
  entry to `cron_logs` (started_at, finished_at, status, error message).
- Sentry captures all server and client errors. PII fields are stripped.
- The admin dashboard shows the `cron_logs` and `api_quota` tables. The
  thresholds for warnings:

| Signal | Tool | Threshold |
| --- | --- | --- |
| Cron failure | `cron_logs` | 1 fail → warn; 3 consecutive → email alert |
| API usage | `api_quota` | 80 % of daily limit → warn; 100 % → cache-only mode |
| Error rate | Sentry | 5xx > 1 % over 15 min |
| Page performance | Vercel Analytics + Lighthouse CI | LCP > 2.5 s or TTI > 4 s |
| DB usage | Supabase dashboard | ≥ 350 MB triggers archive policy |

## Graceful Degradation

| Failure | Degraded Behavior |
| --- | --- |
| External API quota exhausted | Show last cached values at `opacity 0.5` with a `⚠ 갱신시각 + 재시도` badge; admin sees a warning |
| Cron failure (transient) | Auto retry 3× with exponential backoff |
| Cron failure (persistent) | Widget shows error badge; admin gets email |
| Supabase outage | Static fallback page with last close + scheduled events only |
| Vercel outage | Default error page; no separate failover (acceptable for friends-only) |
| Data quality issue (e.g., 13F mis-parse) | Admin → data quality page → manual override / hide |

## Recovery Runbook

1. **Identify** the failing job in the admin dashboard
   (`/admin/cron-logs`).
2. **Triage** the most recent error. If it is a quota issue, switch the
   affected widget to cache-only mode and notify users via the header
   banner.
3. **Re-run** the cron job from the admin tools (button calls the same
   handler with the cron secret).
4. **Backfill** missed data when applicable: re-run with a custom date
   range from a manual GitHub Actions workflow_dispatch.
5. **Audit** the `api_quota` row to confirm we are back inside the
   threshold.
6. **Document** in `docs/exec-plans/tech-debt-tracker.md` if the same
   failure recurs more than twice in a week.

## Maintenance Windows

Maintenance is scheduled between 03:00 KST and 04:00 KST — after the
financials cron, before the sentiment cron. A header banner announces the
window in advance.
