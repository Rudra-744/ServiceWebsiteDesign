"use client";
import { type CSSProperties, useEffect, useRef } from "react";
import { SplitText } from "@/components/motion/SplitText";
import { Button } from "@/components/ui/Button";
import { ALL_OCCASIONS, ROLL_WORDS } from "@/content/events";
import { contactHref } from "@/content/site";
import { engine } from "@/lib/engine";
import { clamp } from "@/lib/motion";
import { scrollToY } from "@/lib/scroll";
import { useScrollScene } from "@/hooks/useScrollScene";
import { Crumb } from "@/sections/shared/PageIntro";

// Events hero (ANIMATION-SPEC E1): cornflower stage with a rolling "Perfect for ___" word and a deck of the ten
// occasions that shuffles every 2.6 s while visible. Scroll spreads the deck; the pointer leans it.
const POS = [[0, 0, 0, 1], [7, 5, 4, 0.95], [-8, -7, 8, 0.9], [4, 2, 12, 0.85]];
const POP = "absolute z-3 motion:opacity-0 motion:[transform:translate3d(0,14px,0)] motion:[transition:opacity_.6s_var(--e-out)_1.1s,transform_.9s_var(--e-spring)_1.1s] in:opacity-100 in:[transform:none]";

export function EventsHero() {
  const stage = useRef<HTMLDivElement>(null);
  const S = useRef({ top: 0, spread: 0, mx: 0, my: 0, leaving: -1, place: () => {} });

  useEffect(() => {
    const st = S.current, el = stage.current!, cards = [...el.querySelectorAll<HTMLElement>(".eh-card")], box = el.querySelector<HTMLElement>(".eh-word")!;
    const n = cards.length;
    st.place = () =>
      cards.forEach((c, i) => {
        const k = (i - st.top + n) % n;
        if (i === st.leaving) {
          c.style.zIndex = "20";
          c.style.opacity = "0";
          c.style.transform = "translate(-50%,-50%) translate3d(-120%,-12%,0) rotate(-22deg)";
          return;
        }
        const p = POS[Math.min(k, 3)], f = 1 + st.spread * 1.6;
        c.style.zIndex = String(10 - k);
        c.style.opacity = k > 3 ? "0" : "1";
        c.style.transform = `translate(-50%,-50%) translate3d(${(p[0] * f * 2.4 + st.mx * (14 - k * 4)).toFixed(1)}px,${(p[2] * f * 1.4 + st.my * (10 - k * 3) - st.spread * 40).toFixed(1)}px,0) rotate(${(p[1] * f + (k === 0 ? st.mx * 3 : 0)).toFixed(2)}deg) scale(${p[3]})`;
      });
    st.place();
    if (engine.RM) return;

    const timers = new Set<number>();
    const later = (fn: () => void, ms: number) => {
      const t = window.setTimeout(() => (timers.delete(t), fn()), ms);
      timers.add(t);
    };
    const setWord = (i: number) => {
      const old = box.firstElementChild, nw = document.createElement("span");
      nw.className = WORD + " animate-[ehIn_.55s_var(--e-out)]";
      nw.textContent = ROLL_WORDS[i];
      old?.classList.add("animate-[ehOut_.4s_var(--e-io)_forwards]");
      later(() => box.replaceChildren(nw), 360);
    };
    const next = () => {
      if (document.hidden) return;
      st.leaving = st.top;
      st.place();
      later(() => {
        st.leaving = -1;
        st.top = (st.top + 1) % n;
        st.place();
      }, 520);
      setWord((st.top + 1) % n);
    };
    let iv = 0;
    const io = new IntersectionObserver((es) =>
      es.forEach((e) => {
        clearInterval(iv);
        if (e.isIntersecting) iv = window.setInterval(next, 2600);
      }),
    );
    io.observe(el);
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      st.mx = (e.clientX - r.left) / r.width - 0.5;
      st.my = (e.clientY - r.top) / r.height - 0.5;
      st.place();
    };
    const leave = () => {
      st.mx = st.my = 0;
      st.place();
    };
    if (engine.FINE) {
      el.addEventListener("pointermove", move);
      el.addEventListener("pointerleave", leave);
    }
    return () => {
      io.disconnect();
      clearInterval(iv);
      timers.forEach(clearTimeout);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    };
  }, []);

  useScrollScene(
    stage,
    () => {
      if (engine.RM) return;
      S.current.spread = clamp(scrollY / engine.vh);
      S.current.place();
    },
    { type: "view", start: 1, end: 0 },
  );

  const toExplorer = () => {
    const eo = document.querySelector<HTMLElement>("#occasions");
    if (eo) scrollToY(eo.getBoundingClientRect().top + scrollY - 20);
  };

  return (
    <header data-nav="VR events" className="wrap grid gap-[clamp(36px,5vw,72px)] pt-[calc(var(--nav-h)+clamp(48px,7vw,110px))] pb-[clamp(24px,4vw,64px)] min-[1000px]:min-h-svh min-[1000px]:grid-cols-[1.05fr_.95fr] min-[1000px]:items-end min-[1000px]:pb-[clamp(32px,4vw,56px)]">
      <div>
        <Crumb label="VR events & experiences" />
        <SplitText as="h1" className="d1 max-w-[12ch]" text="Make your events more interactive with VR." />
        <div className="mt-[clamp(24px,3vw,40px)] grid gap-[26px]" data-reveal="">
          <p className="lede fade">Bring your audience closer to your brand, products and experiences at corporate functions, educational programmes, celebrations and public events.</p>
          <div className="fade flex flex-wrap gap-3" style={{ "--d": ".3s" } as CSSProperties}>
            <Button href={contactHref("VR event")} label="Plan your VR event" variant="blue" magnetic className="max-[520px]:flex-[1_1_100%]" />
            <Button label="Find your occasion" variant="line" onClick={toExplorer} className="max-[520px]:flex-[1_1_100%]" />
          </div>
        </div>
      </div>
      <div
        ref={stage}
        className="relative isolate aspect-[1/1.02] overflow-hidden rounded-stage bg-blue text-ink motion:[clip-path:inset(100%_0_0_0_round_36px)] motion:[transition:clip-path_1.3s_var(--e-io)_.15s] in:[clip-path:inset(0_0_0_0_round_36px)] min-[1000px]:aspect-auto min-[1000px]:h-[min(76svh,720px)]"
        data-reveal=""
        data-morph-to=""
        aria-hidden="true"
      >
        <p className={`${POP} top-[clamp(16px,2.4vw,28px)] left-[clamp(16px,2.4vw,30px)] m-0 flex items-center gap-[10px] text-[length:clamp(16px,1.3vw,19px)] font-[560] max-[999px]:text-[15px]`}>
          Perfect for{" "}
          <span className="eh-word inline-block h-10 overflow-hidden rounded-full bg-paper px-4 leading-10 font-[620] [transition:width_.5s_var(--e-out)] max-[999px]:h-9 max-[999px]:px-[14px] max-[999px]:leading-9">
            <span className={WORD}>{ROLL_WORDS[0]}</span>
          </span>
        </p>
        <div className="absolute inset-0 z-2 motion:opacity-0 motion:[transform:translate3d(0,40px,0)] motion:[transition:opacity_.8s_var(--e-out)_.7s,transform_1.4s_var(--e-out)_.6s] in:opacity-100 in:[transform:none]">
          {ALL_OCCASIONS.map(([ic, t, d], i) => (
            <figure
              key={t}
              className="eh-card absolute top-[52%] left-1/2 m-0 flex aspect-[3/3.6] w-[min(56%,300px)] flex-col justify-between rounded-card bg-paper p-[clamp(16px,1.8vw,24px)] shadow-[0_24px_50px_-28px_rgba(5,5,5,.45)] will-change-transform [transition:transform_1s_var(--e-out),opacity_.6s_var(--e-out)] max-[999px]:top-[55%] max-[999px]:aspect-[3/3.5] max-[999px]:w-[min(47%,260px)]"
            >
              <div className="flex items-center justify-between">
                <span className="grid size-[clamp(48px,4.4vw,64px)] place-items-center rounded-full bg-blue">
                  <svg className="size-[46%]">
                    <use href={`#${ic}`} />
                  </svg>
                </span>
                <span className="text-[13px] text-muted tabular-nums">{String(i + 1).padStart(2, "0")}</span>
              </div>
              <div>
                <b className="block text-[length:clamp(19px,1.7vw,26px)] leading-[1.08] font-[640] tracking-[-0.02em] [font-stretch:110%]">{t}</b>
                <small className="mt-2 block text-[length:clamp(13px,1vw,14.5px)] leading-[1.35] text-stone max-[999px]:hidden">{d}</small>
              </div>
            </figure>
          ))}
        </div>
        <p className={`${POP} bottom-[clamp(14px,2vw,26px)] left-[clamp(16px,2.4vw,30px)] m-0 flex items-baseline gap-[10px]`}>
          <b className="text-[length:clamp(34px,3.6vw,56px)] leading-none font-[660] tracking-[-0.04em] tabular-nums [font-stretch:118%]">10</b>
          <span className="max-w-[12em] text-[14px] leading-[1.2] font-[540]">kinds of events, from expos to weddings</span>
        </p>
      </div>
    </header>
  );
}

const WORD = "block whitespace-nowrap";
