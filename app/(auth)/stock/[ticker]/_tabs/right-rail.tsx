/**
 * Right rail — similar tickers + data source notes.
 *
 * Server-rendered. Sticky positioning for scroll-along behavior.
 */

import type { SimilarStock } from "@/app/_lib/stock/stock-detail-data";

export interface RightRailProps {
  readonly similarStocks: readonly SimilarStock[];
}

export function RightRail({ similarStocks }: RightRailProps) {
  return (
    <aside
      aria-label="Related stocks and data sources"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--sl-space-5)",
        position: "sticky",
        top: 72,
        alignSelf: "flex-start",
        width: "100%",
        maxWidth: 280,
      }}
    >
      {/* Similar stocks */}
      <section className="sl-card" style={{ padding: "var(--sl-space-4) var(--sl-space-5)" }}>
        <h2 className="sl-h3" style={{ marginBottom: "var(--sl-space-3)" }}>
          Similar Stocks
        </h2>

        {similarStocks.length === 0 ? (
          <p className="sl-body-sm sl-text-muted" style={{ padding: "var(--sl-space-3)" }}>
            No similar stocks found.
            <br />
            Data will appear once sector classification is available.
          </p>
        ) : (
          <ul
            style={{
              listStyle: "none",
              display: "flex",
              flexDirection: "column",
              gap: "var(--sl-space-1)",
            }}
          >
            {similarStocks.map((stock) => (
              <li key={stock.symbol}>
                <a
                  href={`/stock/${stock.symbol}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "var(--sl-space-2) var(--sl-space-3)",
                    borderRadius: "var(--sl-radius-sm)",
                    textDecoration: "none",
                    color: "inherit",
                    fontSize: 13,
                  }}
                >
                  <span>
                    <span
                      className="sl-mono"
                      style={{
                        fontWeight: 600,
                        marginRight: "var(--sl-space-2)",
                        color: "var(--sl-brand)",
                      }}
                    >
                      {stock.symbol}
                    </span>
                    <span style={{ color: "var(--sl-ink-sub)" }}>{stock.name}</span>
                  </span>
                  {stock.exchange && (
                    <span className="sl-tag" style={{ fontSize: 9, flexShrink: 0 }}>
                      {stock.exchange}
                    </span>
                  )}
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Data source notes */}
      <section
        className="sl-card-soft"
        style={{
          padding: "var(--sl-space-4) var(--sl-space-5)",
          border: "1px dashed var(--sl-line-strong)",
        }}
      >
        <h3 className="sl-label" style={{ marginBottom: "var(--sl-space-2)" }}>
          Data Sources
        </h3>
        <ul
          className="sl-caption"
          style={{
            paddingLeft: "var(--sl-space-4)",
            listStyle: "disc",
            display: "flex",
            flexDirection: "column",
            gap: "var(--sl-space-1)",
          }}
        >
          <li>Quotes: Finnhub / KRX cache</li>
          <li>Financials: DART / EDGAR</li>
          <li>News: RSS feeds / NewsAPI</li>
          <li>Holdings: 13F filings (quarterly)</li>
          <li>Supply &amp; Demand: EDGAR / KRX</li>
        </ul>
      </section>
    </aside>
  );
}
