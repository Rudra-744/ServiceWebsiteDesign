"use client";
import { type CSSProperties, useRef } from "react";
import { SplitText } from "@/components/motion/SplitText";
import { HEAD } from "@/components/ui/layout";
import { useStackScene } from "@/hooks/useStackScene";

// "Perfect for" stacked cards (ANIMATION-SPEC RE5): sticky on every screen size; the card behind scales and its shade fades in.
const CARDS = [
  ["Homes", "Apartments & housing projects", "Show every unit type and floor layout without building a sample flat for each.", "bg-card"],
  ["Homes", "Villas & bungalows", "Let buyers walk the rooms, gardens and finishes of a standalone home.", "bg-blue text-ink"],
  ["Premium", "Premium & luxury properties", "Present high-end interiors with the detail they deserve.", "bg-blue-soft text-ink"],
  ["Showrooms", "Sample flats & virtual showrooms", "A sample flat that fits in a sales office.", "bg-card"],
  ["Events", "Exhibitions & launch events", "Draw crowds to your stand and let them tour the project on the spot.", "bg-blue text-ink"],
];

export function PerfectFor() {
  const list = useRef<HTMLDivElement>(null);
  useStackScene(list, ".stack-card", ".shade", false);
  return (
    <section data-nav="Perfect for" className="wrap sec-tight">
      <div className={HEAD}>
        <SplitText as="h2" className="d2" text="Perfect for." />
      </div>
      <div ref={list} className="grid">
        {CARDS.map(([idx, t, d, tone], k) => (
          <div
            key={t}
            style={{ "--k": k } as CSSProperties}
            className={`stack-card sticky top-[calc(var(--nav-h)+30px+var(--k,0)*12px)] mb-[22px] flex min-h-[min(62vh,520px)] origin-top flex-col justify-between gap-10 overflow-hidden rounded-stage p-[clamp(26px,3.4vw,52px)] ${tone}`}
          >
            <span className="text-[15px] font-semibold opacity-70">{idx}</span>
            <div>
              <p className="m-0 text-[length:clamp(40px,7vw,120px)] leading-[.92] font-[660] opacity-80 tracking-[-0.045em] [font-stretch:120%]">{t}</p>
              <p className="mt-[14px] mb-0 max-w-[30em] opacity-80">{d}</p>
            </div>
            <span className="shade pointer-events-none absolute inset-0 bg-ink opacity-0" />
          </div>
        ))}
      </div>
    </section>
  );
}
