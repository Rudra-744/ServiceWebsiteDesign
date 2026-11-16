import Link from "next/link";
import type { CSSProperties } from "react";
import { FooterCurtain } from "./FooterCurtain";
import { LogoMark } from "./IconSprite";
import { ToTop } from "./ToTop";
import { ROUTES, contactHref, site } from "@/content/site";

const WORD = ["C", "y", "p", "h", "o"];

export function Footer() {
  return (
    <FooterCurtain>
      <div className="foot-grid">
        <div className="foot-about">
          <Link href="/" className="logo" style={{ marginBottom: 16 }}>
            <LogoMark />
            Cyphon
          </Link>
          <p>{site.about}</p>
        </div>
        <div>
          <h2 className="foot-h">Services</h2>
          <ul>
            {(["rental", "events", "video", "real-estate"] as const).map((k) => (
              <li key={k}>
                <Link href={ROUTES[k].href}>{ROUTES[k].title}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="foot-h">Software</h2>
          <ul>
            <li>
              <Link href={ROUTES["vr-hub"].href}>VR HUB</Link>
            </li>
            <li>
              <Link href={contactHref("VR HUB")}>Request access</Link>
            </li>
          </ul>
        </div>
        <div>
          <h2 className="foot-h">Company</h2>
          <ul>
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
      <div className="foot-word" aria-hidden="true">
        {WORD.map((c, i) => (
          <span key={i} style={{ "--i": i } as CSSProperties}>
            {c}
          </span>
        ))}
        <span style={{ "--i": 5 } as CSSProperties}>
          n<b className="fdot">.</b>
        </span>
      </div>
      <div className="foot-base">
        <span>© {new Date().getFullYear()} Cyphon. {site.tagline}.</span>
        <ToTop />
      </div>
    </FooterCurtain>
  );
}
