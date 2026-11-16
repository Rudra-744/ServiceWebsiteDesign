import type { CSSProperties } from "react";
import { SplitText } from "@/components/motion/SplitText";

// "Every event includes" (ANIMATION-SPEC E5): four tiles that pop in, 65 ms apart.
const ITEMS = [
  ["i-vr", "Headsets for every station", "From one stand to a full zone"],
  ["i-tool", "Setup at your venue", "Ready before doors open"],
  ["i-shield", "Fresh cover per guest", "Clean and comfortable"],
  ["i-sync", "Support throughout", "Our team stays on site"],
];

export function Includes() {
  return (
    <section data-nav="Every event includes" className="wrap sec-tight">
      <SplitText as="h2" className="d3 mb-[clamp(26px,3vw,40px)]" text="Every event includes" />
      <ul className="m-0 grid list-none grid-cols-2 gap-3 p-0 min-[1000px]:grid-cols-4 min-[1000px]:gap-4" data-reveal="">
        {ITEMS.map(([ic, b, s], i) => (
          <li key={b} className="pop grid content-start gap-[6px] rounded-[20px] bg-card p-5 min-[1000px]:p-[26px]" style={{ "--i": i } as CSSProperties}>
            <span className="mb-[10px] grid size-10 flex-none place-items-center rounded-full bg-blue text-ink min-[1000px]:size-12">
              <svg className="size-5 min-[1000px]:size-[22px]">
                <use href={`#${ic}`} />
              </svg>
            </span>
            <b className="text-[length:clamp(16px,1.3vw,19px)] leading-[1.2] font-[620]">{b}</b>
            <small className="text-[14px] leading-[1.35] text-stone">{s}</small>
          </li>
        ))}
      </ul>
    </section>
  );
}
