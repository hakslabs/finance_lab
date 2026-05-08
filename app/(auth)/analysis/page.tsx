import { redirect } from "next/navigation";

import { type AnalysisData, fetchAnalysisData } from "@/app/_lib/analysis/analysis-data";
import { readTemporaryAuthCookie } from "@/app/_lib/auth/cookies";
import { GlobalHeader } from "@/app/_lib/home/global-header";

export const metadata = {
  title: "STOCKLAB — Market Analysis",
  description:
    "Market overview, sentiment gauges, technical signals, and financial sector analysis.",
};

/** Tab IDs for the analysis page. */
export type AnalysisTabId =
  | "overview"
  | "sentiment"
  | "technical"
  | "financial";

const ANALYSIS_TABS: readonly { id: AnalysisTabId; label: string }[] = [
  { id: "overview", label: "Market Overview" },
  { id: "sentiment", label: "Sentiment" },
  { id: "technical", label: "Technical" },
  { id: "financial", label: "Financial" },
];

/** Tool cards shown at the top of the analysis hub. */
const TOOL_CARDS: readonly {
  id: string;
  label: string;
  description: string;
  tab: AnalysisTabId;
  icon: string;
}[] = [
  {
    id: "market-map",
    label: "Market Map",
    description: "Visual market heatmap",
    tab: "overview",
    icon: "M3.75 13.25l3-3m0 0l3 3M3.75 7.5l3-3m0 0l3 3M16.5 13.25V6a1.5 1.5 0 00-1.5-1.5h-4.5M16.5 13.25L12 8.75M12 8.75H7.5A1.5 1.5 0 006 10.5v6.75",
  },
  {
    id: "sentiment-gauge",
    label: "Sentiment",
    description: "Fear & Greed, VIX",
    tab: "sentiment",
    icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
  },
  {
    id: "technical-analysis",
    label: "Technical",
    description: "52W H/L, RSI, MA breadth",
    tab: "technical",
    icon: "M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z",
  },
  {
    id: "financial-compare",
    label: "Financials",
    description: "Sector P/E, ROE, D/E",
    tab: "financial",
    icon: "M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z",
  },
  {
    id: "sector-rotation",
    label: "Sector Rotation",
    description: "Relative strength by sector",
    tab: "overview",
    icon: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15",
  },
  {
    id: "correlation",
    label: "Correlation",
    description: "Cross-asset correlation matrix",
    tab: "technical",
    icon: "M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1",
  },
  {
    id: "economic-indicators",
    label: "Economic Data",
    description: "Macro indicators dashboard",
    tab: "sentiment",
    icon: "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  {
    id: "fx-tracking",
    label: "FX Tracking",
    description: "Currency pair monitoring",
    tab: "sentiment",
    icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  },
];

// ── Page ────────────────────────────────────────────────────────────────

/**
 * Analysis hub page — server-rendered with tool cards and four data tabs.
 *
 * Protected by the temporary M0 auth session.
 * All data reads from Supabase cache tables; no external API calls on render.
 */
export default async function AnalysisPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await readTemporaryAuthCookie();
  if (!session) {
    redirect("/login");
  }

  const params = (await searchParams) ?? {};
  const selectedTab = typeof params.tab === "string" ? params.tab : undefined;
  const activeTab: AnalysisTabId =
    ANALYSIS_TABS.find((t) => t.id === selectedTab)?.id ?? "overview";

  // Fetch all analysis data in parallel
  const data = await fetchAnalysisData();

  return (
    <div style={{ minHeight: "100vh", background: "var(--sl-bg)" }}>
      <GlobalHeader userName={session?.role ?? undefined} />

      <main
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "var(--sl-space-5) var(--sl-space-6)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--sl-space-5)",
        }}
      >
        {/* Page header */}
        <header>
          <h1 className="sl-h1">Market Analysis</h1>
          <p className="sl-body-sm" style={{ marginTop: "var(--sl-space-2)", color: "var(--sl-ink-sub)" }}>
            Market-wide tools and data derived from cached indices, quotes, sentiment, and financials.
          </p>
        </header>

        {/* Tool cards grid */}
        <section aria-label="Analysis tools">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: "var(--sl-space-3)",
            }}
          >
            {TOOL_CARDS.map((tool) => (
              <ToolCard
                key={tool.id}
                tool={tool}
                isActive={activeTab === tool.tab}
              />
            ))}
          </div>
        </section>

        {/* Tab navigation */}
        <div
          role="tablist"
          aria-label="Analysis tabs"
          style={{
            display: "flex",
            gap: "var(--sl-space-1)",
            borderBottom: "1px solid var(--sl-line)",
            paddingBottom: "var(--sl-space-2)",
          }}
        >
          {ANALYSIS_TABS.map((tab) => (
            <a
              key={tab.id}
              href={`?tab=${tab.id}`}
              role="tab"
              aria-selected={activeTab === tab.id}
              data-active={activeTab === tab.id ? "true" : undefined}
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "var(--sl-space-2) var(--sl-space-4)",
                fontSize: 13,
                fontWeight: activeTab === tab.id ? 600 : 500,
                color:
                  activeTab === tab.id
                    ? "var(--sl-brand)"
                    : "var(--sl-muted)",
                textDecoration: "none",
                borderBottom:
                  activeTab === tab.id
                    ? "2px solid var(--sl-brand)"
                    : "2px solid transparent",
                transition: "all var(--sl-motion-fast)",
                marginBottom: "-1px",
              }}
            >
              {tab.label}
            </a>
          ))}
        </div>

        {/* Tab panels (server-rendered; URL state controls visibility) */}
        {ANALYSIS_TABS.map((tab) => (
          <section
            key={tab.id}
            id={tab.id}
            role="tabpanel"
            aria-label={`${tab.label} panel`}
            aria-hidden={activeTab !== tab.id}
            style={{
              display: activeTab === tab.id ? "block" : "none",
            }}
          >
            {renderTabPanel(tab.id, data)}
          </section>
        ))}

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
            STOCKLAB M3 &middot; Market Analysis
          </span>
        </footer>
      </main>
    </div>
  );
}

// ── Tool Card ────────────────────────────────────────────────────────────

function ToolCard({
  tool,
  isActive,
}: {
  tool: (typeof TOOL_CARDS)[number];
  isActive: boolean;
}) {
  return (
    <a
      href={`?tab=${tool.tab}`}
      className="sl-card"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--sl-space-3)",
        padding: "var(--sl-space-4)",
        textDecoration: "none",
        color: "inherit",
        transition: "border-color var(--sl-motion-fast), box-shadow var(--sl-motion-fast)",
        borderColor: isActive ? "var(--sl-brand)" : "var(--sl-line)",
        ...(isActive
          ? { boxShadow: "var(--sl-shadow-focus)" }
          : {}),
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: "var(--sl-radius-md)",
          background: isActive
            ? "var(--sl-brand-soft)"
            : "var(--sl-surface-alt)",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <svg
          width={18}
          height={18}
          viewBox="0 0 24 24"
          fill="none"
          stroke={
            isActive ? "var(--sl-brand)" : "var(--sl-muted)"
          }
          strokeWidth={1.75}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d={tool.icon} />
        </svg>
      </div>

      <div>
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "var(--sl-ink)",
          }}
        >
          {tool.label}
        </div>
        <div
          style={{
            fontSize: 11,
            color: "var(--sl-muted)",
            marginTop: 2,
          }}
        >
          {tool.description}
        </div>
      </div>
    </a>
  );
}

// ── Tab Panel Renderers ─────────────────────────────────────────────────

function renderTabPanel(tabId: AnalysisTabId, data: AnalysisData) {
  switch (tabId) {
    case "overview":
      return <OverviewTab data={data} />;
    case "sentiment":
      return <SentimentTab data={data} />;
    case "technical":
      return <TechnicalTab data={data} />;
    case "financial":
      return <FinancialTab data={data} />;
  }
}

// ── Overview Tab ────────────────────────────────────────────────────────

function OverviewTab({ data }: { data: AnalysisData }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--sl-space-5)" }}>
      {/* Index cards */}
      <section className="sl-card" aria-label="Index cards" style={{ padding: "var(--sl-space-5) var(--sl-space-6)" }}>
        <div className="sl-label" style={{ marginBottom: "var(--sl-space-4)" }}>Major Indices</div>
        {data.indices.length > 0 ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "var(--sl-space-3)",
            }}
          >
            {data.indices.map((idx) => (
              <IndexMiniCard key={idx.code} index={idx} />
            ))}
          </div>
        ) : (
          <EmptyState message="Index data will appear after the next cron refresh." />
        )}
      </section>

      {/* Country snapshot */}
      <section className="sl-card" aria-label="Country snapshot" style={{ padding: "var(--sl-space-5) var(--sl-space-6)" }}>
        <div className="sl-label" style={{ marginBottom: "var(--sl-space-4)" }}>Country Snapshot</div>
        {data.countrySnapshots.length > 0 ? (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--sl-line)" }}>
                  <th style={{ textAlign: "left", padding: "var(--sl-space-2) var(--sl-space-3)", color: "var(--sl-muted)", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em" }}>Country</th>
                  <th style={{ textAlign: "right", padding: "var(--sl-space-2) var(--sl-space-3)", color: "var(--sl-muted)", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em" }}>Securities</th>
                  <th style={{ textAlign: "right", padding: "var(--sl-space-2) var(--sl-space-3)", color: "var(--sl-muted)", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em" }}>Sectors</th>
                  <th style={{ textAlign: "left", padding: "var(--sl-space-2) var(--sl-space-3)", color: "var(--sl-muted)", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em" }}>Top Sectors</th>
                </tr>
              </thead>
              <tbody>
                {data.countrySnapshots.map((cs) => (
                  <tr key={cs.country} style={{ borderBottom: "1px solid var(--sl-hairline)" }}>
                    <td style={{ padding: "var(--sl-space-2) var(--sl-space-3)", fontWeight: 500 }}>{cs.country}</td>
                    <td style={{ padding: "var(--sl-space-2) var(--sl-space-3)", textAlign: "right" }} className="sl-mono">{cs.securityCount}</td>
                    <td style={{ padding: "var(--sl-space-2) var(--sl-space-3)", textAlign: "right" }} className="sl-mono">{cs.sectorCount}</td>
                    <td style={{ padding: "var(--sl-space-2) var(--sl-space-3)", color: "var(--sl-ink-sub)", fontSize: 12 }}>{cs.topSectors.join(", ")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState message="Country data requires populated securities_master records." />
        )}
      </section>

      {/* Sector returns */}
      <section className="sl-card" aria-label="Sector returns" style={{ padding: "var(--sl-space-5) var(--sl-space-6)" }}>
        <div className="sl-label" style={{ marginBottom: "var(--sl-space-4)" }}>Sector Returns</div>
        {data.sectorReturns.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--sl-space-2)" }}>
            {data.sectorReturns.map((sr) => (
              <SectorBar key={sr.sector} sector={sr} />
            ))}
          </div>
        ) : (
          <EmptyState message="Sector return data requires both quote and security master records." />
        )}
      </section>

      {/* Top movers — KR + US side by side */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
          gap: "var(--sl-space-5)",
        }}
      >
        <section className="sl-card" aria-label="KR Top Movers" style={{ padding: "var(--sl-space-5) var(--sl-space-6)" }}>
          <div className="sl-label" style={{ marginBottom: "var(--sl-space-4)" }}>KR Top Movers</div>
          {data.krMovers.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--sl-space-2)" }}>
              {data.krMovers.map((m) => (
                <MoverRow key={m.symbol} mover={m} />
              ))}
            </div>
          ) : (
            <EmptyState message="No KR quote data available yet." />
          )}
        </section>

        <section className="sl-card" aria-label="US Top Movers" style={{ padding: "var(--sl-space-5) var(--sl-space-6)" }}>
          <div className="sl-label" style={{ marginBottom: "var(--sl-space-4)" }}>US Top Movers</div>
          {data.usMovers.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--sl-space-2)" }}>
              {data.usMovers.map((m) => (
                <MoverRow key={m.symbol} mover={m} />
              ))}
            </div>
          ) : (
            <EmptyState message="No US quote data available yet." />
          )}
        </section>
      </div>
    </div>
  );
}

// ── Sentiment Tab ───────────────────────────────────────────────────────

function SentimentTab({ data }: { data: AnalysisData }) {
  const usSlots = data.sentimentSlots.filter((s) => s.category === "us");
  const krSlots = data.sentimentSlots.filter((s) => s.category === "kr");
  const macroSlots = data.sentimentSlots.filter((s) => s.category === "macro");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--sl-space-5)" }}>
      {/* US sentiment slots (always rendered — 3 fixed slots) */}
      <section className="sl-card" aria-label="US sentiment" style={{ padding: "var(--sl-space-5) var(--sl-space-6)" }}>
        <div className="sl-label" style={{ marginBottom: "var(--sl-space-4)" }}>United States</div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "var(--sl-space-4)",
          }}
        >
          {usSlots.map((s) => <GaugeSlotCard key={s.code} slot={s} />)}
        </div>
      </section>

      {/* KR sentiment slots (always rendered — 2 fixed slots) */}
      <section className="sl-card" aria-label="KR sentiment" style={{ padding: "var(--sl-space-5) var(--sl-space-6)" }}>
        <div className="sl-label" style={{ marginBottom: "var(--sl-space-4)" }}>Korea</div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "var(--sl-space-4)",
          }}
        >
          {krSlots.map((s) => <GaugeSlotCard key={s.code} slot={s} />)}
        </div>
      </section>

      {/* Macro sentiment slots (always rendered — 4 fixed slots) */}
      <section className="sl-card" aria-label="Macro sentiment" style={{ padding: "var(--sl-space-5) var(--sl-space-6)" }}>
        <div className="sl-label" style={{ marginBottom: "var(--sl-space-4)" }}>Global Macro</div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "var(--sl-space-4)",
          }}
        >
          {macroSlots.map((s) => <GaugeSlotCard key={s.code} slot={s} />)}
        </div>
      </section>
    </div>
  );
}

// ── Technical Tab ────────────────────────────────────────────────────────

function TechnicalTab({ data }: { data: AnalysisData }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--sl-space-5)" }}>
      {/* 52-week high/low summary */}
      <section className="sl-card" aria-label="52-week range" style={{ padding: "var(--sl-space-5) var(--sl-space-6)" }}>
        <div className="sl-label" style={{ marginBottom: "var(--sl-space-4)" }}>52-Week Range Distribution</div>
        {data.highLow.total > 0 ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "var(--sl-space-4)",
            }}
          >
            <StatBox label="Near 52W High (&ge;95%)" value={String(data.highLow.nearHigh)} sub={`of ${data.highLow.total} stocks`} color="var(--sl-up)" />
            <StatBox label="Near 52W Low (&le;5%)" value={String(data.highLow.nearLow)} sub={`of ${data.highLow.total} stocks`} color="var(--sl-down)" />
            <StatBox label="Total Tracked" value={String(data.highLow.total)} sub="with daily OHLC data" color="var(--sl-ink-sub)" />
          </div>
        ) : (
          <EmptyState message="52-week high/low distribution requires populated daily quote data." />
        )}
      </section>

      {/* MA200 breadth placeholder */}
      <section className="sl-card" aria-label="MA breadth" style={{ padding: "var(--sl-space-5) var(--sl-space-6)" }}>
        <div className="sl-label" style={{ marginBottom: "var(--sl-space-3)" }}>MA200 Breadth</div>
        <EmptyState message="Moving-average breadth data will be available when the daily quote pipeline computes MA series." compact />
      </section>

      {/* RSI distribution placeholder */}
      <section className="sl-card" aria-label="RSI distribution" style={{ padding: "var(--sl-space-5) var(--sl-space-6)" }}>
        <div className="sl-label" style={{ marginBottom: "var(--sl-space-3)" }}>RSI Distribution</div>
        <EmptyState message="RSI distribution will be available when the technical indicator pipeline is active." compact />
      </section>

      {/* Signal table */}
      <section className="sl-card" aria-label="Price signals" style={{ padding: "var(--sl-space-5) var(--sl-space-6)" }}>
        <div className="sl-label" style={{ marginBottom: "var(--sl-space-4)" }}>Price Momentum Signals</div>
        {data.techSignals.length > 0 ? (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--sl-line)" }}>
                  <th style={{ textAlign: "left", padding: "var(--sl-space-2) var(--sl-space-3)", color: "var(--sl-muted)", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em" }}>Symbol</th>
                  <th style={{ textAlign: "left", padding: "var(--sl-space-2) var(--sl-space-3)", color: "var(--sl-muted)", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em" }}>Name</th>
                  <th style={{ textAlign: "right", padding: "var(--sl-space-2) var(--sl-space-3)", color: "var(--sl-muted)", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em" }}>Price</th>
                  <th style={{ textAlign: "right", padding: "var(--sl-space-2) var(--sl-space-3)", color: "var(--sl-muted)", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em" }}>Change</th>
                  <th style={{ textAlign: "center", padding: "var(--sl-space-2) var(--sl-space-3)", color: "var(--sl-muted)", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em" }}>Signal</th>
                </tr>
              </thead>
              <tbody>
                {data.techSignals.map((sig) => (
                  <tr
                    key={sig.symbol}
                    style={{ borderBottom: "1px solid var(--sl-hairline)" }}
                  >
                    <td style={{ padding: "var(--sl-space-2) var(--sl-space-3)" }}>
                      <a
                        href={`/stock/${sig.symbol}`}
                        className="sl-mono"
                        style={{
                          fontWeight: 600,
                          color: "var(--sl-brand)",
                          textDecoration: "none",
                        }}
                      >
                        {sig.symbol}
                      </a>
                    </td>
                    <td style={{ padding: "var(--sl-space-2) var(--sl-space-3)", color: "var(--sl-ink-sub)" }}>{sig.name}</td>
                    <td style={{ padding: "var(--sl-space-2) var(--sl-space-3)", textAlign: "right" }} className="sl-mono">
                      {sig.px !== null ? formatPx(sig.px) : "\u2014"}
                    </td>
                    <td style={{ padding: "var(--sl-space-2) var(--sl-space-3)", textAlign: "right" }} className="sl-mono">
                      <SignalPct pct={sig.pct} />
                    </td>
                    <td style={{ padding: "var(--sl-space-2) var(--sl-space-3)", textAlign: "center" }}>
                      <SignalBadge signal={sig.signal} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState message="No quote data available for signal computation." />
        )}
      </section>
    </div>
  );
}

// ── Financial Tab ───────────────────────────────────────────────────────

function FinancialTab({ data }: { data: AnalysisData }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--sl-space-5)" }}>
      <section className="sl-card" aria-label="Financial sectors" style={{ padding: "var(--sl-space-5) var(--sl-space-6)" }}>
        <div className="sl-label" style={{ marginBottom: "var(--sl-space-4)" }}>Sector Financial Averages</div>
        {data.financialSectors.length > 0 ? (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--sl-line)" }}>
                  <th style={{ textAlign: "left", padding: "var(--sl-space-2) var(--sl-space-3)", color: "var(--sl-muted)", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em" }}>Sector</th>
                  <th style={{ textAlign: "right", padding: "var(--sl-space-2) var(--sl-space-3)", color: "var(--sl-muted)", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em" }}>Avg P/E</th>
                  <th style={{ textAlign: "right", padding: "var(--sl-space-2) var(--sl-space-3)", color: "var(--sl-muted)", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em" }}>Avg P/B</th>
                  <th style={{ textAlign: "right", padding: "var(--sl-space-2) var(--sl-space-3)", color: "var(--sl-muted)", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em" }}>Avg ROE</th>
                  <th style={{ textAlign: "right", padding: "var(--sl-space-2) var(--sl-space-3)", color: "var(--sl-muted)", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em" }}>Avg D/E</th>
                  <th style={{ textAlign: "right", padding: "var(--sl-space-2) var(--sl-space-3)", color: "var(--sl-muted)", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em" }}>Count</th>
                </tr>
              </thead>
              <tbody>
                {data.financialSectors.map((fs) => (
                  <tr key={fs.sector} style={{ borderBottom: "1px solid var(--sl-hairline)" }}>
                    <td style={{ padding: "var(--sl-space-2) var(--sl-space-3)", fontWeight: 500 }}>{fs.sector}</td>
                    <td style={{ padding: "var(--sl-space-2) var(--sl-space-3)", textAlign: "right" }} className="sl-mono">{fs.pe !== null ? fs.pe.toFixed(1) : "\u2014"}</td>
                    <td style={{ padding: "var(--sl-space-2) var(--sl-space-3)", textAlign: "right" }} className="sl-mono">{fs.pb !== null ? fs.pb.toFixed(2) : "\u2014"}</td>
                    <td style={{ padding: "var(--sl-space-2) var(--sl-space-3)", textAlign: "right" }} className="sl-mono">{fs.roe !== null ? `${fs.roe.toFixed(1)}%` : "\u2014"}</td>
                    <td style={{ padding: "var(--sl-space-2) var(--sl-space-3)", textAlign: "right" }} className="sl-mono">{fs.de !== null ? fs.de.toFixed(2) : "\u2014"}</td>
                    <td style={{ padding: "var(--sl-space-2) var(--sl-space-3)", textAlign: "right", color: "var(--sl-muted)" }} className="sl-mono">{fs.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState message="Financial sector averages require populated financial ratios data from the import pipeline." />
        )}
      </section>

      {/* Market comparison (real data from cached financials) */}
      <section className="sl-card" aria-label="Market comparison" style={{ padding: "var(--sl-space-5) var(--sl-space-6)" }}>
        <div className="sl-label" style={{ marginBottom: "var(--sl-space-4)" }}>Market Comparison</div>
        {data.marketComparison.length > 0 ? (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--sl-line)" }}>
                  <th style={{ textAlign: "left", padding: "var(--sl-space-2) var(--sl-space-3)", color: "var(--sl-muted)", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em" }}>Market</th>
                  <th style={{ textAlign: "right", padding: "var(--sl-space-2) var(--sl-space-3)", color: "var(--sl-muted)", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em" }}>Avg P/E</th>
                  <th style={{ textAlign: "right", padding: "var(--sl-space-2) var(--sl-space-3)", color: "var(--sl-muted)", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em" }}>Avg P/B</th>
                  <th style={{ textAlign: "right", padding: "var(--sl-space-2) var(--sl-space-3)", color: "var(--sl-muted)", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em" }}>Avg ROE</th>
                  <th style={{ textAlign: "right", padding: "var(--sl-space-2) var(--sl-space-3)", color: "var(--sl-muted)", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em" }}>Avg D/E</th>
                  <th style={{ textAlign: "right", padding: "var(--sl-space-2) var(--sl-space-3)", color: "var(--sl-muted)", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em" }}>Securities</th>
                </tr>
              </thead>
              <tbody>
                {data.marketComparison.map((mc) => (
                  <tr key={mc.market} style={{ borderBottom: "1px solid var(--sl-hairline)" }}>
                    <td style={{ padding: "var(--sl-space-2) var(--sl-space-3)", fontWeight: 500 }}>{mc.market}</td>
                    <td style={{ padding: "var(--sl-space-2) var(--sl-space-3)", textAlign: "right" }} className="sl-mono">{mc.avgPe !== null ? mc.avgPe.toFixed(1) : "\u2014"}</td>
                    <td style={{ padding: "var(--sl-space-2) var(--sl-space-3)", textAlign: "right" }} className="sl-mono">{mc.avgPb !== null ? mc.avgPb.toFixed(2) : "\u2014"}</td>
                    <td style={{ padding: "var(--sl-space-2) var(--sl-space-3)", textAlign: "right" }} className="sl-mono">{mc.avgRoe !== null ? `${mc.avgRoe.toFixed(1)}%` : "\u2014"}</td>
                    <td style={{ padding: "var(--sl-space-2) var(--sl-space-3)", textAlign: "right" }} className="sl-mono">{mc.avgDe !== null ? mc.avgDe.toFixed(2) : "\u2014"}</td>
                    <td style={{ padding: "var(--sl-space-2) var(--sl-space-3)", textAlign: "right", color: "var(--sl-muted)" }} className="sl-mono">{mc.securityCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState message="Cross-market financial comparison requires populated financial data for both KR and US securities." compact />
        )}
      </section>
    </div>
  );
}

// ── Shared UI Components ───────────────────────────────────────────────

function EmptyState({ message, compact = false }: { message: string; compact?: boolean }) {
  return (
    <div
      className="sl-center"
      style={{
        flexDirection: "column",
        gap: compact ? "var(--sl-space-2)" : "var(--sl-space-3)",
        padding: compact ? "var(--sl-space-4) 0" : "var(--sl-space-6) 0",
      }}
    >
      <span className="sl-text-muted sl-body-sm">{message}</span>
    </div>
  );
}

function IndexMiniCard({ index }: { index: import("@/app/_lib/analysis/analysis-data").AnalysisIndex }) {
  const pos = index.change !== null ? index.change >= 0 : null;
  const color = pos === null ? "var(--sl-muted)" : pos ? "var(--sl-up)" : "var(--sl-down)";

  return (
    <div
      style={{
        padding: "var(--sl-space-3) var(--sl-space-4)",
        borderRadius: "var(--sl-radius-md)",
        background: "var(--sl-surface-alt)",
        border: "1px solid var(--sl-hairline)",
      }}
    >
      <div style={{ fontSize: 11, fontWeight: 600, color: "var(--sl-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
        {index.label}
      </div>
      <div className="sl-mono" style={{ fontSize: 17, fontWeight: 700, marginTop: 2, letterSpacing: "-0.02em" }}>
        {index.value !== null ? formatIndexVal(index.value) : "\u2014"}
      </div>
      <div className="sl-mono" style={{ fontSize: 12, fontWeight: 600, color, marginTop: 2 }}>
        {index.change !== null ? `${index.change >= 0 ? "+" : ""}${index.change.toFixed(2)}%` : "\u2014"}
      </div>
    </div>
  );
}

function SectorBar({ sector }: { sector: { sector: string; returnPct: number | null; count: number } }) {
  const pct = sector.returnPct ?? 0;
  const absPct = Math.abs(pct);
  const maxBarWidth = 280;
  const barWidth = Math.min(maxBarWidth, Math.max(4, absPct * 20));
  const isUp = pct >= 0;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "var(--sl-space-3)" }}>
      <span style={{ fontSize: 12, fontWeight: 500, minWidth: 140, color: "var(--sl-ink)" }}>
        {sector.sector}
      </span>
      <div style={{ flex: 1, height: 8, background: "var(--sl-surface-alt)", borderRadius: "var(--sl-radius-pill)", overflow: "hidden", position: "relative" }}>
        <div
          style={{
            width: sector.returnPct !== null ? `${barWidth}px` : 0,
            height: "100%",
            borderRadius: "var(--sl-radius-pill)",
            background: sector.returnPct !== null
              ? isUp ? "var(--sl-up)" : "var(--sl-down)"
              : "var(--sl-faint)",
            transition: "width var(--sl-motion-base)",
          }}
        />
      </div>
      <span className="sl-mono" style={{ fontSize: 12, fontWeight: 600, minWidth: 56, textAlign: "right", color: sector.returnPct !== null ? (isUp ? "var(--sl-up)" : "var(--sl-down)") : "var(--sl-muted)" }}>
        {sector.returnPct !== null ? `${isUp ? "+" : ""}${pct.toFixed(2)}%` : "\u2014"}
      </span>
      <span className="sl-caption" style={{ minWidth: 28, textAlign: "right" }}>
        n={sector.count}
      </span>
    </div>
  );
}

function MoverRow({ mover }: { mover: { symbol: string; name: string; px: number | null; pct: number | null } }) {
  const isUp = mover.pct !== null && mover.pct >= 0;
  const pctColor = mover.pct === null ? "var(--sl-muted)" : isUp ? "var(--sl-up)" : "var(--sl-down)";

  return (
    <>
      <style>{`.mover-row:hover{background-color:var(--sl-surface-hover)}`}</style>
      <a
        href={`/stock/${mover.symbol}`}
        className="mover-row"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--sl-space-3)",
          padding: "var(--sl-space-2) var(--sl-space-3)",
          borderRadius: "var(--sl-radius-sm)",
          textDecoration: "none",
          color: "inherit",
          transition: "background var(--sl-motion-fast)",
        }}
      >
      <span className="sl-mono" style={{ fontSize: 13, fontWeight: 700, minWidth: 72 }}>{mover.symbol}</span>
      <span style={{ fontSize: 12, color: "var(--sl-ink-sub)", flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{mover.name}</span>
      <span className="sl-mono" style={{ fontSize: 13, fontWeight: 600, minWidth: 80, textAlign: "right" }}>{mover.px !== null ? formatPx(mover.px) : "\u2014"}</span>
      <span className="sl-mono" style={{ fontSize: 12, fontWeight: 600, minWidth: 64, textAlign: "right", color: pctColor }}>
        {mover.pct !== null ? `${isUp ? "+" : ""}${mover.pct.toFixed(2)}%` : "\u2014"}
      </span>
    </a>
    </>
  );
}

function GaugeCard({ gauge }: { gauge: { code: string; label: string; value: number | null; band: string | null } }) {
  const val = gauge.value ?? 0;
  const clamped = Math.min(100, Math.max(0, val));

  let levelColor = "var(--sl-muted)";
  if (clamped >= 75) levelColor = "var(--sl-up)";
  else if (clamped >= 55) levelColor = "var(--sl-info)";
  else if (clamped <= 25) levelColor = "var(--sl-down)";
  else if (clamped <= 45) levelColor = "var(--sl-warn)";

  return (
    <div
      style={{
        padding: "var(--sl-space-4)",
        borderRadius: "var(--sl-radius-md)",
        background: "var(--sl-surface-alt)",
        border: "1px solid var(--sl-hairline)",
      }}
    >
      <div style={{ fontSize: 11, fontWeight: 600, color: "var(--sl-muted)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "var(--sl-space-2)" }}>
        {gauge.label}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: "var(--sl-space-2)" }}>
        <span className="sl-mono" style={{ fontSize: 26, fontWeight: 800, color: levelColor, letterSpacing: "-0.03em" }}>
          {gauge.value !== null ? val.toFixed(0) : "\u2014"}
        </span>
        <span className="sl-caption" style={{ color: levelColor }}>
          {gauge.band ?? "\u2014"}
        </span>
      </div>
      {/* Mini progress bar */}
      <div style={{ marginTop: "var(--sl-space-2)", height: 4, background: "var(--sl-line)", borderRadius: "var(--sl-radius-pill)", overflow: "hidden" }}>
        <div
          style={{
            width: `${clamped}%`,
            height: "100%",
            borderRadius: "var(--sl-radius-pill)",
            background: levelColor,
            transition: "width var(--sl-motion-base)",
          }}
        />
      </div>
    </div>
  );
}

/** Fixed sentiment slot card with availability indicator (9 slots always rendered). */
function GaugeSlotCard({ slot }: { slot: import("@/app/_lib/analysis/analysis-data").SentimentSlot }) {
  const val = slot.value ?? 0;
  const clamped = Math.min(100, Math.max(0, val));

  let levelColor = "var(--sl-muted)";
  if (slot.available) {
    if (clamped >= 75) levelColor = "var(--sl-up)";
    else if (clamped >= 55) levelColor = "var(--sl-info)";
    else if (clamped <= 25) levelColor = "var(--sl-down)";
    else if (clamped <= 45) levelColor = "var(--sl-warn)";
  }

  return (
    <div
      style={{
        padding: "var(--sl-space-4)",
        borderRadius: "var(--sl-radius-md)",
        background: slot.available ? "var(--sl-surface-alt)" : "var(--sl-bg)",
        border: `1px solid ${slot.available ? "var(--sl-hairline)" : "var(--sl-line)"}`,
        opacity: slot.available ? 1 : 0.55,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--sl-space-2)" }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "var(--sl-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
          {slot.label}
        </div>
        {!slot.available && (
          <span style={{ fontSize: 10, fontWeight: 600, padding: "1px 6px", borderRadius: "var(--sl-radius-sm)", background: "var(--sl-surface-alt)", color: "var(--sl-faint)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Unavailable
          </span>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: "var(--sl-space-2)" }}>
        <span className="sl-mono" style={{ fontSize: 26, fontWeight: 800, color: levelColor, letterSpacing: "-0.03em" }}>
          {slot.value !== null ? val.toFixed(0) : "\u2014"}
        </span>
        <span className="sl-caption" style={{ color: slot.available ? levelColor : "var(--sl-faint)" }}>
          {slot.band ?? (slot.available ? "\u2014" : "No data")}
        </span>
      </div>
      {/* Mini progress bar */}
      <div style={{ marginTop: "var(--sl-space-2)", height: 4, background: "var(--sl-line)", borderRadius: "var(--sl-radius-pill)", overflow: "hidden" }}>
        <div
          style={{
            width: slot.available ? `${clamped}%` : 0,
            height: "100%",
            borderRadius: "var(--sl-radius-pill)",
            background: levelColor,
            transition: "width var(--sl-motion-base)",
          }}
        />
      </div>
    </div>
  );
}

function StatBox({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  return (
    <div
      style={{
        padding: "var(--sl-space-4)",
        borderRadius: "var(--sl-radius-md)",
        background: "var(--sl-surface-alt)",
        border: "1px solid var(--sl-hairline)",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 11, fontWeight: 600, color: "var(--sl-muted)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "var(--sl-space-2)" }}>
        {label}
      </div>
      <div className="sl-mono" style={{ fontSize: 28, fontWeight: 800, color, letterSpacing: "-0.03em" }}>
        {value}
      </div>
      <div className="sl-caption" style={{ marginTop: "var(--sl-space-1)" }}>{sub}</div>
    </div>
  );
}

function SignalBadge({ signal }: { signal: string }) {
  const config: Record<string, { label: string; bg: string; color: string }> = {
    strong_buy: { label: "Strong Buy", bg: "var(--sl-up-soft)", color: "var(--sl-up)" },
    buy: { label: "Buy", bg: "var(--sl-info-soft)", color: "var(--sl-info)" },
    neutral: { label: "Neutral", bg: "var(--sl-surface-alt)", color: "var(--sl-muted)" },
    sell: { label: "Sell", bg: "var(--sl-warn-soft)", color: "var(--sl-warn)" },
    strong_sell: { label: "Strong Sell", bg: "var(--sl-down-soft)", color: "var(--sl-down)" },
  };
  const c = config[signal] ?? config.neutral;

  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 600,
        padding: "2px 8px",
        borderRadius: "var(--sl-radius-sm)",
        background: c.bg,
        color: c.color,
        whiteSpace: "nowrap",
      }}
    >
      {c.label}
    </span>
  );
}

function SignalPct({ pct }: { pct: number | null }) {
  if (pct === null) return <span style={{ color: "var(--sl-muted)" }}>\u2014</span>;
  const isUp = pct >= 0;
  return (
    <span style={{ color: isUp ? "var(--sl-up)" : "var(--sl-down)" }}>
      {isUp ? "+" : ""}{pct.toFixed(2)}%
    </span>
  );
}

// ── Formatting helpers ───────────────────────────────────────────────────

function formatIndexVal(value: number): string {
  if (value >= 10_000) return value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return value.toFixed(2);
}

function formatPx(px: number): string {
  if (px >= 100_000) return px.toLocaleString("en-US", { maximumFractionDigits: 0 });
  if (px >= 1_000) return px.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  return px.toFixed(2);
}
