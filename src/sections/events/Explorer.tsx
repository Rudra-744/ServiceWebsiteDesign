"use client";
import { type CSSProperties, useEffect, useLayoutEffect, useRef, useState } from "react";
import { SplitText } from "@/components/motion/SplitText";
import { Button } from "@/components/ui/Button";
import { EV, IDEAS } from "@/content/events";
import { contactHref } from "@/content/site";
import { addMeasure, engine } from "@/lib/engine";

// Occasion explorer (ANIMATION-SPEC E2): set toggle with a sliding pill, occasion list (phone: chip row),
// panel that fades children down and back staggered 45 ms on change. Desktop auto-play: while the list is
// 25% into view the active row's line fills over 5 s, then the next occasion opens; the first click stops it.
type Set = keyof typeof EV;
const SETS: [Set, string][] = [
  ["corp", "Corporate & institutional"],
  ["ent", "Celebrations"],
];

export function Explorer() {
  const [set, setSet] = useState<Set>("corp");
  const [cur, setCur] = useState(0);
  const [shown, setShown] = useState<[Set, number]>(["corp", 0]);
  const [swap, setSwap] = useState(false);
  const [auto, setAuto] = useState(true);
  const [inView, setInView] = useState(false);
  const tabs = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const swapT = useRef(0);

  // the sliding pill under the selected set button (measured width and left)
  useLayoutEffect(() => {
    const place = () => {
      const t = tabs.current!.querySelector<HTMLElement>("[aria-selected=true]")!, bg = tabs.current!.firstElementChild as HTMLElement;
      bg.style.width = t.offsetWidth + "px";
      bg.style.transform = `translateX(${t.offsetLeft}px)`;
    };
    place();
    return addMeasure(place);
  }, [set]);

  useEffect(() => {
    const io = new IntersectionObserver((es) => es.forEach((e) => setInView(e.isIntersecting && innerWidth >= 1000)), { rootMargin: "0px 0px -25% 0px" });
    io.observe(list.current!);
    return () => {
      io.disconnect();
      clearTimeout(swapT.current);
    };
  }, []);

  const pick = (i: number, s: Set = set, user = false) => {
    if (user) setAuto(false);
    setCur(i);
    const l = list.current!, b = l.children[i] as HTMLElement | undefined;
    if (b && l.scrollWidth > l.clientWidth + 2) l.scrollTo({ left: b.offsetLeft - parseFloat(getComputedStyle(l).paddingLeft), behavior: engine.RM ? "auto" : "smooth" });
    clearTimeout(swapT.current);
    if (engine.RM) return setShown([s, i]);
    setSwap(true);
    swapT.current = window.setTimeout(() => {
      setShown([s, i]);
      setSwap(false);
    }, 230);
  };

  const [ic, title, line] = EV[shown[0]][shown[1]];
  const ideas = IDEAS[title] ?? [];
  const playing = auto && inView && !engine.RM;
  const o = (i: number) => ({ "--o": i }) as CSSProperties;
  return (
    <section id="occasions" data-nav="Occasions" className="wrap sec-tight">
      <div className="mb-[clamp(32px,4vw,56px)] flex flex-wrap items-end justify-between gap-6">
        <SplitText as="h2" className="d2" text="Pick your occasion." />
        <div ref={tabs} className="relative inline-grid grid-flow-col rounded-full bg-card p-[5px]" role="tablist" aria-label="Event type">
          <span className="absolute top-[5px] bottom-[5px] left-0 rounded-full bg-blue [transition:transform_.6s_var(--e-spring),width_.6s_var(--e-spring)]" />
          {SETS.map(([k, label]) => (
            <button
              key={k}
              type="button"
              role="tab"
              aria-selected={k === set}
              onClick={() => {
                if (k === set) return;
                setSet(k);
                setAuto(false);
                pick(0, k);
              }}
              className="relative z-1 h-[46px] rounded-full px-[18px] text-[15px] font-[560] whitespace-nowrap text-stone transition-colors duration-350 aria-selected:text-ink"
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div
        className="grid gap-[18px] motion:opacity-0 motion:[transform:translate3d(0,50px,0)] motion:[transition:opacity_1s_var(--e-out),transform_1.3s_var(--e-out)] in:opacity-100 in:[transform:none] min-[1000px]:grid-cols-[.85fr_1.15fr] min-[1000px]:items-stretch min-[1000px]:gap-[4vw]"
        data-reveal=""
      >
        <div
          ref={list}
          className={`group/eol -mx-(--pad) flex gap-2 overflow-x-auto px-(--pad) [scrollbar-width:none] min-[1000px]:m-0 min-[1000px]:flex-col min-[1000px]:gap-0 min-[1000px]:overflow-visible min-[1000px]:p-0 [&::-webkit-scrollbar]:hidden ${playing ? "auto" : ""}`}
          role="tablist"
          aria-label="Occasions"
        >
          {EV[set].map(([oic, t], i) => (
            <button
              key={set + t}
              type="button"
              role="tab"
              aria-selected={i === cur}
              onClick={() => pick(i, set, true)}
              onAnimationEnd={() => playing && pick((cur + 1) % EV[set].length)}
              className={`${ITEM} ${i === cur ? "on" : ""}`}
            >
              <span className="grid size-8 place-items-center rounded-full bg-paper [transition:background-color_.4s,transform_.6s_var(--e-spring)] group-[.on]/it:[transform:rotate(-10deg)] min-[1000px]:size-[46px] min-[1000px]:bg-card min-[1000px]:group-[.on]/it:bg-blue">
                <svg className="size-[17px] min-[1000px]:size-[21px]">
                  <use href={`#${oic}`} />
                </svg>
              </span>
              <span>{t}</span>
              <svg className="hidden size-5 fill-none stroke-current opacity-0 [stroke-linecap:round] [stroke-linejoin:round] [stroke-width:1.8] [transform:translateX(-8px)] [transition:opacity_.4s,transform_.5s_var(--e-out)] min-[1000px]:ml-auto min-[1000px]:block min-[1000px]:group-[.on]/it:opacity-100 min-[1000px]:group-[.on]/it:[transform:none]" viewBox="0 0 24 24">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </button>
          ))}
        </div>
        <div className={`group/pn relative flex min-h-[440px] flex-col items-start rounded-stage bg-card p-[clamp(24px,3.4vw,52px)] min-[1000px]:min-h-0 [&>*]:[transition:opacity_.35s_var(--e-out)_calc(var(--o)*45ms),transform_.6s_var(--e-out)_calc(var(--o)*45ms)] ${swap ? "swap" : ""}`} aria-live="polite">
          <div style={o(0)} className={`${PN} flex items-center justify-between self-stretch`}>
            <span className="grid size-[clamp(62px,5.4vw,84px)] place-items-center rounded-full bg-blue">
              <svg className="size-[46%]">
                <use href={`#${ic}`} />
              </svg>
            </span>
            <span className="text-[14px] text-muted tabular-nums">
              {String(shown[1] + 1).padStart(2, "0")} / {String(EV[shown[0]].length).padStart(2, "0")}
            </span>
          </div>
          <h3 style={o(1)} className={`${PN} d3 mt-[clamp(22px,3vw,40px)]`}>
            {title}
          </h3>
          <p style={o(2)} className={`${PN} mt-3 mb-0 max-w-[30em] text-[length:clamp(17px,1.4vw,21px)] leading-[1.4] text-stone`}>
            {line}
          </p>
          <p style={o(3)} className={`${PN} mt-[clamp(22px,2.6vw,34px)] mb-1 text-[14px] font-semibold text-muted`}>
            Guests can
          </p>
          <ul style={o(4)} className={`${PN} m-0 list-none self-stretch p-0`}>
            {ideas.map((x) => (
              <li key={x} className="flex items-center gap-3 border-t border-[rgba(5,5,5,.1)] py-[13px] text-[length:clamp(16px,1.25vw,18px)] font-[540] before:size-2 before:flex-none before:rounded-full before:bg-blue before:content-['']">
                {x}
              </li>
            ))}
          </ul>
          {/* wrapped so the panel's child transition never competes with the button's own */}
          <div style={o(5)} className={`${PN} mt-[clamp(22px,2.6vw,34px)]`}>
            <Button href={contactHref("VR event")} label="Plan this event" variant="ink" size="sm" />
          </div>
        </div>
      </div>
    </section>
  );
}

// panel children: fade down 16 px (0.22 s, no stagger) while `.swap`, back with a 45 ms stagger
const PN = "group-[.swap]/pn:opacity-0 group-[.swap]/pn:[transform:translate3d(0,16px,0)] group-[.swap]/pn:[transition-delay:0s] group-[.swap]/pn:[transition-duration:.22s]";
const ITEM =
  "group/it relative flex h-[46px] flex-none items-center gap-[9px] rounded-full bg-card pr-4 pl-2 text-[15px] font-[560] text-stone [transition:background-color_.4s,color_.4s] [&.on]:bg-blue [&.on]:text-ink " +
  "min-[1000px]:h-auto min-[1000px]:gap-4 min-[1000px]:rounded-none min-[1000px]:border-t min-[1000px]:border-line min-[1000px]:bg-transparent min-[1000px]:px-1 min-[1000px]:py-[18px] min-[1000px]:text-[length:clamp(18px,1.5vw,22px)] min-[1000px]:font-semibold min-[1000px]:tracking-[-0.01em] min-[1000px]:text-[rgba(5,5,5,.38)] min-[1000px]:last:border-b min-[1000px]:hover:text-ink min-[1000px]:[&.on]:bg-transparent min-[1000px]:[&.on]:text-ink " +
  "min-[1000px]:after:absolute min-[1000px]:after:-top-px min-[1000px]:after:left-0 min-[1000px]:after:h-[2px] min-[1000px]:after:w-full min-[1000px]:after:origin-left min-[1000px]:after:bg-ink min-[1000px]:after:[transform:scaleX(0)] min-[1000px]:after:content-[''] min-[1000px]:[&.on]:after:[transform:scaleX(1)] min-[1000px]:[&.on]:after:[transition:transform_.6s_var(--e-out)] " +
  "min-[1000px]:group-[.auto]/eol:[&.on]:after:[transform:scaleX(0)] min-[1000px]:group-[.auto]/eol:[&.on]:after:[animation:eoBar_5s_linear_forwards]";
