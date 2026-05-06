import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

describe("cron auth", () => {
  it("authorizes only the configured bearer token", async () => {
    vi.stubEnv("NODE_ENV", "test");
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "http://localhost:3000");
    vi.stubEnv("SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("SUPABASE_PUBLISHABLE_KEY", "publishable-key-with-length");
    vi.stubEnv("SUPABASE_SECRET_KEY", "secret-key-with-length");
    vi.stubEnv("CRON_SECRET", "cron-secret-with-length");

    const { isAuthorizedCronRequest } = await import("@/app/_lib/auth/cron");
    const goodRequest = new Request("http://localhost/api/cron/__health", {
      headers: { authorization: "Bearer cron-secret-with-length" }
    });
    const badRequest = new Request("http://localhost/api/cron/__health", {
      headers: { authorization: "Bearer wrong-secret-with-length" }
    });

    expect(isAuthorizedCronRequest(goodRequest)).toBe(true);
    expect(isAuthorizedCronRequest(badRequest)).toBe(false);
  });
});
