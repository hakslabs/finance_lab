import type { Database } from "@/app/_lib/supabase/database.types";

export type TransactionType = Database["public"]["Enums"]["transaction_type"];

export interface PortfolioHoldingInput {
  readonly symbol: string;
  readonly qty: number;
  readonly avgPx: number | null;
  readonly currency: string;
  readonly currentPx: number | null;
  readonly sector: string | null;
  readonly name?: string;
}

export interface ValuedHolding {
  readonly symbol: string;
  readonly name: string;
  readonly qty: number;
  readonly avgPx: number | null;
  readonly currentPx: number | null;
  readonly currency: string;
  readonly sector: string | null;
  readonly cost: number;
  readonly marketValue: number;
  readonly unrealizedPnl: number;
  readonly unrealizedReturnPct: number | null;
  readonly weight: number;
}

export interface TransactionInput {
  readonly id?: string;
  readonly ts: string;
  readonly type: TransactionType;
  readonly symbol: string;
  readonly qty: number;
  readonly px: number;
  readonly fee: number;
  readonly currency: string;
}

export interface AllocationBucket {
  readonly key: string;
  readonly value: number;
  readonly weight: number;
}

export interface ReturnVsBenchmark {
  readonly portfolioReturnPct: number | null;
  readonly benchmarkReturnPct: number | null;
  readonly spreadPct: number | null;
}

export interface MonthlyHeatmapCell {
  readonly month: string;
  readonly realizedPnl: number;
  readonly dividends: number;
  readonly fees: number;
  readonly transactionCount: number;
}

export interface CapitalGainsSale {
  readonly symbol: string;
  readonly soldQty: number;
  readonly proceeds: number;
  readonly costBasis: number;
  readonly fees: number;
  readonly realizedGain: number;
  readonly currency: string;
}

export interface CapitalGainsSimulation {
  readonly sales: readonly CapitalGainsSale[];
  readonly totalProceeds: number;
  readonly totalCostBasis: number;
  readonly totalFees: number;
  readonly totalRealizedGain: number;
  readonly informationalOnly: true;
}

export function valueHoldings(inputs: readonly PortfolioHoldingInput[]): readonly ValuedHolding[] {
  const preliminary = inputs.map((holding) => {
    const avgPx = holding.avgPx ?? 0;
    const currentPx = holding.currentPx ?? avgPx;
    const cost = holding.qty * avgPx;
    const marketValue = holding.qty * currentPx;
    const unrealizedPnl = marketValue - cost;
    const unrealizedReturnPct = cost > 0 ? (unrealizedPnl / cost) * 100 : null;

    return {
      symbol: holding.symbol,
      name: holding.name ?? holding.symbol,
      qty: holding.qty,
      avgPx: holding.avgPx,
      currentPx: holding.currentPx,
      currency: holding.currency,
      sector: holding.sector,
      cost,
      marketValue,
      unrealizedPnl,
      unrealizedReturnPct,
      weight: 0,
    };
  });

  const totalValue = preliminary.reduce((sum, holding) => sum + holding.marketValue, 0);
  return preliminary.map((holding) => ({
    ...holding,
    weight: totalValue > 0 ? holding.marketValue / totalValue : 0,
  }));
}

export function calculateAllocation(holdings: readonly ValuedHolding[]): readonly AllocationBucket[] {
  const total = holdings.reduce((sum, holding) => sum + holding.marketValue, 0);
  const byCurrency = new Map<string, number>();

  for (const holding of holdings) {
    byCurrency.set(holding.currency, (byCurrency.get(holding.currency) ?? 0) + holding.marketValue);
  }

  return [...byCurrency.entries()]
    .map(([key, value]) => ({ key, value, weight: total > 0 ? value / total : 0 }))
    .sort((a, b) => b.value - a.value || a.key.localeCompare(b.key));
}

export function calculateSectorExposure(holdings: readonly ValuedHolding[]): readonly AllocationBucket[] {
  const total = holdings.reduce((sum, holding) => sum + holding.marketValue, 0);
  const bySector = new Map<string, number>();

  for (const holding of holdings) {
    const key = holding.sector ?? "Unknown";
    bySector.set(key, (bySector.get(key) ?? 0) + holding.marketValue);
  }

  return [...bySector.entries()]
    .map(([key, value]) => ({ key, value, weight: total > 0 ? value / total : 0 }))
    .sort((a, b) => b.value - a.value || a.key.localeCompare(b.key));
}

export function calculateReturnVsBenchmark(
  holdings: readonly ValuedHolding[],
  benchmarkStart: number | null,
  benchmarkEnd: number | null,
): ReturnVsBenchmark {
  const totalCost = holdings.reduce((sum, holding) => sum + holding.cost, 0);
  const totalValue = holdings.reduce((sum, holding) => sum + holding.marketValue, 0);
  const portfolioReturnPct = totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : null;
  const benchmarkReturnPct = benchmarkStart !== null && benchmarkEnd !== null && benchmarkStart > 0
    ? ((benchmarkEnd - benchmarkStart) / benchmarkStart) * 100
    : null;

  return {
    portfolioReturnPct,
    benchmarkReturnPct,
    spreadPct: portfolioReturnPct !== null && benchmarkReturnPct !== null ? portfolioReturnPct - benchmarkReturnPct : null,
  };
}

export function buildMonthlyHeatmap(transactions: readonly TransactionInput[]): readonly MonthlyHeatmapCell[] {
  const cells = new Map<string, MonthlyHeatmapCell>();

  for (const transaction of transactions) {
    const month = transaction.ts.slice(0, 7);
    const current = cells.get(month) ?? { month, realizedPnl: 0, dividends: 0, fees: 0, transactionCount: 0 };
    const realizedPnl = transaction.type === "sell" ? transaction.qty * transaction.px - transaction.fee : 0;
    const dividends = transaction.type === "div" ? transaction.qty * transaction.px - transaction.fee : 0;

    cells.set(month, {
      month,
      realizedPnl: current.realizedPnl + realizedPnl,
      dividends: current.dividends + dividends,
      fees: current.fees + transaction.fee,
      transactionCount: current.transactionCount + 1,
    });
  }

  return [...cells.values()].sort((a, b) => a.month.localeCompare(b.month));
}

export function simulateCapitalGains(transactions: readonly TransactionInput[]): CapitalGainsSimulation {
  const lots = new Map<string, Array<{ qty: number; px: number; feePerShare: number; currency: string }>>();
  const sales: CapitalGainsSale[] = [];
  const sorted = [...transactions].sort((a, b) => a.ts.localeCompare(b.ts));

  for (const transaction of sorted) {
    const key = `${transaction.symbol}:${transaction.currency}`;
    if (transaction.type === "buy") {
      const currentLots = lots.get(key) ?? [];
      currentLots.push({
        qty: transaction.qty,
        px: transaction.px,
        feePerShare: transaction.qty > 0 ? transaction.fee / transaction.qty : 0,
        currency: transaction.currency,
      });
      lots.set(key, currentLots);
    }

    if (transaction.type === "sell") {
      const currentLots = lots.get(key) ?? [];
      let remainingQty = transaction.qty;
      let costBasis = 0;

      while (remainingQty > 0 && currentLots.length > 0) {
        const lot = currentLots[0];
        const matchedQty = Math.min(remainingQty, lot.qty);
        costBasis += matchedQty * (lot.px + lot.feePerShare);
        lot.qty -= matchedQty;
        remainingQty -= matchedQty;
        if (lot.qty === 0) currentLots.shift();
      }

      const soldQty = transaction.qty - remainingQty;
      const proceeds = soldQty * transaction.px;
      sales.push({
        symbol: transaction.symbol,
        soldQty,
        proceeds,
        costBasis,
        fees: transaction.fee,
        realizedGain: proceeds - costBasis - transaction.fee,
        currency: transaction.currency,
      });
      lots.set(key, currentLots);
    }
  }

  return {
    sales,
    totalProceeds: sales.reduce((sum, sale) => sum + sale.proceeds, 0),
    totalCostBasis: sales.reduce((sum, sale) => sum + sale.costBasis, 0),
    totalFees: sales.reduce((sum, sale) => sum + sale.fees, 0),
    totalRealizedGain: sales.reduce((sum, sale) => sum + sale.realizedGain, 0),
    informationalOnly: true,
  };
}
