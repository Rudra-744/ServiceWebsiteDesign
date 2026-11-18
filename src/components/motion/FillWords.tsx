"use client";
import { useRef } from "react";
import { useScrollScene } from "@/hooks/useScrollScene";

// Statement whose words fill in with scroll (ANIMATION-SPEC R2): view scene start 0.82, end 0.38;
// words lit = round(clamp(p / 0.8) × count). Reduced motion shows every word in ink.
export function FillWords({ text, nav }: { text: string; nav: string }) {
  const p = useRef<HTMLParagraphElement>(null);
  const last = useRef(-1);
  const words = text.split(/\s+/);
  useScrollScene(
    p,
    (k) => {
      const n = Math.round(Math.min(1, k / 0.8) * words.length);
      if (n === last.current) return;
      last.current = n;
      p.current!.querySelectorAll("span[aria-hidden]").forEach((w, i) => w.classList.toggle("on", i < n));
    },
    { type: "view", start: 0.82, end: 0.38 },
  );
  return (
    <section data-nav={nav} className="wrap py-[clamp(90px,13vw,200px)]">
      <p ref={p} className="m-0 max-w-[23ch] text-[length:clamp(30px,4.3vw,70px)] leading-[1.06] font-semibold tracking-[-0.032em] [font-stretch:110%]">
        <span className="sr-only">{text}</span>
        {words.map((w, i) => (
          <span key={i} aria-hidden="true" className="text-[rgba(5,5,5,.14)] [transition:color_.45s_var(--e-out)] rm:text-ink [&.on]:text-ink">
            {w}
            {i < words.length - 1 ? " " : ""}
          </span>
        ))}
      </p>
    </section>
  );
}
