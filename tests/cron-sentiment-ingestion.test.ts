import { describe, expect, it, vi } from "vitest";

import type { ApiQuotaClaim } from "@/app/_lib/cron/quota-claim";
import type { SentimentSupabaseClient } from "@/app/_lib/cron/sentiment";
import type { NormalizedSentimentRowInput, SentimentProviderAdapter } from "@/app/_lib/providers/sentiment";

vi.mock("server-only", () => ({}));

function createIngestionClient(quota: ApiQuotaClaim, options: { upsertError?: string } = {}) {
  const single = vi.fn().mockResolvedValue({ data: quota, error: null });
  const rpc = vi.fn().mockReturnValue({ single });
  const upsert = vi.fn().mockResolvedValue({ error: options.upsertError ? { message: options.upsertError } : null });
  const from = vi.fn().mockReturnValue({ upsert });

  return { client: { rpc, from } as SentimentSupabaseClient, rpc, from, upsert };
}

function createProvider(options: { estimate?: number; rows?: NormalizedSentimentRowInput[]; fetchError?: Error } = {}) {
  const estimateSentimentRequests = vi.fn().mockReturnValue(options.estimate ?? 1);
  const fetchSentiment = vi.fn().mockImplementation(async () => {
    if (options.fetchError) {
      throw options.fetchError;
    }

    return options.rows ?? [];
  });

  return { provider: "mock-sentiment", estimateSentimentRequests, fetchSentiment } satisfies SentimentProviderAdapter;
}

function quota(overrides: Partial<ApiQuotaClaim> = {}): ApiQuotaClaim {
  return {
    provider: "mock-sentiment",
    day: "2026-05-07",
    used: 1,
    limit: 86400,
    remaining: 86399,
    status: "ok",
    claimed: true,
    ...overrides
  };
}

describe("ingestSentiment", () => {
  it("skips quota claim and provider call when there are no requested units", async () => {
    const { ingestSentiment } = await import("@/app/_lib/cron/sentiment");
    const supabase = createIngestionClient(quota());
    const provider = createProvider({ estimate: 0 });

    const result = await ingestSentiment({ supabase: supabase.client, sentimentProvider: provider, day: "2026-05-07", dailyLimit: 86400 });

    expect(supabase.rpc).not.toHaveBeenCalled();
    expect(provider.fetchSentiment).not.toHaveBeenCalled();
    expect(supabase.from).not.toHaveBeenCalled();
    expect(result).toMatchObject({ ok: true, skipped: true, reason: "no_requests", requestedCount: 0, upsertedCount: 0 });
  });

  it("short-circuits before provider fetch and upsert when quota is not claimed", async () => {
    const { ingestSentiment } = await import("@/app/_lib/cron/sentiment");
    const exhausted = quota({ used: 86400, remaining: 0, status: "exhausted", claimed: false });
    const supabase = createIngestionClient(exhausted);
    const provider = createProvider();

    const result = await ingestSentiment({ supabase: supabase.client, sentimentProvider: provider, day: "2026-05-07", dailyLimit: 86400 });

    expect(supabase.rpc).toHaveBeenCalledWith("claim_api_quota", {
      p_provider: "mock-sentiment",
      p_day: "2026-05-07",
      p_amount: 1,
      p_limit: 86400
    });
    expect(provider.fetchSentiment).not.toHaveBeenCalled();
    expect(supabase.from).not.toHaveBeenCalled();
    expect(result).toMatchObject({ ok: true, skipped: true, reason: "quota_exhausted", upsertedCount: 0 });
  });

  it("fetches provider sentiment and upserts rows", async () => {
    const { ingestSentiment } = await import("@/app/_lib/cron/sentiment");
    const rows: NormalizedSentimentRowInput[] = [{ code: "VIX", value: 18.42, band: "normal", ts: "2026-05-07T14:30:00.000Z" }];
    const supabase = createIngestionClient(quota());
    const provider = createProvider({ rows });

    const result = await ingestSentiment({ supabase: supabase.client, sentimentProvider: provider, day: "2026-05-07", dailyLimit: 86400 });

    expect(provider.fetchSentiment).toHaveBeenCalledWith({ day: "2026-05-07" });
    expect(supabase.upsert).toHaveBeenCalledWith(rows, { onConflict: "code" });
    expect(result).toMatchObject({ ok: true, provider: "mock-sentiment", targetCount: 1, requestedCount: 1, upsertedCount: 1 });
  });

  it("propagates provider failures after quota claim", async () => {
    const { ingestSentiment } = await import("@/app/_lib/cron/sentiment");
    const supabase = createIngestionClient(quota());
    const provider = createProvider({ fetchError: new Error("provider unavailable") });

    await expect(ingestSentiment({ supabase: supabase.client, sentimentProvider: provider, day: "2026-05-07", dailyLimit: 86400 })).rejects.toThrow(
      "provider unavailable"
    );

    expect(supabase.rpc).toHaveBeenCalledOnce();
    expect(provider.fetchSentiment).toHaveBeenCalledOnce();
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it("propagates sentiment upsert errors", async () => {
    const { ingestSentiment } = await import("@/app/_lib/cron/sentiment");
    const supabase = createIngestionClient(quota(), { upsertError: "permission denied" });
    const provider = createProvider({ rows: [{ code: "VIX", value: 18.42, band: "normal", ts: "2026-05-07T14:30:00.000Z" }] });

    await expect(ingestSentiment({ supabase: supabase.client, sentimentProvider: provider, day: "2026-05-07", dailyLimit: 86400 })).rejects.toThrow(
      "failed to upsert sentiment: permission denied"
    );
  });
});
