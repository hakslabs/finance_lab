import { describe, expect, it, vi } from "vitest";

import type { ApiQuotaClaim } from "@/app/_lib/cron/quota-claim";
import type { IndexProviderAdapter, NormalizedIndexRowInput } from "@/app/_lib/providers/indices";

vi.mock("server-only", () => ({}));

function createRouteClient(options: { quota?: ApiQuotaClaim; sparks?: Record<string, number[]>; upsertError?: string } = {}) {
  const cronInsertSingle = vi.fn().mockResolvedValue({ data: { id: "log-indices" }, error: null });
  const cronInsertSelect = vi.fn().mockReturnValue({ single: cronInsertSingle });
  const cronInsert = vi.fn().mockReturnValue({ select: cronInsertSelect });
  const cronUpdateEq = vi.fn().mockResolvedValue({ error: null });
  const cronUpdate = vi.fn().mockReturnValue({ eq: cronUpdateEq });
  const indicesIn = vi.fn().mockResolvedValue({
    data: Object.entries(options.sparks ?? {}).map(([code, spark]) => ({ code, spark })),
    error: null
  });
  const indicesSelect = vi.fn().mockReturnValue({ in: indicesIn });
  const indicesUpsert = vi.fn().mockResolvedValue({ error: options.upsertError ? { message: options.upsertError } : null });
  const from = vi.fn().mockImplementation((table: "cron_logs" | "indices") => {
    if (table === "cron_logs") {
      return { insert: cronInsert, update: cronUpdate };
    }

    return { select: indicesSelect, upsert: indicesUpsert };
  });
  const quotaSingle = vi.fn().mockResolvedValue({ data: options.quota ?? quota(), error: null });
  const rpc = vi.fn().mockReturnValue({ single: quotaSingle });

  return { client: { from, rpc }, rpc, cronInsert, cronUpdate, indicesIn, indicesUpsert };
}

function createProvider(options: { rows?: NormalizedIndexRowInput[]; fetchError?: Error } = {}) {
  const estimateIndexRequests = vi.fn().mockReturnValue(6);
  const fetchIndices = vi.fn().mockImplementation(async () => {
    if (options.fetchError) {
      throw options.fetchError;
    }

    return options.rows ?? [{ code: "SP500", value: 5325.67, change: 0.42, updated_at: "2026-05-07T14:30:00.000Z" }];
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

describe("indices cron route", () => {
  it("returns 401 before creating clients, claiming quota, calling providers, or logging", async () => {
    const { createIndicesCronRoute } = await import("@/app/_lib/cron/indices-route");
    const createAdminClient = vi.fn();
    const provider = createProvider();
    const GET = createIndicesCronRoute({
      isAuthorizedRequest: () => false,
      createAdminClient,
      indexProvider: provider,
      day: () => "2026-05-07",
      dailyLimit: 10000
    });

    const response = await GET(new Request("http://localhost/api/cron/indices"));

    await expect(response.json()).resolves.toEqual({ error: "unauthorized" });
    expect(response.status).toBe(401);
    expect(createAdminClient).not.toHaveBeenCalled();
    expect(provider.estimateIndexRequests).not.toHaveBeenCalled();
    expect(provider.fetchIndices).not.toHaveBeenCalled();
  });

  it("runs authorized requests through cron logging and index ingestion with the admin client", async () => {
    const { createIndicesCronRoute } = await import("@/app/_lib/cron/indices-route");
    const supabase = createRouteClient({ sparks: { SP500: [5310] } });
    const createAdminClient = vi.fn().mockReturnValue(supabase.client);
    const provider = createProvider();
    const GET = createIndicesCronRoute({
      isAuthorizedRequest: () => true,
      createAdminClient,
      indexProvider: provider,
      day: () => "2026-05-07",
      dailyLimit: 10000
    });

    const response = await GET(new Request("http://localhost/api/cron/indices"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({ ok: true, job: "indices", logId: "log-indices" });
    expect(body.result).toMatchObject({ ok: true, provider: "mock-indices", targetCount: 6, requestedCount: 6, upsertedCount: 1 });
    expect(createAdminClient).toHaveBeenCalledOnce();
    expect(supabase.cronInsert).toHaveBeenCalledWith({ job: "indices", status: "running" });
    expect(supabase.rpc).toHaveBeenCalledWith("claim_api_quota", {
      p_provider: "mock-indices",
      p_day: "2026-05-07",
      p_amount: 6,
      p_limit: 10000
    });
    expect(provider.fetchIndices).toHaveBeenCalledWith({ day: "2026-05-07" });
    expect(supabase.indicesUpsert).toHaveBeenCalledWith(
      [{ code: "SP500", value: 5325.67, change: 0.42, updated_at: "2026-05-07T14:30:00.000Z", spark: [5310, 5325.67] }],
      { onConflict: "code" }
    );
    expect(supabase.cronUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ status: "ok", err: null, finished_at: expect.any(String) })
    );
  });

  it("returns 500 with a JSON-safe failed cron envelope when ingestion fails", async () => {
    const { createIndicesCronRoute } = await import("@/app/_lib/cron/indices-route");
    const supabase = createRouteClient();
    const provider = createProvider({ fetchError: new Error("provider unavailable") });
    const GET = createIndicesCronRoute({
      isAuthorizedRequest: () => true,
      createAdminClient: () => supabase.client,
      indexProvider: provider,
      day: () => "2026-05-07",
      dailyLimit: 10000
    });

    const response = await GET(new Request("http://localhost/api/cron/indices"));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toEqual({ ok: false, job: "indices", logId: "log-indices", error: "provider unavailable" });
    expect(supabase.cronUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ status: "failed", err: "provider unavailable", finished_at: expect.any(String) })
    );
    expect(supabase.indicesUpsert).not.toHaveBeenCalled();
  });

  it("uses the mixed provider and documented daily quota by default when no provider is injected", async () => {
    process.env.SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_PUBLISHABLE_KEY = "publishable-key-with-length";
    process.env.SUPABASE_SECRET_KEY = "secret-key-with-length";
    process.env.CRON_SECRET = "cron-secret-with-length";
    process.env.KRX_API_KEY = "krx-key-with-length";
    process.env.FINNHUB_API_KEY = "finnhub-key-with-length";

    const { createIndicesCronRoute } = await import("@/app/_lib/cron/indices-route");
    const { resetServerEnvCacheForTests } = await import("@/app/_lib/env/server");
    resetServerEnvCacheForTests();

    const fetch = vi
      .fn()
      .mockResolvedValueOnce(Response.json({ c: 5325.67, d: 22.34, t: 1778164200 }))
      .mockResolvedValueOnce(Response.json({ c: 16800.25, d: -33.7, t: 1778164200 }))
      .mockResolvedValueOnce(Response.json({ c: 39100.11, d: 58.4, t: 1778164200 }))
      .mockResolvedValueOnce(Response.json({ result: { trdPrc: "2670.65", cmpprevddPrc: "11.66", cmpprevddTpCd: "2", trdTm: "14191000" } }))
      .mockResolvedValueOnce(Response.json({ result: { trdPrc: "850.20", cmpprevddPrc: "3.11", cmpprevddTpCd: "5", trdTm: "14191000" } }))
      .mockResolvedValueOnce(Response.json({ result: { trdPrc: "365.12", cmpprevddPrc: "0", cmpprevddTpCd: "3", trdTm: "14191000" } }));
    vi.stubGlobal("fetch", fetch);

    const supabase = createRouteClient();
    const GET = createIndicesCronRoute({
      isAuthorizedRequest: () => true,
      createAdminClient: () => supabase.client,
      day: () => "2026-05-07"
    });

    const response = await GET(new Request("http://localhost/api/cron/indices"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.result).toMatchObject({ ok: true, provider: "finnhub-koscom-indices", requestedCount: 6, upsertedCount: 6 });
    expect(supabase.rpc).toHaveBeenCalledWith("claim_api_quota", {
      p_provider: "finnhub-koscom-indices",
      p_day: "2026-05-07",
      p_amount: 6,
      p_limit: 10000
    });
    expect(fetch).toHaveBeenCalledTimes(6);

    vi.unstubAllGlobals();
  });

  it("uses the Asia/Seoul day for default provider timestamps", async () => {
    process.env.SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_PUBLISHABLE_KEY = "publishable-key-with-length";
    process.env.SUPABASE_SECRET_KEY = "secret-key-with-length";
    process.env.CRON_SECRET = "cron-secret-with-length";
    process.env.KRX_API_KEY = "krx-key-with-length";
    process.env.FINNHUB_API_KEY = "finnhub-key-with-length";

    const { createIndicesCronRoute } = await import("@/app/_lib/cron/indices-route");
    const { resetServerEnvCacheForTests } = await import("@/app/_lib/env/server");
    resetServerEnvCacheForTests();

    const originalDate = globalThis.Date;
    const fixedNow = new originalDate("2026-05-07T16:30:00.000Z");
    class FixedDate extends originalDate {
      constructor(value?: string | number | Date) {
        super(value ?? fixedNow);
      }

      static now() {
        return fixedNow.getTime();
      }
    }
    vi.stubGlobal("Date", FixedDate);

    const fetch = vi
      .fn()
      .mockResolvedValueOnce(Response.json({ c: 5325.67, d: 22.34, t: 1778164200 }))
      .mockResolvedValueOnce(Response.json({ c: 16800.25, d: -33.7, t: 1778164200 }))
      .mockResolvedValueOnce(Response.json({ c: 39100.11, d: 58.4, t: 1778164200 }))
      .mockResolvedValueOnce(Response.json({ result: { trdPrc: "2670.65", cmpprevddPrc: "11.66", cmpprevddTpCd: "2", trdTm: "010000" } }))
      .mockResolvedValueOnce(Response.json({ result: { trdPrc: "850.20", cmpprevddPrc: "3.11", cmpprevddTpCd: "5", trdTm: "010000" } }))
      .mockResolvedValueOnce(Response.json({ result: { trdPrc: "365.12", cmpprevddPrc: "0", cmpprevddTpCd: "3", trdTm: "010000" } }));
    vi.stubGlobal("fetch", fetch);

    const supabase = createRouteClient();
    const GET = createIndicesCronRoute({
      isAuthorizedRequest: () => true,
      createAdminClient: () => supabase.client
    });

    const response = await GET(new Request("http://localhost/api/cron/indices"));

    expect(response.status).toBe(200);
    expect(supabase.indicesUpsert).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ code: "KOSPI", updated_at: "2026-05-07T16:00:00.000Z" })
      ]),
      { onConflict: "code" }
    );

    vi.unstubAllGlobals();
  });
});
