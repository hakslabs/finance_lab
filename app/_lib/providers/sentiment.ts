import "server-only";

export type SentimentCode = "VIX";

export type NormalizedSentimentRowInput = {
  code: SentimentCode;
  value: number;
  band: string;
  ts: string;
};

export type SentimentFetchContext = {
  day: string;
};

export type SentimentProviderAdapter = {
  provider: string;
  estimateSentimentRequests(): number;
  fetchSentiment(context: SentimentFetchContext): Promise<NormalizedSentimentRowInput[]>;
};

type FetchLike = (input: URL, init: { headers: { "X-Finnhub-Token": string } }) => Promise<Response>;

type FinnhubSentimentProviderOptions = {
  apiKey: string;
  fetcher?: FetchLike;
};

const vixTarget = { code: "VIX", symbol: "^VIX" } as const;

export function createFinnhubSentimentProvider(options: FinnhubSentimentProviderOptions): SentimentProviderAdapter {
  const fetcher = options.fetcher ?? fetch;

  return {
    provider: "finnhub-sentiment",
    estimateSentimentRequests() {
      return 1;
    },
    async fetchSentiment(_context: SentimentFetchContext) {
      const row = await fetchFinnhubSentiment(fetcher, options.apiKey);
      return row ? [row] : [];
    }
  };
}

async function fetchFinnhubSentiment(fetcher: FetchLike, apiKey: string): Promise<NormalizedSentimentRowInput | null> {
  const url = new URL("https://finnhub.io/api/v1/quote");
  url.searchParams.set("symbol", vixTarget.symbol);

  const response = await fetcher(url, { headers: { "X-Finnhub-Token": apiKey } });

  if (!response.ok) {
    throw new Error(`Finnhub sentiment request failed for ${vixTarget.code}: HTTP ${response.status}`);
  }

  return normalizeFinnhubVix(await readJson(response));
}

function normalizeFinnhubVix(payload: unknown): NormalizedSentimentRowInput | null {
  if (!isRecord(payload)) {
    return null;
  }

  const value = readFiniteNumber(payload.c);
  const timestamp = readFiniteNumber(payload.t);

  if (value === null || value <= 0 || timestamp === null || timestamp <= 0) {
    return null;
  }

  return {
    code: vixTarget.code,
    value,
    band: vixBand(value),
    ts: new Date(timestamp * 1000).toISOString()
  };
}

function vixBand(value: number): string {
  if (value < 13) {
    return "low_volatility";
  }

  if (value < 20) {
    return "normal";
  }

  if (value < 30) {
    return "elevated";
  }

  return "stress";
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readFiniteNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}
