/**
 * Mini market map widget — heat map preview of sector performance.
 *
 * Server-rendered. Shows a grid of colored blocks representing
 * sector/category performance. Uses deterministic fallback data
 * when no real data is available.
 */

export interface MiniMarketMapProps {
  /** Optional real sector data; falls back to placeholder blocks when empty. */
  readonly sectors?: readonly {
    readonly name: string;
    readonly value: number;
  }[];
}

/** Placeholder sectors for the heat map preview — shows the visual shape even without data. */
const PLACEHOLDER_SECTORS: readonly { name: string; value: number }[] = [
  { name: "Tech", value: 1.8 },
  { name: "Finance", value: -0.4 },
  { name: "Healthcare", value: 0.9 },
  { name: "Energy", value: -1.2 },
  { name: "Consumer", value: 0.3 },
  { name: "Industrial", value: -0.7 },
  { name: "Real Estate", value: 0.1 },
  { name: "Utilities", value: -0.2 },
  { name: "Materials", value: 0.6 },
  { name: "Comms", value: 1.1 },
  { name: "Staples", value: -0.1 },
  { name: "Discr.", value: 0.5 },
];

function heatColor(value: number): string {
  // Map percentage change to CSS variable colors on the up/down scale
  if (value >= 2.5) return "var(--sl-up)";
  if (value >= 1.5) return "var(--sl-up)";
  if (value >= 0.5) return "var(--sl-up-soft)";
  if (value >= 0) return "var(--sl-down-soft)";
  if (value >= -0.5) return "var(--sl-down-soft)";
  if (value >= -1.5) return "var(--sl-down)";
  return "var(--sl-down)";
}

export function MiniMarketMap({ sectors }: MiniMarketMapProps) {
  const data = sectors && sectors.length > 0 ? sectors : PLACEHOLDER_SECTORS;
  const isPlaceholder = !sectors || sectors.length === 0;

  return (
    <section
      className="sl-card"
      aria-label="Mini market map"
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
        <div className="sl-label">Sector Heat Map</div>
        {isPlaceholder && (
          <span className="sl-tag sl-tag-warn" style={{ fontSize: 10 }}>
            Preview
          </span>
        )}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
          gap: "var(--sl-space-2)",
        }}
      >
        {data.map((sector) => (
          <div
            key={sector.name}
            style={{
              padding: "var(--sl-space-3) var(--sl-space-3)",
              borderRadius: "var(--sl-radius-sm)",
              background: heatColor(sector.value),
              opacity: isPlaceholder ? 0.65 : 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "var(--sl-space-1)",
              minHeight: 56,
              transition: "transform var(--sl-motion-fast), box-shadow var(--sl-motion-fast)",
            }}
          >
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color:
                  Math.abs(sector.value) > 0.8 ? "var(--sl-surface)" : "var(--sl-ink)",
                textAlign: "center",
                lineHeight: 1.2,
              }}
            >
              {sector.name}
            </span>
            <span
              className="sl-mono"
              style={{
                fontSize: 12,
                fontWeight: 700,
                color:
                  Math.abs(sector.value) > 0.8 ? "var(--sl-surface)" : "var(--sl-ink)",
              }}
            >
              {sector.value > 0 ? "+" : ""}
              {sector.value.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>

      {/* Color legend */}
      <div
        style={{
          marginTop: "var(--sl-space-4)",
          display: "flex",
          alignItems: "center",
          gap: "var(--sl-space-2)",
        }}
      >
        <span className="sl-caption">Bearish</span>
        <div
          style={{
            flex: 1,
            height: 4,
            borderRadius: 2,
            background:
              "linear-gradient(to right, var(--sl-down), var(--sl-down-soft), var(--sl-up-soft), var(--sl-up))",
          }}
        />
        <span className="sl-caption">Bullish</span>
      </div>
    </section>
  );
}
