import { expect, test } from "@playwright/test";
import { open } from "./helpers";

// Contact form: pre-fill from a service link, client validation, then the Server Action (preview mode without Resend keys).
test("pre-fill, validation and preview submit", async ({ page }) => {
  await open(page, "/contact?service=Headset+rental&note=We+need+about+120+headsets+for+one+day.");
  await expect(page.getByRole("button", { name: "Headset rental", pressed: true })).toBeVisible();
  await expect(page.locator("#f-msg")).toHaveValue("We need about 120 headsets for one day.");

  await page.getByRole("button", { name: /send enquiry/i }).click();
  await expect(page.locator("form [aria-live]")).toHaveText(/name and a valid email/);

  await page.locator("#f-name").fill("Test Visitor");
  await page.locator("#f-mail").fill("visitor@example.com");
  await page.getByRole("button", { name: /send enquiry/i }).click();
  await expect(page.locator("form [aria-live]")).toHaveText(/Preview only|on its way/);
});

test("the honeypot field is hidden from people", async ({ page }) => {
  await open(page, "/contact");
  await expect(page.locator('input[name="website"]')).not.toBeInViewport();
});
