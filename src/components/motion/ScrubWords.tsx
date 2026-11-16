"use client";
import { Fragment, useRef } from "react";
import { E, clamp } from "@/lib/motion";
import { useScrollScene } from "@/hooks/useScrollScene";

// Words light up with scroll (ANIMATION-SPEC H2): view scene start .88, end .38; t = p × (words + 3);
// word i: opacity .14 + .86·clamp(t − i); image pills grow to E.out(v) × 2.3em.
export function ScrubWords({ parts, className = "mani-text" }: { parts: (string | { img: string })[]; className?: string }) {
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
                <span className="mw">{w}</span>{" "}
              </Fragment>
            ))}
          </Fragment>
        ) : (
          <Fragment key={n}>
            {/* eslint-disable-next-line @next/next/no-img-element -- decorative 2.6em pill, smaller than next/image's smallest size */}
            <span className="ipill"><img src={part.img} alt="" loading="lazy" /></span>{" "}
          </Fragment>
        ),
      )}
    </p>
  );
}
