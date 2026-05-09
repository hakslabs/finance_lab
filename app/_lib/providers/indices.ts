import "server-only";

export type IndexCode = "KOSPI" | "KOSDAQ" | "KOSPI200" | "SP500" | "NASDAQ" | "DOW";

export type NormalizedIndexRowInput = {
  code: IndexCode;
  value: number;
  change: number | null;
  updated_at: string;
};

export type IndexFetchContext = {
  day: string;
};

export type IndexProviderAdapter = {
  provider: string;
  estimateIndexRequests(): number;
  fetchIndices(context: IndexFetchContext): Promise<NormalizedIndexRowInput[]>;
};

type FetchLike = (input: URL, init: { headers: Record<string, string> }) => Promise<Response>;

type MixedIndexProviderOptions = {
  finnhubApiKey: string;
  krxApiKey: string;
  fetcher?: FetchLike;
};

type FinnhubIndex = { code: IndexCode; symbol: string };
type KoscomIndex = { code: IndexCode; market: "kospi" | "kosdaq"; issue: string };

const finnhubIndices: FinnhubIndex[] = [
  { code: "SP500", symbol: "^GSPC" },
  { code: "NASDAQ", symbol: "^IXIC" },
  { code: "DOW", symbol: "^DJI" }
];

const koscomIndices: KoscomIndex[] = [
  { code: "KOSPI", market: "kospi", issue: "K1" },
  { code: "KOSDAQ", market: "kosdaq", issue: "Q1" },
  { code: "KOSPI200", market: "kospi", issue: "K51" }
];

export function createMixedIndexProvider(options: MixedIndexProviderOptions): IndexProviderAdapter {
  const fetcher = options.fetcher ?? fetch;

  return {
    provider: "finnhub-koscom-indices",
    estimateIndexRequests() {
      return finnhubIndices.length + koscomIndices.length;
    },
    async fetchIndices(context: IndexFetchContext) {
      const rows: NormalizedIndexRowInput[] = [];

      for (const index of finnhubIndices) {
        const row = await fetchFinnhubIndex(fetcher, options.finnhubApiKey, index);
        if (row) {
          rows.push(row);
        }
      }

      for (const index of koscomIndices) {
        try {
          const row = await fetchKoscomIndex(fetcher, options.krxApiKey, index, context.day);
          if (row) {
            rows.push(row);
          }
        } catch (error) {
          // KOSCOM K-MyData uses a separate key from KRX OpenAPI. Until
          // the KOSCOM → KRX index migration in EP-0012 lands, treat any
          // failure here as a soft skip so the US indices still commit.
          // eslint-disable-next-line no-console
          console.warn(
            `[indices] skipping KR index ${index.code}:`,
            error instanceof Error ? error.message : error
          );
        }
      }

      return rows;
    }
  };
}

async function fetchFinnhubIndex(fetcher: FetchLike, apiKey: string, index: FinnhubIndex): Promise<NormalizedIndexRowInput | null> {
  const url = new URL("https://finnhub.io/api/v1/quote");
  url.searchParams.set("symbol", index.symbol);

  const response = await fetcher(url, { headers: { "X-Finnhub-Token": apiKey } });

  if (!response.ok) {
    throw new Error(`Finnhub index request failed for ${index.code}: HTTP ${response.status}`);
  }

  return normalizeFinnhubIndex(index.code, await readJson(response));
}

async function fetchKoscomIndex(
  fetcher: FetchLike,
  apiKey: string,
  index: KoscomIndex,
  day: string
): Promise<NormalizedIndexRowInput | null> {
  const url = new URL(`https://oap.k-mydata.org/v3/market/realtime/index/${index.market}/${index.issue}/index`);

  const response = await fetcher(url, { headers: { apikey: apiKey } });

  if (!response.ok) {
    throw new Error(`KOSCOM index request failed for ${index.code}: HTTP ${response.status}`);
  }

  return normalizeKoscomIndex(index.code, await readJson(response), day);
}

function normalizeFinnhubIndex(code: IndexCode, payload: unknown): NormalizedIndexRowInput | null {
  if (!isRecord(payload)) {
    return null;
  }

  const value = readNumber(payload.c);
  const timestamp = readNumber(payload.t);

  if (value === null || value <= 0 || timestamp === null || timestamp <= 0) {
    return null;
  }

  return {
    code,
    value,
    change: readNumber(payload.d),
    updated_at: new Date(timestamp * 1000).toISOString()
  };
}

function normalizeKoscomIndex(code: IndexCode, payload: unknown, day: string): NormalizedIndexRowInput | null {
  if (!isRecord(payload) || !isRecord(payload.result)) {
    throw new Error(`KOSCOM index response for ${code} is missing result`);
  }

  const value = readNumber(payload.result.trdPrc);

  if (value === null || value <= 0) {
    return null;
  }

  return {
    code,
    value,
    change: signedKoscomChange(payload.result.cmpprevddPrc, payload.result.cmpprevddTpCd),
    updated_at: koscomUpdatedAt(day, payload.result.trdTm)
  };
}

function signedKoscomChange(value: unknown, direction: unknown): number | null {
  const amount = readNumber(value);
  if (amount === null) {
    return null;
  }

  if (["4", "5", "8", "9"].includes(String(direction))) {
    return -Math.abs(amount);
  }

  if (String(direction) === "3") {
    return 0;
  }

  return amount;
}

function koscomUpdatedAt(day: string, tradingTime: unknown): string {
  if (!/^\d{4}-\d{2}-\d{2}$/u.test(day)) {
    throw new Error(`index day must be YYYY-MM-DD: ${day}`);
  }

  const rawTime = String(tradingTime ?? "").padStart(6, "0");
  const hour = rawTime.slice(0, 2);
  const minute = rawTime.slice(2, 4);
  const second = rawTime.slice(4, 6);
  const kstTimestamp = new Date(`${day}T${hour}:${minute}:${second}+09:00`);

  if (Number.isNaN(kstTimestamp.getTime())) {
    return new Date(`${day}T00:00:00+09:00`).toISOString();
  }

  return kstTimestamp.toISOString();
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

function readNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value !== "string") {
    return null;
  }

  const parsed = Number(value.replaceAll(",", "").trim());
  return Number.isFinite(parsed) ? parsed : null;
}
