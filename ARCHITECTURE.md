# Architecture

This document describes the stable structure of STOCKLAB.
It is the first thing an agent should read after `AGENTS.md`.

The format follows matklad's `ARCHITECTURE.md` convention: explain the
**bird's-eye view**, the **module boundaries**, and the **invariants** that
hold across the codebase. Implementation details belong elsewhere.

## Bird's-Eye View

STOCKLAB is a single Next.js 15 App Router application backed by Supabase
Postgres. External market data is pulled by two complementary cron systems
(Vercel Cron for short jobs, GitHub Actions for heavy PDF/AI pipelines) and
written into Supabase. The browser reads the same Supabase database through
Server Components when possible, Route Handlers when not.

```text
[External free APIs]
        |  scheduled fetch
        v
[Vercel Cron + GitHub Actions Worker]
        |  upsert via service key
        v
[Supabase Postgres + Auth + RLS]
        |  read via anon key (RLS) or service key (admin/cron)
        v
[Next.js 15 App Router]
        |  Server Components first; Route Handlers / Server Actions for writes
        v
[Browser]
```

The system has three execution domains:

1. **User-facing app** — Server Components read Supabase directly; mutations go
   through Server Actions or `app/api/*` Route Handlers.
2. **Vercel Cron jobs** (≤10 s) — quote refresh, sentiment polling, news,
   alert evaluation, RSS polling.
3. **GitHub Actions Worker** — Docling PDF extraction and Gemini summaries
   (long-running; 2,000 free minutes / month).

## System Map

| Layer | Technology | Where it lives |
| --- | --- | --- |
| Routing & rendering | Next.js 15 App Router | `app/` |
| Styling | CSS variables, Pretendard, JetBrains Mono | `app/globals.css`, `docs/design-exports/design/tokens.jsx` |
| Charting | Custom SVG engine | `app/_charts/` (planned) |
| Database | Supabase Postgres | `supabase/migrations/` (planned) |
| Auth | Supabase Auth (Email + Google + Apple + Kakao) | `app/(public)/login/` |
| Short cron | Vercel Cron | `app/api/cron/*` |
| Heavy cron | GitHub Actions | `.github/workflows/` (planned) |
| AI summaries | Gemini 1.5 Flash | invoked from GitHub Actions |
| PDF extraction | Docling (Python) | invoked from GitHub Actions |
| Error tracking | Sentry | server + client SDKs |
| Analytics | Vercel Analytics | first-party |

## Implementation Runtime

`app/` contains the local M0-M5 runtime: layout, global styles, temporary auth
loop, cron/search routes, and the home, stock detail, analysis, screener,
masters, reports, portfolio, and transaction-gate surfaces. New product route
files are added only by the execution plan that owns that surface.

The detailed folder contract lives in `docs/CODE_STRUCTURE.md`.

## Module Boundaries

The codebase is organized around **route groups** rather than vertical
features. Cross-cutting domain logic lives in `app/_lib/`.

| Module | Responsibility | Allowed dependencies |
| --- | --- | --- |
| `app/(public)/` | Login, signup, marketing | Supabase Auth client only |
| `app/(auth)/` | Authenticated user surfaces | Supabase anon client (RLS) |
| `app/admin/` | Admin console, role-gated | Supabase service key (server-only) |
| `app/api/cron/*` | Cron handlers (Vercel) | Service key, external APIs |
| `app/api/admin/*` | Admin mutations | Service key + role check |
| `app/_lib/data/` | Server-side query helpers | Supabase clients |
| `app/_lib/charts/` | SVG chart engine | No data deps; pure rendering |
| `app/_lib/ai/` | Gemini and prompt helpers | Server-only env access |
| `app/_lib/auth/` | Session and role helpers | Supabase auth clients |
| `app/_lib/env/` | Typed environment validation | Server-only env access |
| `app/_lib/hooks/` | Client-only React hooks | Browser APIs only when justified |
| `app/_lib/ui/` | Primitive UI and token bridge | Design tokens, CSS variables |
| `app/_lib/utils/` | Small shared utilities | No route-group dependencies |
| `docs/design-exports/design/` | Design tokens and hi-fi export references | None — leaf module |
| `docs/design-exports/wires-v2/` | Wireframe export references | None — read-only reference |
| `docs/design-exports/*.html` | HTML / JSX design references | None — read-only reference |

**Rule:** route groups must not import from each other. Shared logic must move
to `app/_lib/` first.

Mobile and PWA support extends the same Next.js application. It does not create
a separate React Native, Expo, or native app module unless a future product
decision explicitly changes that direction.

## Data Surface

Domain tables (system / cache):

`quotes`, `quotes_daily`, `indices`, `sentiment`, `financials`, `news`,
`master_holdings`, `master_profiles`, `reports`, `reports_tables`, `articles`,
`terms`, `cron_logs`, `api_quota`, `alerts_queue`.

User tables (RLS, `user_id = auth.uid()`):

`auth.users`, `user_preferences`, `watchlists`, `follows`, `bookmarks`,
`holdings`, `transactions`, `notes`, `saved_screens`,
`user_report_bookmarks`, `alerts`.

The full schema sketch lives in `docs/generated/db-schema.md`. The migration
files in `supabase/migrations/` are the source of truth.

## Cross-Cutting Concerns

- **Theme** — single `data-theme` attribute on `<html>`; CSS variables flip.
- **Search** — `⌘K` / `Ctrl+K` opens a unified search palette backed by
  `GET /api/search` across stocks, masters, terms, and reports.
- **Favorites** — one `watchlists` / `bookmarks` table backs the `★` icon
  across the app.
- **Alerts** — evaluated every minute by an in-DB cron; no external calls.
- **Markdown** — every Markdown render path must sanitize via DOMPurify.

## Invariants

These properties hold across the codebase. Violating them is a bug.

1. **No disallowed data sources.** KIS-style brokerage OpenAPIs, yfinance, and
   Naver/Daum body scraping are forbidden. RSS headlines + links from news
   portals are allowed.
2. **RLS is on for every user table.** Server code that bypasses RLS must use
   the service key explicitly and must run server-side only.
3. **Cron handlers are authenticated.** Every `app/api/cron/*` route checks
   `Authorization: Bearer ${CRON_SECRET}` before doing anything.
4. **Free-tier-first.** New external API calls or cron jobs must fit inside
   the quotas in `docs/RELIABILITY.md`. Crossing a paid threshold is a
   product decision, not an engineering one.
5. **Server Components by default.** Client Components require an interaction,
   browser-only API, or chart canvas reason.
6. **Single theme switch surface.** All themable styling reads from CSS
   variables; no hard-coded colors in components.
7. **Disclaimer on every market data view.** "참고용 · 투자 판단은 사용자 책임"
   appears in the global footer and at first login.
8. **Privacy minimalism.** Logs reference `user_id` only — never email,
   nickname, or tokens.

## Build Sequence (Milestones)

Implementation order is fixed by `docs/PLANS.md` (M0 → M9). The architecture
above must be in place before M1 (quotes + home) ships, even if some modules
are still empty placeholders.
