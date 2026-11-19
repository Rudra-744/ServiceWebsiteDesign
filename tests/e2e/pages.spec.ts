import { expect, test } from "@playwright/test";
import { PAGES, expectRevealed, open } from "./helpers";

// Every page: renders its headline, reveals its first section, and logs no console errors.
for (const path of PAGES) {
  test(`page ${path} loads cleanly`, async ({ page }) => {
    const errors = await open(page, path);
    await expect(page.locator("h1").first()).toBeVisible();
    const first = await page.evaluate(() => (document.querySelector(".page")!.firstElementChild as HTMLElement).dataset.nav);
    if (first && path !== "/") await expectRevealed(page, first);
    expect(errors).toEqual([]);
  });
}

test("next-page link morphs to the next page", async ({ page }) => {
  await open(page, "/vr-headset-rental");
  await page.locator("a.next").click();
  await expect(page).toHaveURL(/\/vr-events$/);
  await expect(page.locator("h1").first()).toBeVisible();
});

test("menu opens and closes", async ({ page, isMobile }) => {
  test.skip(!!isMobile, "same menu on phones; checked on desktop");
  await open(page, "/");
  await page.getByRole("button", { name: /menu/i }).first().click();
  await expect(page.locator("body")).toHaveClass(/menu-open/);
  await page.keyboard.press("Escape");
  await expect(page.locator("body")).not.toHaveClass(/menu-open/);
});
