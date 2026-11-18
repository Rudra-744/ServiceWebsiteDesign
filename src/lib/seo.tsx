import type { Metadata } from "next";
import { FAQS, type FaqItem } from "@/content/faqs";
import { INTRO } from "@/content/pages";
import { ROUTES, type RouteKey, site } from "@/content/site";

// Page metadata and JSON-LD. Copy comes from the page content (INTRO, FAQS), so search snippets match the page.
// Business facts the client has not sent yet (address, phone, social profiles) are left out, never invented.

/** `description` defaults to the page lede (Home passes the site description: its lede is one hero occasion) */
export function pageMetadata(key: RouteKey, title: string, description = INTRO[key].lede): Metadata {
  const { href } = ROUTES[key];
  return {
    title,
    description,
    alternates: { canonical: href },
    openGraph: { title: `${title} — ${site.name}`, description, url: href, siteName: site.name, type: "website", locale: "en_IN" },
    twitter: { card: "summary_large_image", title: `${title} — ${site.name}`, description },
  };
}

type Json = Record<string, unknown>;
const abs = (path: string) => new URL(path, site.url).toString();

export const organization = (): Json => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": abs("/#organization"),
  name: site.name,
  url: abs("/"),
  logo: abs("/icon.svg"),
  description: site.about,
  ...(site.email ? { email: site.email } : {}), // TODO(client): address, phone and profiles once confirmed
});

export const website = (): Json => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": abs("/#website"),
  name: site.name,
  url: abs("/"),
  publisher: { "@id": abs("/#organization") },
});

/** a service page: Service (or SoftwareApplication for VR HUB), its FAQ and the breadcrumb */
export function pageGraph(key: RouteKey, name: string, kind: "Service" | "SoftwareApplication" = "Service"): Json[] {
  const url = abs(ROUTES[key].href), description = INTRO[key].lede;
  const main: Json =
    kind === "Service"
      ? { "@context": "https://schema.org", "@type": "Service", name, description, url, serviceType: name, provider: { "@id": abs("/#organization") }, areaServed: "IN" }
      : { "@context": "https://schema.org", "@type": "SoftwareApplication", name, description, url, applicationCategory: "BusinessApplication", operatingSystem: "Web, Meta Quest, PICO", publisher: { "@id": abs("/#organization") } };
  const out = [main, breadcrumb(key)];
  const faq = FAQS[key];
  if (faq) out.push(faqPage(faq));
  return out;
}

export const faqPage = (items: FaqItem[]): Json => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: items.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
});

export const breadcrumb = (key: RouteKey): Json => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: abs("/") },
    { "@type": "ListItem", position: 2, name: ROUTES[key].title, item: abs(ROUTES[key].href) },
  ],
});

/** JSON-LD script; `<` is escaped so page text can never close the script tag */
export function JsonLd({ data }: { data: Json | Json[] }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
