# Scrapling Allowlist Contract

Scrapling is allowed in STOCKLAB only as a controlled extraction tool for
license-cleared, public HTML sources. Its anti-bot capabilities are powerful, so
STOCKLAB's policy layer must be stricter than Scrapling's defaults.

## Purpose

- Extract structured fields from allowed public HTML pages when RSS, official
  APIs, or direct files are unavailable.
- Keep crawling manual or GitHub Actions based until source terms, robots rules,
  runtime minutes, and database growth are measured.
- Preserve a reviewable allowlist before any source is fetched.
- Explicitly block stealth, CAPTCHA solving, login-wall, paywall, and anti-bot
  bypass workflows.

## Allowed Source Registry

Every Scrapling source must be declared before any fetch runs.

| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| `source_id` | string | yes | Stable identifier, e.g. `sec-company-filings-index`. |
| `domain` | string | yes | Exact registrable domain. |
| `allow_subdomains` | boolean | yes | Default false. If true, document why. |
| `allowed_paths` | string[] | yes | Path prefixes allowed for fetches. No catch-all unless reviewed. |
| `source_type` | enum | yes | `official_ir`, `public_rss_html`, `report_landing_page`, or `public_index`. |
| `fetcher` | enum | yes | `http` or `dynamic`. `stealthy` is banned. |
| `requires_javascript` | boolean | yes | If false, use HTTP fetch only. |
| `robots_txt_url` | URL | yes | Usually `https://domain/robots.txt`. |
| `robots_last_checked` | date | yes | Manual or automated check timestamp. |
| `terms_url` | URL | yes | Source terms or legal notice. |
| `terms_last_checked` | date | yes | Manual review date. |
| `data_license` | string | yes | Redistribution basis or reason to store derived metadata only. |
| `rate_limit_rps` | number | yes | STOCKLAB cap, after robots crawl-delay is applied. |
| `cache_ttl_days` | number | yes | Dev/staging cache TTL; default target 7 days. |
| `output_schema` | string | yes | Name/version of normalized extraction schema. |
| `review_owner` | string | yes | Human who approved the source. |
| `notes` | string | no | Compliance and extraction caveats. |

The registry belongs in a later code/config slice after at least one allowed
source is approved. This contract defines the required fields only.

## Preflight Rules

Before any network request, STOCKLAB must perform a preflight check outside
Scrapling's fetcher defaults:

1. Match the target URL against `domain`, `allow_subdomains`, and
   `allowed_paths`.
2. Fetch and parse `robots.txt`; reject when `can_fetch` is false for the
   STOCKLAB user agent.
3. Enforce `Crawl-delay`, `Request-rate`, and the stricter of those values and
   `rate_limit_rps`.
4. Verify `terms_last_checked` is current for the source.
5. Confirm the source does not require login, cookies, CAPTCHA, paywall access,
   or hidden browser state.
6. Confirm the output schema stores only fields required by the product spec.
7. Create or update an `external_source_runs` record with source URL, revision or
   content hash, robots policy, license note, status, and compact error summary.

Scrapling's standalone fetchers do not enforce robots, rate limits, terms, or
domain allowlists. The wrapper must enforce them before calling Scrapling.

## Allowed Fetch Modes

- `http`: first choice for static pages. Use honest request headers and no
  browser automation.
- `dynamic`: allowed only for public pages whose required content is rendered by
  JavaScript and whose terms/robots allow automated access. Set
  `google_search=false` and do not enable stealth options.
- `spider`: allowed later only if `robots_txt_obey=true`, `allowed_domains` is
  non-empty, `development_mode` is used in dev/staging, and the same registry
  preflight passes.

`development_mode` or an equivalent local cache must be enabled for parser
development so repeated tests replay cached responses instead of re-hitting the
source. Cache files are local artifacts and must not be committed unless a tiny,
license-cleared fixture is intentionally added for tests.

## Banned Uses

The following are prohibited even if Scrapling supports them:

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

If a source blocks honest HTTP/dynamic access, STOCKLAB disables that source
instead of escalating to stealth.

## Output Contract

Scrapling extraction outputs must be normalized before persistence:

```json
{
  "source_id": "official-ir-index",
  "source_url": "https://example.com/ir/reports",
  "fetched_at": "2026-05-07T00:00:00.000Z",
  "from_cache": false,
  "status_code": 200,
  "content_type": "text/html",
  "content_hash": "sha256:...",
  "fetcher": "http",
  "robots_txt_compliant": true,
  "terms_last_checked": "2026-05-07",
  "license_note": "public company IR page; links only",
  "records": [
    {
      "kind": "report_link",
      "title": "Q1 2026 Earnings Release",
      "url": "https://example.com/report.pdf",
      "published_at": "2026-05-01T00:00:00.000Z",
      "tickers": ["EXAMPLE"]
    }
  ],
  "warnings": []
}
```

Persist only normalized records needed by the owning feature. Store compact
metadata and warnings in `external_source_runs`; do not persist full response
bodies unless a later migration creates an explicit, licensed review store.

## Candidate Source Types

EP-0011 evaluation is limited to three source classes:

- Official IR pages listing report PDFs or earnings releases.
- Public RSS or HTML indexes that link to allowed report/news sources.
- Public report landing pages that do not require login, CAPTCHA, paywall, or
  anti-bot bypass.

Each candidate must produce one reviewed sample output or be rejected with a
documented reason before it can move into a scheduled job.

## Decision Gates

- Start as manual runs only.
- Move to GitHub Actions only after robots/terms review, cache behavior, output
  schema, and rate limits are documented.
- Add Vercel Cron only if the job is short, low-volume, and proven not to need
  browser automation. Default to GitHub Actions.
- Update `docs/RELIABILITY.md` after measuring request counts, GitHub Actions
  minutes, and database growth.

## Explicit Non-Goals

- No Scrapling runtime in the app until a source-specific allowlist exists.
- No stealth, bypass, or protected-page collection.
- No scaled crawl before at least one allowed source proof of concept is reviewed.
- No raw scrape fixture commits without license review.
