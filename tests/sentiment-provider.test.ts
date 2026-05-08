import { describe, expect, it, vi } from "vitest";

import { createFinnhubSentimentProvider } from "@/app/_lib/providers/sentiment";

vi.mock("server-only", () => ({}));

function jsonResponse(payload: unknown, init?: ResponseInit): Response {
  return Response.json(payload, init);
}

describe("Finnhub sentiment provider", () => {
  it("estimates one VIX quote request", () => {
    const provider = createFinnhubSentimentProvider({ apiKey: "finnhub-key-with-length" });

    expect(provider.estimateSentimentRequests()).toBe(1);
  });

  it("fetches VIX with header auth and normalizes the sentiment band", async () => {
    const fetcher = vi.fn().mockResolvedValue(jsonResponse({ c: 18.42, t: 1778164200 }));
    const provider = createFinnhubSentimentProvider({ apiKey: "finnhub-key-with-length", fetcher });

    const rows = await provider.fetchSentiment({ day: "2026-05-07" });

    expect(fetcher).toHaveBeenCalledWith(new URL("https://finnhub.io/api/v1/quote?symbol=%5EVIX"), {
      headers: { "X-Finnhub-Token": "finnhub-key-with-length" }
    });
    expect(fetcher.mock.calls[0][0].searchParams.has("token")).toBe(false);
    expect(rows).toEqual([{ code: "VIX", value: 18.42, band: "normal", ts: "2026-05-07T14:30:00.000Z" }]);
  });

  it("skips invalid VIX payloads", async () => {
    const fetcher = vi.fn().mockResolvedValue(jsonResponse({ c: 0, t: 1778164200 }));
    const provider = createFinnhubSentimentProvider({ apiKey: "finnhub-key-with-length", fetcher });

    await expect(provider.fetchSentiment({ day: "2026-05-07" })).resolves.toEqual([]);
  });

  it("throws on provider failures without exposing API keys", async () => {
    const fetcher = vi.fn().mockResolvedValue(jsonResponse({ error: "denied" }, { status: 403 }));
    const provider = createFinnhubSentimentProvider({ apiKey: "secret-finnhub-token", fetcher });

    await expect(provider.fetchSentiment({ day: "2026-05-07" })).rejects.toThrow("Finnhub sentiment request failed for VIX: HTTP 403");
    await expect(provider.fetchSentiment({ day: "2026-05-07" })).rejects.not.toThrow("secret-finnhub-token");
  });
});
