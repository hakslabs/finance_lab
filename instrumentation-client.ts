import * as Sentry from "@sentry/nextjs";

import { stripPiiBeforeSend } from "./app/_lib/observability/sentry";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  enabled: Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN),
  sendDefaultPii: false,
  beforeSend: stripPiiBeforeSend
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
