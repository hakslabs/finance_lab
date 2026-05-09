# Execution Plan — EP-0013 · Design Fidelity (wires-v2 Migration)

## Goal

Bring the live UI in line with the v2 wireframe export
(`docs/design-exports/wires-v2/`). Owner observation on 2026-05-09: the
deployed pages diverge from the design "from the skeleton up" — index
strip, blue-chip strips, sentiment row, watchlist pills, and news tag
chips are the most visible mismatches.

## Source of Truth

- `docs/design-exports/wires-v2/wires-shared.jsx` — token + primitive
  definitions (`W.*` palette, `.w-card`, `.w-h1/2/3`, `.w-num-md/lg`,
  `.w-pill`, `.w-tag`, `Sparkline`, `AppBar`, etc.).
- `docs/design-exports/wires-v2/wire-home.jsx` — home dashboard layout
  (greeting + portfolio glance, full-width index strip, US/KR
  blue-chip strips, sentiment row, watchlist · news · heatmap mini
  3-column grid, return-vs-benchmark, weekly calendar).
- `docs/design-exports/wires-v2/wire-stock.jsx`,
  `wire-portfolio.jsx`, `wire-mypage-admin.jsx`,
  `wire-screener-heatmap-login.jsx`, etc. for the other surfaces.

## Token Diff

| Token | wires-v2 | current `globals.css` | Action |
| --- | --- | --- | --- |
| `--sl-ink` | `#1a1a1a` | (verify; likely close) | Audit |
| `--sl-line` (1px stroke) | `#1a1a1a` | likely lighter | Match |
| `--sl-hairline` | `#d4d4d4` | check | Match |
| `--sl-fill` | `#f3f3f1` | check | Match |
| `--sl-up` / `--sl-down` | `#1f8a5b` / `#d34141` | check | Match |
| `--sl-accent` (rarely used) | `#2a6fdb` | check | Add |
| Font (sans) | Pretendard fallback | system | Add Pretendard |
| Mono | JetBrains Mono fallback | system mono | Add JetBrains Mono |

## Component Gap (per page)

### Home
- [ ] **Sparkline** primitive (seed-based deterministic SVG, 24 points,
      stroke = up/down). Required by IndexStrip cells, blue-chip strips,
      sentiment row, watchlist rows.
- [ ] **Greeting hero** layout: title + subline (date + market session
      + next macro event) on the left, asset / today P&L / total return
      pill on the right.
- [ ] **Index strip** — 6 indices side-by-side, value + change + pct +
      sparkline, "15분 지연" caption. Currently filtered by market
      toggle (✓ implemented 2026-05-09).
- [ ] **US blue-chip strip + KR blue-chip strip** — 2-column grid of
      mega-caps with sparkline, "전체 보기 →" link to screener.
      Currently using a generic `MajorStocks` widget that doesn't match.
- [ ] **Sentiment row** — VIX / F&G / V-KOSPI / ADR rows with `dotIndex`
      0..4 dots, mini sparkline, "전체 9개 지표 보기 →".
- [ ] **Watchlist** — list pill tabs ("기본"/"미국주"/"+ 새 리스트"),
      24px symbol box, sparkline, price + chg.
- [ ] **News** — tag pill row, 56px time column, 2-column ticker tags.
- [ ] **Mini heatmap** — sector grid placeholder (currently empty in
      `MiniMarketMap`).
- [ ] **Return-vs-benchmark** — sparkline pair (mine vs index).
- [ ] **Weekly calendar** — day columns with event chips.

### Stock detail
- [ ] Tab bar layout from `wire-stock-tabs-a/b.jsx`.
- [ ] OHLC + sparkline chart skeletons.

### Analysis / Screener / Masters / Reports / Portfolio / Learn / My
      Page / Admin
- [ ] One-by-one walkthrough against `wire-*` exports. Capture
      delta as a follow-up checklist within this EP.

## Tasks

- [ ] Extract wires-v2 tokens (`W.*`) into CSS custom properties in
      `globals.css`. Add Pretendard / JetBrains Mono `@font-face` or
      a CDN link in the root layout.
- [ ] Build a shared `Sparkline` primitive (`app/_components/charts/`).
      Server-renderable, accepts `seed`, `up`, `width`, `height`,
      optional `stroke`.
- [ ] Rewrite the home dashboard layout to mirror `wire-home.jsx`:
      greeting hero, index strip, blue-chip strips, sentiment row,
      watchlist · news · heatmap grid, return-vs-benchmark, weekly
      calendar.
- [ ] Replace `MajorStocks` 2-column with a single `BlueChipStrip` per
      market (still respects the existing market toggle).
- [ ] Convert `MarketSentiment` to the inline 4-row layout with
      `dotIndex` + sparkline.
- [ ] Repeat for stock detail, analysis, screener, masters, reports,
      portfolio, learn, my page, admin in subsequent commits.
- [ ] Adopt `app/_components/states/` (EP-0012 backlog) for empty /
      error / refresh-failed states once layout migration lands.

## Done When

- A side-by-side comparison of `wire-home.jsx` and the live home
  dashboard shows no skeleton-level mismatch (cards / strips / row
  composition / type scale / sparklines).
- All other priority pages (stock detail, portfolio, screener,
  masters, reports) pass the same visual fidelity check against their
  `wire-*` counterparts.
- Token diffs in `globals.css` match the wires-v2 palette to within the
  documented adjustments (Pretendard + JetBrains Mono added).

## External Evidence Gates

- Lighthouse Performance ≥ 90 on home + stock detail (production
  region `icn1`) after the migration. Tracked jointly with EP-0012.
- Real-device check on iOS Safari and Chrome on Android before M9 beta.

## Notes

- This EP supersedes the "design parity" portion of EP-0012; EP-0012
  remains for the auth-boundary refactor + ISR + responsive breakpoint
  audit. Component migration here informs that work but is sequenced
  separately to keep diffs reviewable.
- The wires-v2 export is intentionally low-fidelity ("wireframe, not
  hi-fi"). Treat it as the skeleton spec — color/polish beyond the
  defined tokens still requires owner sign-off before adding.
