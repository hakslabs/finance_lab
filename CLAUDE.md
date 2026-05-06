# CLAUDE

Claude Code-specific operating notes for STOCKLAB.

This file supplements `AGENTS.md`. Read `AGENTS.md` first.

## Working Style

- The project owner is the sole engineer; treat every change as a real
  production change, not a sandbox experiment.
- Match the user's Korean for chat replies and PR / commit messages, but keep
  every document under `docs/` (and `AGENTS.md`, `ARCHITECTURE.md`) in
  English. `README.md` is in Korean by design.
- Plan multi-step work in `docs/exec-plans/active/EP-xxxx-<slug>.md` before
  touching code. Complete plans move to `docs/exec-plans/completed/`.

## Tools and Skills

- Use the `Skill` tool for any matching skill before responding. The
  `superpowers` family applies broadly: brainstorming for design questions,
  systematic-debugging for failures, TDD for features.
- Prefer parallel tool calls for independent reads / writes.
- Use the git MCP for git operations (per the user's global rules).

## Forbidden Shortcuts

- Do not introduce yfinance, KIS-style brokerage APIs, or Naver/Daum body
  scraping under any circumstance. The disallowed list in `AGENTS.md` is
  load-bearing.
- Do not bypass RLS on user tables.
- Do not skip `CRON_SECRET` checks on cron handlers.
- Do not paste secrets into code or logs. Secrets live in Vercel /
  GitHub Secrets only.
- Do not commit AI-generated copy as final user-facing text without the user
  approving the wording.

## Things to Verify Before Claiming Done

- `pnpm typecheck` and `pnpm lint` succeed.
- `pnpm test` and the relevant `pnpm e2e` slice succeed.
- `docs/RELIABILITY.md` quotas still hold for any new external call.
- `docs/QUALITY_SCORE.md` targets aren't regressed for routes you touched.
- Any new table or column has a migration, an RLS policy, and an entry in
  `docs/generated/db-schema.md`.

## When You Are Stuck

1. Re-read `STOCKLAB-Project-Plan.md` — it is the spec, not legacy noise.
2. Check `docs/exec-plans/tech-debt-tracker.md` for prior context.
3. Use the `advisor` tool before writing code that locks in an approach.
