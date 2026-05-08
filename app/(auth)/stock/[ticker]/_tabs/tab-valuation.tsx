/**
 * Valuation tab — PER / PBR / EV-EBITDA / Dividend cards + 5-year trend
 * + 3 valuation methods + peer comparison.
 *
 * Server-rendered. Shows stub cards until valuation data pipeline is active.
 */

export function ValuationTab() {
  const metrics = [
    { label: "P/E Ratio (TTM)", value: null, note: "Trailing twelve months" },
    { label: "P/B Ratio", value: null, note: "Price to book" },
    { label: "EV / EBITDA", value: null, note: "Enterprise value" },
    { label: "Dividend Yield", value: null, note: "Annualized" },
    { label: "FCF Yield", value: null, note: "Free cash flow" },
    { label: "PEG Ratio", value: null, note: "P/E vs growth" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--sl-space-5)" }}>
      {/* Valuation metric cards */}
      <section className="sl-card" style={{ padding: "var(--sl-space-5)" }}>
        <h2 className="sl-h3" style={{ marginBottom: "var(--sl-space-4)" }}>
          Valuation Metrics
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: "var(--sl-space-3)",
          }}
        >
          {metrics.map((m) => (
            <div
              key={m.label}
              className="sl-card-soft"
              style={{
                padding: "var(--sl-space-4)",
                borderRadius: "var(--sl-radius-md)",
              }}
            >
              <div className="sl-caption">{m.label}</div>
              <div
                className="sl-mono"
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  marginTop: "var(--sl-space-2)",
                  color: "var(--sl-muted)",
                }}
              >
                —
              </div>
              <div className="sl-caption" style={{ marginTop: "var(--sl-space-1)" }}>
                {m.note}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trend placeholder */}
      <section className="sl-card" style={{ padding: "var(--sl-space-5)" }}>
        <h2 className="sl-h3" style={{ marginBottom: "var(--sl-space-3)" }}>
          5-Year P/E &amp; P/B Trend
        </h2>
        <div
          style={{
            height: 180,
            background: "var(--sl-surface-alt)",
            borderRadius: "var(--sl-radius-md)",
            border: "1px dashed var(--sl-line-strong)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <p className="sl-body-sm sl-text-muted">
            Historical valuation data will appear once the financials pipeline is active.
          </p>
        </div>
      </section>

      {/* Valuation methods */}
      <section className="sl-card" style={{ padding: "var(--sl-space-5)" }}>
        <h2 className="sl-h3" style={{ marginBottom: "var(--sl-space-3)" }}>
          Valuation Methods
        </h2>
        <ul
          className="sl-body-sm"
          style={{
            paddingLeft: "var(--sl-space-5)",
            display: "flex",
            flexDirection: "column",
            gap: "var(--sl-space-2)",
          }}
        >
          <li>DCF (Discounted Cash Flow): Pending data</li>
          <li>Comparable Companies Analysis: Pending peers</li>
          <li>Precedent Transactions: Pending M&A data</li>
        </ul>
      </section>
    </div>
  );
}
