import { describe, expect, it, vi } from "vitest";

import type { ApiQuotaClaim } from "@/app/_lib/cron/quota-claim";
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

function createRouteClient(options: { quota?: ApiQuotaClaim; upsertError?: string } = {}) {
  const cronInsertSingle = vi.fn().mockResolvedValue({ data: { id: "log-quote-kr" }, error: null });
  const cronInsertSelect = vi.fn().mockReturnValue({ single: cronInsertSingle });
  const cronInsert = vi.fn().mockReturnValue({ select: cronInsertSelect });
  const cronUpdateEq = vi.fn().mockResolvedValue({ error: null });
  const cronUpdate = vi.fn().mockReturnValue({ eq: cronUpdateEq });
  const quoteUpsert = vi.fn().mockResolvedValue({ error: options.upsertError ? { message: options.upsertError } : null });
  const from = vi.fn().mockImplementation((table: "cron_logs" | "quotes_daily") => {
    if (table === "cron_logs") {
      return { insert: cronInsert, update: cronUpdate };
    }

    return { upsert: quoteUpsert };
  });
  const quotaSingle = vi.fn().mockResolvedValue({ data: options.quota ?? quota(), error: null });
  const rpc = vi.fn().mockReturnValue({ single: quotaSingle });

  return { client: { from, rpc }, rpc, cronInsert, cronUpdate, quoteUpsert };
}

function createProvider(options: { quotes?: NormalizedDailyQuoteRowInput[]; fetchError?: Error } = {}) {
  const estimateQuoteRequests = vi.fn().mockReturnValue(1);
  const fetchDailyQuotes = vi.fn().mockImplementation(async () => {
    if (options.fetchError) {
      throw options.fetchError;
    }

    return options.quotes ?? [
      { symbol: "005930.KS", date: "2026-05-07", open: 76000, high: 77500, low: 75500, close: 77000, vol: 12345678 }
    ];
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

describe("quotes-kr cron route", () => {
  it("returns 401 before creating clients, loading targets, claiming quota, calling providers, or logging", async () => {
    const { createQuotesKrCronRoute } = await import("@/app/_lib/cron/quotes-kr-route");
    const createAdminClient = vi.fn();
    const prepareTargets = vi.fn();
    const provider = createProvider();
    const GET = createQuotesKrCronRoute({
      isAuthorizedRequest: () => false,
      createAdminClient,
      prepareTargets,
      quoteProvider: provider,
      day: () => "2026-05-07",
      dailyLimit: 10000
    });

    const response = await GET(new Request("http://localhost/api/cron/quotes-kr"));

    await expect(response.json()).resolves.toEqual({ error: "unauthorized" });
    expect(response.status).toBe(401);
    expect(createAdminClient).not.toHaveBeenCalled();
    expect(prepareTargets).not.toHaveBeenCalled();
    expect(provider.estimateQuoteRequests).not.toHaveBeenCalled();
    expect(provider.fetchDailyQuotes).not.toHaveBeenCalled();
  });

  it("runs authorized requests through cron logging and KR daily quote ingestion with the admin client", async () => {
    const { createQuotesKrCronRoute } = await import("@/app/_lib/cron/quotes-kr-route");
    const supabase = createRouteClient();
    const createAdminClient = vi.fn().mockReturnValue(supabase.client);
    const prepareTargets = vi.fn().mockResolvedValue({ kr: { market: "kr", targets: [samsungTarget], count: 1 } });
    const provider = createProvider();
    const GET = createQuotesKrCronRoute({
      isAuthorizedRequest: () => true,
      createAdminClient,
      prepareTargets,
      quoteProvider: provider,
      day: () => "2026-05-07",
      dailyLimit: 10000
    });

    const response = await GET(new Request("http://localhost/api/cron/quotes-kr"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({ ok: true, job: "quotes-kr", logId: "log-quote-kr" });
    expect(body.result).toMatchObject({ ok: true, market: "kr", provider: "mock-kr-quotes", upsertedCount: 1 });
    expect(createAdminClient).toHaveBeenCalledOnce();
    expect(supabase.cronInsert).toHaveBeenCalledWith({ job: "quotes-kr", status: "running" });
    expect(prepareTargets).toHaveBeenCalledOnce();
    expect(supabase.rpc).toHaveBeenCalledWith("claim_api_quota", {
      p_provider: "mock-kr-quotes",
      p_day: "2026-05-07",
      p_amount: 1,
      p_limit: 10000
    });
    expect(provider.fetchDailyQuotes).toHaveBeenCalledWith([samsungTarget], { market: "kr", day: "2026-05-07" });
    expect(supabase.quoteUpsert).toHaveBeenCalledWith(
      [{ symbol: "005930.KS", date: "2026-05-07", open: 76000, high: 77500, low: 75500, close: 77000, vol: 12345678 }],
      { onConflict: "symbol,date" }
    );
    expect(supabase.cronUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ status: "ok", err: null, finished_at: expect.any(String) })
    );
  });

  it("returns 500 with a JSON-safe failed cron envelope when ingestion fails", async () => {
    const { createQuotesKrCronRoute } = await import("@/app/_lib/cron/quotes-kr-route");
    const supabase = createRouteClient();
    const provider = createProvider({ fetchError: new Error("krx unavailable") });
    const GET = createQuotesKrCronRoute({
      isAuthorizedRequest: () => true,
      createAdminClient: () => supabase.client,
      prepareTargets: vi.fn().mockResolvedValue({ kr: { market: "kr", targets: [samsungTarget], count: 1 } }),
      quoteProvider: provider,
      day: () => "2026-05-07",
      dailyLimit: 10000
    });

    const response = await GET(new Request("http://localhost/api/cron/quotes-kr"));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toEqual({ ok: false, job: "quotes-kr", logId: "log-quote-kr", error: "krx unavailable" });
    expect(supabase.cronUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ status: "failed", err: "krx unavailable", finished_at: expect.any(String) })
    );
    expect(supabase.quoteUpsert).not.toHaveBeenCalled();
  });

  it("uses the KRX provider and documented daily quota by default when no provider is injected", async () => {
    process.env.SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_PUBLISHABLE_KEY = "publishable-key-with-length";
    process.env.SUPABASE_SECRET_KEY = "secret-key-with-length";
    process.env.CRON_SECRET = "cron-secret-with-length";
    process.env.KRX_API_KEY = "krx-key-with-length";
    process.env.FINNHUB_API_KEY = "finnhub-key-with-length";

    const { createQuotesKrCronRoute } = await import("@/app/_lib/cron/quotes-kr-route");
    const { resetServerEnvCacheForTests } = await import("@/app/_lib/env/server");
    resetServerEnvCacheForTests();

    const fetch = vi.fn().mockResolvedValue(
      Response.json({
        OutBlock_1: [
          { BAS_DD: "20260507", ISU_CD: "005930", TDD_OPNPRC: "76000", TDD_HGPRC: "77500", TDD_LWPRC: "75500", TDD_CLSPRC: "77000", ACC_TRDVOL: "12345678" }
        ]
      })
    );
    vi.stubGlobal("fetch", fetch);

    const supabase = createRouteClient();
    const prepareTargets = vi.fn().mockResolvedValue({ kr: { market: "kr", targets: [samsungTarget], count: 1 } });
    const GET = createQuotesKrCronRoute({
      isAuthorizedRequest: () => true,
      createAdminClient: () => supabase.client,
      prepareTargets,
      day: () => "2026-05-07"
    });

    const response = await GET(new Request("http://localhost/api/cron/quotes-kr"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.result).toMatchObject({ ok: true, provider: "krx-kr-quotes", requestedCount: 1, upsertedCount: 1 });
    expect(supabase.rpc).toHaveBeenCalledWith("claim_api_quota", {
      p_provider: "krx-kr-quotes",
      p_day: "2026-05-07",
      p_amount: 1,
      p_limit: 10000
    });
    expect(fetch).toHaveBeenCalledOnce();
    const [url, init] = fetch.mock.calls[0];
    expect(url).toBeInstanceOf(URL);
    expect((url as URL).toString()).toBe("https://data-dbg.krx.co.kr/svc/apis/sto/stk_bydd_trd?basDd=20260507");
    expect((url as URL).searchParams.has("AUTH_KEY")).toBe(false);
    expect(init).toEqual({ headers: { AUTH_KEY: "krx-key-with-length" } });

    vi.unstubAllGlobals();
  });
});
