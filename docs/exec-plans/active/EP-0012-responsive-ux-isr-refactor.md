# Execution Plan — EP-0012 · Responsive UX + ISR Refactor

## Goal

Bring the live production UX in line with the design exports and unlock
ISR caching for low-write surfaces by separating cookie-bound auth from
the page-level data fetch.

## Context

- Design canvas exports under `docs/design-exports/wires-v2/` represent
  the desktop reference. Production currently breaks layout below ~1280
  px (toggles wrap to a second row, sidebar/grids overflow), and the
  feel diverges from the export especially on narrower viewports.
- Every protected page calls `readTemporaryAuthCookie()` directly. That
  call uses `cookies()`, which Next.js 15 treats as a dynamic primitive
  — every page gets bucketed as `ƒ Dynamic` in the build output, and
  any `export const revalidate = N` is ignored.
- Middleware already enforces auth with `cookies()` *before* the page
  renders, so the second cookie read inside the page is redundant for
  authentication; it only exists so the page can read `session.role`
  for header display.
- `app/_components/states/`, `app/_components/mobile/bottom-tab-bar.tsx`,
  PWA manifest, and the mobile CSS utilities (`globals.css`) are
  already in place — but routes have not adopted them yet.

## Tasks

- [ ] Move the per-page `readTemporaryAuthCookie()` call into a shared
      auth boundary (e.g. an `(auth)` layout) so individual page files
      do not invoke `cookies()` directly. Pages then receive session
      info as props/context where needed.
- [ ] Confirm page files no longer trip dynamic detection: check the
      `next build` output flips `ƒ` → `○` (static) or `ISR` for
      eligible routes.
- [ ] Add `export const revalidate = N` per route based on data
      cadence:
      - Learn list / detail (articles + terms): 300s
      - Masters list / detail (master_profiles, holdings): 600s
      - Reports list / detail (RSS-fed): 60s
      - Home dashboard: 30s (quotes change frequently)
      - Stock detail: 30–60s
- [ ] Adopt `app/_components/states/` across M1-M5 routes (replace
      per-route empty/error markup) — this is the EP-0009 "route
      adoption" task that was previously deferred.
- [ ] Audit each route at viewport widths 375px, 768px, 1024px, 1280px,
      1920px. Compare to the design canvas export. Fix wrapping toggles,
      overflowing sidebars, and grid breaks. Use the existing mobile
      CSS utilities (`sl-mobile-only`, `sl-mobile-stack`,
      `sl-mobile-scroll-x`, `sl-mobile-pb-tabbar`).
- [ ] Wire the bottom tab bar into the remaining priority surfaces
      (analysis, screener, portfolio, me) where it makes sense.
- [ ] Run a Lighthouse mobile audit on home and stock detail and record
      the baseline score in `docs/QUALITY_SCORE.md`.

## Done When

- Every previously dynamic route that does not actually depend on
  per-user state is reported as `ISR` or `○` in `next build`.
- Home, learn, masters, reports, and stock detail render without layout
  break across the four target breakpoints.
- Lighthouse mobile ≥ 90 on home and stock detail (production URL).
- The shared `app/_components/states/` library is the single source
  for empty / error / refresh-failed UI across all M1-M5 routes.

## External Evidence Gates

- Lighthouse target must be measured against the production deployment
  in `icn1`, not localhost.
- Real-device check on iOS Safari and Chrome on Android still required
  before M9 beta.

## Notes

- Source of UX divergence reported by owner on 2026-05-09: data widgets
  appearing empty (separate problem — production cron + Supabase
  migration gaps), perceived slowness (now mitigated by `regions:
  ["icn1"]` in `vercel.json`), and toggles wrapping into a second row
  on narrow viewports. The first two are unrelated to this EP; the
  third is the visual symptom that motivates this work.
- ISR is intentionally **not** applied as cosmetic `export const
  revalidate` lines on dynamic-marked pages. Apply only after the auth
  boundary refactor moves `cookies()` out of page files.
