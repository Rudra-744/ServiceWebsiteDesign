import { expect, test } from "@playwright/test";

// SEO and security output (stage 6). Only needs one viewport.
test.skip(({ isMobile }) => !!isMobile, "server output, viewport-independent");

test("security headers on every page", async ({ request }) => {
  const h = (await request.get("/vr-hub")).headers();
  expect(h["strict-transport-security"]).toContain("max-age=");
  expect(h["x-content-type-options"]).toBe("nosniff");
  expect(h["x-frame-options"]).toBe("DENY");
  expect(h["content-security-policy"]).toContain("frame-ancestors 'none'");
  expect(h["permissions-policy"]).toContain("gyroscope=(self)");
});

test("robots, sitemap and llms.txt", async ({ request }) => {
  expect(await (await request.get("/robots.txt")).text()).toContain("Disallow: /privacy");
  const sitemap = await (await request.get("/sitemap.xml")).text();
  expect(sitemap.match(/<loc>/g)?.length).toBe(7);
  expect(await (await request.get("/llms.txt")).text()).toContain("## Frequently asked questions");
});

test("service page has canonical, share image and valid JSON-LD", async ({ page, request }) => {
  await page.goto("/vr-headset-rental");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/vr-headset-rental$/);
  const og = await page.locator('meta[property="og:image"]').getAttribute("content");
  const img = await request.get(new URL(og!).pathname + new URL(og!).search);
  expect(img.headers()["content-type"]).toBe("image/png");
  const types = (await page.locator('script[type="application/ld+json"]').allTextContents()).flatMap((t) => [].concat(JSON.parse(t)).map((x: { "@type": string }) => x["@type"]));
  expect(types).toEqual(expect.arrayContaining(["Organization", "WebSite", "Service", "BreadcrumbList", "FAQPage"]));
});
