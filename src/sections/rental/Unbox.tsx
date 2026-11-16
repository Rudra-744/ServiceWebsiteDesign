"use client";
import { useEffect, useRef } from "react";
import { SplitText } from "@/components/motion/SplitText";
import { addMeasure, engine } from "@/lib/engine";
import { E, clamp } from "@/lib/motion";
import { useScrollScene } from "@/hooks/useScrollScene";

// "What comes in the box" (ANIMATION-SPEC R7), pinned 300vh: the lid opens, the six items fly out of the box
// to their grid places. Offsets are measured from a point 32% down the box with transforms cleared.
const ITEMS = [
  ["i-vr", "VR headsets", "Standalone, no cables or PC", "min-[1000px]:col-start-1 min-[1000px]:row-start-1"],
  ["i-batt", "Charging cases", "Every headset charged and ready", "min-[1000px]:col-start-1 min-[1000px]:row-start-2"],
  ["i-shield", "Hygiene covers", "A fresh cover for each guest", "min-[1000px]:col-start-1 min-[1000px]:row-start-3"],
  ["i-play", "Content loaded", "Your apps or ours, tested", "min-[1000px]:col-start-3 min-[1000px]:row-start-1"],
  ["i-sync", "VR HUB console", "See and control every headset", "min-[1000px]:col-start-3 min-[1000px]:row-start-2"],
  ["i-tool", "Technician on site", "Setup, training and support", "min-[1000px]:col-start-3 min-[1000px]:row-start-3"],
];

export function Unbox() {
  const sec = useRef<HTMLElement>(null);
  const off = useRef<[number, number][]>([]);

  useEffect(() => {
    const root = sec.current!, box = root.querySelector<HTMLElement>(".rb-box")!;
    return addMeasure(() => {
      const items = [...root.querySelectorAll<HTMLElement>(".rb-item")];
      items.forEach((it) => (it.style.transform = "none"));
      const b = box.getBoundingClientRect(), bx = b.left + b.width / 2, by = b.top + b.height * 0.32;
      off.current = items.map((it) => {
        const r = it.getBoundingClientRect();
        return [bx - (r.left + r.width / 2), by - (r.top + r.height / 2)];
      });
    });
  }, []);

  useScrollScene(sec, (p) => {
    if (engine.RM) p = 1;
    const root = sec.current!, lk = E.out(clamp((p - 0.02) / 0.2));
    const [l, r] = root.querySelectorAll<HTMLElement>(".rb-lid");
    l.style.transform = `rotate(${(-lk * 128).toFixed(2)}deg)`;
    r.style.transform = `rotate(${(lk * 128).toFixed(2)}deg)`;
    root.querySelector<HTMLElement>(".rb-mouth")!.style.transform = `scaleY(${lk.toFixed(3)})`;
    root.querySelector<HTMLElement>(".rb-box")!.style.transform = `translate3d(0,${(Math.sin(clamp(p / 0.3) * Math.PI) * -10).toFixed(2)}px,0)`;
    root.querySelectorAll<HTMLElement>(".rb-item").forEach((it, i) => {
      const k = E.out(clamp((p - 0.16 - i * 0.075) / 0.3)), o = off.current[i] || [0, 0];
      it.style.transform = `translate3d(${(o[0] * (1 - k)).toFixed(1)}px,${(o[1] * (1 - k)).toFixed(1)}px,0) scale(${(0.2 + 0.8 * k).toFixed(3)})`;
      it.style.opacity = clamp(k * 2.5).toFixed(3);
    });
  });

  return (
    <section ref={sec} data-nav="What's included" className="relative h-[300vh]">
      <div className="wrap sticky top-0 grid h-svh grid-rows-[auto_1fr] gap-[clamp(12px,2vw,28px)] overflow-hidden pt-[calc(var(--nav-h)+22px)] pb-[22px]">
        <div className="grid gap-3 min-[1000px]:grid-cols-[1.2fr_1fr] min-[1000px]:items-end min-[1000px]:gap-[6vw]">
          <SplitText as="h2" className="d2 max-[999px]:text-[length:clamp(32px,8.4vw,44px)]!" text="What comes in the box." />
          <p className="lede fade max-[999px]:text-[16px]!" data-reveal="">
            Everything a session needs, and people who know the hardware.
          </p>
        </div>
        <div className="relative grid auto-rows-auto grid-cols-2 content-center gap-[10px] min-[1000px]:grid-cols-[1fr_minmax(220px,24vw)_1fr] min-[1000px]:grid-rows-[repeat(3,auto)] min-[1000px]:gap-x-[3.4vw] min-[1000px]:gap-y-4">
          <div className="rb-box relative z-2 col-span-full mb-2 aspect-[1/.9] w-[clamp(120px,17vw,250px)] justify-self-center min-[1000px]:col-span-1 min-[1000px]:col-start-2 min-[1000px]:row-span-3 min-[1000px]:row-start-1 min-[1000px]:m-0 min-[1000px]:self-center [@media(max-height:700px)_and_(max-width:999px)]:w-[100px]" aria-hidden="true">
            <span className="rb-mouth absolute inset-x-[4%] top-[18%] h-[12%] origin-bottom rounded-full bg-ink [transform:scaleY(0)]" />
            <span className="rb-lid absolute top-[20%] left-[-1%] z-1 h-[7%] w-[52%] origin-[3%_50%] rounded-[6px] bg-blue-2" />
            <span className="rb-lid absolute top-[20%] right-[-1%] z-1 h-[7%] w-[52%] origin-[97%_50%] rounded-[6px] bg-blue-2" />
            <span className="absolute inset-x-0 bottom-0 grid h-[76%] place-items-center overflow-hidden rounded-[8%] bg-blue">
              <span className="text-[length:clamp(17px,1.9vw,28px)] font-[680] tracking-[-0.04em] [font-stretch:122%]">cyphon</span>
              <span className="absolute top-0 left-1/2 h-[36%] w-[15%] -translate-x-1/2 bg-[rgba(5,5,5,.12)]" />
            </span>
          </div>
          {ITEMS.map(([ic, b, s, pos], i) => (
            <div key={b} className={`rb-item relative z-1 flex flex-col items-start gap-[10px] rounded-[20px] bg-card p-[14px] will-change-[transform,opacity] min-[1000px]:flex-row min-[1000px]:items-center min-[1000px]:gap-4 min-[1000px]:px-5 min-[1000px]:py-[18px] ${pos}`}>
              <span className={`grid size-10 flex-none place-items-center rounded-full min-[1000px]:size-12 ${i === 0 ? "bg-ink text-paper" : "bg-blue text-ink"}`}>
                <svg className="size-5 min-[1000px]:size-[22px]">
                  <use href={`#${ic}`} />
                </svg>
              </span>
              <span>
                <b className="block text-[15.5px] leading-[1.2] font-[620] min-[1000px]:text-[18px]">{b}</b>
                <small className="mt-[3px] block text-[13px] leading-[1.3] text-stone min-[1000px]:text-[14.5px] [@media(max-height:700px)_and_(max-width:999px)]:hidden">{s}</small>
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
