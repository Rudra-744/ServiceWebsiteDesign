"use client";
import { Fragment, useRef } from "react";
import Image from "next/image";
import { E, clamp } from "@/lib/motion";
import { useScrollScene } from "@/hooks/useScrollScene";

// Words light up with scroll (ANIMATION-SPEC H2): view scene start .88, end .38; t = p × (words + 3);
// word i: opacity .14 + .86·clamp(t − i); image pills grow to E.out(v) × 2.3em.
// statement type (reference .mani-text)
export const MANI = "m-0 max-w-[20ch] text-[length:clamp(30px,4.3vw,74px)] leading-[1.08] font-[560] tracking-[-0.03em] [font-stretch:108%] min-[820px]:max-w-none min-[820px]:pr-[8vw]";

export function ScrubWords({ parts, className = MANI }: { parts: (string | { img: string })[]; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  useScrollScene(
    ref,
    (p) => {
      const el = ref.current!;
      const words = [...el.querySelectorAll<HTMLElement>(".mw, .ipill")];
      const t = p * (words.length + 3);
      words.forEach((w, i) => {
        const v = clamp(t - i);
        if (w.classList.contains("ipill")) w.style.width = (E.out(v) * 2.3).toFixed(3) + "em";
        else w.style.opacity = (0.14 + 0.86 * v).toFixed(3);
      });
    },
    { type: "view", start: 0.88, end: 0.38 },
  );
  let k = 0;
  return (
    <p className={className} ref={ref}>
      {parts.map((part, n) =>
        typeof part === "string" ? (
          <Fragment key={n}>
            {part.split(/\s+/).filter(Boolean).map((w) => (
              <Fragment key={k++}>
                <span className="mw [transition:opacity_.25s_linear] motion:opacity-[.14]">{w}</span>{" "}
              </Fragment>
            ))}
          </Fragment>
        ) : (
          <Fragment key={n}>
            {/* decorative pill, 2.6em wide (78–192 px): a small optimised image, not the full photo */}
            <span className="ipill relative mx-[.12em] -mt-[.1em] inline-block h-[.82em] w-0 overflow-hidden rounded-full bg-blue-soft align-middle rm:w-[2.2em]"><Image className="h-full w-[2.6em] max-w-none object-cover" src={part.img} alt="" width={192} height={60} sizes="(max-width: 697px) 78px, (max-width: 1721px) 11.2vw, 192px" /></span>{" "}
          </Fragment>
        ),
      )}
    </p>
  );
}
