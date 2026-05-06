# Frontend

## Stack

| Concern | Choice |
| --- | --- |
| Framework | Next.js 14 App Router |
| Language | TypeScript (strict) |
| Styling | CSS variables + Pretendard + JetBrains Mono |
| Theme | Single `data-theme` attribute on `<html>` (`light` / `dark`) |
| State (server) | React Server Components reading Supabase directly |
| State (client) | URL params first, React state next; Zustand only when shared across unrelated client components |
| Data fetching | Server Components for reads; Server Actions or `app/api/*` for writes |
| Charting | Custom SVG engine in `app/_lib/charts/` |
| Icons | Inline SVG sprite generated at build time |
| Forms | React Hook Form + Zod (only for non-trivial forms) |

## Rendering Model

- **Default: Server Components.** Pages are server-rendered. Data fetching
  happens on the server, not in `useEffect`.
- **Client Components only when:**
  - The component owns user interaction (drawing tools, drag, keyboard
    shortcuts, theme toggle, palette `⌘K`).
  - It reads browser-only APIs (`localStorage`, `IntersectionObserver`,
    `ResizeObserver`).
  - It mounts the SVG chart engine.
- Mark client components with `'use client'` at the top. Keep them at the
  leaves of the tree so as much of the page as possible stays on the server.

## Data Fetching Conventions

- **Server reads** go through helpers in `app/_lib/data/` that wrap a typed
  Supabase client.
- **Mutations** go through Server Actions when the form is co-located, or
  through `app/api/*` Route Handlers when the call is invoked from the
  client (e.g., the `⌘K` palette).
- **Cron handlers** (`app/api/cron/*`) verify `Authorization: Bearer
  ${CRON_SECRET}`, then use the Supabase service key. They never touch the
  anon client.
- **Cache control** uses Next.js's `revalidate`; default to a value that
  matches the cron cadence for that data (15 min for quotes, 30 min for
  news, 1 day for financials).

## Component Organization

```text
app/
├── (public)/                  unauthenticated routes
├── (auth)/                    authenticated routes
│   ├── _components/           shared UI for the auth tree
│   ├── _widgets/              dashboard widgets
│   ├── stock/[ticker]/_tabs/  one file per tab (overview, chart, financials, valuation, filings, news, flow, target)
│   └── ...
├── admin/                     /admin tree (role-gated)
├── _lib/
│   ├── data/                  server-side query helpers
│   ├── charts/                SVG chart engine
│   ├── ai/                    Gemini wrappers
│   ├── auth/                  role checks, server-only helpers
│   └── ui/                    primitive components and tokens bridge
└── api/                       Route Handlers (cron, search, mutations)
```

Naming:

- Route segment files: `page.tsx`, `layout.tsx`, `loading.tsx`,
  `error.tsx`.
- Shared widgets: `_widgets/<feature-name>/<Component>.tsx`.
- Hooks: `_lib/hooks/use<Thing>.ts` (client only).

## Styling Conventions

- Color and spacing tokens live in `design/tokens.jsx` and are surfaced as
  CSS variables in `app/globals.css`.
- Components must read from CSS variables, never literal hex colors.
- Theme switching is a single `document.documentElement.dataset.theme = ...`
  call. No conditional JSX based on theme.

## Performance Budget

| Surface | Lighthouse Performance | LCP | TTI |
| --- | --- | --- | --- |
| Home (`/`) | ≥ 90 | < 2.5 s | < 4.0 s |
| Stock detail (`/stock/[ticker]`) | ≥ 90 | < 2.5 s | < 4.5 s |
| Reports list (`/reports`) | ≥ 85 | < 3.0 s | < 5.0 s |
| Reports detail (`/reports/[id]`) | ≥ 80 | < 3.5 s | < 5.5 s |
| All others | ≥ 80 | — | — |

Regressions on home or stock detail block merges (see
`docs/QUALITY_SCORE.md`).

## Accessibility

- Color contrast ≥ WCAG AA in both themes; the chart engine respects this.
- Keyboard navigation works on the global palette, modals, tabs, and the
  drawing toolbar.
- Charts ship a tabular fallback link reachable from a nearby button.
