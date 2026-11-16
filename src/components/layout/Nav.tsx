"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { LogoMark } from "./IconSprite";
import { addMeasure, engine, maxY, onEngine } from "@/lib/engine";
import { setMenu } from "@/lib/menu";
import { clamp } from "@/lib/motion";
import { contactHref } from "@/content/site";
import { useTicker } from "@/hooks/useTicker";

// Nav bar (ANIMATION-SPEC G5): pill → centred capsule after 120px, hides on scroll down past 160px,
// rolling "where you are" chip from [data-nav] sections, scroll-progress ring on the burger, turning logo arc.

const esc = (c: string) => (c === "&" ? "&amp;" : c === "<" ? "&lt;" : c);
const charHTML = (t: string) => [...t].map((c, i) => `<i style="--ci:${i}">${esc(c)}</i>`).join("");
/** page tops of the labelled sections on the current page */
const readSecs = () => {
  const main = document.getElementById("main");
  return main ? [...main.querySelectorAll<HTMLElement>("[data-nav]")].map((el) => ({ t: el.getBoundingClientRect().top + scrollY, l: el.dataset.nav! })) : [];
};

export function Nav() {
  const navRef = useRef<HTMLElement>(null);
  const pathname = usePathname();
  const st = useRef({ cur: 0, text: "", label: "", secs: [] as { t: number; l: string }[], navY: 0, lastY: -1, needs: true });

  // rolling chip
  const setNow = (t: string) => {
    const s = st.current, nav = navRef.current;
    if (!nav || !t || t === s.text) return;
    s.text = t;
    const nns = nav.querySelectorAll<HTMLElement>(".nn"), box = nav.querySelector<HTMLElement>(".nn-box")!;
    const a = nns[s.cur], b = nns[1 - s.cur];
    b.className = "nn reset";
    b.innerHTML = charHTML(t);
    void b.offsetWidth;
    b.className = "nn on";
    a.className = "nn out";
    s.cur = 1 - s.cur;
    box.style.width = b.offsetWidth + "px";
  };

  useEffect(() => {
    const nav = navRef.current!;
    const measure = () => {
      st.current.secs = readSecs();
      const nns = nav.querySelectorAll<HTMLElement>(".nn");
      nav.querySelector<HTMLElement>(".nn-box")!.style.width = nns[st.current.cur].offsetWidth + "px";
      st.current.needs = true;
    };
    const off = addMeasure(measure);
    const offE = onEngine(() => setNow(engine.menuOpen ? "Menu" : st.current.label));
    return () => {
      off();
      offE();
    };
  }, []);

  // new page: re-read the labelled sections after it has rendered
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      st.current.secs = readSecs();
      st.current.navY = 0;
      st.current.needs = true;
      navRef.current?.classList.remove("hide");
    });
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  useTicker(() => {
    const s = st.current, nav = navRef.current;
    if (!nav) return;
    const y = scrollY;
    if (y === s.lastY && !s.needs) return;
    s.lastY = y;
    s.needs = false;
    const dy = y - s.navY;
    if (y > 160 && dy > 3 && !engine.menuOpen) nav.classList.add("hide");
    else if (dy < -3 || y < 160) nav.classList.remove("hide");
    nav.classList.toggle("compact", y > 120);
    s.navY = y;
    const m = maxY(), p = m > 0 ? clamp(y / m) : 0;
    nav.querySelector<SVGCircleElement>(".b-ring circle")!.style.strokeDashoffset = (132 * (1 - p)).toFixed(2);
    nav.querySelector<SVGPathElement>(".logo svg path")!.style.transform = `rotate(${((y * 0.14) % 360).toFixed(1)}deg)`;
    let l = s.secs.length ? s.secs[0].l : "";
    for (const sec of s.secs) if (sec.t - y < engine.vh * 0.45) l = sec.l;
    s.label = l;
    if (!engine.menuOpen) setNow(l);
  });

  return (
    <header className="nav" ref={navRef}>
      <Link href="/" className="logo" aria-label="Cyphon home">
        <LogoMark />
        Cyphon
      </Link>
      <span className="nav-now" aria-hidden="true">
        <span className="nn-box">
          <b className="nn on" />
          <b className="nn" />
        </span>
      </span>
      <div className="nav-r">
        <Button href={contactHref("Not sure yet")} label="Get a quote" variant="blue" size="sm" className="btn-quote" />
        <button className="burger" aria-label="Open menu" aria-expanded="false" onClick={() => setMenu(!engine.menuOpen)}>
          <svg className="b-ring" viewBox="0 0 44 44" aria-hidden="true">
            <circle cx="22" cy="22" r="21" />
          </svg>
          <i />
          <i />
        </button>
      </div>
    </header>
  );
}
