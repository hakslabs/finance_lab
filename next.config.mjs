import { withSentryConfig } from "@sentry/nextjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    instrumentationHook: true
  },
  poweredByHeader: false
};

export default withSentryConfig(nextConfig, {
  silent: true,
  widenClientFileUpload: false
});
