"use client";
import { useEffect, useRef } from "react";
import { engine } from "@/lib/engine";
import { lerp } from "@/lib/motion";
import { useTicker } from "@/hooks/useTicker";

// Custom cursor (G9), magnetic buttons (G8 step 4) and card tilt (G10). Mouse only, never with reduced motion.
// Delegated on the document so it works on every page without per-element wiring.
export function Cursor() {
  const ref = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: -100, y: -100, tx: -100, ty: -100, on: false });

  useEffect(() => {
    if (!engine.FINE || engine.RM) return;
    pos.current.on = true;
    const c = ref.current!, lbl = c.querySelector("b")!;
    let mag: HTMLElement | null = null, tilt: HTMLElement | null = null;
    const resetMag = () => {
      if (!mag) return;
      mag.style.transform = "";
      const l = mag.querySelector<HTMLElement>(".lbl");
      if (l) l.style.transform = "";
      mag = null;
    };
    const resetTilt = () => {
      if (!tilt) return;
      tilt.style.transition = "";
      tilt.style.transform = "";
      tilt = null;
    };
    const move = (e: PointerEvent) => {
      pos.current.tx = e.clientX;
      pos.current.ty = e.clientY;
      c.classList.remove("hidden");
      const t = e.target as Element;
      const m = t.closest?.<HTMLElement>("[data-magnetic]") ?? null;
      if (m !== mag) resetMag();
      if (m) {
        mag = m;
        const r = m.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2;
        m.style.transform = `translate(${x * 0.2}px,${y * 0.3}px)`;
        const l = m.querySelector<HTMLElement>(".lbl");
        if (l) l.style.transform = `translate(${x * 0.08}px,${y * 0.1}px)`;
      }
      const tl = t.closest?.<HTMLElement>("[data-tilt]") ?? null;
      if (tl !== tilt) resetTilt();
      if (tl) {
        tilt = tl;
        const r = tl.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        tl.style.transition = "transform .25s ease-out";
        tl.style.transform = `perspective(900px) rotateY(${(x * 9).toFixed(2)}deg) rotateX(${(-y * 9).toFixed(2)}deg)`;
      }
    };
    const over = (e: PointerEvent) => {
      const t = e.target as Element;
      const big = t.closest<HTMLElement>("[data-cursor]");
      const link = t.closest("a,button,input,textarea,select,label");
      if (link && !(big && link === big)) {
        c.classList.remove("big");
        c.classList.add("link");
        return;
      }
      c.classList.remove("link");
      if (big) {
        lbl.textContent = big.dataset.cursor!;
        c.classList.add("big");
      } else c.classList.remove("big");
    };
    const leave = () => {
      c.classList.add("hidden");
      resetMag();
      resetTilt();
    };
    addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerover", over);
    document.addEventListener("pointerleave", leave);
    return () => {
      removeEventListener("pointermove", move);
      document.removeEventListener("pointerover", over);
      document.removeEventListener("pointerleave", leave);
    };
  }, []);

  useTicker(() => {
    const p = pos.current;
    if (!p.on) return;
    p.x = lerp(p.x, p.tx, 0.22);
    p.y = lerp(p.y, p.ty, 0.22);
    ref.current!.style.transform = `translate3d(${p.x.toFixed(1)}px,${p.y.toFixed(1)}px,0)`;
  });

  return (
    <div className="cursor" aria-hidden="true" ref={ref}>
      <i>
        <b />
      </i>
    </div>
  );
}
