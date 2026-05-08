/**
 * My Return vs Market Average widget — portfolio performance comparison.
 *
 * Server-rendered. Shows user return vs benchmark with 1Y/5Y toggle stubs.
 * Displays empty state when no holdings data is available yet.
 */

import { WidgetEmptyCard } from "../dashboard-state-card";

export interface ReturnVsMarketProps {
  /** User's portfolio return % over the selected period. */
  readonly myReturn?: number | null;
  /** Benchmark (market average) return % over the same period. */
  readonly marketReturn?: number | null;
  /** Active period tab. */
  readonly period?: "1Y" | "5Y";
}

export function ReturnVsMarket({
  myReturn = null,
  marketReturn = null,
}: ReturnVsMarketProps) {
  // No data → show empty state
  if (myReturn === null && marketReturn === null) {
    return (
      <WidgetEmptyCard
        widgetId="return-vs-market"
        title="No portfolio data yet"
        description="Connect your portfolio to see your returns vs. the market average."
      />
    );
  }

  const diff =
    myReturn !== null && marketReturn !== null
      ? myReturn - marketReturn
      : null;

  return (
    <section
      className="sl-card"
      aria-label="My return vs market"
      style={{ padding: "var(--sl-space-5) var(--sl-space-6)" }}
    >
      {/* Header with period tabs */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "var(--sl-space-5)",
        }}
      >
        <div className="sl-label">My Return vs Market</div>

        {/* Period toggle stubs */}
        <div
          style={{
            display: "flex",
            gap: 0,
            borderRadius: "var(--sl-radius-sm)",
            overflow: "hidden",
            border: "1px solid var(--sl-line)",
          }}
        >
          {(["1Y", "5Y"] as const).map((p) => (
            <button
              key={p}
              type="button"
              className="sl-btn sl-btn-ghost"
              style={{
                borderRadius: 0,
                fontSize: 11,
                fontWeight: 700,
                padding: "4px 10px",
                borderRight:
                  p === "5Y" ? "none" : "1px solid var(--sl-line)",
                background: p === "1Y" ? "var(--sl-surface-alt)" : "transparent",
                color: p === "1Y" ? "var(--sl-ink)" : "var(--sl-muted)",
              }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Comparison bars */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--sl-space-4)",
        }}
      >
        {/* My Portfolio bar */}
        <BarRow
          label="My Portfolio"
          value={myReturn}
          highlight
        />

        {/* Market Average bar */}
        <BarRow
          label="Market Avg (S&P 500)"
          value={marketReturn}
        />

        {/* Delta line */}
        {diff !== null && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--sl-space-3)",
              paddingTop: "var(--sl-space-3)",
              borderTop: "1px solid var(--sl-hairline)",
            }}
          >
            <span className="sl-label" style={{ textTransform: "none" }}>
              Alpha
            </span>
            <span
              className="sl-mono"
              style={{
                fontSize: 16,
                fontWeight: 800,
                color: diff >= 0 ? "var(--sl-up)" : "var(--sl-down)",
                letterSpacing: "-0.02em",
              }}
            >
              {diff > 0 ? "+" : ""}
              {diff.toFixed(2)}%
            </span>
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                padding: "2px 8px",
                borderRadius: "var(--sl-radius-pill)",
                background:
                  diff >= 0 ? "var(--sl-up-soft)" : "var(--sl-down-soft)",
                color: diff >= 0 ? "var(--sl-up)" : "var(--sl-down)",
              }}
            >
              {diff >= 0 ? "Outperforming" : "Underperforming"}
            </span>
          </div>
        )}
      </div>
    </section>
  );
}

/** Horizontal bar for a single return value. */
function BarRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: number | null;
  highlight?: boolean;
}) {
  if (value === null) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "var(--sl-space-3)" }}>
        <span style={{ fontSize: 13, fontWeight: 600, width: 140, flexShrink: 0 }}>{label}</span>
        <span className="sl-text-muted sl-body-sm">—</span>
      </div>
    );
  }

  const absVal = Math.abs(value);
  // Scale bar to reasonable max of ~50% for visual balance
  const barWidth = Math.min(100, (absVal / 50) * 100);
  const isPositive = value >= 0;
  const color = isPositive ? "var(--sl-up)" : "var(--sl-down)";

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "var(--sl-space-3)" }}>
      <span
        style={{
          fontSize: 13,
          fontWeight: highlight ? 700 : 500,
          width: 140,
          flexShrink: 0,
          color: "var(--sl-ink-sub)",
        }}
      >
        {label}
      </span>

      {/* Bar track */}
      <div
        style={{
          flex: 1,
          height: 20,
          borderRadius: "var(--sl-radius-sm)",
          background: "var(--sl-surface-alt)",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div
          style={{
            width: `${barWidth}%`,
            height: "100%",
            borderRadius: "var(--sl-radius-sm)",
            background: isPositive
              ? `linear-gradient(90deg, ${color}, ${color}dd)`
              : `linear-gradient(270deg, ${color}, ${color}dd)`,
            transition: "width var(--sl-motion-slow)",
          }}
        />
      </div>

      <span
        className="sl-mono"
        style={{
          fontSize: 14,
          fontWeight: 700,
          color,
          minWidth: 56,
          textAlign: "right",
          letterSpacing: "-0.01em",
        }}
      >
        {isPositive ? "+" : ""}
        {value.toFixed(2)}%
      </span>
    </div>
  );
}
