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
    <section data-nav={nav} className="plan-sec wrap" aria-label={label} ref={sec}>
      <div className="plan-pin">
        <div className="plan-copy">
          <p className="tag">{tag}</p>
          <h2 className="d2" style={{ marginTop: 14 }}>
            {title}
          </h2>
          {lede && (
            <p className="lede" style={{ marginTop: 20 }}>
              {lede}
            </p>
          )}
          <div className="steps">
            <span className="steps-line">
              <i />
            </span>
            {steps.map(([b, s]) => (
              <div className="step" key={b}>
                <b>{b}</b>
                <span>{s}</span>
              </div>
            ))}
          </div>
          <div className="plan-mob-step" aria-hidden="true">
            <b />
            <span />
          </div>
        </div>
        <div className="plan-vis" dangerouslySetInnerHTML={{ __html: planSVG(id) }} />
      </div>
    </section>
  );
}
