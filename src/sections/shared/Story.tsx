"use client";
import { type ReactNode, type RefObject, useRef } from "react";
import { SplitText } from "@/components/motion/SplitText";
import { clamp } from "@/lib/motion";
import { useScrollScene } from "@/hooks/useScrollScene";

// Pinned four-step story (ANIMATION-SPEC R5 / E3): P = p × 4 × 0.999, active step = min(3, floor(P)),
// rail segment j fills clamp(P − j), scene j gets k_j = clamp((P − j) / kDiv). Scenes cross-fade.
// The page draws its scenes in `onFrame` (it owns the scene markup and queries it through `ref`).
export const SC =
  "rs-sc absolute inset-0 grid place-items-center content-center p-[clamp(16px,3vw,44px)] opacity-0 invisible [transform:translate3d(0,26px,0)_scale(.97)] [transition:opacity_.5s_var(--e-out),transform_.8s_var(--e-out),visibility_0s_.5s] [&.on]:visible [&.on]:opacity-100 [&.on]:[transform:none] [&.on]:[transition:opacity_.5s_var(--e-out)_.08s,transform_.8s_var(--e-out)_.08s,visibility_0s]";

type Props = {
  ref: RefObject<HTMLElement | null>;
  nav: string;
  title: string;
  steps: [string, string][];
  visClass: string;
  kDiv: number;
  onFrame: (k: (j: number) => number) => void;
  children: ReactNode;
};

export function Story({ ref, nav, title, steps, visClass, kDiv, onFrame, children }: Props) {
  const cur = useRef(-1);
  useScrollScene(ref, (p) => {
    const root = ref.current!, P = p * 4 * 0.999, i = Math.min(3, Math.floor(P));
    if (i !== cur.current) {
      cur.current = i;
      root.querySelectorAll(".rs-steps li").forEach((l, j) => l.classList.toggle("on", j === i));
      root.querySelectorAll(".rs-sc").forEach((s, j) => s.classList.toggle("on", j === i));
    }
    root.querySelectorAll<HTMLElement>(".rs-rail i").forEach((r, j) => r.style.setProperty("--f", clamp(P - j).toFixed(3)));
    onFrame((j) => clamp((P - j) / kDiv));
  });

  return (
    <section ref={ref} data-nav={nav} className="relative h-[460vh] max-[999px]:h-[420vh]">
      <div className="wrap sticky top-0 grid h-svh grid-rows-[auto_1fr] gap-[18px] overflow-hidden pt-[calc(var(--nav-h)+18px)] pb-[18px] min-[1000px]:grid-cols-[.82fr_1.18fr] min-[1000px]:grid-rows-1 min-[1000px]:items-center min-[1000px]:gap-[5vw] min-[1000px]:pt-[calc(var(--nav-h)+20px)] min-[1000px]:pb-8">
        <div>
          <SplitText as="h2" className="d3 max-[999px]:text-[length:clamp(26px,7vw,34px)]!" text={title} />
          <div className="rs-rail mt-[18px] mb-5 grid grid-cols-4 gap-[6px] min-[1000px]:max-w-[440px]" aria-hidden="true">
            {steps.map(([t]) => (
              <i key={t} className="relative h-[3px] overflow-hidden rounded-[3px] bg-line after:absolute after:inset-0 after:origin-left after:bg-ink after:[transform:scaleX(var(--f,0))] after:content-['']" />
            ))}
          </div>
          <ol className="rs-steps m-0 grid list-none p-0 min-[1000px]:gap-[6px]">
            {steps.map(([t, d], i) => (
              <li
                key={t}
                className={`group/rs pointer-events-none grid grid-cols-[44px_1fr] gap-[6px] opacity-0 [grid-area:1/1] [transform:translate3d(0,18px,0)] [transition:opacity_.45s_var(--e-out),transform_.7s_var(--e-out)] min-[1000px]:pointer-events-auto min-[1000px]:py-[14px] min-[1000px]:opacity-[.26] min-[1000px]:[grid-area:auto] min-[1000px]:[transform:none] [&.on]:opacity-100 [&.on]:delay-[.12s] [&.on]:[transform:none] ${i === 0 ? "on" : ""}`}
              >
                <span className="pt-[5px] text-[14px] font-[620] text-blue-deep tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h3 className="d4 max-[999px]:text-[20px]! min-[1000px]:[transition:transform_.6s_var(--e-out)] min-[1000px]:group-[.on]/rs:[transform:translateX(4px)]">{t}</h3>
                  <p className="mt-2 mb-0 max-w-[28em] text-[16px] text-stone max-[999px]:mt-1 max-[999px]:text-[15px]">{d}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
        <div className={`relative min-h-0 overflow-hidden rounded-stage min-[1000px]:h-[min(74svh,640px)] ${visClass}`} aria-hidden="true">
          {children}
        </div>
      </div>
    </section>
  );
}
