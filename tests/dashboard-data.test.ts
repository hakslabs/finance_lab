import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

describe("fetchDashboardData", () => {
  it("backs KR major stocks with latest quotes_daily rows", async () => {
    const indicesQuery = createInQuery([]);
    const quotesQuery = createLimitQuery([{ symbol: "AAPL", px: 185.12, pct: 0.42 }]);
    const sentimentQuery = createSelectQuery([]);
    const newsQuery = createOrderLimitQuery([]);
    const krDailyQuery = createOrderLimitQuery([
      { symbol: "005930.KS", date: "2026-05-07", close: 76500 },
      { symbol: "005930.KS", date: "2026-05-06", close: 75400 },
      { symbol: "000660.KS", date: "2026-05-07", close: 184500 },
    ]);
    const securitiesQuery = createInQuery([
      { symbol: "AAPL", name: "Apple Inc." },
      { symbol: "005930.KS", name: "Samsung Electronics" },
      { symbol: "000660.KS", name: "SK Hynix" },
    ]);
    const from = vi
      .fn()
      .mockReturnValueOnce(indicesQuery)
      .mockReturnValueOnce(quotesQuery)
      .mockReturnValueOnce(sentimentQuery)
      .mockReturnValueOnce(newsQuery)
      .mockReturnValueOnce(krDailyQuery)
      .mockReturnValueOnce(securitiesQuery);

    vi.resetModules();
    vi.doMock("@/app/_lib/supabase/public", () => ({
      createRlsSupabaseClient: () => ({ from }),
    }));

    const { fetchDashboardData } = await import("@/app/_lib/home/dashboard-data");

    const data = await fetchDashboardData();

    expect(from).toHaveBeenCalledWith("quotes_daily");
    expect(krDailyQuery.select).toHaveBeenCalledWith("symbol,date,close");
    expect(data.usStocks).toEqual([{ symbol: "AAPL", name: "Apple Inc.", px: 185.12, pct: 0.42 }]);
    expect(data.krStocks).toEqual([
      { symbol: "005930", name: "Samsung Electronics", px: 76500, pct: null },
      { symbol: "000660", name: "SK Hynix", px: 184500, pct: null },
    ]);
  });
});

function createSelectQuery(data: unknown[]) {
  return {
    select: vi.fn().mockReturnValue({ data, error: null }),
  };
}

function createInQuery(data: unknown[]) {
  return {
    select: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnValue({ data, error: null }),
  };
}

function createLimitQuery(data: unknown[]) {
  return {
    select: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnValue({ data, error: null }),
  };
}

function createOrderLimitQuery(data: unknown[]) {
  return {
    select: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnValue({ data, error: null }),
  };
}
