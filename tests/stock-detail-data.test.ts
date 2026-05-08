import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

// ── Universal mock builder — chains any Postgrest method ─────────────────

/**
 * Creates a mock query builder that chains every Postgrest method
 * and returns the given data on .limit() or as final value.
 */
type MockQuery = Record<string, ReturnType<typeof vi.fn>>;

function createMockQuery(data: unknown[]): MockQuery {
  const chain: Record<string, ReturnType<typeof vi.fn>> = {};
  const builder = new Proxy(
    {},
    {
      get(_target, prop) {
        if (prop === "then") return undefined;
        if (!chain[prop as string]) {
          chain[prop as string] = vi.fn().mockReturnValue(builder);
        }
        return chain[prop as string];
      },
    },
  ) as MockQuery;

  // Make limit() return actual data
  chain.limit = vi.fn().mockReturnValue({ data, error: null });

  return builder;
}

describe("fetchStockDetailData", () => {
  it("returns empty fallbacks when all tables are empty", async () => {
    const from = vi
      .fn()
      .mockReturnValueOnce(createMockQuery([])) // profile
      .mockReturnValueOnce(createMockQuery([])) // quote
      .mockReturnValueOnce(createMockQuery([])) // daily
      .mockReturnValueOnce(createMockQuery([])) // financials
      .mockReturnValueOnce(createMockQuery([])) // news
      .mockReturnValueOnce(createMockQuery([])) // holdings
      .mockReturnValueOnce(createMockQuery([])); // similar

    vi.resetModules();
    vi.doMock("@/app/_lib/supabase/public", () => ({
      createRlsSupabaseClient: () => ({ from }),
    }));

    const { fetchStockDetailData } = await import("@/app/_lib/stock/stock-detail-data");

    const result = await fetchStockDetailData("AAPL");

    expect(result.profile).toBeNull();
    expect(result.quote).toBeNull();
    expect(result.dailyQuote).toBeNull();
    expect(result.financials).toEqual([]);
    expect(result.news).toEqual([]);
    expect(result.masterHoldings).toEqual([]);
    expect(result.similarStocks).toEqual([]);
  });

  it("enriches profile, quote, and daily quote when data exists", async () => {
    const profileData = [
      {
        symbol: "AAPL",
        name: "Apple Inc.",
        exchange: "NMS",
        market: null,
        sector: "Technology",
        industry: "Consumer Electronics",
        country: "United States",
        currency: "USD",
        website: "https://www.apple.com",
      },
    ];
    const quoteData = [{ symbol: "AAPL", px: 185.42, pct: 1.23, ts: "2026-05-07T14:30:00Z" }];
    const dailyData = [
      { symbol: "AAPL", date: "2026-05-07", open: 183.5, high: 186.1, low: 182.9, close: 185.4, vol: 52430000 },
    ];

    const from = vi
      .fn()
      .mockReturnValueOnce(createMockQuery(profileData))
      .mockReturnValueOnce(createMockQuery(quoteData))
      .mockReturnValueOnce(createMockQuery(dailyData))
      .mockReturnValueOnce(createMockQuery([])) // financials
      .mockReturnValueOnce(createMockQuery([])) // news
      .mockReturnValueOnce(createMockQuery([])) // holdings
      .mockReturnValueOnce(createMockQuery([])); // similar

    vi.resetModules();
    vi.doMock("@/app/_lib/supabase/public", () => ({
      createRlsSupabaseClient: () => ({ from }),
    }));

    const { fetchStockDetailData } = await import("@/app/_lib/stock/stock-detail-data");

    const result = await fetchStockDetailData("AAPL");

    expect(result.profile).not.toBeNull();
    expect(result.profile?.symbol).toBe("AAPL");
    expect(result.profile?.name).toBe("Apple Inc.");
    expect(result.profile?.sector).toBe("Technology");
    expect(result.profile?.exchange).toBe("NMS");

    expect(result.quote).not.toBeNull();
    expect(result.quote?.px).toBe(185.42);
    expect(result.quote?.pct).toBe(1.23);

    expect(result.dailyQuote).not.toBeNull();
    expect(result.dailyQuote?.close).toBe(185.4);
    expect(result.dailyQuote?.open).toBe(183.5);
  });

  it("normalizes ticker to uppercase before querying", async () => {
    const from = vi.fn().mockImplementation(() => createMockQuery([]));

    vi.resetModules();
    vi.doMock("@/app/_lib/supabase/public", () => ({
      createRlsSupabaseClient: () => ({ from }),
    }));

    const { fetchStockDetailData } = await import("@/app/_lib/stock/stock-detail-data");

    // Should not throw for lowercase input
    const result = await fetchStockDetailData("aapl");

    expect(result).toBeDefined();
    // from should have been called 7 times (once per table)
    expect(from).toHaveBeenCalledTimes(7);
  });

  it("queries bare and suffixed candidates for Korean stock routes", async () => {
    const profileQuery = createMockQuery([]);
    const quoteQuery = createMockQuery([]);
    const dailyQuery = createMockQuery([]);
    const financialsQuery = createMockQuery([]);
    const newsQuery = createMockQuery([]);
    const holdingsQuery = createMockQuery([]);
    const similarQuery = createMockQuery([]);
    const from = vi
      .fn()
      .mockReturnValueOnce(profileQuery)
      .mockReturnValueOnce(quoteQuery)
      .mockReturnValueOnce(dailyQuery)
      .mockReturnValueOnce(financialsQuery)
      .mockReturnValueOnce(newsQuery)
      .mockReturnValueOnce(holdingsQuery)
      .mockReturnValueOnce(similarQuery);

    vi.resetModules();
    vi.doMock("@/app/_lib/supabase/public", () => ({
      createRlsSupabaseClient: () => ({ from }),
    }));

    const { fetchStockDetailData } = await import("@/app/_lib/stock/stock-detail-data");

    await fetchStockDetailData("005930");

    expect(profileQuery.in).toHaveBeenCalledWith("symbol", ["005930", "005930.KS", "005930.KQ"]);
    expect(quoteQuery.in).toHaveBeenCalledWith("symbol", ["005930", "005930.KS", "005930.KQ"]);
    expect(dailyQuery.in).toHaveBeenCalledWith("symbol", ["005930", "005930.KS", "005930.KQ"]);
    expect(newsQuery.overlaps).toHaveBeenCalledWith("tickers", ["005930", "005930.KS", "005930.KQ"]);
  });

  it("filters similar stocks by sector and excludes self", async () => {
    const profileData = [
      {
        symbol: "AAPL",
        name: "Apple Inc.",
        exchange: "NMS",
        market: null,
        sector: "Technology",
        industry: "Consumer Electronics",
        country: "United States",
        currency: "USD",
        website: null,
      },
    ];
    const allSimilar = [
      { symbol: "AAPL", name: "Apple Inc.", sector: "Technology", exchange: "NMS" },
      { symbol: "MSFT", name: "Microsoft Corp.", sector: "Technology", exchange: "NMS" },
      { symbol: "GOOGL", name: "Alphabet Inc.", sector: "Technology", exchange: "NMS" },
      { symbol: "JPM", name: "JPMorgan Chase", sector: "Financials", exchange: "NYQ" },
    ];

    const from = vi
      .fn()
      .mockReturnValueOnce(createMockQuery(profileData))
      .mockReturnValueOnce(createMockQuery([])) // quote
      .mockReturnValueOnce(createMockQuery([])) // daily
      .mockReturnValueOnce(createMockQuery([])) // financials
      .mockReturnValueOnce(createMockQuery([])) // news
      .mockReturnValueOnce(createMockQuery([])) // holdings
      .mockReturnValueOnce(createMockQuery(allSimilar)); // similar

    vi.resetModules();
    vi.doMock("@/app/_lib/supabase/public", () => ({
      createRlsSupabaseClient: () => ({ from }),
    }));

    const { fetchStockDetailData } = await import("@/app/_lib/stock/stock-detail-data");

    const result = await fetchStockDetailData("AAPL");

    // Should exclude AAPL itself and non-Technology stocks
    expect(result.similarStocks).toHaveLength(2);
    const symbols = result.similarStocks.map((s) => s.symbol);
    expect(symbols).toContain("MSFT");
    expect(symbols).toContain("GOOGL");
    expect(symbols).not.toContain("AAPL");
    expect(symbols).not.toContain("JPM");
  });

  it("returns news items that mention the ticker", async () => {
    const newsData = [
      {
        id: "n1",
        src: "reuters",
        title: "Apple reports strong earnings",
        url: "https://example.com/aapl",
        summary: "Apple beat expectations.",
        sentiment: 0.3,
        published_at: "2026-05-06T10:00:00Z",
      },
      {
        id: "n2",
        src: "bloomberg",
        title: "Tech sector overview",
        url: "https://example.com/tech",
        summary: "Tech stocks rally.",
        sentiment: 0.1,
        published_at: "2026-05-05T08:00:00Z",
      },
    ];

    const from = vi
      .fn()
      .mockReturnValueOnce(createMockQuery([])) // profile
      .mockReturnValueOnce(createMockQuery([])) // quote
      .mockReturnValueOnce(createMockQuery([])) // daily
      .mockReturnValueOnce(createMockQuery([])) // financials
      .mockReturnValueOnce(createMockQuery(newsData)) // news
      .mockReturnValueOnce(createMockQuery([])) // holdings
      .mockReturnValueOnce(createMockQuery([])); // similar

    vi.resetModules();
    vi.doMock("@/app/_lib/supabase/public", () => ({
      createRlsSupabaseClient: () => ({ from }),
    }));

    const { fetchStockDetailData } = await import("@/app/_lib/stock/stock-detail-data");

    const result = await fetchStockDetailData("AAPL");

    expect(result.news).toHaveLength(2);
    expect(result.news[0].title).toContain("Apple");
    expect(from).toHaveBeenCalledWith("news");
  });
});

describe("STOCK_DETAIL_TABS and TAB_LABELS", () => {
  it("exports exactly 8 tabs", async () => {
    vi.resetModules();
    const { STOCK_DETAIL_TABS, TAB_LABELS } = await import("@/app/_lib/stock/stock-detail-data");

    expect(STOCK_DETAIL_TABS).toHaveLength(8);
    expect(Object.keys(TAB_LABELS)).toHaveLength(8);
  });

  it("contains the required tab IDs in correct order", async () => {
    vi.resetModules();
    const { STOCK_DETAIL_TABS } = await import("@/app/_lib/stock/stock-detail-data");

    const expected = ["overview", "chart", "financials", "valuation", "filings", "news", "flow", "target"];
    expect([...STOCK_DETAIL_TABS]).toEqual(expected);
  });

  it("each tab has a non-empty label", async () => {
    vi.resetModules();
    const { STOCK_DETAIL_TABS, TAB_LABELS } = await import("@/app/_lib/stock/stock-detail-data");

    for (const tabId of STOCK_DETAIL_TABS) {
      expect(TAB_LABELS[tabId]).toBeTruthy();
      expect(typeof TAB_LABELS[tabId]).toBe("string");
      expect(TAB_LABELS[tabId].length).toBeGreaterThan(0);
    }
  });
});
