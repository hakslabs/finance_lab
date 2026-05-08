# Execution Plan — EP-0008 · M7 Admin Console

## Goal

Deliver the M7 local read/runtime surfaces for `/admin`: role-gated
dashboard, list views for all admin sections, and read-only CRUD forms.

## Context

- Depends on M0 RLS tables, M4 masters/reports data patterns, and M6
  learn content tables.
- Product spec: `docs/product-specs/admin-console.md`.
- Admin routes check both RLS and an explicit `is_admin` role. Non-admin
  users see a 404.
- Under temporary M0 auth, the admin role check uses a hardcoded local
  flag. CRUD forms render in read-only mode.
- Admin audit logging is wired but entries under temporary auth are marked
  as local-only.

## Tasks

- [x] Draft this EP-0008 plan with local milestone adaptations.
- [x] Implement `app/_lib/admin/admin-data.ts` with typed reads from
      `cron_logs`, `api_quota`, `master_profiles`, `articles`, `terms`,
      `news`, and `master_holdings`.
- [x] Implement pure admin helpers for dashboard KPI aggregation
      (cron runs / failures 7d, API call count today, news 7d), section
      list shaping, and deterministic empty fallbacks.
- [x] Implement admin role check helper that returns 404 for non-admin
      users (`app/_lib/admin/role-guard.ts`).
- [x] Implement local-only `admin_audit_log` stub helper for admin
      actions (`app/_lib/admin/audit-log.ts`).
- [x] Add focused Vitest coverage for role gating, KPI aggregation, and
      deterministic empty fallbacks (`tests/unit/m7-admin.test.ts`).
- [x] Build `/admin` route page with dark-red top bar, sidebar navigation,
      and dashboard KPI cards.
- [x] Build admin section list views (single dynamic `[section]` route):
      Masters, 13F Parsing, Learn Content, Terms, News Curation, API
      Usage, Cron Logs. Users and Announcements render as production-
      gated panels.
- [x] Render admin CRUD forms in read-only mode under temporary auth
      (banner + disabled controls per section).
- [x] Add Playwright smoke coverage for admin login, dashboard, section
      navigation, non-admin 404, and unauthenticated redirect.
- [ ] Wire production admin CRUD mutations, 13F upload trigger, news
      curation actions, and user role changes after real OAuth sessions
      are available.
- [ ] Persist admin audit log entries to a real `admin_audit_log` table
      after the table is migrated (currently stub-only).

## Done When

- Local runtime/read surfaces are complete: `/admin` imports tested data
  helpers and renders dashboard KPIs and section list views.
- Admin role check rejects non-admin users with a 404.
- CRUD forms are present but disabled under temporary auth.
- Admin helpers use `createRlsSupabaseClient()` only and do not call
  service keys for user-facing queries. Service-key access is limited to
  admin mutation routes.
- Admin audit log entries are written for all admin actions (marked
  local-only under temporary auth).
- Focused M7 Vitest coverage and route smoke coverage pass.

## External Evidence Gates

- Production OAuth/admin writes are not complete locally. Master CRUD,
  guide authoring, term management, news curation, user role changes, and
  announcement scheduling stay gated until real Supabase auth sessions
  replace temporary M0 auth.
- 13F upload and parse pipeline require production Docling and SEC EDGAR
  access, not claimed by this local foundation slice.
- Cron log monitoring and API quota tracking require production cron
  deployment and 7-day observation, not claimed by this local slice.
- The April 2026 Supabase Data API exposure change means production
  projects may need explicit grants for newly created exposed tables in
  addition to RLS.
