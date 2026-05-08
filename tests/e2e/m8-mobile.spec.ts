import { expect, test } from "@playwright/test";

test.use({ viewport: { width: 375, height: 812 } });

test("home renders on 375px viewport with mobile bottom tab bar", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "Continue with temporary session" }).click();
  await expect(page).toHaveURL("/");

  const tabBar = page.getByTestId("mobile-bottom-tab-bar");
  await expect(tabBar).toBeVisible();

  for (const label of ["Home", "Analysis", "Search", "Portfolio", "More"]) {
    await expect(tabBar.getByText(label, { exact: true })).toBeVisible();
  }
});

test("bottom tab bar navigates to Portfolio", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "Continue with temporary session" }).click();
  await expect(page).toHaveURL("/");

  const tabBar = page.getByTestId("mobile-bottom-tab-bar");
  await tabBar.getByText("Portfolio", { exact: true }).click();
  await expect(page).toHaveURL(/\/portfolio/);
});

test("PWA manifest is reachable and well-formed", async ({ request }) => {
  const response = await request.get("/manifest.json");
  expect(response.status()).toBe(200);
  const body = await response.json();
  expect(body.name).toBe("STOCKLAB");
  expect(body.display).toBe("standalone");
  expect(body.icons.length).toBeGreaterThanOrEqual(2);
});

test("service worker file is reachable", async ({ request }) => {
  const response = await request.get("/sw.js");
  expect(response.status()).toBe(200);
  const text = await response.text();
  expect(text).toContain("CACHE_VERSION");
});

test("stock detail renders on 375px viewport with bottom tab bar", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "Continue with temporary session" }).click();
  await expect(page).toHaveURL("/");

  await page.goto("/stock/AAPL");
  await expect(page.getByTestId("mobile-bottom-tab-bar")).toBeVisible();
});
