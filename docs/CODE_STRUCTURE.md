# Code Structure

This document is the application structure contract for STOCKLAB. It explains
where runtime code lives and where future route work should be added.

## Current State

The repository currently contains the product plan, architecture documents,
design references, M0 Next.js infrastructure, Supabase migrations, and the
FinanceDatabase seed pipeline. Product routes remain intentionally minimal until
their execution plans own the work.

The design source already exists as exported HTML / JSX reference assets under
`docs/design-exports/`:

- `docs/design-exports/STOCKLAB Design.html`
- `docs/design-exports/STOCKLAB Wireframes v2.html`
- `docs/design-exports/design-canvas.jsx`
- `docs/design-exports/tweaks-panel.jsx`
- `docs/design-exports/design/`
- `docs/design-exports/wires-v2/`

Keep these files as references. Do not rewrite them into production components
until the matching execution plan owns that work.

## Target Application Tree

```text
app/
├── README.md
├── (public)/                  unauthenticated routes: login, signup, marketing
├── (auth)/                    authenticated user routes
├── admin/                     real /admin route tree, role-gated
├── api/                       App Router Route Handlers
└── _lib/
    ├── ai/                    Gemini and prompt helpers
    ├── auth/                  session, role, and server-only auth helpers
    ├── charts/                custom SVG chart engine
    ├── data/                  server-side query helpers
    ├── env/                   typed environment validation
    ├── hooks/                 client-only React hooks
    ├── ui/                    primitive UI and design-token bridge
    └── utils/                 small shared utilities
```

Empty directories are tracked with `.gitkeep` files only. A `.gitkeep` file is
not an implementation signal.

## Route Ownership

`app/(public)/` owns unauthenticated surfaces such as `/login` and future
marketing pages.

`app/(auth)/` owns authenticated user surfaces such as `/`, `/analysis`,
`/screener`, `/masters`, `/learn`, `/portfolio`, `/reports`,
`/stock/[ticker]`, and `/me/*`.

`app/admin/` owns the real `/admin` route tree. It is not a route group because
the URL must include `/admin`.

`app/api/` owns all Route Handlers, including search, stock bundles, mutations,
admin mutations, and cron endpoints.

Route groups must not import from each other. Shared code moves to `app/_lib/`
first.

## Mobile And PWA Direction

STOCKLAB will remain one responsive Next.js web application. Mobile support is
not a separate React Native or native app track.

The mobile path is:

1. Build desktop and tablet surfaces with responsive layout constraints from
   the start.
2. Add mobile-specific composition only when the same component cannot satisfy
   the product question on a narrow viewport.
3. Add PWA metadata, icons, offline posture, and install behavior in M8.
4. Keep home and stock detail as the first mobile-critical surfaces.

Client Components still require justification. Mobile responsiveness alone is
not a reason to move a Server Component to the client.

## Deferred Until Implementation

Do not add the following during repository-structure cleanup:

- `package.json`, lockfiles, or package-manager config
- `next.config.*`, `tsconfig.json`, ESLint, or test config
- `app/layout.tsx`, `app/page.tsx`, `app/globals.css`, `app/manifest.ts`
- `app/**/page.tsx`, `app/**/layout.tsx`, or `app/api/**/route.ts`
- Supabase clients, migrations, generated types, or service wrappers
- UI components, chart components, or copied design-export components
- service workers, PWA icons, Playwright tests, or Lighthouse workflows

These files imply runtime behavior and belong to the relevant execution plan.

## Structure Done When

The repository-structure phase is complete when:

- `app/` exists as an inert scaffold only.
- `docs/CODE_STRUCTURE.md`, `ARCHITECTURE.md`, `docs/FRONTEND.md`, and
  `README.md` agree on route and shared-code boundaries.
- Existing design HTML / JSX exports are referenced as source material.
- No existing files are moved or deleted.
- No runtime Next.js, Supabase, package, or test files are added prematurely.
