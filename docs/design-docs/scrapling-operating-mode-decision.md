# Scrapling Operating Mode Decision

## Status

Decided (docs-only). No runtime code, no installation, no crawling, no
credentials, no source evaluation, and no proof-of-concept completion are
included in this slice.

## Decision

Scrapling's default operating mode for STOCKLAB is the **Python package run in
GitHub Actions** for approved manual and scheduled extraction jobs.

A dedicated MCP server is **deferred** as an optional operator-assist tool. If
adopted later, it will run under the same allowlist contract and guardrails
documented in [scrapling-allowlist-contract.md](./scrapling-allowlist-contract.md).
It is not the default ingestion path and must not be used for unattended
scheduled jobs.

Running both modes simultaneously is **not the current plan**. If both are
adopted in the future, they must be explicitly partitioned: GitHub Actions for
scheduled/batch extraction, MCP for interactive operator-assisted queries only,
with no shared state or overlapping source access without a written partition
contract.

## Options Considered

### Option A: Python package in GitHub Actions

Run Scrapling as a standard Python dependency inside a GitHub Actions workflow.
A future workflow would check out the repo, install `scrapling`, run extraction
scripts against approved sources, and persist normalized output after the
graduation gates are complete.

**Advantages**

- Runs in an isolated environment with no access to app secrets beyond what the
  workflow explicitly provides.
- GitHub Actions free tier gives 2,000 minutes per month, enough for low-volume
  scheduled extraction.
- Python packaging is well-understood; `pip install scrapling` or `scrapling[ai]`
  for the AI extras.
- CI logs are auditable. Failed runs produce actionable output.
- No persistent server process to manage or secure.

**Disadvantages**

- Each run pays cold-start overhead (checkout, install, Python setup).
- Not suitable for interactive, on-demand extraction during development.

### Option B: Dedicated MCP server

Run Scrapling's built-in MCP server as a persistent process that an operator
(or agent) calls for ad-hoc extraction.

**Advantages**

- Interactive: an operator can request extraction on demand without writing a
  workflow.
- Scrapling ships first-class MCP server support, documented at
  [scrapling.readthedocs.io/en/latest/ai/mcp-server.html](https://scrapling.readthedocs.io/en/latest/ai/mcp-server.html)
  and
  [scrapling.readthedocs.io/en/latest/api-reference/mcp-server.html](https://scrapling.readthedocs.io/en/latest/api-reference/mcp-server.html).

**Disadvantages**

- A persistent process needs hosting, secrets management, and access control.
- MCP server calls bypass the GitHub Actions audit trail unless additional
  logging is added.
- Harder to enforce rate limits, domain allowlists, and robots compliance at the
  infrastructure level. Policy enforcement must live entirely in the wrapper.
- Scrapling's MCP server exposes the full fetcher API, including stealthy and
  dynamic modes. Without a strict wrapper, an operator could invoke banned
  capabilities.

### Option C: Both

Run GitHub Actions for scheduled jobs and an MCP server for operator-assisted
queries.

**Advantages**

- Covers both batch and interactive use cases.

**Disadvantages**

- Two deployment surfaces to secure, audit, and maintain.
- Risk of policy drift between the two paths unless a shared enforcement layer
  is built first.
- Adds complexity that is not justified until at least one source has a
  reviewed proof of concept.

## Comparison Matrix

| Criterion | A: GitHub Actions Python | B: MCP Server | C: Both |
| --- | --- | --- | --- |
| Scheduled batch extraction | Yes | No (not designed for it) | Yes (via Actions) |
| Interactive operator queries | No (requires workflow run) | Yes | Yes (via MCP) |
| Audit trail | Built into CI logs | Requires custom logging | Partial (CI only) |
| Policy enforcement surface | Workflow script + wrapper | Wrapper only | Two surfaces to keep in sync |
| Hosting overhead | None (serverless) | Persistent process | Both |
| Secrets exposure | Workflow-scoped | Process-scoped | Both |
| Free-tier fit | 2,000 min/month | Depends on host | Both costs |
| Complexity | Low | Medium | High |
| Current readiness | Ready after PoC | Deferred, needs guardrails | Premature |

## Binding Policy (reaffirmed)

This decision does not relax any restriction in
[scrapling-allowlist-contract.md](./scrapling-allowlist-contract.md). The
following remain banned regardless of operating mode:

- `StealthyFetcher` for STOCKLAB collection.
- Cloudflare Turnstile, interstitial, CAPTCHA, or challenge solving.
- `google_search=true` or any spoofed referer.
- Canvas, WebRTC, timezone, locale, DNS, real-browser, or fingerprint spoofing.
- Proxy rotation to evade limits, bans, geofencing, or detection.
- Cookie injection or browser automation to cross login walls.
- Paywall bypass or extraction from pages whose terms disallow collection.
- Collection from forbidden sources (Naver/Daum body pages, yfinance/Yahoo
  Finance, KIS-style brokerage APIs).

If a source blocks honest HTTP or dynamic access, STOCKLAB disables that source.
No operating mode provides an escalation path to stealth.

## Evidence (externally researched, not locally verified)

The following was gathered from Scrapling's public documentation and repository
metadata. Vendor performance and marketing claims are marked as unverified.

**Package metadata** (from public package/repository metadata):

- Package name: `scrapling`
- Python requirement: >=3.10
- CLI entry point: `scrapling`
- AI extras install: `pip install scrapling[ai]`
- GitHub Actions CI tests run on macOS with Python 3.10 through 3.13.
- Repository includes Docker and PyPI release workflows.

**Fetcher modes** (from documentation):

- Static/HTTP fetcher:
  [scrapling.readthedocs.io/en/latest/fetching/static.html](https://scrapling.readthedocs.io/en/latest/fetching/static.html)
- Dynamic fetcher (Playwright-based):
  [scrapling.readthedocs.io/en/latest/fetching/dynamic.html](https://scrapling.readthedocs.io/en/latest/fetching/dynamic.html)
- Stealthy fetcher (anti-detection):
  [scrapling.readthedocs.io/en/latest/fetching/stealthy.html](https://scrapling.readthedocs.io/en/latest/fetching/stealthy.html)
- Choosing a fetcher:
  [scrapling.readthedocs.io/en/latest/fetching/choosing.html](https://scrapling.readthedocs.io/en/latest/fetching/choosing.html)

**Spider architecture**:

- [scrapling.readthedocs.io/en/latest/spiders/architecture.html](https://scrapling.readthedocs.io/en/latest/spiders/architecture.html)

**MCP server**:

- Overview:
  [scrapling.readthedocs.io/en/latest/ai/mcp-server.html](https://scrapling.readthedocs.io/en/latest/ai/mcp-server.html)
- API reference:
  [scrapling.readthedocs.io/en/latest/api-reference/mcp-server.html](https://scrapling.readthedocs.io/en/latest/api-reference/mcp-server.html)

**Fetcher API reference**:

- [scrapling.readthedocs.io/en/latest/api-reference/fetchers.html](https://scrapling.readthedocs.io/en/latest/api-reference/fetchers.html)

**Unverified claims**: Scrapling's documentation describes its stealthy fetcher
as capable of bypassing Cloudflare challenges, bot detection, and fingerprinting.
These claims have not been tested or benchmarked by STOCKLAB. STOCKLAB does not
intend to use these capabilities.

## Graduation Gates

Before any Scrapling job moves from manual to scheduled execution in GitHub
Actions, all of the following must be satisfied:

1. **Approved source registry**: At least one source is entered into the
   allowed source registry defined in the allowlist contract, with all required
   fields populated and reviewed.
2. **Robots and terms review**: `robots.txt` and source terms of service have
   been checked and documented for the source. `robots_last_checked` and
   `terms_last_checked` are current.
3. **Output schema**: The extraction produces output matching a named, versioned
   schema. The schema stores only fields required by the product spec.
4. **Rate limits**: `rate_limit_rps` is set, respects `Crawl-delay` and
   `Request-rate` from robots.txt, and is enforced in the wrapper.
5. **Cache behavior**: `cache_ttl_days` is set and the wrapper caches responses
   to avoid redundant fetches during development and repeated scheduled runs.
6. **`external_source_runs` logging**: Every run writes a row with source URL,
   revision or content hash, robots policy, license note, status, and compact
   error summary.
7. **Measured resource usage**: GitHub Actions minutes consumed per run and
   database growth per run are measured and documented. Update
   `docs/RELIABILITY.md` quota tables.
8. **Reviewed proof of concept**: At least one manual run against an approved
   source produces reviewable output that passes the output contract. The PoC
   must be reviewed before scheduling.

## MCP Server Guardrails (if adopted later)

If an MCP server is introduced, the following additional constraints apply:

- The MCP server must run behind the same allowlist contract. No source may be
  fetched that is not in the approved registry.
- The wrapper must reject calls that request `stealthy` mode, CAPTCHA solving,
  proxy rotation, or any banned capability.
- All MCP server calls must be logged to `external_source_runs` with the same
  fields as GitHub Actions runs.
- The MCP server must not have access to Supabase secrets directly. Output
  goes through the same normalization and persistence path as batch jobs.
- An operator-assist session must time out after a configurable idle period.
- The MCP server is for development and manual investigation only. It must not
  be wired into any scheduled or unattended pipeline.

## Docs-Only Scope

This document records a design decision. It does not include:

- Scrapling installation or configuration.
- Any Python scripts, workflow files, or runtime code.
- Source evaluation, crawling, or proof-of-concept execution.
- Credential setup, secret management, or deployment.
- Benchmarking, performance measurement, or reliability data.
- Changes to the app, Supabase migrations, or CI configuration.

Those items belong in later execution plan slices after this decision is
accepted.
