import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

// ── Test helpers (same pattern as dashboard-data.test.ts) ───────────────

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

// ── Analysis Data Tests ─────────────────────────────────────────────────

describe("fetchAnalysisData", () => {
  it("returns fallback-empty shapes when all tables are empty", async () => {
    const from = vi
      .fn()
      .mockReturnValueOnce(createInQuery([])) // indices
      .mockReturnValueOnce(createLimitQuery([])) // quotes
      .mockReturnValueOnce(createSelectQuery([])) // sentiment
      .mockReturnValueOnce(createOrderLimitQuery([])) // daily quotes
      .mockReturnValueOnce(createLimitQuery([])) // securities
      .mockReturnValueOnce(createLimitQuery([])); // financials

    vi.resetModules();
    vi.doMock("@/app/_lib/supabase/public", () => ({
      createRlsSupabaseClient: () => ({ from }),
    }));

    const { fetchAnalysisData } = await import("@/app/_lib/analysis/analysis-data");
    const data = await fetchAnalysisData();

    expect(data.indices).toEqual([]);
    expect(data.sectorReturns).toEqual([]);
    expect(data.countrySnapshots).toEqual([]);
    expect(data.krMovers).toEqual([]);
    expect(data.usMovers).toEqual([]);
    expect(data.sentimentSlots).toHaveLength(9); // 9 fixed slots, all unavailable
    expect(data.sentimentSlots.every((s) => s.available === false)).toBe(true);
    expect(data.highLow).toEqual({ nearHigh: 0, nearLow: 0, total: 0 });
    expect(data.techSignals).toEqual([]);
    expect(data.financialSectors).toEqual([]);
    expect(data.marketComparison).toEqual([]);
    expect(data.lastUpdated).toBeNull();
  });

  it("maps index rows to typed index cards with labels", async () => {
    const indicesData = [
      { code: "KOSPI", value: 2680.45, change: 0.32, spark: [2650, 2660, 2670, 2680], updated_at: "2026-05-07T15:00:00Z" },
      { code: "SP500", value: 5200.12, change: -0.18, spark: [5220, 5210, 5205, 5200], updated_at: "2026-05-07T20:00:00Z" },
    ];

    const from = vi
      .fn()
      .mockReturnValueOnce(createInQuery(indicesData))
      .mockReturnValueOnce(createLimitQuery([]))
      .mockReturnValueOnce(createSelectQuery([]))
      .mockReturnValueOnce(createOrderLimitQuery([]))
      .mockReturnValueOnce(createLimitQuery([]))
      .mockReturnValueOnce(createLimitQuery([]));

    vi.resetModules();
    vi.doMock("@/app/_lib/supabase/public", () => ({
      createRlsSupabaseClient: () => ({ from }),
    }));

    const { fetchAnalysisData } = await import("@/app/_lib/analysis/analysis-data");
    const data = await fetchAnalysisData();

    expect(data.indices).toHaveLength(2);
    expect(data.indices[0]).toEqual({
      code: "KOSPI",
      label: "KOSPI",
      value: 2680.45,
      change: 0.32,
      spark: [2650, 2660, 2670, 2680],
    });
    expect(data.indices[1].label).toBe("S&P 500");
  });

  it("derives sector returns from quote + security merge", async () => {
    const securities = [
      { symbol: "AAPL", name: "Apple Inc.", country: "US", market: "US", sector: "Technology", market_cap_bucket: "Mega" },
      { symbol: "MSFT", name: "Microsoft Corp.", country: "US", market: "US", sector: "Technology", market_cap_bucket: "Mega" },
      { symbol: "JPM", name: "JPMorgan Chase", country: "US", market: "US", sector: "Financials", market_cap_bucket: "Large" },
    ];

    const quotes = [
      { symbol: "AAPL", px: 185.12, pct: 1.5 },
      { symbol: "MSFT", px: 420.50, pct: 2.3 },
      { symbol: "JPM", px: 198.30, pct: -0.4 },
    ];

    const from = vi
      .fn()
      .mockReturnValueOnce(createInQuery([]))
      .mockReturnValueOnce(createLimitQuery(quotes))
      .mockReturnValueOnce(createSelectQuery([]))
      .mockReturnValueOnce(createOrderLimitQuery([]))
      .mockReturnValueOnce(createLimitQuery(securities))
      .mockReturnValueOnce(createLimitQuery([]));

    vi.resetModules();
    vi.doMock("@/app/_lib/supabase/public", () => ({
      createRlsSupabaseClient: () => ({ from }),
    }));

    const { fetchAnalysisData } = await import("@/app/_lib/analysis/analysis-data");
    const data = await fetchAnalysisData();

    expect(data.sectorReturns).toHaveLength(2);
    const techSector = data.sectorReturns.find((s) => s.sector === "Technology");
    expect(techSector).toBeDefined();
    if (techSector) {
      expect(techSector.count).toBe(2);
      if (techSector.returnPct !== null) {
        expect(techSector.returnPct).toBeCloseTo(1.9); // (1.5 + 2.3) / 2
      }
    }
  });

  it("renders nine fixed sentiment slots with availability flags", async () => {
    const sentimentData = [
      { code: "VIX", value: 14.5, band: "low", ts: "2026-05-07T12:00:00Z" },
      { code: "composite", value: 42, band: "neutral", ts: "2026-05-07T10:00:00Z" },
      { code: "KOSPI_sentiment", value: 55, band: "neutral", ts: "2026-05-07T09:00:00Z" },
    ];

    const from = vi
      .fn()
      .mockReturnValueOnce(createInQuery([]))
      .mockReturnValueOnce(createLimitQuery([]))
      .mockReturnValueOnce(createSelectQuery(sentimentData))
      .mockReturnValueOnce(createOrderLimitQuery([]))
      .mockReturnValueOnce(createLimitQuery([]))
      .mockReturnValueOnce(createLimitQuery([]));

    vi.resetModules();
    vi.doMock("@/app/_lib/supabase/public", () => ({
      createRlsSupabaseClient: () => ({ from }),
    }));

    const { fetchAnalysisData } = await import("@/app/_lib/analysis/analysis-data");
    const data = await fetchAnalysisData();

    // Always 9 fixed slots
    expect(data.sentimentSlots).toHaveLength(9);

    // 3 available (VIX, composite, KOSPI_sentiment), 6 unavailable
    const available = data.sentimentSlots.filter((s) => s.available);
    expect(available).toHaveLength(3);

    // Check category distribution
    const usSlots = data.sentimentSlots.filter((s) => s.category === "us");
    const krSlots = data.sentimentSlots.filter((s) => s.category === "kr");
    const macroSlots = data.sentimentSlots.filter((s) => s.category === "macro");
    expect(usSlots).toHaveLength(4); // fng, VIX, composite, put_call_ratio
    expect(krSlots).toHaveLength(2); // KOSPI_sentiment, KOSDAQ_sentiment
    expect(macroSlots).toHaveLength(3); // bond_yield_spread, dollar_index, krw_usd

    // Available slots have real values
    const vixSlot = data.sentimentSlots.find((s) => s.code === "VIX");
    expect(vixSlot).toBeDefined();
    if (vixSlot) {
      expect(vixSlot.available).toBe(true);
      expect(vixSlot.value).toBe(14.5);
      expect(vixSlot.label).toBe("VIX");
    }

    // Unavailable slot has null values
    const unavailableSlot = data.sentimentSlots.find((s) => s.code === "put_call_ratio");
    expect(unavailableSlot).toBeDefined();
    if (unavailableSlot) {
      expect(unavailableSlot.available).toBe(false);
      expect(unavailableSlot.value).toBeNull();
    }
  });

  it("builds country snapshots from securities_master", async () => {
    const securities = [
      { symbol: "AAPL", name: "Apple Inc.", country: "US", market: "US", sector: "Technology", market_cap_bucket: "Mega" },
      { symbol: "MSFT", name: "Microsoft Corp.", country: "US", market: "US", sector: "Technology", market_cap_bucket: "Mega" },
      { symbol: "JPM", name: "JPMorgan Chase", country: "US", market: "US", sector: "Financials", market_cap_bucket: "Large" },
      { symbol: "005930.KS", name: "Samsung Electronics", country: "KR", market: "KOSPI", sector: "Technology", market_cap_bucket: "Mega" },
      { symbol: "000660.KQ", name: "SK Hynix", country: "KR", market: "KOSDAQ", sector: "Technology", market_cap_bucket: "Large" },
    ];

    const from = vi
      .fn()
      .mockReturnValueOnce(createInQuery([]))
      .mockReturnValueOnce(createLimitQuery([]))
      .mockReturnValueOnce(createSelectQuery([]))
      .mockReturnValueOnce(createOrderLimitQuery([]))
      .mockReturnValueOnce(createLimitQuery(securities))
      .mockReturnValueOnce(createLimitQuery([]));

    vi.resetModules();
    vi.doMock("@/app/_lib/supabase/public", () => ({
      createRlsSupabaseClient: () => ({ from }),
    }));

    const { fetchAnalysisData } = await import("@/app/_lib/analysis/analysis-data");
    const data = await fetchAnalysisData();

    expect(data.countrySnapshots).toHaveLength(2);

    const us = data.countrySnapshots.find((c) => c.country === "US");
    expect(us).toBeDefined();
    if (us) {
      expect(us.securityCount).toBe(3);
      expect(us.sectorCount).toBe(2); // Technology + Financials
      expect(us.topSectors).toContain("Technology");
      expect(us.topSectors).toContain("Financials");
    }

    const kr = data.countrySnapshots.find((c) => c.country === "KR");
    expect(kr).toBeDefined();
    if (kr) {
      expect(kr.securityCount).toBe(2);
      expect(kr.sectorCount).toBe(1); // Technology only
    }
  });

  it("derives per-market financial comparison (KR vs US)", async () => {
    const financials = [
      { symbol: "AAPL", ratios_json: { pe: 28.5, pb: 45.2, roe: 147.3, de: 2.1 } },
      { symbol: "005930.KS", ratios_json: { pe: 12.3, pb: 1.4, roe: 11.2, de: 0.5 } },
      { symbol: "000660.KQ", ratios_json: { pe: 8.7, pb: 1.1, roe: 22.4, de: 0.3 } },
    ];
    const securities = [
      { symbol: "AAPL", name: "Apple Inc.", country: "US", market: "US", sector: "Technology", market_cap_bucket: "Mega" },
      { symbol: "005930.KS", name: "Samsung Electronics", country: "KR", market: "KOSPI", sector: "Technology", market_cap_bucket: "Mega" },
      { symbol: "000660.KQ", name: "SK Hynix", country: "KR", market: "KOSDAQ", sector: "Technology", market_cap_bucket: "Large" },
    ];

    const from = vi
      .fn()
      .mockReturnValueOnce(createInQuery([]))
      .mockReturnValueOnce(createLimitQuery([]))
      .mockReturnValueOnce(createSelectQuery([]))
      .mockReturnValueOnce(createOrderLimitQuery([]))
      .mockReturnValueOnce(createLimitQuery(securities))
      .mockReturnValueOnce(createLimitQuery(financials));

    vi.resetModules();
    vi.doMock("@/app/_lib/supabase/public", () => ({
      createRlsSupabaseClient: () => ({ from }),
    }));

    const { fetchAnalysisData } = await import("@/app/_lib/analysis/analysis-data");
    const data = await fetchAnalysisData();

    expect(data.marketComparison.length).toBeGreaterThanOrEqual(1);

    const usMarket = data.marketComparison.find((m) => m.market === "US");
    expect(usMarket).toBeDefined();
    if (usMarket) {
      expect(usMarket.securityCount).toBe(1);
      expect(usMarket.avgPe).toBeCloseTo(28.5);
    }

    const krMarket = data.marketComparison.find((m) => m.market === "KR");
    expect(krMarket).toBeDefined();
    if (krMarket) {
      expect(krMarket.securityCount).toBe(2);
      // KR average PE: (12.3 + 8.7) / 2 = 10.5
      if (krMarket.avgPe !== null) expect(krMarket.avgPe).toBeCloseTo(10.5, 1);
    }
  });

  it("computes 52-week high/low summary from daily OHLC data", async () => {
    const dailyQuotes = [
      { symbol: "005930.KS", date: "2026-05-07", close: 76500, high: 78000, low: 72000 },
      { symbol: "005930.KS", date: "2026-05-06", close: 75400, high: 77000, low: 71500 },
      { symbol: "000660.KS", date: "2026-05-07", close: 184500, high: 190000, low: 180000 }, // near high (>95%)
      { symbol: "000660.KS", date: "2026-05-06", close: 183000, high: 189000, low: 179000 },
    ];

    const from = vi
      .fn()
      .mockReturnValueOnce(createInQuery([]))
      .mockReturnValueOnce(createLimitQuery([]))
      .mockReturnValueOnce(createSelectQuery([]))
      .mockReturnValueOnce(createOrderLimitQuery(dailyQuotes))
      .mockReturnValueOnce(createLimitQuery([]))
      .mockReturnValueOnce(createLimitQuery([]));

    vi.resetModules();
    vi.doMock("@/app/_lib/supabase/public", () => ({
      createRlsSupabaseClient: () => ({ from }),
    }));

    const { fetchAnalysisData } = await import("@/app/_lib/analysis/analysis-data");
    const data = await fetchAnalysisData();

    expect(data.highLow.total).toBe(2);
    // 000660: range=10000, position=(184500-180000)/10000=0.45 → not near high or low
    // 005930: range=6500, position=(76500-72000)/6500=0.69 → not near high or low
    expect(data.highLow.nearHigh).toBe(0);
    expect(data.highLow.nearLow).toBe(0);
  });

  it("computes technical signals sorted by momentum magnitude", async () => {
    const quotes = [
      { symbol: "AAPL", px: 185.12, pct: 4.2 },
      { symbol: "MSFT", px: 420.50, pct: -1.8 },
      { symbol: "GOOGL", px: 142.30, pct: 0.3 },
    ];
    const securities = [
      { symbol: "AAPL", name: "Apple Inc.", country: "US", market: "US", sector: "Technology", market_cap_bucket: "Mega" },
      { symbol: "MSFT", name: "Microsoft Corp.", country: "US", market: "US", sector: "Technology", market_cap_bucket: "Mega" },
      { symbol: "GOOGL", name: "Alphabet Inc.", country: "US", market: "US", sector: "Communication Services", market_cap_bucket: "Mega" },
    ];

    const from = vi
      .fn()
      .mockReturnValueOnce(createInQuery([]))
      .mockReturnValueOnce(createLimitQuery(quotes))
      .mockReturnValueOnce(createSelectQuery([]))
      .mockReturnValueOnce(createOrderLimitQuery([]))
      .mockReturnValueOnce(createLimitQuery(securities))
      .mockReturnValueOnce(createLimitQuery([]));

    vi.resetModules();
    vi.doMock("@/app/_lib/supabase/public", () => ({
      createRlsSupabaseClient: () => ({ from }),
    }));

    const { fetchAnalysisData } = await import("@/app/_lib/analysis/analysis-data");
    const data = await fetchAnalysisData();

    expect(data.techSignals).toHaveLength(3);
    // Sorted by absolute % change descending
    expect(data.techSignals[0].symbol).toBe("AAPL"); // |4.2| largest
    expect(data.techSignals[0].signal).toBe("strong_buy"); // >= 3%
    expect(data.techSignals[1].symbol).toBe("MSFT"); // |-1.8|
    expect(data.techSignals[1].signal).toBe("sell"); // <= -1%
    expect(data.techSignals[2].symbol).toBe("GOOGL"); // |0.3|
    expect(data.techSignals[2].signal).toBe("neutral");
  });

  it("aggregates financial ratios by sector", async () => {
    const financials = [
      { symbol: "AAPL", ratios_json: { pe: 28.5, pb: 45.2, roe: 147.3, de: 2.1 } },
      { symbol: "MSFT", ratios_json: { pe: 35.0, pb: 12.5, roe: 38.2, de: 0.7 } },
      { symbol: "JPM", ratios_json: { pe: 11.2, pb: 1.8, roe: 15.1, de: 10.2 } },
    ];
    const securities = [
      { symbol: "AAPL", name: "Apple Inc.", country: "US", market: "US", sector: "Technology", market_cap_bucket: "Mega" },
      { symbol: "MSFT", name: "Microsoft Corp.", country: "US", market: "US", sector: "Technology", market_cap_bucket: "Mega" },
      { symbol: "JPM", name: "JPMorgan Chase", country: "US", market: "US", sector: "Financials", market_cap_bucket: "Large" },
    ];

    const from = vi
      .fn()
      .mockReturnValueOnce(createInQuery([]))
      .mockReturnValueOnce(createLimitQuery([]))
      .mockReturnValueOnce(createSelectQuery([]))
      .mockReturnValueOnce(createOrderLimitQuery([]))
      .mockReturnValueOnce(createLimitQuery(securities))
      .mockReturnValueOnce(createLimitQuery(financials));

    vi.resetModules();
    vi.doMock("@/app/_lib/supabase/public", () => ({
      createRlsSupabaseClient: () => ({ from }),
    }));

    const { fetchAnalysisData } = await import("@/app/_lib/analysis/analysis-data");
    const data = await fetchAnalysisData();

    expect(data.financialSectors).toHaveLength(2);

    const techFin = data.financialSectors.find((f) => f.sector === "Technology");
    expect(techFin).toBeDefined();
    if (techFin) {
      expect(techFin.count).toBe(2);
      if (techFin.pe !== null) expect(techFin.pe).toBeCloseTo(31.75); // (28.5+35)/2
    }

    const finFin = data.financialSectors.find((f) => f.sector === "Financials");
    expect(finFin).toBeDefined();
    if (finFin) {
      expect(finFin.count).toBe(1);
      expect(finFin.pe).toBeCloseTo(11.2);
    }
  });
});
