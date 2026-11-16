"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type CSSProperties, useEffect, useRef } from "react";
import Image from "next/image";
import { Chars } from "@/components/motion/SplitText";
import { Button } from "@/components/ui/Button";
import { engine, onEngine } from "@/lib/engine";
import { setMenu } from "@/lib/menu";
import { panoSVG } from "@/lib/pano";
import { ROUTES, ROUTE_ORDER, contactHref, routeByPath, site } from "@/content/site";

// Menu portal (ANIMATION-SPEC G6): cornflower circle from the burger, three turning rings,
// huge rolling links, a live preview card per page on desktop.

const PANO = panoSVG();

function visorSVG() {
  let s = '<svg viewBox="0 0 400 230" aria-hidden="true"><defs><clipPath id="pvWin"><rect x="44" y="58" width="312" height="114" rx="57"/></clipPath></defs>';
  s += '<rect x="12" y="26" width="376" height="178" rx="89" fill="#050505"/><rect x="44" y="58" width="312" height="114" rx="57" fill="#548CFF"/><g clip-path="url(#pvWin)">';
  for (let r = 0; r < 5; r++) for (let c = 0; c < 15; c++) s += `<circle class="dot" style="--d:${c + r}" cx="${58 + c * 20.5}" cy="${72 + r * 21.5}" r="3.4" fill="#fff"/>`;
  return s + "</g></svg>";
}
const VISOR = visorSVG();

function Previews() {
  return (
    <>
      <div className="pv pv-home"><div className="pv-in"><p>Make reality more immersive.</p><div className="pv-visor" dangerouslySetInnerHTML={{ __html: VISOR }} /></div></div>
      <div className="pv pv-rental"><div className="pv-in"><Image src="/images/quest3.png" alt="" width={537} height={402} sizes="300px" /><p><b>200+</b><span>headsets, ready to deploy</span></p></div></div>
      <div className="pv pv-img"><Image src="/images/event.jpg" alt="" fill sizes="30vw" /></div>
      <div className="pv pv-pano"><div className="pv-track" dangerouslySetInnerHTML={{ __html: PANO + PANO }} /><span className="pv-deg">360°</span></div>
      <div className="pv pv-img"><Image src="/images/realestate.jpg" alt="" fill sizes="30vw" /></div>
      <div className="pv pv-hub">
        <div className="pv-in">
          <small><span>Gallery A</span><span>8 headsets</span></small>
          <div className="pv-tiles">{Array.from({ length: 8 }, (_, i) => <i key={i} style={{ "--i": i } as CSSProperties} />)}</div>
          <p className="pv-now">Campus tour<span>360° video, synced to every headset</span></p>
          <span className="pv-bar"><b /></span>
          <span className="pv-play">Playing on 8 headsets</span>
        </div>
      </div>
      <div className="pv pv-contact"><div className="pv-in"><p>Let&apos;s talk<em>.</em></p><span>{site.email}</span></div></div>
    </>
  );
}

export function Menu() {
  const ref = useRef<HTMLElement>(null);
  const pathname = usePathname();
  const cur = Math.max(0, ROUTE_ORDER.indexOf(routeByPath(pathname) ?? "home"));
  const st = useRef({ pv: -1, cur });
  useEffect(() => {
    st.current.cur = cur;
  }, [cur]);

  useEffect(() => {
    const menu = ref.current!;
    const pvs = [...menu.querySelectorAll<HTMLElement>(".pv")];
    const pvBox = menu.querySelector<HTMLElement>(".menu-pv")!;
    const show = (i: number, instant = false) => {
      if (i === st.current.pv || !pvs[i]) return;
      pvs.forEach((p, k) => {
        if (k === i) {
          p.classList.add("snap");
          p.classList.remove("on", "off");
          void p.offsetWidth;
          if (!instant) p.classList.remove("snap");
          p.classList.add("on");
          if (instant) requestAnimationFrame(() => p.classList.remove("snap"));
        } else if (instant) p.classList.remove("on", "off");
        else if (p.classList.contains("on")) {
          p.classList.remove("on");
          p.classList.add("off");
        }
      });
      st.current.pv = i;
    };
    const links = [...menu.querySelectorAll<HTMLElement>(".m-link")];
    const offs = links.map((a, i) => {
      const f = () => show(i);
      a.addEventListener("pointerenter", f);
      a.addEventListener("focus", f);
      return () => {
        a.removeEventListener("pointerenter", f);
        a.removeEventListener("focus", f);
      };
    });
    const list = menu.querySelector(".menu-links")!;
    const leave = () => show(st.current.cur);
    list.addEventListener("pointerleave", leave);
    const move = (e: PointerEvent) => {
      const x = e.clientX / innerWidth - 0.5, y = e.clientY / innerHeight - 0.5;
      pvBox.style.translate = `${(x * 22).toFixed(1)}px ${(y * 22).toFixed(1)}px`;
    };
    if (engine.FINE && !engine.RM) menu.addEventListener("pointermove", move);
    let was = false;
    const offE = onEngine(() => {
      if (engine.menuOpen && !was) {
        st.current.pv = -1;
        show(st.current.cur, true);
      }
      was = engine.menuOpen;
    });
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && engine.menuOpen) setMenu(false);
    };
    addEventListener("keydown", esc);
    return () => {
      offs.forEach((o) => o());
      list.removeEventListener("pointerleave", leave);
      menu.removeEventListener("pointermove", move);
      removeEventListener("keydown", esc);
      offE();
    };
  }, []);

  return (
    <nav className="menu" aria-label="Main" ref={ref}>
      <span className="menu-ring r1" />
      <span className="menu-ring r2" />
      <span className="menu-ring r3" />
      <div className="menu-grid">
        <div className="menu-links">
          {ROUTE_ORDER.map((k, i) => (
            <Link
              key={k}
              className={`m-link${i === cur ? " current" : ""}`}
              href={ROUTES[k].href}
              style={{ "--li": i } as CSSProperties}
              aria-label={`${ROUTES[k].title}, ${ROUTES[k].menu}`}
              aria-current={i === cur ? "page" : undefined}
            >
              <span className="m-roll" aria-hidden="true">
                <span className="m-a"><Chars text={ROUTES[k].title} /></span>
                <span className="m-b"><Chars text={ROUTES[k].title} /></span>
              </span>
              <small aria-hidden="true">{ROUTES[k].menu}</small>
            </Link>
          ))}
        </div>
        <div className="menu-pv" aria-hidden="true">
          <Previews />
        </div>
      </div>
      <div className="menu-foot">
        <Button href={contactHref("Not sure yet")} label="Get a quote" variant="ink" />
        {site.email && <span>{site.email}</span>}
        <span className="mf-tag">{site.tagline}</span>
      </div>
    </nav>
  );
}
