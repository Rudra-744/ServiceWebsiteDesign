"use client";
import Image from "next/image";
import { useRef } from "react";
import { Button } from "@/components/ui/Button";
import { BAND, BAND_P } from "@/components/ui/layout";
import { contactHref } from "@/content/site";
import { engine } from "@/lib/engine";
import { useScrollScene } from "@/hooks/useScrollScene";

// Closing cornflower band (ANIMATION-SPEC R9). With `quest`, the Quest photo sits in the corner at −14°
// and drifts translateY((0.5 − p) × 90px) over a view scene (start 1, end 0).
export function CtaBand({ title, text, label, service, quest }: { title: string; text: string; label: string; service: string; quest?: boolean }) {
  const band = useRef<HTMLDivElement>(null);
  useScrollScene(
    band,
    (p) => {
      if (!quest || engine.RM) return;
      band.current!.querySelector<HTMLElement>(".rband-q")!.style.setProperty("--py", ((0.5 - p) * 90).toFixed(1) + "px");
    },
    { type: "view", start: 1, end: 0 },
  );
  return (
    <section data-nav="Get a quote" className="wrap sec-tight">
      <div ref={band} className={`band relative isolate overflow-hidden ${BAND} ${quest ? "max-[999px]:pb-[clamp(170px,44vw,240px)]" : ""}`} data-reveal="">
        <div className="relative z-1">
          <h2 className="d2 rv">{title}</h2>
          <p className={`fade ${BAND_P}`}>{text}</p>
        </div>
        <Button href={contactHref(service)} label={label} variant="paper" magnetic className="fade z-1" />
        {quest && (
          <Image
            className="rband-q pointer-events-none absolute right-[-5%] bottom-[-22%] z-0 h-auto w-[clamp(210px,30vw,500px)] [transform:translate3d(0,var(--py,0px),0)_rotate(-14deg)] max-[999px]:right-[-10%] max-[999px]:bottom-[-16%]"
            src="/images/quest3.png"
            alt=""
            aria-hidden="true"
            width={537}
            height={402}
            sizes="(max-width: 999px) 44vw, 30vw"
          />
        )}
      </div>
    </section>
  );
}
