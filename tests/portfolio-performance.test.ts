import { describe, expect, it } from "vitest";

const holdings = [
  { symbol: "AAPL", name: "Apple Inc.", qty: 10, avgPx: 100, currentPx: 150, currency: "USD", sector: "Technology" },
  { symbol: "JPM", name: "JPMorgan", qty: 5, avgPx: 80, currentPx: 70, currency: "USD", sector: "Financials" },
] as const;

const transactions = [
  { id: "t1", ts: "2026-01-10T00:00:00Z", type: "buy", symbol: "AAPL", qty: 10, px: 100, fee: 10, currency: "USD" },
  { id: "t2", ts: "2026-02-10T00:00:00Z", type: "sell", symbol: "AAPL", qty: 4, px: 150, fee: 4, currency: "USD" },
  { id: "t3", ts: "2026-02-15T00:00:00Z", type: "div", symbol: "AAPL", qty: 1, px: 20, fee: 0, currency: "USD" },
] as const;

describe("portfolio performance helpers", () => {
  it("values holdings and calculates allocation/sector exposure", async () => {
    const { calculateAllocation, calculateSectorExposure, valueHoldings } = await import("@/app/_lib/portfolio/performance");
    const valued = valueHoldings(holdings);

    expect(valued[0].marketValue).toBe(1500);
    expect(valued[0].unrealizedPnl).toBe(500);
    expect(valued[0].unrealizedReturnPct).toBe(50);
    expect(valued[0].weight).toBeCloseTo(1500 / 1850);
    expect(calculateAllocation(valued)).toEqual([{ key: "USD", value: 1850, weight: 1 }]);
    expect(calculateSectorExposure(valued).map((bucket) => bucket.key)).toEqual(["Technology", "Financials"]);
  });

  it("compares portfolio return against benchmark", async () => {
    const { calculateReturnVsBenchmark, valueHoldings } = await import("@/app/_lib/portfolio/performance");
    const result = calculateReturnVsBenchmark(valueHoldings(holdings), 100, 120);

    expect(result.portfolioReturnPct).toBeCloseTo(32.142857);
    expect(result.benchmarkReturnPct).toBe(20);
    expect(result.spreadPct).toBeCloseTo(12.142857);
  });

  it("builds monthly heatmap cells from transactions", async () => {
    const { buildMonthlyHeatmap } = await import("@/app/_lib/portfolio/performance");
    const heatmap = buildMonthlyHeatmap(transactions);

    expect(heatmap).toEqual([
      { month: "2026-01", realizedPnl: 0, dividends: 0, fees: 10, transactionCount: 1 },
      { month: "2026-02", realizedPnl: 596, dividends: 20, fees: 4, transactionCount: 2 },
    ]);
  });

  it("simulates FIFO capital gains for informational output", async () => {
    const { simulateCapitalGains } = await import("@/app/_lib/portfolio/performance");
    const result = simulateCapitalGains(transactions);

    expect(result.sales).toHaveLength(1);
    expect(result.sales[0]).toMatchObject({ symbol: "AAPL", soldQty: 4, proceeds: 600, costBasis: 404, fees: 4, realizedGain: 192 });
    expect(result.totalRealizedGain).toBe(192);
    expect(result.informationalOnly).toBe(true);
  });
});
