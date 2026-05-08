import { describe, expect, it, vi } from "vitest";

import type { ApiQuotaClaim } from "@/app/_lib/cron/quota-claim";
import type { CronRunSupabaseClient } from "@/app/_lib/cron/run";
import type { SentimentSupabaseClient } from "@/app/_lib/cron/sentiment";
import type { SentimentProviderAdapter } from "@/app/_lib/providers/sentiment";

vi.mock("server-only", () => ({}));

type SentimentRouteClient = CronRunSupabaseClient & SentimentSupabaseClient;

function createRouteClient() {
  const cronInsertSingle = vi.fn().mockResolvedValue({ data: { id: "log-sentiment" }, error: null });
  const cronInsertSelect = vi.fn().mockReturnValue({ single: cronInsertSingle });
  const cronInsert = vi.fn().mockReturnValue({ select: cronInsertSelect });
  const cronUpdateEq = vi.fn().mockResolvedValue({ error: null });
  const cronUpdate = vi.fn().mockReturnValue({ eq: cronUpdateEq });
  const sentimentUpsert = vi.fn().mockResolvedValue({ error: null });
  const single = vi.fn().mockResolvedValue({ data: quota(), error: null });
  const rpc = vi.fn().mockReturnValue({ single });
  const from = vi.fn().mockImplementation((table: "cron_logs" | "sentiment") => {
    if (table === "cron_logs") {
      return { insert: cronInsert, update: cronUpdate };
    }

    return { upsert: sentimentUpsert };
  });

  return { client: { from, rpc } as SentimentRouteClient, rpc, cronInsert, cronUpdate, sentimentUpsert };
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

function createProvider(options: { estimate?: number; fetchError?: Error } = {}) {
  const estimateSentimentRequests = vi.fn().mockReturnValue(options.estimate ?? 1);
  const fetchSentiment = vi.fn().mockImplementation(async () => {
    if (options.fetchError) {
      throw options.fetchError;
    }

    return [{ code: "VIX", value: 18.42, band: "normal", ts: "2026-05-07T14:30:00.000Z" }];
  });

  return { provider: "mock-sentiment", estimateSentimentRequests, fetchSentiment } satisfies SentimentProviderAdapter;
}

describe("sentiment cron route", () => {
  it("rejects unauthorized requests before creating the admin client", async () => {
    const { createSentimentCronRoute } = await import("@/app/_lib/cron/sentiment-route");
    const createAdminClient = vi.fn();
    const unauthorizedResponse = vi.fn(() => Response.json({ error: "unauthorized" }, { status: 401 }));
    const GET = createSentimentCronRoute({
      isAuthorizedRequest: () => false,
      unauthorizedResponse,
      createAdminClient
    });

    const response = await GET(new Request("http://localhost/api/cron/sentiment"));

    expect(response.status).toBe(401);
    expect(createAdminClient).not.toHaveBeenCalled();
  });

  it("runs authorized requests through cron logging and sentiment ingestion with the admin client", async () => {
    const { createSentimentCronRoute } = await import("@/app/_lib/cron/sentiment-route");
    const supabase = createRouteClient();
    const provider = createProvider();
    const GET = createSentimentCronRoute({
      isAuthorizedRequest: () => true,
      createAdminClient: () => supabase.client,
      sentimentProvider: provider,
      day: () => "2026-05-07",
      dailyLimit: 86400
    });

    const response = await GET(new Request("http://localhost/api/cron/sentiment"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(supabase.cronInsert).toHaveBeenCalledWith({ job: "sentiment", status: "running" });
    expect(supabase.rpc).toHaveBeenCalledWith("claim_api_quota", {
      p_provider: "mock-sentiment",
      p_day: "2026-05-07",
      p_amount: 1,
      p_limit: 86400
    });
    expect(supabase.sentimentUpsert).toHaveBeenCalledWith(
      [{ code: "VIX", value: 18.42, band: "normal", ts: "2026-05-07T14:30:00.000Z" }],
      { onConflict: "code" }
    );
    expect(supabase.cronUpdate).toHaveBeenCalledWith(expect.objectContaining({ status: "ok", err: null }));
    expect(body.result).toMatchObject({ ok: true, provider: "mock-sentiment", requestedCount: 1, upsertedCount: 1 });
  });

  it("returns 500 with a JSON-safe failed cron envelope when ingestion fails", async () => {
    const { createSentimentCronRoute } = await import("@/app/_lib/cron/sentiment-route");
    const supabase = createRouteClient();
    const provider = createProvider({ fetchError: new Error("provider unavailable") });
    const GET = createSentimentCronRoute({
      isAuthorizedRequest: () => true,
      createAdminClient: () => supabase.client,
      sentimentProvider: provider,
      day: () => "2026-05-07",
      dailyLimit: 86400
    });

    const response = await GET(new Request("http://localhost/api/cron/sentiment"));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(supabase.cronUpdate).toHaveBeenCalledWith(expect.objectContaining({ status: "failed", err: "provider unavailable" }));
    expect(body).toMatchObject({ ok: false, job: "sentiment", error: "provider unavailable" });
  });

  it("uses the default Finnhub provider when no provider is injected", async () => {
    process.env.SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_PUBLISHABLE_KEY = "publishable-key-with-length";
    process.env.SUPABASE_SECRET_KEY = "secret-key-with-length";
    process.env.CRON_SECRET = "cron-secret-with-length";
    process.env.KRX_API_KEY = "krx-key-with-length";
    process.env.FINNHUB_API_KEY = "finnhub-key-with-length";

    const { createSentimentCronRoute } = await import("@/app/_lib/cron/sentiment-route");
    const { resetServerEnvCacheForTests } = await import("@/app/_lib/env/server");
    resetServerEnvCacheForTests();

    const fetch = vi.fn().mockResolvedValue(Response.json({ c: 18.42, t: 1778164200 }));
    vi.stubGlobal("fetch", fetch);

    const supabase = createRouteClient();
    const GET = createSentimentCronRoute({
      isAuthorizedRequest: () => true,
      createAdminClient: () => supabase.client,
      day: () => "2026-05-07"
    });

    const response = await GET(new Request("http://localhost/api/cron/sentiment"));

    expect(response.status).toBe(200);
    expect(fetch).toHaveBeenCalledWith(new URL("https://finnhub.io/api/v1/quote?symbol=%5EVIX"), {
      headers: { "X-Finnhub-Token": "finnhub-key-with-length" }
    });
    expect(supabase.sentimentUpsert).toHaveBeenCalledWith(
      [{ code: "VIX", value: 18.42, band: "normal", ts: "2026-05-07T14:30:00.000Z" }],
      { onConflict: "code" }
    );

    vi.unstubAllGlobals();
  });
});
