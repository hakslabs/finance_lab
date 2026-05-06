import * as Sentry from "@sentry/nextjs";

import { stripPiiBeforeSend } from "./app/_lib/observability/sentry";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  enabled: Boolean(process.env.SENTRY_DSN),
  sendDefaultPii: false,
  tracesSampleRate: 0,
  beforeSend: stripPiiBeforeSend
});
