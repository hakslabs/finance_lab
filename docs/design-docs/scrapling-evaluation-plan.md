# Scrapling Evaluation Plan

## Status

Plan/spec only. No Scrapling installation, no crawling, no source evaluation,
no proof-of-concept output, and no reliability measurements are included in
this slice. This document defines *how* to evaluate candidates; it does not
perform any evaluation step.

## Purpose

EP-0011 requires evaluating Scrapling against three allowed source classes
before any scheduled extraction job can run. This plan defines the evaluation
records, intake workflow, pass/reject criteria, and proof-of-concept
requirements so that actual evaluation can proceed in a later slice with a
clear, reviewable process.

The three source classes under evaluation are:

1. **Official IR pages**. Investor relations pages on company or exchange
   sites that list report PDFs, earnings releases, or filing links.
2. **Public RSS / HTML indexes**. Syndication feeds or directory pages that
   link to allowed report or news sources without requiring authentication.
3. **Public report landing pages**. Pages that present reports, filings, or
   disclosures and do not require login, CAPTCHA, paywall, or anti-bot bypass
   to access.

## Evaluation Record

Every candidate source must be documented with the following fields before any
fetch runs. Placeholder IDs are used below; real domains, URLs, and licenses
must not be invented.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `source_id` | string | yes | Stable identifier, e.g. `ir-eval-001`. |
| `source_type` | enum | yes | One of `official_ir`, `public_rss_html`, `report_landing_page`. |
| `domain` | string | yes | Exact registrable domain of the candidate. |
| `allowed_paths` | string[] | yes | Path prefixes that would be permitted for fetches. |
| `fetcher` | enum | yes | `http` or `dynamic`. `stealthy` is banned. |
| `requires_javascript` | boolean | yes | Whether the target content depends on JS rendering. |
| `robots_txt_url` | URL | yes | Location of the site's robots.txt. |
| `robots_last_checked` | date | yes | When robots.txt was last fetched and parsed. |
| `terms_url` | URL | yes | Link to the site's terms of service or legal notice. |
| `terms_last_checked` | date | yes | When the terms were last reviewed for redistribution rights. |
| `data_license` | string | yes | Redistribution basis, or a documented reason to store only derived non-copyrightable metadata. |
| `rate_limit_rps` | number | yes | STOCKLAB's self-imposed cap, after applying any `Crawl-delay` or `Request-rate` from robots.txt. |
| `cache_ttl_days` | number | yes | Dev/staging cache TTL. Default target is 7 days. |
| `output_schema` | string | yes | Name and version of the normalized extraction schema the candidate would produce. |
| `review_owner` | string | yes | Human responsible for reviewing and approving this candidate. |
| `approval_status` | enum | yes | `pending`, `approved`, `rejected`. |
| `rejection_reason` | string | conditional | Required when `approval_status` is `rejected`. Must reference a specific criterion from the pass/reject list below. |
| `notes` | string | no | Compliance caveats, extraction quirks, or anything else relevant to the reviewer. |

### Example placeholder records

These are structural examples only. No real domains or URLs are implied.

```
source_id:          ir-eval-001
source_type:        official_ir
domain:             (to be determined)
allowed_paths:      (to be determined)
fetcher:            http
requires_javascript: false
robots_txt_url:     (to be determined after domain approval)
robots_last_checked: (not yet checked)
terms_url:          (to be determined after domain approval)
terms_last_checked: (not yet checked)
data_license:       (to be determined)
rate_limit_rps:     (to be determined)
cache_ttl_days:     7
output_schema:      (to be designed)
review_owner:       (to be assigned)
approval_status:    pending
rejection_reason:   (n/a)
notes:              (none yet)
```

```
source_id:          rss-eval-001
source_type:        public_rss_html
domain:             (to be determined)
allowed_paths:      (to be determined)
fetcher:            http
requires_javascript: false
robots_txt_url:     (to be determined after domain approval)
robots_last_checked: (not yet checked)
terms_url:          (to be determined after domain approval)
terms_last_checked: (not yet checked)
data_license:       (to be determined)
rate_limit_rps:     (to be determined)
cache_ttl_days:     7
output_schema:      (to be designed)
review_owner:       (to be assigned)
approval_status:    pending
rejection_reason:   (n/a)
notes:              (none yet)
```

```
source_id:          landing-eval-001
source_type:        report_landing_page
domain:             (to be determined)
allowed_paths:      (to be determined)
fetcher:            dynamic
requires_javascript: true
robots_txt_url:     (to be determined after domain approval)
robots_last_checked: (not yet checked)
terms_url:          (to be determined after domain approval)
terms_last_checked: (not yet checked)
data_license:       (to be determined)
rate_limit_rps:     (to be determined)
cache_ttl_days:     7
output_schema:      (to be designed)
review_owner:       (to be assigned)
approval_status:    pending
rejection_reason:   (n/a)
notes:              (none yet)
```

## Evaluation Workflow

The following steps define the evaluation process. This document performs none
of them. Each step is a gate; failure at any step stops the candidate from
advancing.

### 1. Candidate intake

Identify a candidate source that falls into one of the three allowed source
classes. Create an evaluation record with all required fields populated except
`robots_last_checked`, `terms_last_checked`, `data_license`, `rate_limit_rps`,
`output_schema`, and `review_owner`, which are filled in during later steps.
Set `approval_status` to `pending`.

### 2. Legal and robots preflight

- Fetch and parse the candidate's `robots.txt`. Record whether STOCKLAB's user
  agent is allowed to fetch the target paths. Record any `Crawl-delay` or
  `Request-rate` directives. Set `robots_last_checked`.
- Read the candidate's terms of service or legal notice. Determine whether the
  content can be redistributed, linked to, or stored as derived metadata.
  Set `terms_last_checked` and `data_license`.
- If robots disallow the target paths or the terms do not permit the intended
  use, reject the candidate immediately. Do not proceed to a fetch attempt.

### 3. Fetch-mode choice

Based on `requires_javascript` and the preflight results, choose the fetcher:

- If the page is static HTML and robots/terms allow automated access, use
  `http` mode.
- If the page requires JavaScript rendering and robots/terms allow automated
  access, use `dynamic` mode with `google_search=false` and no stealth options.
- If the page requires stealth, proxy rotation, CAPTCHA solving, or any banned
  capability to render, reject the candidate. STOCKLAB does not escalate to
  stealth.

### 4. Output schema design

Define the normalized extraction schema that the candidate would produce. The
schema must store only fields required by the product spec. Set `output_schema`
to the schema name and version.

### 5. Dry-run plan

Write a dry-run plan that describes:

- The exact URL(s) to fetch.
- The fetcher mode and configuration.
- The expected output fields and their types.
- The `external_source_runs` fields that would be logged.
- The cache behavior (TTL, cache key, stale handling).

The dry-run plan is a document, not a script execution. No network requests
are made at this stage.

### 6. Review

The `review_owner` reviews the completed evaluation record, preflight results,
fetch-mode choice, output schema, and dry-run plan. The reviewer sets
`approval_status` to `approved` or `rejected`.

### 7. Reliability measurement plan

For approved candidates, define what reliability metrics to collect during the
proof-of-concept phase:

- Request count per run.
- GitHub Actions minutes consumed per run.
- Database rows written per run.
- Cache hit rate.
- Error rate and error categories.
- robots.txt compliance confirmation on each run.

These metrics feed into the graduation gates defined in the operating mode
decision and the reliability quota tables.

## Pass/Reject Criteria

A candidate is **rejected** if any of the following apply:

| Criterion | Rejection reason label |
| --- | --- |
| No clear redistribution basis exists in the site's terms or applicable license. | `no_redistribution_basis` |
| `robots.txt` disallows the STOCKLAB user agent for the target paths. | `robots_disallow` |
| The page requires login, cookie-based session, or authentication to access. | `login_required` |
| The page sits behind a paywall or metered access gate. | `paywall_required` |
| The page presents a CAPTCHA, Cloudflare challenge, or anti-bot interstitial. | `captcha_required` |
| Honest HTTP or dynamic fetch fails; stealth/proxy/fingerprint spoofing would be needed. | `stealth_required` |
| The source belongs to a forbidden source family (Naver/Daum body pages, yfinance, Yahoo Finance, KIS-style brokerage APIs). | `forbidden_source_family` |
| The extracted output cannot be minimized to fields required by the product spec. | `output_cannot_be_minimized` |
| The site's rate limits or crawl-delay are incompatible with free-tier GitHub Actions minutes. | `rate_limit_incompatible` |

A candidate is **approved** only when:

- All preflight checks pass.
- A fetcher mode is chosen that does not require any banned capability.
- An output schema is defined and stores only required fields.
- A dry-run plan is written and reviewed.
- The `review_owner` explicitly sets `approval_status` to `approved`.

## Banned Uses (reaffirmed)

The following are prohibited regardless of source class, operating mode, or
evaluation stage. This list is identical to the ban in
[scrapling-allowlist-contract.md](./scrapling-allowlist-contract.md) and is
restated here for evaluation-context completeness.

- `StealthyFetcher` for STOCKLAB collection.
- Cloudflare Turnstile, interstitial, CAPTCHA, or challenge solving.
- `google_search=true` or any spoofed referer meant to disguise traffic source.
- Canvas, WebRTC, timezone, locale, DNS, real-browser, or fingerprint spoofing.
- Proxy rotation to evade limits, bans, geofencing, or detection.
- Cookie injection or browser automation to cross login walls.
- Paywall bypass or extraction from pages whose terms disallow collection.
- Collection from Naver/Daum body pages, yfinance/Yahoo Finance, KIS-style
  brokerage APIs, or any source forbidden elsewhere in project policy.
- Raw HTML archiving outside tiny, license-cleared test fixtures.

If a source blocks honest HTTP or dynamic access, STOCKLAB disables that
source. No evaluation step provides an escalation path to stealth.

## Proof-of-Concept Requirements

Before any approved candidate can move into a scheduled extraction job, the
following must be completed. No proof-of-concept output exists at the time of
this document.

### Per-source-class requirement

At least one reviewed sample output or documented rejection must exist for each
of the three source classes:

1. **Official IR pages**: one sample extraction from an approved IR page, or one
   rejection with a documented reason.
2. **Public RSS / HTML indexes**: one sample extraction from an approved feed
   or index page, or one rejection with a documented reason.
3. **Public report landing pages**: one sample extraction from an approved
   landing page, or one rejection with a documented reason.

A rejection counts toward this requirement. The goal is to confirm that the
evaluation process works end to end, not that every candidate passes.

### Sample output format

Each approved sample must produce output matching the output contract defined
in the allowlist contract. At minimum, the sample must include:

- `source_id`, `source_url`, `fetched_at`, `from_cache`, `status_code`.
- `content_type`, `content_hash`, `fetcher`, `robots_txt_compliant`.
- `terms_last_checked`, `license_note`.
- `records` array with at least one normalized record matching the output
  schema.
- `warnings` array (may be empty).

### `external_source_runs` fields

Every proof-of-concept run must write an `external_source_runs` row with:

- Source URL and revision or content hash.
- Robots policy applied.
- License note.
- Run status (`success`, `error`, `rejected`).
- Compact error summary if applicable.

### Cache behavior

The proof-of-concept must demonstrate that repeated runs against the same
source respect `cache_ttl_days`. Cached responses must not trigger redundant
network requests within the TTL window.

### Reliability metrics to collect

During the proof-of-concept phase, collect and document:

- Total requests per run.
- GitHub Actions minutes consumed per run.
- Database rows written per run.
- Cache hit rate across repeated runs.
- Error rate and categorized error types.
- Confirmation that robots.txt compliance was checked on each run.

These metrics determine whether the candidate can graduate from manual to
scheduled execution per the graduation gates in the operating mode decision.

## Relationship to Other Docs

- [Scrapling Allowlist Contract](./scrapling-allowlist-contract.md): defines the
  source registry fields, preflight rules, allowed fetch modes, banned uses,
  and output contract that this evaluation plan enforces.
- [Scrapling Operating Mode Decision](./scrapling-operating-mode-decision.md):
  defines the default operating mode (GitHub Actions Python package), graduation
  gates, and MCP guardrails that approved candidates must satisfy.
- [EP-0011 Data Source Reduction](../exec-plans/active/EP-0011-data-source-reduction.md):
  the execution plan that owns the Scrapling evaluation task.

## Docs-Only Scope

This document defines an evaluation process. It does not include:

- Scrapling installation, configuration, or runtime code.
- Real domain names, URLs, or license text.
- Any network requests, crawls, or fetch attempts.
- Proof-of-concept output or reliability measurements.
- Changes to the app, Supabase migrations, CI configuration, or package files.

Those items belong in later execution plan slices after this plan is accepted.
