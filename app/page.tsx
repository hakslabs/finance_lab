import { redirect } from "next/navigation";

import { MobileBottomTabBar } from "@/app/_components/mobile/bottom-tab-bar";
import { clearTemporaryAuthCookie, readTemporaryAuthCookie } from "@/app/_lib/auth/cookies";

import {
  fetchDashboardData,
  GlobalHeader,
  GreetingHero,
  IndexStrip,
  MajorStocks,
  MarketSentiment,
  MiniMarketMap,
  ReturnVsMarket,
  TopNews,
  WatchlistQuickView,
  WeeklyCalendar,
} from "@/app/_lib/home";

export const metadata = {
  title: "STOCKLAB — Dashboard",
  description:
    "Your personalized market dashboard. Track indices, stocks, sentiment, news, and more.",
};

export default async function HomePage() {
  const session = await readTemporaryAuthCookie();

  // Fetch all dashboard data in parallel; widgets handle empty states gracefully
  const data = await fetchDashboardData();

  async function endTemporarySession() {
    "use server";

    await clearTemporaryAuthCookie();
    redirect("/login");
  }

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
          display: "flex",
          flexDirection: "column",
          gap: "var(--sl-space-5)",
        }}
      >
        {/* Row 1: Greeting hero + Logout */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--sl-space-4)",
          }}
        >
          <GreetingHero
            userName={session?.role === "admin" ? "Admin" : session?.role ?? undefined}
            lastUpdated={data.lastUpdated}
          />

          <form action={endTemporarySession} style={{ alignSelf: "flex-start" }}>
            <button type="submit" className="sl-btn sl-btn-secondary" style={{ fontSize: 12 }}>
              임시 세션 종료
            </button>
          </form>
        </div>

        {/* Row 2: Index strip (full width) */}
        <IndexStrip indices={data.indices} />

        {/* Row 3: US major stocks + KR major stocks (2-column) */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
            gap: "var(--sl-space-5)",
          }}
        >
          <MajorStocks stocks={data.usStocks} label="US Major Stocks" region="us" />
          <MajorStocks stocks={data.krStocks} label="KR Major Stocks" region="kr" />
        </div>

        {/* Row 4: Market sentiment + Watchlist quick view (2-column) */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
            gap: "var(--sl-space-5)",
          }}
        >
          <MarketSentiment readings={data.sentiment} />
          <WatchlistQuickView items={[]} />
        </div>

        {/* Row 5: Top news + Mini market map (2-column) */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
            gap: "var(--sl-space-5)",
          }}
        >
          <TopNews items={data.news} />
          <MiniMarketMap />
        </div>

        {/* Row 6: My return vs market (full width) */}
        <ReturnVsMarket />

        {/* Row 7: Weekly calendar (full width) */}
        <WeeklyCalendar events={data.calendar} />

        {/* Footer */}
        <footer
          style={{
            textAlign: "center",
            paddingTop: "var(--sl-space-4)",
            paddingBottom: "var(--sl-space-8)",
          }}
        >
          <span className="sl-caption">
            STOCKLAB M1 &middot; Home Dashboard
          </span>
        </footer>
      </main>

      <MobileBottomTabBar activeHref="/" />
    </div>
  );
}
