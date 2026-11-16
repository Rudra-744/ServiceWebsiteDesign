"use client";
import { useEffect, useId, useRef } from "react";
import { E, clamp, lerp, map } from "@/lib/motion";
import { planSVG } from "@/lib/plan";
import { useScrollScene } from "@/hooks/useScrollScene";

// Floor plan → model → VR → buyers (ANIMATION-SPEC H8 / RE3), pinned 420vh (400vh phone).
type Props = { nav: string; tag: string; title: string; lede?: string; steps: readonly (readonly [string, string])[]; label: string };

export function FloorPlan({ nav, tag, title, lede, steps, label }: Props) {
  const sec = useRef<HTMLElement>(null);
  const id = useId().replace(/[^a-z0-9]/gi, "");
  const S = useRef({ walls: [] as [SVGPathElement, number][], cur: -1 });

  useEffect(() => {
    S.current.walls = [...sec.current!.querySelectorAll<SVGPathElement>(".wall")].map((w) => {
      const L = w.getTotalLength();
      w.style.strokeDasharray = String(L);
      w.style.strokeDashoffset = String(L);
      return [w, L];
    });
  }, []);

  useScrollScene(sec, (p) => {
    const root = sec.current!, vis = root.querySelector(".plan-vis")!;
    const q1 = E.inOut(map(p, 0.02, 0.22)), q2 = map(p, 0.26, 0.46), q3 = E.out(map(p, 0.5, 0.68)), q4 = map(p, 0.74, 0.9);
    S.current.walls.forEach(([w, L]) => (w.style.strokeDashoffset = (L * (1 - q1)).toFixed(1)));
    vis.querySelector<SVGElement>(".win")!.style.opacity = map(q1, 0.6, 1).toFixed(3);
    vis.querySelector<SVGElement>(".dimg")!.style.opacity = map(q1, 0.3, 1).toFixed(3);
    vis.querySelectorAll<SVGElement>(".room").forEach((r) => (r.style.opacity = q2.toFixed(3)));
    vis.querySelectorAll<SVGElement>(".lbl").forEach((l) => (l.style.opacity = (map(q2, 0.3, 1) * (1 - q3)).toFixed(3)));
    vis.querySelectorAll<SVGElement>(".furn").forEach((f, i) => {
      const t = E.out(map(q2, i * 0.05, i * 0.05 + 0.4));
      f.style.opacity = t.toFixed(3);
      f.style.transform = `scale(${lerp(0.3, 1, t).toFixed(3)})`;
    });
    vis.querySelector<SVGElement>(".lens-g")!.style.transform = `scale(${q3.toFixed(4)})`;
    vis.querySelector<SVGElement>(".plan-base")!.style.opacity = (1 - q3 * 0.6).toFixed(3);
    vis.querySelectorAll(".buyer").forEach((c, i) => c.classList.toggle("on", q4 > i * 0.22 + 0.01));
    root.querySelector<HTMLElement>(".steps-line i")!.style.transform = `scaleY(${clamp(p * 1.04).toFixed(4)})`;
    const si = p < 0.25 ? 0 : p < 0.5 ? 1 : p < 0.75 ? 2 : 3;
    if (si !== S.current.cur) {
      S.current.cur = si;
      root.querySelectorAll(".step").forEach((s, i) => s.classList.toggle("on", i <= si));
      const mob = root.querySelector(".plan-mob-step")!;
      mob.querySelector("b")!.textContent = `${si + 1}. ${steps[si][0]}`;
      mob.querySelector("span")!.textContent = steps[si][1];
    }
  });

  return (
    <section ref={sec} data-nav={nav} className="plan-sec wrap relative h-[420vh] max-[960px]:h-[400vh]" aria-label={label}>
      <div className="sticky top-0 grid h-svh grid-cols-1 grid-rows-[auto_1fr] gap-3 overflow-hidden pt-[calc(var(--nav-h)+28px)] pb-5 min-[960px]:grid-cols-[1fr_1.1fr] min-[960px]:grid-rows-1 min-[960px]:items-center min-[960px]:gap-[5vw] min-[960px]:pt-(--nav-h)">
        <div>
          <p className="tag">{tag}</p>
          <h2 className="d2 mt-[14px]">{title}</h2>
          {lede && <p className="lede mt-5 max-[960px]:hidden">{lede}</p>}
          <div className="relative mt-7 grid gap-1 pl-7 max-[960px]:hidden">
            <span className="steps-line absolute top-[10px] bottom-[10px] left-[7px] w-[2px] bg-line">
              <i className="absolute inset-0 origin-top bg-blue [transform:scaleY(0)]" />
            </span>
            {steps.map(([b, s]) => (
              <div
                key={b}
                className="step relative py-[10px] opacity-[.32] transition-opacity duration-500 before:absolute before:top-4 before:-left-[27px] before:size-[14px] before:rounded-full before:bg-paper before:shadow-[inset_0_0_0_2px_var(--color-line)] before:[transition:background-color_.4s,box-shadow_.4s] before:content-[''] [&.on]:opacity-100 [&.on]:before:bg-blue [&.on]:before:shadow-[inset_0_0_0_2px_var(--color-blue)]"
              >
                <b className="block text-[length:clamp(20px,1.7vw,26px)] font-[620] tracking-[-0.02em] [font-stretch:108%]">{b}</b>
                <span className="block max-w-[30em] text-[15.5px] text-stone">{s}</span>
              </div>
            ))}
          </div>
          <div className="plan-mob-step hidden max-[960px]:mt-[14px] max-[960px]:block max-[960px]:min-h-[96px] [&_b]:block [&_b]:text-[20px] [&_b]:font-[620] [&_b]:[font-stretch:108%] [&_span]:block [&_span]:text-[15.5px] [&_span]:text-stone" aria-hidden="true">
            <b />
            <span />
          </div>
        </div>
        <div className="plan-vis relative w-full max-w-[640px] self-center justify-self-center max-[960px]:max-w-[min(92vw,520px)]" dangerouslySetInnerHTML={{ __html: planSVG(id) }} />
      </div>
    </section>
  );
}
