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

// preview cards: `pv group/pv`; JS toggles .on / .off / .snap with classList
const PV = "pv group/pv absolute inset-0 overflow-hidden [clip-path:inset(100%_0_0_0)] [transition:clip-path_.8s_var(--e-io)] [&.on]:z-2 [&.on]:[clip-path:inset(0_0_0_0)] [&.off]:z-1 [&.off]:[clip-path:inset(0_0_100%_0)] [&.snap]:transition-none";
const PV_IN = "relative flex h-full flex-col justify-between gap-5 p-[30px]";
const PV_P = "m-0 max-w-[10ch] text-[length:clamp(26px,2.3vw,36px)] leading-[1.02] font-[650] tracking-[-0.03em] [font-stretch:118%]";
const PV_IMG = "block size-full scale-[1.2] object-cover [transition:scale_1.4s_var(--e-out)] group-[.on]/pv:scale-100";
const PANO_SVG = "[&_svg]:h-full [&_svg]:w-auto [&_svg]:max-w-none [&_svg]:flex-none";

function visorSVG() {
  let s = '<svg viewBox="0 0 400 230" aria-hidden="true" class="block h-auto w-full"><defs><clipPath id="pvWin"><rect x="44" y="58" width="312" height="114" rx="57"/></clipPath></defs>';
  s += '<rect x="12" y="26" width="376" height="178" rx="89" fill="#050505"/><rect x="44" y="58" width="312" height="114" rx="57" fill="#548CFF"/><g clip-path="url(#pvWin)">';
  for (let r = 0; r < 5; r++)
    for (let c = 0; c < 15; c++) s += `<circle class="[animation:pvWave_2.6s_ease-in-out_calc(var(--d)*90ms)_infinite]" style="--d:${c + r}" cx="${58 + c * 20.5}" cy="${72 + r * 21.5}" r="3.4" fill="#fff"/>`;
  return s + "</g></svg>";
}
const VISOR = visorSVG();

function Previews() {
  return (
    <>
      <div className={PV}>
        <div className={PV_IN}>
          <p className={PV_P}>Make reality more immersive.</p>
          <div dangerouslySetInnerHTML={{ __html: VISOR }} />
        </div>
      </div>
      <div className={PV}>
        <div className={`${PV_IN} justify-end bg-card`}>
          <Image className="absolute top-[12%] left-[8%] h-auto w-[84%] scale-90 animate-[pvFloat_5s_ease-in-out_infinite] object-contain [transition:scale_1.4s_var(--e-out)] group-[.on]/pv:scale-100" src="/images/quest3.png" alt="" width={537} height={402} sizes="300px" />
          <p className="relative m-0 grid gap-1">
            <b className="text-[length:clamp(64px,6vw,96px)] leading-[.9] font-bold tracking-[-0.05em] [font-stretch:120%]">200+</b>
            <span className="text-[15px] text-stone">headsets, ready to deploy</span>
          </p>
        </div>
      </div>
      <div className={PV}>
        <Image className={PV_IMG} src="/images/event.jpg" alt="" fill sizes="30vw" />
      </div>
      <div className={`${PV} bg-card`}>
        <div className={`absolute top-0 bottom-0 left-0 flex animate-[pvPan_34s_linear_infinite] ${PANO_SVG}`} dangerouslySetInnerHTML={{ __html: PANO + PANO }} />
        <span className="absolute bottom-5 left-5 rounded-full bg-ink px-[14px] py-2 text-[14px] font-semibold text-white">360°</span>
      </div>
      <div className={PV}>
        <Image className={PV_IMG} src="/images/realestate.jpg" alt="" fill sizes="30vw" />
      </div>
      <div className={PV}>
        <div className={`${PV_IN} justify-start`}>
          <small className="flex justify-between text-[14px] font-semibold text-stone">
            <span>Gallery A</span>
            <span>8 headsets</span>
          </small>
          <div className="mt-[10px] grid grid-cols-4 gap-2">
            {Array.from({ length: 8 }, (_, i) => (
              <i
                key={i}
                style={{ "--i": i } as CSSProperties}
                className="relative grid aspect-[4/5] place-items-center rounded-[12px] bg-card [animation:pvTile_4.2s_var(--e-out)_calc(var(--i)*.16s)_infinite] before:box-border before:aspect-[2/1] before:w-[66%] before:rounded-full before:border-4 before:border-ink before:bg-white before:[animation:pvWin_4.2s_var(--e-out)_calc(var(--i)*.16s)_infinite] before:content-['']"
              />
            ))}
          </div>
          <p className="mt-auto mb-3 grid gap-1 text-[length:clamp(22px,1.9vw,28px)] leading-[1.05] font-[650] tracking-[-0.025em] [font-stretch:116%]">
            Campus tour
            <span className="text-[14px] font-medium tracking-normal text-stone [font-stretch:100%]">360° video, synced to every headset</span>
          </p>
          <span className="block h-[6px] overflow-hidden rounded-[9px] bg-card">
            <b className="block h-full origin-left animate-[pvBar_4.2s_linear_infinite] bg-blue" />
          </span>
          <span className="mt-[14px] self-start rounded-full bg-ink px-[15px] py-[9px] text-[14px] font-semibold text-white">Playing on 8 headsets</span>
        </div>
      </div>
      <div className={PV}>
        <div className={PV_IN}>
          <p className={PV_P}>
            Let&apos;s talk<em className="animate-[blink_1.1s_steps(1)_infinite] text-blue not-italic">.</em>
          </p>
          <span className="text-[17px] font-semibold">{site.email}</span>
        </div>
      </div>
    </>
  );
}

const RING =
  "menu-ring pointer-events-none absolute top-[var(--my,42px)] left-[var(--mx,95%)] -translate-x-1/2 -translate-y-1/2 scale-[.15] rounded-full border-[1.5px] opacity-0 will-change-[scale,rotate] [transition:scale_1.5s_var(--e-out),opacity_.5s] menu-open:scale-100 menu-open:opacity-100 rm:duration-[.01ms]! after:absolute after:left-1/2 after:-ml-[5.5px] after:size-[11px] after:rounded-full after:content-['']";
const LETTERS = "[&_i]:inline-block [&_i]:whitespace-pre [&_i]:not-italic [&_i]:[transform:translateY(118%)] rm:[&_i]:duration-[.01ms]! rm:[&_i]:delay-0!";
const LINK =
  "m-link group/ml relative flex items-baseline gap-5 pl-[34px] text-[length:clamp(38px,min(5.6vw,8vh),86px)] leading-none font-[640] tracking-[-0.035em] transition-opacity duration-[.45s] [font-stretch:116%] before:absolute before:top-1/2 before:left-1 before:-mt-[6px] before:size-3 before:rounded-full before:bg-ink before:[transition:scale_.5s_var(--e-out)] before:content-[''] m-touch:mb-[10px] m-touch:flex-col m-touch:items-start m-touch:gap-1 m-touch:pl-6 m-touch:before:top-[calc(.5em+.07em)] m-touch:before:left-[2px] m-touch:before:-mt-[4.5px] m-touch:before:size-[9px] [@media(max-height:700px)_and_(max-width:999px)]:mb-[6px] [@media(max-height:700px)_and_(max-width:999px)]:text-[34px]";

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
    <nav
      ref={ref}
      aria-label="Main"
      className="menu invisible fixed inset-0 z-55 flex flex-col justify-between gap-5 overflow-hidden bg-blue px-(--pad) pt-[calc(var(--nav-h)+44px)] pb-[26px] text-ink will-change-[clip-path] [clip-path:circle(0px_at_var(--mx,95%)_var(--my,42px))] [transition:clip-path_.85s_var(--e-io),visibility_0s_.85s] max-[641px]:pt-[calc(var(--nav-h)+34px)] menu-open:visible menu-open:[clip-path:circle(var(--mr,150vmax)_at_var(--mx,95%)_var(--my,42px))] menu-open:[transition:clip-path_1.05s_var(--e-io),visibility_0s] rm:duration-[.01ms]!"
    >
      <span className={`${RING} size-[44vmax] animate-[mRing_70s_linear_infinite] border-dashed border-[rgba(5,5,5,.24)] after:-top-[6px] after:bg-ink`} />
      <span className={`${RING} size-[84vmax] animate-[mRing_110s_linear_infinite_reverse] border-solid border-[rgba(5,5,5,.1)] after:hidden menu-open:delay-[.08s]`} />
      <span className={`${RING} size-[130vmax] animate-[mRing_150s_linear_infinite] border-dashed border-[rgba(5,5,5,.24)] after:-bottom-[6px] after:bg-white menu-open:delay-[.16s]`} />
      <div className="relative grid min-h-0 flex-1 items-center min-[1000px]:grid-cols-[1fr_minmax(300px,30vw)] min-[1000px]:gap-[5vw] m-touch:items-start m-touch:pt-[2vh]">
        <div className="menu-links flex flex-col items-start [@media(hover:hover)]:menu-ready:[&:hover_.m-link:not(:hover)]:opacity-40">
          {ROUTE_ORDER.map((k, i) => (
            <Link
              key={k}
              href={ROUTES[k].href}
              style={{ "--li": i } as CSSProperties}
              aria-label={`${ROUTES[k].title}, ${ROUTES[k].menu}`}
              aria-current={i === cur ? "page" : undefined}
              className={`${LINK} ${i === cur ? "current before:scale-100" : "before:scale-0 hover:before:scale-[.55]"}`}
            >
              <span className="relative block overflow-hidden pt-[.07em] pb-[.1em]" aria-hidden="true">
                <span
                  className={`block whitespace-nowrap ${LETTERS} [&_i]:[transition:transform_.7s_cubic-bezier(.5,0,.75,0)] menu-open:[&_i]:[transform:none] menu-open:[&_i]:[transition:transform_1s_var(--e-out)_calc(.34s_+_var(--li)*60ms_+_var(--ci)*18ms)] menu-ready:[&_i]:[transition:transform_.6s_var(--e-out)_calc(var(--ci)*14ms)] menu-ready:group-hover/ml:[&_i]:[transform:translateY(-118%)] menu-ready:group-focus-visible/ml:[&_i]:[transform:translateY(-118%)]`}
                >
                  <Chars text={ROUTES[k].title} />
                </span>
                <span
                  className={`absolute top-[.07em] left-0 block whitespace-nowrap text-white ${LETTERS} [&_i]:[transition:transform_.6s_var(--e-out)_calc(var(--ci)*14ms)] menu-ready:group-hover/ml:[&_i]:[transform:none] menu-ready:group-focus-visible/ml:[&_i]:[transform:none]`}
                >
                  <Chars text={ROUTES[k].title} />
                </span>
              </span>
              <small
                aria-hidden="true"
                className="-translate-x-[14px] text-[15px] leading-[1.3] font-[520] tracking-normal whitespace-nowrap opacity-0 [font-stretch:100%] [transition:opacity_.4s,translate_.6s_var(--e-out)] group-hover/ml:translate-x-0 group-hover/ml:opacity-100 group-focus-visible/ml:translate-x-0 group-focus-visible/ml:opacity-100 m-touch:translate-x-0 m-touch:text-[13.5px] menu-open:m-touch:opacity-85 menu-open:m-touch:[transition:opacity_.6s_calc(.6s_+_var(--li)*60ms)]"
              >
                {ROUTES[k].menu}
              </small>
            </Link>
          ))}
        </div>
        <div
          aria-hidden="true"
          className="menu-pv relative aspect-[4/5] w-[min(100%,calc((100svh_-_var(--nav-h)_-_200px)*.8))] scale-[.72] -rotate-6 justify-self-end overflow-hidden rounded-[28px] bg-white opacity-0 shadow-[0_0_0_1px_rgba(5,5,5,.08)] will-change-[scale,rotate,opacity] [transition:scale_.6s_var(--e-out),rotate_.6s_var(--e-out),opacity_.35s] m-touch:hidden menu-open:scale-100 menu-open:rotate-0 menu-open:opacity-100 menu-open:[transition:scale_1.1s_var(--e-out)_.42s,rotate_1.1s_var(--e-out)_.42s,opacity_.5s_.42s,translate_.9s_var(--e-out)] rm:duration-[.01ms]!"
        >
          <Previews />
        </div>
      </div>
      <div className="relative flex translate-y-4 flex-wrap items-center gap-x-[26px] gap-y-3 text-[15px] opacity-0 [transition:opacity_.3s,translate_.5s_var(--e-out)] menu-open:translate-y-0 menu-open:opacity-100 menu-open:[transition:opacity_.5s_.8s,translate_.8s_var(--e-out)_.8s] rm:duration-[.01ms]!">
        <Button href={contactHref("Not sure yet")} label="Get a quote" variant="ink" style={{ "--fill": "#fff" } as CSSProperties} />
        {site.email && <span>{site.email}</span>}
        <span className="ml-auto max-[641px]:hidden">{site.tagline}</span>
      </div>
    </nav>
  );
}
