import "server-only";

import type { QuoteTarget } from "@/app/_lib/data/securities";
import type { DailyQuoteProviderAdapter, NormalizedDailyQuoteRowInput, QuoteFetchContext } from "@/app/_lib/providers/quotes";

type FetchLike = (input: URL, init: { headers: { AUTH_KEY: string } }) => Promise<Response>;

type KrxDailyQuoteProviderOptions = {
  apiKey: string;
  fetcher?: FetchLike;
};

type KrxMarket = "kospi" | "kosdaq";

const krxBaseUrl = "https://data-dbg.krx.co.kr/svc/apis/sto";
const krxEndpoints: Record<KrxMarket, string> = {
  kospi: "stk_bydd_trd",
  kosdaq: "ksq_bydd_trd"
};

export function createKrxDailyQuoteProvider(options: KrxDailyQuoteProviderOptions): DailyQuoteProviderAdapter {
  const fetcher = options.fetcher ?? fetch;

  return {
    provider: "krx-kr-quotes",
    estimateQuoteRequests(targets: readonly QuoteTarget[]) {
      return requiredMarkets(targets).length;
    },
    async fetchDailyQuotes(targets: readonly QuoteTarget[], context: QuoteFetchContext) {
      const markets = requiredMarkets(targets);
      const targetByIssueCode = mapTargetsByIssueCode(targets);
      const rows: NormalizedDailyQuoteRowInput[] = [];

      for (const market of markets) {
        const records = await fetchMarket(fetcher, options.apiKey, market, toKrxDate(context.day));
        rows.push(...normalizeKrxRecords(records, targetByIssueCode));
      }

      return rows;
    }
  };
}

async function fetchMarket(fetcher: FetchLike, apiKey: string, market: KrxMarket, baseDate: string): Promise<unknown[]> {
  const url = new URL(`${krxBaseUrl}/${krxEndpoints[market]}`);
  url.searchParams.set("basDd", baseDate);

  const response = await fetcher(url, { headers: { AUTH_KEY: apiKey } });

  if (!response.ok) {
    throw new Error(`KRX daily quote request failed for ${market}: HTTP ${response.status}`);
  }

  const payload = await readJson(response);

  if (!isRecord(payload) || !Array.isArray(payload.OutBlock_1)) {
    throw new Error(`KRX daily quote response for ${market} is missing OutBlock_1`);
  }

  return payload.OutBlock_1;
}

function normalizeKrxRecords(
  records: readonly unknown[],
  targetByIssueCode: Map<string, QuoteTarget>
): NormalizedDailyQuoteRowInput[] {
  return records
    .map((record) => normalizeKrxRecord(record, targetByIssueCode))
    .filter((row): row is NormalizedDailyQuoteRowInput => row !== null);
}

function normalizeKrxRecord(record: unknown, targetByIssueCode: Map<string, QuoteTarget>): NormalizedDailyQuoteRowInput | null {
  if (!isRecord(record)) {
    return null;
  }

  const issueCode = readString(record.ISU_CD);
  const target = issueCode ? targetByIssueCode.get(issueCode) : undefined;
  const date = parseKrxDate(readString(record.BAS_DD));
  const close = readNumber(record.TDD_CLSPRC);

  if (!target || !date || close === null || close <= 0) {
    return null;
  }

  return {
    symbol: target.symbol,
    date,
    open: readNumber(record.TDD_OPNPRC),
    high: readNumber(record.TDD_HGPRC),
    low: readNumber(record.TDD_LWPRC),
    close,
    vol: readInteger(record.ACC_TRDVOL)
  };
}

function requiredMarkets(targets: readonly QuoteTarget[]): KrxMarket[] {
  const markets = new Set<KrxMarket>();

  for (const target of targets) {
    const market = krxMarketForTarget(target);
    if (market) {
      markets.add(market);
    }
  }

  return ["kospi", "kosdaq"].filter((market): market is KrxMarket => markets.has(market as KrxMarket));
}

function krxMarketForTarget(target: QuoteTarget): KrxMarket | null {
  if (target.exchange === "KSC" || target.symbol.endsWith(".KS")) {
    return "kospi";
  }

  if (target.exchange === "KOE" || target.symbol.endsWith(".KQ")) {
    return "kosdaq";
  }

  return null;
}

function mapTargetsByIssueCode(targets: readonly QuoteTarget[]): Map<string, QuoteTarget> {
  const targetByIssueCode = new Map<string, QuoteTarget>();

  for (const target of targets) {
    const issueCode = toKrxIssueCode(target.symbol);
    if (issueCode && !targetByIssueCode.has(issueCode)) {
      targetByIssueCode.set(issueCode, target);
    }
  }

  return targetByIssueCode;
}

function toKrxIssueCode(symbol: string): string | null {
  const issueCode = symbol.replace(/\.(KS|KQ)$/u, "");
  return /^\d{6}$/u.test(issueCode) ? issueCode : null;
}

function toKrxDate(day: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/u.test(day)) {
    throw new Error(`KRX quote day must be YYYY-MM-DD: ${day}`);
  }

  return day.replaceAll("-", "");
}

function parseKrxDate(value: string | null): string | null {
  if (!value || !/^\d{8}$/u.test(value)) {
    return null;
  }

  return `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`;
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

function readString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function readNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value !== "string") {
    return null;
  }

  const parsed = Number(value.replaceAll(",", ""));
  return Number.isFinite(parsed) ? parsed : null;
}

function readInteger(value: unknown): number | null {
  const parsed = readNumber(value);
  return parsed === null ? null : Math.trunc(parsed);
}
