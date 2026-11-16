"use client";
import { type CSSProperties, useEffect, useRef, useState } from "react";
import { SplitText } from "@/components/motion/SplitText";
import { Button } from "@/components/ui/Button";
import { HEAD_SPLIT } from "@/components/ui/layout";
import { contactHref } from "@/content/site";
import { engine } from "@/lib/engine";

// Rental planner (ANIMATION-SPEC R3). Slider 5–200 (step 5), length segment, 200-cell pill grid that fills
// with a stagger once the grid is 25% into view (450 ms later), facts that replay a slide-up when they change.
const LENGTHS = [
  ["day", "One day", "one day"],
  ["week", "2 to 7 days", "2 to 7 days"],
  ["month", "A month or more", "a month or more"],
] as const;

export function Planner() {
  const [n, setN] = useState(40);
  const [len, setLen] = useState(0);
  const [touched, setTouched] = useState(false);
  const grid = useRef<HTMLDivElement>(null);
  const G = useRef({ shown: 0, live: false, t: 0 });

  const month = LENGTHS[len][0] === "month";
  const plan = month ? (n >= 50 ? "Long-term bulk rental" : "Long-term rental") : n >= 50 ? "Bulk rental" : "Short-term rental";
  const facts: [string, string | number][] = [
    ["Charging cases", Math.ceil(n / 10)],
    ["Technicians on site", Math.max(1, Math.ceil(n / 25))],
    ["Guests per hour", n * 6],
  ];

  // cells a … n−1 switch on (step = min(14, 520 / span) ms apart); going down they switch off in reverse at half the delay
  const fillTo = (to: number) => {
    const g = G.current, a = g.shown;
    if (to === a) return;
    g.shown = to;
    const cells = grid.current!.children as HTMLCollectionOf<HTMLElement>;
    const step = engine.RM ? 0 : Math.min(14, 520 / Math.abs(to - a));
    if (to > a)
      for (let i = a; i < to; i++) {
        cells[i].style.setProperty("--dl", ((i - a) * step).toFixed(0) + "ms");
        cells[i].classList.add("on");
      }
    else
      for (let i = a - 1; i >= to; i--) {
        cells[i].style.setProperty("--dl", ((a - 1 - i) * step * 0.5).toFixed(0) + "ms");
        cells[i].classList.remove("on");
      }
  };
  const fill = useRef(fillTo);
  useEffect(() => {
    fill.current = fillTo;
    if (G.current.live) fillTo(n);
  });

  useEffect(() => {
    const g = G.current;
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (!e.isIntersecting) return;
          io.disconnect();
          g.t = window.setTimeout(
            () => {
              g.live = true;
              fill.current(+(grid.current!.dataset.n || 0));
            },
            engine.RM ? 0 : 450,
          );
        }),
      { rootMargin: "0px 0px -25% 0px" },
    );
    io.observe(grid.current!);
    return () => {
      io.disconnect();
      clearTimeout(g.t);
    };
  }, []);

  const tick = touched ? "animate-[rpTick_.5s_var(--e-out)] rm:animate-none" : "";
  return (
    <section id="planner" data-nav="Size your rental" className="wrap sec-tight">
      <div className={HEAD_SPLIT}>
        <SplitText as="h2" className="d2" text="Tell us the crowd. We'll size the kit." />
        <p className="lede fade" data-reveal="">
          Move the slider to see what a rental of that size looks like. Your quote confirms the exact kit.
        </p>
      </div>
      <div
        className="grid gap-[clamp(32px,4vw,64px)] rounded-stage bg-card p-[clamp(22px,3.6vw,56px)] motion:opacity-0 motion:[transform:translate3d(0,60px,0)] motion:[transition:opacity_1s_var(--e-out),transform_1.3s_var(--e-out)] in:opacity-100 in:[transform:none] min-[1000px]:grid-cols-[.9fr_1.1fr] min-[1000px]:items-stretch"
        data-reveal=""
      >
        <div className="min-[1000px]:flex min-[1000px]:flex-col min-[1000px]:justify-center">
          <p className={LBL}>How many headsets?</p>
          <div className="flex items-baseline gap-3">
            <b className="text-[length:clamp(76px,9.6vw,160px)] leading-[.84] font-[660] tracking-[-0.055em] tabular-nums [font-stretch:120%]">{n}</b>
            <span className="text-[length:clamp(17px,1.4vw,21px)] font-[540] text-stone">headsets</span>
          </div>
          <div
            className="relative mt-[18px] h-12 before:pointer-events-none before:absolute before:inset-x-0 before:top-1/2 before:-mt-1 before:h-2 before:rounded-full before:bg-[rgba(5,5,5,.1)] before:content-[''] after:pointer-events-none after:absolute after:top-1/2 after:left-0 after:-mt-1 after:h-2 after:w-(--v) after:rounded-full after:bg-blue after:content-['']"
            style={{ "--v": (((n - 5) / 195) * 100).toFixed(2) + "%" } as CSSProperties}
          >
            <input
              className={RANGE}
              type="range"
              min={5}
              max={200}
              step={5}
              value={n}
              aria-label="Number of headsets"
              onChange={(e) => {
                setN(+e.target.value);
                setTouched(true);
              }}
            />
          </div>
          <div className="flex justify-between px-1 text-[13px] text-muted tabular-nums" aria-hidden="true">
            {[5, 50, 100, 150, 200].map((v) => (
              <span key={v}>{v}</span>
            ))}
          </div>
          <p className={`${LBL} mt-[clamp(26px,3vw,40px)]`}>For how long?</p>
          <div className="relative grid grid-cols-3 rounded-full bg-paper p-[5px] shadow-[inset_0_0_0_1px_var(--color-line)]" role="radiogroup" aria-label="Rental length">
            <span className="absolute top-[5px] bottom-[5px] left-[5px] w-[calc((100%_-_10px)/3)] rounded-full bg-blue [transition:transform_.65s_var(--e-spring)]" style={{ transform: `translateX(${len * 100}%)` }} />
            {LENGTHS.map(([k, label], i) => (
              <button
                key={k}
                type="button"
                role="radio"
                aria-checked={i === len}
                onClick={() => {
                  setLen(i);
                  setTouched(true);
                }}
                className="relative z-1 min-h-12 rounded-full px-2 py-[6px] text-[length:clamp(13.5px,1.1vw,15.5px)] leading-[1.15] font-[560] text-stone transition-colors duration-350 aria-checked:text-ink"
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="grid content-start gap-[clamp(24px,2.6vw,36px)]">
          <div ref={grid} data-n={n} className="grid grid-cols-[repeat(20,1fr)] gap-[clamp(4px,.45vw,7px)]" aria-hidden="true">
            {Array.from({ length: 200 }, (_, i) => (
              <i
                key={i}
                className="aspect-[1.55] rounded-[40%_40%_46%_46%/50%_50%_60%_60%] bg-[rgba(5,5,5,.09)] [transition:background-color_.35s_var(--e-out)_var(--dl,0ms)] [&.on]:bg-blue [&.on]:[animation:rpPop_.55s_var(--e-spring)_var(--dl,0ms)_both]"
              />
            ))}
          </div>
          <dl className="m-0 grid grid-cols-3 gap-x-4 gap-y-5" aria-live="polite">
            <div className={`${FACT} col-span-full`}>
              <dt className={DT}>Suggested plan</dt>
              <dd key={plan} className={`${DD} ${tick}`}>
                {plan}
              </dd>
            </div>
            {facts.map(([t, v]) => (
              <div className={FACT} key={t}>
                <dt className={DT}>{t}</dt>
                <dd key={v} className={`${DD} tabular-nums ${tick}`}>
                  {v}
                </dd>
              </div>
            ))}
          </dl>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-[14px]">
            <Button href={contactHref("Headset rental", `We need about ${n} headsets for ${LENGTHS[len][2]}.`)} label={`Get a quote for ${n} headsets`} variant="ink" magnetic className="max-[520px]:w-full" />
            <p className="m-0 text-[13.5px] text-muted">Guests per hour assumes 10-minute sessions.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

const LBL = "mt-0 mb-[10px] text-[15px] font-semibold text-stone";
const FACT = "overflow-hidden border-t border-[rgba(5,5,5,.12)] pt-3";
const DT = "text-[13.5px] text-stone";
const DD = "mt-1 mb-0 ml-0 text-[length:clamp(24px,2.4vw,38px)] leading-[1.05] font-[640] tracking-[-0.03em] [font-stretch:112%]";
const RANGE =
  "relative z-1 m-0 h-12 w-full cursor-pointer appearance-none bg-transparent focus-visible:outline-none " +
  "[&::-webkit-slider-runnable-track]:h-12 [&::-webkit-slider-runnable-track]:bg-transparent [&::-moz-range-track]:h-12 [&::-moz-range-track]:bg-transparent " +
  "[&::-webkit-slider-thumb]:mt-[7px] [&::-webkit-slider-thumb]:size-[34px] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-[7px] [&::-webkit-slider-thumb]:border-paper [&::-webkit-slider-thumb]:bg-ink [&::-webkit-slider-thumb]:shadow-[0_0_0_1.5px_var(--color-ink),0_0_0_0_rgba(84,140,255,.35)] [&::-webkit-slider-thumb]:[transition:box-shadow_.35s_var(--e-out),transform_.35s_var(--e-spring)] " +
  "active:[&::-webkit-slider-thumb]:[transform:scale(1.12)] active:[&::-webkit-slider-thumb]:shadow-[0_0_0_1.5px_var(--color-ink),0_0_0_10px_rgba(84,140,255,.3)] focus-visible:[&::-webkit-slider-thumb]:shadow-[0_0_0_1.5px_var(--color-ink),0_0_0_6px_var(--color-blue)] " +
  "[&::-moz-range-thumb]:size-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-[7px] [&::-moz-range-thumb]:border-paper [&::-moz-range-thumb]:bg-ink [&::-moz-range-thumb]:shadow-[0_0_0_1.5px_var(--color-ink)]";
