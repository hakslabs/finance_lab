/**
 * Next.js instrumentation hook.
 *
 * Sentry is loaded lazily (dynamic import) and only when `SENTRY_DSN` is
 * present. Loading the SDK at module top-level — or running `withSentryConfig`
 * with no DSN — pulled Node-only globals (e.g. `__dirname`) into the Edge
 * middleware bundle and crashed the deployed function. Keeping the imports
 * inside `register()` and `onRequestError()` means the SDK only enters the
 * runtime when an actual DSN is configured.
 */

export async function register() {
  if (!process.env.SENTRY_DSN) return;

  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

export async function onRequestError(
  ...args: Parameters<
    NonNullable<typeof import("@sentry/nextjs")["captureRequestError"]>
  >
) {
  if (!process.env.SENTRY_DSN) return;
  const Sentry = await import("@sentry/nextjs");
  return Sentry.captureRequestError(...args);
}
