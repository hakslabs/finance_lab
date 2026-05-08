import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

// ── Test helpers ────────────────────────────────────────────────────────

function createEqLimitQuery(data: unknown[]) {
  return {
    select: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
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

function createOrderLimitQuery(data: unknown[]) {
  return {
    select: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnValue({ data, error: null }),
  };
}

// ── Pure function tests (no Supabase mocking needed) ───────────────────

describe("computeScore", () => {
  it("returns baseline score of 50 for neutral input", async () => {
    const { computeScore } = await import("@/app/_lib/screener/screener-data");
    const score = computeScore({ pct: null, pe: null, pb: null, roe: null });
    expect(score).toBe(50);
  });

  it("rewards strong positive momentum", async () => {
    const { computeScore } = await import("@/app/_lib/screener/screener-data");
    const score = computeScore({ pct: 5.0, pe: null, pb: null, roe: null });
    expect(score).toBe(75); // 50 + 25
  });

  it("penalizes strong negative momentum", async () => {
    const { computeScore } = await import("@/app/_lib/screener/screener-data");
    const score = computeScore({ pct: -6.0, pe: null, pb: null, roe: null });
    expect(score).toBe(40); // 50 - 10
  });

  it("rewards cheap valuation", async () => {
    const { computeScore } = await import("@/app/_lib/screener/screener-data");
    const score = computeScore({ pct: null, pe: 8, pb: 1.0, roe: null });
    expect(score).toBe(70); // 50 + 15 (cheap PE) + 5 (cheap PB)
  });

  it("penalizes expensive valuation", async () => {
    const { computeScore } = await import("@/app/_lib/screener/screener-data");
    const score = computeScore({ pct: null, pe: 50, pb: 8, roe: null });
    expect(score).toBe(35); // 50 - 10 (expensive PE) - 5 (expensive PB)
  });

  it("rewards high ROE", async () => {
    const { computeScore } = await import("@/app/_lib/screener/screener-data");
    const score = computeScore({ pct: null, pe: null, pb: null, roe: 20 });
    expect(score).toBe(55); // 50 + 5
  });

  it("clamps score between 0 and 100", async () => {
    const { computeScore } = await import("@/app/_lib/screener/screener-data");

    // Max out with all positive factors
    const high = computeScore({ pct: 6, pe: 5, pb: 0.5, roe: 30 });
    expect(high).toBeLessThanOrEqual(100);
    expect(high).toBeGreaterThanOrEqual(0);

    // All negative factors
    const low = computeScore({ pct: -10, pe: 100, pb: 20, roe: -10 });
    expect(low).toBeLessThanOrEqual(100);
    expect(low).toBeGreaterThanOrEqual(0);
  });
});

describe("applyFilters", () => {
  const baseRows = [
    { symbol: "AAPL", name: "Apple Inc.", market: "US", sector: "Technology", country: "US", px: 185.12, pct: 1.5, pe: 28.5, pb: 45.2, roe: 147.3, de: 2.1, mcapBucket: "Mega", return6m: 18.5, score: 72 },
    { symbol: "005930", name: "Samsung Electronics", market: "KOSPI", sector: "Technology", country: "KR", px: 76500, pct: 0.8, pe: 12.3, pb: 1.4, roe: 11.2, de: 0.5, mcapBucket: "Mega", return6m: -3.2, score: 63 },
    { symbol: "JPM", name: "JPMorgan Chase", market: "US", sector: "Financials", country: "US", px: 198.30, pct: -0.4, pe: 11.2, pb: 1.8, roe: 15.1, de: 10.2, mcapBucket: "Large", return6m: null, score: 55 },
    { symbol: "000660", name: "SK Hynix", market: "KOSDAQ", sector: "Technology", country: "KR", px: 184500, pct: 3.2, pe: 8.7, pb: 1.1, roe: 22.4, de: 0.3, mcapBucket: "Large", return6m: 42.1, score: 83 },
  ] as const;

  it("returns all rows when no filters are set", async () => {
    const { applyFilters } = await import("@/app/_lib/screener/screener-data");
    const result = applyFilters(baseRows, {});
    expect(result).toHaveLength(4);
  });

  it("filters by market case-insensitively", async () => {
    const { applyFilters } = await import("@/app/_lib/screener/screener-data");
    const result = applyFilters(baseRows, { market: "us" });
    expect(result).toHaveLength(2);
    expect(result.every((r) => r.market === "US")).toBe(true);
  });

  it("filters by sector case-insensitively", async () => {
    const { applyFilters } = await import("@/app/_lib/screener/screener-data");
    const result = applyFilters(baseRows, { sector: "technology" });
    expect(result).toHaveLength(3);
    expect(result.every((r) => r.sector === "Technology")).toBe(true);
  });

  it("filters by market cap bucket", async () => {
    const { applyFilters } = await import("@/app/_lib/screener/screener-data");
    const result = applyFilters(baseRows, { cap: "mega" });
    expect(result).toHaveLength(2);
    expect(result.every((r) => r.mcapBucket === "Mega")).toBe(true);
  });

  it("filters by minimum score", async () => {
    const { applyFilters } = await import("@/app/_lib/screener/screener-data");
    const result = applyFilters(baseRows, { minScore: 70 });
    expect(result).toHaveLength(2); // AAPL (72) + 000660 (83)
    expect(result.every((r) => r.score >= 70)).toBe(true);
  });

  it("combines multiple filters with AND logic", async () => {
    const { applyFilters } = await import("@/app/_lib/screener/screener-data");
    const result = applyFilters(baseRows, { sector: "technology", minScore: 65 });
    expect(result).toHaveLength(2); // AAPL (72) + 000660 (83) both match Technology and score >= 65
    expect(result[0].symbol).toBe("AAPL");
    expect(result[1].symbol).toBe("000660");
  });

  it("returns empty array for non-matching filters", async () => {
    const { applyFilters } = await import("@/app/_lib/screener/screener-data");
    const result = applyFilters(baseRows, { sector: "Healthcare" });
    expect(result).toHaveLength(0);
  });

  it("filters by valuation band (P/E derived)", async () => {
    const { applyFilters } = await import("@/app/_lib/screener/screener-data");
    const value = applyFilters(baseRows, { valuation: "value" });
    // P/E < 15: JPM (11.2), 000660 (8.7), 005930 (12.3)
    expect(value.length).toBeGreaterThanOrEqual(2);
    expect(value.every((r) => r.pe !== null && r.pe > 0 && r.pe < 15)).toBe(true);

    const expensive = applyFilters(baseRows, { valuation: "expensive" });
    // P/E >= 40: none in base data
    expect(expensive.every((r) => r.pe !== null && r.pe >= 40)).toBe(true);
  });

  it("filters by quality band (ROE derived)", async () => {
    const { applyFilters } = await import("@/app/_lib/screener/screener-data");
    const highQuality = applyFilters(baseRows, { quality: "high" });
    // ROE > 15: AAPL (147.3), 000660 (22.4)
    expect(highQuality.every((r) => r.roe !== null && r.roe > 15)).toBe(true);

    const negative = applyFilters(baseRows, { quality: "negative" });
    // ROE < 0: none in base data
    expect(negative.every((r) => r.roe !== null && r.roe < 0)).toBe(true);
  });

  it("filters by 6-month return band", async () => {
    const { applyFilters } = await import("@/app/_lib/screener/screener-data");
    const strongUp = applyFilters(baseRows, { return6m: "strong_up" });
    // return6m >= 25: 000660 (42.1)
    expect(strongUp.every((r) => r.return6m !== null && r.return6m >= 25)).toBe(true);

    const down = applyFilters(baseRows, { return6m: "down" });
    // -25 < return6m < -5: 005930 (-3.2) → actually this is flat range
    expect(down.length).toBe(0); // -3.2 is in flat range (-5 to 10)

    const withNull = applyFilters(baseRows, { return6m: "up" });
    // return6m >= 10: AAPL (18.5), 000660 (42.1); JPM (null) excluded
    expect(withNull.every((r) => r.return6m !== null && r.return6m >= 10)).toBe(true);
  });

  it("filters by quant factor (score + metric combo)", async () => {
    const { applyFilters } = await import("@/app/_lib/screener/screener-data");
    const momentum = applyFilters(baseRows, { quantFactor: "momentum" });
    // score >= 60: AAPL (72), 005930 (63), 000660 (83)
    expect(momentum.every((r) => r.score >= 60)).toBe(true);

    const valueFactor = applyFilters(baseRows, { quantFactor: "value" });
    // pe > 0 && pe < 25 && score >= 50: 005930 (pe=12.3, score=63), 000660 (pe=8.7, score=83), JPM (pe=11.2, score=55)
    expect(valueFactor.every((r) => r.pe !== null && r.pe > 0 && r.pe < 25 && r.score >= 50)).toBe(true);
  });
});

describe("paginate", () => {
  const rows = Array.from({ length: 55 }, (_, i) => ({
    symbol: `STOCK${i}`,
    name: `Stock ${i}`,
    market: "US",
    sector: "Tech",
    country: "US",
    px: 100 + i,
    pct: i * 0.1,
    pe: 15 + i,
    pb: 2 + i * 0.1,
    roe: 10 + i,
    de: 1 + i * 0.1,
    mcapBucket: "Large",
    return6m: null,
    score: 50 + i,
  }));

  it("returns first page correctly", async () => {
    const { paginate } = await import("@/app/_lib/screener/screener-data");
    const result = paginate(rows, 1, 25);

    expect(result.results).toHaveLength(25);
    expect(result.total).toBe(55);
    expect(result.page).toBe(1);
    expect(result.totalPages).toBe(3);
    expect(result.results[0].symbol).toBe("STOCK0");
  });

  it("returns second page correctly", async () => {
    const { paginate } = await import("@/app/_lib/screener/screener-data");
    const result = paginate(rows, 2, 25);

    expect(result.results).toHaveLength(25);
    expect(result.page).toBe(2);
    expect(result.results[0].symbol).toBe("STOCK25");
  });

  it("returns last page with fewer items", async () => {
    const { paginate } = await import("@/app/_lib/screener/screener-data");
    const result = paginate(rows, 3, 25);

    expect(result.results).toHaveLength(5); // 55 - 25 - 25 = 5
    expect(result.page).toBe(3);
  });

  it("clamps page to valid range", async () => {
    const { paginate } = await import("@/app/_lib/screener/screener-data");
    const overPage = paginate(rows, 99, 25);
    expect(overPage.page).toBe(3); // clamped to totalPages

    const underPage = paginate(rows, 0, 25);
    expect(underPage.page).toBe(1); // clamped to 1
  });

  it("handles empty data", async () => {
    const { paginate } = await import("@/app/_lib/screener/screener-data");
    const result = paginate([], 1, 25);

    expect(result.results).toHaveLength(0);
    expect(result.total).toBe(0);
    expect(result.totalPages).toBe(1);
  });
});

describe("parseScreenerParams", () => {
  it("parses empty params as defaults", async () => {
    const { parseScreenerParams } = await import("@/app/_lib/screener/screener-data");
    const result = parseScreenerParams(new URLSearchParams());

    expect(result.market).toBeUndefined();
    expect(result.sector).toBeUndefined();
    expect(result.cap).toBeUndefined();
    expect(result.valuation).toBeUndefined();
    expect(result.quality).toBeUndefined();
    expect(result.return6m).toBeUndefined();
    expect(result.quantFactor).toBeUndefined();
    expect(result.minScore).toBeUndefined();
    expect(result.view).toBeUndefined();
    expect(result.page).toBe(1);
    expect(result.limit).toBe(25);
  });

  it("parses all filter params", async () => {
    const { parseScreenerParams } = await import("@/app/_lib/screener/screener-data");
    const params = new URLSearchParams({
      market: "KOSPI",
      sector: "Technology",
      cap: "Mega",
      valuation: "value",
      quality: "high",
      return6m: "up",
      quantFactor: "momentum",
      minScore: "70",
      view: "heatmap",
      page: "3",
      limit: "50",
    });

    const result = parseScreenerParams(params);

    expect(result.market).toBe("KOSPI");
    expect(result.sector).toBe("Technology");
    expect(result.cap).toBe("Mega");
    expect(result.valuation).toBe("value");
    expect(result.quality).toBe("high");
    expect(result.return6m).toBe("up");
    expect(result.quantFactor).toBe("momentum");
    expect(result.minScore).toBe(70);
    expect(result.view).toBe("heatmap");
    expect(result.page).toBe(3);
    expect(result.limit).toBe(50);
  });

  it("ignores invalid numeric values gracefully", async () => {
    const { parseScreenerParams } = await import("@/app/_lib/screener/screener-data");
    const params = new URLSearchParams({
      minScore: "not-a-number",
      page: "-5",
      limit: "999",
    });

    const result = parseScreenerParams(params);

    expect(result.minScore).toBeUndefined(); // NaN → undefined
    expect(result.page).toBe(1); // negative → default
    expect(result.limit).toBe(100); // capped at 100
  });

  it("clamps limit between 1 and 100", async () => {
    const { parseScreenerParams } = await import("@/app/_lib/screener/screener-data");
    const zeroLimit = parseScreenerParams(new URLSearchParams({ limit: "0" }));
    expect(zeroLimit.limit).toBe(1); // clamped up from 0
  });
});

// ── Integration test: fetchScreenerData ─────────────────────────────────

describe("fetchScreenerData", () => {
  it("merges securities with quotes and financials into scored results", async () => {
    const securities = [
      { symbol: "AAPL", name: "Apple Inc.", country: "US", market: "US", sector: "Technology", market_cap_bucket: "Mega" },
      { symbol: "005930.KS", name: "Samsung Electronics", country: "KR", market: "KOSPI", sector: "Technology", market_cap_bucket: "Mega" },
    ];

    const quotes = [
      { symbol: "AAPL", px: 185.12, pct: 1.5 },
    ];

    const financials = [
      { symbol: "AAPL", ratios_json: { pe: 28.5, pb: 45.2, roe: 147.3, de: 2.1 } },
    ];

    const securitiesQuery = createEqLimitQuery(securities);
    const from = vi
      .fn()
      .mockReturnValueOnce(securitiesQuery)
      .mockReturnValueOnce(createLimitQuery(quotes))
      .mockReturnValueOnce(createLimitQuery(financials))
      .mockReturnValueOnce(createOrderLimitQuery([])); // quotes_daily (empty for this test)

    vi.resetModules();
    vi.doMock("@/app/_lib/supabase/public", () => ({
      createRlsSupabaseClient: () => ({ from }),
    }));

    const { fetchScreenerData } = await import("@/app/_lib/screener/screener-data");
    const result = await fetchScreenerData({ page: 1, limit: 25 });

    expect(securitiesQuery.in).toHaveBeenCalledWith("asset_class", ["equity", "etf"]);
    expect(result.total).toBe(2);
    expect(result.results).toHaveLength(2);

    // AAPL should have quote + financial data merged
    const aapl = result.results.find((r) => r.symbol === "AAPL");
    expect(aapl).toBeDefined();
    if (aapl) {
      expect(aapl.name).toBe("Apple Inc.");
      expect(aapl.px).toBe(185.12);
      expect(aapl.pct).toBe(1.5);
      expect(aapl.pe).toBe(28.5);
      expect(aapl.score).toBeGreaterThan(50); // has momentum + some valuation
    }

    // KR symbol should be normalized (005930.KS → 005930)
    const krStock = result.results.find((r) => r.symbol === "005930");
    expect(krStock).toBeDefined();
    if (krStock) {
      expect(krStock.country).toBe("KR");
      expect(krStock.market).toBe("KOSPI");
    }
  });

  it("applies filters and pagination to results", async () => {
    const securities = [
      { symbol: "AAPL", name: "Apple Inc.", country: "US", market: "US", sector: "Technology", market_cap_bucket: "Mega" },
      { symbol: "JPM", name: "JPMorgan Chase", country: "US", market: "US", sector: "Financials", market_cap_bucket: "Large" },
      { symbol: "MSFT", name: "Microsoft Corp.", country: "US", market: "US", sector: "Technology", market_cap_bucket: "Mega" },
    ];

    const quotes = [
      { symbol: "AAPL", px: 185.12, pct: 1.5 },
      { symbol: "JPM", px: 198.30, pct: -0.4 },
      { symbol: "MSFT", px: 420.50, pct: 2.3 },
    ];

    const from = vi
      .fn()
      .mockReturnValueOnce(createEqLimitQuery(securities))
      .mockReturnValueOnce(createLimitQuery(quotes))
      .mockReturnValueOnce(createLimitQuery([]))
      .mockReturnValueOnce(createOrderLimitQuery([])); // quotes_daily

    vi.resetModules();
    vi.doMock("@/app/_lib/supabase/public", () => ({
      createRlsSupabaseClient: () => ({ from }),
    }));

    const { fetchScreenerData } = await import("@/app/_lib/screener/screener-data");

    // Filter by sector=Technology, page 1, limit 2
    const result = await fetchScreenerData({ sector: "Technology", page: 1, limit: 2 });

    expect(result.total).toBe(2); // AAPL + MSFT are Technology
    expect(result.results).toHaveLength(2);
    expect(result.results.every((r) => r.sector === "Technology")).toBe(true);
  });

  it("returns empty results for non-matching filter", async () => {
    const securities = [
      { symbol: "AAPL", name: "Apple Inc.", country: "US", market: "US", sector: "Technology", market_cap_bucket: "Mega" },
    ];

    const from = vi
      .fn()
      .mockReturnValueOnce(createEqLimitQuery(securities))
      .mockReturnValueOnce(createLimitQuery([]))
      .mockReturnValueOnce(createLimitQuery([]))
      .mockReturnValueOnce(createOrderLimitQuery([])); // quotes_daily

    vi.resetModules();
    vi.doMock("@/app/_lib/supabase/public", () => ({
      createRlsSupabaseClient: () => ({ from }),
    }));

    const { fetchScreenerData } = await import("@/app/_lib/screener/screener-data");
    const result = await fetchScreenerData({ sector: "Healthcare" });

    expect(result.total).toBe(0);
    expect(result.results).toHaveLength(0);
  });
});
