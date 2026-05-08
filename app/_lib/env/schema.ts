import { z } from "zod";

const emptyStringToUndefined = (value: unknown) => (value === "" ? undefined : value);

const requiredSecret = z.preprocess(
  emptyStringToUndefined,
  z.string().min(16, "must be at least 16 characters")
);

export const serverEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  NEXT_PUBLIC_APP_URL: z.preprocess(
    emptyStringToUndefined,
    z.string().url().default("http://localhost:3000")
  ),
  SUPABASE_URL: z.string().url(),
  SUPABASE_PUBLISHABLE_KEY: requiredSecret,
  SUPABASE_SECRET_KEY: requiredSecret,
  CRON_SECRET: requiredSecret,
  KRX_API_KEY: requiredSecret,
  FINNHUB_API_KEY: requiredSecret,
  SENTRY_DSN: z.preprocess(emptyStringToUndefined, z.string().url().optional()),
  NEXT_PUBLIC_SENTRY_DSN: z.preprocess(emptyStringToUndefined, z.string().url().optional()),
  OAUTH_GOOGLE_CLIENT_ID: z.preprocess(emptyStringToUndefined, z.string().min(8).optional()),
  OAUTH_GOOGLE_CLIENT_SECRET: z.preprocess(emptyStringToUndefined, z.string().min(8).optional())
});

export const publicEnvSchema = serverEnvSchema.pick({
  NODE_ENV: true,
  NEXT_PUBLIC_APP_URL: true,
  SUPABASE_URL: true,
  SUPABASE_PUBLISHABLE_KEY: true,
  NEXT_PUBLIC_SENTRY_DSN: true
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;
export type PublicEnv = z.infer<typeof publicEnvSchema>;

export function parseServerEnv(source: NodeJS.ProcessEnv): ServerEnv {
  return serverEnvSchema.parse(source);
}

export function parsePublicEnv(source: NodeJS.ProcessEnv): PublicEnv {
  return publicEnvSchema.parse(source);
}
