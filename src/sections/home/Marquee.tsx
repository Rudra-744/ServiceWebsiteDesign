"use client";
import { useEffect, useRef } from "react";
import { addMeasure, engine } from "@/lib/engine";
import { clamp, lerp } from "@/lib/motion";
import { useTicker } from "@/hooks/useTicker";
import { MARQUEE } from "@/content/home";

// Velocity marquee (ANIMATION-SPEC G11): speed (1.1 + min(|vel|×0.5, 16)) × direction px per 16.67 ms,
// skew lerps to clamp(−vel×0.35, −9, 9) degrees. Runs only while visible and the menu is closed.
export function Marquee() {
  const root = useRef<HTMLDivElement>(null);
  const S = useRef({ x: 0, w: 0, vis: false, skew: 0, vel: 0, dir: 1, lastY: -1 });

  useEffect(() => {
    const st = S.current, m = root.current!, t = m.querySelector<HTMLElement>(".mq-track")!;
    const base = t.innerHTML;
    let guard = 0;
    while (t.scrollWidth < Math.max(innerWidth, 1200) * 1.2 && guard++ < 8) t.innerHTML += base;
    t.innerHTML += t.innerHTML;
    st.w = t.scrollWidth / 2;
    const io = new IntersectionObserver((es) => es.forEach((e) => (st.vis = e.isIntersecting)));
    io.observe(m);
    const off = addMeasure(() => (st.w = t.scrollWidth / 2));
    return () => {
      io.disconnect();
      off();
    };
  }, []);

  useTicker((_, dt) => {
    const st = S.current, y = scrollY;
    const dy = st.lastY < 0 ? 0 : y - st.lastY;
    st.lastY = y;
    st.vel = lerp(st.vel, (dy / (dt || 16)) * 16, 0.2);
    if (Math.abs(dy) > 0.5) st.dir = dy > 0 ? 1 : -1;
    if (engine.menuOpen || !st.vis || !st.w) return;
    const sp = (engine.RM ? 0 : 1.1 + Math.min(Math.abs(st.vel) * 0.5, 16)) * st.dir;
    st.x -= (sp * dt) / 16.67;
    if (st.x <= -st.w) st.x += st.w;
    if (st.x > 0) st.x -= st.w;
    st.skew = lerp(st.skew, clamp(-st.vel * 0.35, -9, 9), 0.12);
    root.current!.querySelector<HTMLElement>(".mq-track")!.style.transform = `translate3d(${st.x.toFixed(1)}px,0,0) skewX(${st.skew.toFixed(2)}deg)`;
  });

  return (
    <div className="marquee" aria-hidden="true" ref={root}>
      <div className="mq-track">
        <span className="mq-item">
          {MARQUEE.map(([t, o]) => (
            <span key={t} style={{ display: "contents" }}>
              <span className={o || undefined}>{t}</span>
              <i className="mq-dot" />
            </span>
          ))}
        </span>
      </div>
    </div>
  );
}
