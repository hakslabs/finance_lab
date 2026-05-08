import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

describe("search route validation", () => {
  it("accepts empty queries and high limits because the data helper clamps limits", async () => {
    const { searchRouteQuerySchema } = await import("@/app/api/search/schema");

    expect(searchRouteQuerySchema.parse({}).q).toBe("");
    expect(searchRouteQuerySchema.parse({ q: "aapl", limit: "100" })).toEqual({ q: "aapl", limit: 100 });
  });

  it("rejects invalid limit values", async () => {
    const { searchRouteQuerySchema } = await import("@/app/api/search/schema");

    expect(searchRouteQuerySchema.safeParse({ q: "aapl", limit: "0" }).success).toBe(false);
    expect(searchRouteQuerySchema.safeParse({ q: "aapl", limit: "abc" }).success).toBe(false);
  });
});

describe("search route handler", () => {
  it("returns securities results with masters and reports sidecars", async () => {
    const searchSecurities = vi.fn().mockResolvedValue([
      {
        symbol: "005930.KS",
        name: "Samsung Electronics Co Ltd",
        asset_class: "equity",
        country: "South Korea",
        currency: "KRW",
        exchange: "KSC",
        market: "KOSPI Stock Market",
        sector: "Information Technology",
        industry: "Semiconductors",
        matchType: "alias"
      }
    ]);
    const searchMasters = vi.fn().mockResolvedValue([
      {
        id: "buffett",
        name: "Warren Buffett",
        firm: "Berkshire Hathaway",
        style: "Value",
        href: "/masters/buffett",
        matchType: "firm"
      }
    ]);
    const searchReports = vi.fn().mockResolvedValue([
      {
        id: "r1",
        title: "Apple Supply Chain",
        src: "IB",
        category: "single-stock",
        tickers: ["AAPL"],
        tags: ["hardware"],
        publishedAt: "2026-05-07T00:00:00Z",
        href: "/reports/r1",
        matchType: "title"
      }
    ]);

    vi.resetModules();
    vi.doMock("@/app/_lib/data/securities", () => ({ searchSecurities }));
    vi.doMock("@/app/_lib/masters/masters-data", () => ({ searchMasters }));
    vi.doMock("@/app/_lib/reports/reports-data", () => ({ searchReports }));

    const { GET } = await import("@/app/api/search/route");
    const response = await GET(new Request("http://localhost/api/search?q=005930&limit=100"));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      results: [expect.objectContaining({ symbol: "005930.KS", matchType: "alias" })],
      masters: [expect.objectContaining({ id: "buffett", matchType: "firm" })],
      reports: [expect.objectContaining({ id: "r1", matchType: "title" })]
    });
    expect(searchSecurities).toHaveBeenCalledWith("005930", 100);
    expect(searchMasters).toHaveBeenCalledWith("005930", 100);
    expect(searchReports).toHaveBeenCalledWith("005930", 100);
  });
});
