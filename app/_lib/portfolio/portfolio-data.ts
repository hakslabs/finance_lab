/**
 * Portfolio data helper — server-only, reads user-scoped Supabase tables via RLS.
 *
 * Holdings are derived by database triggers from transactions; this module never
 * writes holdings or bypasses RLS with service keys.
 */

import "server-only";

import type { Database } from "@/app/_lib/supabase/database.types";
import { createRlsSupabaseClient } from "@/app/_lib/supabase/public";
import type {
  AllocationBucket,
  CapitalGainsSimulation,
  MonthlyHeatmapCell,
  ReturnVsBenchmark,
  TransactionInput,
  ValuedHolding,
} from "./performance";
import {
  buildMonthlyHeatmap,
  calculateAllocation,
  calculateReturnVsBenchmark,
  calculateSectorExposure,
  simulateCapitalGains,
  valueHoldings,
} from "./performance";

type HoldingRow = Database["public"]["Tables"]["holdings"]["Row"];
type TransactionRow = Database["public"]["Tables"]["transactions"]["Row"];
type QuoteRow = Database["public"]["Tables"]["quotes"]["Row"];
type SecurityRow = Pick<Database["public"]["Tables"]["securities_master"]["Row"], "symbol" | "name" | "sector" | "currency">;
type IndexRow = Database["public"]["Tables"]["indices"]["Row"];

export interface PortfolioData {
  readonly status: "ready" | "auth-required" | "empty";
  readonly holdings: readonly ValuedHolding[];
  readonly transactions: readonly TransactionInput[];
  readonly allocation: readonly AllocationBucket[];
  readonly sectorExposure: readonly AllocationBucket[];
  readonly returnVsBenchmark: ReturnVsBenchmark;
  readonly monthlyHeatmap: readonly MonthlyHeatmapCell[];
  readonly capitalGains: CapitalGainsSimulation;
  readonly totalCost: number;
  readonly totalMarketValue: number;
  readonly totalUnrealizedPnl: number;
  readonly benchmarkCode: string | null;
  readonly authRequired: boolean;
}

function emptyPortfolioData(status: PortfolioData["status"]): PortfolioData {
  return {
    status,
    holdings: [],
    transactions: [],
    allocation: [],
    sectorExposure: [],
    returnVsBenchmark: { portfolioReturnPct: null, benchmarkReturnPct: null, spreadPct: null },
    monthlyHeatmap: [],
    capitalGains: { sales: [], totalProceeds: 0, totalCostBasis: 0, totalFees: 0, totalRealizedGain: 0, informationalOnly: true },
    totalCost: 0,
    totalMarketValue: 0,
    totalUnrealizedPnl: 0,
    benchmarkCode: null,
    authRequired: status === "auth-required",
  };
}

export function buildPortfolioData(
  holdingRows: readonly HoldingRow[],
  transactionRows: readonly TransactionRow[],
  quoteRows: readonly QuoteRow[],
  securityRows: readonly SecurityRow[],
  indexRows: readonly IndexRow[],
): PortfolioData {
  const quoteMap = new Map(quoteRows.map((quote) => [quote.symbol, quote]));
  const securityMap = new Map(securityRows.map((security) => [security.symbol, security]));

  const holdings = valueHoldings(holdingRows.map((holding) => {
    const security = securityMap.get(holding.symbol);
    const quote = quoteMap.get(holding.symbol);
    return {
      symbol: holding.symbol,
      name: security?.name ?? holding.symbol,
      qty: holding.qty,
      avgPx: holding.avg_px,
      currency: holding.currency,
      currentPx: quote?.px ?? null,
      sector: security?.sector ?? null,
    };
  }));

  const transactions = transactionRows.map((transaction): TransactionInput => ({
    id: transaction.id,
    ts: transaction.ts,
    type: transaction.type,
    symbol: transaction.symbol,
    qty: transaction.qty,
    px: transaction.px,
    fee: transaction.fee,
    currency: transaction.currency,
  }));

  const benchmark = selectBenchmark(indexRows);
  const totalCost = holdings.reduce((sum, holding) => sum + holding.cost, 0);
  const totalMarketValue = holdings.reduce((sum, holding) => sum + holding.marketValue, 0);

  if (holdings.length === 0 && transactions.length === 0) {
    return emptyPortfolioData("empty");
  }

  return {
    status: "ready",
    holdings,
    transactions,
    allocation: calculateAllocation(holdings),
    sectorExposure: calculateSectorExposure(holdings),
    returnVsBenchmark: calculateReturnVsBenchmark(holdings, benchmark?.start ?? null, benchmark?.end ?? null),
    monthlyHeatmap: buildMonthlyHeatmap(transactions),
    capitalGains: simulateCapitalGains(transactions),
    totalCost,
    totalMarketValue,
    totalUnrealizedPnl: totalMarketValue - totalCost,
    benchmarkCode: benchmark?.code ?? null,
    authRequired: false,
  };
}

function selectBenchmark(indexRows: readonly IndexRow[]): { readonly code: string; readonly start: number | null; readonly end: number | null } | null {
  const preferred = indexRows.find((index) => index.code === "SP500") ?? indexRows[0];
  if (!preferred) return null;
  const spark = preferred.spark;
  const start = spark.length > 0 ? spark[0] : null;
  const end = preferred.value ?? (spark.length > 0 ? spark[spark.length - 1] : null);
  return { code: preferred.code, start, end };
}

export async function fetchPortfolioData(): Promise<PortfolioData> {
  const supabase = createRlsSupabaseClient();

  const [holdingsResult, transactionsResult, quotesResult, indicesResult, securitiesResult] = await Promise.all([
    supabase.from("holdings").select("id,user_id,symbol,qty,avg_px,currency,updated_at").order("symbol"),
    supabase.from("transactions").select("id,user_id,ts,type,symbol,qty,px,fee,currency").order("ts", { ascending: false }).limit(500),
    supabase.from("quotes").select("symbol,px,pct,ts").limit(1000),
    supabase.from("indices").select("code,value,change,spark,updated_at").in("code", ["SP500", "KOSPI", "NASDAQ"]),
    supabase.from("securities_master").select("symbol,name,sector,currency").limit(1000),
  ]);

  const holdingRows = holdingsResult.data ?? [];
  const transactionRows = transactionsResult.data ?? [];

  if (holdingRows.length === 0 && transactionRows.length === 0) {
    return emptyPortfolioData("auth-required");
  }

  return buildPortfolioData(
    holdingRows,
    transactionRows,
    quotesResult.data ?? [],
    securitiesResult.data ?? [],
    indicesResult.data ?? [],
  );
}
