# Core Beliefs

These are the principles STOCKLAB will not trade away. When in doubt, the
rule that wins is the one closer to the top of the relevant list.

## Product Principles

1. **One screen, one mental model.** Every page must answer a single
   question. The home dashboard answers "what is happening, and how am I
   doing?". The stock detail answers "should I act on this ticker?".
2. **Compare to a benchmark, always.** A user's return in isolation is
   meaningless. Every portfolio surface compares to a market average.
3. **AI summaries are previews, not authority.** Gemini summaries are a hook
   to read the source. Disclaimers and source links must always be visible.
4. **Free for friends.** The product runs on free tiers. Adding a feature
   that needs paid infra requires explicit product approval.
5. **Korean and English are first-class.** UI copy, terms, and articles ship
   in both languages where it matters. Date and number formats follow the
   user's selected locale.

## Engineering Principles

1. **Server Components first.** Reach for client interactivity only when
   needed. The Next.js cache and Supabase edge work best when the request
   begins on the server.
2. **The database is the source of truth.** Anything cached client-side is
   ephemeral. Cache invalidation lives in cron handlers, not components.
3. **RLS is non-negotiable.** Every user table has RLS. Service-key access is
   server-only and audited.
4. **Crons must fit free quotas.** Adding a cron job means re-running the
   quota table in `docs/RELIABILITY.md`. If the math does not close, the job
   does not ship.
5. **No hidden state.** Drawings, screen filters, and watchlists are written
   to the database (or `localStorage` with a documented key) — never to
   in-memory globals.
6. **Disallowed data sources are absolute.** No yfinance, no KIS-style
   brokerage APIs, no Naver/Daum body scraping. RSS headlines + links from
   news portals are allowed.

## Verification Principles

1. **Type-check, lint, test before claiming done.** Successful local runs are
   evidence; "looks fine" is not.
2. **One critical-path E2E per major surface.** Home, stock detail, and
   transactions get an E2E smoke test. Other surfaces follow as they
   stabilize.
3. **Cron quotas are tested as numbers.** Quotas live in
   `docs/RELIABILITY.md` and are revisited whenever a new cron job appears.
4. **Lighthouse on home and stock detail stays ≥ 90.** Regressions block
   merges. See `docs/QUALITY_SCORE.md`.
5. **Markdown rendering is sanitized.** Every render of report or note
   markdown goes through DOMPurify. There are no exceptions.
