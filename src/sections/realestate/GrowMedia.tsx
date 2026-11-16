"use client";
import Image from "next/image";
import { useRef } from "react";
import { E, lerp, map } from "@/lib/motion";
import { useScrollScene } from "@/hooks/useScrollScene";

// Hero photo that grows (ANIMATION-SPEC RE1): view scene start 1, end 0; t = E.out(map(p, 0, .5));
// figure scale .9 → 1 and radius 56 → 20 px; the image scale 1.18 → 1.02 with a (p − .5) × −5% parallax.
export function GrowMedia() {
  const fig = useRef<HTMLElement>(null);
  useScrollScene(
    fig,
    (p) => {
      const el = fig.current!, t = E.out(map(p, 0, 0.5));
      el.style.transform = `scale(${lerp(0.9, 1, t).toFixed(4)})`;
      el.style.borderRadius = lerp(56, 20, t).toFixed(1) + "px";
      el.querySelector<HTMLElement>("img")!.style.transform = `scale(${lerp(1.18, 1.02, p).toFixed(4)}) translate3d(0,${((p - 0.5) * -5).toFixed(2)}%,0)`;
    },
    { type: "view", start: 1, end: 0 },
  );
  return (
    <figure ref={fig} data-morph-to="" className="relative mx-0 mt-[clamp(48px,6vw,90px)] mb-0 h-[clamp(280px,72vh,760px)] origin-top overflow-hidden rounded-stage bg-render will-change-transform">
      <Image className="object-cover will-change-transform" src="/images/realestate.jpg" alt="Architectural model of apartment buildings beside a VR headset" fill sizes="(max-width: 1440px) 100vw, 1440px" loading="eager" fetchPriority="high" />
    </figure>
  );
}
