import { withSentryConfig } from "@sentry/nextjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["isomorphic-dompurify", "jsdom"],
  poweredByHeader: false
};

// withSentryConfig is applied unconditionally because Vercel's build
// adapter relies on the Sentry wrapper to register the Next.js page
// functions in `.vercel/output/functions/`. The actual Sentry SDK only
// activates at runtime when `SENTRY_DSN` is set (see `instrumentation.ts`).
export default withSentryConfig(nextConfig, {
  silent: true,
  widenClientFileUpload: false
});
