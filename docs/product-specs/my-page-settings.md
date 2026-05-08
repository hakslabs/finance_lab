# Feature Spec — My Page Hub + Settings

**ID:** PS-09 · **Milestone:** M6 · **Path:** `/me`, `/me/settings`

## Problem

A user's personal data is scattered across watchlists, follows, bookmarks,
saved screens, and notes. There is no single place to see "everything about
me" or to control how the platform behaves. Settings are either missing or
hardcoded.

## Scope

Two authenticated routes:

### `/me` — My Page Hub

1. **Profile Hero** — Avatar, display name, email, member-since date.
2. **KPI Cards** — Four summary cards: watchlist count, follows count,
   bookmarks count, saved screens count.
3. **Sidebar Navigation** — Links to Watchlists, Follows, Bookmarks, Saved
   Screens, Notes/Journal, Activity Log, and Settings.
4. **Main Content** — Defaults to a combined "recent activity" feed
   showing the latest items across all personal data surfaces.

### `/me/settings` — Account Settings

1. **Profile** — Avatar upload, display name, nickname, email.
2. **Security** — Password change (email provider only), connected social
   accounts (Google, Apple, Kakao) with unlink option.
3. **Market / Currency** — Default market (KR, US, Both), base currency
   (KRW, USD).
4. **Language / Timezone** — Locale selector, timezone selector.
5. **Theme** — Light, dark, system.
6. **Notification Toggles** — Six alert types: price target, technical
   signal, 13F change, dividend record date, filing alert, system notice.
   Each has an enable/disable toggle and a channel selector (push vs.
   email, pending TD-006).
7. **Data Export** — Request a ZIP of all personal data (watchlists,
   transactions, notes, bookmarks).
8. **Delete Account** — Destructive action with confirmation dialog.

## User Actions

- Sidebar link navigates to the corresponding personal data surface.
- Settings form fields persist on save (requires OAuth).
- Notification toggle changes take effect on next alert evaluation cycle.
- Data export triggers a background job and emails a download link.
- Delete account shows a confirmation dialog, then schedules deletion.

## Data Dependencies

`auth.users`, `user_preferences`, `watchlists`, `follows`, `bookmarks`,
`saved_screens`, `notes`, `alerts`.

## Constraints

- Server-rendered by default. Settings forms are client components for
  interactivity.
- All personal data is RLS-protected. No cross-user visibility.
- Delete account is a soft-delete with a 30-day recovery window; hard
  delete runs via a cron job.
- Data export must complete within the Vercel serverless function timeout
  (10s for small accounts, background job for large ones).
- Notification channel selection is deferred to TD-006. The settings UI
  renders the toggle but the channel picker is disabled until the push
  vs. email decision is made.

## Constraints — Privacy

- All personal data surfaces are behind RLS with `user_id = auth.uid()`.
- Data export includes only the requesting user's data.
- Activity log entries reference `user_id` only, never display names.

## Local Adaptation — EP-0007

- This local slice implements read-only my-page helpers and settings form
  UI over `auth.users`, `user_preferences`, and personal data tables.
- Under temporary M0 auth, settings forms render in a read-only preview
  mode. Save, delete, and export actions are disabled.
- Notification toggles render but do not persist until real OAuth sessions
  are available.
- Data export and account deletion are gated to production OAuth.

## Done When

- `/me` renders on a logged-in temporary session with profile hero, KPI
  cards, and sidebar navigation.
- `/me/settings` renders all setting sections with forms in read-only
  mode under temporary auth.
- Sidebar links navigate to existing personal data surfaces (watchlists,
  transactions, etc.).
- Notification toggles are present but disabled under temporary auth.
- Vitest covers data aggregation and Playwright covers login → my page →
  settings.
