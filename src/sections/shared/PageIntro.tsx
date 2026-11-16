import Link from "next/link";
import { SplitText } from "@/components/motion/SplitText";
import { Button } from "@/components/ui/Button";
import { INTRO } from "@/content/pages";
import { ROUTES, type RouteKey, contactHref } from "@/content/site";

// Service-page hero: crumb, split headline, lede + CTA. Used until each page's own hero lands (stages 3–4).
export function PageIntro({ page }: { page: RouteKey }) {
  const it = INTRO[page];
  return (
    <header data-nav={it.crumb ?? ROUTES[page].title} className="p-hero wrap" data-morph-to="">
      {it.crumb && (
        <p className="crumb">
          <Link href="/">Home</Link>
          <i />
          {it.crumb}
        </p>
      )}
      <SplitText as="h1" className="d1" text={it.h1} />
      <div className="p-hero-row" data-reveal="">
        <p className="lede fade">{it.lede}</p>
        <Button href={contactHref(it.cta.service)} label={it.cta.label} variant="blue" magnetic className="fade" style={{ ["--d" as string]: ".3s" }} />
      </div>
    </header>
  );
}

export function NextPage({ to }: { to: RouteKey }) {
  return (
    <Link className="next wrap" href={ROUTES[to].href}>
      <small>Next</small>
      <span className="next-t" data-t={ROUTES[to].title}>
        {ROUTES[to].title}
      </span>
    </Link>
  );
}
