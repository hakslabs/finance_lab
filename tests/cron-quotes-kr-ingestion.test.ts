import { describe, expect, it, vi } from "vitest";

import type { ApiQuotaClaim } from "@/app/_lib/cron/quota-claim";
import type { QuotesKrSupabaseClient } from "@/app/_lib/cron/quotes-kr";
import type { QuoteTarget } from "@/app/_lib/data/securities";
import type { DailyQuoteProviderAdapter, NormalizedDailyQuoteRowInput } from "@/app/_lib/providers/quotes";

vi.mock("server-only", () => ({}));

const samsungTarget: QuoteTarget = {
  symbol: "005930.KS",
  name: "Samsung Electronics Co., Ltd.",
  asset_class: "equity",
  country: "South Korea",
  currency: "KRW",
  exchange: "KSC",
  market: "KOSPI",
  sector: "Technology",
  industry: "Consumer Electronics"
};

function createIngestionClient(quota: ApiQuotaClaim, options: { upsertError?: string } = {}) {
  const single = vi.fn().mockResolvedValue({ data: quota, error: null });
  const rpc = vi.fn().mockReturnValue({ single });
  const upsert = vi.fn().mockResolvedValue({ error: options.upsertError ? { message: options.upsertError } : null });
  const from = vi.fn().mockReturnValue({ upsert });

  return { client: { rpc, from } as QuotesKrSupabaseClient, rpc, from, upsert };
}

function createProvider(options: { estimate?: number; quotes?: NormalizedDailyQuoteRowInput[]; fetchError?: Error } = {}) {
  const estimateQuoteRequests = vi.fn().mockReturnValue(options.estimate ?? 1);
  const fetchDailyQuotes = vi.fn().mockImplementation(async () => {
    if (options.fetchError) {
      throw options.fetchError;
    }

    return options.quotes ?? [];
  });

  return { provider: "mock-kr-quotes", estimateQuoteRequests, fetchDailyQuotes } satisfies DailyQuoteProviderAdapter;
}

function quota(overrides: Partial<ApiQuotaClaim> = {}): ApiQuotaClaim {
  return {
    provider: "mock-kr-quotes",
    day: "2026-05-07",
    used: 1,
    limit: 10000,
    remaining: 9999,
    status: "ok",
    claimed: true,
    ...overrides
  };
}

describe("ingestKrDailyQuotes", () => {
  it("skips quota claim and provider call when there are no requested KRX units", async () => {
    const { ingestKrDailyQuotes } = await import("@/app/_lib/cron/quotes-kr");
    const supabase = createIngestionClient(quota());
    const provider = createProvider({ estimate: 0 });

    const result = await ingestKrDailyQuotes({
      supabase: supabase.client,
      quoteProvider: provider,
      day: "2026-05-07",
      dailyLimit: 10000,
      targets: [samsungTarget]
    });

    expect(supabase.rpc).not.toHaveBeenCalled();
    expect(provider.fetchDailyQuotes).not.toHaveBeenCalled();
    expect(supabase.from).not.toHaveBeenCalled();
    expect(result).toMatchObject({ ok: true, skipped: true, reason: "no_requests", requestedCount: 0, upsertedCount: 0 });
  });

  it("short-circuits before provider fetch and daily quote upsert when quota is not claimed", async () => {
    const { ingestKrDailyQuotes } = await import("@/app/_lib/cron/quotes-kr");
    const exhausted = quota({ used: 10000, remaining: 0, status: "exhausted", claimed: false });
    const supabase = createIngestionClient(exhausted);
    const provider = createProvider({ estimate: 2 });

    const result = await ingestKrDailyQuotes({
      supabase: supabase.client,
      quoteProvider: provider,
      day: "2026-05-07",
      dailyLimit: 10000,
      targets: [samsungTarget]
    });

    expect(supabase.rpc).toHaveBeenCalledWith("claim_api_quota", {
      p_provider: "mock-kr-quotes",
      p_day: "2026-05-07",
      p_amount: 2,
      p_limit: 10000
    });
    expect(provider.fetchDailyQuotes).not.toHaveBeenCalled();
    expect(supabase.from).not.toHaveBeenCalled();
    expect(result).toMatchObject({ ok: true, skipped: true, reason: "quota_exhausted", upsertedCount: 0, quota: exhausted });
  });

  it("fetches KRX rows after a successful claim and upserts quotes_daily rows", async () => {
    const { ingestKrDailyQuotes } = await import("@/app/_lib/cron/quotes-kr");
    const rows: NormalizedDailyQuoteRowInput[] = [
      { symbol: "005930.KS", date: "2026-05-07", open: 76000, high: 77500, low: 75500, close: 77000, vol: 12345678 }
    ];
    const supabase = createIngestionClient(quota());
    const provider = createProvider({ estimate: 1, quotes: rows });

    const result = await ingestKrDailyQuotes({
      supabase: supabase.client,
      quoteProvider: provider,
      day: "2026-05-07",
      dailyLimit: 10000,
      targets: [samsungTarget]
    });

    expect(provider.fetchDailyQuotes).toHaveBeenCalledWith([samsungTarget], { market: "kr", day: "2026-05-07" });
    expect(supabase.upsert).toHaveBeenCalledWith(rows, { onConflict: "symbol,date" });
    expect(result).toMatchObject({ ok: true, market: "kr", targetCount: 1, requestedCount: 1, upsertedCount: 1 });
  });

  it("propagates provider failures after quota claim and does not upsert daily quotes", async () => {
    const { ingestKrDailyQuotes } = await import("@/app/_lib/cron/quotes-kr");
    const supabase = createIngestionClient(quota());
    const provider = createProvider({ fetchError: new Error("krx unavailable") });

    await expect(
      ingestKrDailyQuotes({
        supabase: supabase.client,
        quoteProvider: provider,
        day: "2026-05-07",
        dailyLimit: 10000,
        targets: [samsungTarget]
      })
    ).rejects.toThrow("krx unavailable");

    expect(supabase.rpc).toHaveBeenCalledOnce();
    expect(provider.fetchDailyQuotes).toHaveBeenCalledOnce();
    expect(supabase.from).not.toHaveBeenCalled();
  });
});
