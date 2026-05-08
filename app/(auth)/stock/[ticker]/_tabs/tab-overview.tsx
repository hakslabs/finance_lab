/**
 * Overview tab — 1Y price chart preview + key metrics stubs + recent earnings
 * + valuation summary + master holdings + company overview.
 *
 * Server-rendered. Chart area is an SVG placeholder; real drawing tools
 * are deferred to a client island.
 */

import type { StockDetailData } from "@/app/_lib/stock/stock-detail-data";

export interface OverviewTabProps {
  readonly data: Pick<
    StockDetailData,
    "profile" | "quote" | "dailyQuote" | "financials" | "masterHoldings"
  >;
}

export function OverviewTab({ data }: OverviewTabProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--sl-space-5)" }}>
      {/* Chart preview area */}
      <section className="sl-card" style={{ padding: "var(--sl-space-5)" }}>
        <h2 className="sl-h3" style={{ marginBottom: "var(--sl-space-4)" }}>
          Price Chart (1Y)
        </h2>
        <ChartPlaceholder />
      </section>

      {/* Key metrics grid */}
      <section className="sl-card" style={{ padding: "var(--sl-space-5)" }}>
        <h2 className="sl-h3" style={{ marginBottom: "var(--sl-space-4)" }}>
          Key Metrics
        </h2>
        <MetricsGrid />
      </section>

      {/* Master holdings */}
      <MasterHoldingsSection holdings={data.masterHoldings} />

      {/* Company overview */}
      {data.profile && (
        <section className="sl-card" style={{ padding: "var(--sl-space-5)" }}>
          <h2 className="sl-h3" style={{ marginBottom: "var(--sl-space-3)" }}>
            Company Overview
          </h2>
          <dl
            style={{
              display: "grid",
              gridTemplateColumns: "auto 1fr",
              gap: "var(--sl-space-2) var(--sl-space-4)",
              fontSize: 13,
            }}
          >
            <dt className="sl-label" style={{ textTransform: "none" }}>Sector</dt>
            <dd>{data.profile.sector ?? "—"}</dd>
            <dt className="sl-label" style={{ textTransform: "none" }}>Industry</dt>
            <dd>{data.profile.industry ?? "—"}</dd>
            <dt className="sl-label" style={{ textTransform: "none" }}>Exchange</dt>
            <dd>{data.profile.exchange ?? "—"}</dd>
            <dt className="sl-label" style={{ textTransform: "none" }}>Market</dt>
            <dd>{data.profile.market ?? "—"}</dd>
            <dt className="sl-label" style={{ textTransform: "none" }}>Country</dt>
            <dd>{data.profile.country ?? "—"}</dd>
            <dt className="sl-label" style={{ textTransform: "none" }}>Currency</dt>
            <dd>{data.profile.currency ?? "—"}</dd>
            {data.profile.website && (
              <>
                <dt className="sl-label" style={{ textTransform: "none" }}>Website</dt>
                <dd>
                  <a
                    href={data.profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "var(--sl-brand)", textDecoration: "none" }}
                  >
                    {data.profile.website.replace(/^https?:\/\/(www\.)?/, "")}
                  </a>
                </dd>
              </>
            )}
          </dl>
        </section>
      )}
    </div>
  );
}

/** SVG chart placeholder with empty-state message. */
function ChartPlaceholder() {
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: 280,
        background: "var(--sl-surface-alt)",
        borderRadius: "var(--sl-radius-md)",
        border: "1px dashed var(--sl-line-strong)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {/* Minimal SVG sparkline placeholder */}
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 600 200"
        preserveAspectRatio="none"
        aria-hidden="true"
        style={{ position: "absolute", inset: 0 }}
      >
        <defs>
          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--sl-brand)" stopOpacity="0.12" />
            <stop offset="100%" stopColor="var(--sl-brand)" stopOpacity="0.01" />
          </linearGradient>
        </defs>
        {/* Grid lines */}
        {[25, 50, 75, 100, 125, 150, 175].map((y) => (
          <line
            key={y}
            x1="40"
            y1={y}
            x2="580"
            y2={y}
            stroke="var(--sl-line)"
            strokeWidth="0.5"
          />
        ))}
        {/* Placeholder path */}
        <path
          d="M40,120 C120,110 180,80 260,95 S380,60 460,75 S540,45 580,55 L580,200 L40,200 Z"
          fill="url(#chartGrad)"
        />
        <path
          d="M40,120 C120,110 180,80 260,95 S380,60 460,75 S540,45 580,55"
          fill="none"
          stroke="var(--sl-brand)"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>

      {/* Empty state overlay */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          textAlign: "center",
          padding: "var(--sl-space-5)",
        }}
      >
        <p className="sl-body-sm sl-text-muted">
          Interactive chart will be available in a future update.
        </p>
        <p className="sl-caption">
          Drawing tools and indicators require client-side rendering.
        </p>
      </div>
    </div>
  );
}

/** Stub metrics grid until financial data pipeline is active. */
function MetricsGrid() {
  const metrics = [
    { label: "P/E Ratio", value: "—" },
    { label: "P/B Ratio", value: "—" },
    { label: "EV / EBITDA", value: "—" },
    { label: "ROE", value: "—" },
    { label: "Debt / Equity", value: "—" },
    { label: "Revenue Growth", value: "—" },
    { label: "EPS (TTM)", value: "—" },
    { label: "Dividend Yield", value: "—" },
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
        gap: "var(--sl-space-3)",
      }}
    >
      {metrics.map((m) => (
        <div
          key={m.label}
          className="sl-card-soft"
          style={{
            padding: "var(--sl-space-3) var(--sl-space-4)",
            borderRadius: "var(--sl-radius-md)",
          }}
        >
          <div className="sl-caption">{m.label}</div>
          <div
            className="sl-mono"
            style={{
              fontSize: 16,
              fontWeight: 700,
              marginTop: "var(--sl-space-1)",
              color: "var(--sl-ink)",
            }}
          >
            {m.value}
          </div>
        </div>
      ))}
    </div>
  );
}

/** Master holdings section for the overview tab. */
function MasterHoldingsSection({
  holdings,
}: {
  holdings: ReadonlyArray<{ master_name: string | null; firm: string | null; weight: number | null; quarter: string }>;
}) {
  if (holdings.length === 0) {
    return (
      <section className="sl-card" style={{ padding: "var(--sl-space-5)" }}>
        <h2 className="sl-h3" style={{ marginBottom: "var(--sl-space-3)" }}>
          Master Holdings
        </h2>
        <p className="sl-body-sm sl-text-muted">
          No master holder data available for this stock yet.
        </p>
      </section>
    );
  }

  return (
    <section className="sl-card" style={{ padding: "var(--sl-space-5)" }}>
      <h2 className="sl-h3" style={{ marginBottom: "var(--sl-space-3)" }}>
        Master Holdings
      </h2>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: 13,
        }}
      >
        <thead>
          <tr style={{ borderBottom: "1px solid var(--sl-line)" }}>
            <th className="sl-caption" style={{ textAlign: "left", padding: "var(--sl-space-2) var(--sl-space-3)" }}>
              Holder
            </th>
            <th className="sl-caption" style={{ textAlign: "right", padding: "var(--sl-space-2) var(--sl-space-3)" }}>
              Weight
            </th>
            <th className="sl-caption" style={{ textAlign: "right", padding: "var(--sl-space-2) var(--sl-space-3)" }}>
              Quarter
            </th>
          </tr>
        </thead>
        <tbody>
          {holdings.slice(0, 6).map((h) => (
            <tr
              key={`${h.master_name}-${h.quarter}`}
              style={{ borderBottom: "1px solid var(--sl-hairline)" }}
            >
              <td style={{ padding: "var(--sl-space-2) var(--sl-space-3)" }}>
                <span style={{ fontWeight: 500 }}>{h.master_name ?? h.firm ?? "—"}</span>
              </td>
              <td
                className="sl-mono"
                style={{
                  textAlign: "right",
                  padding: "var(--sl-space-2) var(--sl-space-3)",
                  color: "var(--sl-ink-sub)",
                }}
              >
                {h.weight !== null ? `${(h.weight * 100).toFixed(2)}%` : "—"}
              </td>
              <td
                className="sl-mono"
                style={{
                  textAlign: "right",
                  padding: "var(--sl-space-2) var(--sl-space-3)",
                  color: "var(--sl-muted)",
                  fontSize: 12,
                }}
              >
                {h.quarter}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
