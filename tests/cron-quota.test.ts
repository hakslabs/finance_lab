import { describe, expect, it, vi } from "vitest";

import type { ApiQuotaSupabaseClient, ApiQuotaUsage } from "@/app/_lib/cron/quota";

vi.mock("server-only", () => ({}));

function createQuotaClient(initial: ApiQuotaUsage | null) {
  let stored = initial;
  const maybeSingle = vi.fn().mockImplementation(async () => ({ data: stored, error: null }));
  const selectForRead = {
    eq: vi.fn().mockReturnThis(),
    maybeSingle
  };
  const upsertSingle = vi.fn().mockImplementation(async () => ({ data: stored, error: null }));
  const upsertSelect = vi.fn().mockReturnValue({ single: upsertSingle });
  const upsert = vi.fn().mockImplementation((values: ApiQuotaUsage) => {
    stored = values;
    return { select: upsertSelect };
  });
  const insert = vi.fn().mockImplementation(async (values: ApiQuotaUsage) => {
    stored = values;
    return { error: null };
  });
  const from = vi.fn().mockReturnValue({ select: vi.fn().mockReturnValue(selectForRead), insert, upsert });

  return { client: { from } as ApiQuotaSupabaseClient, from, selectForRead, maybeSingle, insert, upsert, upsertSelect, upsertSingle };
}

describe("api quota helpers", () => {
  it("reads provider/day usage with provider and day filters", async () => {
    const { readApiQuotaUsage } = await import("@/app/_lib/cron/quota");
    const quota = { provider: "finnhub", day: "2026-05-06", used: 48, limit: 60 };
    const supabase = createQuotaClient(quota);

    await expect(readApiQuotaUsage(supabase.client, "finnhub", "2026-05-06")).resolves.toEqual(quota);

    expect(supabase.selectForRead.eq).toHaveBeenCalledWith("provider", "finnhub");
    expect(supabase.selectForRead.eq).toHaveBeenCalledWith("day", "2026-05-06");
  });

  it("classifies usage at ok, warning, and exhausted thresholds", async () => {
    const { checkApiQuotaUsage } = await import("@/app/_lib/cron/quota");

    expect(checkApiQuotaUsage({ provider: "a", day: "2026-05-06", used: 79, limit: 100 }).status).toBe("ok");
    expect(checkApiQuotaUsage({ provider: "a", day: "2026-05-06", used: 80, limit: 100 }).status).toBe("warning");
    expect(checkApiQuotaUsage({ provider: "a", day: "2026-05-06", used: 100, limit: 100 })).toMatchObject({
      remaining: 0,
      ratio: 1,
      status: "exhausted"
    });
  });

  it("increments an existing row with a mocked-Supabase-compatible read then upsert", async () => {
    const { incrementApiQuotaUsage } = await import("@/app/_lib/cron/quota");
    const supabase = createQuotaClient({ provider: "krx", day: "2026-05-06", used: 7, limit: 10 });

    await expect(incrementApiQuotaUsage(supabase.client, "krx", "2026-05-06", 2, 10)).resolves.toMatchObject({
      provider: "krx",
      day: "2026-05-06",
      used: 9,
      limit: 10,
      status: "warning"
    });

    expect(supabase.upsert).toHaveBeenCalledWith(
      { provider: "krx", day: "2026-05-06", used: 9, limit: 10 },
      { onConflict: "provider,day" }
    );
  });

  it("creates a zero-usage row when ensuring quota for a new provider/day", async () => {
    const { ensureApiQuotaUsage } = await import("@/app/_lib/cron/quota");
    const supabase = createQuotaClient(null);

    await expect(ensureApiQuotaUsage(supabase.client, "newsapi", "2026-05-06", 100)).resolves.toEqual({
      provider: "newsapi",
      day: "2026-05-06",
      used: 0,
      limit: 100
    });

    expect(supabase.insert).toHaveBeenCalledWith({ provider: "newsapi", day: "2026-05-06", used: 0, limit: 100 });
  });
});
