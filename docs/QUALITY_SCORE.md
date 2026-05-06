# Quality Score

This document tracks the quality bars STOCKLAB commits to. Regressions on
home and stock detail block merges.

## Targets

| Metric | Target | Current | Source |
| --- | --- | --- | --- |
| Lighthouse Performance — Home | ≥ 90 | — | Lighthouse CI |
| Lighthouse Performance — Stock Detail | ≥ 90 | — | Lighthouse CI |
| Lighthouse Performance — Reports List | ≥ 85 | — | Lighthouse CI |
| Lighthouse Accessibility — All surfaces | ≥ 95 | — | Lighthouse CI |
| LCP — Home | < 2.5 s | — | Vercel Analytics |
| LCP — Stock Detail | < 2.5 s | — | Vercel Analytics |
| TTI — Home | < 4.0 s | — | Vercel Analytics |
| TTI — Stock Detail | < 4.5 s | — | Vercel Analytics |
| Server 5xx error rate | < 1 % over rolling 15 min | — | Sentry + Vercel |
| Cron job failure rate | 0 jobs at "≥ 3 consecutive failures" / week | — | `cron_logs` |
| API quota saturation | 0 days hitting 100 % on any external API | — | `api_quota` |
| Test coverage — `app/_lib/` | ≥ 70 % statements | — | Vitest |
| Test coverage — `app/api/` route handlers | ≥ 80 % statements | — | Vitest |
| E2E smoke (Playwright) | Pass on main + every PR preview | — | Playwright + Vercel |

## Measurement

- **Lighthouse CI** runs on every PR against the preview deployment for
  `/`, `/stock/AAPL`, and `/reports`. Failures block the PR.
- **Vercel Analytics** records LCP and TTI from real user sessions.
- **Sentry** aggregates 5xx and client errors. Alert thresholds match
  `docs/RELIABILITY.md`.
- **Vitest** runs on every PR. Coverage thresholds enforced in CI.
- **Playwright smoke** covers: login → home → stock detail → portfolio →
  transactions add → logout. Runs on every PR.

## History

Track score changes across milestones once each surface has data.

| Milestone | Date | Lighthouse Home | Lighthouse Stock | Coverage `_lib` | Coverage `api` |
| --- | --- | --- | --- | --- | --- |
| M0 | — | — | — | — | — |
| M1 | — | — | — | — | — |
| M2 | — | — | — | — | — |
| M3 | — | — | — | — | — |
| M4 | — | — | — | — | — |
| M5 | — | — | — | — | — |
| M6 | — | — | — | — | — |
| M7 | — | — | — | — | — |
| M8 | — | — | — | — | — |

Update the row for each milestone when it closes. Do not delete history
rows.
