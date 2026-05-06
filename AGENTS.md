# AGENTS

This document is the entry point for any AI agent working on STOCKLAB.
It is a navigation map, not a manual. Read the linked docs for substance.

## Read Order

1. `ARCHITECTURE.md` — system map, module boundaries, invariants.
2. `docs/product-specs/index.md` — feature scope and acceptance criteria.
3. `docs/exec-plans/active/` — currently in-progress execution plans.
4. `docs/design-docs/core-beliefs.md` — non-negotiable principles.
5. `docs/FRONTEND.md`, `docs/SECURITY.md`, `docs/RELIABILITY.md` — pillar docs.
6. `docs/references/*-llms.txt` — quick references for the stack.
7. `STOCKLAB-Project-Plan.md` — original single-source-of-truth plan.

## Repository Map

```text
.
├── app/                              Next.js 14 App Router (planned)
│   ├── (public)/                     /login, marketing
│   ├── (auth)/                       /, /analysis, /screener, /masters,
│   │                                 /learn, /portfolio, /reports,
│   │                                 /stock/[ticker], /me/*
│   ├── admin/                        /admin (RLS + role gate)
│   └── api/
│       ├── search/                   unified search
│       ├── stock/[ticker]/           stock detail bundle
│       ├── transactions/             user trade entry
│       ├── screener/save/            saved screens
│       ├── alerts/                   alert rules
│       ├── admin/master/[id]/        master CRUD
│       ├── admin/article/            article CRUD
│       └── cron/*                    Vercel Cron handlers (CRON_SECRET)
├── design/                           design tokens (existing)
├── wires-v2/                         wireframe v2 (existing)
├── docs/                             this harness
├── scripts/                          tooling and init
├── STOCKLAB-Project-Plan.md          canonical plan
├── STOCKLAB Wireframes v2.html       wireframe export
└── STOCKLAB Design.html              design export
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
- Keep installation and run instructions in `README.md` only — do not duplicate
  here.
