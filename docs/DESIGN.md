# Design Decisions

This is the project's decision log. Record every choice that closes off
alternatives a future agent might reasonably propose.

## Decision Log

| Date | Decision | Rationale | Alternatives Rejected |
| --- | --- | --- | --- |
| 2026-05-06 | Build on Next.js 14 App Router with React Server Components | Server-first rendering pairs well with the Supabase RLS + Edge cache model and keeps client JS small | Pages Router (no streaming RSC), Remix (less Vercel-native), Astro (poor fit for authenticated app) |
| 2026-05-06 | Use Supabase Postgres + Auth + RLS as the single backend | Free 500 MB / 50K MAU, integrated OAuth, mature RLS; one platform to monitor | Self-hosted Postgres + Lucia (more ops), Firebase (Google-only OAuth feel + worse SQL), PlanetScale + Clerk (paid tier sooner) |
| 2026-05-06 | Custom SVG chart engine | TradingView Lightweight watermark conflicts with the friends-only product feel; Chart.js lacks drawing tools and indicator panels | TradingView Lightweight, Chart.js, ECharts |
| 2026-05-06 | Vercel Cron for short jobs, GitHub Actions for heavy jobs | Vercel Cron is free but capped at 10 s; Docling and Gemini summaries need minutes, which fits GitHub Actions free 2,000 min / month | A single self-hosted cron worker (more ops), inline serverless functions (would exceed 10 s limit) |
| 2026-05-06 | Gemini 1.5 Flash for AI summaries | 1,500 req / day free, strong Korean output, multimodal-ready | OpenAI GPT-4o-mini (paid), local LLM (latency + ops cost) |
| 2026-05-06 | Free-tier-only data sources, no yfinance / KIS-style brokerage APIs | Redistribution licenses must be clean for friend-shared service; brokerage OpenAPIs require account holders and ban redistribution | yfinance (unofficial, fragile), KIS / NH / Mirae OpenAPIs (license blocks) |
| 2026-05-06 | KR minute-level quotes are out of scope | Free tier has no compliant source | Pay for a redistribution license (out of budget) |
| 2026-05-06 | NewsAPI is a fallback, not the primary | 100 req / day quota is too tight for primary use | Make NewsAPI primary (would break within a week) |
| 2026-05-06 | Theme is one `data-theme` attribute, all colors via CSS variables | Single switch surface, no per-component theme code | Tailwind dark: classes (more JSX noise), CSS-in-JS (extra bundle) |
| 2026-05-06 | Stock detail is exactly 8 tabs | Each tab answers one question; more tabs erode focus | Single long page (poor performance), fewer tabs (loses depth) |
| 2026-05-06 | Sole engineer treats every change as production | Friends are real users; prod-quality is not optional | Treating it as a hobby with rough edges (would erode trust quickly) |
| 2026-05-06 | Start with one Supabase project for all environments | Owner chose speed and simplicity for the first implementation loop | Separate dev / preview / production Supabase projects at M0 |
| 2026-05-06 | Defer real OAuth until the final auth pass | Owner will investigate provider setup separately; implementation should keep a temporary auth loop only | Blocking M0 scaffold on complete Google / Apple / Kakao OAuth setup |
| 2026-05-06 | M1 default tickers come from top KOSPI and S&P 500 constituents by market cap / index weight | Gives sensible default coverage without hand-picked symbols | Arbitrary hard-coded symbols |

## Open Questions

These are decisions that have not been made and need to be made before the
referenced milestone. Each must close before its milestone enters
implementation.

| Question | Latest By | Owner |
| --- | --- | --- |
| KR minute-level quotes — any clean source? | M1 review | Project owner |
| KR analyst consensus — automate or skip? | M2 entry | Project owner |
| Push notifications vs. email priority | M6 entry | Project owner |
| CSV transaction import schema | M5 entry | Project owner |
| Docling table extraction accuracy threshold | M4 entry | Project owner |
| Privacy policy / ToS draft | M9 entry | Project owner |

When a question closes, move it into the decision log above with the
chosen answer and the alternatives rejected.
