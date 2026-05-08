import "server-only";

import type { QuoteTarget } from "@/app/_lib/data/securities";
import type { NormalizedQuoteRowInput, QuoteFetchContext, QuoteProviderAdapter } from "@/app/_lib/providers/quotes";

type FetchLike = (input: URL, init: { headers: { "X-Finnhub-Token": string } }) => Promise<Response>;
type DelayLike = (milliseconds: number) => Promise<void>;

type FinnhubQuoteProviderOptions = {
  apiKey: string;
  fetcher?: FetchLike;
  delay?: DelayLike;
};

const finnhubMaxRequestsPerMinute = 60;

export function createFinnhubQuoteProvider(options: FinnhubQuoteProviderOptions): QuoteProviderAdapter {
  const fetcher = options.fetcher ?? fetch;
  const delay = options.delay ?? sleep;

  return {
    provider: "finnhub-us-quotes",
    estimateQuoteRequests(targets: readonly QuoteTarget[]) {
      return targets.length;
    },
    async fetchQuotes(targets: readonly QuoteTarget[], _context: QuoteFetchContext) {
      const quotes: Array<NormalizedQuoteRowInput | null> = [];

      for (let start = 0; start < targets.length; start += finnhubMaxRequestsPerMinute) {
        const batch = targets.slice(start, start + finnhubMaxRequestsPerMinute);
        quotes.push(...(await Promise.all(batch.map((target) => fetchQuote(fetcher, options.apiKey, target.symbol)))));

        if (start + finnhubMaxRequestsPerMinute < targets.length) {
          await delay(60_000);
        }
      }

      return quotes.filter((quote): quote is NormalizedQuoteRowInput => quote !== null);
    }
  };
}

async function fetchQuote(fetcher: FetchLike, apiKey: string, symbol: string): Promise<NormalizedQuoteRowInput | null> {
  const url = new URL("https://finnhub.io/api/v1/quote");
  url.searchParams.set("symbol", symbol);

  const response = await fetcher(url, { headers: { "X-Finnhub-Token": apiKey } });

  if (!response.ok) {
    throw new Error(`Finnhub quote request failed for ${symbol}: HTTP ${response.status}`);
  }

  const payload = await readJson(response);
  const normalized = normalizeFinnhubQuote(symbol, payload);

  return normalized;
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function normalizeFinnhubQuote(symbol: string, payload: unknown): NormalizedQuoteRowInput | null {
  if (!isRecord(payload)) {
    return null;
  }

  const px = readFiniteNumber(payload.c);
  const unixSeconds = readFiniteNumber(payload.t);

  if (px === null || px <= 0 || unixSeconds === null || unixSeconds <= 0) {
    return null;
  }

  return {
    symbol,
    px,
    pct: readFiniteNumber(payload.dp),
    ts: new Date(unixSeconds * 1000).toISOString()
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readFiniteNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function sleep(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}
