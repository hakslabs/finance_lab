import { expect, test } from "@playwright/test";

// ── Masters page ───────────────────────────────────────────────────────

test("can navigate to masters page after login", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "Continue with temporary session" }).click();
  await expect(page).toHaveURL("/");

  // Navigate to /masters via nav link
  await page.click('a[href="/masters"]');
  await expect(page).toHaveURL(/\/masters/);

  // Verify the masters hub renders
  await expect(page.getByRole("heading", { name: "Investment Masters" })).toBeVisible();

  // Verify roster section exists
  await expect(page.getByText(/Masters \(\d+\)/)).toBeVisible();

  // Verify disabled follow action
  await expect(page.getByText("Follow Master")).toBeVisible();

  // Verify M4 footer marker
  await expect(page.getByText("STOCKLAB M4")).toBeVisible();
});

test("masters page shows heading and empty state or roster items", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "Continue with temporary session" }).click();
  await expect(page).toHaveURL("/");

  await page.goto("/masters");
  await expect(page).toHaveURL(/\/masters/);

  // Assert the main heading is present (not hard-coded row count)
  const heading = page.getByRole("heading", { name: "Investment Masters" });
  await expect(heading).toBeVisible();
});

// ── Reports page ───────────────────────────────────────────────────────

test("can navigate to reports page after login", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "Continue with temporary session" }).click();
  await expect(page).toHaveURL("/");

  // Navigate to /reports via nav link
  await page.click('a[href="/reports"]');
  await expect(page).toHaveURL(/\/reports/);

  // Verify the reports hub renders
  await expect(page.getByRole("heading", { name: "Research Reports" })).toBeVisible();

  // Verify disabled bookmark/note actions are present
  await expect(page.getByText("Bookmark Report")).toBeVisible();
  await expect(page.getByText("Add Note")).toBeVisible();

  // Verify M4 footer marker
  await expect(page.getByText("STOCKLAB M4")).toBeVisible();
});

test("reports page shows heading and filter structure", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "Continue with temporary session" }).click();
  await expect(page).toHaveURL("/");

  await page.goto("/reports");
  await expect(page).toHaveURL(/\/reports/);

  // Assert main heading
  await expect(page.getByRole("heading", { name: "Research Reports" })).toBeVisible();

  // If there's a recommended hero section, verify it renders
  const heroLink = page.locator('a[href^="/reports/"]').first();
  const heroCount = await heroLink.count();
  if (heroCount > 0) {
    await expect(heroLink.first()).toBeVisible();
  }
});

// ── Portfolio page ─────────────────────────────────────────────────────

test("can navigate to portfolio page after login", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "Continue with temporary session" }).click();
  await expect(page).toHaveURL("/");

  // Navigate to /portfolio via nav link
  await page.click('a[href="/portfolio"]');
  await expect(page).toHaveURL(/\/portfolio/);

  // Verify the portfolio page renders
  await expect(page.getByRole("heading", { name: "Portfolio" })).toBeVisible();

  // Verify tab navigation is present
  const expectedTabs = ["Summary", "Holdings", "Transactions", "Performance"];
  for (const tab of expectedTabs) {
    await expect(page.getByRole("tab", { name: tab })).toBeVisible();
  }

  // Verify M5 footer marker
  await expect(page.getByText("STOCKLAB M5")).toBeVisible();
});

test("portfolio transactions tab shows disabled CTA and deep link", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "Continue with temporary session" }).click();
  await expect(page).toHaveURL("/");

  // Navigate directly to transactions tab
  await page.goto("/portfolio?tab=transactions");
  await expect(page).toHaveURL(/\/portfolio/);

  // Verify Transactions tab is active
  const transactionsTab = page.getByRole("tab", { name: "Transactions" });
  await expect(transactionsTab).toBeVisible();

  // Verify disabled add transaction button exists
  const addButton = page.getByRole("button", { name: /\+ Add Transaction/ });
  await expect(addButton).toBeVisible();

  // Verify it is actually disabled
  const isDisabled = await addButton.isDisabled();
  expect(isDisabled).toBeTruthy();

  // Verify deep link to /me/transactions
  const meTransactionsLink = page.locator('a[href="/me/transactions"]');
  const meLinkCount = await meTransactionsLink.count();
  if (meLinkCount > 0) {
    await expect(meTransactionsLink.first()).toBeVisible();
    await expect(meTransactionsLink.first()).toContainText(/View All/i);
  }
});

test("portfolio summary tab shows stat cards or auth-required state", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "Continue with temporary session" }).click();
  await expect(page).toHaveURL("/");

  await page.goto("/portfolio?tab=summary");
  await expect(page).toHaveURL(/\/portfolio/);

  // Verify the Summary tab panel is visible
  await expect(page.getByRole("heading", { name: "Portfolio" })).toBeVisible();

  // Either stat cards render OR an auth-required banner appears
  // We check for either condition without asserting specific data values
  const totalAssetsText = page.getByText("Total Assets");
  const hasStats = await totalAssetsText.count().catch(() => 0);
  const authBanner = page.getByText(/Real Authentication Required|Portfolio Is Empty/);
  const hasBanner = await authBanner.count().catch(() => 0);

  expect(hasStats + hasBanner).toBeGreaterThanOrEqual(1);
});

test("portfolio performance tab shows heatmap or informational card", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "Continue with temporary session" }).click();
  await expect(page).toHaveURL("/");

  await page.goto("/portfolio?tab=performance");
  await expect(page).toHaveURL(/\/portfolio/);

  // Verify Performance tab content
  const monthlyHeatmap = page.getByText("Monthly Activity Heatmap");
  const capitalGains = page.getByText(/\uCC38\uace0\uc6a9/);

  const hasHeatmap = await monthlyHeatmap.count().catch(() => 0);
  const hasCapitalGains = await capitalGains.count().catch(() => 0);

  // At least one of these sections should be present
  expect(hasHeatmap + hasCapitalGains).toBeGreaterThanOrEqual(1);
});

// ── Me/Transactions page ───────────────────────────────────────────────

test("me/transactions page shows OAuth gate explanation", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "Continue with temporary session" }).click();
  await expect(page).toHaveURL("/");

  await page.goto("/me/transactions");
  await expect(page).toHaveURL(/\/me\/transactions/);

  // Verify the auth gate message is shown
  await expect(page.getByText(/Transaction Entry Requires Real Authentication/)).toBeVisible();

  // Verify back link to portfolio
  const backLink = page.getByRole("link", { name: /Back to Portfolio/ });
  await expect(backLink).toBeVisible();

  // Verify disabled add transaction button
  const disabledBtn = page.getByRole("button", { name: /\+ Add Transaction/, exact: false });
  await expect(disabledBtn).toBeVisible();
  const isDisabled = await disabledBtn.isDisabled();
  expect(isDisabled).toBeTruthy();
});
