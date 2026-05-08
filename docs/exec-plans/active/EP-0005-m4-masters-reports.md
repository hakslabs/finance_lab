# Execution Plan — EP-0005 · M4 Masters + 13F + Reports

## Goal

Deliver the M4 local read/runtime surfaces for `/masters`, `/masters/[id]`,
`/reports`, and `/reports/[id]`: RLS-backed read helpers, route pages,
sanitized Markdown rendering, and tested empty states.

## Context

- Depends on EP-0003 stock-detail links and EP-0004 analysis/screener data
  patterns.
- Product specs: `docs/product-specs/masters-13f.md` and
  `docs/product-specs/reports-pipeline.md`.
- User-facing helpers must use `createRlsSupabaseClient()` only. Service-key
  access remains limited to admin, cron, and worker domains.
- Temporary M0 auth does not produce a real Supabase `auth.uid()`, so follow,
  bookmark, and note mutations remain disabled rather than bypassing RLS.

## Tasks

- [x] Draft this EP-0005 plan with local milestone adaptations.
- [x] Implement `app/_lib/masters/masters-data.ts` with typed reads from
      `master_profiles`, `master_holdings`, `securities_master`, and `quotes`.
- [x] Implement pure masters helpers for style facets, search, selected profile,
      latest quarter, top holdings, and quarterly deltas.
- [x] Implement `app/_lib/reports/reports-data.ts` with typed reads from
      `reports` and `reports_tables`.
- [x] Implement pure report helpers for filters, recommended hero, latest list,
      detail, summary, tickers/tags, related reports, and original `pdf_url`.
- [x] Add focused Vitest coverage for deterministic empty fallbacks and helper
      shaping behavior.
- [x] Build `/masters`, `/masters/[id]`, `/reports`, and `/reports/[id]` route
      pages with temporary-auth protection and disabled user-write actions.
- [x] Render master/report Markdown through the DOMPurify-backed Markdown
      boundary only.
- [x] Add Playwright smoke coverage for the M4 routes and empty/auth-required
      states.
- [ ] Wire production 13F refresh, Docling extraction, Gemini summaries, and
      operational evidence collection.

## Done When

- Local runtime/read surfaces are complete: route pages import tested data
  helpers and render deterministic populated, empty, and not-found states.
- Helpers do not write follows, bookmarks, notes, reports, or master data.
- Helpers do not import service-key clients, cron helpers, external providers,
  DOMPurify, or Markdown renderers; route pages use only the centralized
  Markdown sanitizer boundary.
- Follow/bookmark/note state is honest under temporary auth: disabled until real
  OAuth-backed Supabase sessions are available.
- Focused M4 Vitest coverage and route smoke coverage pass.

## External Evidence Gates

- Production OAuth/user writes are not complete locally. Follow, report
  bookmark, and note round-trips stay gated until real Supabase auth sessions
  replace temporary M0 auth.
- The 7-day reports ingestion target, 20-PDF Docling audit, Gemini daily quota
  evidence, and quarterly 13F refresh cron logs require production or staged
  worker runs and are not claimed by this local foundation slice.
- The April 2026 Supabase Data API exposure change means production projects may
  need explicit grants for newly created exposed tables in addition to RLS.
