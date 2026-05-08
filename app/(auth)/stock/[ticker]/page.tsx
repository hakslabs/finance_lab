import Link from "next/link";
import { redirect } from "next/navigation";

import { MobileBottomTabBar } from "@/app/_components/mobile/bottom-tab-bar";
import { readTemporaryAuthCookie } from "@/app/_lib/auth/cookies";
import { GlobalHeader } from "@/app/_lib/home/global-header";
import {
  fetchStockDetailData,
  STOCK_DETAIL_TABS,
  type StockDetailTabId,
} from "@/app/_lib/stock/stock-detail-data";
import { RightRail } from "./_tabs/right-rail";
import { StockHeader } from "./_tabs/stock-header";
import { ChartTab } from "./_tabs/tab-chart";
import { FilingsTab } from "./_tabs/tab-filings";
import { FinancialsTab } from "./_tabs/tab-financials";
import { FlowTab } from "./_tabs/tab-flow";
import { TabNav } from "./_tabs/tab-nav";
import { NewsTab } from "./_tabs/tab-news";
import { OverviewTab } from "./_tabs/tab-overview";
import { TargetPriceTab } from "./_tabs/tab-target";
import { ValuationTab } from "./_tabs/tab-valuation";

type PageProps = {
  params: Promise<{ ticker: string }>;
  searchParams?: Promise<{ tab?: string }>;
};

export const metadata = {
  title: "STOCKLAB — Stock Detail",
  description:
    "Detailed stock analysis with price, financials, valuation, filings, news, and more.",
};

/**
 * Stock detail page — server-rendered with 8 tabs.
 *
 * Protected by the temporary M0 auth session.
 * All data reads from Supabase cache tables; no external API calls on render.
 */
export default async function StockDetailPage({ params, searchParams }: PageProps) {
  const { ticker } = await params;
  const query = (await searchParams) ?? {};

  // Auth guard
  const session = await readTemporaryAuthCookie();
  if (!session) {
    redirect("/login");
  }

  // Normalize ticker
  const normalizedTicker = ticker.trim().toUpperCase();

  // Fetch all data in parallel
  const data = await fetchStockDetailData(normalizedTicker);

  const activeTab: StockDetailTabId = STOCK_DETAIL_TABS.includes(query.tab as StockDetailTabId)
    ? (query.tab as StockDetailTabId)
    : "overview";

  return (
    <div style={{ minHeight: "100vh", background: "var(--sl-bg)" }}>
      {/* Global header */}
      <GlobalHeader userName={session?.role ?? undefined} />

      {/* Main content */}
      <main
        className="sl-mobile-pb-tabbar"
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "var(--sl-space-5) var(--sl-space-6)",
        }}
      >
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" style={{ marginBottom: "var(--sl-space-4)" }}>
          <Link
            href="/"
            className="sl-caption"
            style={{ color: "var(--sl-muted)", textDecoration: "none" }}
          >
            Home
          </Link>
          <span
            className="sl-caption"
            style={{ margin: "0 var(--sl-space-2)", color: "var(--sl-faint)" }}
          >
            /
          </span>
          <span
            className="sl-mono sl-caption"
            style={{ fontWeight: 600, color: "var(--sl-ink)" }}
          >
            {normalizedTicker}
          </span>
        </nav>

        {/* Stock header */}
        <StockHeader
          profile={data.profile}
          quote={data.quote}
          dailyQuote={data.dailyQuote}
        />

        {/* Tab navigation + content layout */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 280px",
            gap: "var(--sl-space-6)",
            marginTop: "var(--sl-space-5)",
            alignItems: "start",
          }}
        >
          {/* Left column: tabs */}
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--sl-space-5)", minWidth: 0 }}>
            <TabNav activeTab={activeTab} ticker={normalizedTicker} />

            {/* Render all 8 tab panels (server-rendered shell) */}
            {STOCK_DETAIL_TABS.map((tabId) => (
              <section
                key={tabId}
                id={tabId}
                role="tabpanel"
                aria-label={`${tabId.charAt(0).toUpperCase() + tabId.slice(1)} tab`}
                style={{ display: tabId === activeTab ? "block" : "none" }}
              >
                {renderTabPanel(tabId, data)}
              </section>
            ))}
          </div>

          {/* Right rail */}
          <RightRail similarStocks={data.similarStocks} />
        </div>

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
            STOCKLAB M2 &middot; Stock Detail
          </span>
        </footer>
      </main>

      <MobileBottomTabBar activeHref="/" />
    </div>
  );
}

/** Render the correct server tab panel without type-erasing props. */
function renderTabPanel(tabId: StockDetailTabId, data: Awaited<ReturnType<typeof fetchStockDetailData>>) {
  switch (tabId) {
    case "overview":
      return <OverviewTab data={data} />;
    case "chart":
      return <ChartTab />;
    case "financials":
      return <FinancialsTab financials={data.financials} />;
    case "valuation":
      return <ValuationTab />;
    case "filings":
      return <FilingsTab />;
    case "news":
      return <NewsTab news={data.news} />;
    case "flow":
      return <FlowTab />;
    case "target":
      return <TargetPriceTab />;
  }
}
