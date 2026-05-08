# Feature Spec — Admin Console

**ID:** PS-10 · **Milestone:** M7 · **Path:** `/admin`

## Problem

Content operations (managing masters, guides, terms, news curation) and
system monitoring (cron health, API quotas, user activity) have no
dedicated surface. The project owner currently queries Supabase directly
or reads logs, which does not scale.

## Scope

One authenticated `/admin` route gated by RLS and a role check
(`is_admin` flag on `auth.users` or a dedicated `admin_roles` table):

1. **Top Bar** — Dark red accent bar distinguishing admin from user
   surfaces. Shows admin email and a "back to app" link.
2. **Sidebar** — Dashboard, Masters, 13F Parsing, Learn Content, Terms
   Dictionary, News Curation, Users, API Usage, Cron Logs, Announcements.
3. **Dashboard** — KPI cards: DAU, new signups (7d), today's API calls,
   cron failure count. Recent activity feed.
4. **Masters CRUD** — List, search, create, edit, deactivate master
   profiles. Link to 13F holdings per master.
5. **13F Parsing** — Upload trigger, parse status, error log, manual
   re-parse button.
6. **Learn Content CRUD** — List, create, edit, publish/unpublish guide
   articles. Markdown preview.
7. **Terms Dictionary CRUD** — List, create, edit, merge, deactivate
   terms.
8. **News Curation** — Pending queue, pin/unpin, hide, source blocklist.
9. **Users** — List with search, role assignment, activity summary,
   manual data export trigger.
10. **API Usage** — Usage bars per external source, quota remaining,
    rate-limit status.
11. **Cron Logs** — Filterable log table with status, duration, error
    message, retry count.
12. **Announcements** — Create/edit/delete system-wide banners with
    scheduling (start/end time, target segment).

## User Actions

- Sidebar navigation switches admin sections.
- CRUD forms for masters, guides, terms, and announcements.
- 13F upload triggers the parse pipeline.
- News curation actions (pin, hide, block source).
- User role assignment and manual export trigger.

## Data Dependencies

All application tables plus `cron_logs`, `api_quota`, `admin_roles`.

## Constraints

- Admin routes check both RLS and an explicit `is_admin` role. A user
  without the role sees a 404, not an empty admin panel.
- Admin surfaces are server-rendered. CRUD forms are client components.
- Admin actions that modify user data (role changes, exports) are logged
  to an `admin_audit_log` table.
- The admin console does not expose raw SQL or database credentials.
- Markdown content authored in admin surfaces goes through the same
  DOMPurify boundary as user-facing content.

## Constraints — Privacy

- Admin can view aggregate user data (DAU, signup counts) but individual
  user PII is limited to email and role.
- Admin audit log entries record who did what, not the full data payload.
- User data export triggered from admin is logged and scoped to the
  target user only.

## Local Adaptation — EP-0008

- This local slice implements read-only admin dashboard and list surfaces
  over `cron_logs`, `api_quota`, and application tables.
- Under temporary M0 auth, the admin role check uses a hardcoded local
  flag. CRUD forms render in read-only mode.
- 13F upload, news curation actions, and user role changes are gated to
  production OAuth and real admin sessions.
- Admin audit logging is wired but entries under temporary auth are
  marked as local-only.

## Done When

- `/admin` renders on a local admin session with dashboard KPIs and
  sidebar navigation.
- All admin sections render their list views with data from Supabase.
- CRUD forms are present but disabled under temporary auth.
- Admin role check rejects non-admin users with a 404.
- Vitest covers role gating and Playwright covers admin login → dashboard
  → section navigation.
