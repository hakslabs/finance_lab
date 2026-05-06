import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

describe("prepareCronQuoteTargets", () => {
  it("wraps default quote targets into explicit US/KR cron target sets", async () => {
    const getDefaultQuoteTargets = vi.fn().mockResolvedValue({
      us: [
        {
          symbol: "AAPL",
          name: "Apple Inc.",
          asset_class: "equity",
          country: "United States",
          currency: "USD",
          exchange: "NMS",
          market: "NasdaqGS",
          sector: "Technology",
          industry: "Consumer Electronics"
        }
      ],
      kr: [
        {
          symbol: "005930.KS",
          name: "Samsung Electronics Co Ltd",
          asset_class: "equity",
          country: "South Korea",
          currency: "KRW",
          exchange: "KSC",
          market: "KOSPI Stock Market",
          sector: "Information Technology",
          industry: "Semiconductors"
        }
      ]
    });

    vi.resetModules();
    vi.doMock("@/app/_lib/data/securities", () => ({ getDefaultQuoteTargets }));

    const { prepareCronQuoteTargets } = await import("@/app/_lib/cron/quote-targets");
    const prepared = await prepareCronQuoteTargets({ usLimit: 1, krLimit: 1 });

    expect(getDefaultQuoteTargets).toHaveBeenCalledWith({ usLimit: 1, krLimit: 1 });
    expect(prepared.us).toMatchObject({ market: "us", count: 1 });
    expect(prepared.kr).toMatchObject({ market: "kr", count: 1 });
    expect(prepared.totalCount).toBe(2);
    expect(prepared.us.targets[0].symbol).toBe("AAPL");
    expect(prepared.kr.targets[0].symbol).toBe("005930.KS");
  });
});
