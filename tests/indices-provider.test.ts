import { describe, expect, it, vi } from "vitest";

import { createMixedIndexProvider } from "@/app/_lib/providers/indices";

vi.mock("server-only", () => ({}));

function jsonResponse(payload: unknown, init?: ResponseInit): Response {
  return Response.json(payload, init);
}

describe("mixed index provider", () => {
  it("estimates three Finnhub requests plus three KOSCOM requests", () => {
    const provider = createMixedIndexProvider({ finnhubApiKey: "finnhub-key-with-length", krxApiKey: "krx-key-with-length" });

    expect(provider.estimateIndexRequests()).toBe(6);
  });

  it("fetches US and KR indices with header auth and normalizes values", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ c: 5325.67, d: 22.34, dp: 0.42, t: 1778164200 }))
      .mockResolvedValueOnce(jsonResponse({ c: 16800.25, d: -33.7, dp: -0.2, t: 1778164200 }))
      .mockResolvedValueOnce(jsonResponse({ c: 39100.11, d: 58.4, dp: 0.15, t: 1778164200 }))
      .mockResolvedValueOnce(jsonResponse({ result: { trdPrc: "2,670.65", cmpprevddPrc: "11.66", cmpprevddTpCd: "2", trdTm: "14191000" } }))
      .mockResolvedValueOnce(jsonResponse({ result: { trdPrc: "850.20", cmpprevddPrc: "3.11", cmpprevddTpCd: "5", trdTm: "14191000" } }))
      .mockResolvedValueOnce(jsonResponse({ result: { trdPrc: "365.12", cmpprevddPrc: "0", cmpprevddTpCd: "3", trdTm: "14191000" } }));
    const provider = createMixedIndexProvider({
      finnhubApiKey: "finnhub-key-with-length",
      krxApiKey: "krx-key-with-length",
      fetcher
    });

    const rows = await provider.fetchIndices({ day: "2026-05-07" });

    expect(fetcher).toHaveBeenCalledTimes(6);
    expect(fetcher.mock.calls.map(([url]) => url.toString())).toEqual([
      "https://finnhub.io/api/v1/quote?symbol=%5EGSPC",
      "https://finnhub.io/api/v1/quote?symbol=%5EIXIC",
      "https://finnhub.io/api/v1/quote?symbol=%5EDJI",
      "https://oap.k-mydata.org/v3/market/realtime/index/kospi/K1/index",
      "https://oap.k-mydata.org/v3/market/realtime/index/kosdaq/Q1/index",
      "https://oap.k-mydata.org/v3/market/realtime/index/kospi/K51/index"
    ]);
    expect(fetcher.mock.calls[0][1]).toEqual({ headers: { "X-Finnhub-Token": "finnhub-key-with-length" } });
    expect(fetcher.mock.calls[3][1]).toEqual({ headers: { apikey: "krx-key-with-length" } });
    for (const [url] of fetcher.mock.calls) {
      expect(url.searchParams.has("token")).toBe(false);
      expect(url.searchParams.has("apikey")).toBe(false);
    }
    expect(rows).toEqual([
      { code: "SP500", value: 5325.67, change: 22.34, updated_at: "2026-05-07T14:30:00.000Z" },
      { code: "NASDAQ", value: 16800.25, change: -33.7, updated_at: "2026-05-07T14:30:00.000Z" },
      { code: "DOW", value: 39100.11, change: 58.4, updated_at: "2026-05-07T14:30:00.000Z" },
      { code: "KOSPI", value: 2670.65, change: 11.66, updated_at: "2026-05-07T05:19:10.000Z" },
      { code: "KOSDAQ", value: 850.2, change: -3.11, updated_at: "2026-05-07T05:19:10.000Z" },
      { code: "KOSPI200", value: 365.12, change: 0, updated_at: "2026-05-07T05:19:10.000Z" }
    ]);
  });

  it("skips invalid value payloads without returning bad index rows", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ c: 0, d: 0.42, t: 1778164200 }))
      .mockResolvedValueOnce(jsonResponse({ c: 16800.25, d: -33.7, t: 1778164200 }))
      .mockResolvedValueOnce(jsonResponse({ c: 39100.11, d: 58.4, t: 1778164200 }))
      .mockResolvedValueOnce(jsonResponse({ result: { trdPrc: "0", cmpprevddPrc: "11.66", cmpprevddTpCd: "2", trdTm: "14191000" } }))
      .mockResolvedValueOnce(jsonResponse({ result: { trdPrc: "850.20", cmpprevddPrc: "3.11", cmpprevddTpCd: "5", trdTm: "14191000" } }))
      .mockResolvedValueOnce(jsonResponse({ result: { trdPrc: "365.12", cmpprevddPrc: "0", cmpprevddTpCd: "3", trdTm: "14191000" } }));
    const provider = createMixedIndexProvider({ finnhubApiKey: "finnhub-key-with-length", krxApiKey: "krx-key-with-length", fetcher });

    const rows = await provider.fetchIndices({ day: "2026-05-07" });

    expect(rows.map((row) => row.code)).toEqual(["NASDAQ", "DOW", "KOSDAQ", "KOSPI200"]);
  });

  it("throws on provider failures without exposing API keys", async () => {
    const fetcher = vi.fn().mockResolvedValue(jsonResponse({ error: "denied" }, { status: 403 }));
    const provider = createMixedIndexProvider({ finnhubApiKey: "secret-finnhub-token", krxApiKey: "secret-krx-token", fetcher });

    await expect(provider.fetchIndices({ day: "2026-05-07" })).rejects.toThrow(
      "Finnhub index request failed for SP500: HTTP 403"
    );
    await expect(provider.fetchIndices({ day: "2026-05-07" })).rejects.not.toThrow("secret-finnhub-token");
  });

  it("returns US indices when KOSCOM payload is missing the result envelope", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ c: 5325.67, d: 22.34, t: 1778164200 }))
      .mockResolvedValueOnce(jsonResponse({ c: 16800.25, d: -33.7, t: 1778164200 }))
      .mockResolvedValueOnce(jsonResponse({ c: 39100.11, d: 58.4, t: 1778164200 }))
      .mockResolvedValueOnce(jsonResponse({ rows: [] }))
      .mockResolvedValueOnce(jsonResponse({ rows: [] }))
      .mockResolvedValueOnce(jsonResponse({ rows: [] }));
    const provider = createMixedIndexProvider({ finnhubApiKey: "finnhub-key-with-length", krxApiKey: "krx-key-with-length", fetcher });

    // KOSCOM fetch failures are softened to skips so the US indices still
    // commit while the KOSCOM → KRX index migration in EP-0012 is pending.
    const rows = await provider.fetchIndices({ day: "2026-05-07" });
    expect(rows.map((row) => row.code)).toEqual(["SP500", "NASDAQ", "DOW"]);
  });
});
