/**
 * Filings & Earnings tab — 20-quarter earnings trend + next-earnings consensus
 * + filing timeline with filter stubs.
 *
 * Server-rendered. Shows empty state until filings pipeline is active.
 */

export function FilingsTab() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--sl-space-5)" }}>
      {/* Filter stubs */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--sl-space-2)",
          flexWrap: "wrap",
        }}
      >
        {["All", "Earnings", "Amendments", "Governance", "M&A"].map((filter) => (
          <span key={filter} className="sl-tag">
            {filter}
          </span>
        ))}
      </div>

      {/* Earnings trend placeholder */}
      <section className="sl-card" style={{ padding: "var(--sl-space-5)" }}>
        <h2 className="sl-h3" style={{ marginBottom: "var(--sl-space-4)" }}>
          Earnings Trend (20 Quarters)
        </h2>
        <div
          style={{
            height: 220,
            background: "var(--sl-surface-alt)",
            borderRadius: "var(--sl-radius-md)",
            border: "1px dashed var(--sl-line-strong)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "var(--sl-space-2)",
          }}
        >
          <svg width={48} height={48} viewBox="0 0 24 24" fill="none" stroke="var(--sl-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <title>Filings</title>
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <polyline points="14,2 14,8 20,8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10,9 9,9 8,9" />
          </svg>
          <p className="sl-body-sm sl-text-muted">No earnings data available</p>
          <p className="sl-caption">
            Quarterly earnings data will appear after the DART / EDGAR import pipeline runs.
          </p>
        </div>
      </section>

      {/* Next earnings */}
      <section className="sl-card" style={{ padding: "var(--sl-space-5)" }}>
        <h2 className="sl-h3" style={{ marginBottom: "var(--sl-space-3)" }}>
          Next Earnings
        </h2>
        <p className="sl-body-sm sl-text-muted">
          Consensus date and estimates will be displayed here once the
          earnings calendar data source is connected.
        </p>
      </section>

      {/* Filing timeline placeholder */}
      <section className="sl-card" style={{ padding: "var(--sl-space-5)" }}>
        <h2 className="sl-h3" style={{ marginBottom: "var(--sl-space-3)" }}>
          Recent Filings
        </h2>
        <p className="sl-body-sm sl-text-muted">
          SEC / KRX filing timeline will be populated by the document ingestion pipeline.
        </p>
      </section>
    </div>
  );
}
