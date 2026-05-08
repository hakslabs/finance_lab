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

- [x] Use the owner-provided Supabase project as the single project for `dev`,
      `preview`, and `production` until environment separation is requested.
- [x] Register the owner-provided Supabase URL as `SUPABASE_URL` in local
      `.env`, Vercel, and GitHub Actions configuration.
      Local `.env.example` is wired. Vercel production env registered via
      REST API on 2026-05-07: `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`,
      `SUPABASE_SECRET_KEY`, `CRON_SECRET`, plus the M1-M4 provider keys
      (`KRX_API_KEY`, `FINNHUB_API_KEY`, `DART_API_KEY`, `FRED_API_KEY`,
      `NEWSAPI_KEY`, `ALPHAVANTAGE_KEY`, `GEMINI_API_KEY`) and
      `NEXT_PUBLIC_APP_URL`. GitHub Actions secrets registration still
      blocked on owner.
- [x] Verify that anon and service-role keys exist only in local / hosted
      secret stores and are not committed.
      No keys are committed (`.env` and `.env.production.local` are
      gitignored). Hosted Vercel keys are stored as Encrypted entries on
      `production` target. GitHub Actions secret store still pending owner
      confirmation.
- [x] Generate `supabase/migrations/` with all system and user tables from
      `docs/generated/db-schema.md`.
- [x] Add RLS policies to every user table (`user_id = auth.uid()` on
      SELECT / INSERT / UPDATE / DELETE).
- [x] Add admin role policies (`auth.jwt() ->> 'role' = 'admin'`).
      Implemented via `private.is_admin()` helper using
      `app_metadata ->> 'app_role'`.
- [x] Add a temporary auth loop for local / preview development so protected
      routing can be tested before real OAuth credentials are ready.
- [x] Keep placeholders for Supabase Auth providers: Email, Google, Apple,
      Kakao. Full provider setup ships in the final auth pass.
      Env schema (`app/_lib/env/schema.ts`) now accepts optional
      `OAUTH_GOOGLE_CLIENT_ID` and `OAUTH_GOOGLE_CLIENT_SECRET`. When the
      owner adds them to `.env`, `pnpm register:secrets` pushes them to
      Vercel production env. Supabase provider activation (toggle Google
      ON in the Supabase dashboard with the same client ID/secret + add
      `https://luiaofafdbikmqusurpi.supabase.co/auth/v1/callback` as an
      authorized redirect URI in Google Cloud) and the actual login-page
      OAuth flow ship in the final auth pass.
- [x] Add Edge Function or DB trigger that recomputes `holdings` from
      `transactions` (placeholder OK; full logic ships in M5).
      Implemented as a DB trigger placeholder: buy/sell rows recompute the
      affected `(user_id, symbol, currency)` holding; cash/div rows are ignored;
      full realized-gain, cash-ledger, dividend, and performance logic remains
      M5 scope.
- [x] Create Vercel project linked to the GitHub repo.
      Linked on 2026-05-07 via `vercel link --scope haks-finance-lab-s-projects
      --project finance-lab`. `.vercel/project.json` committed-locally only;
      `vercel.json` cron config (daily) is committed.
- [x] Wire all secrets per `docs/SECURITY.md` "Secret Management".
      Vercel production env registered on 2026-05-07. GitHub Actions
      secrets (`SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`,
      `SUPABASE_SECRET_KEY`, `CRON_SECRET`) registered to
      `hakslabs/finance_lab` on 2026-05-09 via `pnpm register:secrets`
      (libsodium sealed-box). Sentry DSN env (`SENTRY_DSN` and
      `NEXT_PUBLIC_SENTRY_DSN`) also registered on the same run. The
      script is idempotent and re-runs safely.
- [x] Add a minimal `app/(public)/login/page.tsx` that exercises the temporary
      auth loop. OAuth provider buttons may be disabled placeholders until the
      final auth pass.
- [x] Add a `app/api/cron/__health/route.ts` that verifies `CRON_SECRET`
      and returns `200 ok`. Schedule it daily to confirm the Vercel Cron
      pipeline (Hobby plan caps cron to once per day).
      Route and `vercel.json` daily schedule (`0 0 * * *` UTC) are committed
      and deployed to production. Live verified 2026-05-08:
      `GET /api/cron/__health` returns `200 {"ok":true}` with the bearer and
      `401` without. 7-day scheduled-run observation still needs the first
      Vercel Cron tick.
- [x] Add a Supabase smoke check that confirms anonymous reads on system
      tables, blocked anonymous writes, authenticated user-table RLS, and
      service-role migration access.
      Implemented in `scripts/smoke-supabase.ts`. CI runs it on push when
      secrets are configured.
- [x] Add Sentry SDK on both server and client; verify a captured error.
      SDK is wired on server, edge, and client with PII stripping.
      `SENTRY_DSN` is env-gated (disabled when unset).
      `instrumentation.ts` uses dynamic imports so the Sentry bundle only
      enters the runtime when DSN is set (prevents `__dirname` crashes in
      Edge middleware).
      `SENTRY_DSN` and `NEXT_PUBLIC_SENTRY_DSN` registered to Vercel
      production env on 2026-05-09 via `pnpm register:secrets`. Production
      redeploy on the same day picks up the active Sentry configuration.
      Captured-error verification (one real exception flowing to the Sentry
      dashboard) still depends on triggering an error in production once.
- [ ] Add Lighthouse CI workflow against `/login` (Performance >= 90).
      Workflow and `.lighthouserc.cjs` are committed. Blocked: needs a live
      Vercel preview URL to run against. GitHub Actions workflow_dispatch
      or PR trigger will execute once deployed.

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
- 2026-05-07 reconciliation: repository-local M0 code is complete for schema,
  RLS, auth loop, login page, cron health, smoke check, Sentry SDK wiring,
  CI workflow, Lighthouse workflow, `vercel.json`, and the holdings
  recomputation placeholder. Remaining items are owner/dashboard confirmations
  (Vercel project, hosted secrets, Sentry captured error, Lighthouse preview
  run). Full M5 portfolio accounting remains deferred.
