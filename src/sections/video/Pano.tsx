"use client";
import { useEffect, useRef } from "react";
import { addMeasure } from "@/lib/engine";
import { panoSVG } from "@/lib/pano";
import { useScrollScene } from "@/hooks/useScrollScene";

// Panorama hero (ANIMATION-SPEC V1): the city strip twice side by side; offset = progress × W × 0.9 + drag,
// track translateX(−(offset mod W)) loops seamlessly; degrees = round(offset / W × 360) mod 360.
const PANO = panoSVG();

export function Pano() {
  const el = useRef<HTMLDivElement>(null);
  const S = useRef({ W: 0, drag: 0, p: 0, apply: () => {} });

  useEffect(() => {
    const st = S.current, root = el.current!, track = root.querySelector<HTMLElement>(".pano-track")!, deg = root.querySelector(".pano-deg")!;
    st.apply = () => {
      if (!st.W) return;
      const off = st.p * st.W * 0.9 + st.drag;
      track.style.transform = `translate3d(${(-(((off % st.W) + st.W) % st.W)).toFixed(1)}px,0,0)`;
      deg.textContent = Math.round(((((off / st.W) * 360) % 360) + 360) % 360) + "°";
    };
    const offM = addMeasure(() => {
      st.W = track.firstElementChild!.getBoundingClientRect().width;
      st.apply();
    });
    let on = false, sx = 0, sd = 0;
    const down = (e: PointerEvent) => {
      on = true;
      sx = e.clientX;
      sd = st.drag;
      root.classList.add("drag");
      try {
        root.setPointerCapture(e.pointerId);
      } catch {}
    };
    const move = (e: PointerEvent) => {
      if (!on) return;
      st.drag = sd - (e.clientX - sx) * 1.3;
      st.apply();
    };
    const end = () => {
      on = false;
      root.classList.remove("drag");
    };
    root.addEventListener("pointerdown", down);
    root.addEventListener("pointermove", move);
    root.addEventListener("pointerup", end);
    root.addEventListener("pointercancel", end);
    return () => {
      offM();
      root.removeEventListener("pointerdown", down);
      root.removeEventListener("pointermove", move);
      root.removeEventListener("pointerup", end);
      root.removeEventListener("pointercancel", end);
    };
  }, []);

  useScrollScene(
    el,
    (p) => {
      S.current.p = p;
      S.current.apply();
    },
    { type: "view", start: 1, end: 0 },
  );

  return (
    <div
      ref={el}
      data-morph-to=""
      data-cursor="Drag"
      className="relative mt-[clamp(48px,6vw,90px)] h-[clamp(320px,64vh,680px)] touch-pan-y overflow-hidden rounded-stage bg-card shadow-[inset_0_0_0_1px_var(--color-line)] fine:cursor-grab [&.drag]:cursor-grabbing"
    >
      <div className="pano-track absolute inset-y-0 left-0 flex will-change-transform [&_svg]:h-full [&_svg]:w-auto [&_svg]:max-w-none [&_svg]:flex-none" dangerouslySetInnerHTML={{ __html: PANO + PANO }} />
      <span className="absolute top-5 left-5 rounded-full bg-white px-3 py-[6px] text-[14px] text-muted shadow-[inset_0_0_0_1px_var(--color-line)]">Scroll or drag to look around</span>
      <span className="pano-deg absolute top-4 right-5 text-[length:clamp(34px,4.6vw,72px)] leading-none font-[640] tracking-[-0.04em] text-ink tabular-nums [font-stretch:112%]">0°</span>
    </div>
  );
}
