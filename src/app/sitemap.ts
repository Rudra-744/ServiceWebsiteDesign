import type { MetadataRoute } from "next";
import { ROUTES, ROUTE_ORDER, site } from "@/content/site";

// Every public page (privacy and terms are noindex until the client sends the real texts).
export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTE_ORDER.map((k) => ({
    url: new URL(ROUTES[k].href, site.url).toString(),
    changeFrequency: "monthly",
    priority: k === "home" ? 1 : k === "contact" ? 0.6 : 0.8,
  }));
}
