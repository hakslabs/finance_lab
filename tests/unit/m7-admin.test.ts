/**
 * Vitest unit tests for M7 admin helpers.
 *
 * Covers KPI aggregation, section list shaping, recent activity ordering,
 * masters/holdings join, and the role-guard utility. Server-only modules
 * are mocked so the helpers can be exercised in node env.
 */

import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  buildApiUsageList,
  buildCronLogList,
  buildKpis,
  buildLearnList,
  buildMastersList,
  buildNewsList,
  buildRecentEvents,
  buildSections,
  buildTermsList,
} from "@/app/_lib/admin/admin-data";
import { isAdminRole } from "@/app/_lib/admin/role-guard";
import { recordAdminAction } from "@/app/_lib/admin/audit-log";

const NOW_ISO = "2026-05-07T12:00:00Z";

const mockCronLogs = [
  {
    id: "c1",
    job: "quotes-us",
    started_at: "2026-05-07T11:30:00Z",
    finished_at: "2026-05-07T11:30:30Z",
    status: "ok" as const,
    err: null,
  },
  {
    id: "c2",
    job: "indices",
    started_at: "2026-05-06T10:00:00Z",
    finished_at: "2026-05-06T10:00:15Z",
    status: "failed" as const,
    err: "timeout",
  },
  {
    id: "c3",
    job: "sentiment",
    started_at: "2026-04-25T09:00:00Z",
    finished_at: "2026-04-25T09:00:10Z",
    status: "failed" as const,
    err: "older",
  },
  {
    id: "c4",
    job: "quotes-kr",
    started_at: "2026-05-05T08:00:00Z",
    finished_at: "2026-05-05T08:00:05Z",
    status: "ok" as const,
    err: null,
  },
];

const mockApiQuotas = [
  { provider: "finnhub", day: "2026-05-07", used: 350, limit: 500 },
  { provider: "krx", day: "2026-05-07", used: 80, limit: 200 },
  { provider: "finnhub", day: "2026-05-06", used: 250, limit: 500 },
];

const mockNews = [
  {
    id: "n1",
    src: "Reuters",
    title: "Headline 1",
    url: "https://example.com/1",
    summary: null,
    tickers: ["AAPL"],
    sentiment: 0.4,
    published_at: "2026-05-06T08:00:00Z",
  },
  {
    id: "n2",
    src: "Reuters",
    title: "Old headline",
    url: "https://example.com/2",
    summary: null,
    tickers: [],
    sentiment: null,
    published_at: "2026-04-25T08:00:00Z",
  },
];

describe("buildKpis", () => {
  it("counts cron failures within the 7d window only", () => {
    const kpis = buildKpis(mockCronLogs, mockApiQuotas, mockNews, NOW_ISO);
    const failures = kpis.find((k) => k.id === "cron-failures-7d");
    expect(failures?.value).toBe(1);
  });

  it("sums today's API calls across providers", () => {
    const kpis = buildKpis(mockCronLogs, mockApiQuotas, mockNews, NOW_ISO);
    const today = kpis.find((k) => k.id === "api-calls-today");
    expect(today?.value).toBe(430);
  });

  it("counts cron runs within the 7d window", () => {
    const kpis = buildKpis(mockCronLogs, mockApiQuotas, mockNews, NOW_ISO);
    const runs = kpis.find((k) => k.id === "cron-runs-7d");
    expect(runs?.value).toBe(3);
  });

  it("counts news items within the 7d window", () => {
    const kpis = buildKpis(mockCronLogs, mockApiQuotas, mockNews, NOW_ISO);
    const news = kpis.find((k) => k.id === "news-7d");
    expect(news?.value).toBe(1);
  });

  it("returns zeroes for empty inputs", () => {
    const kpis = buildKpis([], [], [], NOW_ISO);
    for (const kpi of kpis) {
      expect(kpi.value).toBe(0);
    }
  });
});

describe("buildSections", () => {
  it("includes all expected admin sections", () => {
    const sections = buildSections({
      masters: 3,
      articles: 10,
      terms: 50,
      news: 100,
      cronLogs: 200,
      apiQuotas: 5,
      holdings: 1500,
    });
    const ids = sections.map((s) => s.id);
    expect(ids).toContain("dashboard");
    expect(ids).toContain("masters");
    expect(ids).toContain("13f");
    expect(ids).toContain("learn");
    expect(ids).toContain("terms");
    expect(ids).toContain("news");
    expect(ids).toContain("users");
    expect(ids).toContain("api-usage");
    expect(ids).toContain("cron");
    expect(ids).toContain("announcements");
  });

  it("propagates counts to section entries", () => {
    const sections = buildSections({
      masters: 7,
      articles: 12,
      terms: 30,
      news: 40,
      cronLogs: 100,
      apiQuotas: 5,
      holdings: 200,
    });
    const masters = sections.find((s) => s.id === "masters");
    expect(masters?.count).toBe(7);
    const learn = sections.find((s) => s.id === "learn");
    expect(learn?.count).toBe(12);
    const dashboard = sections.find((s) => s.id === "dashboard");
    expect(dashboard?.count).toBeNull();
    const users = sections.find((s) => s.id === "users");
    expect(users?.count).toBeNull();
  });
});

describe("buildRecentEvents", () => {
  it("returns events sorted by startedAt descending", () => {
    const events = buildRecentEvents(mockCronLogs);
    for (let i = 1; i < events.length; i++) {
      expect(events[i - 1].startedAt >= events[i].startedAt).toBe(true);
    }
  });

  it("respects the limit argument", () => {
    const events = buildRecentEvents(mockCronLogs, 2);
    expect(events).toHaveLength(2);
  });

  it("returns empty array for empty input", () => {
    expect(buildRecentEvents([])).toEqual([]);
  });
});

describe("buildMastersList", () => {
  const profiles = [
    {
      id: "m1",
      name: "Buffett",
      firm: "Berkshire",
      style: "Value",
      philosophy_md: null,
      books: [],
      videos: [],
      created_at: "2025-01-01T00:00:00Z",
      updated_at: "2025-01-01T00:00:00Z",
    },
    {
      id: "m2",
      name: "Lynch",
      firm: "Magellan",
      style: "GARP",
      philosophy_md: null,
      books: [],
      videos: [],
      created_at: "2025-01-01T00:00:00Z",
      updated_at: "2025-01-01T00:00:00Z",
    },
  ];

  const holdings = [
    { master_id: "m1", symbol: "AAPL", weight: 0.3, shares: 100, qoq_delta: 0, quarter: "2025Q4" },
    { master_id: "m1", symbol: "KO", weight: 0.2, shares: 50, qoq_delta: 0, quarter: "2026Q1" },
    { master_id: "m2", symbol: "MSFT", weight: 0.15, shares: 70, qoq_delta: 0, quarter: "2025Q3" },
  ];

  it("counts holdings per master", () => {
    const list = buildMastersList(profiles, holdings);
    const m1 = list.find((m) => m.id === "m1");
    expect(m1?.holdingsCount).toBe(2);
    const m2 = list.find((m) => m.id === "m2");
    expect(m2?.holdingsCount).toBe(1);
  });

  it("computes the latest quarter per master via lex sort", () => {
    const list = buildMastersList(profiles, holdings);
    const m1 = list.find((m) => m.id === "m1");
    expect(m1?.latestQuarter).toBe("2026Q1");
  });

  it("returns null latest quarter when no holdings", () => {
    const list = buildMastersList(profiles, []);
    expect(list[0].latestQuarter).toBeNull();
    expect(list[0].holdingsCount).toBe(0);
  });
});

describe("buildLearnList", () => {
  it("preserves rows with their published_at and status", () => {
    const list = buildLearnList([
      {
        id: "a1",
        category: "Fundamentals",
        title: "P/E",
        md: "...",
        published_at: "2026-01-01T00:00:00Z",
        status: "published",
      },
    ]);
    expect(list).toHaveLength(1);
    expect(list[0].status).toBe("published");
  });
});

describe("buildTermsList", () => {
  it("truncates long definitions to 140 chars with ellipsis", () => {
    const long = "a".repeat(200);
    const list = buildTermsList([
      {
        id: "t1",
        term: "X",
        definition: long,
        related_tickers: [],
        category: "Misc",
      },
    ]);
    expect(list[0].definitionPreview.length).toBeLessThanOrEqual(140);
    expect(list[0].definitionPreview.endsWith("...")).toBe(true);
  });

  it("preserves short definitions verbatim", () => {
    const list = buildTermsList([
      {
        id: "t2",
        term: "Y",
        definition: "Short.",
        related_tickers: [],
        category: "Misc",
      },
    ]);
    expect(list[0].definitionPreview).toBe("Short.");
  });
});

describe("buildNewsList", () => {
  it("maps src, tickers, sentiment, published_at", () => {
    const list = buildNewsList(mockNews);
    expect(list).toHaveLength(2);
    expect(list[0].src).toBe("Reuters");
    expect(list[0].tickers).toEqual(["AAPL"]);
  });
});

describe("buildApiUsageList", () => {
  it("computes integer utilization percentage", () => {
    const list = buildApiUsageList([
      { provider: "p", day: "2026-05-07", used: 250, limit: 500 },
    ]);
    expect(list[0].utilizationPct).toBe(50);
  });

  it("returns 0% when limit is 0", () => {
    const list = buildApiUsageList([
      { provider: "p", day: "2026-05-07", used: 10, limit: 0 },
    ]);
    expect(list[0].utilizationPct).toBe(0);
  });
});

describe("buildCronLogList", () => {
  it("computes duration seconds when finished_at is present", () => {
    const list = buildCronLogList([
      {
        id: "c1",
        job: "x",
        started_at: "2026-05-07T11:30:00Z",
        finished_at: "2026-05-07T11:30:30Z",
        status: "ok",
        err: null,
      },
    ]);
    expect(list[0].durationSeconds).toBe(30);
  });

  it("returns null duration when finished_at is null", () => {
    const list = buildCronLogList([
      {
        id: "c1",
        job: "x",
        started_at: "2026-05-07T11:30:00Z",
        finished_at: null,
        status: "running",
        err: null,
      },
    ]);
    expect(list[0].durationSeconds).toBeNull();
  });
});

describe("isAdminRole", () => {
  it("returns true only for admin", () => {
    expect(isAdminRole("admin")).toBe(true);
    expect(isAdminRole("user")).toBe(false);
    expect(isAdminRole(null)).toBe(false);
    expect(isAdminRole(undefined)).toBe(false);
    expect(isAdminRole("")).toBe(false);
  });
});

describe("recordAdminAction", () => {
  it("returns a recorded entry tagged local-only", () => {
    const recorded = recordAdminAction({
      actor: "m0-local-user",
      action: "view-dashboard",
    });
    expect(recorded.mode).toBe("local-only");
    expect(recorded.actor).toBe("m0-local-user");
    expect(recorded.action).toBe("view-dashboard");
    expect(typeof recorded.recordedAt).toBe("string");
  });
});
