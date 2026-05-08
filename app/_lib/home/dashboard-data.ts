/**
 * Dashboard data fetcher — server-only, reads Supabase cache tables.
 *
 * All functions return deterministic fallbacks on empty/error.
 * No external API calls; data comes from cron-populated cache tables.
 */

import "server-only";

import { createRlsSupabaseClient } from "@/app/_lib/supabase/public";

// ── Types ────────────────────────────────────────────────────────────────

/** Single index entry for the index strip widget. */
export interface IndexData {
  readonly code: string;
  readonly value: number | null;
  readonly change: number | null;
  readonly spark: readonly number[];
  readonly updated_at: string;
}

/** Single quote row merged with security name for stock strips. */
export interface StockQuote {
  readonly symbol: string;
  readonly name: string;
  readonly px: number | null;
  readonly pct: number | null;
}

/** Sentiment gauge reading. */
export interface SentimentReading {
  readonly code: string;
  readonly value: number | null;
  readonly band: string | null;
}

/** News item for the top news widget. */
export interface NewsItem {
  readonly id: string;
  readonly title: string;
  readonly summary: string | null;
  readonly published_at: string;
  readonly tickers: readonly string[];
}

/** Calendar event for the weekly calendar widget. */
export interface CalendarEvent {
  readonly date: string;
  readonly title: string;
  readonly type: "earnings" | "dividend" | "macro";
  readonly ticker?: string;
}

/** Aggregated dashboard data shape consumed by page.tsx. */
export interface DashboardData {
  readonly indices: readonly IndexData[];
  readonly usStocks: readonly StockQuote[];
  readonly krStocks: readonly StockQuote[];
  readonly sentiment: readonly SentimentReading[];
  readonly news: readonly NewsItem[];
  readonly calendar: readonly CalendarEvent[];
  /** ISO-8601 timestamp of the most recent cache refresh, or null. */
  readonly lastUpdated: string | null;
}

// ── Index codes we display ───────────────────────────────────────────────

const INDEX_CODES = [
  "KOSPI",
  "KOSDAQ",
  "KOSPI200",
  "SP500",
  "NASDAQ",
  "DOW",
] as const;

// ── Fetcher ──────────────────────────────────────────────────────────────

/**
 * Fetches all dashboard data in parallel from Supabase cache tables.
 * Returns fallback-empty shapes when tables are empty or queries fail.
 */
export async function fetchDashboardData(): Promise<DashboardData> {
  const supabase = createRlsSupabaseClient();

  const [indicesResult, quotesResult, sentimentResult, newsResult, krDailyResult] = await Promise.all([
    supabase
      .from("indices")
      .select("code,value,change,spark,updated_at")
      .in("code", [...INDEX_CODES]),
    supabase
      .from("quotes")
      .select("symbol,px,pct")
      .limit(40),
    supabase
      .from("sentiment")
      .select("code,value,band,ts"),
    supabase
      .from("news")
      .select("id,title,summary,published_at,tickers")
      .order("published_at", { ascending: false })
      .limit(5),
    supabase
      .from("quotes_daily")
      .select("symbol,date,close")
      .order("date", { ascending: false })
      .limit(80),
  ]);

  const indices = (indicesResult.data ?? []) as IndexData[];
  const rawQuotes = quotesResult.data ?? [];
  const sentiment = (sentimentResult.data ?? []) as SentimentReading[];

  // Merge quote symbols with securities_master names
  const krDailyQuotes = krDailyResult.data ?? [];
  const latestKrQuotes = latestKrDailyQuotes(krDailyQuotes);
  const symbols = [...rawQuotes.map((q) => q.symbol), ...latestKrQuotes.flatMap((q) => [q.symbol, q.sourceSymbol])];
  let nameMap = new Map<string, string>();

  if (symbols.length > 0) {
    const { data: secs } = await supabase
      .from("securities_master")
      .select("symbol,name")
      .in("symbol", symbols.slice(0, 40));

    if (secs) {
      nameMap = new Map(secs.map((s) => [s.symbol, s.name]));
    }
  }

  const enrichedQuotes: StockQuote[] = rawQuotes.map((q) => ({
    symbol: q.symbol,
    name: nameMap.get(q.symbol) ?? q.symbol,
    px: q.px,
    pct: q.pct,
  }));

  // Split into US / KR stocks
  const usStocks = enrichedQuotes.filter(
    (s) =>
      /^[A-Z]{1,5}$/.test(s.symbol) &&
      !/^\d{6}$/.test(s.symbol),
  );
  const krStocks: StockQuote[] = latestKrQuotes.map((quote) => ({
    symbol: quote.symbol,
    name: nameMap.get(quote.symbol) ?? nameMap.get(quote.sourceSymbol) ?? quote.symbol,
    px: quote.close,
    pct: null,
  }));

  // Derive last-updated timestamp from indices
  const lastUpdated =
    indices.length > 0
      ? indices.reduce((latest, idx) =>
          (!latest || idx.updated_at > latest ? idx.updated_at : latest),
          "" as string,
        )
      : null;

  const news = (newsResult.data ?? []) as NewsItem[];

  // Calendar returns empty array until that table exists
  const calendar: CalendarEvent[] = [];

  return {
    indices,
    usStocks: usStocks.slice(0, 8),
    krStocks: krStocks.slice(0, 8),
    sentiment,
    news,
    calendar,
    lastUpdated,
  };
}

function latestKrDailyQuotes(rows: Array<{ symbol: string; date: string; close: number | null }>): Array<{ symbol: string; sourceSymbol: string; close: number | null }> {
  const latest = new Map<string, { symbol: string; sourceSymbol: string; close: number | null }>();

  for (const row of rows) {
    const displaySymbol = normalizeKrDisplaySymbol(row.symbol);
    if (!displaySymbol || latest.has(displaySymbol)) {
      continue;
    }

    latest.set(displaySymbol, { symbol: displaySymbol, sourceSymbol: row.symbol, close: row.close });
  }

  return [...latest.values()];
}

function normalizeKrDisplaySymbol(symbol: string): string | null {
  const displaySymbol = symbol.replace(/\.(KS|KQ)$/u, "");
  return /^\d{6}$/u.test(displaySymbol) ? displaySymbol : null;
}
