# AGENTS

This document is the entry point for any AI agent working on STOCKLAB.
It is a navigation map, not a manual. Read the linked docs for substance.

## Read Order

1. `ARCHITECTURE.md` — system map, module boundaries, invariants.
2. `docs/CODE_STRUCTURE.md` — pre-implementation app folder contract.
3. `docs/product-specs/index.md` — feature scope and acceptance criteria.
4. `docs/exec-plans/active/` — currently in-progress execution plans.
5. `docs/design-docs/core-beliefs.md` — non-negotiable principles.
6. `docs/FRONTEND.md`, `docs/SECURITY.md`, `docs/RELIABILITY.md` — pillar docs.
7. `docs/references/*-llms.txt` — quick references for the stack.
8. `STOCKLAB-Project-Plan.md` — original single-source-of-truth plan.

## Repository Map

```text
.
├── app/                              Next.js 15 App Router app
│   ├── (public)/                     /login, marketing
│   ├── (auth)/                       /, /analysis, /screener, /masters,
│   │                                 /learn, /portfolio, /reports,
│   │                                 /stock/[ticker], /me/*
│   ├── admin/                        /admin (RLS + role gate)
│   ├── api/                          Route Handlers, cron, mutations
│   └── _lib/                         shared app modules
├── docs/                             this harness
│   └── design-exports/               exported design / wireframe references
├── scripts/                          tooling and init
├── STOCKLAB-Project-Plan.md          canonical plan
└── supabase/                         local Supabase config + migrations
```

## Mandatory Rules

- Use only data sources licensed for redistribution. KIS-style brokerage APIs,
  yfinance, and Naver/Daum body scraping are forbidden. See `docs/SECURITY.md`
  and `STOCKLAB-Project-Plan.md` Disallowed Sources.
- Every user table has Row-Level Security with `user_id = auth.uid()` policies.
  Never bypass RLS from server code unless using the service key inside a
  cron handler or admin route.
- All cron endpoints must check `Authorization: Bearer ${CRON_SECRET}`.
- Free-tier limits are constraints, not suggestions. Consult
  `docs/RELIABILITY.md` before adding any cron job or external API call.
- Server Components are the default. Client Components require justification
  (interactivity, browser-only APIs, charting). See `docs/FRONTEND.md`.
- Markdown rendering must go through DOMPurify; never `dangerouslySetInnerHTML`
  on raw report content.
- Mobile support is a responsive / PWA extension of the same Next.js app, not a
  separate native app track. See `docs/CODE_STRUCTURE.md`.

## Done-When (Project-Level)

The project is considered shippable when:

- M0 through M8 milestones are complete (see `docs/PLANS.md`).
- 50 invited users can sign up via OAuth and reach the home dashboard
  without paid-tier infra.
- All cron jobs stay inside their listed free-tier quotas for 7 consecutive
  days under realistic load (see `docs/RELIABILITY.md`).
- Lighthouse Performance ≥ 90 on home and stock detail (see
  `docs/QUALITY_SCORE.md`).
- No data source on the disallowed list is referenced anywhere in code.

## Working Conventions

- Plan multi-step work in `docs/exec-plans/active/EP-xxxx-<slug>.md`.
- Move completed plans to `docs/exec-plans/completed/`.
- Track unresolved tradeoffs in `docs/exec-plans/tech-debt-tracker.md`.
- Capture significant design decisions in `docs/DESIGN.md` decision log.
- Generated schema dumps belong in `docs/generated/`; do not hand-edit them.
- Add or change `app/` runtime files only through the execution plan that owns
  that surface.
- Keep installation and run instructions in `README.md` only — do not duplicate
  here.
