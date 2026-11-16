import Link from "next/link";
import type { CSSProperties } from "react";
import { SplitText } from "@/components/motion/SplitText";
import { Button } from "@/components/ui/Button";
import { INTRO } from "@/content/pages";
import { ROUTES, type RouteKey, contactHref } from "@/content/site";

// Service-page hero pieces (crumb, split headline, lede + CTA) and the "Next" page link.
export const P_HERO = "wrap pt-[calc(var(--nav-h)+clamp(72px,10vw,150px))]";
export const P_HERO_ROW = "mt-[clamp(26px,3vw,44px)] grid gap-6 min-[960px]:grid-cols-[1fr_auto] min-[960px]:items-end min-[960px]:gap-[6vw]";

export function Crumb({ label }: { label: string }) {
  return (
    <p className="mb-[22px] flex items-center gap-[10px] text-[14px] text-stone [&_a:hover]:text-ink">
      <Link href="/">Home</Link>
      <i className="h-[1.5px] w-[22px] bg-current opacity-50" />
      {label}
    </p>
  );
}

export function PageIntro({ page }: { page: RouteKey }) {
  const it = INTRO[page];
  return (
    <header data-nav={it.crumb ?? ROUTES[page].title} className={P_HERO} data-morph-to="">
      {it.crumb && <Crumb label={it.crumb} />}
      <SplitText as="h1" className="d1 max-w-[13ch]" text={it.h1} />
      <div className={P_HERO_ROW} data-reveal="">
        <p className="lede fade">{it.lede}</p>
        <Button href={contactHref(it.cta.service)} label={it.cta.label} variant="blue" magnetic className="fade" style={{ "--d": ".3s" } as CSSProperties} />
      </div>
    </header>
  );
}

export function NextPage({ to }: { to: RouteKey }) {
  return (
    <Link className="next group/next wrap block border-t border-line py-[clamp(64px,9vw,140px)]" href={ROUTES[to].href}>
      <small className="mb-3 block text-[15px] text-stone">Next</small>
      <span
        className="relative inline-block text-[length:clamp(44px,8.6vw,150px)] leading-[.92] font-[660] tracking-[-0.045em] text-transparent [-webkit-text-stroke:1.5px_var(--color-ink)] [font-stretch:120%] after:absolute after:inset-0 after:text-blue after:[-webkit-text-stroke:0] after:content-[attr(data-t)] after:[clip-path:inset(0_100%_0_0)] after:[transition:clip-path_.9s_var(--e-io)] group-hover/next:after:[clip-path:inset(0_0_0_0)] [@media(hover:none)]:text-ink [@media(hover:none)]:[-webkit-text-stroke:0]"
        data-t={ROUTES[to].title}
      >
        {ROUTES[to].title}
      </span>
    </Link>
  );
}
