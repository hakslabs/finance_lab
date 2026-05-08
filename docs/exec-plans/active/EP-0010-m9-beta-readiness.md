# Execution Plan — EP-0010 · M9 Beta Readiness

## Goal

Verify that all production gates pass before inviting ~50 friends to the
beta. This milestone has no local-runtime code changes; it is a
production readiness checklist.

## Context

- Depends on M0 through M8 being functionally complete on the hosted
  deployment.
- Product spec: `docs/product-specs/beta-readiness.md`.
- Beta is invite-only. No public signup or SEO indexing.
- The invite list is capped at ~50 users to stay within free-tier limits.
- No paid infrastructure is provisioned.
- TD-007 (privacy policy and ToS) must be resolved before beta open.

## Tasks

- [ ] Draft this EP-0010 plan with production gate checklist.
- [ ] **Gate 1: OAuth End-to-End** — Verify Google, Apple, and Kakao
      login flows work on the hosted Vercel deployment. Sessions persist
      across page reloads. Remove or disable temporary M0 auth.
- [ ] **Gate 2: Hosted Secrets** — Verify all environment variables are
      set in Vercel. Confirm no `.env.local` values leak into the build
      output.
- [ ] **Gate 3: Cron Observation** — Run all cron jobs on the hosted
      deployment for 7 consecutive days. Verify no free-tier quota
      breaches. Capture evidence in `cron_logs`.
- [ ] **Gate 4: Lighthouse Performance** — Run Lighthouse on home and
      stock detail (desktop and mobile). Verify scores >= 90. Commit
      baseline report.
- [ ] **Gate 5: Error Monitoring** — Create Sentry project, configure
      DSN, verify source map uploads, and confirm errors from the hosted
      deployment appear in the Sentry dashboard.
- [ ] **Gate 6: Legal Documents** — Draft, review, and publish privacy
      policy and Terms of Service. Link from app footer and signup flow.
      (TD-007)
- [ ] **Gate 7: Invite System** — Implement or configure an invite
      mechanism (shared signup URL with query parameter, invite codes, or
      similar). Test with 2-3 people before full rollout.
- [ ] **Gate 8: Feedback Collection** — Set up a feedback channel (email,
      form, or third-party tool). Verify it is accessible from the app.
- [ ] **Pre-Beta QA** — Run full Playwright smoke suite on the hosted
      deployment. Verify all M0-M8 Done-When criteria pass on production.
- [ ] **Pre-Beta QA** — Test PWA install on at least one iOS and one
      Android device.
- [ ] **Pre-Beta QA** — Verify admin console is accessible and functional
      for the project owner on the hosted deployment.
- [ ] **Soft Launch** — Invite 2-3 people, collect feedback, fix critical
      issues before the full 50-person rollout.

## Done When

- All eight production gates pass on the hosted deployment.
- Pre-beta QA checklist is complete.
- At least one real user (the project owner) has signed up via OAuth on
  the hosted deployment and reached the home dashboard.
- Privacy policy and ToS are published and linked.
- Invite mechanism is tested with a small group (2-3 people) before the
  full 50-person rollout.
- No M0-M8 milestone has unresolved blocking issues on production.

## External Evidence Gates

- Every gate in this EP is an external evidence gate by definition. Local
  development cannot satisfy any of them.
- The 7-day cron observation window is the longest lead-time item. Start
  it as early as possible after M8 local completion.
- Lighthouse scores may differ between localhost and production due to
  network latency, CDN caching, and serverless cold starts. Production
  scores are authoritative.
- Sentry free tier has a limit on events per month. Monitor usage during
  beta to avoid hitting the cap.
