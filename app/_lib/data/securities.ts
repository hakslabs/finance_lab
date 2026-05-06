import "server-only";

import type { Database } from "@/app/_lib/supabase/database.types";
import { createRlsSupabaseClient } from "@/app/_lib/supabase/public";

type SecurityRow = Pick<
  Database["public"]["Tables"]["securities_master"]["Row"],
  | "symbol"
  | "name"
  | "asset_class"
  | "country"
  | "currency"
  | "exchange"
  | "market"
  | "sector"
  | "industry"
  | "market_cap_bucket"
>;

type SecurityAliasRow = Pick<
  Database["public"]["Tables"]["security_aliases"]["Row"],
  "symbol" | "alias" | "alias_type"
>;

export type SecurityMatchType = "exact_symbol" | "alias" | "symbol" | "name";

export type SecuritySearchResult = Pick<
  SecurityRow,
  "symbol" | "name" | "asset_class" | "country" | "currency" | "exchange" | "market" | "sector" | "industry"
> & {
  matchType: SecurityMatchType;
};

export type QuoteTarget = Pick<
  SecurityRow,
  "symbol" | "name" | "asset_class" | "country" | "currency" | "exchange" | "market" | "sector" | "industry"
>;

export type DefaultQuoteTargets = {
  us: QuoteTarget[];
  kr: QuoteTarget[];
};

export type QuoteTargetOptions = {
  usLimit?: number;
  krLimit?: number;
};

export const MAX_SECURITY_SEARCH_LIMIT = 20;
export const DEFAULT_QUOTE_TARGET_LIMIT = 40;
export const MAX_QUOTE_TARGET_LIMIT = 100;

const SEARCH_SELECT = "symbol,name,asset_class,country,currency,exchange,market,sector,industry,market_cap_bucket";
const KOREA_EXCHANGE_ORDER = ["KSC", "KOE"];
const US_EXCHANGE_ORDER = ["NMS", "NYQ", "NCM", "ASE", "NGM", "PCX", "BTS"];
const QUOTE_TARGET_FETCH_MULTIPLIER = 50;
const MARKET_CAP_RANK: Record<string, number> = {
  mega: 5,
  large: 4,
  mid: 3,
  small: 2,
  micro: 1,
  nano: 0
};

export function normalizeSecurityQuery(query: string): string {
  return query.trim().replace(/\s+/g, " ");
}

export function clampSearchLimit(limit?: number): number {
  if (!Number.isFinite(limit)) {
    return MAX_SECURITY_SEARCH_LIMIT;
  }

  return Math.min(Math.max(Math.trunc(limit ?? MAX_SECURITY_SEARCH_LIMIT), 1), MAX_SECURITY_SEARCH_LIMIT);
}

export function clampQuoteTargetLimit(limit?: number): number {
  if (!Number.isFinite(limit)) {
    return DEFAULT_QUOTE_TARGET_LIMIT;
  }

  return Math.min(Math.max(Math.trunc(limit ?? DEFAULT_QUOTE_TARGET_LIMIT), 1), MAX_QUOTE_TARGET_LIMIT);
}

export function mergeRankedSecurityResults(
  query: string,
  securities: SecurityRow[],
  aliases: SecurityAliasRow[],
  limit = MAX_SECURITY_SEARCH_LIMIT
): SecuritySearchResult[] {
  const normalizedQuery = normalizeSecurityQuery(query).toLocaleUpperCase("en-US");
  if (!normalizedQuery) {
    return [];
  }

  const aliasesBySymbol = new Map<string, SecurityAliasRow[]>();
  for (const alias of aliases) {
    const symbolAliases = aliasesBySymbol.get(alias.symbol) ?? [];
    symbolAliases.push(alias);
    aliasesBySymbol.set(alias.symbol, symbolAliases);
  }

  return securities
    .map((security) => ({ security, matchType: getSecurityMatchType(security, aliasesBySymbol, normalizedQuery) }))
    .filter((candidate): candidate is { security: SecurityRow; matchType: SecurityMatchType } => Boolean(candidate.matchType))
    .sort((left, right) => compareSearchCandidates(left, right, normalizedQuery))
    .slice(0, clampSearchLimit(limit))
    .map(({ security, matchType }) => toSecuritySearchResult(security, matchType));
}

export function selectDefaultQuoteTargets(
  securities: SecurityRow[],
  options: QuoteTargetOptions = {}
): DefaultQuoteTargets {
  const usLimit = clampQuoteTargetLimit(options.usLimit);
  const krLimit = clampQuoteTargetLimit(options.krLimit);
  const eligible = securities.filter((security) => ["equity", "etf"].includes(security.asset_class));

  return {
    us: eligible
      .filter((security) => security.country === "United States")
      .sort((left, right) => compareQuoteTargets(left, right, US_EXCHANGE_ORDER))
      .slice(0, usLimit)
      .map(toQuoteTarget),
    kr: eligible
      .filter((security) => security.country === "South Korea")
      .sort((left, right) => compareQuoteTargets(left, right, KOREA_EXCHANGE_ORDER))
      .slice(0, krLimit)
      .map(toQuoteTarget)
  };
}

export async function searchSecurities(query: string, limit?: number): Promise<SecuritySearchResult[]> {
  const normalizedQuery = normalizeSecurityQuery(query);
  if (!normalizedQuery) {
    return [];
  }

  const safeLimit = clampSearchLimit(limit);
  const supabase = createRlsSupabaseClient();
  const escapedQuery = escapePostgrestPattern(normalizedQuery);
  const queryPattern = `%${escapedQuery}%`;
  const exactLocalSymbol = normalizedQuery.toLocaleUpperCase("en-US");

  const [symbolResponse, nameResponse, aliasResponse, exactAliasResponse] = await Promise.all([
    supabase
      .from("securities_master")
      .select(SEARCH_SELECT)
      .in("asset_class", ["equity", "etf"])
      .ilike("symbol", queryPattern)
      .limit(safeLimit * 4),
    supabase
      .from("securities_master")
      .select(SEARCH_SELECT)
      .in("asset_class", ["equity", "etf"])
      .ilike("name", queryPattern)
      .limit(safeLimit * 4),
    supabase
      .from("security_aliases")
      .select("symbol,alias,alias_type")
      .ilike("alias", queryPattern)
      .limit(safeLimit * 4),
    supabase
      .from("security_aliases")
      .select("symbol,alias,alias_type")
      .eq("alias", exactLocalSymbol)
      .limit(safeLimit * 4)
  ]);

  if (symbolResponse.error) {
    throw new Error(`failed to search securities_master symbols: ${symbolResponse.error.message}`);
  }

  if (nameResponse.error) {
    throw new Error(`failed to search securities_master names: ${nameResponse.error.message}`);
  }

  if (aliasResponse.error) {
    throw new Error(`failed to search security_aliases: ${aliasResponse.error.message}`);
  }

  if (exactAliasResponse.error) {
    throw new Error(`failed to search exact security_aliases: ${exactAliasResponse.error.message}`);
  }

  const securities = [...(symbolResponse.data ?? []), ...(nameResponse.data ?? [])];
  const aliases = [...(aliasResponse.data ?? []), ...(exactAliasResponse.data ?? [])];
  const missingAliasSymbols = aliases
    .map((alias) => alias.symbol)
    .filter((symbol) => !securities.some((security) => security.symbol === symbol));

  if (missingAliasSymbols.length > 0) {
    const aliasSecurityResponse = await supabase
      .from("securities_master")
      .select(SEARCH_SELECT)
      .in("symbol", [...new Set(missingAliasSymbols)])
      .in("asset_class", ["equity", "etf"]);

    if (aliasSecurityResponse.error) {
      throw new Error(`failed to load aliased securities: ${aliasSecurityResponse.error.message}`);
    }

    securities.push(...(aliasSecurityResponse.data ?? []));
  }

  return mergeRankedSecurityResults(normalizedQuery, dedupeSecurities(securities), aliases, safeLimit);
}

export async function getDefaultQuoteTargets(options: QuoteTargetOptions = {}): Promise<DefaultQuoteTargets> {
  const supabase = createRlsSupabaseClient();
  const usLimit = clampQuoteTargetLimit(options.usLimit);
  const krLimit = clampQuoteTargetLimit(options.krLimit);
  const [usResponse, krResponse] = await Promise.all([
    supabase
      .from("securities_master")
      .select(SEARCH_SELECT)
      .in("asset_class", ["equity", "etf"])
      .eq("country", "United States")
      .in("exchange", US_EXCHANGE_ORDER)
      .order("symbol", { ascending: true })
      .limit(quoteTargetFetchLimit(usLimit)),
    supabase
      .from("securities_master")
      .select(SEARCH_SELECT)
      .in("asset_class", ["equity", "etf"])
      .eq("country", "South Korea")
      .in("exchange", KOREA_EXCHANGE_ORDER)
      .order("symbol", { ascending: true })
      .limit(quoteTargetFetchLimit(krLimit))
  ]);

  if (usResponse.error) {
    throw new Error(`failed to load US quote targets from securities_master: ${usResponse.error.message}`);
  }

  if (krResponse.error) {
    throw new Error(`failed to load KR quote targets from securities_master: ${krResponse.error.message}`);
  }

  return selectDefaultQuoteTargets([...(usResponse.data ?? []), ...(krResponse.data ?? [])], {
    usLimit,
    krLimit
  });
}

function getSecurityMatchType(
  security: SecurityRow,
  aliasesBySymbol: Map<string, SecurityAliasRow[]>,
  normalizedQuery: string
): SecurityMatchType | null {
  const normalizedSymbol = security.symbol.toLocaleUpperCase("en-US");
  const normalizedName = security.name.toLocaleUpperCase("en-US");
  const aliases = aliasesBySymbol.get(security.symbol) ?? [];

  if (normalizedSymbol === normalizedQuery) {
    return "exact_symbol";
  }

  if (aliases.some((alias) => alias.alias.toLocaleUpperCase("en-US").includes(normalizedQuery))) {
    return "alias";
  }

  if (normalizedSymbol.includes(normalizedQuery)) {
    return "symbol";
  }

  if (normalizedName.includes(normalizedQuery)) {
    return "name";
  }

  return null;
}

function compareSearchCandidates(
  left: { security: SecurityRow; matchType: SecurityMatchType },
  right: { security: SecurityRow; matchType: SecurityMatchType },
  normalizedQuery: string
): number {
  const rankDelta = searchRank(left.matchType) - searchRank(right.matchType);
  if (rankDelta !== 0) {
    return rankDelta;
  }

  const leftSymbolDistance = left.security.symbol.length - normalizedQuery.length;
  const rightSymbolDistance = right.security.symbol.length - normalizedQuery.length;
  if (leftSymbolDistance !== rightSymbolDistance) {
    return leftSymbolDistance - rightSymbolDistance;
  }

  return left.security.symbol.localeCompare(right.security.symbol);
}

function searchRank(matchType: SecurityMatchType): number {
  return { exact_symbol: 0, alias: 1, symbol: 2, name: 3 }[matchType];
}

function compareQuoteTargets(left: SecurityRow, right: SecurityRow, exchangeOrder: string[]): number {
  const assetClassDelta = assetClassRank(left.asset_class) - assetClassRank(right.asset_class);
  if (assetClassDelta !== 0) {
    return assetClassDelta;
  }

  const exchangeDelta = exchangeRank(left.exchange, exchangeOrder) - exchangeRank(right.exchange, exchangeOrder);
  if (exchangeDelta !== 0) {
    return exchangeDelta;
  }

  const marketCapDelta = marketCapRank(right.market_cap_bucket) - marketCapRank(left.market_cap_bucket);
  if (marketCapDelta !== 0) {
    return marketCapDelta;
  }

  return left.symbol.localeCompare(right.symbol);
}

function assetClassRank(assetClass: string): number {
  return assetClass === "equity" ? 0 : 1;
}

function exchangeRank(exchange: string | null, exchangeOrder: string[]): number {
  const rank = exchange ? exchangeOrder.indexOf(exchange) : -1;
  return rank >= 0 ? rank : exchangeOrder.length;
}

function marketCapRank(bucket: string | null): number {
  if (!bucket) {
    return -1;
  }

  const normalizedBucket = bucket.toLocaleLowerCase("en-US").split(/\s+/)[0];
  return MARKET_CAP_RANK[normalizedBucket] ?? -1;
}

function quoteTargetFetchLimit(limit: number): number {
  return limit * QUOTE_TARGET_FETCH_MULTIPLIER;
}

function toSecuritySearchResult(security: SecurityRow, matchType: SecurityMatchType): SecuritySearchResult {
  return { ...toQuoteTarget(security), matchType };
}

function toQuoteTarget(security: SecurityRow): QuoteTarget {
  return {
    symbol: security.symbol,
    name: security.name,
    asset_class: security.asset_class,
    country: security.country,
    currency: security.currency,
    exchange: security.exchange,
    market: security.market,
    sector: security.sector,
    industry: security.industry
  };
}

function dedupeSecurities(securities: SecurityRow[]): SecurityRow[] {
  return [...new Map(securities.map((security) => [security.symbol, security])).values()];
}

function escapePostgrestPattern(value: string): string {
  return value.replace(/[%,]/g, (char) => `\\${char}`);
}
