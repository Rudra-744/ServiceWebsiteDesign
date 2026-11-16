"use client";
import { useRef } from "react";
import { SplitText } from "@/components/motion/SplitText";
import { E, map } from "@/lib/motion";
import { useScrollScene } from "@/hooks/useScrollScene";

// Strike-through problem statement (ANIMATION-SPEC HB2): view scene start .78, end .3; phrase i: k = map(p, i × .28, i × .28 + .3),
// the cornflower line grows scaleX(E.out(k)); when complete the phrase greys out.
const S = "relative text-ink no-underline [transition:color_.5s] after:absolute after:-inset-x-[.05em] after:top-[54%] after:h-[.09em] after:origin-left after:rounded-[2px] after:bg-blue after:[transform:scaleX(var(--k,0))] after:content-[''] [&.done]:text-[#a9a9b0]";

export function Strike() {
  const p = useRef<HTMLParagraphElement>(null);
  useScrollScene(
    p,
    (v) =>
      p.current!.querySelectorAll<HTMLElement>("s").forEach((s, i) => {
        const k = map(v, i * 0.28, i * 0.28 + 0.3);
        s.style.setProperty("--k", E.out(k).toFixed(3));
        s.classList.toggle("done", k >= 1);
      }),
    { type: "view", start: 0.78, end: 0.3 },
  );
  return (
    <section data-nav="The problem" className="wrap sec">
      <p ref={p} className="m-0 max-w-[22ch] text-[length:clamp(30px,4.2vw,72px)] leading-[1.12] font-[560] tracking-[-0.03em] [font-stretch:108%] min-[820px]:max-w-none min-[820px]:pr-[6vw]">
        Running a group VR session shouldn&apos;t mean walking from headset to headset to <s className={S}>load a video</s>, <s className={S}>check a battery</s> and <s className={S}>press play</s>.
      </p>
      <SplitText as="h2" className="d2 mt-[clamp(30px,4vw,56px)] text-blue-deep" text="VR HUB puts the whole fleet on one screen." />
    </section>
  );
}
