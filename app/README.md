# App Scaffold

This directory is the future Next.js 14 App Router application root for
STOCKLAB. It is intentionally inert during the repository-structure phase.

Do not treat this folder as runnable until M0 adds package files, framework
config, root layouts, pages, styles, and environment wiring.

## Intended Layout

```text
app/
├── (public)/      unauthenticated routes
├── (auth)/        authenticated user routes
├── admin/         /admin route tree
├── api/           Route Handlers
└── _lib/          shared server/client-safe modules
```

See `../docs/CODE_STRUCTURE.md` for the full structure contract.
