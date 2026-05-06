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
| M0 | Infrastructure | Supabase project, schema, RLS, OAuth × 3, Vercel link, secret loading | 1 wk | Active | [EP-0001](./exec-plans/active/EP-0001-m0-infrastructure.md) |
| M1 | Quotes + Home | Quote / index / sentiment cron, home dashboard widgets | 2 wk | Active | [EP-0002](./exec-plans/active/EP-0002-m1-quotes-home.md) |
| M2 | Stock Detail (8 tabs) | SVG chart engine, financials, valuation, filings, news, flow, target | 3 wk | Planned | EP-0003 (TBD) |
| M3 | Analysis + Screener | Analysis 4 sub-tabs, market map, screener with saved screens | 2 wk | Planned | EP-0004 (TBD) |
| M4 | Masters + 13F + Reports | 13F parser, 24 masters, RSS + Docling + Gemini pipeline | 3 wk | Planned | EP-0005 (TBD) |
| M5 | Portfolio + Transactions | Portfolio 4 tabs, transactions modal, holdings trigger | 2 wk | Planned | EP-0006 (TBD) |
| M6 | Learn + My Page + Settings | Learn surfaces, My Page hub, settings forms, alert rules | 1 wk | Planned | EP-0007 (TBD) |
| M7 | Admin Console | `/admin` CRUD surfaces and monitoring | 1 wk | Planned | EP-0008 (TBD) |
| M8 | Mobile + State Library | PWA, mobile home and stock detail, empty / error states | 1 wk | Planned | EP-0009 (TBD) |
| M9 | Beta Open | Invite ~50 friends, collect feedback | — | Planned | EP-0010 (TBD) |

## Cross-Cutting Plans

| ID | Plan | Scope | Status | Link |
| --- | --- | --- | --- | --- |
| EP-0011 | Data Source Reduction | Supabase target connection, FinanceDatabase US / South Korea seed, Docling Markdown pipeline, Scrapling evaluation | Active | [EP-0011](./exec-plans/active/EP-0011-data-source-reduction.md) |

## Plan

The milestones run sequentially. M0 must finish before M1 begins, and so
on. Each milestone has its own EP file in `docs/exec-plans/active/`. When a
milestone closes, the EP moves to `docs/exec-plans/completed/`.

- [ ] M0 · Infrastructure
- [ ] M1 · Quotes + Home
- [ ] M2 · Stock Detail
- [ ] M3 · Analysis + Screener
- [ ] M4 · Masters + 13F + Reports
- [ ] M5 · Portfolio + Transactions
- [ ] M6 · Learn + My Page + Settings
- [ ] M7 · Admin Console
- [ ] M8 · Mobile + State Library
- [ ] M9 · Beta Open
- [ ] EP-0011 · Data Source Reduction

## Progress Notes

- 2026-05-06 — Harness scaffolding generated from
  `STOCKLAB-Project-Plan.md`. M0 and M1 promoted to active EPs.
- 2026-05-06 — Added EP-0011 for the owner-provided Supabase project URL,
  Docling Markdown conversion, FinanceDatabase US / South Korea symbol
  seeding, and Scrapling evaluation.

## Open Questions

Tracked in `docs/DESIGN.md` (Open Questions) and
`docs/exec-plans/tech-debt-tracker.md`. Critical opens:

- Privacy policy + ToS drafts before M9 (TD-007).
- CSV transaction import schema before M5 (TD-005).
- Push notifications vs. email decision before M6 (TD-006).
- Scrapling package vs. MCP operating mode before external HTML ingestion
  scales beyond proof of concept (TD-010).
