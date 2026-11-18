import { FAQS } from "@/content/faqs";
import { INTRO } from "@/content/pages";
import { ROUTES, ROUTE_ORDER, site } from "@/content/site";

// llms.txt (llmstxt.org): a plain-text map of the site for AI assistants, built from the same copy as the pages.
export const dynamic = "force-static";

export function GET() {
  const abs = (p: string) => new URL(p, site.url).toString();
  const pages = ROUTE_ORDER.map((k) => `- [${ROUTES[k].title}](${abs(ROUTES[k].href)}): ${INTRO[k].lede}`).join("\n");
  const faqs = ROUTE_ORDER.flatMap((k) => (FAQS[k] ?? []).map((f) => `- ${ROUTES[k].title}: ${f.q} ${f.a}`)).join("\n");
  const body = `# ${site.name}

> ${site.about} ${site.tagline}.

## Pages

${pages}

## Frequently asked questions

${faqs}
${site.email ? `\n## Contact\n\n- Email: ${site.email}\n- Enquiry form: ${abs("/contact")}\n` : `\n## Contact\n\n- Enquiry form: ${abs("/contact")}\n`}`;
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
