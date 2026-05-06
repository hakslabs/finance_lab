import { describe, expect, it, vi } from "vitest";

import type { ApiQuotaClaim } from "@/app/_lib/cron/quota-claim";
import type { QuotesUsSupabaseClient } from "@/app/_lib/cron/quotes-us";
import type { QuoteTarget } from "@/app/_lib/data/securities";
import type { NormalizedQuoteRowInput, QuoteProviderAdapter } from "@/app/_lib/providers/quotes";

vi.mock("server-only", () => ({}));

const appleTarget: QuoteTarget = {
  symbol: "AAPL",
  name: "Apple Inc.",
  asset_class: "equity",
  country: "United States",
  currency: "USD",
  exchange: "NMS",
  market: "NasdaqGS",
  sector: "Technology",
  industry: "Consumer Electronics"
};

const microsoftTarget: QuoteTarget = {
  ...appleTarget,
  symbol: "MSFT",
  name: "Microsoft Corporation",
  industry: "Software - Infrastructure"
};

function createIngestionClient(quota: ApiQuotaClaim, options: { upsertError?: string } = {}) {
  const single = vi.fn().mockResolvedValue({ data: quota, error: null });
  const rpc = vi.fn().mockReturnValue({ single });
  const upsert = vi.fn().mockResolvedValue({ error: options.upsertError ? { message: options.upsertError } : null });
  const from = vi.fn().mockReturnValue({ upsert });

  return { client: { rpc, from } as QuotesUsSupabaseClient, rpc, single, from, upsert };
}

function createProvider(options: { estimate?: number; quotes?: NormalizedQuoteRowInput[]; fetchError?: Error } = {}) {
  const estimateQuoteRequests = vi.fn().mockReturnValue(options.estimate ?? 2);
  const fetchQuotes = vi.fn().mockImplementation(async () => {
    if (options.fetchError) {
      throw options.fetchError;
    }

    return options.quotes ?? [];
  });

  return { provider: "mock-us-quotes", estimateQuoteRequests, fetchQuotes } satisfies QuoteProviderAdapter;
}

function quota(overrides: Partial<ApiQuotaClaim> = {}): ApiQuotaClaim {
  return {
    provider: "mock-us-quotes",
    day: "2026-05-06",
    used: 2,
    limit: 10,
    remaining: 8,
    status: "ok",
    claimed: true,
    ...overrides
  };
}

describe("ingestUsQuotes", () => {
  it("skips quota claim and provider call when there are no requested quote units", async () => {
    const { ingestUsQuotes } = await import("@/app/_lib/cron/quotes-us");
    const supabase = createIngestionClient(quota());
    const provider = createProvider({ estimate: 0 });

    const result = await ingestUsQuotes({
      supabase: supabase.client,
      quoteProvider: provider,
      day: "2026-05-06",
      dailyLimit: 10,
      targets: [appleTarget, microsoftTarget]
    });

    expect(provider.estimateQuoteRequests).toHaveBeenCalledWith([appleTarget, microsoftTarget]);
    expect(supabase.rpc).not.toHaveBeenCalled();
    expect(provider.fetchQuotes).not.toHaveBeenCalled();
    expect(supabase.from).not.toHaveBeenCalled();
    expect(result).toMatchObject({
      ok: true,
      skipped: true,
      reason: "no_requests",
      requestedCount: 0,
      upsertedCount: 0
    });
  });

  it("short-circuits before provider fetch and quote upsert when quota is not claimed", async () => {
    const { ingestUsQuotes } = await import("@/app/_lib/cron/quotes-us");
    const exhausted = quota({ used: 10, remaining: 0, status: "exhausted", claimed: false });
    const supabase = createIngestionClient(exhausted);
    const provider = createProvider({ estimate: 4 });

    const result = await ingestUsQuotes({
      supabase: supabase.client,
      quoteProvider: provider,
      day: "2026-05-06",
      dailyLimit: 10,
      targets: [appleTarget, microsoftTarget]
    });

    expect(provider.estimateQuoteRequests).toHaveBeenCalledWith([appleTarget, microsoftTarget]);
    expect(supabase.rpc).toHaveBeenCalledWith("claim_api_quota", {
      p_provider: "mock-us-quotes",
      p_day: "2026-05-06",
      p_amount: 4,
      p_limit: 10
    });
    expect(provider.fetchQuotes).not.toHaveBeenCalled();
    expect(supabase.from).not.toHaveBeenCalled();
    expect(result).toMatchObject({ ok: true, skipped: true, reason: "quota_exhausted", upsertedCount: 0, quota: exhausted });
  });

  it("fetches provider quotes after a successful claim and upserts normalized rows", async () => {
    const { ingestUsQuotes } = await import("@/app/_lib/cron/quotes-us");
    const rows: NormalizedQuoteRowInput[] = [
      { symbol: "AAPL", px: 195.5, pct: 1.2, ts: "2026-05-06T14:30:00.000Z" },
      { symbol: "MSFT", px: 410.1, pct: -0.4, ts: "2026-05-06T14:30:00.000Z" }
    ];
    const supabase = createIngestionClient(quota({ used: 4, remaining: 6 }));
    const provider = createProvider({ estimate: 2, quotes: rows });
    const loadTargets = vi.fn().mockResolvedValue([appleTarget, microsoftTarget]);

    const result = await ingestUsQuotes({
      supabase: supabase.client,
      quoteProvider: provider,
      day: "2026-05-06",
      dailyLimit: 10,
      loadTargets
    });

    expect(loadTargets).toHaveBeenCalledOnce();
    expect(provider.fetchQuotes).toHaveBeenCalledWith([appleTarget, microsoftTarget], { market: "us", day: "2026-05-06" });
    expect(supabase.upsert).toHaveBeenCalledWith(rows, { onConflict: "symbol" });
    expect(result).toMatchObject({ ok: true, skipped: false, reason: null, targetCount: 2, requestedCount: 2, upsertedCount: 2 });
  });

  it("propagates provider failures after quota claim and does not upsert quotes", async () => {
    const { ingestUsQuotes } = await import("@/app/_lib/cron/quotes-us");
    const supabase = createIngestionClient(quota());
    const provider = createProvider({ fetchError: new Error("provider unavailable") });

    await expect(
      ingestUsQuotes({
        supabase: supabase.client,
        quoteProvider: provider,
        day: "2026-05-06",
        dailyLimit: 10,
        targets: [appleTarget]
      })
    ).rejects.toThrow("provider unavailable");

    expect(supabase.rpc).toHaveBeenCalledOnce();
    expect(provider.fetchQuotes).toHaveBeenCalledOnce();
    expect(supabase.from).not.toHaveBeenCalled();
  });
});
