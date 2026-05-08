import { redirect } from "next/navigation";

import { readTemporaryAuthCookie } from "@/app/_lib/auth/cookies";
import { GlobalHeader } from "@/app/_lib/home/global-header";
import type {
  AllocationBucket,
  CapitalGainsSimulation,
  MonthlyHeatmapCell,
} from "@/app/_lib/portfolio/performance";
import { fetchPortfolioData } from "@/app/_lib/portfolio/portfolio-data";

export const metadata = {
  title: "STOCKLAB — Portfolio",
  description:
    "Portfolio overview with holdings, allocation, sector exposure, performance tracking, and transaction history.",
};

/** Tab IDs for the portfolio page. */
export type PortfolioTabId = "summary" | "holdings" | "transactions" | "performance";

const PORTFOLIO_TABS: readonly { id: PortfolioTabId; label: string }[] = [
  { id: "summary", label: "Summary" },
  { id: "holdings", label: "Holdings" },
  { id: "transactions", label: "Transactions" },
  { id: "performance", label: "Performance" },
];

// ── Page ────────────────────────────────────────────────────────────────

/**
 * Portfolio page — server-rendered with tabbed views for summary, holdings,
 * transactions, and performance metrics.
 *
 * Protected by the temporary M0 auth session.
 * URL param: ?tab=summary|holdings|transactions|performance
 */
export default async function PortfolioPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await readTemporaryAuthCookie();
  if (!session) {
    redirect("/login");
  }

  const params = (await searchParams) ?? {};
  const selectedTab = typeof params.tab === "string" ? params.tab : undefined;
  const activeTab: PortfolioTabId =
    PORTFOLIO_TABS.find((t) => t.id === selectedTab)?.id ?? "summary";

  const data = await fetchPortfolioData();

  return (
    <div style={{ minHeight: "100vh", background: "var(--sl-bg)" }}>
      <GlobalHeader userName={session?.role ?? undefined} />

      <main
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "var(--sl-space-5) var(--sl-space-6)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--sl-space-5)",
        }}
      >
        {/* Page header */}
        <header>
          <h1 className="sl-h1">Portfolio</h1>
          <p className="sl-body-sm" style={{ marginTop: "var(--sl-space-2)", color: "var(--sl-ink-sub)" }}>
            Track your holdings, allocation, returns, and transaction history.
          </p>
        </header>

        {/* Auth-required / empty state banner */}
        {(data.status === "auth-required" || data.status === "empty") && (
          <AuthRequiredBanner status={data.status} />
        )}

        {/* Tab navigation */}
        <div
          role="tablist"
          aria-label="Portfolio tabs"
          style={{
            display: "flex",
            gap: "var(--sl-space-1)",
            borderBottom: "1px solid var(--sl-line)",
            paddingBottom: "var(--sl-space-2)",
          }}
        >
          {PORTFOLIO_TABS.map((tab) => (
            <a
              key={tab.id}
              href={`?tab=${tab.id}`}
              role="tab"
              aria-selected={activeTab === tab.id}
              data-active={activeTab === tab.id ? "true" : undefined}
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "var(--sl-space-2) var(--sl-space-4)",
                fontSize: 13,
                fontWeight: activeTab === tab.id ? 600 : 500,
                color: activeTab === tab.id ? "var(--sl-brand)" : "var(--sl-muted)",
                textDecoration: "none",
                borderBottom: activeTab === tab.id ? "2px solid var(--sl-brand)" : "2px solid transparent",
                transition: "all var(--sl-motion-fast)",
                marginBottom: "-1px",
              }}
            >
              {tab.label}
            </a>
          ))}
        </div>

        {/* Tab panels */}
        {PORTFOLIO_TABS.map((tab) => (
          <section
            key={tab.id}
            id={tab.id}
            role="tabpanel"
            aria-label={`${tab.label} panel`}
            aria-hidden={activeTab !== tab.id}
            style={{ display: activeTab === tab.id ? "block" : "none" }}
          >
            {renderTabPanel(tab.id, data)}
          </section>
        ))}

        {/* Footer */}
        <footer
          style={{
            textAlign: "center",
            paddingTop: "var(--sl-space-6)",
            paddingBottom: "var(--sl-space-8)",
            marginTop: "var(--sl-space-5)",
            borderTop: "1px solid var(--sl-line)",
          }}
        >
          <span className="sl-caption">
            Referential use only. Not investment advice. User is responsible for their own decisions.
          </span>
          <br />
          <span className="sl-caption" style={{ color: "var(--sl-faint)" }}>
            STOCKLAB M5 &middot; Portfolio
          </span>
        </footer>
      </main>
    </div>
  );
}

// ── Tab Panel Renderers ─────────────────────────────────────────────────

function renderTabPanel(
  tabId: PortfolioTabId,
  data: Awaited<ReturnType<typeof fetchPortfolioData>>,
) {
  switch (tabId) {
    case "summary":
      return <SummaryTab data={data} />;
    case "holdings":
      return <HoldingsTab data={data} />;
    case "transactions":
      return <TransactionsTab data={data} />;
    case "performance":
      return <PerformanceTab data={data} />;
  }
}

// ── Summary Tab ─────────────────────────────────────────────────────────

function SummaryTab({ data }: { data: Awaited<ReturnType<typeof fetchPortfolioData>> }) {
  const pnlColor = data.totalUnrealizedPnl >= 0 ? "var(--sl-up)" : "var(--sl-down)";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--sl-space-5)" }}>
      {/* Total assets row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "var(--sl-space-4)",
        }}
      >
        <StatCard
          label="Total Assets"
          value={data.totalMarketValue !== 0 ? formatCurrency(data.totalMarketValue) : "\u2014"}
          sub={data.status === "ready" ? `${data.holdings.length} positions` : "No data yet"}
        />
        <StatCard
          label="Total Cost"
          value={data.totalCost !== 0 ? formatCurrency(data.totalCost) : "\u2014"}
          sub="Basis"
        />
        <StatCard
          label="Unrealized P/L"
          value={data.totalUnrealizedPnl !== 0 ? formatCurrency(data.totalUnrealizedPnl) : "\u2014"}
          sub={
            data.totalMarketValue > 0 && data.totalCost > 0
              ? `${((data.totalUnrealizedPnl / data.totalCost) * 100).toFixed(2)}%`
              : ""
          }
          color={pnlColor}
        />
      </div>

      {/* Allocation + Sector side by side */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
          gap: "var(--sl-space-5)",
        }}
      >
        {/* Allocation donut/bars */}
        <section className="sl-card" aria-label="Asset allocation" style={{ padding: "var(--sl-space-5) var(--sl-space-6)" }}>
          <div className="sl-label" style={{ marginBottom: "var(--sl-space-4)" }}>
            Asset Allocation
          </div>
          {data.allocation.length > 0 ? (
            <AllocationBars buckets={data.allocation} total={data.totalMarketValue} />
          ) : (
            <EmptyState message="No allocation data available." compact />
          )}
        </section>

        {/* Sector exposure */}
        <section className="sl-card" aria-label="Sector exposure" style={{ padding: "var(--sl-space-5) var(--sl-space-6)" }}>
          <div className="sl-label" style={{ marginBottom: "var(--sl-space-4)" }}>
            Sector Exposure
          </div>
          {data.sectorExposure.length > 0 ? (
            <SectorBars buckets={data.sectorExposure} total={data.totalMarketValue} />
          ) : (
            <EmptyState message="No sector data available." compact />
          )}
        </section>
      </div>

      {/* Return vs Benchmark */}
      <section className="sl-card" aria-label="Return vs benchmark" style={{ padding: "var(--sl-space-5) var(--sl-space-6)" }}>
        <div className="sl-label" style={{ marginBottom: "var(--sl-space-4)" }}>
          Return vs Benchmark{data.benchmarkCode ? ` (${data.benchmarkCode})` : ""}
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "var(--sl-space-4)",
          }}
        >
          <StatCard
            label="Portfolio Return"
            value={data.returnVsBenchmark.portfolioReturnPct !== null ? `${data.returnVsBenchmark.portfolioReturnPct.toFixed(2)}%` : "\u2014"}
            color={data.returnVsBenchmark.portfolioReturnPct !== null && data.returnVsBenchmark.portfolioReturnPct >= 0 ? "var(--sl-up)" : "var(--sl-down)"}
          />
          <StatCard
            label="Benchmark Return"
            value={data.returnVsBenchmark.benchmarkReturnPct !== null ? `${data.returnVsBenchmark.benchmarkReturnPct.toFixed(2)}%` : "\u2014"}
            color={data.returnVsBenchmark.benchmarkReturnPct !== null && data.returnVsBenchmark.benchmarkReturnPct >= 0 ? "var(--sl-up)" : "var(--sl-down)"}
          />
          <StatCard
            label="Spread (Alpha)"
            value={data.returnVsBenchmark.spreadPct !== null ? `${data.returnVsBenchmark.spreadPct.toFixed(2)}%` : "\u2014"}
            color={data.returnVsBenchmark.spreadPct !== null && data.returnVsBenchmark.spreadPct >= 0 ? "var(--sl-up)" : "var(--sl-down)"}
          />
        </div>
      </section>
    </div>
  );
}

// ── Holdings Tab ─────────────────────────────────────────────────────────

function HoldingsTab({ data }: { data: Awaited<ReturnType<typeof fetchPortfolioData>> }) {
  return (
    <section className="sl-card" aria-label="Holdings table" style={{ overflow: "hidden" }}>
      {data.holdings.length > 0 ? (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "var(--sl-surface-alt)", borderBottom: "1px solid var(--sl-line)" }}>
                <th style={{ textAlign: "left", padding: "var(--sl-space-3) var(--sl-space-4)", color: "var(--sl-muted)", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em" }}>Symbol</th>
                <th style={{ textAlign: "left", padding: "var(--sl-space-3) var(--sl-space-4)", color: "var(--sl-muted)", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em" }}>Name</th>
                <th style={{ textAlign: "right", padding: "var(--sl-space-3) var(--sl-space-4)", color: "var(--sl-muted)", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em" }}>Qty</th>
                <th style={{ textAlign: "right", padding: "var(--sl-space-3) var(--sl-space-4)", color: "var(--sl-muted)", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em" }}>Avg Cost</th>
                <th style={{ textAlign: "right", padding: "var(--sl-space-3) var(--sl-space-4)", color: "var(--sl-muted)", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em" }}>Current Px</th>
                <th style={{ textAlign: "right", padding: "var(--sl-space-3) var(--sl-space-4)", color: "var(--sl-muted)", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em" }}>Mkt Value</th>
                <th style={{ textAlign: "right", padding: "var(--sl-space-3) var(--sl-space-4)", color: "var(--sl-muted)", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em" }}>P/L</th>
                <th style={{ textAlign: "right", padding: "var(--sl-space-3) var(--sl-space-4)", color: "var(--sl-muted)", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em" }}>Weight</th>
              </tr>
            </thead>
            <tbody>
              {data.holdings.map((holding) => {
                const pnlColor = holding.unrealizedPnl >= 0 ? "var(--sl-up)" : "var(--sl-down)";
                return (
                  <tr key={holding.symbol} style={{ borderBottom: "1px solid var(--sl-hairline)" }}>
                    <td style={{ padding: "var(--sl-space-2) var(--sl-space-4)" }}>
                      <a
                        href={`/stock/${holding.symbol}`}
                        className="sl-mono"
                        style={{ fontWeight: 700, fontSize: 13, color: "var(--sl-brand)", textDecoration: "none" }}
                      >
                        {holding.symbol}
                      </a>
                    </td>
                    <td style={{ padding: "var(--sl-space-2) var(--sl-space-4)", color: "var(--sl-ink-sub)", fontSize: 12 }}>{holding.name}</td>
                    <td style={{ padding: "var(--sl-space-2) var(--sl-space-4)", textAlign: "right" }} className="sl-mono">
                      {formatNumber(holding.qty)}
                    </td>
                    <td style={{ padding: "var(--sl-space-2) var(--sl-space-4)", textAlign: "right" }} className="sl-mono">
                      {formatPx(holding.avgPx)}
                    </td>
                    <td style={{ padding: "var(--sl-space-2) var(--sl-space-4)", textAlign: "right" }} className="sl-mono">
                      {formatPx(holding.currentPx)}
                    </td>
                    <td style={{ padding: "var(--sl-space-2) var(--sl-space-4)", textAlign: "right" }} className="sl-mono">
                      {formatCurrency(holding.marketValue)}
                    </td>
                    <td style={{ padding: "var(--sl-space-2) var(--sl-space-4)", textAlign: "right", color: pnlColor }} className="sl-mono">
                      {formatCurrency(holding.unrealizedPnl)}
                      {holding.unrealizedReturnPct !== null && (
                        <span style={{ fontSize: 11, marginLeft: 4 }}>
                          ({holding.unrealizedReturnPct >= 0 ? "+" : ""}{holding.unrealizedReturnPct.toFixed(1)}%)
                        </span>
                      )}
                    </td>
                    <td style={{ padding: "var(--sl-space-2) var(--sl-space-4)", textAlign: "right" }} className="sl-mono">
                      {(holding.weight * 100).toFixed(1)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ padding: "var(--sl-space-6)" }}>
          <EmptyState message="No holdings found. Add positions through the transactions tab once real OAuth is enabled." />
        </div>
      )}
    </section>
  );
}

// ── Transactions Tab ────────────────────────────────────────────────────

function TransactionsTab({ data }: { data: Awaited<ReturnType<typeof fetchPortfolioData>> }) {
  const recentTransactions = data.transactions.slice(0, 10);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--sl-space-5)" }}>
      {/* Disabled add transaction CTA */}
      <section className="sl-card" style={{ padding: "var(--sl-space-4) var(--sl-space-5)" }}>
        <DisabledAction
          label="+ Add Transaction"
          reason="Requires real Supabase auth (OAuth). Temporary sessions cannot write to the transactions table."
        />
        <div style={{ marginTop: "var(--sl-space-3)" }}>
          <a
            href="/me/transactions"
            className="sl-btn sl-btn-secondary"
            style={{ fontSize: 12 }}
          >
            View All Transactions &rarr;
          </a>
        </div>
      </section>

      {/* Recent transactions table */}
      <section className="sl-card" aria-label="Recent transactions" style={{ overflow: "hidden" }}>
        <div className="sl-label" style={{ padding: "var(--sl-space-4) var(--sl-space-5)" }}>
          Last 10 Transactions
        </div>
        {recentTransactions.length > 0 ? (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "var(--sl-surface-alt)", borderBottom: "1px solid var(--sl-line)" }}>
                  <th style={{ textAlign: "left", padding: "var(--sl-space-2) var(--sl-space-4)", color: "var(--sl-muted)", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em" }}>Date</th>
                  <th style={{ textAlign: "left", padding: "var(--sl-space-2) var(--sl-space-4)", color: "var(--sl-muted)", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em" }}>Type</th>
                  <th style={{ textAlign: "left", padding: "var(--sl-space-2) var(--sl-space-4)", color: "var(--sl-muted)", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em" }}>Symbol</th>
                  <th style={{ textAlign: "right", padding: "var(--sl-space-2) var(--sl-space-4)", color: "var(--sl-muted)", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em" }}>Qty</th>
                  <th style={{ textAlign: "right", padding: "var(--sl-space-2) var(--sl-space-4)", color: "var(--sl-muted)", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em" }}>Price</th>
                  <th style={{ textAlign: "right", padding: "var(--sl-space-2) var(--sl-space-4)", color: "var(--sl-muted)", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em" }}>Fee</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((tx) => (
                  <tr key={tx.id ?? tx.ts} style={{ borderBottom: "1px solid var(--sl-hairline)" }}>
                    <td style={{ padding: "var(--sl-space-2) var(--sl-space-4)" }}>
                      <span className="sl-caption">{formatDate(tx.ts)}</span>
                    </td>
                    <td style={{ padding: "var(--sl-space-2) var(--sl-space-4)" }}>
                      <TransactionBadge type={tx.type} />
                    </td>
                    <td style={{ padding: "var(--sl-space-2) var(--sl-space-4)" }}>
                      <a
                        href={`/stock/${tx.symbol}`}
                        className="sl-mono"
                        style={{ fontWeight: 600, fontSize: 13, color: "var(--sl-brand)", textDecoration: "none" }}
                      >
                        {tx.symbol}
                      </a>
                    </td>
                    <td style={{ padding: "var(--sl-space-2) var(--sl-space-4)", textAlign: "right" }} className="sl-mono">
                      {formatNumber(tx.qty)}
                    </td>
                    <td style={{ padding: "var(--sl-space-2) var(--sl-space-4)", textAlign: "right" }} className="sl-mono">
                      {formatPx(tx.px)}
                    </td>
                    <td style={{ padding: "var(--sl-space-2) var(--sl-space-4)", textAlign: "right" }} className="sl-mono">
                      {tx.fee > 0 ? formatCurrency(tx.fee) : "\u2014"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: "var(--sl-space-4) var(--sl-space-5)" }}>
            <EmptyState message="No transactions recorded yet. Transaction entry requires real Supabase OAuth authentication." compact />
          </div>
        )}
      </section>
    </div>
  );
}

// ── Performance Tab ─────────────────────────────────────────────────────

function PerformanceTab({ data }: { data: Awaited<ReturnType<typeof fetchPortfolioData>> }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--sl-space-5)" }}>
      {/* Monthly heatmap */}
      <section className="sl-card" aria-label="Monthly heatmap" style={{ padding: "var(--sl-space-5) var(--sl-space-6)" }}>
        <div className="sl-label" style={{ marginBottom: "var(--sl-space-4)" }}>
          Monthly Activity Heatmap
        </div>
        {data.monthlyHeatmap.length > 0 ? (
          <MonthlyHeatmapGrid cells={data.monthlyHeatmap} />
        ) : (
          <EmptyState message="Monthly activity data will appear after transactions are recorded." compact />
        )}
      </section>

      {/* Capital gains simulator (informational-only) */}
      <CapitalGainsCard simulation={data.capitalGains} />
    </div>
  );
}

// ── Shared UI Components ─────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string;
  sub?: string;
  color?: string;
}) {
  return (
    <div
      style={{
        padding: "var(--sl-space-4)",
        borderRadius: "var(--sl-radius-md)",
        background: "var(--sl-surface-alt)",
        border: "1px solid var(--sl-hairline)",
      }}
    >
      <div style={{ fontSize: 11, fontWeight: 600, color: "var(--sl-muted)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "var(--sl-space-2)" }}>
        {label}
      </div>
      <div className="sl-mono" style={{ fontSize: 22, fontWeight: 800, color: color ?? "var(--sl-ink)", letterSpacing: "-0.02em" }}>
        {value}
      </div>
      {sub && <div className="sl-caption" style={{ marginTop: "var(--sl-space-1)" }}>{sub}</div>}
    </div>
  );
}

function AllocationBars({
  buckets,
  total,
}: {
  buckets: readonly AllocationBucket[];
  total: number;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--sl-space-3)" }}>
      {buckets.map((bucket) => {
        const pct = total > 0 ? (bucket.value / total) * 100 : 0;
        return (
          <div key={bucket.key}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "var(--sl-space-1)" }}>
              <span style={{ fontSize: 12, fontWeight: 500 }}>{bucket.key}</span>
              <span className="sl-mono" style={{ fontSize: 12 }}>{pct.toFixed(1)}%</span>
            </div>
            <div style={{ height: 10, background: "var(--sl-surface)", borderRadius: "var(--sl-radius-pill)", overflow: "hidden" }}>
              <div
                style={{
                  width: `${Math.min(pct, 100)}%`,
                  height: "100%",
                  borderRadius: "var(--sl-radius-pill)",
                  background: getChartColor(buckets.indexOf(bucket)),
                  transition: "width var(--sl-motion-base)",
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SectorBars({
  buckets,
  total,
}: {
  buckets: readonly AllocationBucket[];
  total: number;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--sl-space-3)" }}>
      {buckets.map((bucket) => {
        const pct = total > 0 ? (bucket.value / total) * 100 : 0;
        return (
          <div key={bucket.key}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "var(--sl-space-1)" }}>
              <span style={{ fontSize: 12, fontWeight: 500 }}>{bucket.key}</span>
              <span className="sl-mono" style={{ fontSize: 12 }}>{pct.toFixed(1)}%</span>
            </div>
            <div style={{ height: 10, background: "var(--sl-surface)", borderRadius: "var(--sl-radius-pill)", overflow: "hidden" }}>
              <div
                style={{
                  width: `${Math.min(pct, 100)}%`,
                  height: "100%",
                  borderRadius: "var(--sl-radius-pill)",
                  background: getChartColor(buckets.indexOf(bucket)),
                  transition: "width var(--sl-motion-base)",
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MonthlyHeatmapGrid({ cells }: { cells: readonly MonthlyHeatmapCell[] }) {
  // Simple month-by-month grid showing realized P&L intensity
  const maxAbs = Math.max(
    ...cells.map((c) => Math.abs(c.realizedPnl)),
    1,
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--sl-space-2)" }}>
      {cells.map((cell) => {
        const intensity = maxAbs > 0 ? Math.abs(cell.realizedPnl) / maxAbs : 0;
        const bg = cell.realizedPnl >= 0
          ? `rgba(15, 166, 122, ${0.15 + intensity * 0.85})`
          : `rgba(232, 69, 74, ${0.15 + intensity * 0.85})`;

        return (
          <div
            key={cell.month}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--sl-space-3)",
              padding: "var(--sl-space-2) var(--sl-space-3)",
              borderRadius: "var(--sl-radius-sm)",
              background: bg,
            }}
          >
            <span className="sl-mono" style={{ fontSize: 12, fontWeight: 600, minWidth: 56 }}>
              {cell.month}
            </span>
            <span className="sl-mono" style={{ fontSize: 12, color: cell.realizedPnl >= 0 ? "var(--sl-up)" : "var(--sl-down)" }}>
              {cell.realizedPnl !== 0 ? formatCurrency(cell.realizedPnl) : "\u2014"}
            </span>
            <span className="sl-caption" style={{ marginLeft: "auto" }}>
              {cell.transactionCount} tx{cell.transactionCount !== 1 ? "s" : ""}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function CapitalGainsCard({ simulation }: { simulation: CapitalGainsSimulation }) {
  const gainColor = simulation.totalRealizedGain >= 0 ? "var(--sl-up)" : "var(--sl-down)";

  return (
    <section
      className="sl-card"
      aria-label="Capital gains simulator"
      style={{
        padding: "var(--sl-space-5) var(--sl-space-6)",
        borderLeft: "4px solid var(--sl-warn)",
        background: "linear-gradient(135deg, var(--sl-surface), var(--sl-warn-soft))",
      }}
    >
      <div style={{ display: "flex", alignItems: "start", justifyContent: "space-between", gap: "var(--sl-space-4)" }}>
        <div>
          <div className="sl-label" style={{ color: "var(--sl-warn)", marginBottom: "var(--sl-space-2)" }}>
            Capital Gains Simulator \u2014 \ucc38\uace0\uc6a9
          </div>
          <p className="sl-body-sm" style={{ color: "var(--sl-ink-sub)", lineHeight: 1.6, maxWidth: 520 }}>
            This is an informational-only estimate based on FIFO cost basis matching of recorded sell transactions.
            Actual tax liability depends on your jurisdiction, holding periods, wash-sale rules, and other factors.
            Consult a qualified tax professional before making decisions based on these figures.
          </p>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div className="sl-caption" style={{ marginBottom: "var(--sl-space-1)" }}>Realized Gain/Loss</div>
          <div className="sl-mono" style={{ fontSize: 22, fontWeight: 800, color: gainColor }}>
            {simulation.sales.length > 0 ? formatCurrency(simulation.totalRealizedGain) : "\u2014"}
          </div>
          {simulation.sales.length > 0 && (
            <>
              <div className="sl-caption" style={{ marginTop: "var(--sl-space-1)" }}>
                Proceeds: {formatCurrency(simulation.totalProceeds)}
              </div>
              <div className="sl-caption">
                Cost Basis: {formatCurrency(simulation.totalCostBasis)}
              </div>
            </>
          )}
        </div>
      </div>

      {simulation.sales.length > 0 && (
        <div style={{ marginTop: "var(--sl-space-4)" }}>
          <div className="sl-caption" style={{ marginBottom: "var(--sl-space-2)" }}>
            Sales Breakdown ({simulation.sales.length})
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--sl-space-1)", maxHeight: 240, overflowY: "auto" }}>
            {simulation.sales.slice(0, 10).map((sale) => (
              <div
                key={`${sale.symbol}-${sale.proceeds}`}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "var(--sl-space-2) var(--sl-space-3)",
                  borderRadius: "var(--sl-radius-sm)",
                  background: "var(--sl-surface)",
                  fontSize: 12,
                }}
              >
                <span className="sl-mono" style={{ fontWeight: 600 }}>{sale.symbol}</span>
                <span className="sl-caption">{sale.soldQty} shares</span>
                <span className="sl-mono" style={{ color: sale.realizedGain >= 0 ? "var(--sl-up)" : "var(--sl-down)" }}>
                  {formatCurrency(sale.realizedGain)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function AuthRequiredBanner({ status }: { status: "auth-required" | "empty" }) {
  return (
    <section
      className="sl-card"
      style={{
        padding: "var(--sl-space-4) var(--sl-space-5)",
        background: "var(--sl-warn-soft)",
        borderColor: "var(--sl-warn)",
        display: "flex",
        alignItems: "center",
        gap: "var(--sl-space-3)",
      }}
    >
      <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="var(--sl-warn)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
        <title>Shield icon</title>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--sl-ink)" }}>
          {status === "auth-required"
            ? "Real Authentication Required for Portfolio Data"
            : "Portfolio Is Empty"}
        </div>
        <p className="sl-body-sm" style={{ color: "var(--sl-ink-sub)", marginTop: 2 }}>
          {status === "auth-required"
            ? "Portfolio data requires real Supabase OAuth authentication. The temporary session cannot access user-scoped holdings or transactions. Sign in with a real account to see your portfolio."
            : "No holdings or transactions have been recorded yet. Add your first position through the transactions tab after enabling real OAuth."}
        </p>
      </div>
    </section>
  );
}

function DisabledAction({ label, reason }: { label: string; reason: string }) {
  return (
    <button
      type="button"
      disabled
      className="sl-btn"
      style={{
        width: "100%",
        justifyContent: "flex-start",
        fontSize: 12,
        opacity: 0.55,
        cursor: "not-allowed",
        background: "transparent",
        border: "1px dashed var(--sl-line)",
        color: "var(--sl-muted)",
        padding: "var(--sl-space-2) var(--sl-space-3)",
      }}
      title={reason}
    >
      <span>{label}</span>
      <span className="sl-caption" style={{ marginLeft: "auto", fontStyle: "italic" }}>
        OAuth required
      </span>
    </button>
  );
}

function EmptyState({ message, compact = false }: { message: string; compact?: boolean }) {
  return (
    <div
      className="sl-center"
      style={{
        flexDirection: "column",
        gap: compact ? "var(--sl-space-2)" : "var(--sl-space-3)",
        padding: compact ? "var(--sl-space-4) 0" : "var(--sl-space-6) 0",
      }}
    >
      <span className="sl-text-muted sl-body-sm">{message}</span>
    </div>
  );
}

function TransactionBadge({ type }: { type: string }) {
  const config: Record<string, { label: string; bg: string; color: string }> = {
    buy: { label: "Buy", bg: "var(--sl-up-soft)", color: "var(--sl-up)" },
    sell: { label: "Sell", bg: "var(--sl-down-soft)", color: "var(--sl-down)" },
    div: { label: "Div", bg: "var(--sl-brand-soft)", color: "var(--sl-brand-ink)" },
  };
  const c = config[type] ?? { label: type, bg: "var(--sl-surface-alt)", color: "var(--sl-muted)" };

  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 600,
        padding: "2px 8px",
        borderRadius: "var(--sl-radius-sm)",
        background: c.bg,
        color: c.color,
      }}
    >
      {c.label}
    </span>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────

function getChartColor(index: number): string {
  const colors = [
    "var(--sl-cat1)",
    "var(--sl-cat2)",
    "var(--sl-cat3)",
    "var(--sl-cat4)",
    "var(--sl-cat5)",
    "var(--sl-cat6)",
  ];
  return colors[index % colors.length];
}

function formatCurrency(n: number): string {
  if (Math.abs(n) >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (Math.abs(n) >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  if (Math.abs(n) >= 1e3) return `$${n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  return `$${n.toFixed(2)}`;
}

function formatNumber(n: number): string {
  if (Math.abs(n) >= 1e9) return `${(n / 1e9).toFixed(1)}B`;
  if (Math.abs(n) >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (Math.abs(n) >= 1e3) return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
  return n.toLocaleString();
}

function formatPx(px: number | null): string {
  if (px === null) return "\u2014";
  if (px >= 100_000) return px.toLocaleString("en-US", { maximumFractionDigits: 0 });
  if (px >= 1_000) return px.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  return px.toFixed(2);
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return iso;
  }
}
