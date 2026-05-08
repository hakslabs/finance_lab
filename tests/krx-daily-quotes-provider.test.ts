import { describe, expect, it, vi } from "vitest";

import type { QuoteTarget } from "@/app/_lib/data/securities";
import { createKrxDailyQuoteProvider } from "@/app/_lib/providers/krx";

vi.mock("server-only", () => ({}));

const samsungTarget: QuoteTarget = {
  symbol: "005930.KS",
  name: "Samsung Electronics Co., Ltd.",
  asset_class: "equity",
  country: "South Korea",
  currency: "KRW",
  exchange: "KSC",
  market: "KOSPI",
  sector: "Technology",
  industry: "Consumer Electronics"
};

const celltrionTarget: QuoteTarget = {
  ...samsungTarget,
  symbol: "091990.KQ",
  name: "Celltrion Healthcare Co., Ltd.",
  exchange: "KOE",
  market: "KOSDAQ",
  industry: "Biotechnology"
};

function jsonResponse(payload: unknown, init?: ResponseInit): Response {
  return Response.json(payload, init);
}

describe("KRX daily quote provider", () => {
  it("estimates one bulk request for each required Korean market", () => {
    const provider = createKrxDailyQuoteProvider({ apiKey: "krx-key-with-length" });

    expect(provider.estimateQuoteRequests([samsungTarget, celltrionTarget])).toBe(2);
    expect(provider.estimateQuoteRequests([samsungTarget])).toBe(1);
    expect(provider.estimateQuoteRequests([])).toBe(0);
  });

  it("fetches KOSPI and KOSDAQ with header auth and normalizes matched KRX rows", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(
        jsonResponse({
          OutBlock_1: [
            {
              BAS_DD: "20260507",
              ISU_CD: "005930",
              TDD_OPNPRC: "76,000",
              TDD_HGPRC: "77,500",
              TDD_LWPRC: "75,500",
              TDD_CLSPRC: "77,000",
              ACC_TRDVOL: "12,345,678"
            },
            { BAS_DD: "20260507", ISU_CD: "000000", TDD_CLSPRC: "1" }
          ]
        })
      )
      .mockResolvedValueOnce(
        jsonResponse({
          OutBlock_1: [
            {
              BAS_DD: "20260507",
              ISU_CD: "091990",
              TDD_OPNPRC: "65,000",
              TDD_HGPRC: "66,000",
              TDD_LWPRC: "64,000",
              TDD_CLSPRC: "65,500",
              ACC_TRDVOL: "987,654"
            }
          ]
        })
      );
    const provider = createKrxDailyQuoteProvider({ apiKey: "krx-key-with-length", fetcher });

    const rows = await provider.fetchDailyQuotes([samsungTarget, celltrionTarget], { market: "kr", day: "2026-05-07" });

    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(fetcher.mock.calls.map(([url]) => url.toString())).toEqual([
      "https://data-dbg.krx.co.kr/svc/apis/sto/stk_bydd_trd?basDd=20260507",
      "https://data-dbg.krx.co.kr/svc/apis/sto/ksq_bydd_trd?basDd=20260507"
    ]);
    for (const [url, init] of fetcher.mock.calls) {
      expect(url.searchParams.has("AUTH_KEY")).toBe(false);
      expect(init).toEqual({ headers: { AUTH_KEY: "krx-key-with-length" } });
    }
    expect(rows).toEqual([
      { symbol: "005930.KS", date: "2026-05-07", open: 76000, high: 77500, low: 75500, close: 77000, vol: 12345678 },
      { symbol: "091990.KQ", date: "2026-05-07", open: 65000, high: 66000, low: 64000, close: 65500, vol: 987654 }
    ]);
  });

  it("returns an empty list for valid empty KRX market responses", async () => {
    const fetcher = vi.fn().mockResolvedValue(jsonResponse({ OutBlock_1: [] }));
    const provider = createKrxDailyQuoteProvider({ apiKey: "krx-key-with-length", fetcher });

    await expect(provider.fetchDailyQuotes([samsungTarget], { market: "kr", day: "2026-05-07" })).resolves.toEqual([]);
  });

  it("skips malformed or missing-close rows instead of returning bad daily quotes", async () => {
    const fetcher = vi.fn().mockResolvedValue(
      jsonResponse({
        OutBlock_1: [
          { BAS_DD: "20260507", ISU_CD: "005930", TDD_CLSPRC: "0" },
          { BAS_DD: "bad-date", ISU_CD: "005930", TDD_CLSPRC: "77000" }
        ]
      })
    );
    const provider = createKrxDailyQuoteProvider({ apiKey: "krx-key-with-length", fetcher });

    await expect(provider.fetchDailyQuotes([samsungTarget], { market: "kr", day: "2026-05-07" })).resolves.toEqual([]);
  });

  it("throws on KRX contract and HTTP failures without exposing the API key", async () => {
    const badPayloadFetcher = vi.fn().mockResolvedValue(jsonResponse({ rows: [] }));
    const badStatusFetcher = vi.fn().mockResolvedValue(jsonResponse({ error: "denied" }, { status: 403 }));

    await expect(
      createKrxDailyQuoteProvider({ apiKey: "secret-krx-token", fetcher: badPayloadFetcher }).fetchDailyQuotes(
        [samsungTarget],
        { market: "kr", day: "2026-05-07" }
      )
    ).rejects.toThrow("KRX daily quote response for kospi is missing OutBlock_1");
    await expect(
      createKrxDailyQuoteProvider({ apiKey: "secret-krx-token", fetcher: badStatusFetcher }).fetchDailyQuotes(
        [samsungTarget],
        { market: "kr", day: "2026-05-07" }
      )
    ).rejects.toThrow("KRX daily quote request failed for kospi: HTTP 403");
    await expect(
      createKrxDailyQuoteProvider({ apiKey: "secret-krx-token", fetcher: badStatusFetcher }).fetchDailyQuotes(
        [samsungTarget],
        { market: "kr", day: "2026-05-07" }
      )
    ).rejects.not.toThrow("secret-krx-token");
  });
});
