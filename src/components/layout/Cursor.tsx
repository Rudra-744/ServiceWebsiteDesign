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
      c.classList.remove("is-out");
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
        c.classList.remove("is-big");
        c.classList.add("is-link");
        return;
      }
      c.classList.remove("is-link");
      if (big) {
        lbl.textContent = big.dataset.cursor!;
        c.classList.add("is-big");
      } else c.classList.remove("is-big");
    };
    const leave = () => {
      c.classList.add("is-out");
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
    <div className="cursor group/cur pointer-events-none fixed top-0 left-0 z-100 hidden fine-motion:block" aria-hidden="true" ref={ref}>
      <i className="absolute -top-[6px] -left-[6px] grid size-3 place-items-center rounded-full bg-ink [transition:width_.5s_var(--e-out),height_.5s_var(--e-out),left_.5s_var(--e-out),top_.5s_var(--e-out),background-color_.3s,opacity_.3s] group-[.is-link]/cur:-top-5 group-[.is-link]/cur:-left-5 group-[.is-link]/cur:size-10 group-[.is-link]/cur:bg-transparent group-[.is-link]/cur:shadow-[inset_0_0_0_1.5px_var(--color-ink)] group-[.is-big]/cur:-top-[44px] group-[.is-big]/cur:-left-[44px] group-[.is-big]/cur:size-[88px] group-[.is-big]/cur:bg-blue! group-[.is-big]/cur:shadow-none group-[.is-out]/cur:opacity-0">
        <b className="text-[12.5px] font-semibold text-ink opacity-0 transition-opacity duration-300 [font-stretch:104%] group-[.is-big]/cur:opacity-100" />
      </i>
    </div>
  );
}
