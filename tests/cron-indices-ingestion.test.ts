import { describe, expect, it, vi } from "vitest";

import type { IndicesSupabaseClient } from "@/app/_lib/cron/indices";
import type { ApiQuotaClaim } from "@/app/_lib/cron/quota-claim";
import type { IndexProviderAdapter, NormalizedIndexRowInput } from "@/app/_lib/providers/indices";

vi.mock("server-only", () => ({}));

function createIngestionClient(quota: ApiQuotaClaim, options: { sparks?: Record<string, number[]>; upsertError?: string; selectError?: string } = {}) {
  const single = vi.fn().mockResolvedValue({ data: quota, error: null });
  const rpc = vi.fn().mockReturnValue({ single });
  const inFilter = vi.fn().mockResolvedValue({
    data: Object.entries(options.sparks ?? {}).map(([code, spark]) => ({ code, spark })),
    error: options.selectError ? { message: options.selectError } : null
  });
  const select = vi.fn().mockReturnValue({ in: inFilter });
  const upsert = vi.fn().mockResolvedValue({ error: options.upsertError ? { message: options.upsertError } : null });
  const from = vi.fn().mockReturnValue({ select, upsert });

  return { client: { rpc, from } as IndicesSupabaseClient, rpc, from, select, inFilter, upsert };
}

function createProvider(options: { estimate?: number; rows?: NormalizedIndexRowInput[]; fetchError?: Error } = {}) {
  const estimateIndexRequests = vi.fn().mockReturnValue(options.estimate ?? 6);
  const fetchIndices = vi.fn().mockImplementation(async () => {
    if (options.fetchError) {
      throw options.fetchError;
    }

    return options.rows ?? [];
  });

  return { provider: "mock-indices", estimateIndexRequests, fetchIndices } satisfies IndexProviderAdapter;
}

function quota(overrides: Partial<ApiQuotaClaim> = {}): ApiQuotaClaim {
  return {
    provider: "mock-indices",
    day: "2026-05-07",
    used: 6,
    limit: 10000,
    remaining: 9994,
    status: "ok",
    claimed: true,
    ...overrides
  };
}

describe("ingestIndices", () => {
  it("skips quota claim and provider call when there are no requested index units", async () => {
    const { ingestIndices } = await import("@/app/_lib/cron/indices");
    const supabase = createIngestionClient(quota());
    const provider = createProvider({ estimate: 0 });

    const result = await ingestIndices({ supabase: supabase.client, indexProvider: provider, day: "2026-05-07", dailyLimit: 10000 });

    expect(supabase.rpc).not.toHaveBeenCalled();
    expect(provider.fetchIndices).not.toHaveBeenCalled();
    expect(supabase.from).not.toHaveBeenCalled();
    expect(result).toMatchObject({ ok: true, skipped: true, reason: "no_requests", requestedCount: 0, upsertedCount: 0 });
  });

  it("short-circuits before provider fetch and index upsert when quota is not claimed", async () => {
    const { ingestIndices } = await import("@/app/_lib/cron/indices");
    const exhausted = quota({ used: 10000, remaining: 0, status: "exhausted", claimed: false });
    const supabase = createIngestionClient(exhausted);
    const provider = createProvider({ estimate: 6 });

    const result = await ingestIndices({ supabase: supabase.client, indexProvider: provider, day: "2026-05-07", dailyLimit: 10000 });

    expect(supabase.rpc).toHaveBeenCalledWith("claim_api_quota", {
      p_provider: "mock-indices",
      p_day: "2026-05-07",
      p_amount: 6,
      p_limit: 10000
    });
    expect(provider.fetchIndices).not.toHaveBeenCalled();
    expect(supabase.from).not.toHaveBeenCalled();
    expect(result).toMatchObject({ ok: true, skipped: true, reason: "quota_exhausted", upsertedCount: 0 });
  });

  it("fetches provider indices and appends capped spark values before upsert", async () => {
    const { ingestIndices } = await import("@/app/_lib/cron/indices");
    const rows: NormalizedIndexRowInput[] = [
      { code: "SP500", value: 5325.67, change: 0.42, updated_at: "2026-05-07T14:30:00.000Z" },
      { code: "KOSPI", value: 2670.65, change: 11.66, updated_at: "2026-05-07T06:40:00.000Z" }
    ];
    const supabase = createIngestionClient(quota(), { sparks: { SP500: [5300, 5310], KOSPI: [2660, 2665] } });
    const provider = createProvider({ rows });

    const result = await ingestIndices({
      supabase: supabase.client,
      indexProvider: provider,
      day: "2026-05-07",
      dailyLimit: 10000,
      sparkWindow: 2
    });

    expect(provider.fetchIndices).toHaveBeenCalledWith({ day: "2026-05-07" });
    expect(supabase.inFilter).toHaveBeenCalledWith("code", ["SP500", "KOSPI"]);
    expect(supabase.upsert).toHaveBeenCalledWith(
      [
        { code: "SP500", value: 5325.67, change: 0.42, updated_at: "2026-05-07T14:30:00.000Z", spark: [5310, 5325.67] },
        { code: "KOSPI", value: 2670.65, change: 11.66, updated_at: "2026-05-07T06:40:00.000Z", spark: [2665, 2670.65] }
      ],
      { onConflict: "code" }
    );
    expect(result).toMatchObject({ ok: true, provider: "mock-indices", targetCount: 6, requestedCount: 6, upsertedCount: 2 });
  });

  it("propagates provider failures after quota claim and does not read or upsert indices", async () => {
    const { ingestIndices } = await import("@/app/_lib/cron/indices");
    const supabase = createIngestionClient(quota());
    const provider = createProvider({ fetchError: new Error("provider unavailable") });

    await expect(ingestIndices({ supabase: supabase.client, indexProvider: provider, day: "2026-05-07", dailyLimit: 10000 })).rejects.toThrow(
      "provider unavailable"
    );

    expect(supabase.rpc).toHaveBeenCalledOnce();
    expect(provider.fetchIndices).toHaveBeenCalledOnce();
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it("propagates index upsert errors", async () => {
    const { ingestIndices } = await import("@/app/_lib/cron/indices");
    const supabase = createIngestionClient(quota(), { upsertError: "permission denied" });
    const provider = createProvider({ rows: [{ code: "SP500", value: 5325.67, change: 0.42, updated_at: "2026-05-07T14:30:00.000Z" }] });

    await expect(ingestIndices({ supabase: supabase.client, indexProvider: provider, day: "2026-05-07", dailyLimit: 10000 })).rejects.toThrow(
      "failed to upsert indices: permission denied"
    );
  });
});
