import { describe, expect, it } from "vitest";

import { parsePublicEnv, parseServerEnv, serverEnvSchema } from "@/app/_lib/env/schema";

const validEnv: NodeJS.ProcessEnv = {
  NODE_ENV: "test",
  NEXT_PUBLIC_APP_URL: "http://localhost:3000",
  SUPABASE_URL: "https://example.supabase.co",
  SUPABASE_PUBLISHABLE_KEY: "publishable-key-with-length",
  SUPABASE_SECRET_KEY: "secret-key-with-length",
  CRON_SECRET: "cron-secret-with-length",
  KRX_API_KEY: "krx-key-with-length",
  FINNHUB_API_KEY: "finnhub-key-with-length",
  SENTRY_DSN: "",
  NEXT_PUBLIC_SENTRY_DSN: ""
};

describe("environment validation", () => {
  it("accepts canonical server environment variables", () => {
    expect(parseServerEnv(validEnv)).toMatchObject({
      SUPABASE_URL: "https://example.supabase.co",
      SUPABASE_PUBLISHABLE_KEY: "publishable-key-with-length",
      SUPABASE_SECRET_KEY: "secret-key-with-length",
      CRON_SECRET: "cron-secret-with-length",
      KRX_API_KEY: "krx-key-with-length",
      FINNHUB_API_KEY: "finnhub-key-with-length",
      SENTRY_DSN: undefined,
      NEXT_PUBLIC_SENTRY_DSN: undefined
    });
  });

  it("rejects missing server-only secrets", () => {
    const result = serverEnvSchema.safeParse({
      ...validEnv,
      SUPABASE_SECRET_KEY: ""
    });

    expect(result.success).toBe(false);
  });

  it("excludes server-only keys from public parsing", () => {
    const parsed = parsePublicEnv(validEnv);

    expect(Object.keys(parsed)).not.toContain("SUPABASE_SECRET_KEY");
    expect(Object.keys(parsed)).not.toContain("CRON_SECRET");
    expect(Object.keys(parsed)).not.toContain("KRX_API_KEY");
    expect(Object.keys(parsed)).not.toContain("FINNHUB_API_KEY");
    expect(Object.keys(parsed)).not.toContain("SENTRY_DSN");
  });
});
