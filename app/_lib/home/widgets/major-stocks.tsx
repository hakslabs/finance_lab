/**
 * Major stocks strip — shows top US or KR stock quotes.
 *
 * Server-rendered. Horizontal scrolling cards with symbol, name, price, change%.
 */

import type { StockQuote } from "../dashboard-data";

export interface MajorStocksProps {
  readonly stocks: readonly StockQuote[];
  readonly label: string;
  readonly region: "us" | "kr";
}

function formatPrice(px: number | null): string {
  if (px === null) return "—";
  if (px >= 100_000) return px.toLocaleString("en-US", { maximumFractionDigits: 0 });
  if (px >= 1_000) return px.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  return px.toFixed(2);
}

function formatPct(pct: number | null): string {
  if (pct === null) return "—";
  const sign = pct >= 0 ? "+" : "";
  return `${sign}${pct.toFixed(2)}%`;
}

export function MajorStocks({ stocks, label, region }: MajorStocksProps) {
  if (stocks.length === 0) {
    return (
      <section className="sl-card" aria-label={`${label} empty`} style={{ padding: "var(--sl-space-5) var(--sl-space-6)" }}>
        <div className="sl-label" style={{ marginBottom: "var(--sl-space-3)" }}>{label}</div>
        <div
          className="sl-center"
          style={{ flexDirection: "column", gap: "var(--sl-space-3)", padding: "var(--sl-space-5) 0" }}
        >
          <span className="sl-text-muted sl-body-sm">No quote data available</span>
          <span className="sl-caption">Stocks will appear after the next cron refresh.</span>
        </div>
      </section>
    );
  }

  return (
    <section className="sl-card" aria-label={label} style={{ padding: "var(--sl-space-5) var(--sl-space-6)" }}>
      <div className="sl-label" style={{ marginBottom: "var(--sl-space-4)" }}>{label}</div>

      <div
        style={{
          display: "flex",
          gap: "var(--sl-space-3)",
          overflowX: "auto",
          paddingBottom: "var(--sl-space-2)",
          // Hide scrollbar but keep functionality
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {stocks.map((stock) => (
          <StockCard key={stock.symbol} stock={stock} region={region} />
        ))}
      </div>
    </section>
  );
}

/** Single stock mini-card in the horizontal strip. */
function StockCard({
  stock,
  region,
}: {
  stock: StockQuote;
  region: "us" | "kr";
}) {
  const pct = stock.pct;
  const isUp = pct !== null && pct >= 0;
  const pctColor = pct === null ? "var(--sl-muted)" : isUp ? "var(--sl-up)" : "var(--sl-down)";
  const pctBg = pct === null ? "transparent" : isUp ? "var(--sl-up-soft)" : "var(--sl-down-soft)";

  return (
    <a
      href={`/stock/${stock.symbol}`}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--sl-space-2)",
        padding: "var(--sl-space-3) var(--sl-space-4)",
        minWidth: 150,
        maxWidth: 180,
        borderRadius: "var(--sl-radius-md)",
        background: "var(--sl-surface-alt)",
        border: "1px solid var(--sl-hairline)",
        textDecoration: "none",
        color: "inherit",
        flexShrink: 0,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "var(--sl-space-2)" }}>
        <span
          className="sl-mono"
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: "var(--sl-ink)",
          }}
        >
          {stock.symbol}
        </span>
        <span
          className="sl-tag"
          style={{
            fontSize: 9,
            padding: "1px 5px",
            textTransform: "uppercase",
            fontWeight: 700,
            opacity: 0.7,
          }}
        >
          {region === "us" ? "US" : "KR"}
        </span>
      </div>

      <span
        style={{
          fontSize: 12,
          color: "var(--sl-ink-sub)",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          maxWidth: 160,
        }}
      >
        {stock.name}
      </span>

      <div style={{ display: "flex", alignItems: "baseline", gap: "var(--sl-space-2)", marginTop: "auto" }}>
        <span
          className="sl-mono"
          style={{
            fontSize: 15,
            fontWeight: 600,
            letterSpacing: "-0.01em",
          }}
        >
          {formatPrice(stock.px)}
        </span>
        <span
          className="sl-mono"
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: pctColor,
            background: pctBg,
            padding: "1px 5px",
            borderRadius: "var(--sl-radius-sm)",
          }}
        >
          {formatPct(pct)}
        </span>
      </div>
    </a>
  );
}
