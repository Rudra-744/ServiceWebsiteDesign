"use client";
import { type CSSProperties, useEffect, useRef } from "react";
import { SplitText } from "@/components/motion/SplitText";
import { Button } from "@/components/ui/Button";
import { HEAD_SPLIT } from "@/components/ui/layout";
import { contactHref } from "@/content/site";
import { addMeasure } from "@/lib/engine";
import { clamp } from "@/lib/motion";
import { useScrollScene } from "@/hooks/useScrollScene";

// Rental plans (ANIMATION-SPEC R6): sticky stacking cards; the card behind scales 1 − d × 0.06 and its content dims 1 − d × 0.55,
// d = clamp(1 − (next.top − next sticky top) / card height). View scene over the list (start 1, end 0).
const PLANS = [
  { ic: "i-clock", len: "A day or a weekend", name: "Short-term", d: "For a single event, demo day or workshop.", pts: ["Launches, demo days and workshops", "Set up before your guests arrive", "A technician through the event"], cta: "Ask about short-term", cls: "bg-paper shadow-[inset_0_0_0_1px_var(--color-line)]" },
  { ic: "i-cal", len: "Weeks to months", name: "Long-term", d: "For training programmes, classrooms and ongoing projects.", pts: ["Schools, colleges and training providers", "Help running your sessions", "Support for as long as you rent"], cta: "Ask about long-term", cls: "bg-blue" },
  { ic: "i-layers", len: "50 to 200+ headsets", name: "Bulk", d: "For corporate events and exhibitions that need many headsets at once.", pts: ["Conferences, expos and brand activations", "Every headset managed in VR HUB", "A crew sized to your crowd"], cta: "Ask about bulk", cls: "bg-card" },
];

export function Plans() {
  const list = useRef<HTMLDivElement>(null);
  const tops = useRef<number[]>([]);
  useEffect(
    () =>
      addMeasure(() => {
        tops.current = [...list.current!.children].map((c) => parseFloat(getComputedStyle(c).top) || 0);
      }),
    [],
  );
  useScrollScene(
    list,
    () => {
      const cards = [...list.current!.children] as HTMLElement[];
      for (let i = 0; i < cards.length - 1; i++) {
        const r = cards[i].getBoundingClientRect(), nx = cards[i + 1].getBoundingClientRect();
        const d = clamp(1 - (nx.top - (tops.current[i + 1] || 0)) / Math.max(1, r.height));
        cards[i].style.transform = d > 0 ? `scale(${(1 - d * 0.06).toFixed(4)})` : "";
        cards[i].style.setProperty("--dim", d.toFixed(3));
      }
    },
    { type: "view", start: 1, end: 0 },
  );

  return (
    <section data-nav="Rental plans" className="wrap sec">
      <div className={HEAD_SPLIT}>
        <SplitText as="h2" className="d2" text="Short, long or all at once." />
        <p className="lede fade" data-reveal="">
          Three ways to rent. Every plan includes setup at your venue and technical support.
        </p>
      </div>
      <div ref={list}>
        {PLANS.map((p, k) => {
          const blue = k === 1;
          return (
            <article
              key={p.name}
              className={`rpl-card sticky top-[calc(var(--nav-h)+22px+var(--k)*14px)] mb-6 grid min-h-[min(66svh,560px)] origin-top grid-rows-[auto_1fr_auto] gap-7 rounded-stage p-[clamp(22px,3.4vw,52px)] will-change-transform max-[899px]:min-h-[min(74svh,600px)] [&>*]:opacity-[calc(1-var(--dim,0)*.55)] ${p.cls}`}
              style={{ "--k": k } as CSSProperties}
            >
              <div className="flex items-center justify-between gap-3">
                <span className={`grid size-[52px] place-items-center rounded-full ${blue ? "bg-ink text-paper" : "bg-blue text-ink"}`}>
                  <svg className="size-6">
                    <use href={`#${p.ic}`} />
                  </svg>
                </span>
                <span className="inline-flex h-9 items-center rounded-full px-[14px] text-[14px] font-[560] shadow-[inset_0_0_0_1.5px_currentColor]">{p.len}</span>
              </div>
              <div className="self-center">
                <h3 className="m-0 text-[length:clamp(58px,10vw,170px)] leading-[.84] font-[660] tracking-[-0.055em] [font-stretch:122%]">{p.name}</h3>
                <p className={`mt-[18px] mb-0 max-w-[24ch] text-[length:clamp(18px,1.5vw,23px)] leading-[1.35] ${blue ? "text-[rgba(5,5,5,.78)]" : "text-stone"}`}>{p.d}</p>
              </div>
              <div className="grid gap-[22px] min-[900px]:grid-cols-[1fr_auto] min-[900px]:items-end">
                <ul className="m-0 grid list-none gap-[10px] p-0">
                  {p.pts.map((t) => (
                    <li key={t} className="flex items-center gap-[10px] text-[15.5px] font-[520]">
                      <svg className={`size-[18px] flex-none ${blue ? "text-ink" : "text-blue-deep"}`}>
                        <use href="#i-check" />
                      </svg>
                      {t}
                    </li>
                  ))}
                </ul>
                <Button href={contactHref("Headset rental")} label={p.cta} variant="ink" size="sm" className="justify-self-start" style={blue ? ({ "--fill": "var(--color-paper)" } as CSSProperties) : undefined} />
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
