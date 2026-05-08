import { describe, expect, it, vi } from "vitest";

import type { ApiQuotaClaim } from "@/app/_lib/cron/quota-claim";
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

function createRouteClient(options: { quota?: ApiQuotaClaim; upsertError?: string } = {}) {
  const cronInsertSingle = vi.fn().mockResolvedValue({ data: { id: "log-quote-us" }, error: null });
  const cronInsertSelect = vi.fn().mockReturnValue({ single: cronInsertSingle });
  const cronInsert = vi.fn().mockReturnValue({ select: cronInsertSelect });
  const cronUpdateEq = vi.fn().mockResolvedValue({ error: null });
  const cronUpdate = vi.fn().mockReturnValue({ eq: cronUpdateEq });
  const quoteUpsert = vi.fn().mockResolvedValue({ error: options.upsertError ? { message: options.upsertError } : null });
  const from = vi.fn().mockImplementation((table: "cron_logs" | "quotes") => {
    if (table === "cron_logs") {
      return { insert: cronInsert, update: cronUpdate };
    }

    return { upsert: quoteUpsert };
  });
  const quotaSingle = vi.fn().mockResolvedValue({ data: options.quota ?? quota(), error: null });
  const rpc = vi.fn().mockReturnValue({ single: quotaSingle });

  return {
    client: { from, rpc },
    from,
    rpc,
    cronInsert,
    cronUpdate,
    quoteUpsert
  };
}

function createProvider(options: { quotes?: NormalizedQuoteRowInput[]; fetchError?: Error } = {}) {
  const estimateQuoteRequests = vi.fn().mockReturnValue(1);
  const fetchQuotes = vi.fn().mockImplementation(async () => {
    if (options.fetchError) {
      throw options.fetchError;
    }

    return options.quotes ?? [{ symbol: "AAPL", px: 195.5, pct: 1.2, ts: "2026-05-07T14:30:00.000Z" }];
  });

  return { provider: "mock-us-quotes", estimateQuoteRequests, fetchQuotes } satisfies QuoteProviderAdapter;
}

function quota(overrides: Partial<ApiQuotaClaim> = {}): ApiQuotaClaim {
  return {
    provider: "mock-us-quotes",
    day: "2026-05-07",
    used: 1,
    limit: 10,
    remaining: 9,
    status: "ok",
    claimed: true,
    ...overrides
  };
}

describe("quotes-us cron route", () => {
  it("returns 401 before creating clients, loading targets, claiming quota, calling providers, or logging", async () => {
    const { createQuotesUsCronRoute } = await import("@/app/_lib/cron/quotes-us-route");
    const createAdminClient = vi.fn();
    const prepareTargets = vi.fn();
    const provider = createProvider();
    const GET = createQuotesUsCronRoute({
      isAuthorizedRequest: () => false,
      createAdminClient,
      prepareTargets,
      quoteProvider: provider,
      day: () => "2026-05-07",
      dailyLimit: 10
    });

    const response = await GET(new Request("http://localhost/api/cron/quotes-us"));

    await expect(response.json()).resolves.toEqual({ error: "unauthorized" });
    expect(response.status).toBe(401);
    expect(createAdminClient).not.toHaveBeenCalled();
    expect(prepareTargets).not.toHaveBeenCalled();
    expect(provider.estimateQuoteRequests).not.toHaveBeenCalled();
    expect(provider.fetchQuotes).not.toHaveBeenCalled();
  });

  it("runs authorized requests through cron logging and US quote ingestion with the admin client", async () => {
    const { createQuotesUsCronRoute } = await import("@/app/_lib/cron/quotes-us-route");
    const supabase = createRouteClient();
    const createAdminClient = vi.fn().mockReturnValue(supabase.client);
    const prepareTargets = vi.fn().mockResolvedValue({ us: { market: "us", targets: [appleTarget], count: 1 } });
    const provider = createProvider();
    const GET = createQuotesUsCronRoute({
      isAuthorizedRequest: () => true,
      createAdminClient,
      prepareTargets,
      quoteProvider: provider,
      day: () => "2026-05-07",
      dailyLimit: 10
    });

    const response = await GET(new Request("http://localhost/api/cron/quotes-us"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({ ok: true, job: "quotes-us", logId: "log-quote-us" });
    expect(body.result).toMatchObject({ ok: true, market: "us", provider: "mock-us-quotes", upsertedCount: 1 });
    expect(createAdminClient).toHaveBeenCalledOnce();
    expect(supabase.cronInsert).toHaveBeenCalledWith({ job: "quotes-us", status: "running" });
    expect(prepareTargets).toHaveBeenCalledOnce();
    expect(supabase.rpc).toHaveBeenCalledWith("claim_api_quota", {
      p_provider: "mock-us-quotes",
      p_day: "2026-05-07",
      p_amount: 1,
      p_limit: 10
    });
    expect(provider.fetchQuotes).toHaveBeenCalledWith([appleTarget], { market: "us", day: "2026-05-07" });
    expect(supabase.quoteUpsert).toHaveBeenCalledWith(
      [{ symbol: "AAPL", px: 195.5, pct: 1.2, ts: "2026-05-07T14:30:00.000Z" }],
      { onConflict: "symbol" }
    );
    expect(supabase.cronUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ status: "ok", err: null, finished_at: expect.any(String) })
    );
  });

  it("returns 500 with a JSON-safe failed cron envelope when ingestion fails", async () => {
    const { createQuotesUsCronRoute } = await import("@/app/_lib/cron/quotes-us-route");
    const supabase = createRouteClient();
    const provider = createProvider({ fetchError: new Error("provider unavailable") });
    const GET = createQuotesUsCronRoute({
      isAuthorizedRequest: () => true,
      createAdminClient: () => supabase.client,
      prepareTargets: vi.fn().mockResolvedValue({ us: { market: "us", targets: [appleTarget], count: 1 } }),
      quoteProvider: provider,
      day: () => "2026-05-07",
      dailyLimit: 10
    });

    const response = await GET(new Request("http://localhost/api/cron/quotes-us"));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toEqual({ ok: false, job: "quotes-us", logId: "log-quote-us", error: "provider unavailable" });
    expect(supabase.cronUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ status: "failed", err: "provider unavailable", finished_at: expect.any(String) })
    );
    expect(supabase.quoteUpsert).not.toHaveBeenCalled();
  });

  it("uses the Finnhub provider and documented daily quota by default when no provider is injected", async () => {
    process.env.SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_PUBLISHABLE_KEY = "publishable-key-with-length";
    process.env.SUPABASE_SECRET_KEY = "secret-key-with-length";
    process.env.CRON_SECRET = "cron-secret-with-length";
    process.env.KRX_API_KEY = "krx-key-with-length";
    process.env.FINNHUB_API_KEY = "finnhub-key-with-length";

    const { createQuotesUsCronRoute } = await import("@/app/_lib/cron/quotes-us-route");
    const { resetServerEnvCacheForTests } = await import("@/app/_lib/env/server");
    resetServerEnvCacheForTests();

    const fetch = vi.fn().mockResolvedValue(Response.json({ c: 195.5, dp: 1.2, t: 1778164200 }));
    vi.stubGlobal("fetch", fetch);

    const supabase = createRouteClient();
    const prepareTargets = vi.fn().mockResolvedValue({ us: { market: "us", targets: [appleTarget], count: 1 } });
    const GET = createQuotesUsCronRoute({
      isAuthorizedRequest: () => true,
      createAdminClient: () => supabase.client,
      prepareTargets,
      day: () => "2026-05-07"
    });

    const response = await GET(new Request("http://localhost/api/cron/quotes-us"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({ ok: true, job: "quotes-us", logId: "log-quote-us" });
    expect(body.result).toMatchObject({ ok: true, provider: "finnhub-us-quotes", requestedCount: 1, upsertedCount: 1 });
    expect(supabase.rpc).toHaveBeenCalledWith("claim_api_quota", {
      p_provider: "finnhub-us-quotes",
      p_day: "2026-05-07",
      p_amount: 1,
      p_limit: 86400
    });
    expect(fetch).toHaveBeenCalledOnce();
    const [url, init] = fetch.mock.calls[0];
    expect(url).toBeInstanceOf(URL);
    expect((url as URL).toString()).toBe("https://finnhub.io/api/v1/quote?symbol=AAPL");
    expect((url as URL).searchParams.has("token")).toBe(false);
    expect(init).toEqual({ headers: { "X-Finnhub-Token": "finnhub-key-with-length" } });
    expect(supabase.quoteUpsert).toHaveBeenCalledWith(
      [{ symbol: "AAPL", px: 195.5, pct: 1.2, ts: "2026-05-07T14:30:00.000Z" }],
      { onConflict: "symbol" }
    );

    vi.unstubAllGlobals();
  });
});
