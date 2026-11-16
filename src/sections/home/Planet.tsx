"use client";
import { useRef } from "react";
import { SplitText } from "@/components/motion/SplitText";
import { map } from "@/lib/motion";
import { panoSVG } from "@/lib/pano";
import { useScrollScene } from "@/hooks/useScrollScene";
import { PLANET_CAPS, PLANET_HOTS } from "@/content/home";

// 360° tiny planet (ANIMATION-SPEC H10), pinned 560svh (500svh phone).
// Stage 3: heading fade, captions and the "inside" HUD follow scroll; a flat panorama strip stands in for the view.
// Stage 5: the WebGL projection (planet → panorama → inside), the camera icon, drag/tilt and the building pins.
const PANO = panoSVG();
const CAP_RANGES = [[0.12, 0.26], [0.34, 0.5], [0.56, 0.7]];

export function Planet() {
  const sec = useRef<HTMLElement>(null);
  useScrollScene(sec, (p) => {
    const root = sec.current!, head = root.querySelector<HTMLElement>(".pl-head")!, narrow = innerWidth < 900;
    const ho = 1 - map(p, 0.22, 0.32);
    head.style.opacity = ho.toFixed(3);
    head.style.transform = `translate3d(0,${((1 - ho) * -40).toFixed(1)}px,0)`;
    head.style.visibility = ho <= 0 ? "hidden" : "";
    root.querySelectorAll(".pl-cap").forEach((c, i) => c.classList.toggle("on", !(narrow && i === 0) && p >= CAP_RANGES[i][0] && p < CAP_RANGES[i][1]));
    root.classList.toggle("inside", p > 0.66);
  });

  return (
    <section data-nav="360° video" className="planet group/pl relative h-[560svh] bg-white max-[899px]:h-[500svh]" data-planet="" aria-label="360° video" ref={sec}>
      <div className="sticky top-0 h-svh overflow-hidden">
        <div className="pl-fallback absolute inset-x-0 top-1/2 flex h-[46vh] -translate-y-1/2 overflow-hidden [&_svg]:h-full [&_svg]:w-auto [&_svg]:max-w-none [&_svg]:flex-none" aria-hidden="true" dangerouslySetInnerHTML={{ __html: PANO + PANO }} />
        <canvas className="pl-cv absolute inset-0 block size-full touch-pan-y fine:group-[.inside]/pl:cursor-grab group-[.drag]/pl:cursor-grabbing!" aria-hidden="true" />
        <svg className="pl-cam pointer-events-none absolute top-0 left-0 -mt-6 -ml-[13px] h-auto w-[26px] will-change-[transform,opacity]" viewBox="0 0 40 64" aria-hidden="true" style={{ opacity: 0 }}>
          <rect x="8" y="2" width="24" height="40" rx="12" fill="#050505" />
          <circle cx="20" cy="16" r="7" fill="#548CFF" />
          <circle cx="20" cy="16" r="2.6" fill="#fff" />
          <rect x="18" y="42" width="4" height="20" fill="#050505" />
        </svg>
        <div className="pl-head absolute top-[calc(var(--nav-h)+12vh)] left-(--pad) grid max-w-[min(560px,42vw)] gap-[22px] will-change-[opacity,transform] max-[899px]:top-[calc(var(--nav-h)+40px)] max-[899px]:right-(--pad) max-[899px]:max-w-none max-[899px]:gap-[14px]">
          <SplitText as="h2" className="d2 max-[899px]:text-[length:clamp(38px,11vw,60px)]!" text="Every angle, captured." />
          <p className="lede fade max-w-[24em]! max-[899px]:text-[16px]!" data-reveal="">
            Professional 360° video that lets viewers look in any direction — in a headset or on their phone.
          </p>
        </div>
        <div className="pointer-events-none absolute right-(--pad) bottom-[9vh] left-(--pad) max-[899px]:top-[calc(var(--nav-h)+40px)] max-[899px]:bottom-auto" aria-hidden="true">
          {PLANET_CAPS.map((c) => (
            <p
              className="pl-cap absolute bottom-0 left-0 m-0 max-w-[15ch] text-[length:clamp(30px,3.7vw,60px)] leading-none font-[640] tracking-[-0.035em] text-ink opacity-0 [font-stretch:116%] [transform:translateY(40px)] [transition:opacity_.6s_var(--e-out),transform_.9s_var(--e-out)] max-[899px]:top-0 max-[899px]:bottom-auto max-[899px]:text-[length:clamp(28px,8vw,40px)] [&.on]:opacity-100 [&.on]:[transform:none] rm:duration-[.01ms]"
              key={c}
            >
              {c}
            </p>
          ))}
        </div>
        <div className="pl-hots pointer-events-none absolute inset-0">
          {PLANET_HOTS.map(([x, ic, t, d]) => (
            <div className="pl-hot group/ph absolute top-0 left-0 opacity-0 transition-opacity duration-400 will-change-transform [&.vis]:opacity-100" data-x={x} key={t}>
              <i className="absolute -top-[9px] -left-[9px] size-[18px] rounded-full bg-blue shadow-[0_0_0_3px_#fff] after:absolute after:-inset-[9px] after:animate-[hotPulse_2s_var(--e-out)_infinite] after:rounded-full after:border-2 after:border-blue after:content-['']" />
              <span className="pl-card absolute bottom-5 -left-[10px] grid origin-[10px_100%] gap-[6px] rounded-[18px] bg-ink px-[14px] py-[10px] whitespace-nowrap text-white [transition:padding_.5s_var(--e-out)] group-[.act]/ph:px-4 group-[.act]/ph:pt-[14px] group-[.act]/ph:pb-4">
                <b className="flex items-center gap-2 text-[15px] font-semibold">
                  <svg aria-hidden="true" className="size-[17px] flex-none text-sky">
                    <use href={`#${ic}`} />
                  </svg>
                  {t}
                </b>
                <small className="block max-h-0 max-w-0 overflow-hidden text-[14px] leading-[1.35] whitespace-normal text-[#c9c9cf] [transition:max-height_.5s_var(--e-out),max-width_.5s_var(--e-out)] group-[.act]/ph:max-h-[4em] group-[.act]/ph:w-[230px] group-[.act]/ph:max-w-[230px] max-[899px]:text-[13.5px] max-[899px]:group-[.act]/ph:w-[190px] max-[899px]:group-[.act]/ph:max-w-[190px]">{d}</small>
              </span>
            </div>
          ))}
        </div>
        <div className="pointer-events-none absolute right-(--pad) bottom-7 left-(--pad) flex items-center gap-[10px] opacity-0 [transform:translateY(16px)] [transition:opacity_.5s,transform_.7s_var(--e-out)] rm:duration-[.01ms] group-[.inside]/pl:pointer-events-auto group-[.inside]/pl:opacity-100 group-[.inside]/pl:[transform:none]">
          <span className={`${PILL} inline-flex text-muted [.touch-tilt_&]:hidden`}>Drag to look around</span>
          <button className={`pl-tilt ${PILL} hidden font-semibold text-ink [.touch-tilt_&]:inline-flex [&.on]:bg-blue [&.on]:shadow-none`} type="button">
            Tilt to look around
          </button>
          <span className="pl-deg ml-auto text-[length:clamp(34px,4.2vw,64px)] leading-none font-[640] tracking-[-0.04em] text-ink [font-stretch:112%]">0°</span>
        </div>
      </div>
    </section>
  );
}

const PILL = "h-[38px] items-center rounded-full bg-white px-4 text-[14px] whitespace-nowrap shadow-[inset_0_0_0_1px_var(--color-line)]";
