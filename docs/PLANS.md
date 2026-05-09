# Plans

Index of milestones and their execution plans. Modeled on the structure used
in the OpenAI Codex exec-plans guide: each milestone gets a goal, context,
ordered tasks, and a clear "Done When" gate.

## Goal

Ship a free-to-operate Korean / US integrated stock analysis platform for
~50 invited friends, on schedule across nine milestones (M0–M9).

## Context

The plan in `STOCKLAB-Project-Plan.md` enumerates pages, data sources, and
technical choices. This document slices that plan into milestone-sized
execution plans. Each milestone produces a working slice the project owner
can use end-to-end.

## Milestone Index

| ID | Milestone | Scope | Estimate | Status | Plan |
| --- | --- | --- | --- | --- | --- |
| M0 | Infrastructure | Supabase project, schema, RLS, OAuth × 3, Vercel link, secret loading | 1 wk | Local + Vercel hosting wired; OAuth, Sentry, Lighthouse pending | [EP-0001](./exec-plans/active/EP-0001-m0-infrastructure.md) |
| M1 | Quotes + Home | Quote / index / sentiment cron, home dashboard widgets | 2 wk | Local runtime partial; ops gates pending | [EP-0002](./exec-plans/active/EP-0002-m1-quotes-home.md) |
| M2 | Stock Detail (8 tabs) | SVG chart engine, financials, valuation, filings, news, flow, target | 3 wk | Local runtime complete | [EP-0003](./exec-plans/active/EP-0003-m2-stock-detail.md) |
| M3 | Analysis + Screener | Analysis 4 sub-tabs, market map, screener with saved screens | 2 wk | Local runtime complete | [EP-0004](./exec-plans/active/EP-0004-m3-analysis-screener.md) |
| M4 | Masters + 13F + Reports | 13F parser, 24 masters, RSS + Docling + Gemini pipeline | 3 wk | Local runtime complete | [EP-0005](./exec-plans/active/EP-0005-m4-masters-reports.md) |
| M5 | Portfolio + Transactions | Portfolio 4 tabs, transactions modal, holdings trigger | 2 wk | Local runtime complete | [EP-0006](./exec-plans/active/EP-0006-m5-portfolio-transactions.md) |
| M6 | Learn + My Page + Settings | Learn surfaces, My Page hub, settings forms, alert rules | 1 wk | Local runtime complete | [EP-0007](./exec-plans/active/EP-0007-m6-learn-my-page-settings.md) |
| M7 | Admin Console | `/admin` CRUD surfaces and monitoring | 1 wk | Local runtime complete | [EP-0008](./exec-plans/active/EP-0008-m7-admin-console.md) |
| M8 | Mobile + State Library | PWA, mobile home and stock detail, empty / error states | 1 wk | Local runtime partial | [EP-0009](./exec-plans/active/EP-0009-m8-mobile-pwa-states.md) |
| M9 | Beta Open | Invite ~50 friends, collect feedback | — | Production gates only | [EP-0010](./exec-plans/active/EP-0010-m9-beta-readiness.md) |

## Cross-Cutting Plans

| ID | Plan | Scope | Status | Link |
| --- | --- | --- | --- | --- |
| EP-0011 | Data Source Reduction | Supabase target connection, FinanceDatabase US / South Korea seed, Docling Markdown pipeline, Scrapling evaluation | Active | [EP-0011](./exec-plans/active/EP-0011-data-source-reduction.md) |
| EP-0012 | Responsive UX + ISR Refactor | Move `cookies()` out of page files to unlock ISR; route adoption of the shared state library; design-export parity at 375 / 768 / 1024 / 1280 / 1920 | Active (backlog) | [EP-0012](./exec-plans/active/EP-0012-responsive-ux-isr-refactor.md) |
| EP-0013 | Design Fidelity (wires-v2) | Token + primitive parity with `docs/design-exports/wires-v2/` (Sparkline, blue-chip strips, sentiment row, watchlist pills, news tag chips, etc.). Owner reported skeleton-level divergence on 2026-05-09 | Active (in progress) | [EP-0013](./exec-plans/active/EP-0013-design-fidelity-wires-v2.md) |

## Plan

The milestones run sequentially. M0 must finish before M1 begins, and so
on. Each milestone has its own EP file in `docs/exec-plans/active/`. When a
milestone closes, the EP moves to `docs/exec-plans/completed/`.

- [ ] M0 · Infrastructure — local foundation complete; Vercel project linked
      and production env / daily cron deployed (2026-05-07). OAuth providers,
      Sentry dashboard verification, Lighthouse preview, and Vercel
      Authentication exit (or custom domain) remain pending
- [ ] M1 · Quotes + Home — local dashboard and cron route work mostly present;
      schedules, live 48h cron evidence, Lighthouse, and write actions pending
- [x] M2 · Stock Detail local runtime
- [x] M3 · Analysis + Screener local runtime
- [x] M4 · Masters + 13F + Reports local runtime
- [x] M5 · Portfolio + Transactions local runtime
- [x] M6 · Learn + My Page + Settings local runtime — OAuth writes,
      alert evaluation cron, and TD-006 (push vs. email) remain gated
- [x] M7 · Admin Console local runtime — admin CRUD mutations, 13F upload,
      news curation actions, user role changes, and persisted audit logs
      remain gated to production
- [ ] M8 · Mobile + State Library — state library, PWA manifest, service
      worker, and mobile bottom tab bar shipped locally; route adoption of
      the shared state components, stock-detail mobile gestures, and
      Lighthouse production scores remain gated
- [ ] M9 · Beta Open — production gates only; no local-runtime code
      changes. OAuth, hosted secrets, 7-day cron observation, Lighthouse,
      Sentry, privacy/ToS, and invite mechanism must all pass on hosted
      deployment
- [ ] EP-0011 · Data Source Reduction

## Progress Notes

- 2026-05-06 — Harness scaffolding generated from
  `STOCKLAB-Project-Plan.md`. M0 and M1 promoted to active EPs.
- 2026-05-06 — Added EP-0011 for the owner-provided Supabase project URL,
  Docling Markdown conversion, FinanceDatabase US / South Korea symbol
  seeding, and Scrapling evaluation.
- 2026-05-07 — Added active EP-0005 and EP-0006 foundation plans for M4/M5
  local read surfaces while production ops evidence and OAuth-backed user writes
  remain gated.
- 2026-05-07 — Completed local runtime/read UI through M5. Production OAuth
  writes, transaction mutations, 13F refresh evidence, and report ingestion
  operations remain gated by their milestone Done-When checks.
- 2026-05-07 — Reconciled M0/M1 status: keep both unchecked for full milestone
  completion. M0 has repository-local infrastructure foundations, but hosted
  dashboard confirmations remain. M1 has local dashboard and cron route work,
  but schedules, live cron observation, Lighthouse, and write actions remain.
- 2026-05-07 — Added M6-M9 product specs (PS-08 through PS-12) and active
  execution plans (EP-0007 through EP-0010). M6-M8 are local-runtime planned;
  M9 is production gates only. Production OAuth, hosted secrets, cron
  observation, Lighthouse, Sentry, privacy/ToS, and real beta invites remain
  explicit production gates across all four milestones.
- 2026-05-07 — Closed M6 local runtime (Learn / My Page / Settings already
  implemented; EP and PLANS reconciled), shipped M7 Admin Console local
  runtime (`/admin` dashboard + dynamic section list views, role guard,
  audit log stub, 23 vitest cases), and shipped the M8 state library + PWA
  shell + mobile bottom tab bar (14 vitest cases, 375px Playwright
  emulation). Stock-detail mobile gestures, route adoption of the state
  library, and Lighthouse mobile baseline remain gated to production.
- 2026-05-07 — Vercel link + production deploy: `haks-finance-lab-s-projects/
  finance-lab` linked via `vercel link`. Production env (12 keys including
  Supabase + provider keys + `NEXT_PUBLIC_APP_URL`) registered through the
  Vercel REST API. Cron schedule normalized to daily for Hobby plan. Admin
  console gained `/admin/securities-master` summary surface, closing the
  EP-0011 admin curation task.
- 2026-05-08 — Production end-to-end verified at
  `https://finance-lab-haks-finance-lab-s-projects.vercel.app`. Three
  blockers resolved before live traffic could pass: (a) Vercel SSO
  Protection disabled via REST API; (b) project `framework` field set to
  `nextjs` (was `null`, which caused `@vercel/static-build` fallback and
  zero page functions in `.vercel/output`); (c) middleware verify helper
  inlined into `middleware.ts` to avoid edge-runtime import resolution
  failure. Live smoke results: `/` → 307 to `/login?next=/`, `/login` →
  200 HTML, `/api/cron/__health` → 401 without bearer / 200 `{"ok":true}`
  with bearer, `/admin` → 307 to login, `/manifest.json` and `/sw.js` →
  200.
- 2026-05-08 — Automation scaffolding for the remaining production gates:
  `instrumentation.ts` switched to dynamic imports so Sentry only loads
  when `SENTRY_DSN` is present (prevents `__dirname` crashes when the
  Edge middleware bundle is generated without a DSN). Env schema accepts
  optional `OAUTH_GOOGLE_CLIENT_ID` / `OAUTH_GOOGLE_CLIENT_SECRET`.
  `scripts/register-secrets.ts` (`pnpm register:secrets`) pushes any
  CI/Vercel secrets present in `.env` to GitHub Actions secrets
  (`hakslabs/finance_lab`, libsodium sealed-box) and Vercel production
  env (REST API upsert).
- 2026-05-09 — Sentry production wiring complete: DSN values registered
  to Vercel production env, production redeployed (Ready). GitHub
  Actions secrets registered on the second PAT issuance (Repository
  permissions → Secrets → Read and write) — `SUPABASE_URL`,
  `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`, `CRON_SECRET` all
  upserted via libsodium sealed-box. Outstanding M0 production gates:
  one captured-error verification on the Sentry dashboard, OAuth Google
  (paused at the consent-screen step, deferred to the final auth pass),
  and 7-day cron observation (continues naturally).
- 2026-05-09 — Production data + perf pass: `vercel.json` pinned to
  `regions: ["icn1"]` (Seoul), confirmed with `x-vercel-id:
  icn1::icn1::...` after redeploy. Two production Supabase migrations
  (`m1_atomic_api_quota_claim`, `m0_holdings_recompute_placeholder`)
  were missing on the hosted DB; pushed via dashboard SQL editor.
  `claim_api_quota` had an OUT-param vs. unqualified-column ambiguity
  in `strict search_path` mode — fixed in the migration file (alias
  removal, `on conflict on constraint api_quota_pkey`, `RETURN QUERY
  VALUES`) and re-applied. After the fix, `quotes-us` cron successfully
  upserted 33 US tickers and `sentiment` cron claimed quota cleanly.
  `quotes-kr` and `indices` still 401: KRX OpenAPI account is missing
  the "주식 일별매매정보" group (owner action required), and the index
  cron currently calls KOSCOM K-MyData with the KRX key, which is the
  wrong service. KOSCOM → KRX index migration captured in EP-0012 as
  an adjacent backlog (defer until owner's filed KRX index groups are
  approved so the `OutBlock_1` response shape can be inspected
  first-hand instead of guessed).

## Open Questions

Tracked in `docs/DESIGN.md` (Open Questions) and
`docs/exec-plans/tech-debt-tracker.md`. Critical opens:

- Privacy policy + ToS drafts before M9 (TD-007).
- CSV transaction import schema before M5 (TD-005).
- Push notifications vs. email decision before M6 (TD-006).
- Scrapling package vs. MCP operating mode before external HTML ingestion
  scales beyond proof of concept (TD-010).
