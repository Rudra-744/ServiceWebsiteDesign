"use client";
import { type CSSProperties, useEffect, useRef, useState } from "react";
import { SplitText } from "@/components/motion/SplitText";
import { HEAD_SPLIT } from "@/components/ui/layout";
import { pad } from "@/lib/motion";
import { useScrollScene } from "@/hooks/useScrollScene";

// In-headset questions timeline (ANIMATION-SPEC HB5): view scene start .78, end .22; time = round(p × 760) s;
// cues at 9.2 / 35.8 / 63.8 / 93.4 % light up when passed; the current question card swaps in 140 ms after each cue.
const Q = [
  { at: "1:10", type: "Yes or no", t: "Is this your first time in VR?", o: ["Yes", "No"] },
  { at: "4:32", type: "Multiple options", t: "Which room did you enjoy most?", o: ["Atrium", "East wing", "Sculpture hall"] },
  { at: "8:05", type: "Rating", t: "How comfortable was the experience?", stars: 4 },
  { at: "11:50", type: "Number", t: "How many exhibits do you remember?", num: "7" },
];
const CUES = [0.092, 0.358, 0.638, 0.934];
const TYPES = [
  ["i-text", "User details", "Short text input"],
  ["i-yesno", "Yes or no", "Simple binary choice"],
  ["i-radio", "Multiple options", "Pick one from many"],
  ["i-checklist", "Multiple choice", "Pick many from a list"],
  ["i-hash", "Number", "Numeric input"],
  ["i-cal", "Date", "Date picker"],
  ["i-star", "Rating", "Star rating"],
];
const QOPT = "rounded-[10px] px-3 py-[10px] text-[14px] text-stone shadow-[inset_0_0_0_1px_var(--color-line)]";
const QSEL = "bg-blue-soft text-ink shadow-[inset_0_0_0_1.5px_var(--color-blue)]";

export function Interactions() {
  const ix = useRef<HTMLDivElement>(null);
  const [cue, setCue] = useState(-1); // last cue passed (timeline rows + cue chips)
  const [card, setCard] = useState(-1); // question shown in the card (lags 140 ms)
  const [show, setShow] = useState(false);
  const tmr = useRef(0);
  const cueNow = useRef(-1);

  useEffect(() => () => clearTimeout(tmr.current), []);
  useScrollScene(
    ix,
    (p) => {
      const root = ix.current!;
      root.querySelector<HTMLElement>(".tl-head")!.style.left = (p * 100).toFixed(2) + "%";
      root.querySelector<HTMLElement>(".tl-fill")!.style.width = (p * 100).toFixed(2) + "%";
      const s = Math.round(p * 760);
      root.querySelector(".ix-time")!.textContent = `${Math.floor(s / 60)}:${pad(s % 60)}`;
      let k = -1;
      CUES.forEach((c, i) => p >= c && (k = i));
      if (k === cueNow.current) return;
      cueNow.current = k;
      setCue(k);
      setShow(false);
      clearTimeout(tmr.current);
      if (k >= 0)
        tmr.current = window.setTimeout(() => {
          setCard(k);
          setShow(true);
        }, 140);
    },
    { type: "view", start: 0.78, end: 0.22 },
  );

  const q = Q[Math.max(0, card)];
  return (
    <section data-nav="Interactions" className="wrap sec">
      <div className={HEAD_SPLIT}>
        <SplitText as="h2" className="d2" text="Ask questions inside the experience." />
        <p className="lede fade" data-reveal="">
          Build questions once, then place them at exact moments on a video&apos;s timeline. When a headset reaches a cue, the question appears in VR and the answer is recorded.
        </p>
      </div>
      <div ref={ix} className="grid gap-4 min-[1000px]:grid-cols-[1.1fr_.9fr] min-[1000px]:items-stretch">
        <div className="grid gap-[14px] rounded-card bg-card p-[clamp(16px,2vw,26px)] shadow-[0_0_0_1px_var(--color-line)]">
          <div className="flex items-center justify-between text-[14px] text-muted">
            <span>
              <b className="text-[17px] font-[620] text-ink">Onboarding walkthrough</b>
              <br />
              gallery-tour.mp4, 12:40
            </span>
            <span className="ix-time tabular-nums">0:00</span>
          </div>
          <div className="relative mt-4 mb-2 h-16 rounded-m bg-[#ededf0]">
            <span className="tl-fill absolute inset-y-0 left-0 w-0 rounded-[14px_0_0_14px] bg-[#d6e2ff]" />
            {CUES.map((c, i) => (
              <span
                key={c}
                style={{ left: `${c * 100}%` }}
                className={`absolute top-3 bottom-3 -ml-[15px] grid w-[30px] place-items-center rounded-[8px] text-[11px] font-bold text-ink [transition:background-color_.3s,transform_.4s_var(--e-spring)] ${i <= cue ? "bg-blue [transform:scale(1.12)]" : "bg-[#c9d9ff]"}`}
              >
                Q
              </span>
            ))}
            <span className="tl-head absolute -top-2 -bottom-2 left-0 w-[2px] bg-blue-deep before:absolute before:-top-[5px] before:-left-[5px] before:size-3 before:rounded-full before:bg-blue-deep before:content-['']" />
          </div>
          <div className="flex justify-between text-[12.5px] text-muted tabular-nums">
            <span>0:00</span>
            <span>12:40</span>
          </div>
          <div className="mt-[10px] grid gap-[6px]">
            {Q.map((x, i) => (
              <div key={x.t} className={`grid grid-cols-[56px_1fr] items-center gap-[10px] rounded-[12px] px-3 py-[11px] text-[14.5px] [transition:background-color_.35s] ${i === cue ? "bg-blue-soft" : ""}`}>
                <span className="rounded-[6px] bg-white py-[3px] text-center text-[12.5px] text-muted tabular-nums">{x.at}</span>
                {x.t}
              </div>
            ))}
          </div>
        </div>
        <div className="relative grid min-h-[360px] place-items-center overflow-hidden rounded-card bg-card p-6 shadow-[0_0_0_1px_var(--color-line)]">
          <svg className="absolute inset-0 size-full" viewBox="0 0 400 300" preserveAspectRatio="none" aria-hidden="true">
            <g stroke="#E3E3E8" strokeWidth="1" fill="none">
              <path d="M200 150 L0 300 M200 150 L100 300 M200 150 L200 300 M200 150 L300 300 M200 150 L400 300 M200 150 L0 0 M200 150 L100 0 M200 150 L300 0 M200 150 L400 0" />
              <path d="M0 230 H400 M0 270 H400 M0 70 H400 M0 30 H400" />
            </g>
          </svg>
          <div className={`relative grid w-[min(320px,100%)] gap-[10px] rounded-[18px] bg-white p-[18px] shadow-[0_0_0_1px_var(--color-line)] [transition:transform_.6s_var(--e-spring),opacity_.35s] ${show ? "opacity-100" : "[transform:scale(.85)] opacity-0"}`}>
            <small className="text-[12px] font-semibold text-blue-deep">{card >= 0 ? q.type : ""}</small>
            <b className="text-[17px] leading-[1.25] font-[620]">{card >= 0 ? q.t : ""}</b>
            <div className="grid gap-2">
              {card >= 0 &&
                (q.o ? (
                  q.o.map((x, i) => (
                    <span key={x} className={`${QOPT} ${i === 0 ? QSEL : ""}`}>
                      {x}
                    </span>
                  ))
                ) : q.stars ? (
                  <span className="text-[28px] tracking-[4px] text-blue">
                    {"★".repeat(q.stars)}
                    <span className="text-[#D9D9DE]">{"★".repeat(5 - q.stars)}</span>
                  </span>
                ) : (
                  <span className={`${QOPT} ${QSEL} text-[22px] font-[640]`}>{q.num}</span>
                ))}
            </div>
          </div>
          <span className="absolute bottom-3 left-4 text-[12px] text-muted">Illustration of a question shown in VR</span>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-[10px] min-[700px]:grid-cols-4 min-[1100px]:grid-cols-7" data-reveal="">
        {TYPES.map(([ic, b, s], i) => (
          <div key={b} className="pop grid gap-3 rounded-[16px] bg-card p-4" style={{ "--i": i } as CSSProperties}>
            <svg className="size-[22px] text-blue-deep">
              <use href={`#${ic}`} />
            </svg>
            <div>
              <b className="block text-[15px] font-semibold">{b}</b>
              <small className="text-[12.5px] text-muted">{s}</small>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
