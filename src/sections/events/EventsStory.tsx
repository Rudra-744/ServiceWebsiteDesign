"use client";
import { useRef } from "react";
import { E, clamp, lerp, pad, rnd } from "@/lib/motion";
import { SC, Story } from "@/sections/shared/Story";

// "One guest, five minutes" (ANIMATION-SPEC E3) on the shared story frame with a blue panel, k_j = clamp((P − j) / 0.8):
// crowd fills the stations and queues → headset fitted on a ring timer → inside a 360° scene → post gets likes and replies.
const STEPS: [string, string][] = [
  ["Your stand draws a crowd", "Headsets on happy faces pull people in. A queue forms on its own."],
  ["Fitted in under a minute", "Our team fits the headset, adds a fresh cover and starts the experience."],
  ["Inside your world", "Your product, venue or story, all around them in 360°."],
  ["They leave talking about you", "Photos, posts and word of mouth long after the event ends."],
];
const G = 18;
const GUESTS = Array.from({ length: G }, (_, i) => ({
  w: rnd(i + 9) > 0.7,
  from: [20 + rnd(i + 1) * 360, 150 + rnd(i + 40) * 140],
  to: i < 4 ? [150 + i * 33.3, 84] : [200 + (i % 2 ? 9 : -9), 132 + (i - 4) * 9.5],
}));
const POPS = [
  ["Where is this?", "top-[16%] left-[6%] origin-bottom-left rounded-[999px_999px_999px_6px]"],
  ["Wow", "top-[28%] right-[7%] origin-bottom-right rounded-[999px_999px_6px_999px]"],
  ["Need this at our office", "bottom-[26%] left-[4%] origin-bottom-left rounded-[999px_999px_999px_6px]"],
  ["Going tomorrow", "right-[6%] bottom-[14%] origin-bottom-right rounded-[999px_999px_6px_999px]"],
];

export function EventsStory() {
  const sec = useRef<HTMLElement>(null);
  const L = useRef({ q: -1, t: "", d: -1, l: -1 });

  const frame = (k: (j: number) => number) => {
    const root = sec.current!, last = L.current;
    // 0: guests drift into the queue, four step into stations
    const k0 = k(0);
    let q = 0;
    const stc = root.querySelectorAll(".cw-st circle");
    root.querySelectorAll(".cw-g circle").forEach((c, j) => {
      const g = GUESTS[j], e = E.inOut(clamp(k0 * 1.5 - (j / G) * 0.5));
      c.setAttribute("cx", lerp(g.from[0], g.to[0], e).toFixed(1));
      c.setAttribute("cy", lerp(g.from[1], g.to[1], e).toFixed(1));
      if (j >= 4 && e > 0.98) q++;
      if (j < 4) stc[j].classList.toggle("on", e > 0.98);
    });
    if (q !== last.q) root.querySelector(".cw-q b")!.textContent = String((last.q = q));
    // 1: the headset lowers onto the guest, the timer runs to 0:45
    const k1 = k(1), hk = E.out(clamp(k1 / 0.55)), hs = root.querySelector<HTMLElement>(".fit-hs")!;
    hs.style.transform = `translate3d(0,${((1 - hk) * -260).toFixed(1)}%,0) rotate(${((1 - hk) * -14).toFixed(1)}deg)`;
    hs.style.opacity = clamp(k1 * 6).toFixed(2);
    root.querySelector<SVGCircleElement>(".fit-p")!.style.strokeDashoffset = (339.3 * (1 - clamp(k1 / 0.9))).toFixed(1);
    const ts = `0:${pad(Math.round(clamp(k1 / 0.9) * 45))}`;
    if (ts !== last.t) root.querySelector(".fit-t")!.textContent = last.t = ts;
    root.querySelectorAll(".fit-chips span").forEach((c, j) => c.classList.toggle("ok", k1 > 0.35 + j * 0.22));
    // 2: look around a 360° scene (both lenses, slight stereo offset)
    const k2 = k(2);
    root.querySelectorAll<SVGElement>(".vz-sc").forEach((v, j) => (v.style.transform = `translate3d(${(-k2 * 66.6 + j * 1.6).toFixed(2)}%,0,0)`));
    const d = Math.round(k2 * 360);
    if (d !== last.d) root.querySelector(".vz-deg")!.textContent = (last.d = d) + "°";
    // 3: the post gets likes and replies
    const k3 = k(3), l = Math.round(E.out(clamp(k3 / 0.85)) * 248);
    if (l !== last.l) root.querySelector(".ph-likes b")!.textContent = String((last.l = l));
    root.querySelector(".ph-likes")!.classList.toggle("on", k3 > 0.1);
    root.querySelectorAll(".ph-pops span").forEach((s, j) => s.classList.toggle("on", k3 > 0.15 + j * 0.18));
  };

  return (
    <Story ref={sec} nav="A guest's five minutes" title="One guest, five minutes." steps={STEPS} visClass="bg-blue" kDiv={0.8} onFrame={frame}>
      <div className={`${SC} on`}>
        <svg className="h-auto w-[min(520px,100%)] overflow-visible" viewBox="0 0 400 300">
          <rect className="fill-paper" x="110" y="26" width="180" height="86" rx="14" />
          <text className="fill-ink text-[13px] font-[620] [font-family:var(--f)]" x="200" y="50" textAnchor="middle">
            VR zone
          </text>
          <g className="cw-st">
            {[150, 183, 217, 250].map((x) => (
              <circle key={x} className="fill-blue-soft stroke-ink [stroke-width:1.5] [transition:fill_.4s] [&.on]:fill-ink" cx={x} cy="84" r="11" />
            ))}
          </g>
          <path className="fill-none stroke-white/70 [stroke-dasharray:3_7] [stroke-width:2]" d="M200 124V262" />
          <g className="cw-g">
            {GUESTS.map((g, i) => (
              <circle key={i} r="7" className={g.w ? "fill-paper" : "fill-ink"} cx={g.from[0]} cy={g.from[1]} />
            ))}
          </g>
        </svg>
        <p className="cw-q mt-[14px] mb-0 text-center text-[15px] font-[560]">
          <b className="mr-1 text-[28px] font-[660] tabular-nums">0</b> in the queue
        </p>
      </div>

      <div className={SC}>
        <div className="relative aspect-square w-[min(250px,56%)]">
          <svg className="absolute inset-0 size-full [transform:rotate(-90deg)] [&_circle]:fill-none [&_circle]:[stroke-width:4]" viewBox="0 0 120 120">
            <circle className="stroke-[rgba(5,5,5,.14)]" cx="60" cy="60" r="54" />
            <circle className="fit-p stroke-ink [stroke-dasharray:339.3] [stroke-dashoffset:339.3] [stroke-linecap:round]" cx="60" cy="60" r="54" />
          </svg>
          <span className="absolute inset-[11%] overflow-hidden rounded-full bg-white/20 before:absolute before:top-[16%] before:left-[30%] before:size-[40%] before:rounded-full before:bg-paper before:content-[''] after:absolute after:bottom-[-16%] after:left-[10%] after:h-[42%] after:w-[80%] after:rounded-[50%_50%_0_0] after:bg-paper after:content-['']" />
          <span className="fit-hs absolute top-[28%] left-[31%] h-[13%] w-[38%] rounded-[40%_40%_46%_46%] bg-ink will-change-transform after:absolute after:inset-x-[14%] after:top-[42%] after:h-[2px] after:rounded-[2px] after:bg-blue after:content-['']" />
          <span className="fit-t absolute bottom-[-6px] left-1/2 inline-flex h-8 -translate-x-1/2 items-center rounded-full bg-paper px-[14px] text-[14px] font-[620] tabular-nums">0:00</span>
        </div>
        <div className="fit-chips mt-[26px] flex flex-wrap justify-center gap-2">
          {["Strap adjusted", "Fresh cover", "Ready to go"].map((t) => (
            <span key={t} className="group/fc inline-flex h-9 items-center gap-[6px] rounded-full bg-white/30 px-[14px] text-[14px] font-[560] [transition:background-color_.4s,transform_.5s_var(--e-spring)] [&.ok]:bg-paper [&.ok]:[transform:scale(1.04)]">
              <svg className="-ml-[21px] size-[15px] opacity-0 [transition:opacity_.3s,margin_.4s_var(--e-out)] group-[.ok]/fc:ml-0 group-[.ok]/fc:opacity-100">
                <use href="#i-check" />
              </svg>
              {t}
            </span>
          ))}
        </div>
      </div>

      <div className={SC}>
        <div className="relative flex w-[min(540px,100%)] gap-[4%] rounded-[120px] bg-paper p-[5%]">
          {[0, 1].map((j) => (
            <div key={j} className="relative isolate aspect-[1/1.04] flex-1 overflow-hidden rounded-[46%] after:absolute after:inset-0 after:z-1 after:rounded-[inherit] after:shadow-[inset_0_0_0_5px_var(--color-ink)] after:content-['']">
              <svg className="vz-sc absolute top-0 left-0 h-full w-[300%] max-w-none will-change-transform" viewBox="0 0 900 300" preserveAspectRatio="xMinYMid slice">
                <use href="#vzScene" />
              </svg>
            </div>
          ))}
          <svg width="0" height="0" className="absolute">
            <defs>
              <g id="vzScene">
                <rect width="900" height="300" fill="#E4ECFF" />
                <circle cx="140" cy="90" r="34" fill="#FFFFFF" />
                <path d="M0 210L90 150L170 196L260 120L360 200L450 160L540 210L640 130L740 196L820 150L900 200V300H0Z" fill="#8DB3FF" />
                <rect y="230" width="900" height="70" fill="#548CFF" />
                <rect x="372" y="150" width="156" height="80" rx="10" fill="#050505" />
                <text x="450" y="197" textAnchor="middle" fontSize="17" fontWeight="700" fill="#FFFFFF" fontFamily="Archivo,Inter,sans-serif">
                  YOUR BRAND
                </text>
                <rect x="420" y="230" width="60" height="16" fill="#050505" />
                <circle cx="700" cy="196" r="22" fill="#FFFFFF" />
                <rect x="684" y="216" width="32" height="14" fill="#FFFFFF" />
                <rect x="210" y="176" width="54" height="54" rx="8" fill="#FFFFFF" />
              </g>
            </defs>
          </svg>
        </div>
        <p className="mt-[18px] mb-0 text-center text-[15px] font-[560]">
          <span className="vz-deg font-[660] tabular-nums">0°</span> looking around
        </p>
      </div>

      <div className={SC}>
        <div className="relative z-1 w-[min(270px,68%)] rounded-[28px] bg-paper p-[14px] shadow-[0_30px_60px_-30px_rgba(5,5,5,.45)] max-[999px]:w-[min(230px,62%)]">
          <div className="flex items-center gap-[10px]">
            <span className="size-[34px] rounded-full bg-blue" />
            <span>
              <b className="block text-[14px]">Guest</b>
              <small className="block text-[12px] text-muted">at your event</small>
            </span>
          </div>
          <div className="my-3 grid aspect-[1.25] place-items-center rounded-[16px] bg-blue-soft text-blue-deep max-[999px]:aspect-[1.6]">
            <svg className="size-16">
              <use href="#i-vr" />
            </svg>
          </div>
          <p className="m-0 text-[14px] leading-[1.4]">Tried VR for the first time today. Still thinking about it.</p>
          <div className="ph-likes group/lk mt-[10px] flex items-center gap-[6px] text-[14px]">
            <svg className="size-5 fill-none stroke-ink [stroke-width:1.8] [transition:fill_.3s,stroke_.3s,transform_.4s_var(--e-spring)] group-[.on]/lk:fill-blue group-[.on]/lk:stroke-blue group-[.on]/lk:[transform:scale(1.15)]" viewBox="0 0 24 24">
              <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />
            </svg>
            <b className="tabular-nums">0</b>
            <span className="text-muted">likes</span>
          </div>
        </div>
        <div className="ph-pops pointer-events-none absolute inset-0 z-2">
          {POPS.map(([t, pos]) => (
            <span
              key={t}
              className={`absolute inline-flex h-[38px] items-center bg-paper px-[15px] text-[14px] font-[560] whitespace-nowrap shadow-[0_14px_28px_-18px_rgba(5,5,5,.5)] [transform:scale(0)] [transition:transform_.55s_var(--e-spring)] max-[999px]:h-8 max-[999px]:px-[11px] max-[999px]:text-[12.5px] [&.on]:[transform:none] ${pos}`}
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </Story>
  );
}
