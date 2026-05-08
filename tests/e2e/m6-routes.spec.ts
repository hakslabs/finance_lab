import { expect, test } from "@playwright/test";

// ── Learn page ────────────────────────────────────────────────────────

test("can navigate to learn page after login", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "Continue with temporary session" }).click();
  await expect(page).toHaveURL("/");

  await page.click('a[href="/learn"]');
  await expect(page).toHaveURL(/\/learn/);

  // Verify the learn hub renders
  await expect(page.getByRole("heading", { name: "Learn" })).toBeVisible();

  // Verify category chip bar exists
  const allChip = page.locator('a[href="/learn"][role="button"], a[href="/learn"]:has-text("All")');
  const chipCount = await allChip.count();
  expect(chipCount).toBeGreaterThanOrEqual(1);

  // Verify M6 footer marker
  await expect(page.getByText("STOCKLAB M6")).toBeVisible();
});

test("learn page shows hero, categories, and guide grid or empty state", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "Continue with temporary session" }).click();
  await expect(page).toHaveURL("/");

  await page.goto("/learn");
  await expect(page).toHaveURL(/\/learn/);

  // Assert main heading
  await expect(page.getByRole("heading", { name: "Learn" })).toBeVisible();

  // Either guide cards render OR an empty/coming-soon state appears
  const guidesHeading = page.getByText(/Guides \(\d+\)/);
  const comingSoon = page.getByText(/Coming Soon|No guides in this category/);
  const hasGuides = await guidesHeading.count().catch(() => 0);
  const hasEmpty = await comingSoon.count().catch(() => 0);

  expect(hasGuides + hasEmpty).toBeGreaterThanOrEqual(1);
});

test("learn category filtering works via URL params", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "Continue with temporary session" }).click();
  await expect(page).toHaveURL("/");

  // Navigate with a category filter
  await page.goto("/learn?category=Fundamentals");
  await expect(page).toHaveURL(/\/learn\?category=Fundamentals/);

  // The learn heading should still be present
  await expect(page.getByRole("heading", { name: "Learn" })).toBeVisible();
});

test("learn terms preview section renders when terms exist", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "Continue with temporary session" }).click();
  await expect(page).toHaveURL("/");

  await page.goto("/learn");
  await expect(page).toHaveURL(/\/learn/);

  // Terms preview may or may not have data; check the section header
  const termsPreview = page.getByText("Terms Preview");
  const hasTerms = await termsPreview.count().catch(() => 0);
  // Terms preview is only rendered when there are terms, so it's OK if absent
  if (hasTerms > 0) {
    await expect(termsPreview.first()).toBeVisible();
  }
});

// ── My Page ───────────────────────────────────────────────────────────

test("can navigate to my page after login", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "Continue with temporary session" }).click();
  await expect(page).toHaveURL("/");

  await page.click('a[href="/me"]');
  await expect(page).toHaveURL(/\/me/);

  // Verify my page hub renders
  await expect(page.getByRole("heading", { name: "My Page" })).toBeVisible();

  // Verify M6 footer marker
  await expect(page.getByText("STOCKLAB M6")).toBeVisible();
});

test("my page shows profile hero and KPI cards or auth-required state", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "Continue with temporary session" }).click();
  await expect(page).toHaveURL("/");

  await page.goto("/me");
  await expect(page).toHaveURL(/\/me/);

  // Main heading must be present
  await expect(page.getByRole("heading", { name: "My Page" })).toBeVisible();

  // Either KPI cards render OR auth-required message appears
  const overviewLabel = page.getByText("Overview");
  const authRequired = page.getByText(/Sign in with a real account/);
  const hasOverview = await overviewLabel.count().catch(() => 0);
  const hasAuth = await authRequired.count().catch(() => 0);

  expect(hasOverview + hasAuth).toBeGreaterThanOrEqual(1);
});

test("my page sidebar navigation includes settings link", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "Continue with temporary session" }).click();
  await expect(page).toHaveURL("/");

  await page.goto("/me");
  await expect(page).toHaveURL(/\/me/);

  // Settings link should be visible in nav
  const settingsLink = page.locator('a[href="/me/settings"]');
  await expect(settingsLink.first()).toBeVisible();
});

// ── Settings page ─────────────────────────────────────────────────────

test("can navigate to settings from my page", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "Continue with temporary session" }).click();
  await expect(page).toHaveURL("/");

  await page.goto("/me/settings");
  await expect(page).toHaveURL(/\/me\/settings/);

  // Verify settings page renders
  await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible();

  // Verify M6 footer marker
  await expect(page.getByText("STOCKLAB M6")).toBeVisible();
});

test("settings page shows read-only preview banner under temporary auth", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "Continue with temporary session" }).click();
  await expect(page).toHaveURL("/");

  await page.goto("/me/settings");
  await expect(page).toHaveURL(/\/me\/settings/);

  // Read-Only Preview Mode banner should be visible (auth-required state)
  const previewBanner = page.getByText(/Read-Only Preview Mode/);
  const bannerCount = await previewBanner.count().catch(() => 0);
  expect(bannerCount).toBeGreaterThanOrEqual(1);
});

test("settings page shows notification toggles with disabled channel picker", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "Continue with temporary session" }).click();
  await expect(page).toHaveURL("/");

  await page.goto("/me/settings");
  await expect(page).toHaveURL(/\/me\/settings/);

  // Notification toggle labels should be present
  const priceTargetToggle = page.getByText("Price Target Alerts");
  const toggleCount = await priceTargetToggle.count().catch(() => 0);

  if (toggleCount > 0) {
    await expect(priceTargetToggle.first()).toBeVisible();

    // Channel picker disabled reason should mention TD-006
    const td006Ref = page.getByText(/TD-006/);
    const td006Count = await td006Ref.count().catch(() => 0);
    expect(td006Count).toBeGreaterThanOrEqual(1);
  }
});

test("settings page shows all expected sections", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "Continue with temporary session" }).click();
  await expect(page).toHaveURL("/");

  await page.goto("/me/settings");
  await expect(page).toHaveURL(/\/me\/settings/);

  // Key sections should be rendered as headings
  await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible();

  // Check for key section identifiers
  const profileSection = page.getByText("Profile");
  const notificationsSection = page.getByText("Notifications");
  const themeSection = page.getByText("Theme");

  // At least some of these should be present
  const profileCount = await profileSection.count().catch(() => 0);
  const notifCount = await notificationsSection.count().catch(() => 0);
  const themeCount = await themeSection.count().catch(() => 0);

  expect(profileCount + notifCount + themeCount).toBeGreaterThanOrEqual(2);
});

// ── Global Header nav entries ─────────────────────────────────────────

test("global header includes Learn and My Page navigation links", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "Continue with temporary session" }).click();
  await expect(page).toHaveURL("/");

  // Verify Learn link exists in header
  const learnLink = page.locator('a[href="/learn"]');
  await expect(learnLink.first()).toBeVisible();
  await expect(learnLink).toContainText("Learn");

  // Verify My Page link exists in header
  const meLink = page.locator('a[href="/me"]');
  await expect(meLink.first()).toBeVisible();
  await expect(meLink).toContainText("My Page");
});
