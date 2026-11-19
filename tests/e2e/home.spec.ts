import { expect, test } from "@playwright/test";
import { expectRevealed, goToSection, open } from "./helpers";

// Home: every section's reveals fire when reached directly (deferred sections start on time), and key animations run.
const SECTIONS = ["Who we work with", "Occasions", "360° video", "VR HUB", "Why Cyphon"];

test("every Home section reveals when reached", async ({ page }) => {
  const errors = await open(page, "/");
  for (const s of SECTIONS) {
    await goToSection(page, s);
    await expectRevealed(page, s);
  }
  expect(errors).toEqual([]);
});

test("hero occasion tabs switch the headline and the CTA", async ({ page, isMobile }) => {
  test.skip(!!isMobile, "tabs scroll horizontally on phones; behaviour is the same");
  await open(page, "/");
  await page.getByRole("tab", { name: "Property launches" }).click();
  await expect(page.locator(".hl-cta")).toHaveAttribute("href", /service=Real\+estate\+VR/);
});

test("fleet counter reaches 200 and the walkthrough names the room", async ({ page }) => {
  await open(page, "/");
  await goToSection(page, "200+ headsets", 0.95);
  await expect(page.locator(".fleet-count").first()).toHaveText("200");
  await goToSection(page, "Walkthrough", 0.36);
  await expect(page.locator(".tour-room small")).toHaveText(/Room 2 of 4/);
});
