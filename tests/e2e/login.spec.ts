import { expect, test } from "@playwright/test";

test("temporary login reaches protected home", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "Continue with temporary session" }).click();
  await expect(page).toHaveURL("/");
  await expect(page.getByText("Infrastructure foundation is active.")).toBeVisible();
  await page.getByRole("button", { name: "임시 세션 종료" }).click();
  await expect(page).toHaveURL("/login");
});
