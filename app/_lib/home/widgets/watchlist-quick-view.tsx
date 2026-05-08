/**
 * Watchlist quick view widget — shows user's watchlist or empty state.
 *
 * Server-rendered. Reuses EmptyWatchlistCard from dashboard-state-card
 * when no items are present.
 */

import type { StockQuote } from "../dashboard-data";
import { EmptyWatchlistCard } from "../dashboard-state-card";

export interface WatchlistQuickViewProps {
  /** Watchlist items with quote data merged in. */
  readonly items: readonly StockQuote[];
}

export function WatchlistQuickView({ items }: WatchlistQuickViewProps) {
  if (items.length === 0) {
    return <EmptyWatchlistCard />;
  }

  return (
    <section
      className="sl-card"
      aria-label="Watchlist"
      style={{ padding: "var(--sl-space-5) var(--sl-space-6)" }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "var(--sl-space-4)",
        }}
      >
        <div className="sl-label">Watchlist</div>
        <span className="sl-caption">{items.length} tickers</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "var(--sl-space-1)" }}>
        {items.map((item) => (
          <WatchlistRow key={item.symbol} item={item} />
        ))}
      </div>
    </section>
  );
}

/** Single watchlist row. */
function WatchlistRow({ item }: { item: StockQuote }) {
  const pct = item.pct;
  const isUp = pct !== null && pct >= 0;
  const pctColor = pct === null ? "var(--sl-muted)" : isUp ? "var(--sl-up)" : "var(--sl-down)";

  return (
    <a
      href={`/stock/${item.symbol}`}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "var(--sl-space-3)",
        padding: "var(--sl-space-3) var(--sl-space-4)",
        borderRadius: "var(--sl-radius-md)",
        textDecoration: "none",
        color: "inherit",
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--sl-space-2)",
          }}
        >
          <span
            className="sl-mono"
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "var(--sl-ink)",
            }}
          >
            {item.symbol}
          </span>
          <span
            style={{
              fontSize: 12,
              color: "var(--sl-ink-sub)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {item.name}
          </span>
        </div>
      </div>

      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <span
          className="sl-mono"
          style={{
            fontSize: 13,
            fontWeight: 600,
            display: "block",
          }}
        >
          {item.px !== null ? item.px.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "—"}
        </span>
        <span
          className="sl-mono"
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: pctColor,
          }}
        >
          {pct !== null ? `${pct >= 0 ? "+" : ""}${pct.toFixed(2)}%` : "—"}
        </span>
      </div>
    </a>
  );
}
