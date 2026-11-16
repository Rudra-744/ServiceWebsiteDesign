"use client";
import { useRef } from "react";
import { SplitText } from "@/components/motion/SplitText";
import { HEAD_SPLIT } from "@/components/ui/layout";
import { useScrollScene } from "@/hooks/useScrollScene";

// "From upload to answers in six steps" (ANIMATION-SPEC HB6): view scene start .72, end .5; the line fills scaleY(p);
// step i turns on when p ≥ i / count × .96 + .01.
const STEPS = [
  ["Connect your headsets", "Headsets sign in through VR HUB and start reporting battery, storage and network status. Each appears in your fleet with its number, model and group."],
  ["Upload your VR video", "Choose mono, side-by-side or over-under, add a thumbnail and upload. Large files go to cloud storage in parallel parts."],
  ["Build a configuration", "Set volume and brightness, then attach a set of videos or a set of interactions."],
  ["Group and sync", "Put headsets into a group, assign the configuration and sync. Follow each headset from not synced to synced."],
  ["Run the session", "Pick what to play, choose the headsets and send Play, Pause or Reset — or schedule it once, daily or weekly."],
  ["Review the results", "See answers by question, device and interaction, plus completion rates and views over time. Export to CSV."],
];

export function HowItWorks() {
  const ol = useRef<HTMLOListElement>(null);
  useScrollScene(
    ol,
    (p) => {
      const root = ol.current!;
      root.parentElement!.querySelector<HTMLElement>(".hiw-line i")!.style.transform = `scaleY(${p.toFixed(4)})`;
      root.querySelectorAll("li").forEach((li, i) => li.classList.toggle("on", p >= (i / STEPS.length) * 0.96 + 0.01));
    },
    { type: "view", start: 0.72, end: 0.5 },
  );
  return (
    <section data-nav="Six steps" className="wrap sec">
      <div className={HEAD_SPLIT}>
        <SplitText as="h2" className="d2" text="From upload to answers in six steps." />
        <p className="lede fade" data-reveal="">
          The same flow every time: connect headsets, prepare content once, then run as many sessions as you need.
        </p>
      </div>
      <div className="relative">
        <span className="hiw-line absolute top-5 bottom-5 left-[19px] w-[2px] bg-[#e6e6ea]">
          <i className="absolute inset-0 origin-top bg-blue [transform:scaleY(0)]" />
        </span>
        <ol ref={ol} className="relative m-0 grid list-none gap-[clamp(36px,5vw,64px)] py-0 pr-0 pl-14">
          {STEPS.map(([t, d], i) => (
            <li key={t} className="group/hw relative">
              <span className="absolute top-0 -left-14 grid size-10 place-items-center rounded-full bg-white text-[13.5px] font-semibold text-muted shadow-[inset_0_0_0_1.5px_#dadbe2] [transition:background-color_.4s,color_.4s,box-shadow_.4s] group-[.on]/hw:bg-blue group-[.on]/hw:text-ink group-[.on]/hw:shadow-none">{i + 1}</span>
              <div className="opacity-35 [transform:translateX(16px)] [transition:opacity_.6s,transform_.8s_var(--e-out)] group-[.on]/hw:opacity-100 group-[.on]/hw:[transform:none]">
                <h3 className="d3">{t}</h3>
                <p className="mt-2 mb-0 max-w-[38em] text-stone">{d}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
