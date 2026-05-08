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
    eq: vi.fn().mockReturnThis(),
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

const profiles = [
  { id: "buffett", name: "Warren Buffett", firm: "Berkshire Hathaway", style: "Value", philosophyMd: "Owner earnings", books: [], videos: [], updatedAt: "2026-05-01T00:00:00Z" },
  { id: "wood", name: "Cathie Wood", firm: "ARK", style: "Growth", philosophyMd: null, books: [], videos: [], updatedAt: "2026-05-02T00:00:00Z" },
];

const holdings = [
  { masterId: "buffett", symbol: "AAPL", name: "Apple Inc.", sector: "Technology", market: "US", country: "US", currency: "USD", price: 190, priceChangePct: 1.2, weight: 46, shares: 100, qoqDelta: 2, quarter: "2026Q1" },
  { masterId: "buffett", symbol: "KO", name: "Coca-Cola", sector: "Consumer Staples", market: "US", country: "US", currency: "USD", price: 60, priceChangePct: -0.2, weight: 8, shares: 50, qoqDelta: -1, quarter: "2026Q1" },
  { masterId: "buffett", symbol: "AAPL", name: "Apple Inc.", sector: "Technology", market: "US", country: "US", currency: "USD", price: 180, priceChangePct: null, weight: 44, shares: 98, qoqDelta: null, quarter: "2025Q4" },
];

describe("masters pure helpers", () => {
  it("builds style facets and filters profiles by query/style", async () => {
    const { buildStyleFacets, searchMasterProfiles } = await import("@/app/_lib/masters/masters-data");

    expect(buildStyleFacets(profiles)).toEqual(["Growth", "Value"]);
    expect(searchMasterProfiles(profiles, "berkshire", "value").map((profile) => profile.id)).toEqual(["buffett"]);
  });

  it("ranks global master search results without changing page-local filters", async () => {
    const { rankMasterSearchResults } = await import("@/app/_lib/masters/masters-data");

    expect(rankMasterSearchResults([
      { id: "wood", name: "Cathie Wood", firm: "ARK", style: "Growth", updated_at: "2026-05-02T00:00:00Z" },
      { id: "buffett", name: "Warren Buffett", firm: "Berkshire Hathaway", style: "Value", updated_at: "2026-05-01T00:00:00Z" },
    ], "berkshire")).toEqual([
      expect.objectContaining({ id: "buffett", href: "/masters/buffett", matchType: "firm" }),
    ]);
  });

  it("selects latest quarter, top holdings, and sorted deltas", async () => {
    const { buildMastersData, getQuarterlyDeltas, getTopHoldings, selectMasterProfile } = await import("@/app/_lib/masters/masters-data");

    const data = buildMastersData(profiles, holdings, "buffett");

    expect(data.selectedProfile?.id).toBe("buffett");
    expect(data.latestQuarter).toBe("2026Q1");
    expect(getTopHoldings(holdings, "buffett", "2026Q1").map((holding) => holding.symbol)).toEqual(["AAPL", "KO"]);
    expect(getQuarterlyDeltas(holdings, "buffett", "2026Q1").map((delta) => delta.direction)).toEqual(["increased", "decreased"]);
    expect(data.followState).toEqual({ enabled: false, isFollowing: false, reason: "auth-required" });
    expect(selectMasterProfile(profiles, "missing")).toBeNull();
  });

  it("lets filtered views recompute selection-dependent holdings from filtered profiles", async () => {
    const { findLatestQuarter, getQuarterlyDeltas, getTopHoldings, searchMasterProfiles } = await import("@/app/_lib/masters/masters-data");

    const filtered = searchMasterProfiles(profiles, "", "Growth");
    const effectiveSelected = filtered[0] ?? null;
    const effectiveQuarter = findLatestQuarter(holdings, effectiveSelected?.id);

    expect(effectiveSelected?.id).toBe("wood");
    expect(effectiveQuarter).toBeNull();
    expect(getTopHoldings(holdings, effectiveSelected?.id ?? null, effectiveQuarter)).toEqual([]);
    expect(getQuarterlyDeltas(holdings, effectiveSelected?.id ?? null, effectiveQuarter)).toEqual([]);
  });
});

describe("fetchMastersData", () => {
  it("returns deterministic empty fallback and disabled follow state", async () => {
    const from = vi
      .fn()
      .mockReturnValueOnce(createOrderQuery([]))
      .mockReturnValueOnce(createLimitQuery([]))
      .mockReturnValueOnce(createLimitQuery([]));

    vi.resetModules();
    vi.doMock("@/app/_lib/supabase/public", () => ({ createRlsSupabaseClient: () => ({ from }) }));

    const { fetchMastersData } = await import("@/app/_lib/masters/masters-data");
    const data = await fetchMastersData();

    expect(data.profiles).toEqual([]);
    expect(data.holdings).toEqual([]);
    expect(data.selectedProfile).toBeNull();
    expect(data.latestQuarter).toBeNull();
    expect(data.followState.enabled).toBe(false);
  });

  it("enriches holdings from securities_master and quotes", async () => {
    const profileRows = [
      { id: "buffett", name: "Warren Buffett", firm: "Berkshire Hathaway", style: "Value", philosophy_md: "Owner earnings", books: [], videos: [], created_at: "2026-01-01T00:00:00Z", updated_at: "2026-05-01T00:00:00Z" },
    ];
    const holdingRows = [
      { master_id: "buffett", symbol: "AAPL", weight: 46, shares: 100, qoq_delta: 2, quarter: "2026Q1" },
    ];
    const securityRows = [
      { symbol: "AAPL", name: "Apple Inc.", sector: "Technology", market: "US", country: "US", currency: "USD" },
    ];
    const quoteRows = [
      { symbol: "AAPL", px: 190, pct: 1.2, ts: "2026-05-07T00:00:00Z" },
    ];

    const from = vi
      .fn()
      .mockReturnValueOnce(createOrderQuery(profileRows))
      .mockReturnValueOnce(createLimitQuery(securityRows))
      .mockReturnValueOnce(createLimitQuery(quoteRows))
      .mockReturnValueOnce(createOrderLimitQuery(holdingRows));

    vi.resetModules();
    vi.doMock("@/app/_lib/supabase/public", () => ({ createRlsSupabaseClient: () => ({ from }) }));

    const { fetchMastersData } = await import("@/app/_lib/masters/masters-data");
    const data = await fetchMastersData("buffett");

    expect(data.topHoldings[0]).toMatchObject({ symbol: "AAPL", name: "Apple Inc.", price: 190, sector: "Technology" });
    expect(from).toHaveBeenCalledWith("master_profiles");
    expect(from).toHaveBeenCalledWith("master_holdings");
  });

  it("scopes loaded holdings to the selected master instead of a global cap", async () => {
    const profileRows = [
      { id: "buffett", name: "Warren Buffett", firm: "Berkshire Hathaway", style: "Value", philosophy_md: null, books: [], videos: [], created_at: "2026-01-01T00:00:00Z", updated_at: "2026-05-01T00:00:00Z" },
      { id: "wood", name: "Cathie Wood", firm: "ARK", style: "Growth", philosophy_md: null, books: [], videos: [], created_at: "2026-01-01T00:00:00Z", updated_at: "2026-05-02T00:00:00Z" },
    ];
    const holdingsQuery = createOrderLimitQuery([
      { master_id: "wood", symbol: "TSLA", weight: 9, shares: 20, qoq_delta: 1, quarter: "2026Q1" },
    ]);
    const from = vi
      .fn()
      .mockReturnValueOnce(createOrderQuery(profileRows))
      .mockReturnValueOnce(createLimitQuery([{ symbol: "TSLA", name: "Tesla", sector: "Consumer Discretionary", market: "US", country: "US", currency: "USD" }]))
      .mockReturnValueOnce(createLimitQuery([]))
      .mockReturnValueOnce(holdingsQuery);

    vi.resetModules();
    vi.doMock("@/app/_lib/supabase/public", () => ({ createRlsSupabaseClient: () => ({ from }) }));

    const { fetchMastersData } = await import("@/app/_lib/masters/masters-data");
    const data = await fetchMastersData("wood");

    expect(holdingsQuery.eq).toHaveBeenCalledWith("master_id", "wood");
    expect(data.topHoldings.map((holding) => holding.symbol)).toEqual(["TSLA"]);
  });

  it("searches master profiles through the RLS Supabase client", async () => {
    const createSearchQuery = (data: unknown[]) => ({
      select: vi.fn().mockReturnThis(),
      ilike: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnValue({ data, error: null }),
    });
    const from = vi
      .fn()
      .mockReturnValueOnce(createSearchQuery([{ id: "buffett", name: "Warren Buffett", firm: "Berkshire Hathaway", style: "Value", updated_at: "2026-05-01T00:00:00Z" }]))
      .mockReturnValueOnce(createSearchQuery([]))
      .mockReturnValueOnce(createSearchQuery([]));

    vi.resetModules();
    vi.doMock("@/app/_lib/supabase/public", () => ({ createRlsSupabaseClient: () => ({ from }) }));

    const { searchMasters } = await import("@/app/_lib/masters/masters-data");
    const results = await searchMasters("Warren", 20);

    expect(results).toEqual([expect.objectContaining({ id: "buffett", matchType: "name" })]);
    expect(from).toHaveBeenCalledWith("master_profiles");
  });
});
