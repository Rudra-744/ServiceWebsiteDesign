import Link from "next/link";
import type { CSSProperties } from "react";
import { FooterCurtain } from "./FooterCurtain";
import { LOGO, LOGO_MARK, LogoMark } from "./IconSprite";
import { ToTop } from "./ToTop";
import { ROUTES, contactHref, site } from "@/content/site";

const WORD = ["C", "y", "p", "h", "o"];
const H = "m-0 mb-[14px] text-[14px] font-[560] text-[#8a8a92]";
const UL = "m-0 grid list-none gap-2 p-0 [&_a]:transition-colors [&_a]:duration-300 [&_a:hover]:text-blue";
// the giant word rises (spring, 60 ms apart) once the curtain is mostly open (`.in` on the footer)
const LETTER = "inline-block motion:[transform:translateY(100%)] motion:[transition:transform_1.1s_var(--e-spring)_calc(var(--i)*60ms)] motion:group-[.in]/foot:[transform:none]";

export function Footer() {
  return (
    <FooterCurtain>
      <div className="grid grid-cols-2 gap-9 min-[960px]:grid-cols-[2fr_1fr_1fr_1fr]">
        <div className="col-span-full min-[960px]:col-auto">
          <Link href="/" className={`${LOGO} mb-4`}>
            <LogoMark className={LOGO_MARK} />
            Cyphon
          </Link>
          <p className="m-0 max-w-[24em] text-[#a0a0a8]">{site.about}</p>
        </div>
        <div>
          <h2 className={H}>Services</h2>
          <ul className={UL}>
            {(["rental", "events", "video", "real-estate"] as const).map((k) => (
              <li key={k}>
                <Link href={ROUTES[k].href}>{ROUTES[k].title}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className={H}>Software</h2>
          <ul className={UL}>
            <li>
              <Link href={ROUTES["vr-hub"].href}>VR HUB</Link>
            </li>
            <li>
              <Link href={contactHref("VR HUB")}>Request access</Link>
            </li>
          </ul>
        </div>
        <div>
          <h2 className={H}>Company</h2>
          <ul className={UL}>
            <li>
              <Link href={ROUTES.contact.href}>Contact</Link>
            </li>
            {site.email && (
              <li>
                <a href={`mailto:${site.email}`}>{site.email}</a>
              </li>
            )}
            <li>
              <Link href="/privacy">Privacy</Link>
            </li>
            <li>
              <Link href="/terms">Terms</Link>
            </li>
          </ul>
        </div>
      </div>
      <div
        className="mt-[clamp(40px,6vw,80px)] flex justify-between overflow-hidden pb-[.04em] text-[length:clamp(70px,21.5vw,380px)] leading-[.78] font-[720] tracking-[-0.06em] [font-stretch:125%]"
        aria-hidden="true"
      >
        {WORD.map((c, i) => (
          <span key={i} className={LETTER} style={{ "--i": i } as CSSProperties}>
            {c}
          </span>
        ))}
        <span className={LETTER} style={{ "--i": 5 } as CSSProperties}>
          n<b className="text-blue">.</b>
        </span>
      </div>
      <div className="mt-[22px] flex flex-wrap justify-between gap-3 border-t border-[#232327] pt-[18px] text-[14px] text-[#8a8a92]">
        <span>
          © {new Date().getFullYear()} Cyphon. {site.tagline}.
        </span>
        <ToTop />
      </div>
    </FooterCurtain>
  );
}
