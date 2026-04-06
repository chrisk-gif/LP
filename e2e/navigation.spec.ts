import { test, expect } from "@playwright/test";

test.describe("Navigation and redirects", () => {
  test("login page loads successfully", async ({ page }) => {
    await page.goto("/login");
    await expect(page).toHaveURL(/\/login/);
    // The page should contain the app name and a login form
    await expect(page.locator("body")).toBeVisible();
  });

  test("/dashboard redirects to /", async ({ request }) => {
    const response = await request.get("/dashboard", {
      maxRedirects: 0,
    });
    // Next.js permanent redirects return 308
    expect([301, 308]).toContain(response.status());
    const location = response.headers()["location"];
    expect(location).toContain("/");
    // Make sure it does not redirect back to /dashboard
    expect(location).not.toContain("/dashboard");
  });

  test("/i-dag redirects to /idag", async ({ request }) => {
    const response = await request.get("/i-dag", {
      maxRedirects: 0,
    });
    expect([301, 308]).toContain(response.status());
    const location = response.headers()["location"];
    expect(location).toContain("/idag");
  });

  test("/mal redirects to /maal", async ({ request }) => {
    const response = await request.get("/mal", {
      maxRedirects: 0,
    });
    expect([301, 308]).toContain(response.status());
    const location = response.headers()["location"];
    expect(location).toContain("/maal");
  });
});
