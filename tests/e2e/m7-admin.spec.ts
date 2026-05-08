import { expect, test } from "@playwright/test";

// ── Non-admin user is rejected ─────────────────────────────────────────

test("non-admin temporary session sees 404 on /admin", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "Continue with temporary session" }).click();
  await expect(page).toHaveURL("/");

  const response = await page.goto("/admin");
  expect(response?.status()).toBe(404);
});

test("unauthenticated visit to /admin redirects to /login", async ({ page }) => {
  await page.context().clearCookies();
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/login(\?.*)?$/);
});

// ── Admin login + dashboard ────────────────────────────────────────────

test("admin temporary session reaches /admin dashboard", async ({ page }) => {
  await page.goto("/login");
  await page
    .getByRole("button", { name: "Continue as temporary admin (M7 verification)" })
    .click();
  await expect(page).toHaveURL(/\/admin/);

  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  await expect(page.getByText("STOCKLAB ADMIN")).toBeVisible();
  await expect(page.getByText("TEMPORARY AUTH")).toBeVisible();
});

test("admin dashboard renders KPI cards and recent activity", async ({ page }) => {
  await page.goto("/login");
  await page
    .getByRole("button", { name: "Continue as temporary admin (M7 verification)" })
    .click();
  await expect(page).toHaveURL(/\/admin/);

  await expect(page.getByText("Cron runs (7d)")).toBeVisible();
  await expect(page.getByText("Cron failures (7d)")).toBeVisible();
  await expect(page.getByText("API calls today")).toBeVisible();
  await expect(page.getByText("News items (7d)")).toBeVisible();

  const recentHeader = page.getByText("Recent cron activity");
  await expect(recentHeader).toBeVisible();
});

// ── Sidebar navigation ─────────────────────────────────────────────────

test("admin sidebar navigates to section list views", async ({ page }) => {
  await page.goto("/login");
  await page
    .getByRole("button", { name: "Continue as temporary admin (M7 verification)" })
    .click();
  await expect(page).toHaveURL(/\/admin/);

  for (const section of ["Masters", "Learn Content", "Terms", "Cron Logs", "API Usage"]) {
    const link = page.getByRole("navigation", { name: "Admin sidebar" }).getByRole("link", {
      name: section,
    });
    await link.click();
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByText(/Read-only mode under temporary auth/)).toBeVisible();
  }
});

test("admin users section shows production-gated panel", async ({ page }) => {
  await page.goto("/login");
  await page
    .getByRole("button", { name: "Continue as temporary admin (M7 verification)" })
    .click();
  await page.goto("/admin/users");
  await expect(page.getByRole("heading", { name: "Users" })).toBeVisible();
  await expect(page.getByText(/Production gated/)).toBeVisible();
});

test("admin announcements section is production-gated", async ({ page }) => {
  await page.goto("/login");
  await page
    .getByRole("button", { name: "Continue as temporary admin (M7 verification)" })
    .click();
  await page.goto("/admin/announcements");
  await expect(page.getByRole("heading", { name: "Announcements" })).toBeVisible();
  await expect(page.getByText(/Production gated/)).toBeVisible();
});

test("unknown admin section returns 404", async ({ page }) => {
  await page.goto("/login");
  await page
    .getByRole("button", { name: "Continue as temporary admin (M7 verification)" })
    .click();
  const response = await page.goto("/admin/does-not-exist");
  expect(response?.status()).toBe(404);
});

// ── Back to app link ───────────────────────────────────────────────────

test("admin top bar back-to-app link returns to /", async ({ page }) => {
  await page.goto("/login");
  await page
    .getByRole("button", { name: "Continue as temporary admin (M7 verification)" })
    .click();
  await expect(page).toHaveURL(/\/admin/);
  await page.getByRole("link", { name: /Back to app/ }).click();
  await expect(page).toHaveURL("/");
});
