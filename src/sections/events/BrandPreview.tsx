"use client";
import { useRef, useState } from "react";
import { SplitText } from "@/components/motion/SplitText";
import { FIELD_INPUT, FIELD_LABEL } from "@/components/ui/field";
import { engine } from "@/lib/engine";

// "Made for your brand" (ANIMATION-SPEC E4): type a name (max 22) and pick an event type; both headset lenses show the
// welcome (second lens shifted −4% for stereo); each name change replays a 0.35 s bump. Pointer tilts the headset.
const SCENES = [
  ["launch", "Product launch", "Welcome to the launch of", "Your brand"],
  ["wedding", "Wedding", "Welcome to the wedding of", "Riya & Arjun"],
  ["school", "School fair", "Welcome to the science fair at", "Your school"],
] as const;

export function BrandPreview() {
  const [name, setName] = useState("");
  const [sc, setSc] = useState(0);
  const [touched, setTouched] = useState(false);
  const shell = useRef<HTMLDivElement>(null);
  const shown = name.trim() || SCENES[sc][3];

  const tilt = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!engine.FINE || engine.RM) return;
    const r = e.currentTarget.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
    shell.current!.style.transform = `rotateY(${(x * 14).toFixed(2)}deg) rotateX(${(-y * 10).toFixed(2)}deg)`;
  };

  return (
    <section data-nav="Made for your brand" className="wrap sec">
      <div className="grid gap-[clamp(36px,5vw,64px)] min-[1000px]:grid-cols-[.85fr_1.15fr] min-[1000px]:items-center min-[1000px]:gap-[5vw]">
        <div>
          <SplitText as="h2" className="d2" text="Made for your brand." />
          <p className="lede fade mt-[22px]" data-reveal="">
            Every experience is tailored to your event, product and goals. Type a name to see how guests are welcomed inside the headset.
          </p>
          <div className="mt-[clamp(26px,3vw,40px)] grid max-w-[460px] gap-[14px]" data-reveal="">
            <div className="fade relative">
              <input
                id="eb-name"
                className={FIELD_INPUT}
                type="text"
                maxLength={22}
                placeholder=" "
                autoComplete="off"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setTouched(true);
                }}
              />
              <label htmlFor="eb-name" className={FIELD_LABEL}>
                Your brand or event name
              </label>
            </div>
            <div className="fade flex flex-wrap gap-2 [--d:.25s]" role="radiogroup" aria-label="Event type">
              {SCENES.map(([k, label], i) => (
                <button
                  key={k}
                  type="button"
                  role="radio"
                  aria-checked={i === sc}
                  onClick={() => {
                    setSc(i);
                    setTouched(true);
                  }}
                  className="h-11 rounded-full bg-card px-4 text-[15px] font-[560] text-stone shadow-[inset_0_0_0_1px_var(--color-line)] [transition:background-color_.35s,color_.35s,box-shadow_.35s] aria-checked:bg-blue aria-checked:text-ink aria-checked:shadow-none"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div
          className="relative grid justify-items-center rounded-stage bg-card px-[clamp(16px,3vw,48px)] pt-[clamp(34px,5.4vw,80px)] pb-[clamp(22px,3vw,36px)] [perspective:1100px] motion:opacity-0 motion:[transform:translate3d(0,50px,0)_scale(.96)] motion:[transition:opacity_1s_var(--e-out),transform_1.3s_var(--e-out)] in:opacity-100 in:[transform:none]"
          data-reveal=""
          aria-hidden="true"
          onPointerMove={tilt}
          onPointerLeave={() => (shell.current!.style.transform = "")}
        >
          <div ref={shell} className="relative flex aspect-[2.1/1] w-full max-w-[560px] gap-[5%] rounded-[999px/100%] bg-paper px-[6%] pt-[6%] pb-[9%] shadow-[inset_0_0_0_1.5px_var(--color-line),0_40px_70px_-40px_rgba(5,5,5,.4)] [transform-style:preserve-3d] [transition:transform_.5s_var(--e-out)]">
            {[0, 1].map((j) => (
              <div key={j} className="grid flex-1 place-items-center overflow-hidden rounded-[46%] bg-blue p-[6%] text-center">
                <div className={`grid justify-items-center gap-1 ${j ? "[transform:translateX(-4%)]" : ""}`}>
                  <small className="text-[length:clamp(9.5px,.9vw,12.5px)] leading-[1.2] font-[540]">{SCENES[sc][2]}</small>
                  <b key={shown} className={`text-[length:clamp(17px,2.3vw,32px)] leading-none font-[680] tracking-[-0.03em] break-words [font-stretch:116%] ${touched ? "animate-[ebBump_.35s_var(--e-out)] rm:animate-none" : ""}`}>
                    {shown}
                  </b>
                  <span className="mt-1 inline-flex items-center gap-[5px] text-[length:clamp(9px,.8vw,11.5px)] text-[rgba(5,5,5,.7)] before:size-[5px] before:rounded-full before:bg-paper before:[animation:blink_1.4s_steps(1)_infinite] before:content-['']">Look around to begin</span>
                </div>
              </div>
            ))}
            <span className="absolute bottom-[-1px] left-1/2 h-[24%] w-[15%] -translate-x-1/2 rounded-[50%_50%_0_0/100%_100%_0_0] bg-card shadow-[inset_0_1.5px_0_var(--color-line)]" />
          </div>
          <p className="mt-[22px] mb-0 text-[13.5px] text-muted">What guests see when they put the headset on</p>
        </div>
      </div>
    </section>
  );
}
