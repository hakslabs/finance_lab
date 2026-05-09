import Link from "next/link";
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

type Market = "all" | "us" | "kr";

const KR_INDEX_CODES = new Set(["KOSPI", "KOSDAQ", "KOSPI200"]);
const US_INDEX_CODES = new Set(["SP500", "NASDAQ", "DOW"]);

function parseMarket(value: string | string[] | undefined): Market {
  if (value === "us" || value === "kr") return value;
  return "all";
}

export default async function HomePage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await readTemporaryAuthCookie();
  const params = (await searchParams) ?? {};
  const market = parseMarket(params.market);

  // Fetch all dashboard data in parallel; widgets handle empty states gracefully
  const data = await fetchDashboardData();

  const filteredIndices =
    market === "us"
      ? data.indices.filter((i) => US_INDEX_CODES.has(i.code))
      : market === "kr"
        ? data.indices.filter((i) => KR_INDEX_CODES.has(i.code))
        : data.indices;

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

        {/* Market toggle */}
        <MarketToggle active={market} />

        {/* Row 2: Index strip (full width, filtered by market) */}
        <IndexStrip indices={filteredIndices} />

        {/* Row 3: Major stocks per market */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              market === "all"
                ? "repeat(auto-fit, minmax(340px, 1fr))"
                : "1fr",
            gap: "var(--sl-space-5)",
          }}
        >
          {market !== "kr" && (
            <MajorStocks stocks={data.usStocks} label="🇺🇸 US Major Stocks" region="us" />
          )}
          {market !== "us" && (
            <MajorStocks stocks={data.krStocks} label="🇰🇷 KR Major Stocks" region="kr" />
          )}
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

function MarketToggle({ active }: { readonly active: Market }) {
  const options: ReadonlyArray<{ readonly value: Market; readonly label: string; readonly href: string }> = [
    { value: "all", label: "전체", href: "/" },
    { value: "us", label: "🇺🇸 미국", href: "/?market=us" },
    { value: "kr", label: "🇰🇷 한국", href: "/?market=kr" },
  ];
  return (
    <nav
      aria-label="시장 필터"
      role="tablist"
      style={{
        display: "flex",
        gap: "var(--sl-space-2)",
        flexWrap: "wrap",
      }}
    >
      {options.map((opt) => {
        const isActive = active === opt.value;
        return (
          <Link
            key={opt.value}
            href={opt.href}
            role="tab"
            aria-selected={isActive}
            data-active={isActive ? "true" : undefined}
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "6px 14px",
              borderRadius: "var(--sl-radius-pill)",
              fontSize: 13,
              fontWeight: isActive ? 600 : 500,
              color: isActive ? "var(--sl-surface)" : "var(--sl-ink-sub)",
              background: isActive ? "var(--sl-ink)" : "var(--sl-surface-alt)",
              border: "1px solid",
              borderColor: isActive ? "var(--sl-ink)" : "var(--sl-line)",
              textDecoration: "none",
              transition: "all var(--sl-motion-fast)",
            }}
          >
            {opt.label}
          </Link>
        );
      })}
    </nav>
  );
}
