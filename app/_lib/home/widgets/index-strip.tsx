/**
 * Index strip widget — KR + US major indices with sparkline SVGs.
 *
 * Server-rendered. Shows KOSPI/KOSDAQ/KOSPI200 and S&P500/Nasdaq/Dow
 * with value, change %, and a mini sparkline.
 */

import type { IndexData } from "../dashboard-data";

export interface IndexStripProps {
  readonly indices: readonly IndexData[];
}

const INDEX_META: Record<
  string,
  { label: string }
> = {
  KOSPI: { label: "KOSPI" },
  KOSDAQ: { label: "KOSDAQ" },
  KOSPI200: { label: "KOSPI 200" },
  SP500: { label: "S&P 500" },
  NASDAQ: { label: "Nasdaq" },
  DOW: { label: "Dow Jones" },
};

function isPositive(change: number | null): boolean | null {
  if (change === null) return null;
  return change >= 0;
}

function formatIndexValue(value: number | null): string {
  if (value === null) return "—";
  if (value >= 10_000) return value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return value.toFixed(2);
}

function formatChange(pct: number | null): string {
  if (pct === null) return "—%";
  const sign = pct >= 0 ? "+" : "";
  return `${sign}${pct.toFixed(2)}%`;
}

/** Mini sparkline SVG from an array of numbers. */
function Sparkline({
  data,
  positive,
}: {
  data: readonly number[];
  positive: boolean | null;
}) {
  if (!data || data.length < 2) {
    return (
      <svg width={80} height={28} viewBox="0 0 80 28" aria-hidden="true">
        <line x1={0} y1={14} x2={80} y2={14} stroke="var(--sl-faint)" strokeWidth={1} strokeDasharray="3 3" />
      </svg>
    );
  }

  const w = 80;
  const h = 28;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 4) - 2;
    return `${x},${y}`;
  });

  const d = `M${pts.join(" L")}`;
  const color =
    positive === null
      ? "var(--sl-muted)"
      : positive
        ? "var(--sl-up)"
        : "var(--sl-down)";

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true" style={{ display: "block" }}>
      <defs>
        <linearGradient id={`spark-grad-${positive}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.15} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d={`${d} L${w},${h} L0,${h} Z`}
        fill={`url(#spark-grad-${positive})`}
        opacity={0.5}
      />
    </svg>
  );
}

export function IndexStrip({ indices }: IndexStripProps) {
  const krIndices = indices.filter((i) =>
    ["KOSPI", "KOSDAQ", "KOSPI200"].includes(i.code),
  );
  const usIndices = indices.filter((i) =>
    ["SP500", "NASDAQ", "DOW"].includes(i.code),
  );

  return (
    <section
      className="sl-card"
      aria-label="Market indices"
      style={{ padding: "var(--sl-space-5) var(--sl-space-6)" }}
    >
      <div className="sl-label" style={{ marginBottom: "var(--sl-space-4)" }}>
        Market Indices
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "var(--sl-space-4)",
        }}
      >
        {/* KR Indices */}
        {krIndices.map((idx) => {
          const meta = INDEX_META[idx.code] ?? { label: idx.code, shortLabel: idx.code };
          const pos = isPositive(idx.change);

          return (
            <IndexCard
              key={idx.code}
              label={meta.label}
              value={formatIndexValue(idx.value)}
              change={formatChange(idx.change)}
              positive={pos}
              spark={idx.spark}
            />
          );
        })}

        {/* US Indices */}
        {usIndices.map((idx) => {
          const meta = INDEX_META[idx.code] ?? { label: idx.code, shortLabel: idx.code };
          const pos = isPositive(idx.change);

          return (
            <IndexCard
              key={idx.code}
              label={meta.label}
              value={formatIndexValue(idx.value)}
              change={formatChange(idx.change)}
              positive={pos}
              spark={idx.spark}
            />
          );
        })}
      </div>
    </section>
  );
}

/** Single index card within the strip. */
function IndexCard({
  label,
  value,
  change,
  positive,
  spark,
}: {
  label: string;
  value: string;
  change: string;
  positive: boolean | null;
  spark: readonly number[];
}) {
  const color =
    positive === null
      ? "var(--sl-muted)"
      : positive
        ? "var(--sl-up)"
        : "var(--sl-down)";

  return (
    <div
      style={{
        padding: "var(--sl-space-3) var(--sl-space-4)",
        borderRadius: "var(--sl-radius-md)",
        background: "var(--sl-surface-alt)",
        border: "1px solid var(--sl-hairline)",
        display: "flex",
        alignItems: "center",
        gap: "var(--sl-space-3)",
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: "var(--sl-muted)",
            textTransform: "uppercase",
            letterSpacing: "0.04em",
          }}
        >
          {label}
        </div>
        <div
          className="sl-mono"
          style={{
            fontSize: 17,
            fontWeight: 700,
            marginTop: 2,
            letterSpacing: "-0.02em",
          }}
        >
          {value}
        </div>
      </div>

      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <div
          className="sl-mono"
          style={{
            fontSize: 13,
            fontWeight: 600,
            color,
          }}
        >
          {change}
        </div>
      </div>

      <div style={{ flexShrink: 0 }}>
        <Sparkline data={spark} positive={positive} />
      </div>
    </div>
  );
}
