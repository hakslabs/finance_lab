# Feature Spec — Learn

**ID:** PS-08 · **Milestone:** M6 · **Path:** `/learn`

## Problem

New investors land on STOCKLAB and hit a wall of jargon. There is no
onboarding surface that explains what a P/E ratio means, why 13F filings
matter, or how to read a candlestick chart. Without this, the platform
assumes domain knowledge it should teach.

## Scope

One authenticated `/learn` route with a server-rendered hub:

1. **Hero** — Short value proposition for beginners, with a category chip
   bar (Fundamentals, Technical, Market Structure, Masters, Terms).
2. **Guide Cards Grid** — Filterable cards linking to individual guide
   articles. Each card shows title, category chip, estimated read time,
   and bookmark status.
3. **Terms Preview** — Frequently searched terms rendered as a compact
   list with expand-on-click definitions. Links to the full terms
   dictionary.
4. **Empty State** — When no guides exist for a selected category, show
   a "coming soon" placeholder rather than a blank grid.

## User Actions

- Category chip click filters the guide grid.
- Guide card click navigates to `/learn/[slug]`.
- Term row click expands the definition inline.
- Bookmark toggle on guide cards (gated by OAuth).

## Data Dependencies

`articles`, `terms`, `bookmarks`.

## Constraints

- Server-rendered. Category filter uses URL search params.
- Guide content is authored Markdown, rendered through the DOMPurify
  boundary only.
- No external API calls during render.
- Bookmark writes require a real OAuth session; temporary auth shows
  disabled bookmark UI.

## Constraints — Privacy

- Bookmark state is RLS-protected per user.
- Reading progress is not tracked in M6 (future consideration).

## Local Adaptation — EP-0007

- This local slice implements read-only learn helpers and route UI for
  `/learn` over `articles` and `terms`.
- Under temporary M0 auth, bookmark toggles are disabled. Helpers return
  an honest auth-required state for bookmark queries.
- Guide authoring and term CRUD are admin-only surfaces (M7).

## Done When

- `/learn` renders on a logged-in temporary session with populated guide
  cards and terms preview.
- Category filtering works via URL params.
- Empty states render for categories with no guides.
- Bookmark UI is present but disabled under temporary auth.
- Vitest covers data shaping and Playwright covers login → learn.
