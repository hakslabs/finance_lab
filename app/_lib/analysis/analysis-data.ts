/**
 * Analysis data fetcher — server-only, reads Supabase cache tables.
 *
 * All functions return deterministic fallbacks on empty/error.
 * No external API calls; data comes from cron-populated cache tables.
 */

import "server-only";

import { createRlsSupabaseClient } from "@/app/_lib/supabase/public";

// ── Types ────────────────────────────────────────────────────────────────

/** Index card for market overview tab. */
export interface AnalysisIndex {
  readonly code: string;
  readonly label: string;
  readonly value: number | null;
  readonly change: number | null;
  readonly spark: readonly number[];
}

/** Sector return bar for market overview. */
export interface SectorReturn {
  readonly sector: string;
  readonly returnPct: number | null;
  readonly count: number;
}

/** Top mover entry. */
export interface TopMover {
  readonly symbol: string;
  readonly name: string;
  readonly px: number | null;
  readonly pct: number | null;
  readonly region: "kr" | "us";
}

/** Sentiment gauge for sentiment tab. */
export interface SentimentGauge {
  readonly code: string;
  readonly label: string;
  readonly value: number | null;
  readonly band: string | null;
  readonly category: "us" | "kr" | "macro";
}

/** Technical signal row derived from cached quotes. */
export interface TechSignal {
  readonly symbol: string;
  readonly name: string;
  readonly px: number | null;
  readonly pct: number | null;
  readonly signal: string;
}

/** 52-week high/low summary. */
export interface HighLowSummary {
  readonly nearHigh: number;
  readonly nearLow: number;
  readonly total: number;
}

/** Financial sector average card. */
export interface FinancialSectorAvg {
  readonly sector: string;
  readonly pe: number | null;
  readonly pb: number | null;
  readonly roe: number | null;
  readonly de: number | null;
  readonly count: number;
}

/** Per-market financial comparison row (KR vs US averages). */
export interface MarketFinancialComparison {
  readonly market: string;
  readonly avgPe: number | null;
  readonly avgPb: number | null;
  readonly avgRoe: number | null;
  readonly avgDe: number | null;
  readonly securityCount: number;
}

/** Country snapshot for market overview tab. */
export interface CountrySnapshot {
  readonly country: string;
  readonly securityCount: number;
  readonly sectorCount: number;
  readonly topSectors: readonly string[];
}

/** A fixed sentiment gauge slot (9 total, regardless of DB content). */
export interface SentimentSlot {
  readonly code: string;
  readonly label: string;
  readonly value: number | null;
  readonly band: string | null;
  readonly category: "us" | "kr" | "macro";
  readonly available: boolean;
}

/** Aggregated analysis data shape consumed by the /analysis page. */
export interface AnalysisData {
  readonly indices: readonly AnalysisIndex[];
  readonly sectorReturns: readonly SectorReturn[];
  readonly countrySnapshots: readonly CountrySnapshot[];
  readonly krMovers: readonly TopMover[];
  readonly usMovers: readonly TopMover[];
  readonly sentimentSlots: readonly SentimentSlot[];
  readonly highLow: HighLowSummary;
  readonly techSignals: readonly TechSignal[];
  readonly financialSectors: readonly FinancialSectorAvg[];
  readonly marketComparison: readonly MarketFinancialComparison[];
  readonly lastUpdated: string | null;
}

// ── Index metadata ───────────────────────────────────────────────────────

const INDEX_META: Record<string, { label: string }> = {
  KOSPI: { label: "KOSPI" },
  KOSDAQ: { label: "KOSDAQ" },
  KOSPI200: { label: "KOSPI 200" },
  SP500: { label: "S&P 500" },
  NASDAQ: { label: "Nasdaq" },
  DOW: { label: "Dow Jones" },
};

const ANALYSIS_INDEX_CODES = Object.keys(INDEX_META);

// ── Nine fixed sentiment gauge slots ─────────────────────────────────────

/** Canonical list of 9 sentiment gauge slots rendered on the Sentiment tab. */
const SENTIMENT_SLOTS: readonly { code: string; label: string; category: "us" | "kr" | "macro" }[] = [
  { code: "fng", label: "Fear & Greed", category: "us" },
  { code: "VIX", label: "VIX", category: "us" },
  { code: "composite", label: "US Composite", category: "us" },
  { code: "KOSPI_sentiment", label: "KOSPI Sentiment", category: "kr" },
  { code: "KOSDAQ_sentiment", label: "KOSDAQ Sentiment", category: "kr" },
  { code: "put_call_ratio", label: "Put/Call Ratio", category: "us" },
  { code: "bond_yield_spread", label: "Bond Yield Spread", category: "macro" },
  { code: "dollar_index", label: "Dollar Index", category: "macro" },
  { code: "krw_usd", label: "KRW/USD", category: "macro" },
] as const;

// ── KR symbol normalization (consistent with M2 dashboard) ───────────────

function normalizeKrDisplaySymbol(symbol: string): string | null {
  const displaySymbol = symbol.replace(/\.(KS|KQ)$/u, "");
  return /^\d{6}$/u.test(displaySymbol) ? displaySymbol : null;
}

// ── Fetcher ──────────────────────────────────────────────────────────────

/**
 * Fetches all analysis data in parallel from Supabase cache tables.
 * Returns fallback-empty shapes when tables are empty or queries fail.
 */
export async function fetchAnalysisData(): Promise<AnalysisData> {
  const supabase = createRlsSupabaseClient();

  const [
    indicesResult,
    quotesResult,
    sentimentResult,
    dailyQuotesResult,
    securitiesResult,
    financialsResult,
  ] = await Promise.all([
    supabase
      .from("indices")
      .select("code,value,change,spark,updated_at")
      .in("code", ANALYSIS_INDEX_CODES),
    supabase
      .from("quotes")
      .select("symbol,px,pct")
      .limit(100),
    supabase
      .from("sentiment")
      .select("code,value,band,ts"),
    supabase
      .from("quotes_daily")
      .select("symbol,date,close,high,low")
      .order("date", { ascending: false })
      .limit(200),
    supabase
      .from("securities_master")
      .select("symbol,name,sector,market,country")
      .limit(300),
    supabase
      .from("financials")
      .select("symbol,ratios_json")
      .limit(200),
  ]);

  // ── Indices ──
  const rawIndices = indicesResult.data ?? [];
  const indices: AnalysisIndex[] = rawIndices.map((idx) => ({
    code: idx.code,
    label: INDEX_META[idx.code]?.label ?? idx.code,
    value: idx.value,
    change: idx.change,
    spark: idx.spark ?? [],
  }));

  // ── Quotes + Securities merge ──
  const rawQuotes = quotesResult.data ?? [];
  const securities = securitiesResult.data ?? [];
  const secMap = new Map(securities.map((s) => [s.symbol, s]));

  // Merge KR daily quotes for KR stocks
  const krDailyRows = dailyQuotesResult.data ?? [];
  const latestKrMap = new Map<string, { symbol: string; close: number | null; high: number | null; low: number | null }>();
  for (const row of krDailyRows) {
    const display = normalizeKrDisplaySymbol(row.symbol);
    if (display && !latestKrMap.has(display)) {
      latestKrMap.set(display, { symbol: display, close: row.close, high: row.high, low: row.low });
    }
  }

  // Build unified quote list with names
  const enrichedQuotes: Array<{
    symbol: string;
    name: string;
    px: number | null;
    pct: number | null;
    region: "kr" | "us";
    sector: string | null;
    high: number | null;
    low: number | null;
  }> = [];

  for (const q of rawQuotes) {
    const sec = secMap.get(q.symbol);
    const isKr = /^\d{6}$/.test(q.symbol) || normalizeKrDisplaySymbol(q.symbol) !== null;
    enrichedQuotes.push({
      symbol: q.symbol,
      name: sec?.name ?? q.symbol,
      px: q.px,
      pct: q.pct,
      region: isKr ? "kr" : "us",
      sector: sec?.sector ?? null,
      high: null,
      low: null,
    });
  }

  for (const [, v] of latestKrMap) {
    const sec = secMap.get(v.symbol) ?? secMap.get(`${v.symbol}.KS`);
    enrichedQuotes.push({
      symbol: v.symbol,
      name: sec?.name ?? v.symbol,
      px: v.close,
      pct: null,
      region: "kr",
      sector: sec?.sector ?? null,
      high: v.high,
      low: v.low,
    });
  }

  // ── Top movers (sorted by absolute % change, then by price change presence) ──
  const sortedMovers = [...enrichedQuotes]
    .filter((q) => q.pct !== null || q.px !== null)
    .sort((a, b) => {
      const aVal = Math.abs(a.pct ?? 0);
      const bVal = Math.abs(b.pct ?? 0);
      return bVal - aVal;
    });

  const krMovers: TopMover[] = sortedMovers
    .filter((q) => q.region === "kr")
    .slice(0, 10)
    .map((q) => ({ symbol: q.symbol, name: q.name, px: q.px, pct: q.pct, region: "kr" as const }));

  const usMovers: TopMover[] = sortedMovers
    .filter((q) => q.region === "us")
    .slice(0, 10)
    .map((q) => ({ symbol: q.symbol, name: q.name, px: q.px, pct: q.pct, region: "us" as const }));

  // ── Sector returns (best-effort from quote + security data) ──
  const sectorMap = new Map<string, { totalReturn: number; count: number }>();
  for (const q of enrichedQuotes) {
    if (q.sector && q.pct !== null) {
      const existing = sectorMap.get(q.sector) ?? { totalReturn: 0, count: 0 };
      sectorMap.set(q.sector, { totalReturn: existing.totalReturn + q.pct, count: existing.count + 1 });
    }
  }
  const sectorReturns: SectorReturn[] = [...sectorMap.entries()]
    .map(([sector, data]) => ({
      sector,
      returnPct: data.count > 0 ? data.totalReturn / data.count : null,
      count: data.count,
    }))
    .sort((a, b) => (b.returnPct ?? 0) - (a.returnPct ?? 0))
    .slice(0, 12);

  // ── 52-week high/low from daily quotes ──
  let highLow: HighLowSummary = { nearHigh: 0, nearLow: 0, total: 0 };
  if (krDailyRows.length > 0) {
    const symbolStats = new Map<string, { high: number; low: number; close: number | null }>();
    for (const row of krDailyRows) {
      const key = row.symbol;
      const existing = symbolStats.get(key);
      if (row.high !== null && row.low !== null) {
        if (!existing) {
          symbolStats.set(key, { high: row.high, low: row.low, close: row.close });
        } else {
          if (row.high > existing.high) existing.high = row.high;
          if (row.low < existing.low) existing.low = row.low;
          if (row.close !== null) existing.close = row.close;
        }
      }
    }

    let nearHigh = 0;
    let nearLow = 0;
    let total = 0;
    for (const [, stats] of symbolStats) {
      if (stats.close === null) continue;
      total++;
      const range = stats.high - stats.low || 1;
      const position = (stats.close - stats.low) / range;
      if (position >= 0.95) nearHigh++;
      if (position <= 0.05) nearLow++;
    }
    highLow = { nearHigh, nearLow, total };
  }

  // ── Technical signals (simple price-based signals from cached data) ──
  const techSignals: TechSignal[] = sortedMovers
    .slice(0, 20)
    .map((q) => {
      let signal = "neutral";
      if (q.pct !== null) {
        if (q.pct >= 3) signal = "strong_buy";
        else if (q.pct >= 1) signal = "buy";
        else if (q.pct <= -3) signal = "strong_sell";
        else if (q.pct <= -1) signal = "sell";
      }
      return { symbol: q.symbol, name: q.name, px: q.px, pct: q.pct, signal };
    });

  // ── Financial sector averages ──
  const financialsRaw = financialsResult.data ?? [];
  const finSectorMap = new Map<string, { peSum: number; pbSum: number; roeSum: number; deSum: number; peCount: number; pbCount: number; roeCount: number; deCount: number }>();

  for (const f of financialsRaw) {
    if (!f.ratios_json || typeof f.ratios_json !== "object") continue;
    const ratios = f.ratios_json as Record<string, unknown>;
    const pe = typeof ratios.pe === "number" ? ratios.pe : null;
    const pb = typeof ratios.pb === "number" ? ratios.pb : null;
    const roe = typeof ratios.roe === "number" ? ratios.roe : null;
    const de = typeof ratios.de === "number" ? ratios.de : null;

    if (pe === null && pb === null && roe === null && de === null) continue;

    // Look up sector from securities_master
    const sec = secMap.get(f.symbol);
    const sector = sec?.sector ?? "Unknown";
    const existing = finSectorMap.get(sector) ?? { peSum: 0, pbSum: 0, roeSum: 0, deSum: 0, peCount: 0, pbCount: 0, roeCount: 0, deCount: 0 };

    if (pe !== null) { existing.peSum += pe; existing.peCount++; }
    if (pb !== null) { existing.pbSum += pb; existing.pbCount++; }
    if (roe !== null) { existing.roeSum += roe; existing.roeCount++; }
    if (de !== null) { existing.deSum += de; existing.deCount++; }

    finSectorMap.set(sector, existing);
  }

  const financialSectors: FinancialSectorAvg[] = [...finSectorMap.entries()]
    .map(([sector, data]) => ({
      sector,
      pe: data.peCount > 0 ? data.peSum / data.peCount : null,
      pb: data.pbCount > 0 ? data.pbSum / data.pbCount : null,
      roe: data.roeCount > 0 ? data.roeSum / data.roeCount : null,
      de: data.deCount > 0 ? data.deSum / data.deCount : null,
      count: data.peCount,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // ── Country snapshots (from securities_master) ──
  const countryMap = new Map<string, { count: number; sectors: Set<string> }>();
  for (const sec of securities) {
    const existing = countryMap.get(sec.country) ?? { count: 0, sectors: new Set<string>() };
    existing.count++;
    if (sec.sector) existing.sectors.add(sec.sector);
    countryMap.set(sec.country, existing);
  }
  const countrySnapshots: CountrySnapshot[] = [...countryMap.entries()]
    .map(([country, data]) => ({
      country,
      securityCount: data.count,
      sectorCount: data.sectors.size,
      topSectors: [...data.sectors].sort().slice(0, 5),
    }))
    .sort((a, b) => b.securityCount - a.securityCount);

  // ── Nine fixed sentiment slots (fill from DB where available) ──
  const sentimentRaw = sentimentResult.data ?? [];
  const sentimentValueMap = new Map(sentimentRaw.map((s) => [s.code, { value: s.value, band: s.band }]));
  const sentimentSlots: SentimentSlot[] = SENTIMENT_SLOTS.map((slot) => {
    const db = sentimentValueMap.get(slot.code);
    return {
      code: slot.code,
      label: slot.label,
      value: db?.value ?? null,
      band: db?.band ?? null,
      category: slot.category,
      available: db !== undefined,
    };
  });

  // ── Per-market financial comparison (KR vs US) ──
  const marketFinMap = new Map<string, { peSum: number; pbSum: number; roeSum: number; deSum: number; peCount: number; pbCount: number; roeCount: number; deCount: number; secCount: number }>();

  for (const f of financialsRaw) {
    if (!f.ratios_json || typeof f.ratios_json !== "object") continue;
    const ratios = f.ratios_json as Record<string, unknown>;
    const pe = typeof ratios.pe === "number" ? ratios.pe : null;
    const pb = typeof ratios.pb === "number" ? ratios.pb : null;
    const roe = typeof ratios.roe === "number" ? ratios.roe : null;
    const de = typeof ratios.de === "number" ? ratios.de : null;

    if (pe === null && pb === null && roe === null && de === null) continue;

    const sec = secMap.get(f.symbol);
    // Determine market from country or symbol pattern
    let market = "Other";
    if (sec) {
      market = sec.country === "KR" ? "KR" : sec.country === "US" ? "US" : sec.market ?? "Other";
    } else if (/^\d{6}/.test(f.symbol) || /\.(KS|KQ)$/.test(f.symbol)) {
      market = "KR";
    }

    const existing = marketFinMap.get(market) ?? { peSum: 0, pbSum: 0, roeSum: 0, deSum: 0, peCount: 0, pbCount: 0, roeCount: 0, deCount: 0, secCount: 0 };
    if (pe !== null) { existing.peSum += pe; existing.peCount++; }
    if (pb !== null) { existing.pbSum += pb; existing.pbCount++; }
    if (roe !== null) { existing.roeSum += roe; existing.roeCount++; }
    if (de !== null) { existing.deSum += de; existing.deCount++; }
    existing.secCount++;
    marketFinMap.set(market, existing);
  }

  const marketComparison: MarketFinancialComparison[] = [...marketFinMap.entries()]
    .map(([market, d]) => ({
      market,
      avgPe: d.peCount > 0 ? d.peSum / d.peCount : null,
      avgPb: d.pbCount > 0 ? d.pbSum / d.pbCount : null,
      avgRoe: d.roeCount > 0 ? d.roeSum / d.roeCount : null,
      avgDe: d.deCount > 0 ? d.deSum / d.deCount : null,
      securityCount: d.secCount,
    }))
    .sort((a, b) => b.securityCount - a.securityCount);

  // ── Last updated timestamp ──
  const lastUpdated =
    indices.length > 0
      ? indices.reduce(
          (latest, idx) =>
            (!latest || (rawIndices.find((i) => i.code === idx.code)?.updated_at ?? "") > latest
              ? rawIndices.find((i) => i.code === idx.code)?.updated_at ?? ""
              : latest),
          "" as string,
        )
      : null;

  return {
    indices,
    sectorReturns,
    countrySnapshots,
    krMovers,
    usMovers,
    sentimentSlots,
    highLow,
    techSignals,
    financialSectors,
    marketComparison,
    lastUpdated,
  };
}
