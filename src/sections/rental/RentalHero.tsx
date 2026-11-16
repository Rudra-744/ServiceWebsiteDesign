"use client";
import Image from "next/image";
import { type CSSProperties, useEffect, useRef } from "react";
import { SplitText } from "@/components/motion/SplitText";
import { Button } from "@/components/ui/Button";
import { contactHref } from "@/content/site";
import { engine } from "@/lib/engine";
import { clamp, lerp } from "@/lib/motion";
import { scrollToY } from "@/lib/scroll";
import { useScrollScene } from "@/hooks/useScrollScene";
import { Crumb } from "@/sections/shared/PageIntro";

// Rental hero (ANIMATION-SPEC R1): cornflower stage wipes up, rings scale in, the Quest rises then bobs,
// tags pop in. Scroll parallax (sy = scrollY / vh) and pointer depth (eased 0.09 per frame, loop stops when settled).
const RING = "rh-ring pointer-events-none absolute top-[48%] left-1/2 aspect-square rounded-full [transform:translate(-50%,-50%)] before:absolute before:inset-0 before:rounded-full before:border-[1.5px] before:content-['']";
const RING_IN = "motion:before:opacity-0 motion:before:[transform:scale(.6)] in:before:opacity-100 in:before:[transform:none]";
const POP = "absolute z-3 motion:opacity-0 motion:[transform:translate3d(0,14px,0)_scale(.9)] in:opacity-100 in:[transform:none]";
const TAG = "inline-flex h-[38px] items-center gap-[9px] rounded-full px-[15px] text-[14px] font-[560] text-ink [font-stretch:104%]";

export function RentalHero() {
  const stage = useRef<HTMLElement>(null);
  const S = useRef({ mx: 0, my: 0, tx: 0, ty: 0, sy: 0, raf: 0, kick: () => {} });

  useEffect(() => {
    const st = S.current, el = stage.current!;
    if (engine.RM) return;
    const fl = el.querySelector<HTMLElement>(".rh-float")!, rings = [...el.querySelectorAll<HTMLElement>(".rh-ring")];
    const apply = () => {
      st.mx = lerp(st.mx, st.tx, 0.09);
      st.my = lerp(st.my, st.ty, 0.09);
      fl.style.transform = `translate3d(${(st.mx * 22).toFixed(2)}px,${(st.my * 16 - st.sy * 70).toFixed(2)}px,0) rotate(${(st.mx * 5).toFixed(2)}deg)`;
      rings.forEach((r, i) => {
        const d = 8 + i * 9;
        r.style.transform = `translate(-50%,-50%) translate3d(${(-st.mx * d).toFixed(2)}px,${(-st.my * d - st.sy * (14 + i * 22)).toFixed(2)}px,0)`;
      });
      st.raf = Math.abs(st.mx - st.tx) + Math.abs(st.my - st.ty) > 0.002 ? requestAnimationFrame(apply) : 0;
    };
    st.kick = () => {
      if (!st.raf) st.raf = requestAnimationFrame(apply);
    };
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      st.tx = (e.clientX - r.left) / r.width - 0.5;
      st.ty = (e.clientY - r.top) / r.height - 0.5;
      st.kick();
    };
    const leave = () => {
      st.tx = st.ty = 0;
      st.kick();
    };
    if (engine.FINE) {
      el.addEventListener("pointermove", move);
      el.addEventListener("pointerleave", leave);
    }
    st.kick();
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
      cancelAnimationFrame(st.raf);
      st.raf = 0;
    };
  }, []);

  useScrollScene(
    stage,
    () => {
      S.current.sy = clamp(scrollY / engine.vh);
      S.current.kick();
    },
    { type: "view", start: 1, end: 0 },
  );

  const toPlanner = () => {
    const rp = document.querySelector<HTMLElement>("#planner");
    if (rp) scrollToY(rp.getBoundingClientRect().top + scrollY - 20);
  };

  return (
    <header data-nav="Headset rental" className="wrap grid gap-[clamp(36px,5vw,72px)] pt-[calc(var(--nav-h)+clamp(48px,7vw,110px))] pb-[clamp(24px,4vw,64px)] min-[1000px]:min-h-svh min-[1000px]:grid-cols-[1.05fr_.95fr] min-[1000px]:items-end min-[1000px]:pb-[clamp(32px,4vw,56px)]">
      <div>
        <Crumb label="Headset rental" />
        <SplitText as="h1" className="d1 max-w-[11ch]" text="Rent VR headsets for any occasion." />
        <div className="mt-[clamp(24px,3vw,40px)] grid gap-[26px]" data-reveal="">
          <p className="lede fade">Corporate events, exhibitions, classrooms and product demos. We bring the headsets, set them up and stay on hand until the last session ends.</p>
          <div className="fade flex flex-wrap gap-3" style={{ "--d": ".3s" } as CSSProperties}>
            <Button href={contactHref("Headset rental")} label="Rent VR headsets" variant="blue" magnetic />
            <Button label="Size your rental" variant="line" onClick={toPlanner} />
          </div>
        </div>
      </div>
      <figure
        ref={stage}
        className="group/rh relative isolate m-0 aspect-[1/.9] overflow-hidden rounded-stage bg-blue text-ink motion:[clip-path:inset(100%_0_0_0_round_36px)] motion:[transition:clip-path_1.3s_var(--e-io)_.15s] in:[clip-path:inset(0_0_0_0_round_36px)] min-[1000px]:aspect-auto min-[1000px]:h-[min(76svh,720px)]"
        data-reveal=""
        data-morph-to=""
        aria-hidden="true"
      >
        <span className={`${RING} ${RING_IN} w-[44%] before:border-white/55 motion:before:[transition:transform_1.6s_var(--e-out)_.5s,opacity_1s_.5s]`} />
        <span className={`${RING} w-[70%] before:border-dashed before:border-[rgba(5,5,5,.22)] before:[animation:spin_60s_linear_infinite] motion:before:opacity-0 motion:before:[transition:opacity_1s_.62s] in:before:opacity-100`} />
        <span className={`${RING} ${RING_IN} w-[98%] before:border-[rgba(5,5,5,.16)] motion:before:[transition:transform_1.6s_var(--e-out)_.74s,opacity_1s_.74s]`} />
        <span className="rh-float absolute inset-0 z-2 grid place-items-center will-change-transform">
          <Image
            className="h-auto w-[72%] max-w-[520px] [filter:drop-shadow(0_24px_30px_rgba(5,5,5,.22))] motion:opacity-0 motion:[transform:translate3d(0,22%,0)_scale(.88)_rotate(-6deg)] motion:[transition:opacity_.9s_var(--e-out)_.55s,transform_1.6s_var(--e-out)_.5s] in:opacity-100 in:[transform:none] in:[animation:rhBob_6s_ease-in-out_2.2s_infinite] rm:animate-none!"
            src="/images/quest3.png"
            alt=""
            width={537}
            height={402}
            sizes="(max-width: 999px) 72vw, 520px"
            loading="eager"
            fetchPriority="high"
          />
        </span>
        <span className="absolute bottom-[13%] left-1/2 z-1 h-[6%] w-[46%] rounded-full bg-[rgba(5,5,5,.2)] blur-[12px] [transform:translateX(-50%)] motion:opacity-0 motion:[transition:opacity_1.2s_1s] in:opacity-100 in:[animation:rhShadow_6s_ease-in-out_2.2s_infinite] rm:animate-none!" />
        <span className={`${POP} ${TAG} top-[clamp(14px,2vw,24px)] left-[clamp(14px,2vw,24px)] bg-paper motion:[transition:opacity_.6s_var(--e-out)_1.05s,transform_.9s_var(--e-spring)_1.05s]`}>
          <i className="relative size-2 rounded-full bg-ok after:absolute after:-inset-[5px] after:rounded-full after:border-[1.5px] after:border-ok after:[animation:rhPing_1.8s_var(--e-out)_infinite] after:content-['']" />
          Ready to rent
        </span>
        <span className={`${POP} ${TAG} top-[clamp(14px,2vw,24px)] right-[clamp(14px,2vw,24px)] shadow-[inset_0_0_0_1.5px_rgba(5,5,5,.75)] motion:[transition:opacity_.6s_var(--e-out)_1.15s,transform_.9s_var(--e-spring)_1.15s]`}>Meta Quest 3</span>
        <span className={`${POP} bottom-[clamp(14px,2vw,26px)] left-[clamp(16px,2.4vw,30px)] flex items-baseline gap-[10px] motion:[transition:opacity_.6s_var(--e-out)_1.25s,transform_.9s_var(--e-spring)_1.25s]`}>
          <b className="text-[length:clamp(34px,3.6vw,56px)] leading-none font-[660] tracking-[-0.04em] [font-stretch:118%]">200+</b>
          <span className="max-w-[9em] text-[14px] leading-[1.2] font-[540]">headsets in the fleet</span>
        </span>
      </figure>
    </header>
  );
}
