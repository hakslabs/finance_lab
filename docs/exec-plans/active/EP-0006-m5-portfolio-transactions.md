# Execution Plan — EP-0006 · M5 Portfolio + Transactions

## Goal

Deliver the M5 local read/runtime surfaces for `/portfolio` and transaction
surfaces: RLS-backed portfolio reads, pure performance/valuation helpers,
server-rendered route pages, and tested empty/auth-required states.

## Context

- Depends on M0 RLS tables and the holdings recompute trigger placeholder.
- Product spec: `docs/product-specs/portfolio.md`.
- `holdings` is derived from `transactions`; user-facing app code must never
  write to `holdings` directly.
- Temporary M0 auth does not produce a real Supabase `auth.uid()`. Portfolio
  helpers therefore expose an honest auth-required state when no RLS-visible
  rows are returned, instead of using fake user IDs or service-key bypasses.

## Tasks

- [x] Draft this EP-0006 plan with local milestone adaptations.
- [x] Implement `app/_lib/portfolio/performance.ts` with pure helpers for
      holdings valuation, allocation, sector exposure, return-vs-benchmark,
      monthly heatmap, and capital-gains simulation.
- [x] Implement `app/_lib/portfolio/portfolio-data.ts` with typed RLS reads from
      `holdings`, `transactions`, `quotes`, `indices`, and `securities_master`.
- [x] Add focused Vitest coverage for pure calculations, deterministic empty
      fallbacks, and RLS-auth-required state.
- [x] Keep holdings write behavior covered by migration regression tests.
- [x] Build `/portfolio` and `/me/transactions` route pages with temporary-auth
      protection, URL tab state, disabled transaction entry, and honest OAuth
      gating copy.
- [x] Define the local CSV transaction import schema decision for future import
      work.
- [x] Add Playwright smoke coverage for portfolio tabs and the transaction auth
      gate.
- [ ] Add transaction mutation route/server-action coverage after real OAuth
      sessions are available.

## Done When

- Local runtime/read surfaces are complete: route pages import tested data
  helpers and render deterministic populated, empty, and auth-required states.
- Portfolio helpers use `createRlsSupabaseClient()` only and do not call service
  keys, admin clients, cron helpers, or external providers.
- Portfolio helpers never insert, update, delete, or upsert `holdings`.
- Performance calculations are pure and independently testable.
- Focused M5 Vitest coverage and route smoke coverage pass.

## External Evidence Gates

- Production OAuth/user writes are not complete locally. Transaction insert and
  holdings recompute round-trips stay gated until real Supabase auth sessions
  replace temporary M0 auth.
- Playwright add-transaction-to-summary verification requires the mutation
  surface, which remains gated until real OAuth can satisfy transaction RLS.
- The April 2026 Supabase Data API exposure change means production projects may
  need explicit grants for newly created exposed tables in addition to RLS.
