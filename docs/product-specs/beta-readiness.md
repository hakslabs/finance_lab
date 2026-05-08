# Feature Spec — Beta Readiness

**ID:** PS-12 · **Milestone:** M9 · **Path:** N/A (operational)

## Problem

The platform works locally but is not ready for real users. Before
inviting ~50 friends, the project owner needs confidence that auth works
end-to-end, cron jobs stay within free-tier quotas, the site is fast on
mobile, errors are caught, and legal documents are in place.

## Scope

This is not a feature milestone. It is a readiness checklist that gates
the beta open. Each item must pass before invites go out.

### Production Gates

1. **OAuth End-to-End** — Google, Apple, and Kakao login flows work on
   the hosted Vercel deployment. Sessions persist across page reloads.
   Temporary M0 auth is removed or disabled.

2. **Hosted Secrets** — All environment variables (Supabase URL, anon
   key, service role key, Finnhub key, CRON_SECRET, etc.) are set in
   Vercel. No `.env.local` values leak into the build.

3. **Cron Observation** — All cron jobs run on the hosted deployment for
   7 consecutive days without exceeding free-tier quotas. Evidence is
   captured in `cron_logs`.

4. **Lighthouse Performance** — Home and stock detail score >= 90 on
   both desktop and mobile. Baseline captured and committed.

5. **Error Monitoring** — Sentry project is created, DSN is configured,
   and errors from the hosted deployment appear in the Sentry dashboard.
   Source maps upload on deploy.

6. **Legal Documents** — Privacy policy and Terms of Service are drafted,
   reviewed, and linked from the app footer and signup flow. (TD-007)

7. **Invite System** — A mechanism exists to generate and distribute
   invite codes or links to ~50 friends. This can be as simple as a
   shared signup URL with a query parameter.

8. **Feedback Collection** — A feedback channel is available to beta
   users. This can be a dedicated email, a form, or a third-party tool
   (e.g., Tally, Canny).

### Pre-Beta QA

- Full Playwright smoke suite passes on the hosted deployment.
- All M0 through M8 Done-When criteria are met on production.
- Mobile PWA installs and runs on at least one iOS and one Android
  device.
- Admin console is accessible and functional for the project owner.

## Constraints

- Beta is invite-only. No public signup or SEO indexing.
- The invite list is capped at ~50 users to stay within free-tier
  limits.
- No paid infrastructure is provisioned. If free-tier limits are
  breached, the project owner must decide whether to pay or cap usage.
- Feedback is collected but no SLA is promised to beta users.

## Constraints — Privacy

- Privacy policy covers data collection, storage, retention, and
  deletion practices.
- Beta users can request data export and account deletion.
- No beta user data is shared with third parties beyond Supabase
  hosting and Sentry error reporting.

## Local Adaptation — EP-0010

- This milestone has no local-runtime code changes. It is a production
  readiness gate.
- The EP tracks each gate item as a task with a pass/fail status.
- Local development continues to work as before; no local features are
  removed or disabled.

## Done When

- All eight production gates pass on the hosted deployment.
- Pre-beta QA checklist is complete.
- At least one real user (the project owner) has signed up via OAuth on
  the hosted deployment and reached the home dashboard.
- Privacy policy and ToS are published and linked.
- Invite mechanism is tested with a small group (2-3 people) before the
  full 50-person rollout.
