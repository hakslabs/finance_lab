/**
 * Chart tab — SVG chart engine placeholder with empty-state notes.
 *
 * Server-rendered shell. Real interactive drawing tools, indicators,
 * and sub-panels (volume, RSI, MACD) are deferred to a client island.
 */

export function ChartTab() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--sl-space-5)" }}>
      <section
        className="sl-card"
        style={{
          padding: "var(--sl-space-6)",
          minHeight: 480,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "var(--sl-space-4)",
        }}
      >
        {/* Large chart placeholder */}
        <div
          style={{
            width: "100%",
            maxWidth: 800,
            height: 360,
            background: "var(--sl-surface-alt)",
            borderRadius: "var(--sl-radius-lg)",
            border: "1px dashed var(--sl-line-strong)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 800 360"
            preserveAspectRatio="xMidYMid meet"
            aria-label="Chart placeholder"
          >
            <defs>
              <linearGradient id="chartAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--sl-brand)" stopOpacity="0.08" />
                <stop offset="100%" stopColor="var(--sl-brand)" stopOpacity="0.01" />
              </linearGradient>
            </defs>

            {/* Grid */}
            {[40, 85, 130, 175, 220, 265, 310].map((y) => (
              <line
                key={`h-${y}`}
                x1="60"
                y1={y}
                x2="760"
                y2={y}
                stroke="var(--sl-line)"
                strokeWidth="0.5"
              />
            ))}
            {[80, 155, 230, 305, 380, 455, 530, 605, 680, 755].map((x) => (
              <line
                key={`v-${x}`}
                x1={x}
                y1="30"
                x2={x}
                y2="330"
                stroke="var(--sl-line)"
                strokeWidth="0.3"
              />
            ))}

            {/* Placeholder candlestick / line area */}
            <path
              d="M80,200 Q180,160 260,185 T420,140 T560,165 T720,120 L720,330 L80,330 Z"
              fill="url(#chartAreaGrad)"
            />
            <path
              d="M80,200 Q180,160 260,185 T420,140 T560,165 T720,120"
              fill="none"
              stroke="var(--sl-brand)"
              strokeWidth="2"
              strokeLinecap="round"
            />

            {/* Axis labels (decorative) */}
            <text x="50" y="35" className="sl-caption" fill="var(--sl-muted)">Price</text>
            <text x="750" y="350" className="sl-caption" fill="var(--sl-muted)">Time</text>
          </svg>
        </div>

        <div style={{ textAlign: "center", maxWidth: 480 }}>
          <p className="sl-h3 sl-text-muted">Interactive Chart</p>
          <p className="sl-body-sm" style={{ marginTop: "var(--sl-space-2)", color: "var(--sl-ink-sub)" }}>
            The full trading chart engine with 11 drawing tools, 40+ indicators,
            and volume/RSI/MACD sub-panels will be available as a client-side island
            in a future update.
          </p>
        </div>
      </section>

      {/* Tool stubs info */}
      <section className="sl-card-soft" style={{ padding: "var(--sl-space-4) var(--sl-space-5)" }}>
        <h3 className="sl-label" style={{ marginBottom: "var(--sl-space-2)" }}>
          Coming to this tab
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
          <li>SVG-based candlestick / line / area rendering</li>
          <li>11 drawing tools (trend lines, fib retracement, text, shapes)</li>
          <li>40+ technical indicators (MA, EMA, Bollinger, MACD, RSI, etc.)</li>
          <li>3 sub-panels: Volume, RSI, MACD</li>
          <li>Drawing persistence via localStorage</li>
        </ul>
      </section>
    </div>
  );
}
