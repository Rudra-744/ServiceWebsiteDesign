"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { LOGO, LOGO_MARK, LogoMark } from "./IconSprite";
import { addMeasure, engine, onEngine } from "@/lib/engine";
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
    const y = engine.y;
    if (y === s.lastY && !s.needs) return;
    s.lastY = y;
    s.needs = false;
    const dy = y - s.navY;
    if (y > 160 && dy > 3 && !engine.menuOpen) nav.classList.add("hide");
    else if (dy < -3 || y < 160) nav.classList.remove("hide");
    nav.classList.toggle("compact", y > 120);
    s.navY = y;
    const m = engine.maxY, p = m > 0 ? clamp(y / m) : 0;
    nav.querySelector<SVGCircleElement>(".b-ring circle")!.style.strokeDashoffset = (132 * (1 - p)).toFixed(2);
    nav.querySelector<SVGPathElement>(".logo svg path")!.style.transform = `rotate(${((y * 0.14) % 360).toFixed(1)}deg)`;
    let l = s.secs.length ? s.secs[0].l : "";
    for (const sec of s.secs) if (sec.t - y < engine.vh * 0.45) l = sec.l;
    s.label = l;
    if (!engine.menuOpen) setNow(l);
  });

  return (
    <header
      ref={navRef}
      className="nav fixed top-3 right-3 left-3 z-60 flex h-(--nav-h) items-center justify-between rounded-full bg-white pr-2 pl-4 shadow-[0_0_0_1px_var(--color-line)] [transition:transform_.7s_var(--e-out),left_.9s_var(--e-io),right_.9s_var(--e-io),box-shadow_.6s] preloading:[transform:translateY(calc(-100%_-_20px))] [&.hide]:[transform:translateY(calc(-100%_-_20px))] min-[900px]:[&.compact]:right-[max(12px,calc(50%_-_390px))] min-[900px]:[&.compact]:left-[max(12px,calc(50%_-_390px))]"
    >
      <Link href="/" className={LOGO} aria-label="Cyphon home">
        <LogoMark className={LOGO_MARK} />
        Cyphon
      </Link>
      <span
        className="nav-now pointer-events-none absolute top-1/2 left-1/2 flex h-8 -translate-x-1/2 -translate-y-1/2 items-center gap-[9px] rounded-full bg-card pr-[14px] pl-3 text-[13.5px] font-[560] tracking-[-0.005em] text-ink [font-stretch:108%] before:size-[7px] before:flex-none before:animate-[nowPing_2.4s_var(--e-out)_infinite] before:rounded-full before:bg-blue before:content-[''] max-[900px]:right-[60px] max-[900px]:left-auto max-[900px]:translate-x-0 min-[521px]:max-[900px]:right-[196px] max-[360px]:hidden"
        aria-hidden="true"
      >
        {/* JS rewrites the two spans' className (nn / on / out / reset), so they are styled from here */}
        <span className="nn-box relative block h-[1.3em] overflow-hidden [transition:width_.6s_var(--e-out)] [&_.nn]:absolute [&_.nn]:top-0 [&_.nn]:left-0 [&_.nn]:leading-[1.3] [&_.nn]:[font-weight:inherit] [&_.nn]:whitespace-nowrap [&_.nn_i]:inline-block [&_.nn_i]:whitespace-pre [&_.nn_i]:not-italic [&_.nn_i]:[transform:translateY(110%)] [&_.nn_i]:[transition:transform_.6s_var(--e-out)_calc(var(--ci)*16ms)] [&_.nn.on_i]:[transform:none] [&_.nn.out_i]:[transform:translateY(-110%)] [&_.nn.reset_i]:transition-none rm:[&_.nn_i]:duration-[.01ms] rm:[&_.nn_i]:delay-0">
          <b className="nn on" />
          <b className="nn" />
        </span>
      </span>
      <div className="flex items-center gap-2">
        <Button href={contactHref("Not sure yet")} label="Get a quote" variant="blue" size="sm" className="btn-quote max-[521px]:hidden" />
        <button
          className="burger group/bg relative isolate grid size-11 place-items-center overflow-hidden rounded-full shadow-[inset_0_0_0_1px_var(--color-line)] before:absolute before:inset-0 before:-z-10 before:scale-0 before:rounded-full before:bg-blue before:[transition:scale_.5s_var(--e-out)] before:content-[''] hover:before:scale-100"
          aria-label="Open menu"
          aria-expanded="false"
          onClick={() => setMenu(!engine.menuOpen)}
        >
          <svg className="b-ring pointer-events-none absolute inset-0 size-full -rotate-90" viewBox="0 0 44 44" aria-hidden="true">
            <circle cx="22" cy="22" r="21" className="fill-none stroke-blue [stroke-dasharray:132] [stroke-dashoffset:132] [stroke-linecap:round] [stroke-width:2.2]" />
          </svg>
          <i className="absolute right-[14px] left-[14px] h-[1.6px] bg-current [transform:translateY(-4px)] [transition:transform_.6s_var(--e-out),left_.5s_var(--e-out)] menu-open:[transform:rotate(45deg)]" />
          <i className="absolute right-[14px] left-[21px] h-[1.6px] bg-current [transform:translateY(4px)] [transition:transform_.6s_var(--e-out),left_.5s_var(--e-out)] group-hover/bg:left-[14px] menu-open:left-[14px] menu-open:[transform:rotate(-45deg)]" />
        </button>
      </div>
    </header>
  );
}
