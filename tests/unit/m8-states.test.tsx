/**
 * Vitest unit tests for M8 shared state components and refresh-status
 * helper. Renders each variant via React DOM and asserts data-testid
 * markers / data-status attributes are present.
 */

import React from "react";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

void React;

import {
  EmptyPortfolio,
  EmptyWatchlist,
  ErrorApiQuota,
  ErrorNetwork,
  ErrorRefreshFailed,
  ErrorTickerNotFound,
  RefreshTimestamp,
} from "@/app/_components/states/states";
import { classifyRefreshStatus } from "@/app/_components/states/refresh-status";

describe("classifyRefreshStatus", () => {
  it("returns failed-retry when last attempt failed", () => {
    expect(
      classifyRefreshStatus({
        lastRefreshIso: "2026-05-07T12:00:00Z",
        nowIso: "2026-05-07T12:00:30Z",
        freshnessSeconds: 60,
        lastAttemptFailed: true,
      }),
    ).toBe("failed-retry");
  });

  it("returns delayed when no last refresh recorded", () => {
    expect(
      classifyRefreshStatus({
        lastRefreshIso: null,
        nowIso: "2026-05-07T12:00:00Z",
        freshnessSeconds: 60,
        lastAttemptFailed: false,
      }),
    ).toBe("delayed");
  });

  it("returns normal when within freshness window", () => {
    expect(
      classifyRefreshStatus({
        lastRefreshIso: "2026-05-07T12:00:00Z",
        nowIso: "2026-05-07T12:00:30Z",
        freshnessSeconds: 60,
        lastAttemptFailed: false,
      }),
    ).toBe("normal");
  });

  it("returns delayed when older than freshness window", () => {
    expect(
      classifyRefreshStatus({
        lastRefreshIso: "2026-05-07T11:00:00Z",
        nowIso: "2026-05-07T12:00:00Z",
        freshnessSeconds: 60,
        lastAttemptFailed: false,
      }),
    ).toBe("delayed");
  });
});

describe("EmptyWatchlist", () => {
  it("renders the empty watchlist test id", () => {
    const html = renderToStaticMarkup(<EmptyWatchlist recommendations={[]} />);
    expect(html).toContain("state-empty-watchlist");
    expect(html).toContain("Your watchlist is empty");
  });

  it("renders up to seven recommendation chips", () => {
    const recs = Array.from({ length: 10 }, (_, i) => ({
      symbol: `T${i}`,
      name: `Ticker ${i}`,
    }));
    const html = renderToStaticMarkup(<EmptyWatchlist recommendations={recs} />);
    const matches = html.match(/href="\/stock\/T\d+"/g) ?? [];
    expect(matches.length).toBe(7);
  });
});

describe("EmptyPortfolio", () => {
  it("renders the empty portfolio test id and CTA buttons", () => {
    const html = renderToStaticMarkup(<EmptyPortfolio recentTickers={["AAPL", "MSFT"]} />);
    expect(html).toContain("state-empty-portfolio");
    expect(html).toContain("Add Transaction");
    expect(html).toContain("Import CSV");
    expect(html).toContain("AAPL");
    expect(html).toContain("MSFT");
  });
});

describe("ErrorRefreshFailed", () => {
  it("renders failed-retry status pill via the refresh timestamp", () => {
    const html = renderToStaticMarkup(
      <ErrorRefreshFailed
        lastRefreshIso="2026-05-07T11:30:00Z"
        retryHref="/?retry=1"
      />,
    );
    expect(html).toContain("state-error-refresh-failed");
    expect(html).toContain('data-status="failed-retry"');
    expect(html).toContain('href="/?retry=1"');
  });
});

describe("ErrorApiQuota", () => {
  it("renders the quota state with fallback label and next refresh", () => {
    const html = renderToStaticMarkup(
      <ErrorApiQuota
        nextRefreshIso="2026-05-08T00:00:00Z"
        fallbackLabel="yesterday's close"
      />,
    );
    expect(html).toContain("state-error-api-quota");
    expect(html).toContain("yesterday&#x27;s close");
  });
});

describe("ErrorNetwork", () => {
  it("renders network error with retry link", () => {
    const html = renderToStaticMarkup(<ErrorNetwork retryHref="/me" />);
    expect(html).toContain("state-error-network");
    expect(html).toContain('href="/me"');
  });
});

describe("ErrorTickerNotFound", () => {
  it("includes the query in the title and renders example chips", () => {
    const html = renderToStaticMarkup(
      <ErrorTickerNotFound query="ABCXYZ" examples={["AAPL", "005930"]} />,
    );
    expect(html).toContain("state-error-ticker-not-found");
    expect(html).toContain("ABCXYZ");
    expect(html).toContain('href="/stock/AAPL"');
    expect(html).toContain('href="/stock/005930"');
  });
});

describe("RefreshTimestamp", () => {
  it("emits data-status normal when fresh", () => {
    const html = renderToStaticMarkup(
      <RefreshTimestamp
        lastRefreshIso="2026-05-07T12:00:00Z"
        nowIso="2026-05-07T12:00:30Z"
        freshnessSeconds={60}
      />,
    );
    expect(html).toContain('data-status="normal"');
    expect(html).toContain("Live");
  });

  it("emits data-status delayed when stale", () => {
    const html = renderToStaticMarkup(
      <RefreshTimestamp
        lastRefreshIso="2026-05-07T11:00:00Z"
        nowIso="2026-05-07T12:00:00Z"
        freshnessSeconds={60}
      />,
    );
    expect(html).toContain('data-status="delayed"');
    expect(html).toContain("Delayed");
  });

  it("emits data-status failed-retry when overridden", () => {
    const html = renderToStaticMarkup(
      <RefreshTimestamp lastRefreshIso={null} status="failed-retry" />,
    );
    expect(html).toContain('data-status="failed-retry"');
    expect(html).toContain("Refresh failed");
  });
});
