import { redirect } from "next/navigation";

import { readTemporaryAuthCookie } from "@/app/_lib/auth/cookies";
import { GlobalHeader } from "@/app/_lib/home/global-header";

export const metadata = {
  title: "STOCKLAB — Transactions",
  description:
    "Transaction history and entry for your portfolio positions.",
};

// ── Page ────────────────────────────────────────────────────────────────

/**
 * Transactions page — read-only deep-link target under temporary auth.
 *
 * Explains that real Supabase OAuth is required for transaction entry.
 * Links back to portfolio transactions tab.
 */
export default async function TransactionsPage() {
  const session = await readTemporaryAuthCookie();
  if (!session) {
    redirect("/login");
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--sl-bg)" }}>
      <GlobalHeader userName={session?.role ?? undefined} />

      <main
        style={{
          maxWidth: 720,
          margin: "0 auto",
          padding: "var(--sl-space-5) var(--sl-space-6)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--sl-space-5)",
        }}
      >
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" style={{ fontSize: 12 }}>
          <a href="/portfolio?tab=transactions" className="sl-text-muted" style={{ textDecoration: "none" }}>
            &larr; Back to Portfolio
          </a>
        </nav>

        {/* Auth gate explanation */}
        <section
          className="sl-card"
          style={{
            padding: "var(--sl-space-7) var(--sl-space-6)",
            textAlign: "center",
            background: "linear-gradient(135deg, var(--sl-surface), var(--sl-warn-soft))",
            borderLeft: "4px solid var(--sl-warn)",
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: "var(--sl-line)",
              margin: "0 auto var(--sl-space-5)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="var(--sl-muted)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <title>Lock icon</title>
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
          </div>

          <h1 className="sl-h2" style={{ marginBottom: "var(--sl-space-3)" }}>
            Transaction Entry Requires Real Authentication
          </h1>

          <p className="sl-body-sm" style={{ color: "var(--sl-ink-sub)", lineHeight: 1.7, maxWidth: 480, margin: "0 auto var(--sl-space-5)" }}>
            You are currently using a temporary session, which provides read-only access to STOCKLAB.
            Writing transactions (buy, sell, dividend records) requires real Supabase OAuth authentication
            with a persistent user account.
          </p>

          <div
            style={{
              display: "flex",
              gap: "var(--sl-space-3)",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <button
              type="button"
              disabled
              className="sl-btn sl-btn-primary"
              style={{ opacity: 0.55, cursor: "not-allowed" }}
              title="Requires real Supabase OAuth"
            >
              + Add Transaction
            </button>
            <a href="/portfolio?tab=transactions" className="sl-btn sl-btn-secondary">
              View Portfolio Summary
            </a>
          </div>
        </section>

        {/* What you can do once authenticated */}
        <section className="sl-card" style={{ padding: "var(--sl-space-5) var(--sl-space-6)" }}>
          <div className="sl-label" style={{ marginBottom: "var(--sl-space-4)" }}>
            Once Real OAuth Is Enabled
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--sl-space-3)" }}>
            {[
              {
                icon: "M12 6v6m0 0v6m0-6h6m-6 0H6",
                label: "Record Buy/Sell Transactions",
                desc: "Log every trade with symbol, quantity, price, fees, and currency.",
              },
              {
                icon: "M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
                label: "Track Dividend Income",
                desc: "Record dividend payments per share with automatic P&L tracking.",
              },
              {
                icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
                label: "Automatic Holdings Calculation",
                desc: "Holdings are derived from transactions via database triggers \u2014 no manual entry needed.",
              },
              {
                icon: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
                label: "Capital Gains Estimation",
                desc: "FIFO-based realized gain/loss simulation for tax planning (informational only).",
              },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  display: "flex",
                  gap: "var(--sl-space-4)",
                  padding: "var(--sl-space-3)",
                  borderRadius: "var(--sl-radius-md)",
                  background: "var(--sl-surface-alt)",
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "var(--sl-radius-md)",
                    background: "var(--sl-brand-soft)",
                    color: "var(--sl-brand)",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d={item.icon} />
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--sl-ink)" }}>{item.label}</div>
                  <div className="sl-body-sm" style={{ marginTop: 2 }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer
          style={{
            textAlign: "center",
            paddingTop: "var(--sl-space-6)",
            paddingBottom: "var(--sl-space-8)",
            marginTop: "var(--sl-space-5)",
            borderTop: "1px solid var(--sl-line)",
          }}
        >
          <span className="sl-caption">
            Referential use only. Not investment advice. User is responsible for their own decisions.
          </span>
          <br />
          <span className="sl-caption" style={{ color: "var(--sl-faint)" }}>
            STOCKLAB M5 &middot; Transactions
          </span>
        </footer>
      </main>
    </div>
  );
}
