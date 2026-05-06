# Execution Plan — EP-0001 · M0 Infrastructure

## Goal

Stand up the foundational infrastructure for STOCKLAB so that M1 can start
building on a working single Supabase project, a temporary auth loop, and a
deployable Vercel app.

## Context

- Plan reference: `STOCKLAB-Project-Plan.md` Roadmap row M0 (1 week).
- Architecture invariants: see `ARCHITECTURE.md` "Invariants".
- Data and RLS conventions: see `docs/SECURITY.md` and
  `docs/generated/db-schema.md`.
- Target Supabase project URL:
  `https://luiaofafdbikmqusurpi.supabase.co`.
- Data-source reduction dependency: see
  [EP-0011](./EP-0011-data-source-reduction.md).
- This is the first milestone; nothing depends on prior code.
- Owner decision on 2026-05-06: use the owner-provided Supabase project as the
  single dev / preview / production project for now. Do not create separate
  Supabase projects until the owner asks for environment separation.
- Owner decision on 2026-05-06: defer real Google / Apple / Kakao OAuth setup
  to the final auth pass. M0 should create a temporary auth loop that exercises
  protected routing without requiring provider credentials.

## Tasks

- [ ] Use the owner-provided Supabase project as the single project for `dev`,
      `preview`, and `production` until environment separation is requested.
- [ ] Register the owner-provided Supabase URL as `SUPABASE_URL` in local
      `.env`, Vercel, and GitHub Actions configuration.
- [ ] Verify that anon and service-role keys exist only in local / hosted
      secret stores and are not committed.
- [ ] Generate `supabase/migrations/` with all system and user tables from
      `docs/generated/db-schema.md`.
- [ ] Add RLS policies to every user table (`user_id = auth.uid()` on
      SELECT / INSERT / UPDATE / DELETE).
- [ ] Add admin role policies (`auth.jwt() ->> 'role' = 'admin'`).
- [ ] Add a temporary auth loop for local / preview development so protected
      routing can be tested before real OAuth credentials are ready.
- [ ] Keep placeholders for Supabase Auth providers: Email, Google, Apple,
      Kakao. Full provider setup ships in the final auth pass.
- [ ] Add Edge Function or DB trigger that recomputes `holdings` from
      `transactions` (placeholder OK; full logic ships in M5).
- [ ] Create Vercel project linked to the GitHub repo.
- [ ] Wire all secrets per `docs/SECURITY.md` "Secret Management".
- [ ] Add a minimal `app/(public)/login/page.tsx` that exercises the temporary
      auth loop. OAuth provider buttons may be disabled placeholders until the
      final auth pass.
- [ ] Add a `app/api/cron/__health/route.ts` that verifies `CRON_SECRET`
      and returns `200 ok`. Schedule it once an hour to confirm the
      Vercel Cron pipeline.
- [ ] Add a Supabase smoke check that confirms anonymous reads on system
      tables, blocked anonymous writes, authenticated user-table RLS, and
      service-role migration access.
- [ ] Add Sentry SDK on both server and client; verify a captured error.
- [ ] Add Lighthouse CI workflow against `/login` (Performance ≥ 90).

## Done When

- A fresh local / preview user can pass through the temporary auth loop and
  reach the protected redirect target. Real OAuth provider sign-up is deferred
  to the final auth pass.
- The app and CI both target `https://luiaofafdbikmqusurpi.supabase.co`
  without exposing keys in tracked files or logs.
- `pnpm supabase db push` applies the schema cleanly to a fresh project.
- `app/api/cron/__health` returns `200 ok` only when the bearer token is
  correct and `401 unauthorized` otherwise.
- Sentry shows the seeded test error on the project dashboard.
- Lighthouse CI passes on `/login`.

## Notes

- Do not implement business features in this milestone. Anything beyond
  the bullet points above is scope creep and belongs in the relevant
  later EP.
