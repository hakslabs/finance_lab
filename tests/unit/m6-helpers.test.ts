/**
 * Vitest unit tests for M6 helper shaping functions.
 *
 * Tests the pure (non-fetch) data transformation logic in learn, my-page,
 * and settings helpers. Server-only imports are mocked.
 */

import { describe, expect, it, vi } from "vitest";

// Mock server-only before importing modules that use it
vi.mock("server-only", () => ({}));

// ── Learn helpers ─────────────────────────────────────────────────────

import {
  buildLearnData,
  filterGuidesByCategory,
  extractCategories,
  type GuideCard,
} from "@/app/_lib/learn/learn-data";

const mockArticleRows = [
  {
    id: "a1",
    category: "Fundamentals",
    title: "What is P/E Ratio?",
    md: "# P/E Ratio\n\nThe price-to-earnings ratio is...",
    published_at: "2026-01-15T10:00:00Z",
    status: "published" as const,
  },
  {
    id: "a2",
    category: "Technical",
    title: "Reading Candlestick Charts",
    md: "# Candlesticks\n\nA candlestick shows OHLC...",
    published_at: "2026-01-20T10:00:00Z",
    status: "published" as const,
  },
  {
    id: "a3-draft",
    category: "Fundamentals",
    title: "Draft Article (hidden)",
    md: "Draft content",
    published_at: null,
    status: "draft" as const,
  },
];

const mockTermRows = [
  { id: "t1", term: "P/E Ratio", definition: "Price divided by earnings per share.", related_tickers: [], category: "Fundamentals" },
  { id: "t2", term: "RSI", definition: "Relative Strength Index — momentum oscillator.", related_tickers: [], category: "Technical" },
];

describe("buildLearnData", () => {
  it("filters out non-published articles", () => {
    const result = buildLearnData(mockArticleRows, mockTermRows);
    expect(result.guides).toHaveLength(2);
    expect(result.guides.every((g) => g.id !== "a3-draft")).toBe(true);
  });

  it("returns empty status when no published articles exist", () => {
    const result = buildLearnData([], mockTermRows);
    expect(result.status).toBe("empty");
    expect(result.guides).toHaveLength(0);
  });

  it("returns ready status when published articles exist", () => {
    const result = buildLearnData(mockArticleRows, mockTermRows);
    expect(result.status).toBe("ready");
  });

  it("maps terms correctly", () => {
    const result = buildLearnData(mockArticleRows, mockTermRows);
    expect(result.terms).toHaveLength(2);
    expect(result.terms[0].term).toBe("P/E Ratio");
    expect(result.terms[1].term).toBe("RSI");
  });

  it("populates detail when detailId matches a published article", () => {
    const result = buildLearnData(mockArticleRows, mockTermRows, null, "a1");
    expect(result.detail).not.toBeNull();
    expect(result.detail!.title).toBe("What is P/E Ratio?");
    expect(result.detail!.md).toContain("P/E Ratio");
  });

  it("returns null detail when detailId does not match any article", () => {
    const result = buildLearnData(mockArticleRows, mockTermRows, null, "nonexistent");
    expect(result.detail).toBeNull();
  });

  it("returns null detail for draft articles even with matching ID", () => {
    const result = buildLearnData(mockArticleRows, mockTermRows, null, "a3-draft");
    expect(result.detail).toBeNull();
  });

  it("disables bookmark state on all guides", () => {
    const result = buildLearnData(mockArticleRows, mockTermRows);
    for (const guide of result.guides) {
      expect(guide.bookmarkState.enabled).toBe(false);
      expect(guide.bookmarkState.reason).toBe("auth-required");
    }
  });

  it("disables bookmark state on detail", () => {
    const result = buildLearnData(mockArticleRows, mockTermRows, null, "a1");
    if (result.detail) {
      expect(result.detail.bookmarkState.enabled).toBe(false);
      expect(result.detail.bookmarkState.reason).toBe("auth-required");
    }
  });
});

describe("filterGuidesByCategory", () => {
  const guides: readonly GuideCard[] = [
    { id: "a1", title: "G1", category: "Fundamentals", estimatedReadMin: 5, publishedAt: null, bookmarkState: { enabled: false, isBookmarked: false, reason: "auth-required" } },
    { id: "a2", title: "G2", category: "Technical", estimatedReadMin: 3, publishedAt: null, bookmarkState: { enabled: false, isBookmarked: false, reason: "auth-required" } },
    { id: "a3", title: "G3", category: "Fundamentals", estimatedReadMin: 7, publishedAt: null, bookmarkState: { enabled: false, isBookmarked: false, reason: "auth-required" } },
  ];

  it("returns all guides when category is null", () => {
    expect(filterGuidesByCategory(guides, null)).toHaveLength(3);
  });

  it("returns all guides when category is All", () => {
    expect(filterGuidesByCategory(guides, "All")).toHaveLength(3);
  });

  it("filters by exact category match", () => {
    const filtered = filterGuidesByCategory(guides, "Fundamentals");
    expect(filtered).toHaveLength(2);
    expect(filtered.every((g) => g.category === "Fundamentals")).toBe(true);
  });

  it("returns empty array for category with no guides", () => {
    const filtered = filterGuidesByCategory(guides, "Terms");
    expect(filtered).toHaveLength(0);
  });
});

describe("extractCategories", () => {
  it("returns sorted unique categories", () => {
    const guides: readonly GuideCard[] = [
      { id: "a1", title: "G1", category: "Technical", estimatedReadMin: 1, publishedAt: null, bookmarkState: { enabled: false, isBookmarked: false, reason: "auth-required" } },
      { id: "a2", title: "G2", category: "Fundamentals", estimatedReadMin: 1, publishedAt: null, bookmarkState: { enabled: false, isBookmarked: false, reason: "auth-required" } },
      { id: "a3", title: "G3", category: "Technical", estimatedReadMin: 1, publishedAt: null, bookmarkState: { enabled: false, isBookmarked: false, reason: "auth-required" } },
    ];
    const cats = extractCategories(guides);
    expect(cats).toEqual(["Fundamentals", "Technical"]);
  });

  it("returns empty array for no guides", () => {
    expect(extractCategories([])).toEqual([]);
  });
});

// ── My Page helpers ───────────────────────────────────────────────────

import { buildMyPageData } from "@/app/_lib/my-page/my-page-data";

const mockWatchlistRows = [
  { id: "w1", user_id: "u1", name: "Tech Stocks", symbols: ["AAPL", "MSFT"], created_at: "2026-01-01T00:00:00Z" },
];

const mockFollowRows = [
  { user_id: "u1", master_id: "m1", created_at: "2026-01-02T00:00:00Z" },
  { user_id: "u1", master_id: "m2", created_at: "2026-01-03T00:00:00Z" },
];

const mockBookmarkRows = [
  { id: "b1", user_id: "u1", type: "article" as const, ref_id: "a1", created_at: "2026-01-04T00:00:00Z" },
];

const mockSavedScreenRows = [
  { id: "s1", user_id: "u1", name: "Value Screen", filters_json: {}, created_at: "2026-01-05T00:00:00Z" },
];

const mockNoteRows = [
  { id: "n1", user_id: "u1", symbol_or_ref: "AAPL", md: "Buy signal", created_at: "2026-01-06T00:00:00Z" },
];

const mockPreferencesRow = {
  user_id: "u1",
  currency: "USD",
  language: "en",
  theme: "light",
  notif_json: {},
  updated_at: "2026-01-01T00:00:00Z",
};

describe("buildMyPageData", () => {
  it("returns auth-required when all inputs are empty", () => {
    const result = buildMyPageData([], [], [], [], [], null);
    expect(result.status).toBe("auth-required");
    expect(result.authRequired).toBe(true);
  });

  it("returns ready status when data exists", () => {
    const result = buildMyPageData(
      mockWatchlistRows,
      mockFollowRows,
      mockBookmarkRows,
      mockSavedScreenRows,
      mockNoteRows,
      mockPreferencesRow,
    );
    expect(result.status).toBe("ready");
    expect(result.authRequired).toBe(false);
  });

  it("computes KPI counts correctly", () => {
    const result = buildMyPageData(
      mockWatchlistRows,
      mockFollowRows,
      mockBookmarkRows,
      mockSavedScreenRows,
      mockNoteRows,
      mockPreferencesRow,
    );
    expect(result.kpis).toHaveLength(4);
    expect(result.kpis[0].value).toBe(1); // watchlists
    expect(result.kpis[1].value).toBe(2); // follows
    expect(result.kpis[2].value).toBe(1); // bookmarks
    expect(result.kpis[3].value).toBe(1); // saved screens
  });

  it("maps preferences when present", () => {
    const result = buildMyPageData(
      [],
      [],
      [],
      [],
      [],
      mockPreferencesRow,
    );
    expect(result.preferences).not.toBeNull();
    expect(result.preferences!.currency).toBe("USD");
    expect(result.preferences!.theme).toBe("light");
  });

  it("returns null preferences when absent", () => {
    const result = buildMyPageData(
      mockWatchlistRows,
      [],
      [],
      [],
      [],
      null,
    );
    expect(result.preferences).toBeNull();
  });

  it("builds recent activity feed sorted by date descending", () => {
    const result = buildMyPageData(
      mockWatchlistRows,
      mockFollowRows,
      mockBookmarkRows,
      mockSavedScreenRows,
      mockNoteRows,
      mockPreferencesRow,
    );
    expect(result.recentActivity.length).toBeGreaterThan(0);
    for (let i = 1; i < result.recentActivity.length; i++) {
      expect(result.recentActivity[i - 1].createdAt >= result.recentActivity[i].createdAt).toBe(true);
    }
  });

  it("includes sidebar navigation items", () => {
    const result = buildMyPageData([], [], [], [], [], null);
    expect(result.sidebarNav.length).toBeGreaterThan(0);
    expect(result.sidebarNav.some((item) => item.href === "/me/settings")).toBe(true);
    expect(result.sidebarNav.some((item) => item.label === "Settings")).toBe(true);
  });
});

// ── Settings helpers ──────────────────────────────────────────────────

import { buildSettingsData, NOTIFICATION_TOGGLE_DEFS } from "@/app/_lib/settings/settings-data";

const mockAlertRows = [
  {
    id: "al1",
    user_id: "u1",
    rule_json: { symbol: "AAPL", condition: "price_above", value: 200 },
    channel: "push" as const,
    enabled: true,
    created_at: "2026-01-10T00:00:00Z",
  },
  {
    id: "al2",
    user_id: "u1",
    rule_json: { symbol: "MSFT", condition: "price_below", value: 300 },
    channel: "email" as const,
    enabled: false,
    created_at: "2026-01-11T00:00:00Z",
  },
];

describe("buildSettingsData", () => {
  it("returns auth-required when no preferences and no alerts", () => {
    const result = buildSettingsData(null, []);
    expect(result.status).toBe("auth-required");
    expect(result.authRequired).toBe(true);
  });

  it("returns ready status when preferences exist", () => {
    const result = buildSettingsData(mockPreferencesRow, []);
    expect(result.status).toBe("ready");
    expect(result.preferences).not.toBeNull();
  });

  it("maps alert rules correctly", () => {
    const result = buildSettingsData(null, mockAlertRows);
    expect(result.alerts).toHaveLength(2);
    expect(result.alerts[0].enabled).toBe(true);
    expect(result.alerts[1].enabled).toBe(false);
  });

  it("generates notification toggles for all defined types", () => {
    const result = buildSettingsData(mockPreferencesRow, []);
    expect(result.notificationToggles).toHaveLength(NOTIFICATION_TOGGLE_DEFS.length);
  });

  it("disables channel picker on all notification toggles", () => {
    const result = buildSettingsData(mockPreferencesRow, []);
    for (const toggle of result.notificationToggles) {
      expect(toggle.channelPickerDisabled).toBe(true);
      expect(toggle.channelPickerReason).toContain("TD-006");
    }
  });

  it("includes all settings sections", () => {
    const result = buildSettingsData(null, []);
    expect(result.sections.length).toBeGreaterThan(0);
    expect(result.sections.some((s) => s.id === "profile")).toBe(true);
    expect(result.sections.some((s) => s.id === "notifications")).toBe(true);
    expect(result.sections.some((s) => s.id === "delete_account")).toBe(true);
  });

  it("all settings sections are disabled under temporary auth", () => {
    const result = buildSettingsData(null, []);
    for (const section of result.sections) {
      expect(section.disabled).toBe(true);
    }
  });
});
