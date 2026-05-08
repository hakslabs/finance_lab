# Docling Worker Contract

Docling is the standard converter for report files in STOCKLAB. It runs outside
Vercel, writes only normalized outputs to Supabase, and treats every converted
document as untrusted until the app sanitizes it at render time.

## Purpose

- Convert PDF, DOCX, HTML, image, and spreadsheet-style report sources to
  Markdown once, then serve the cached Markdown from `reports.markdown`.
- Extract reviewable table JSON into `reports_tables` so the app does not parse
  tables from Markdown on request.
- Capture parser confidence, provenance, warnings, and version metadata so admins
  can decide whether a report can be summarized or needs manual review.
- Keep CPU-heavy parsing in GitHub Actions or another worker environment; never
  run Docling inside Vercel Cron or request handlers.

## Worker Input

Each worker invocation handles one report source.

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `report_id` | UUID | yes | Existing `reports.id` row to update. |
| `source_uri` | URL or file path | yes | Public URL or worker-local file path. Do not store raw files unless license-cleared. |
| `source_mimetype` | string | no | Use when the caller already knows the type. Otherwise Docling may infer it. |
| `source_revision` | string | no | ETag, content hash, filing accession, or upstream revision. |
| `page_range` | `[number, number]` | no | 1-based inclusive page range for audits/retries. |
| `max_file_size_bytes` | number | yes | Hard guardrail before download/conversion. |
| `max_pages` | number | yes | Hard guardrail before conversion. |
| `timeout_seconds` | number | yes | Default target: 300 seconds per document in GitHub Actions. |
| `ocr_languages` | string[] | yes | Default: `['ko', 'en']` for Korean/English reports. |
| `force_ocr` | boolean | no | Only for scanned PDFs or broken embedded text layers. |
| `table_mode` | `accurate` or `fast` | yes | Default: `accurate` for financial tables. |

The worker must validate this envelope before reading the source. Missing
`report_id`, unsupported URI schemes, oversized files, and unsupported formats
fail before Docling starts.

## Conversion Defaults

- Pipeline: Docling standard pipeline.
- Device: CPU in GitHub Actions.
- OCR: enabled for unknown/scanned documents; use EasyOCR with `ko,en` by
  default. Digital-native PDFs may use `no_ocr` for speed after audit evidence.
- Tables: enabled with accurate TableFormer mode and cell matching.
- Errors: batch mode should keep `no_abort_on_error` behavior so one bad page can
  produce `partial_success` plus warnings instead of losing all extracted text.
- Timeout: set per-document timeout. Hung conversions are failures, not retries
  inside Vercel.

CLI and Python-library implementations are both acceptable. The contract is the
same either way: Markdown, tables, confidence, provenance, warnings, and parser
version are the only outputs that downstream code may rely on.

## Worker Output

The worker emits a JSON-safe result for persistence and admin review.

```json
{
  "report_id": "uuid",
  "status": "success | partial_success | failure | skipped",
  "markdown": "# ...",
  "tables": [
    {
      "index": 0,
      "caption": "Consolidated income statement",
      "page_no": 12,
      "num_rows": 8,
      "num_cols": 5,
      "data": [{ "Account": "Revenue", "2025": "..." }]
    }
  ],
  "confidence": {
    "mean_grade": "EXCELLENT | GOOD | FAIR | POOR",
    "low_grade": "EXCELLENT | GOOD | FAIR | POOR",
    "parse_score": 0.0,
    "layout_score": 0.0,
    "ocr_score": 0.0,
    "table_score": null,
    "pages": []
  },
  "origin": {
    "filename": "report.pdf",
    "mimetype": "application/pdf",
    "binary_hash": "sha256-or-docling-hash",
    "uri": "https://...",
    "page_count": 32
  },
  "warnings": [
    { "code": "LOW_CONFIDENCE_PAGE", "message": "Page 12 OCR confidence was FAIR", "page_no": 12 }
  ],
  "docling_version": "2.x",
  "source_revision": "etag-or-accession"
}
```

`table_score` is not a release gate until Docling exposes implemented table
confidence. Table quality is measured through the audit set and admin review.

## Supabase Mapping

| Output | Destination | Rule |
| --- | --- | --- |
| `markdown` | `reports.markdown` | Store only sanitized-ready Markdown; rendering still goes through DOMPurify. |
| `tables[*]` | `reports_tables.table_json` | One row per table, `idx = tables[*].index`. |
| source URL | `reports.pdf_url` | Keep source link when licensed/allowed. |
| parser status | `external_source_runs.status` | Use `success -> ok`, `partial_success -> ok` with warnings, `failure -> failed`. |
| parser warnings/error | `external_source_runs.err` | Store compact warning/error summary, not raw logs. |
| provenance/license | `external_source_runs.source_url`, `source_revision`, `license_note` | Preserve enough lineage to audit redistribution. |

The current schema stores table payloads in `reports_tables.table_json` only. If
future UI needs caption/page/shape fields as separate columns, add a migration in
the M4 report slice after the 20-document audit proves the shape.

## Quality Gates

- Accept automatically when status is `success` and `confidence.low_grade` is
  `GOOD` or `EXCELLENT`.
- Mark `needs_review` in worker output when status is `partial_success` or the
  lowest confidence grade is `FAIR`.
- Fail the conversion when status is `failure`, timeout occurs, source licensing
  is unclear, or `confidence.low_grade` is `POOR`.
- Do not send `failure` or `needs_review` reports to Gemini summarization until
  an admin approves or reprocesses them.
- Keep raw Docling JSON as a temporary worker artifact only. Do not commit it and
  do not persist it unless a later migration creates an explicit review table.

## Audit Set

Before the production report pipeline begins, collect a 20-document audit set
with owner approval:

- Korean brokerage/IR PDFs with dense Korean text.
- US research PDFs with multi-column layouts.
- PDFs with large financial tables and merged headers.
- Scanned or image-heavy documents.
- Short HTML/DOCX/XLSX samples if those sources are still in scope.

Each audit record must include license/source notes, expected page count,
expected table count, and reviewer outcome. Do not commit downloaded PDFs or
converted dumps unless the fixture is tiny, license-cleared, and intentionally
needed for tests.

## Failure Handling

- Source unavailable: keep the `reports` row with the source link and record a
  failed `external_source_runs` entry.
- Timeout: retry only in GitHub Actions/manual worker context with a larger
  timeout or page range. Never retry inside Vercel Cron.
- Low confidence: store Markdown/tables only if useful for review, mark warnings,
  and block downstream summaries.
- Table extraction drift: keep Markdown but flag tables for review; table JSON is
  allowed to be empty if extraction is unreliable.

## Explicit Non-Goals

- No Docling runtime inside Next.js request handlers or Vercel Cron.
- No raw PDF archive in the repository.
- No raw HTML/PDF/body scraping expansion beyond EP-0011 allowed sources.
- No direct rendering of `reports.markdown` without DOMPurify.
- No Gemini summarization until Docling status and confidence pass the gates.
