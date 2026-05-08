/**
 * Target Price tab — Average / high / low target + opinion distribution
 * + recent analyst reports + 6 master holder cards.
 *
 * Server-rendered. Shows empty state until target price pipeline is active.
 */

export function TargetPriceTab() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--sl-space-5)" }}>
      {/* Target price summary */}
      <section className="sl-card" style={{ padding: "var(--sl-space-5)" }}>
        <h2 className="sl-h3" style={{ marginBottom: "var(--sl-space-4)" }}>
          Analyst Price Targets
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: "var(--sl-space-3)",
          }}
        >
          {[
            { label: "Average Target", value: "—", color: "var(--sl-brand)" },
            { label: "High Target", value: "—", color: "var(--sl-up)" },
            { label: "Low Target", value: "—", color: "var(--sl-down)" },
            { label: "Median Target", value: "—", color: "var(--sl-ink-sub)" },
          ].map((card) => (
            <div
              key={card.label}
              className="sl-card-soft"
              style={{
                padding: "var(--sl-space-4)",
                borderRadius: "var(--sl-radius-md)",
              }}
            >
              <div className="sl-caption">{card.label}</div>
              <div
                className="sl-mono"
                style={{
                  fontSize: 24,
                  fontWeight: 800,
                  marginTop: "var(--sl-space-2)",
                  color: "var(--sl-muted)",
                }}
              >
                {card.value}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Opinion distribution bar (stub) */}
      <section className="sl-card" style={{ padding: "var(--sl-space-5)" }}>
        <h2 className="sl-h3" style={{ marginBottom: "var(--sl-space-4)" }}>
          Opinion Distribution
        </h2>
        <OpinionBarStub />
      </section>

      {/* Recent analyst reports placeholder */}
      <section className="sl-card" style={{ padding: "var(--sl-space-5)" }}>
        <h2 className="sl-h3" style={{ marginBottom: "var(--sl-space-3)" }}>
          Recent Analyst Reports
        </h2>
        <p className="sl-body-sm sl-text-muted">
          Analyst reports and price target updates will be listed here once the
          research data source is connected.
        </p>
      </section>

      {/* Master holder cards stub */}
      <section className="sl-card" style={{ padding: "var(--sl-space-5)" }}>
        <h2 className="sl-h3" style={{ marginBottom: "var(--sl-space-3)" }}>
          Master Holder Opinions
        </h2>
        <p className="sl-body-sm sl-text-muted">
          Cards for up to 6 master holders with their position, philosophy excerpt,
          and recent activity will appear here.
        </p>
      </section>
    </div>
  );
}

/** Stub opinion distribution bar (Strong Buy to Strong Sell). */
function OpinionBarStub() {
  const segments = [
    { label: "Strong Buy", pct: 0, color: "var(--sl-up)" },
    { label: "Buy", pct: 0, color: "var(--sl-up)" },
    { label: "Hold", pct: 0, color: "var(--sl-warn)" },
    { label: "Sell", pct: 0, color: "var(--sl-down)" },
    { label: "Strong Sell", pct: 0, color: "var(--sl-down)" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--sl-space-3)" }}>
      <div
        style={{
          display: "flex",
          height: 28,
          borderRadius: "var(--sl-radius-sm)",
          overflow: "hidden",
          background: "var(--sl-surface-alt)",
        }}
      >
        {segments.map((seg) => (
          <div
            key={seg.label}
            title={`${seg.label}: ${seg.pct}%`}
            style={{
              flex: seg.pct || 1,
              background: seg.pct > 0 ? seg.color : "var(--sl-line)",
              opacity: seg.pct > 0 ? 1 : 0.3,
              minWidth: seg.pct > 0 ? undefined : 1,
              transition: "flex var(--sl-motion-base)",
            }}
          />
        ))}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 11,
          color: "var(--sl-muted)",
        }}
      >
        {segments.map((seg) => (
          <span key={seg.label}>
            {seg.label} ({seg.pct}%)
          </span>
        ))}
      </div>

      <p className="sl-caption">
        No analyst consensus data available yet.
      </p>
    </div>
  );
}
