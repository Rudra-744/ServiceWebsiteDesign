import { type Page, expect } from "@playwright/test";

export const PAGES = ["/", "/vr-headset-rental", "/vr-events", "/360-video", "/real-estate-vr", "/vr-hub", "/contact"];

/** skip the once-per-session loader (desktop) and collect console errors */
export async function open(page: Page, path: string) {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  await page.addInitScript(() => sessionStorage.setItem("cy-pre", "1"));
  await page.goto(path, { waitUntil: "networkidle" });
  return errors;
}

/** scroll to a section by its nav label (tall pinned sections: to `f` of their scroll length) and wait for it to settle */
export async function goToSection(page: Page, label: string, f = 0.45) {
  await page.evaluate(
    async ({ label, f }) => {
      const s = [...document.querySelectorAll<HTMLElement>("#main [data-nav]")].find((e) => e.dataset.nav === label);
      if (!s) throw new Error("no section " + label);
      const top = s.getBoundingClientRect().top + scrollY, tall = s.offsetHeight > innerHeight * 1.5;
      window.scrollTo(0, tall ? top + f * (s.offsetHeight - innerHeight) : top - 40);
      await new Promise((r) => setTimeout(r, 1400));
    },
    { label, f },
  );
}

/** reveal elements of a section that are on screen have been revealed */
export async function expectRevealed(page: Page, label: string) {
  const r = await page.evaluate((label) => {
    const s = [...document.querySelectorAll<HTMLElement>("#main [data-nav]")].find((e) => e.dataset.nav === label)!;
    const els = [...s.querySelectorAll("[data-reveal],[data-split]")].filter((e) => {
      const b = e.getBoundingClientRect();
      return !e.closest("[data-manual]") && b.top < innerHeight * 0.8 && b.bottom > 0 && b.height > 0;
    });
    return { total: els.length, shown: els.filter((e) => e.classList.contains("in")).length };
  }, label);
  expect(r.shown, `${label}: revealed ${r.shown}/${r.total}`).toBe(r.total);
}
