import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

function createOrderLimitQuery(data: unknown[]) {
  return {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnValue({ data, error: null }),
  };
}

const reportRows = [
  { id: "r1", src: "Fed", category: "macro", title: "Inflation Outlook", pdf_url: "https://example.com/r1.pdf", markdown: "# Inflation", summary: "Rates and CPI", tickers: ["SPY"], tags: ["rates", "cpi"], published_at: "2026-05-07T00:00:00Z" },
  { id: "r2", src: "IB", category: "single-stock", title: "Apple Supply Chain", pdf_url: "https://example.com/r2.pdf", markdown: null, summary: null, tickers: ["AAPL"], tags: ["hardware"], published_at: "2026-05-06T00:00:00Z" },
  { id: "r3", src: "IB", category: "single-stock", title: "Apple Valuation", pdf_url: null, markdown: "body", summary: "AAPL rerating", tickers: ["AAPL"], tags: ["hardware", "valuation"], published_at: "2026-05-05T00:00:00Z" },
];

describe("reports pure helpers", () => {
  it("filters reports by query, category, ticker, and tag", async () => {
    const { applyReportFilters } = await import("@/app/_lib/reports/reports-data");
    const { buildReportsData } = await import("@/app/_lib/reports/reports-data");
    const data = buildReportsData(reportRows, [], {}, "r1");

    expect(applyReportFilters(data.reports, { query: "apple", ticker: "AAPL", tag: "hardware" }).map((report) => report.id)).toEqual(["r2", "r3"]);
    expect(applyReportFilters(data.reports, { category: "macro" }).map((report) => report.id)).toEqual(["r1"]);
  });

  it("ranks global report search results separately from page-local filters", async () => {
    const { rankReportSearchResults } = await import("@/app/_lib/reports/reports-data");

    expect(rankReportSearchResults(reportRows, "AAPL").map((report) => [report.id, report.href, report.matchType])).toEqual([
      ["r2", "/reports/r2", "ticker"],
      ["r3", "/reports/r3", "ticker"],
    ]);
  });

  it("selects recommended hero, latest reports, detail tables, facets, and related reports", async () => {
    const { buildReportsData, getLatestReports, selectRecommendedHero } = await import("@/app/_lib/reports/reports-data");
    const tableRows = [{ report_id: "r1", idx: 1, table_json: { rows: [["CPI", "3%"]] } }];
    const data = buildReportsData(reportRows, tableRows, { ticker: "AAPL" }, "r1");

    expect(selectRecommendedHero(data.reports)?.id).toBe("r1");
    expect(getLatestReports(data.reports, 2).map((report) => report.id)).toEqual(["r1", "r2"]);
    expect(data.filteredReports.map((report) => report.id)).toEqual(["r2", "r3"]);
    expect(data.detail?.pdfUrl).toBe("https://example.com/r1.pdf");
    expect(data.detail?.markdown).toBe("# Inflation");
    expect(data.detail?.tables).toHaveLength(1);
    expect(data.tags).toEqual(["cpi", "hardware", "rates", "valuation"]);
    expect(data.bookmarkState.enabled).toBe(false);
  });
});

describe("fetchReportsData", () => {
  it("returns deterministic empty fallback", async () => {
    const from = vi.fn().mockReturnValueOnce(createOrderLimitQuery([])).mockReturnValueOnce(createOrderLimitQuery([]));

    vi.resetModules();
    vi.doMock("@/app/_lib/supabase/public", () => ({ createRlsSupabaseClient: () => ({ from }) }));

    const { fetchReportsData } = await import("@/app/_lib/reports/reports-data");
    const data = await fetchReportsData();

    expect(data.reports).toEqual([]);
    expect(data.recommendedHero).toBeNull();
    expect(data.detail).toBeNull();
    expect(data.bookmarkState).toEqual({ enabled: false, isBookmarked: false, reason: "auth-required" });
  });

  it("fetches reports and report tables with original pdf URLs", async () => {
    const from = vi.fn().mockReturnValueOnce(createOrderLimitQuery(reportRows)).mockReturnValueOnce(createOrderLimitQuery([{ report_id: "r1", idx: 0, table_json: { rows: [] } }]));

    vi.resetModules();
    vi.doMock("@/app/_lib/supabase/public", () => ({ createRlsSupabaseClient: () => ({ from }) }));

    const { fetchReportsData } = await import("@/app/_lib/reports/reports-data");
    const data = await fetchReportsData({ query: "inflation" }, "r1");

    expect(from).toHaveBeenCalledWith("reports");
    expect(from).toHaveBeenCalledWith("reports_tables");
    expect(data.detail?.pdfUrl).toBe("https://example.com/r1.pdf");
    expect(data.filteredReports.map((report) => report.id)).toEqual(["r1"]);
  });

  it("loads direct report details outside the latest reports window", async () => {
    const olderReport = {
      id: "older",
      src: "IB",
      category: "single-stock",
      title: "Older Report",
      pdf_url: null,
      markdown: "# Older",
      summary: "Older AAPL coverage",
      tickers: ["AAPL"],
      tags: ["archive"],
      published_at: "2025-01-01T00:00:00Z",
    };
    const detailQuery = createOrderLimitQuery([olderReport]);
    const from = vi
      .fn()
      .mockReturnValueOnce(createOrderLimitQuery([reportRows[0]]))
      .mockReturnValueOnce(createOrderLimitQuery([{ report_id: "older", idx: 0, table_json: { rows: [["AAPL"]] } }]))
      .mockReturnValueOnce(detailQuery);

    vi.resetModules();
    vi.doMock("@/app/_lib/supabase/public", () => ({ createRlsSupabaseClient: () => ({ from }) }));

    const { fetchReportsData } = await import("@/app/_lib/reports/reports-data");
    const data = await fetchReportsData({}, "older");

    expect(data.detail?.id).toBe("older");
    expect(data.detail?.markdown).toBe("# Older");
    expect(data.detail?.tables).toHaveLength(1);
    expect(detailQuery.eq).toHaveBeenCalledWith("id", "older");
  });

  it("searches reports through the RLS Supabase client", async () => {
    const createSearchQuery = (data: unknown[]) => ({
      select: vi.fn().mockReturnThis(),
      ilike: vi.fn().mockReturnThis(),
      contains: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnValue({ data, error: null }),
    });
    const from = vi
      .fn()
      .mockReturnValueOnce(createSearchQuery([reportRows[1]]))
      .mockReturnValueOnce(createSearchQuery([]))
      .mockReturnValueOnce(createSearchQuery([]))
      .mockReturnValueOnce(createSearchQuery([reportRows[2]]))
      .mockReturnValueOnce(createSearchQuery([]));

    vi.resetModules();
    vi.doMock("@/app/_lib/supabase/public", () => ({ createRlsSupabaseClient: () => ({ from }) }));

    const { searchReports } = await import("@/app/_lib/reports/reports-data");
    const results = await searchReports("AAPL", 20);

    expect(results.map((report) => [report.id, report.matchType])).toEqual([
      ["r2", "ticker"],
      ["r3", "ticker"],
    ]);
    expect(from).toHaveBeenCalledWith("reports");
  });
});
