/**
 * Stock detail data fetcher — server-only, reads Supabase cache tables.
 *
 * All functions return deterministic fallbacks on empty/error.
 * No external API calls; data comes from cron-populated cache tables.
 */

import "server-only";

import type { Database } from "@/app/_lib/supabase/database.types";
import { createRlsSupabaseClient } from "@/app/_lib/supabase/public";

// ── Types ────────────────────────────────────────────────────────────────

/** Security profile row from securities_master. */
export type SecurityProfile = Readonly<{
  symbol: string;
  name: string;
  exchange: string | null;
  market: string | null;
  sector: string | null;
  industry: string | null;
  country: string;
  currency: string;
  website: string | null;
}>;

/** Real-time quote from the quotes cache table. */
export type QuoteData = Readonly<{
  symbol: string;
  px: number | null;
  pct: number | null;
  ts: string;
}>;

/** Latest daily quote (OHLCV) for a symbol. */
export type DailyQuote = Readonly<{
  symbol: string;
  date: string;
  open: number | null;
  high: number | null;
  low: number | null;
  close: number | null;
  vol: number | null;
}>;

/** Financial statement row. */
export type FinancialRow = Readonly<{
  symbol: string;
  period: string;
  is_json: Database["public"]["Tables"]["financials"]["Row"]["is_json"];
  bs_json: Database["public"]["Tables"]["financials"]["Row"]["bs_json"];
  cf_json: Database["public"]["Tables"]["financials"]["Row"]["cf_json"];
  ratios_json: Database["public"]["Tables"]["financials"]["Row"]["ratios_json"];
  updated_at: string;
}>;

/** News item relevant to this ticker. */
export type NewsItem = Readonly<{
  id: string;
  src: string;
  title: string;
  url: string;
  summary: string | null;
  sentiment: number | null;
  published_at: string;
}>;

/** Master holder entry for a given symbol. */
export type MasterHolding = Readonly<{
  master_id: string;
  master_name: string | null;
  firm: string | null;
  weight: number | null;
  shares: number | null;
  qoq_delta: number | null;
  quarter: string;
}>;

/** Similar security for the right rail. */
export type SimilarStock = Readonly<{
  symbol: string;
  name: string;
  sector: string | null;
  exchange: string | null;
}>;

/** Aggregated stock detail data shape consumed by the page route. */
export interface StockDetailData {
  readonly profile: SecurityProfile | null;
  readonly quote: QuoteData | null;
  readonly dailyQuote: DailyQuote | null;
  readonly financials: readonly FinancialRow[];
  readonly news: readonly NewsItem[];
  readonly masterHoldings: readonly MasterHolding[];
  readonly similarStocks: readonly SimilarStock[];
}

// ── Tab identifiers ──────────────────────────────────────────────────────

export const STOCK_DETAIL_TABS = [
  "overview",
  "chart",
  "financials",
  "valuation",
  "filings",
  "news",
  "flow",
  "target",
] as const;

export type StockDetailTabId = (typeof STOCK_DETAIL_TABS)[number];

export const TAB_LABELS: Record<StockDetailTabId, string> = {
  overview: "Overview",
  chart: "Chart",
  financials: "Financials",
  valuation: "Valuation",
  filings: "Filings & Earnings",
  news: "News",
  flow: "Supply / Demand",
  target: "Target Price",
};

// ── Fetcher ──────────────────────────────────────────────────────────────

/**
 * Fetches all stock detail data in parallel from Supabase cache tables.
 * Returns fallback-empty shapes when tables are empty or queries fail.
 */
export async function fetchStockDetailData(ticker: string): Promise<StockDetailData> {
  const supabase = createRlsSupabaseClient();
  const normalizedTicker = ticker.trim().toUpperCase();
  const tickerCandidates = stockTickerCandidates(normalizedTicker);

  const [
    profileResult,
    quoteResult,
    dailyResult,
    financialsResult,
    newsResult,
    holdingsResult,
    similarResult,
  ] = await Promise.all([
    // Security profile
    supabase
      .from("securities_master")
      .select(
        "symbol,name,exchange,market,sector,industry,country,currency,website",
      )
      .in("symbol", tickerCandidates)
      .limit(1),

    // Real-time quote
    supabase
      .from("quotes")
      .select("symbol,px,pct,ts")
      .in("symbol", tickerCandidates)
      .limit(1),

    // Latest daily OHLCV
    supabase
      .from("quotes_daily")
      .select("symbol,date,open,high,low,close,vol")
      .in("symbol", tickerCandidates)
      .order("date", { ascending: false })
      .limit(1),

    // Financial statements
    supabase
      .from("financials")
      .select("symbol,period,is_json,bs_json,cf_json,ratios_json,updated_at")
      .in("symbol", tickerCandidates)
      .order("period", { ascending: false })
      .limit(20),

    // News items mentioning this ticker
    supabase
      .from("news")
      .select("id,src,title,url,summary,sentiment,published_at")
      .overlaps("tickers", tickerCandidates)
      .order("published_at", { ascending: false })
      .limit(20),

    // Master holdings for this symbol
    supabase
      .from("master_holdings")
      .select("master_id,symbol,weight,shares,qoq_delta,quarter")
      .in("symbol", tickerCandidates)
      .order("quarter", { ascending: false })
      .limit(20),

    // Similar stocks (same sector, different symbol)
    supabase
      .from("securities_master")
      .select("symbol,name,sector,exchange")
      .in("asset_class", ["equity", "etf"])
      .limit(60),
  ]);

  // ── Profile ──
  const profileRaw = profileResult.data?.[0] ?? null;
  const profile: SecurityProfile | null = profileRaw
    ? {
        symbol: profileRaw.symbol,
        name: profileRaw.name,
        exchange: profileRaw.exchange,
        market: profileRaw.market,
        sector: profileRaw.sector,
        industry: profileRaw.industry,
        country: profileRaw.country,
        currency: profileRaw.currency,
        website: profileRaw.website,
      }
    : null;

  // ── Quote ──
  const quoteRaw = quoteResult.data?.[0] ?? null;
  const quote: QuoteData | null = quoteRaw
    ? {
        symbol: quoteRaw.symbol,
        px: quoteRaw.px,
        pct: quoteRaw.pct,
        ts: quoteRaw.ts,
      }
    : null;

  // ── Daily Quote ──
  const dailyRaw = dailyResult.data?.[0] ?? null;
  const dailyQuote: DailyQuote | null = dailyRaw
    ? {
        symbol: dailyRaw.symbol,
        date: dailyRaw.date,
        open: dailyRaw.open,
        high: dailyRaw.high,
        low: dailyRaw.low,
        close: dailyRaw.close,
        vol: dailyRaw.vol,
      }
    : null;

  // ── Financials ──
  const financials = (financialsResult.data ?? []) as FinancialRow[];

  // ── News ──
  const news = (newsResult.data ?? []) as NewsItem[];

  // ── Master Holdings (enriched with master names) ──
  const holdingsRaw = holdingsResult.data ?? [];
  let masterHoldings: MasterHolding[] = [];

  if (holdingsRaw.length > 0) {
    const masterIds = [...new Set(holdingsRaw.map((h) => h.master_id))];
    const { data: masters } = await supabase
      .from("master_profiles")
      .select("id,name,firm")
      .in("id", masterIds);

    const masterMap = new Map(
      (masters ?? []).map((m) => [m.id, { name: m.name, firm: m.firm }]),
    );

    masterHoldings = holdingsRaw.map((h) => ({
      master_id: h.master_id,
      master_name: masterMap.get(h.master_id)?.name ?? null,
      firm: masterMap.get(h.master_id)?.firm ?? null,
      weight: h.weight,
      shares: h.shares,
      qoq_delta: h.qoq_delta,
      quarter: h.quarter,
    }));
  }

  // ── Similar Stocks (same sector, exclude self) ──
  const allSimilar = similarResult.data ?? [];
  const similarStocks: SimilarStock[] = profile
    ? allSimilar
        .filter(
          (s) =>
            s.symbol !== normalizedTicker &&
            !tickerCandidates.includes(s.symbol) &&
            s.sector === profile.sector &&
            s.symbol !== undefined,
        )
        .slice(0, 8)
        .map((s) => ({
          symbol: s.symbol,
          name: s.name,
          sector: s.sector,
          exchange: s.exchange,
        }))
    : [];

  return {
    profile,
    quote,
    dailyQuote,
    financials,
    news,
    masterHoldings,
    similarStocks,
  };
}

function stockTickerCandidates(ticker: string): string[] {
  const bareKrTicker = ticker.replace(/\.(KS|KQ)$/u, "");
  if (/^\d{6}$/u.test(bareKrTicker)) {
    return [bareKrTicker, `${bareKrTicker}.KS`, `${bareKrTicker}.KQ`];
  }

  return [ticker];
}
