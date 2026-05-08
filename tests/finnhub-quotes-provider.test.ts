import { describe, expect, it, vi } from "vitest";

import type { QuoteTarget } from "@/app/_lib/data/securities";
import { createFinnhubQuoteProvider } from "@/app/_lib/providers/finnhub";

vi.mock("server-only", () => ({}));

const appleTarget: QuoteTarget = {
  symbol: "AAPL",
  name: "Apple Inc.",
  asset_class: "equity",
  country: "United States",
  currency: "USD",
  exchange: "NMS",
  market: "NasdaqGS",
  sector: "Technology",
  industry: "Consumer Electronics"
};

const microsoftTarget: QuoteTarget = {
  ...appleTarget,
  symbol: "MSFT",
  name: "Microsoft Corporation",
  industry: "Software - Infrastructure"
};

function jsonResponse(payload: unknown, init?: ResponseInit): Response {
  return Response.json(payload, init);
}

describe("Finnhub quote provider", () => {
  it("estimates one Finnhub quote request per target", () => {
    const provider = createFinnhubQuoteProvider({ apiKey: "finnhub-key-with-length" });

    expect(provider.estimateQuoteRequests([appleTarget, microsoftTarget])).toBe(2);
  });

  it("fetches each symbol with header auth and normalizes Finnhub quote fields", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ c: 195.5, dp: 1.2, t: 1778164200 }))
      .mockResolvedValueOnce(jsonResponse({ c: 410.1, dp: -0.4, t: 1778164200 }));
    const provider = createFinnhubQuoteProvider({ apiKey: "finnhub-key-with-length", fetcher });

    const rows = await provider.fetchQuotes([appleTarget, microsoftTarget], { market: "us", day: "2026-05-07" });

    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(fetcher.mock.calls.map(([url]) => url.toString())).toEqual([
      "https://finnhub.io/api/v1/quote?symbol=AAPL",
      "https://finnhub.io/api/v1/quote?symbol=MSFT"
    ]);
    for (const [url, init] of fetcher.mock.calls) {
      expect(url.searchParams.has("token")).toBe(false);
      expect(init).toEqual({ headers: { "X-Finnhub-Token": "finnhub-key-with-length" } });
    }
    expect(rows).toEqual([
      { symbol: "AAPL", px: 195.5, pct: 1.2, ts: "2026-05-07T14:30:00.000Z" },
      { symbol: "MSFT", px: 410.1, pct: -0.4, ts: "2026-05-07T14:30:00.000Z" }
    ]);
  });

  it("spaces batches to stay within Finnhub's per-minute cap", async () => {
    const targets = Array.from({ length: 61 }, (_, index) => ({
      ...appleTarget,
      symbol: `TEST${index}`,
      name: `Test ${index}`
    }));
    const fetcher = vi.fn().mockImplementation(() => Promise.resolve(jsonResponse({ c: 10, dp: 0.5, t: 1778164200 })));
    const delay = vi.fn().mockResolvedValue(undefined);
    const provider = createFinnhubQuoteProvider({ apiKey: "finnhub-key-with-length", fetcher, delay });

    const rows = await provider.fetchQuotes(targets, { market: "us", day: "2026-05-07" });

    expect(fetcher).toHaveBeenCalledTimes(61);
    expect(delay).toHaveBeenCalledWith(60_000);
    expect(delay).toHaveBeenCalledOnce();
    expect(rows).toHaveLength(61);
  });

  it("skips invalid or missing-price Finnhub payloads instead of returning bad quote rows", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ c: 0, dp: 1.2, t: 1778164200 }))
      .mockResolvedValueOnce(jsonResponse({ c: 410.1, t: 1778164200 }));
    const provider = createFinnhubQuoteProvider({ apiKey: "finnhub-key-with-length", fetcher });

    const rows = await provider.fetchQuotes([appleTarget, microsoftTarget], { market: "us", day: "2026-05-07" });

    expect(rows).toEqual([{ symbol: "MSFT", px: 410.1, pct: null, ts: "2026-05-07T14:30:00.000Z" }]);
  });

  it("throws on non-2xx Finnhub responses without exposing the API key", async () => {
    const fetcher = vi.fn().mockResolvedValue(jsonResponse({ error: "rate limit" }, { status: 429 }));
    const provider = createFinnhubQuoteProvider({ apiKey: "secret-finnhub-token", fetcher });

    await expect(provider.fetchQuotes([appleTarget], { market: "us", day: "2026-05-07" })).rejects.toThrow(
      "Finnhub quote request failed for AAPL: HTTP 429"
    );
    await expect(provider.fetchQuotes([appleTarget], { market: "us", day: "2026-05-07" })).rejects.not.toThrow(
      "secret-finnhub-token"
    );
  });
});
