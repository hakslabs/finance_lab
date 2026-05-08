# Docling Audit Set — Manifest and Specification

This doc defines the structure, slots, metadata fields, and acceptance rubric
for the 20-document Docling audit set. It is a manifest/spec only. Actual
source selection, download, conversion, and review remain pending owner
approval.

**Status:** manifest/spec complete; source collection, conversion, and audit
processing are not started.

**Traceability:**

- Worker contract requirement: `docs/design-docs/docling-worker-contract.md`
  section "Audit Set" (lines 130-143).
- Reports pipeline gate: `docs/product-specs/reports-pipeline.md` Done-When
  item "20-PDF audit shows >= 80% accurate table extraction."
- Execution plan: `docs/exec-plans/active/EP-0011-data-source-reduction.md`
  audit-set task.

---

## Audit Slots

The 20 slots are divided into five categories. Each slot is a placeholder
until a real source is approved and its metadata filled in.

### Category A: Korean Reports with Dense Korean Text (Slots 1-5)

| Slot | audit_id | source_type | market | language | layout_features | ocr_required | table_challenge |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | `AUDIT-KR-001` | PDF | KR | ko | single-column, dense body text | no | low |
| 2 | `AUDIT-KR-002` | PDF | KR | ko | single-column, mixed text and inline tables | no | medium |
| 3 | `AUDIT-KR-003` | PDF | KR | ko | multi-section with headers and footers | no | low |
| 4 | `AUDIT-KR-004` | PDF | KR | ko | two-column layout with Korean annotations | no | medium |
| 5 | `AUDIT-KR-005` | PDF | KR | ko | single-column, heavy use of charts as images | no | low |

### Category B: US Research PDFs with Multi-Column Layouts (Slots 6-10)

| Slot | audit_id | source_type | market | language | layout_features | ocr_required | table_challenge |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 6 | `AUDIT-US-001` | PDF | US | en | two-column academic layout | no | low |
| 7 | `AUDIT-US-002` | PDF | US | en | three-column newspaper style | no | medium |
| 8 | `AUDIT-US-003` | PDF | US | en | two-column with sidebar callouts | no | medium |
| 9 | `AUDIT-US-004` | PDF | US | en | single-column with floating figures | no | low |
| 10 | `AUDIT-US-005` | PDF | US | en | mixed single and two-column sections | no | medium |

### Category C: Large Financial Tables and Merged Headers (Slots 11-14)

| Slot | audit_id | source_type | market | language | layout_features | ocr_required | table_challenge |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 11 | `AUDIT-TBL-001` | PDF | US | en | wide table spanning full page width | no | high |
| 12 | `AUDIT-TBL-002` | PDF | KR | ko | multi-row merged headers, nested subtotals | no | high |
| 13 | `AUDIT-TBL-003` | PDF | US | en | rotated column headers, small font | no | high |
| 14 | `AUDIT-TBL-004` | PDF | KR | ko | multi-page table with repeated headers | no | high |

### Category D: Scanned or Image-Heavy Documents Requiring OCR (Slots 15-17)

| Slot | audit_id | source_type | market | language | layout_features | ocr_required | table_challenge |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 15 | `AUDIT-OCR-001` | PDF (scanned) | KR | ko | scanned image, no text layer | yes | medium |
| 16 | `AUDIT-OCR-002` | PDF (scanned) | US | en | scanned image with tables | yes | high |
| 17 | `AUDIT-OCR-003` | PDF (image-heavy) | US | en | photos and charts with minimal text | yes | low |

### Category E: HTML / DOCX / XLSX Samples (Slots 18-20)

These slots are conditional. If HTML, DOCX, or XLSX sources remain in scope
for the reports pipeline, fill them. Otherwise mark as "out of scope" and
replace with additional PDF slots from categories A through D.

| Slot | audit_id | source_type | market | language | layout_features | ocr_required | table_challenge |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 18 | `AUDIT-WEB-001` | HTML | US | en | structured HTML with tables | no | medium |
| 19 | `AUDIT-OFF-001` | DOCX | KR | ko | Word document with embedded tables | no | medium |
| 20 | `AUDIT-XLS-001` | XLSX | US | en | spreadsheet with merged cells | no | high |

---

## Required Metadata Fields

Every audit record must have all of the following fields populated before
conversion begins. Fields marked "fill at source approval" are placeholders
until a real document is selected.

| Field | Type | Description |
| --- | --- | --- |
| `audit_id` | string | Unique slot identifier, e.g. `AUDIT-KR-001`. |
| `source_type` | enum | One of `PDF`, `PDF (scanned)`, `HTML`, `DOCX`, `XLSX`. |
| `market` | enum | `US` or `KR`. |
| `language` | enum | `en` or `ko`. |
| `source_url` | string or null | Direct link to the source document. Fill at source approval. |
| `license_note` | string | License under which the source is distributed. Fill at source approval. Must be explicit, not assumed. |
| `redistribution_basis` | string | Why STOCKLAB can store and serve derived Markdown. Fill at source approval. |
| `expected_page_count` | integer | Approximate page count of the source document. Fill at source approval. |
| `expected_table_count` | integer | Approximate number of tables the document contains. Fill at source approval. |
| `layout_features` | string | Comma-separated list of layout characteristics (see slot tables above). |
| `ocr_required` | boolean | Whether OCR is needed to extract text. |
| `table_challenge` | enum | `low`, `medium`, or `high`. Indicates expected table extraction difficulty. |
| `review_owner` | string or null | Person responsible for reviewing this slot's conversion output. Assigned before conversion. |
| `approval_status` | enum | `pending`, `approved`, `rejected`, `out_of_scope`. Starts as `pending`. |
| `docling_version` | string or null | Docling release used for conversion. Fill after conversion. |
| `worker_config` | string or null | Worker configuration used (pipeline options, OCR engine, timeout). Fill after conversion. |
| `conversion_status` | enum or null | `pending`, `success`, `partial_success`, `failure`. Fill after conversion. |
| `review_outcome` | enum or null | `pass`, `fail`, `needs_rework`. Fill after human review. |
| `notes` | string | Free-form notes from the reviewer or source selector. |

---

## Acceptance Rubric

Each converted document is scored across six dimensions. A document passes
the audit when all dimensions meet their threshold.

### Dimensions and Thresholds

1. **Markdown completeness.** The converted Markdown covers all sections of
   the source document. No entire pages or major sections are silently
   dropped. Threshold: no missing sections.

2. **Table extraction quality.** Extracted table JSON matches the source
   tables in structure, headers, and cell values. Minor formatting
   differences (whitespace, number formatting) are acceptable. Threshold:
   cell-level accuracy >= 80% across all tables in the document.

3. **OCR quality** (OCR slots only). Recognized text is readable and
   factually correct. Occasional character substitutions are acceptable;
   whole-paragraph garbling is not. Threshold: no garbled paragraphs.

4. **Warning correctness.** Docling parser warnings accurately reflect real
   issues (low-confidence regions, failed table borders, missing text
   layers). No false-positive warnings on clean regions. Threshold: all
   warnings correspond to actual problems.

5. **Provenance and license completeness.** The audit record has a filled
   `source_url`, `license_note`, and `redistribution_basis`. No record
   proceeds to conversion without these fields populated. Threshold: all
   three fields non-empty.

6. **No raw artifact commit.** No PDF, raw Docling JSON, HTML body, or
   generated dump is committed to the repository. Only the audit manifest
   and review notes live in `docs/`. Threshold: zero raw artifacts in git.

### Gate Thresholds (Aligned with Reports Pipeline Spec)

- At least 20 documents must be reviewed before the production report pipeline
  begins.
- At least 80% of reviewed documents must pass the table extraction quality
  dimension (>= 80% cell-level accuracy). This aligns with the reports
  pipeline spec requirement: "20-PDF audit shows >= 80% accurate table
  extraction."
- Any document with `POOR` confidence or an unclear license automatically
  fails, regardless of other dimensions.
- A document with `partial_success` conversion status must be manually
  reviewed before it can count toward the 20-document minimum.

---

## Explicit Non-Goals

This manifest/spec does not cover:

- **Source approval.** Selecting and approving the 20 real documents is a
  separate step that requires owner review.
- **Downloads.** No PDFs, HTML pages, DOCX files, or XLSX files are
  downloaded as part of this spec.
- **Conversion.** Running Docling against the audit set is not part of this
  spec. That happens after sources are approved and the GitHub Actions
  worker is operational.
- **Committed artifacts.** No raw PDFs, raw Docling JSON, HTML bodies, or
  generated dumps are committed to the repository.
- **Gemini summary.** AI summarization of audit documents is out of scope
  for the audit set itself.
- **UI or admin implementation.** The admin review interface for audit
  results is a separate feature tracked under M4.

---

## Relationship to Other Docs

- `docs/design-docs/docling-worker-contract.md` defines the worker input/output
  contract and the original audit-set requirement.
- `docs/product-specs/reports-pipeline.md` defines the 80% table extraction
  gate and the M4 pipeline architecture.
- `docs/exec-plans/active/EP-0011-data-source-reduction.md` tracks the
  audit-set task as part of the broader data-source reduction plan.
