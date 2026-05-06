# Security

STOCKLAB handles personal trading records and OAuth identities. Even with a
small audience, the security posture is non-negotiable.

## Authentication

| Provider | Use |
| --- | --- |
| Supabase Auth (Email + Password) | Default fallback |
| Google OAuth | Primary sign-in for most users |
| Apple OAuth | Required for iOS / Safari users |
| Kakao OAuth | Korean users |

The Supabase Auth flow is the single source of truth. All issued JWTs carry
the user's `sub` (used as `auth.uid()` in RLS) and a custom `role` claim
(`user` or `admin`).

## Authorization

- **User tables** use Row-Level Security with `user_id = auth.uid()` for
  SELECT, INSERT, UPDATE, DELETE.
- **System tables** (`quotes`, `indices`, `sentiment`, …) allow anonymous
  SELECT only.
- **Admin tables and writes** are gated by `auth.jwt() ->> 'role' = 'admin'`.
- **Service-key access** is server-only and exists for cron handlers and
  admin Server Actions. It never appears in client code.

## Cron Endpoint Protection

- Every `app/api/cron/*` route checks `Authorization: Bearer
  ${CRON_SECRET}` before doing anything else, including logging.
- Cron handlers use the Supabase service key.
- IP allowlists are applied where the platform allows (Vercel) and treated
  as defense-in-depth, not the primary control.

## Secret Management

| Variable | Purpose |
| --- | --- |
| `SUPABASE_URL` | Client and server access to the project |
| `SUPABASE_ANON_KEY` | Client-side reads (RLS-protected) |
| `SUPABASE_SERVICE_KEY` | Server-only privileged access (cron, admin) |
| `CRON_SECRET` | Bearer token required by every cron handler |
| `KRX_API_KEY` | KRX OpenAPI (KR daily quotes, indices) |
| `DART_API_KEY` | DART (KR financials and filings) |
| `FINNHUB_API_KEY` | Finnhub Free (US 15-minute quotes) |
| `FRED_API_KEY` | FRED (macro, FX, rates) |
| `NEWSAPI_KEY` | NewsAPI (global news headlines) |
| `ALPHAVANTAGE_KEY` | Alpha Vantage (FX / CPI fallback) |
| `GEMINI_API_KEY` | Gemini 1.5 Flash for summaries |
| `OAUTH_GOOGLE_*` / `OAUTH_KAKAO_*` / `OAUTH_APPLE_*` | OAuth client IDs and secrets |
| `SENTRY_DSN` | Error tracking |

Secrets live in Vercel Project Settings and GitHub Secrets only. Local
development uses `.env.local` which must remain gitignored.

## Supabase Project Binding

The owner-provided project URL is
`https://luiaofafdbikmqusurpi.supabase.co`. This URL may appear in local
environment examples and hosted configuration, but keys must not.

Required controls:

- `SUPABASE_ANON_KEY` is allowed in browser bundles only because RLS protects
  access.
- `SUPABASE_SERVICE_KEY` is server-only and must be available only to cron,
  admin, and migration contexts.
- CI logs must not print Supabase keys, database URLs with embedded
  credentials, or migration connection strings.
- Every migration smoke test must include a negative RLS check before it is
  considered passing.

## External Collection Controls

FinanceDatabase, Docling, and Scrapling are allowed only through
[EP-0011](./exec-plans/active/EP-0011-data-source-reduction.md).

- FinanceDatabase imports must preserve attribution and source revision
  metadata.
- Docling outputs are treated as untrusted Markdown and must still go through
  DOMPurify before rendering.
- Scrapling runs must use explicit domain allowlists, respect robots.txt and
  source terms, and avoid login walls, paywalls, CAPTCHAs, and anti-bot
  bypass flows.
- Scraped content must be minimized to the fields required by the product
  spec; raw HTML archives are not stored unless a source is clearly licensed
  and the fixture is intentionally needed for tests.

## Input Validation

- Every Server Action and Route Handler validates input with Zod at the
  boundary. Internal callers may rely on TypeScript types.
- Markdown rendered to the DOM (report bodies, user notes) goes through
  DOMPurify with a conservative allowlist. No `dangerouslySetInnerHTML` on
  raw input.
- Cron handlers validate envelope fields and reject unknown jobs.

## Rate Limiting

- An Edge middleware applies a per-IP request budget on `app/api/*` to
  protect against accidental floods.
- User-table writes (notes, transactions, alerts) are additionally bounded
  by row-count limits enforced via Supabase row policies.

## Logging

- Server logs reference `user_id` only. Email, nickname, OAuth tokens,
  device IDs, and request bodies that may carry PII are stripped before
  emission.
- Sentry events follow the same rule. The Sentry client is configured to
  drop request bodies and headers other than route metadata.

## Known Limitations

- Vercel and Supabase outages have no failover. The user-facing message is
  a static maintenance page.
- Push notifications are not yet decided — see `docs/exec-plans/tech-debt-tracker.md`
  TD-006.
- Privacy policy and Terms of Service drafts are pending — see TD-007. M9
  beta cannot open without these.
