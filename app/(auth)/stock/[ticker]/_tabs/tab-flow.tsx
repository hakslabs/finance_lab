/**
 * Supply / Demand tab — Foreign / institutional / individual flow
 * (KR daily, US quarterly 13F) + 90-day short interest + top institutional holders.
 *
 * Server-rendered. Shows empty state until supply/demand pipeline is active.
 */

export function FlowTab() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--sl-space-5)" }}>
      {/* Flow summary cards */}
      <section className="sl-card" style={{ padding: "var(--sl-space-5)" }}>
        <h2 className="sl-h3" style={{ marginBottom: "var(--sl-space-4)" }}>
          Shareholder Flow
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
            gap: "var(--sl-space-3)",
          }}
        >
          {[
            { label: "Foreign Investors", value: "—" },
            { label: "Institutions", value: "—" },
            { label: "Individuals (Retail)", value: "—" },
            { label: "Short Interest (90d)", value: "—" },
          ].map((card) => (
            <div
              key={card.label}
              className="sl-card-soft"
              style={{
                padding: "var(--sl-space-3) var(--sl-space-4)",
                borderRadius: "var(--sl-radius-md)",
              }}
            >
              <div className="sl-caption">{card.label}</div>
              <div
                className="sl-mono"
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  marginTop: "var(--sl-space-1)",
                  color: "var(--sl-muted)",
                }}
              >
                {card.value}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Flow chart placeholder */}
      <section className="sl-card" style={{ padding: "var(--sl-space-5)" }}>
        <h2 className="sl-h3" style={{ marginBottom: "var(--sl-space-3)" }}>
          Flow Trend (90 Days)
        </h2>
        <div
          style={{
            height: 200,
            background: "var(--sl-surface-alt)",
            borderRadius: "var(--sl-radius-md)",
            border: "1px dashed var(--sl-line-strong)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <p className="sl-body-sm sl-text-muted">
            Daily flow data will appear once the KRX / EDGAR data source is connected.
          </p>
        </div>

        {/* Data source footnote */}
        <p className="sl-caption" style={{ marginTop: "var(--sl-space-2)", color: "var(--sl-faint)" }}>
          Data sources: EDGAR (US 13F), KRX (KR daily). Footnote required per product spec.
        </p>
      </section>

      {/* Top institutional holders */}
      <section className="sl-card" style={{ padding: "var(--sl-space-5)" }}>
        <h2 className="sl-h3" style={{ marginBottom: "var(--sl-space-3)" }}>
          Top Institutional Holders
        </h2>
        <p className="sl-body-sm sl-text-muted">
          Institutional holder breakdown from 13F filings will be displayed here.
          Data refreshes quarterly after each filing deadline.
        </p>
      </section>
    </div>
  );
}
