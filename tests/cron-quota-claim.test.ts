import { describe, expect, it, vi } from "vitest";

import type { ApiQuotaClaim, ApiQuotaClaimSupabaseClient } from "@/app/_lib/cron/quota-claim";

vi.mock("server-only", () => ({}));

function createQuotaClaimClient(options: { row?: ApiQuotaClaim | null; error?: string } = {}) {
  const single = vi.fn().mockResolvedValue({
    data: options.row === undefined ? claimedQuota : options.row,
    error: options.error ? { message: options.error } : null
  });
  const rpcBuilder = { single };
  const rpc = vi.fn().mockReturnValue(rpcBuilder);

  return { client: { rpc } as ApiQuotaClaimSupabaseClient, rpc, single };
}

const claimedQuota: ApiQuotaClaim = {
  provider: "finnhub",
  day: "2026-05-06",
  used: 12,
  limit: 60,
  remaining: 48,
  status: "ok",
  claimed: true
};

describe("claimApiQuotaUsage", () => {
  it("calls the atomic quota RPC with provider, day, amount, and limit", async () => {
    const { claimApiQuotaUsage } = await import("@/app/_lib/cron/quota-claim");
    const supabase = createQuotaClaimClient();

    await expect(
      claimApiQuotaUsage(supabase.client, {
        provider: "finnhub",
        day: "2026-05-06",
        amount: 3,
        dailyLimit: 60
      })
    ).resolves.toEqual(claimedQuota);

    expect(supabase.rpc).toHaveBeenCalledWith("claim_api_quota", {
      p_provider: "finnhub",
      p_day: "2026-05-06",
      p_amount: 3,
      p_limit: 60
    });
    expect(supabase.single).toHaveBeenCalledOnce();
  });

  it("returns exhausted claims without treating them as helper errors", async () => {
    const { claimApiQuotaUsage } = await import("@/app/_lib/cron/quota-claim");
    const exhaustedQuota: ApiQuotaClaim = {
      provider: "finnhub",
      day: "2026-05-06",
      used: 60,
      limit: 60,
      remaining: 0,
      status: "exhausted",
      claimed: false
    };
    const supabase = createQuotaClaimClient({ row: exhaustedQuota });

    await expect(
      claimApiQuotaUsage(supabase.client, { provider: "finnhub", day: "2026-05-06", amount: 1, dailyLimit: 60 })
    ).resolves.toEqual(exhaustedQuota);
  });

  it("throws when the RPC returns an error", async () => {
    const { claimApiQuotaUsage } = await import("@/app/_lib/cron/quota-claim");
    const supabase = createQuotaClaimClient({ error: "permission denied" });

    await expect(
      claimApiQuotaUsage(supabase.client, { provider: "finnhub", day: "2026-05-06", amount: 1, dailyLimit: 60 })
    ).rejects.toThrow("failed to claim api_quota for finnhub on 2026-05-06: permission denied");
  });

  it("throws when the RPC returns no row", async () => {
    const { claimApiQuotaUsage } = await import("@/app/_lib/cron/quota-claim");
    const supabase = createQuotaClaimClient({ row: null });

    await expect(
      claimApiQuotaUsage(supabase.client, { provider: "finnhub", day: "2026-05-06", amount: 1, dailyLimit: 60 })
    ).rejects.toThrow("failed to claim api_quota for finnhub on 2026-05-06: missing RPC row");
  });

  it("rejects invalid local quota inputs before calling the RPC", async () => {
    const { claimApiQuotaUsage } = await import("@/app/_lib/cron/quota-claim");
    const supabase = createQuotaClaimClient();

    await expect(
      claimApiQuotaUsage(supabase.client, { provider: "finnhub", day: "2026-05-06", amount: -1, dailyLimit: 60 })
    ).rejects.toThrow("amount must be a non-negative integer");
    await expect(
      claimApiQuotaUsage(supabase.client, { provider: "finnhub", day: "2026-05-06", amount: 1, dailyLimit: -1 })
    ).rejects.toThrow("dailyLimit must be a non-negative integer");
    expect(supabase.rpc).not.toHaveBeenCalled();
  });
});
