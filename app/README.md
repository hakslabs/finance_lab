# App Runtime

This directory is the Next.js 15 App Router application root for STOCKLAB.
M0-M5 local runtime surfaces now live here. Add or change runtime files only
through the execution plan that owns the affected route or shared module.

## Layout

```text
app/
├── (public)/      unauthenticated routes
├── (auth)/        authenticated user routes
├── admin/         /admin route tree
├── api/           Route Handlers
└── _lib/          shared server/client-safe modules
```

See `../docs/CODE_STRUCTURE.md` for the full structure contract.
