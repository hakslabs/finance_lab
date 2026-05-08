/**
 * Screener data helper — server-only, reads Supabase cache tables.
 *
 * Provides pure filter/score/pagination functions over cached
 * securities_master, quotes, quotes_daily, and financials rows.
 * No external API calls; no service-key usage.
 */

import "server-only";

import { createRlsSupabaseClient } from "@/app/_lib/supabase/public";

// ── Types ────────────────────────────────────────────────────────────────

/** Supported view modes for the screener results area. */
export type ScreenerView = "table" | "heatmap" | "chart";

/** Screener URL query parameters (all optional). */
export interface ScreenerFilters {
  readonly market?: string;
  readonly sector?: string;
  readonly cap?: string;
  readonly valuation?: string;
  readonly quality?: string;
  readonly return6m?: string;
  readonly quantFactor?: string;
  readonly minScore?: number;
  readonly view?: ScreenerView;
  readonly page?: number;
  readonly limit?: number;
}

/** A single screener result row. */
export interface ScreenerResult {
  readonly symbol: string;
  readonly name: string;
  readonly market: string | null;
  readonly sector: string | null;
  readonly country: string;
  readonly px: number | null;
  readonly pct: number | null;
  readonly pe: number | null;
  readonly pb: number | null;
  readonly roe: number | null;
  readonly de: number | null;
  readonly mcapBucket: string | null;
  readonly return6m: number | null;
  readonly score: number;
}

/** Paginated screener output. */
export interface ScreenerOutput {
  readonly results: readonly ScreenerResult[];
  readonly total: number;
  readonly page: number;
  readonly totalPages: number;
  readonly filters: ScreenerFilters;
}

/** Raw security master row used internally. */
interface SecurityRow {
  readonly symbol: string;
  readonly name: string;
  readonly country: string;
  readonly market: string | null;
  readonly sector: string | null;
  readonly market_cap_bucket: string | null;
}

/** Raw quote row used internally. */
interface QuoteRow {
  readonly symbol: string;
  readonly px: number | null;
  readonly pct: number | null;
}

/** Raw financial ratios row used internally. */
interface FinancialRow {
  readonly symbol: string;
  readonly pe: number | null;
  readonly pb: number | null;
  readonly roe: number | null;
  readonly de: number | null;
}

/** Raw daily quote row used internally. */
interface DailyQuoteRow {
  readonly symbol: string;
  readonly date: string;
  readonly close: number | null;
}

// ── KR symbol normalization (consistent with M2) ─────────────────────────

function normalizeKrDisplaySymbol(symbol: string): string | null {
  const displaySymbol = symbol.replace(/\.(KS|KQ)$/u, "");
  return /^\d{6}$/u.test(displaySymbol) ? displaySymbol : null;
}

/** ISO date string for ~6 months ago (used for quotes_daily range query). */
function sixMonthsAgoISO(): string {
  const d = new Date();
  d.setMonth(d.getMonth() - 6);
  return d.toISOString().slice(0, 10);
}

// ── Scoring ──────────────────────────────────────────────────────────────

/**
 * Compute a composite 0–100 score for a single security.
 * Higher = more interesting based on momentum + valuation quality.
 * Tolerates sparse financial data gracefully.
 */
export function computeScore(row: {
  pct: number | null;
  pe: number | null;
  pb: number | null;
  roe: number | null;
}): number {
  let score = 50; // baseline

  // Momentum component (±25 points)
  if (row.pct !== null) {
    if (row.pct >= 5) score += 25;
    else if (row.pct >= 2) score += 15;
    else if (row.pct >= 0.5) score += 8;
    else if (row.pct <= -5) score -= 10;
    else if (row.pct <= -2) score -= 5;
  }

  // Valuation component (±20 points)
  if (row.pe !== null) {
    if (row.pe > 0 && row.pe < 12) score += 15; // cheap
    else if (row.pe >= 12 && row.pe < 20) score += 5; // reasonable
    else if (row.pe >= 40) score -= 10; // expensive
  }
  if (row.pb !== null) {
    if (row.pb > 0 && row.pb < 1.5) score += 5;
    else if (row.pb >= 6) score -= 5;
  }

  // Quality component (±5 points)
  if (row.roe !== null && row.roe > 15) score += 5;

  return Math.max(0, Math.min(100, score));
}

// ── Filtering ────────────────────────────────────────────────────────────

/**
 * Apply screener filters to an array of scored result rows.
 * Pure function — no side effects, no DB access.
 */
export function applyFilters(
  rows: readonly ScreenerResult[],
  filters: ScreenerFilters,
): readonly ScreenerResult[] {
  let filtered = [...rows];

  if (filters.market) {
    const m = filters.market.toLowerCase();
    filtered = filtered.filter((r) => r.market?.toLowerCase() === m);
  }

  if (filters.sector) {
    const s = filters.sector.toLowerCase();
    filtered = filtered.filter((r) => r.sector?.toLowerCase() === s);
  }

  if (filters.cap) {
    const c = filters.cap.toLowerCase();
    filtered = filtered.filter((r) => r.mcapBucket?.toLowerCase() === c);
  }

  // Valuation band: derived from P/E ratio
  if (filters.valuation) {
    const v = filters.valuation.toLowerCase();
    filtered = filtered.filter((r) => {
      if (r.pe === null) return false;
      switch (v) {
        case "value": return r.pe > 0 && r.pe < 15;
        case "growth": return r.pe >= 15 && r.pe < 30;
        case "blend": return r.pe >= 20 && r.pe < 40;
        case "expensive": return r.pe >= 40;
        default: return true;
      }
    });
  }

  // Quality band: derived from ROE
  if (filters.quality) {
    const q = filters.quality.toLowerCase();
    filtered = filtered.filter((r) => {
      if (r.roe === null) return false;
      switch (q) {
        case "high": return r.roe > 15;
        case "moderate": return r.roe > 5 && r.roe <= 15;
        case "low": return r.roe <= 5;
        case "negative": return r.roe < 0;
        default: return true;
      }
    });
  }

  // 6-month return band: derived from return6m field
  if (filters.return6m) {
    const b = filters.return6m.toLowerCase();
    filtered = filtered.filter((r) => {
      if (r.return6m === null) return false;
      switch (b) {
        case "strong_up": return r.return6m >= 25;
        case "up": return r.return6m >= 10;
        case "flat": return r.return6m >= -5 && r.return6m < 10;
        case "down": return r.return6m < -5 && r.return6m >= -25;
        case "strong_down": return r.return6m < -25;
        default: return true;
      }
    });
  }

  // Quant factor chip: maps to internal score ranges
  if (filters.quantFactor) {
    const qf = filters.quantFactor.toLowerCase();
    filtered = filtered.filter((r) => {
      switch (qf) {
        case "momentum": return r.score >= 60;
        case "value": return r.pe !== null && r.pe > 0 && r.pe < 25 && r.score >= 50;
        case "quality": return r.roe !== null && r.roe > 10 && r.score >= 50;
        case "income": return r.de !== null && r.de < 2 && r.score >= 45;
        case "balanced": return r.score >= 45 && r.score <= 70;
        default: return true;
      }
    });
  }

  if (typeof filters.minScore === "number") {
    const min = filters.minScore;
    filtered = filtered.filter((r) => r.score >= min);
  }

  return filtered;
}

// ── Pagination ───────────────────────────────────────────────────────────

/**
 * Slice results for the requested page.
 * Pure function — no side effects.
 */
export function paginate(
  rows: readonly ScreenerResult[],
  page: number,
  limit: number,
): { readonly results: readonly ScreenerResult[]; readonly total: number; readonly page: number; readonly totalPages: number } {
  const total = rows.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * limit;
  return {
    results: rows.slice(start, start + limit),
    total,
    page: safePage,
    totalPages,
  };
}

// ── Parse URL search params into typed filters ───────────────────────────

/**
 * Parse URLSearchParams into a ScreenerFilters object.
 * Gracefully handles missing/invalid values.
 */
export function parseScreenerParams(params: URLSearchParams): ScreenerFilters {
  const market = params.get("market") ?? undefined;
  const sector = params.get("sector") ?? undefined;
  const cap = params.get("cap") ?? undefined;
  const valuation = params.get("valuation") ?? undefined;
  const quality = params.get("quality") ?? undefined;
  const return6m = params.get("return6m") ?? undefined;
  const quantFactor = params.get("quantFactor") ?? undefined;
  const rawMinScore = params.get("minScore");
  const viewParam = params.get("view");
  const rawPage = params.get("page");
  const rawLimit = params.get("limit");

  const minScore = rawMinScore !== null ? Number(rawMinScore) : undefined;
  const page = rawPage !== null ? Number(rawPage) : 1;
  const limit = rawLimit !== null ? Math.min(Math.max(1, Number(rawLimit)), 100) : 25;

  const view: ScreenerView | undefined =
    viewParam === "table" || viewParam === "heatmap" || viewParam === "chart"
      ? viewParam
      : undefined;

  return {
    market,
    sector,
    cap,
    valuation,
    quality,
    return6m,
    quantFactor,
    minScore: typeof minScore === "number" && !Number.isNaN(minScore) ? minScore : undefined,
    view,
    page: typeof page === "number" && !Number.isNaN(page) && page > 0 ? page : 1,
    limit: typeof limit === "number" && !Number.isNaN(limit) ? limit : 25,
  };
}

// ── Main fetcher ────────────────────────────────────────────────────────

/**
 * Fetch all securities with quote and financial enrichment, then filter/score/paginate.
 * This is the primary entry point for the /screener page.
 */
export async function fetchScreenerData(filters: ScreenerFilters): Promise<ScreenerOutput> {
  const supabase = createRlsSupabaseClient();

  const [securitiesResult, quotesResult, financialsResult, dailyResult] = await Promise.all([
    supabase
      .from("securities_master")
      .select("symbol,name,country,market,sector,market_cap_bucket")
      .in("asset_class", ["equity", "etf"])
      .order("symbol")
      .limit(500),
    supabase
      .from("quotes")
      .select("symbol,px,pct")
      .limit(500),
    supabase
      .from("financials")
      .select("symbol,ratios_json")
      .limit(500),
    supabase
      .from("quotes_daily")
      .select("symbol,date,close")
      .gte("date", sixMonthsAgoISO())
      .limit(2000),
  ]);

  const securities: SecurityRow[] = securitiesResult.data ?? [];
  const quotesRaw: QuoteRow[] = quotesResult.data ?? [];
  const financialsRaw = financialsResult.data ?? [];
  const dailyRaw: DailyQuoteRow[] = dailyResult.data ?? [];

  // Build lookup maps
  const quoteMap = new Map<string, QuoteRow>();
  for (const q of quotesRaw) {
    if (!quoteMap.has(q.symbol)) quoteMap.set(q.symbol, q);
  }

  // Build 6-month return map from daily data: (latest - oldest) / oldest * 100
  const return6mMap = new Map<string, number>();
  const dailyBySymbol = new Map<string, DailyQuoteRow[]>();
  for (const d of dailyRaw) {
    const list = dailyBySymbol.get(d.symbol) ?? [];
    list.push(d);
    dailyBySymbol.set(d.symbol, list);
  }
  for (const [symbol, rows] of dailyBySymbol) {
    if (rows.length < 2) continue;
    const sorted = [...rows].sort((a, b) => a.date.localeCompare(b.date));
    const oldest = sorted[0].close;
    const latest = sorted[sorted.length - 1].close;
    if (oldest != null && latest != null && oldest > 0) {
      return6mMap.set(symbol, ((latest - oldest) / oldest) * 100);
    }
  }

  const finMap = new Map<string, FinancialRow>();
  for (const f of financialsRaw) {
    if (!f.ratios_json || typeof f.ratios_json !== "object") continue;
    const ratios = f.ratios_json as Record<string, unknown>;
    const pe = typeof ratios.pe === "number" ? ratios.pe : null;
    const pb = typeof ratios.pb === "number" ? ratios.pb : null;
    const roe = typeof ratios.roe === "number" ? ratios.roe : null;
    const de = typeof ratios.de === "number" ? ratios.de : null;
    if (!finMap.has(f.symbol)) {
      finMap.set(f.symbol, { symbol: f.symbol, pe, pb, roe, de });
    }
  }

  // Merge into scored result rows
  const allResults: ScreenerResult[] = securities.map((sec) => {
    // For KR symbols, try normalized lookup first
    const krNorm = normalizeKrDisplaySymbol(sec.symbol);
    const quote = quoteMap.get(sec.symbol) ?? quoteMap.get(krNorm ?? "") ?? (krNorm ? quoteMap.get(`${krNorm}.KS`) : null) ?? null;
    const fin = finMap.get(sec.symbol) ?? finMap.get(krNorm ?? "") ?? null;
    // 6M return: try raw symbol, then KR normalized, then .KS suffix
    const r6m = return6mMap.get(sec.symbol) ?? return6mMap.get(krNorm ?? "") ?? (krNorm ? return6mMap.get(`${krNorm}.KS`) : undefined) ?? null;

    const pct = quote?.pct ?? null;
    const pe = fin?.pe ?? null;
    const pb = fin?.pb ?? null;
    const roe = fin?.roe ?? null;
    const de = fin?.de ?? null;

    const score = computeScore({ pct, pe, pb, roe });

    return {
      symbol: krNorm ?? sec.symbol,
      name: sec.name,
      market: sec.market,
      sector: sec.sector,
      country: sec.country,
      px: quote?.px ?? null,
      pct,
      pe,
      pb,
      roe,
      de,
      mcapBucket: sec.market_cap_bucket,
      return6m: r6m,
      score,
    };
  });

  // Filter → Paginate
  const filtered = applyFilters(allResults, filters);
  const paginated = paginate(filtered, filters.page ?? 1, filters.limit ?? 25);

  return {
    results: paginated.results,
    total: paginated.total,
    page: paginated.page,
    totalPages: paginated.totalPages,
    filters,
  };
}

// ── Facet metadata for filter UI ─────────────────────────────────────────

/**
 * Fetch distinct filter facet values from securities_master.
 * Used to populate the filter rail dropdowns.
 */
export async function fetchScreenerFacets(): Promise<{
  readonly markets: readonly string[];
  readonly sectors: readonly string[];
  readonly capBuckets: readonly string[];
}> {
  const supabase = createRlsSupabaseClient();

  const [marketsResult, sectorsResult, capsResult] = await Promise.all([
    supabase
      .from("securities_master")
      .select("market")
      .in("asset_class", ["equity", "etf"]),
    supabase
      .from("securities_master")
      .select("sector")
      .in("asset_class", ["equity", "etf"]),
    supabase
      .from("securities_master")
      .select("market_cap_bucket")
      .in("asset_class", ["equity", "etf"]),
  ]);

  const unique = <T>(arr: ReadonlyArray<T | null>): T[] =>
    [...new Set(arr.filter((v): v is T => v !== null))].sort();

  return {
    markets: unique((marketsResult.data ?? []).map((r) => r.market)),
    sectors: unique((sectorsResult.data ?? []).map((r) => r.sector)),
    capBuckets: unique((capsResult.data ?? []).map((r) => r.market_cap_bucket)),
  };
}
