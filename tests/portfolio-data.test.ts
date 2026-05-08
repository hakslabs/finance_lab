import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

function createOrderQuery(data: unknown[]) {
  return {
    select: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnValue({ data, error: null }),
  };
}

function createOrderLimitQuery(data: unknown[]) {
  return {
    select: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnValue({ data, error: null }),
  };
}

function createLimitQuery(data: unknown[]) {
  return {
    select: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnValue({ data, error: null }),
  };
}

function createInQuery(data: unknown[]) {
  return {
    select: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnValue({ data, error: null }),
  };
}

describe("buildPortfolioData", () => {
  it("returns empty state for an authenticated user with no rows", async () => {
    const { buildPortfolioData } = await import("@/app/_lib/portfolio/portfolio-data");
    const data = buildPortfolioData([], [], [], [], []);

    expect(data.status).toBe("empty");
    expect(data.authRequired).toBe(false);
    expect(data.holdings).toEqual([]);
  });

  it("shapes holdings, transactions, benchmark comparison, and totals", async () => {
    const { buildPortfolioData } = await import("@/app/_lib/portfolio/portfolio-data");
    const data = buildPortfolioData(
      [{ id: "h1", user_id: "u1", symbol: "AAPL", qty: 10, avg_px: 100, currency: "USD", updated_at: "2026-05-07T00:00:00Z" }],
      [{ id: "t1", user_id: "u1", ts: "2026-01-01T00:00:00Z", type: "buy", symbol: "AAPL", qty: 10, px: 100, fee: 10, currency: "USD" }],
      [{ symbol: "AAPL", px: 150, pct: 1.2, ts: "2026-05-07T00:00:00Z" }],
      [{ symbol: "AAPL", name: "Apple Inc.", sector: "Technology", currency: "USD" }],
      [{ code: "SP500", value: 120, change: 1, spark: [100, 110, 120], updated_at: "2026-05-07T00:00:00Z" }],
    );

    expect(data.status).toBe("ready");
    expect(data.holdings[0]).toMatchObject({ symbol: "AAPL", name: "Apple Inc.", marketValue: 1500, unrealizedPnl: 500 });
    expect(data.totalCost).toBe(1000);
    expect(data.totalMarketValue).toBe(1500);
    expect(data.returnVsBenchmark.benchmarkReturnPct).toBe(20);
    expect(data.benchmarkCode).toBe("SP500");
  });
});

describe("fetchPortfolioData", () => {
  it("uses RLS reads and returns auth-required empty state without fake user IDs", async () => {
    const from = vi
      .fn()
      .mockReturnValueOnce(createOrderQuery([]))
      .mockReturnValueOnce(createOrderLimitQuery([]))
      .mockReturnValueOnce(createLimitQuery([]))
      .mockReturnValueOnce(createInQuery([]))
      .mockReturnValueOnce(createLimitQuery([]));

    vi.resetModules();
    vi.doMock("@/app/_lib/supabase/public", () => ({ createRlsSupabaseClient: () => ({ from }) }));

    const { fetchPortfolioData } = await import("@/app/_lib/portfolio/portfolio-data");
    const data = await fetchPortfolioData();

    expect(data.status).toBe("auth-required");
    expect(data.authRequired).toBe(true);
    expect(from).toHaveBeenCalledWith("holdings");
    expect(from).toHaveBeenCalledWith("transactions");
  });
});
