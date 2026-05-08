# Execution Plan — EP-0007 · M6 Learn + My Page + Settings

## Goal

Deliver the M6 local read/runtime surfaces for `/learn`, `/me`, and
`/me/settings`: RLS-backed read helpers, route pages, settings forms in
read-only mode, and tested empty states.

## Context

- Depends on M0 RLS tables (`articles`, `terms`, `bookmarks`,
  `user_preferences`, `watchlists`, `follows`, `saved_screens`, `notes`,
  `alerts`) and the M1-M5 route patterns.
- Product specs: `docs/product-specs/learn.md` and
  `docs/product-specs/my-page-settings.md`.
- User-facing helpers must use `createRlsSupabaseClient()` only. Service-key
  access remains limited to admin, cron, and worker domains.
- Temporary M0 auth does not produce a real Supabase `auth.uid()`, so
  bookmark toggles, settings saves, and alert rule writes remain disabled
  rather than bypassing RLS.
- TD-006 (push vs. email alerts) must be resolved before the notification
  channel picker is enabled. The settings UI renders toggles but the
  channel selector stays disabled.

## Tasks

- [x] Draft this EP-0007 plan with local milestone adaptations.
- [x] Implement `app/_lib/learn/learn-data.ts` with typed reads from
      `articles` and `terms`.
- [x] Implement pure learn helpers for category filtering, guide card
      shaping, terms preview, and empty-state fallbacks.
- [x] Implement `app/_lib/my-page/my-page-data.ts` with typed reads from
      `auth.users`, `user_preferences`, `watchlists`, `follows`,
      `bookmarks`, `saved_screens`, and `notes`.
- [x] Implement pure my-page helpers for KPI aggregation, recent activity
      feed, and sidebar navigation counts.
- [x] Implement `app/_lib/settings/settings-data.ts` with typed reads from
      `user_preferences` and `alerts`.
- [x] Add focused Vitest coverage for deterministic empty fallbacks and
      helper shaping behavior.
- [x] Build `/learn`, `/me`, and `/me/settings` route pages with
      temporary-auth protection and disabled user-write actions.
- [x] Render learn guide content through the DOMPurify-backed Markdown
      boundary only.
- [x] Add Playwright smoke coverage for the M6 routes and empty/auth-required
      states.
- [ ] Wire production bookmark writes, settings persistence, and alert rule
      CRUD after real OAuth sessions are available.

## Done When

- Local runtime/read surfaces are complete: route pages import tested data
  helpers and render deterministic populated, empty, and not-found states.
- Helpers do not write bookmarks, preferences, notes, or alert rules.
- Helpers do not import service-key clients, cron helpers, or external
  providers.
- Bookmark toggles and settings forms are honest under temporary auth:
  disabled until real OAuth-backed Supabase sessions are available.
- Notification toggles render but the channel picker is disabled pending
  TD-006 resolution.
- Focused M6 Vitest coverage and route smoke coverage pass.

## External Evidence Gates

- Production OAuth/user writes are not complete locally. Bookmark, settings
  save, and alert rule round-trips stay gated until real Supabase auth
  sessions replace temporary M0 auth.
- Alert evaluation cron (`/api/cron/alerts-eval`) requires production
  deployment and 7-day quota observation, not claimed by this local
  foundation slice.
- The push vs. email decision (TD-006) must be resolved before the
  notification channel picker ships.
