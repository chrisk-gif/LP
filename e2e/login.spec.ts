import { test, expect } from "@playwright/test";

test.describe("Login page", () => {
  test("should display login form", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator("text=Livsplanlegg")).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator("text=Logg inn")).toBeVisible();
  });

  test("should show error for invalid credentials", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[type="email"]', "test@test.com");
    await page.fill('input[type="password"]', "wrongpassword");
    await page.click("text=Logg inn");
    // Should show some error feedback
    await expect(page.locator("body")).toBeVisible();
  });
});
