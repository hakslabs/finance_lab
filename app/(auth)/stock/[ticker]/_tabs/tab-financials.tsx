/**
 * Financials tab — IS / BS / CF toggle + annual / quarterly toggle
 * + 5-year trend + ratios table.
 *
 * Server-rendered. Shows empty state when financials pipeline has not
 * populated data for this ticker.
 */

import type { FinancialRow } from "@/app/_lib/stock/stock-detail-data";

export interface FinancialsTabProps {
  readonly financials: readonly FinancialRow[];
}

export function FinancialsTab({ financials }: FinancialsTabProps) {
  if (financials.length === 0) {
    return <FinancialsEmptyState />;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--sl-space-5)" }}>
      {/* Period toggles (visual stub — no interactivity) */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--sl-space-3)",
        }}
      >
        <span className="sl-label" style={{ textTransform: "none" }}>Statement:</span>
        {["Income Statement", "Balance Sheet", "Cash Flow"].map((label) => (
          <span key={label} className="sl-tag">
            {label}
          </span>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--sl-space-3)",
        }}
      >
        <span className="sl-label" style={{ textTransform: "none" }}>Period:</span>
        {["Annual", "Quarterly"].map((label) => (
          <span key={label} className="sl-tag">
            {label}
          </span>
        ))}
      </div>

      {/* Data table stub */}
      <section className="sl-card" style={{ padding: "var(--sl-space-5)" }}>
        <h2 className="sl-h3" style={{ marginBottom: "var(--sl-space-4)" }}>
          Financial Statements
        </h2>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: 13,
          }}
        >
          <thead>
            <tr style={{ borderBottom: "2px solid var(--sl-line)" }}>
              <th className="sl-caption" style={{ textAlign: "left", padding: "var(--sl-space-2) var(--sl-space-3)" }}>
                Period
              </th>
              <th className="sl-caption" style={{ textAlign: "right", padding: "var(--sl-space-2) var(--sl-space-3)" }}>
                Revenue
              </th>
              <th className="sl-caption" style={{ textAlign: "right", padding: "var(--sl-space-2) var(--sl-space-3)" }}>
                Net Income
              </th>
              <th className="sl-caption" style={{ textAlign: "right", padding: "var(--sl-space-2) var(--sl-space-3)" }}>
                Updated
              </th>
            </tr>
          </thead>
          <tbody>
            {financials.slice(0, 8).map((row) => (
              <tr
                key={row.period}
                style={{ borderBottom: "1px solid var(--sl-hairline)" }}
              >
                <td style={{ padding: "var(--sl-space-2) var(--sl-space-3)", fontWeight: 500 }}>
                  {row.period}
                </td>
                <td
                  className="sl-mono"
                  style={{
                    textAlign: "right",
                    padding: "var(--sl-space-2) var(--sl-space-3)",
                    color: "var(--sl-ink-sub)",
                  }}
                >
                  {typeof row.is_json === "object" && row.is_json !== null && "revenue" in (row.is_json as Record<string, unknown>)
                    ? formatNumber((row.is_json as Record<string, unknown>).revenue as number | null)
                    : "—"}
                </td>
                <td
                  className="sl-mono"
                  style={{
                    textAlign: "right",
                    padding: "var(--sl-space-2) var(--sl-space-3)",
                    color: "var(--sl-ink-sub)",
                  }}
                >
                  {typeof row.is_json === "object" && row.is_json !== null && "net_income" in (row.is_json as Record<string, unknown>)
                    ? formatNumber((row.is_json as Record<string, unknown>).net_income as number | null)
                    : "—"}
                </td>
                <td
                  className="sl-caption"
                  style={{
                    textAlign: "right",
                    padding: "var(--sl-space-2) var(--sl-space-3)",
                    color: "var(--sl-muted)",
                  }}
                >
                  {row.updated_at ? new Date(row.updated_at).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

function FinancialsEmptyState() {
  return (
    <div
      className="sl-card"
      style={{
        padding: "var(--sl-space-8) var(--sl-space-6)",
        textAlign: "center",
      }}
    >
      <p className="sl-h3 sl-text-muted">No Financial Data</p>
      <p className="sl-body-sm" style={{ marginTop: "var(--sl-space-2)", color: "var(--sl-ink-sub)" }}>
        Financial statements have not been imported for this stock yet.
        Data will appear once the DART / EDGAR pipeline processes this ticker.
      </p>
    </div>
  );
}

function formatNumber(value: number | null): string {
  if (value === null) return "—";
  if (Math.abs(value) >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
  if (Math.abs(value) >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
  if (Math.abs(value) >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
  return value.toFixed(2);
}
