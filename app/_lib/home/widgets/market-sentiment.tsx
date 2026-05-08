/**
 * Market sentiment / volatility widget — reads from the `sentiment` table.
 *
 * Server-rendered static gauge.
 *
 * Provider behavior:
 *   - VIX code: raw VIX value (typically 10–80). Mapped internally to a
 *     0–100 "volatility" gauge where low = calm, high = volatile.
 *     Labelled as "Volatility (VIX)" — NOT Fear & Greed.
 *   - composite / fng code: standard 0–100 Fear & Greed value with band string.
 *     Labelled as "Fear & Greed Index".
 *   - Any other code: treated as a generic 0–100 gauge with band lookup.
 *
 * Future composite/F&G rows from other providers will use the F&G path automatically.
 */

import type { SentimentReading } from "../dashboard-data";
import { WidgetEmptyCard } from "../dashboard-state-card";

export interface MarketSentimentProps {
  readonly readings: readonly SentimentReading[];
}

/** Known VIX code variants that should use volatility mapping. */
const VIX_CODES = new Set(["VIX", "vix"]);

/** Fear & Greed code variants. */
const FNG_CODES = new Set(["composite", "fng", "fear_greed"]);

/** F&G band → display config mapping. */
const FNG_BAND_CONFIG: Record<
  string,
  { label: string; color: string; icon: string }
> = {
  extreme_fear: {
    label: "Extreme Fear",
    color: "var(--sl-down)",
    icon:
      "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.98L13.732 4c-.77-1.313-2.694-1.313-3.464 0L3.34 16.5c-.77 1.313.192 2.98 1.732 2.98z",
  },
  fear: {
    label: "Fear",
    color: "var(--sl-warn)",
    icon:
      "M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  neutral: {
    label: "Neutral",
    color: "var(--sl-muted)",
    icon:
      "M20.354 15.354A9 9 0 018.646 3.354l.002.001A9 9 0 0020.354 15.354z",
  },
  greed: {
    label: "Greed",
    color: "var(--sl-info)",
    icon:
      "M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  extreme_greed: {
    label: "Extreme Greed",
    color: "var(--sl-up)",
    icon:
      "M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z",
  },
};

/** Volatility level config based on VIX-derived gauge percentage. */
function vixLevel(gaugePct: number): { label: string; color: string } {
  if (gaugePct >= 80) return { label: "Extremely High", color: "var(--sl-down)" };
  if (gaugePct >= 60) return { label: "Elevated", color: "var(--sl-warn)" };
  if (gaugePct >= 40) return { label: "Moderate", color: "var(--sl-info)" };
  if (gaugePct >= 20) return { label: "Low", color: "var(--sl-up)" };
  return { label: "Very Low", color: "var(--sl-up)" };
}

/**
 * Map a raw VIX value (typically 10–80) to a 0–100 gauge percentage.
 * VIX ~12 = very calm (low %), VIX ~30+ = elevated, VIX 50+ = crisis.
 */
function vixToGaugePct(vix: number): number {
  // Clamp to reasonable VIX range then linearly map to 0–100
  const clamped = Math.max(10, Math.min(vix, 80));
  return ((clamped - 10) / 70) * 100;
}

export function MarketSentiment({ readings }: MarketSentimentProps) {
  if (readings.length === 0) {
    return (
      <WidgetEmptyCard
        widgetId="market-sentiment"
        title="No sentiment data yet"
        description="Market sentiment will appear after the next cron refresh."
      />
    );
  }

  // Pick the best reading: prefer composite/F&G, fall back to first available
  const fngReading = readings.find((r) => FNG_CODES.has(r.code));
  const primary = fngReading ?? readings[0];

  if (primary.value === null) {
    return (
      <WidgetEmptyCard
        widgetId="market-sentiment"
        title="No sentiment data yet"
        description="Market sentiment will appear after the next cron refresh."
      />
    );
  }

  const isVix = VIX_CODES.has(primary.code);

  // Determine gauge display values
  let gaugePct: number;
  let displayValue: string;
  let levelLabel: string;
  let levelColor: string;

  if (isVix) {
    // VIX path: map raw VIX to 0–100 gauge
    gaugePct = vixToGaugePct(primary.value);
    displayValue = primary.value.toFixed(2);
    const level = vixLevel(gaugePct);
    levelLabel = level.label;
    levelColor = level.color;
  } else if (FNG_CODES.has(primary.code)) {
    // F&G path: value is already 0–100
    gaugePct = Math.min(100, Math.max(0, primary.value));
    displayValue = primary.value.toFixed(0);
    const band = primary.band ?? "neutral";
    const config = FNG_BAND_CONFIG[band] ?? FNG_BAND_CONFIG.neutral;
    levelLabel = config.label;
    levelColor = config.color;
  } else {
    // Generic fallback: treat as 0–100 gauge
    gaugePct = Math.min(100, Math.max(0, primary.value));
    displayValue = primary.value.toFixed(0);
    levelLabel = primary.band ?? "Neutral";
    levelColor = "var(--sl-muted)";
  }

  return (
    <section
      className="sl-card"
      aria-label="Market sentiment"
      style={{ padding: "var(--sl-space-6)" }}
    >
      <div className="sl-label" style={{ marginBottom: "var(--sl-space-5)" }}>
        {isVix ? "Volatility" : "Market Sentiment"}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--sl-space-6)",
        }}
      >
        {/* Gauge visual */}
        <div style={{ flexShrink: 0, position: "relative" }}>
          <svg width={120} height={64} viewBox="0 0 120 64" aria-hidden="true">
            {/* Background arc */}
            <path
              d="M 12 56 A 48 48 0 0 1 108 56"
              fill="none"
              stroke="var(--sl-line)"
              strokeWidth={8}
              strokeLinecap="round"
            />
            {/* Colored arc */}
            <path
              d="M 12 56 A 48 48 0 0 1 108 56"
              fill="none"
              stroke={levelColor}
              strokeWidth={8}
              strokeLinecap="round"
              strokeDasharray={`${(gaugePct / 100) * 151} 151`}
            />
            {/* Needle */}
            <line
              x1={60}
              y1={56}
              x2={60 + 40 * Math.cos(Math.PI + (gaugePct / 100) * Math.PI)}
              y2={56 - 40 * Math.sin(Math.PI + (gaugePct / 100) * Math.PI)}
              stroke="var(--sl-ink)"
              strokeWidth={2}
              strokeLinecap="round"
            />
            {/* Center dot */}
            <circle cx={60} cy={56} r={4} fill="var(--sl-ink)" />
          </svg>
        </div>

        {/* Reading details */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--sl-space-2)",
              marginBottom: "var(--sl-space-2)",
            }}
          >
            <span
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: levelColor,
                letterSpacing: "-0.01em",
              }}
            >
              {levelLabel}
            </span>
          </div>

          <div
            className="sl-mono"
            style={{
              fontSize: 28,
              fontWeight: 800,
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
            }}
          >
            {displayValue}
          </div>

          <div
            className="sl-caption"
            style={{ marginTop: "var(--sl-space-1)" }}
          >
            {isVix
              ? `VIX · ${primary.code.toUpperCase()}`
              : `Fear & Greed · ${primary.code.toUpperCase()}`}
          </div>
        </div>
      </div>
    </section>
  );
}
