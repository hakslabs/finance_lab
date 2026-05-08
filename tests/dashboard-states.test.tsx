import React from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

// ── Data module tests ────────────────────────────────────────────────────

describe("dashboard-states data", () => {
  it("exports exactly seven suggested tickers", async () => {
    const { SUGGESTED_TICKERS } = await import("@/app/_lib/home/dashboard-states");
    expect(SUGGESTED_TICKERS).toHaveLength(7);
  });

  it("suggested tickers have US and KR symbols with required fields", async () => {
    const { SUGGESTED_TICKERS } = await import("@/app/_lib/home/dashboard-states");
    const symbols = SUGGESTED_TICKERS.map((t) => t.symbol);
    const exchanges = new Set(SUGGESTED_TICKERS.map((t) => t.exchange));

    // US tickers
    expect(symbols).toContain("AAPL");
    expect(symbols).toContain("MSFT");
    expect(symbols).toContain("NVDA");

    // KR tickers
    expect(symbols).toContain("005930"); // Samsung
    expect(symbols).toContain("000660"); // SK Hynix
    expect(symbols).toContain("377300"); // NAVER KOSDAQ
    expect(symbols).toContain("035420"); // NAVER KOSPI

    // Exchange coverage
    expect(exchanges.has("Nasdaq")).toBe(true);
    expect(exchanges.has("KOSPI")).toBe(true);
    expect(exchanges.has("KOSDAQ")).toBe(true);

    // Every ticker has symbol, name, exchange
    for (const t of SUGGESTED_TICKERS) {
      expect(t.symbol).toBeTruthy();
      expect(t.name).toBeTruthy();
      expect(["NYSE", "Nasdaq", "KOSPI", "KOSDAQ"]).toContain(t.exchange);
    }
  });

  it("DASHBOARD_STATE_FIXTURES covers all five state kinds", async () => {
    const { DASHBOARD_STATE_FIXTURES } = await import("@/app/_lib/home/dashboard-states");
    const kinds = Object.keys(DASHBOARD_STATE_FIXTURES);

    expect(kinds).toEqual(
      expect.arrayContaining(["loading", "stale", "empty_watchlist", "widget_empty", "widget_error"]),
    );
    expect(kinds).toHaveLength(5);
  });

  it("stale fixture has cachedAt and ageLabel", async () => {
    const { STALE_BADGE_FIXTURE } = await import("@/app/_lib/home/dashboard-states");
    expect(STALE_BADGE_FIXTURE.cachedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(STALE_BADGE_FIXTURE.ageLabel).toBeTruthy();
  });

  it("error fixture is retryable with a message", async () => {
    const { WIDGET_ERROR_FIXTURE } = await import("@/app/_lib/home/dashboard-states");
    expect(WIDGET_ERROR_FIXTURE.retryable).toBe(true);
    expect(WIDGET_ERROR_FIXTURE.message).toBeTruthy();
    expect(WIDGET_ERROR_FIXTURE.widgetId).toBeTruthy();
  });
});

// ── Component rendering tests (server-side static markup) ───────────────

describe("DashboardStateCard components render to static markup", () => {
  async function render(component: React.ReactElement): Promise<string> {
    return renderToString(component);
  }

  describe("EmptyWatchlistCard", () => {
    it("renders all seven suggested ticker symbols", async () => {
      const { EmptyWatchlistCard } = await import(
        "@/app/_lib/home/dashboard-state-card"
      );
      const { SUGGESTED_TICKERS } = await import(
        "@/app/_lib/home/dashboard-states"
      );
      const html = await render(<EmptyWatchlistCard />);

      for (const ticker of SUGGESTED_TICKERS) {
        expect(html).toContain(ticker.symbol);
      }
    });

    it("includes watchlist empty heading and description text", async () => {
      const { EmptyWatchlistCard } = await import("@/app/_lib/home/dashboard-state-card");
      const html = await render(<EmptyWatchlistCard />);

      expect(html).toContain("Your watchlist is empty");
      expect(html).toContain("Add stocks to track them here");
      expect(html).toContain("Suggested tickers");
    });

    it("uses sl-card class for the card shell", async () => {
      const { EmptyWatchlistCard } = await import("@/app/_lib/home/dashboard-state-card");
      const html = await render(<EmptyWatchlistCard />);

      expect(html).toContain('class="sl-card"');
    });

    it("has accessible aria-label on the section", async () => {
      const { EmptyWatchlistCard } = await import("@/app/_lib/home/dashboard-state-card");
      const html = await render(<EmptyWatchlistCard />);

      expect(html).toContain('aria-label="Empty watchlist"');
    });
  });

  describe("StaleBadge", () => {
    it("communicates cached data with warning styling", async () => {
      const { StaleBadge } = await import("@/app/_lib/home/dashboard-state-card");
      const html = await render(
        <StaleBadge cachedAt="2026-05-07T06:30:00Z" ageLabel="2h ago" />,
      );

      expect(html).toContain("Cached");
      expect(html).toContain("2h ago");
      expect(html).toContain("2026-05-07T06:30:00Z");
      expect(html).toContain("sl-tag-warn");
    });

    it("includes a <time> element with the ISO timestamp", async () => {
      const { StaleBadge } = await import("@/app/_lib/home/dashboard-state-card");
      const html = await render(
        <StaleBadge cachedAt="2026-05-07T04:00:00Z" ageLabel="3h ago" />,
      );

      expect(html).toContain('<time dateTime="2026-05-07T04:00:00Z"');
    });
  });

  describe("LoadingSkeleton", () => {
    it("renders a loading card with shimmer elements", async () => {
      const { LoadingSkeleton } = await import("@/app/_lib/home/dashboard-state-card");
      const html = await render(<LoadingSkeleton widgetId="test-widget" />);

      expect(html).toContain('aria-label="test-widget loading"');
      expect(html).toContain("sl-shimmer");
      expect(html).toContain('class="sl-card"');
    });
  });

  describe("WidgetEmptyCard", () => {
    it("renders title and description from props", async () => {
      const { WidgetEmptyCard } = await import("@/app/_lib/home/dashboard-state-card");
      const html = await render(
        <WidgetEmptyCard
          widgetId="sentiment"
          title="No sentiment data yet"
          description="Market sentiment will appear after the next cron refresh."
        />,
      );

      expect(html).toContain("No sentiment data yet");
      expect(html).toContain("Market sentiment will appear after the next cron refresh.");
      expect(html).toContain('aria-label="sentiment empty"');
    });
  });

  describe("WidgetErrorCard", () => {
    it("shows error message and retry/help text when retryable", async () => {
      const { WidgetErrorCard } = await import("@/app/_lib/home/dashboard-state-card");
      const html = await render(
        <WidgetErrorCard
          widgetId="indices"
          message="Unable to load index data."
          retryable={true}
        />,
      );

      expect(html).toContain("Unable to load index data.");
      expect(html).toContain("Retry");
      expect(html).toContain("retry");
      expect(html).toContain("check back shortly");
      expect(html).toContain('aria-label="indices error"');
    });

    it("shows help text instead of retry when not retryable", async () => {
      const { WidgetErrorCard } = await import("@/app/_lib/home/dashboard-state-card");
      const html = await render(
        <WidgetErrorCard
          widgetId="news"
          message="News feed unavailable."
          retryable={false}
        />,
      );

      expect(html).toContain("News feed unavailable.");
      expect(html).not.toContain("Retry");
      expect(html).toContain("contact support");
    });
  });

  describe("DashboardStateCard dispatcher", () => {
    it("dispatches loading to LoadingSkeleton", async () => {
      const { DashboardStateCard } = await import("@/app/_lib/home/dashboard-state-card");
      const html = await render(DashboardStateCard({ kind: "loading" }));

      expect(html).toContain("sl-shimmer");
      expect(html).toContain('class="sl-card"');
    });

    it("dispatches stale to StaleBadge inside card shell", async () => {
      const { DashboardStateCard } = await import("@/app/_lib/home/dashboard-state-card");
      const html = await render(
        DashboardStateCard({
          kind: "stale",
          stale: { cachedAt: "2026-05-07T01:00:00Z", ageLabel: "5h ago" },
        }),
      );

      expect(html).toContain("Cached");
      expect(html).toContain("5h ago");
      expect(html).toContain("opacity:0.5");
    });

    it("dispatches empty_watchlist to EmptyWatchlistCard", async () => {
      const { DashboardStateCard } = await import("@/app/_lib/home/dashboard-state-card");
      const html = await render(DashboardStateCard({ kind: "empty_watchlist" }));

      expect(html).toContain("Your watchlist is empty");
    });

    it("dispatches widget_empty to WidgetEmptyCard", async () => {
      const { DashboardStateCard } = await import("@/app/_lib/home/dashboard-state-card");
      const html = await render(
        DashboardStateCard({
          kind: "widget_empty",
          empty: { widgetId: "x", title: "Empty", description: "Nothing here." },
        }),
      );

      expect(html).toContain("Empty");
      expect(html).toContain("Nothing here.");
    });

    it("dispatches widget_error to WidgetErrorCard", async () => {
      const { DashboardStateCard } = await import("@/app/_lib/home/dashboard-state-card");
      const html = await render(
        DashboardStateCard({
          kind: "widget_error",
          error: { widgetId: "y", message: "Boom", retryable: true },
        }),
      );

      expect(html).toContain("Boom");
      expect(html).toContain("Retry");
    });
  });
});

// ── Security / injection tests ──────────────────────────────────────────

describe("No raw HTML injection path in dashboard states", () => {
  async function render(component: React.ReactElement): Promise<string> {
    return renderToString(component);
  }

  it("escapes HTML in error message text", async () => {
    const { WidgetErrorCard } = await import("@/app/_lib/home/dashboard-state-card");
    const html = await render(
      <WidgetErrorCard
        widgetId="xss-test"
        message="<script>alert(1)</script>"
        retryable={false}
      />,
    );

    // React's renderToString auto-escapes; verify no raw script tag
    expect(html).not.toContain("<script>alert(1)</script>");
    expect(html).toContain("&lt;script&gt;");
  });

  it("escapes HTML in empty state title and description", async () => {
    const { WidgetEmptyCard } = await import("@/app/_lib/home/dashboard-state-card");
    const html = await render(
      <WidgetEmptyCard
        widgetId="inject"
        title="<img onerror=alert(1) src=x>Bad"
        description="<a href=evil>Click</a>"
      />,
    );

    expect(html).not.toContain("<img onerror");
    expect(html).not.toContain("<a href=evil");
  });

  it("does not use dangerouslySetInnerHTML anywhere in output", async () => {
    const { DashboardStateCard } = await import(
      "@/app/_lib/home/dashboard-state-card"
    );
    // Import fixtures for the dispatcher test
    const { DASHBOARD_STATE_FIXTURES: fixtures } = await import(
      "@/app/_lib/home/dashboard-states"
    );

    for (const [_name, state] of Object.entries(fixtures)) {
      const html = await render(DashboardStateCard(state));
      expect(html).not.toContain("dangerouslySetInnerHTML");
    }
  });
});
