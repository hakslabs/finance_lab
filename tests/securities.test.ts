import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

type SecuritiesModule = typeof import("@/app/_lib/data/securities");
type SecurityInput = Parameters<SecuritiesModule["mergeRankedSecurityResults"]>[1][number];

function security(overrides: Partial<SecurityInput> & Pick<SecurityInput, "symbol" | "name">): SecurityInput {
  return {
    symbol: overrides.symbol,
    name: overrides.name,
    asset_class: overrides.asset_class ?? "equity",
    country: overrides.country ?? "United States",
    currency: overrides.currency ?? "USD",
    exchange: overrides.exchange ?? "NMS",
    market: overrides.market ?? "NasdaqGS",
    sector: overrides.sector ?? null,
    industry: overrides.industry ?? null,
    market_cap_bucket: overrides.market_cap_bucket ?? null
  };
}

describe("security search ranking", () => {
  it("ranks exact symbols above aliases and aliases above name contains matches", async () => {
    const { mergeRankedSecurityResults } = await import("@/app/_lib/data/securities");

    const results = mergeRankedSecurityResults(
      "apple",
      [
        security({ symbol: "APPLE", name: "Unrelated Symbol Inc." }),
        security({ symbol: "ALIS", name: "Alias Holdings" }),
        security({ symbol: "AAPL", name: "Apple Inc." })
      ],
      [{ symbol: "ALIS", alias: "Apple", alias_type: "name" }],
      10
    );

    expect(results.map((result) => [result.symbol, result.matchType])).toEqual([
      ["APPLE", "exact_symbol"],
      ["ALIS", "alias"],
      ["AAPL", "name"]
    ]);
  });

  it("matches local KR aliases such as 005930 to their exchange symbol", async () => {
    const { mergeRankedSecurityResults } = await import("@/app/_lib/data/securities");

    const results = mergeRankedSecurityResults(
      "005930",
      [
        security({
          symbol: "005930.KS",
          name: "Samsung Electronics Co Ltd",
          country: "South Korea",
          currency: "KRW",
          exchange: "KSC",
          market: "KOSPI Stock Market"
        })
      ],
      [{ symbol: "005930.KS", alias: "005930", alias_type: "local_symbol" }]
    );

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({ symbol: "005930.KS", matchType: "alias" });
  });

  it("returns empty results for blank queries and clamps search limits", async () => {
    const { clampSearchLimit, mergeRankedSecurityResults } = await import("@/app/_lib/data/securities");
    const securities = Array.from({ length: 25 }, (_, index) =>
      security({ symbol: `TEST${index.toString().padStart(2, "0")}`, name: `Test Company ${index}` })
    );

    expect(mergeRankedSecurityResults("   ", securities, [])).toEqual([]);
    expect(clampSearchLimit(100)).toBe(20);
    expect(mergeRankedSecurityResults("test", securities, [], 100)).toHaveLength(20);
  });
});

describe("default quote target selection", () => {
  it("orders targets deterministically by country rules, asset class, market cap, then symbol", async () => {
    const { selectDefaultQuoteTargets } = await import("@/app/_lib/data/securities");
    const targets = selectDefaultQuoteTargets(
      [
        security({ symbol: "SPY", name: "SPDR S&P 500 ETF Trust", asset_class: "etf", exchange: "PCX" }),
        security({ symbol: "MSFT", name: "Microsoft Corporation", exchange: "NMS", market_cap_bucket: "Mega Cap" }),
        security({ symbol: "AAPL", name: "Apple Inc.", exchange: "NMS", market_cap_bucket: "Mega Cap" }),
        security({ symbol: "BRK-B", name: "Berkshire Hathaway Inc.", exchange: "NYQ", market_cap_bucket: "Mega Cap" }),
        security({
          symbol: "091990.KQ",
          name: "Celltrion Healthcare",
          country: "South Korea",
          currency: "KRW",
          exchange: "KOE",
          market_cap_bucket: "Large Cap"
        }),
        security({
          symbol: "005930.KS",
          name: "Samsung Electronics Co Ltd",
          country: "South Korea",
          currency: "KRW",
          exchange: "KSC",
          market_cap_bucket: "Mega Cap"
        })
      ],
      { usLimit: 3, krLimit: 2 }
    );

    expect(targets.us.map((target) => target.symbol)).toEqual(["AAPL", "MSFT", "BRK-B"]);
    expect(targets.kr.map((target) => target.symbol)).toEqual(["005930.KS", "091990.KQ"]);
  });

  it("clamps quote target limits", async () => {
    const { clampQuoteTargetLimit } = await import("@/app/_lib/data/securities");

    expect(clampQuoteTargetLimit()).toBe(40);
    expect(clampQuoteTargetLimit(0)).toBe(1);
    expect(clampQuoteTargetLimit(500)).toBe(100);
  });

  it("loads US and KR targets independently so one country cannot crowd out the other", async () => {
    const usQuery = createQuoteTargetQuery([
      security({ symbol: "MSFT", name: "Microsoft Corporation", exchange: "NMS", market_cap_bucket: "Mega Cap" }),
      security({ symbol: "AAPL", name: "Apple Inc.", exchange: "NMS", market_cap_bucket: "Mega Cap" })
    ]);
    const krQuery = createQuoteTargetQuery([
      security({
        symbol: "005930.KS",
        name: "Samsung Electronics Co Ltd",
        country: "South Korea",
        currency: "KRW",
        exchange: "KSC",
        market_cap_bucket: "Mega Cap"
      })
    ]);
    const from = vi.fn().mockReturnValueOnce(usQuery).mockReturnValueOnce(krQuery);

    vi.resetModules();
    vi.doMock("@/app/_lib/supabase/public", () => ({
      createRlsSupabaseClient: () => ({ from })
    }));

    const { getDefaultQuoteTargets } = await import("@/app/_lib/data/securities");
    const targets = await getDefaultQuoteTargets({ usLimit: 2, krLimit: 1 });

    expect(from).toHaveBeenCalledTimes(2);
    expect(usQuery.eq).toHaveBeenCalledWith("country", "United States");
    expect(krQuery.eq).toHaveBeenCalledWith("country", "South Korea");
    expect(usQuery.limit).toHaveBeenCalledWith(100);
    expect(krQuery.limit).toHaveBeenCalledWith(50);
    expect(targets.us.map((target) => target.symbol)).toEqual(["AAPL", "MSFT"]);
    expect(targets.kr.map((target) => target.symbol)).toEqual(["005930.KS"]);
  });
});

function createQuoteTargetQuery(data: SecurityInput[]) {
  return {
    select: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnValue({ data, error: null })
  };
}
