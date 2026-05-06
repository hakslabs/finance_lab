# Execution Plan — EP-0011 · Data Source Reduction

## Goal

Reduce recurring external data collection by connecting the target Supabase
project, seeding a US / South Korea security master from FinanceDatabase,
standardizing report Markdown conversion through Docling, and evaluating
Scrapling as the controlled scraping layer for allowed external pages.

## Context

- Supabase project URL provided by the owner:
  `https://luiaofafdbikmqusurpi.supabase.co`.
- Docling source: `https://github.com/docling-project/docling`.
- FinanceDatabase source: `https://github.com/JerBouma/FinanceDatabase`.
- Scrapling source: `https://github.com/D4Vinci/Scrapling`.
- Data-source invariants still apply: KIS-style brokerage APIs, yfinance,
  and Naver / Daum body scraping are forbidden.
- This plan is cross-cutting. It supports M0, M1, M2, M3, and M4 rather than
  replacing those milestone plans.

## Source Roles

| Source | Role | Constraint |
| --- | --- | --- |
| Supabase | Primary DB and Auth backend | URL is public config; publishable and secret keys stay in secret stores only |
| Docling | Convert PDFs and other documents to Markdown, tables, and optional JSON | MIT; use in GitHub Actions worker, not Vercel Cron |
| FinanceDatabase | Seed `securities_master` for US and South Korea symbols | MIT; treat as product metadata, not live quote / fundamentals data |
| Scrapling | Extract structured data from allowed HTML pages and optionally expose an MCP scraping workflow | BSD-3-Clause; respect robots.txt, terms, and domain allowlists |

## Tasks

- [ ] Register `SUPABASE_URL=https://luiaofafdbikmqusurpi.supabase.co` in
      Vercel and GitHub Actions secrets / variables as appropriate.
      Blocked: needs owner to set in Vercel dashboard and GitHub Actions.
      Local `.env.example` is wired.
- [ ] Verify `SUPABASE_PUBLISHABLE_KEY` and `SUPABASE_SECRET_KEY` are configured
      only in secret stores and never committed.
      Note: repository scan/smoke work confirms keys are not committed; hosted
      secret-store placement needs owner dashboard confirmation.
- [x] Add a Supabase connection smoke check to M0 that verifies Auth, RLS,
      and service-role migration access against the target project.
      Implemented in `scripts/smoke-supabase.ts`.
- [x] Add `securities_master` and `security_aliases` migrations before M1
      quote work starts.
- [x] Import only FinanceDatabase rows where `country` is `United States` or
      `South Korea`.
- [x] Prefer primary listings for US equities and KOSPI / KOSDAQ listings
      for South Korea; keep non-primary listings only when explicitly needed
      for search aliases.
- [x] Preserve FinanceDatabase attribution and source revision metadata on
      every imported row.
- [x] Use the imported security master to drive stock search and quote job
      target lists.
      Stock search (`/api/search`) and default quote target selection
      (`app/_lib/cron/quote-targets.ts`) both read from `securities_master`.
- [ ] Use the imported security master to drive screener options and admin
      symbol curation.
      Deferred to their owning milestone plans (M3 screener, admin routes).
- [ ] Keep live prices, fundamentals, filings, and news on the existing
      allowed source plan; FinanceDatabase must not be treated as fresh market
      data.
- [ ] Add a Docling worker contract for report ingestion: input URL / file,
      output Markdown, output table JSON, source metadata, and parser
      warnings.
- [ ] Store Docling Markdown in `reports.markdown` and extracted tables in
      `reports_tables`.
- [ ] Add a 20-document Docling audit set before M4 begins, covering Korean
      reports, US research PDFs, tables, scanned pages, and multi-column
      layouts.
- [ ] Evaluate Scrapling on three allowed source types: official IR pages,
      public RSS / HTML indexes, and report landing pages that do not require
      login or anti-bot bypass.
- [ ] Decide whether Scrapling runs as a Python package in GitHub Actions,
      a dedicated MCP server for operator-assisted extraction, or both.
- [ ] For Scrapling crawls, require domain allowlists, `robots_txt_obey`,
      crawl-delay handling, cached development mode, and per-source output
      schemas.
- [ ] Forbid Scrapling use for bypassing paywalls, login walls, CAPTCHAs, or
      sites whose terms disallow collection.
- [x] Add `external_source_runs` logging for the FinanceDatabase import so it
      records source, URL, revision, started / finished timestamps, status, and
      error. Docling and Scrapling runs will extend the same table later.
- [ ] Update [Reliability](../../RELIABILITY.md) quota tables after the
      proof of concept measures actual GitHub Actions minutes and DB growth.

## Done When

- The target Supabase project accepts migrations from CI and the app can read
  public system tables with the publishable key.
- `securities_master` contains deduplicated US and South Korea symbols with
  source attribution and no disallowed data source references.
- Home search and quote target selection read from `securities_master` rather
  than hard-coded symbol lists.
- A GitHub Actions Docling job converts the audit set to Markdown and table
  JSON with reviewable parser warnings.
- Scrapling has a written allowlist and proof-of-concept output for at least
  one allowed source, or is explicitly rejected with a documented reason.
- Admin can inspect `external_source_runs` for FinanceDatabase imports,
  Docling conversions, and Scrapling crawls.

## Risks

- FinanceDatabase is useful for symbol discovery, but it is not a substitute
  for current quotes, financial statements, filings, or news.
- South Korea symbol coverage and preferred listing logic must be audited
  against KRX before it becomes user-visible.
- Docling table extraction can drift by document layout; M4 must keep manual
  review and parser warnings in the workflow.
- Scrapling includes stealth and anti-bot features, but STOCKLAB must use only
  the compliant subset. Compliance beats collection coverage.

## Notes

- Do not commit Supabase keys, crawl cookies, downloaded PDFs, generated
  Docling JSON dumps, or scrape output fixtures unless they are tiny,
  license-cleared, and intentionally added as tests.
- If a source cannot be clearly licensed for redistribution, keep only a link
  and derived non-copyrightable metadata, or do not ingest it.
- FinanceDatabase seed import is implemented in
  `scripts/import-financedatabase-seed.ts` against pinned revision
  `1b81bacb9f8672491e8ef4bd4036c4e87204dbd9`; use
  `pnpm seed:financedatabase:dry-run`, `pnpm seed:financedatabase`, and
  `pnpm seed:financedatabase:verify`.
- 2026-05-06 slice: stock search and default quote target selection now consume
  `securities_master`. Screener options and admin symbol curation integration
  remain deferred to their owning milestone plans.
- 2026-05-07 reconciliation: FinanceDatabase import, `securities_master`
  migrations, stock search integration, quote target list integration, and
  `external_source_runs` logging are all verified complete in committed code.
  Remaining work is Docling (worker contract, storage, audit set), Scrapling
  (evaluation, deployment decision, allowlists, paywall prohibition), Reliability
  quota table update, screener/admin curation wiring, and the external
  Supabase URL registration in Vercel/GitHub dashboards.
