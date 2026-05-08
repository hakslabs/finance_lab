# Feature Spec — Reports Pipeline

**ID:** PS-04 · **Milestone:** M4 · **Path:** `/reports`, `/reports/[id]`

## Problem

Users want to consume macro and academic PDF reports quickly without
downloading and skimming each PDF. The system needs to ingest 30+ free RSS
sources daily, extract structured content, and produce trustworthy AI
summaries.

## Scope

Pipeline (runs in three GitHub Actions jobs):

1. **06:00 KR / 06:30 GLOBAL** — RSS poller inserts new PDFs into `reports`
   (status `pending`).
2. **07:00** — Docling worker extracts each PDF to Markdown + `tables_json`,
   updates `reports.markdown` and `reports_tables`. Each report takes
   ~1–2 minutes; budget GitHub Actions minutes accordingly.
3. **07:30** — Gemini 1.5 Flash generates a Korean summary, English
   translation, 5 key points, and auto-tags tickers. Writes to
   `reports.summary` and `reports.tickers[]`.

Reader UI:

- **List** (`/reports`) — search, filter chips (US IB, KR brokers, macro,
  sector, single-stock, ETF, period), recommended hero, sidebar cards,
  latest list with `✨ AI summary` and `tickers[]` chips.
- **Detail** (`/reports/[id]`) — cover, metadata, actions (`★` bookmark,
  open original PDF, write note), AI summary hero, sticky table of
  contents, Markdown body, right rail (related tickers, tags, related
  reports, my notes).

## Data Dependencies

`reports`, `reports_tables`, `user_report_bookmarks`, `notes`.

## Constraints

- Reports must keep a link to the original PDF; AI summary alone is not
  authoritative.
- Markdown rendering goes through DOMPurify.
- Gemini calls stay below 1,500 / day. Budget assumes ~65 reports / day
  with a 15× safety margin.
- Docling failures place the report into status `extract_failed` with a
  manual override path in `/admin`.
- Tag auto-extraction errors do not block summary generation; tags can be
  edited in `/admin`.

## Local Adaptation — EP-0005

- This local slice implements read-only helpers and route UI for `/reports` and
  `/reports/[id]` over `reports` and `reports_tables`, including sanitized
  Markdown rendering through the shared DOMPurify boundary.
- Bookmark and note actions are represented as auth-required/disabled until real
  OAuth-backed Supabase sessions can satisfy RLS. No local helper writes
  `user_report_bookmarks` or `notes`.
- The 7-day ingestion target, 20-PDF table audit, Gemini quota evidence, and
  average pipeline duration gate require staged/production worker runs and are
  not claimed by local tests.

## Done When

- For 7 consecutive days, at least 30 reports per day land in `reports`
  with both Markdown and a Korean summary.
- Average end-to-end pipeline duration (RSS → summary) is under 2 hours.
- A 20-PDF audit shows ≥ 80 % accurate table extraction (TD-004 closed).
- The reader detail view passes Lighthouse Performance ≥ 80 with the
  longest test report.
