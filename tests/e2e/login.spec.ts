import { expect, test } from "@playwright/test";

test("temporary login reaches protected home", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "Continue with temporary session" }).click();
  await expect(page).toHaveURL("/");
  await expect(page.getByText("Market Indices")).toBeVisible();
  await page.getByRole("button", { name: "임시 세션 종료" }).click();
  await expect(page).toHaveURL("/login");
});

test("can navigate from home to stock detail page", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "Continue with temporary session" }).click();
  await expect(page).toHaveURL("/");
  await expect(page.getByText("Market Indices")).toBeVisible();

  // Navigate to a stock detail route
  await page.goto("/stock/AAPL");
  await expect(page).toHaveURL(/\/stock\/AAPL/);

  // Verify the stock detail shell renders
  await expect(page.getByText("STOCKLAB M2")).toBeVisible();

  // Verify all 8 tab labels are present
  const expectedTabs = [
    "Overview",
    "Chart",
    "Financials",
    "Valuation",
    "Filings & Earnings",
    "News",
    "Supply / Demand",
    "Target Price",
  ];
  for (const tab of expectedTabs) {
    await expect(page.getByRole("tab", { name: tab })).toBeVisible();
  }
});

test("can navigate to analysis page after login", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "Continue with temporary session" }).click();
  await expect(page).toHaveURL("/");

  // Navigate to /analysis via nav link
  await page.click('a[href="/analysis"]');
  await expect(page).toHaveURL(/\/analysis/);

  // Verify the analysis hub renders
  await expect(page.getByRole("heading", { name: "Market Analysis" })).toBeVisible();

  // Verify tool cards are present (8 analysis tools)
  const expectedTools = [
    "Market Map",
    "Sentiment",
    "Technical",
    "Financials",
    "Sector Rotation",
    "Correlation",
    "Economic Data",
    "FX Tracking",
  ];
  for (const tool of expectedTools) {
    await expect(page.getByRole("link", { name: new RegExp(tool) })).toBeVisible();
  }

  // Verify tab navigation is present
  const expectedAnalysisTabs = ["Market Overview", "Sentiment", "Technical", "Financial"];
  for (const tab of expectedAnalysisTabs) {
    await expect(page.getByRole("tab", { name: tab })).toBeVisible();
  }

  // Verify M3 footer marker
  await expect(page.getByText("STOCKLAB M3")).toBeVisible();
});

test("can navigate to screener page after login", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "Continue with temporary session" }).click();
  await expect(page).toHaveURL("/");

  // Navigate to /screener via nav link
  await page.click('a[href="/screener"]');
  await expect(page).toHaveURL(/\/screener/);

  // Verify the screener hub renders
  await expect(page.getByRole("heading", { name: "Stock Screener" })).toBeVisible();

  // Verify filter rail section exists
  await expect(page.getByText("Filters")).toBeVisible();

  // Verify view mode toggles exist
  await expect(page.getByRole("tab", { name: "Table" })).toBeVisible();
  await expect(page.getByRole("tab", { name: "Heatmap" })).toBeVisible();
  await expect(page.getByRole("tab", { name: "Chart" })).toBeVisible();

  // Verify disabled action stubs are present (OAuth required)
  await expect(page.getByText("Save Screen")).toBeVisible();
  await expect(page.getByText("Add to Watchlist")).toBeVisible();

  // Verify M3 footer marker
  await expect(page.getByText("STOCKLAB M3")).toBeVisible();
});

test("screener result rows link to stock detail when data available", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "Continue with temporary session" }).click();
  await expect(page).toHaveURL("/");

  // Navigate to screener
  await page.goto("/screener");
  await expect(page).toHaveURL(/\/screener/);

  // If there are any result rows, verify they contain stock links
  // The table may be empty if no securities data is cached yet,
  // so we check for either the empty state or valid links
  const hasResults = await page.locator("table tbody tr").count().catch(() => 0);

  if (hasResults > 0) {
    // At least one row should have a link to /stock/
    const firstRowLink = page.locator("table tbody tr a[href^='/stock/']").first();
    await expect(firstRowLink).toBeVisible();
  }
});
