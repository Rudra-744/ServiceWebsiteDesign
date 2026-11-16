"use client";
import { useRef } from "react";
import { clamp, rnd } from "@/lib/motion";
import { SC, Story } from "@/sections/shared/Story";

// "From order to experience" (ANIMATION-SPEC R5): request types itself → rack charges → venue set-up → live in VR HUB.
const STEPS: [string, string][] = [
  ["You share the details", "Date, venue and headcount. We reply with a rental plan and a quote."],
  ["We prepare every headset", "Charged, cleaned and loaded with your content before it leaves us."],
  ["We set up at your venue", "We place each station and test every headset before your guests arrive."],
  ["We run it with you", "Our team stays on site and watches every headset live in VR HUB."],
];
const FIELDS = [
  ["Date", "Saturday, 14 December"],
  ["Venue", "Convention centre, Hall B"],
  ["Headsets", "60"],
];
const TOTAL = FIELDS.reduce((s, f) => s + f[1].length, 0);
const STATIONS = Array.from({ length: 12 }, (_, j) => [80 + (j % 4) * 80, 64 + Math.floor(j / 4) * 54]);

export function RentalStory() {
  const sec = useRef<HTMLElement>(null);
  const last = useRef({ hn: -1 });

  const frame = (k: (j: number) => number) => {
    const root = sec.current!;
    // 0: the request types itself field by field, then sends
    const k0 = k(0);
    let left = Math.round(clamp(k0 / 0.8) * TOTAL);
    root.querySelectorAll<HTMLElement>(".q-v").forEach((q, j) => {
      const full = FIELDS[j][1], n = Math.min(full.length, left);
      left -= n;
      const s = full.slice(0, n);
      if (q.textContent !== s) q.textContent = s;
      q.classList.toggle("typing", n > 0 ? n < full.length : j === 0 && k0 < 0.02);
    });
    root.querySelector(".q-send")!.classList.toggle("sent", k0 > 0.88);
    // 1: the rack charges and gets ticked
    const k1 = k(1);
    root.querySelectorAll<HTMLElement>(".rk").forEach((r, j) => {
      const b = clamp(k1 * 1.7 - (j / 24) * 0.7);
      r.style.setProperty("--b", b.toFixed(3));
      r.classList.toggle("done", b >= 1);
    });
    root.querySelectorAll(".rk-c").forEach((c, j) => c.classList.toggle("ok", k1 > 0.3 + j * 0.27));
    // 2: stations pop, then get tested
    const k2 = k(2);
    root.querySelector(".fp")!.classList.toggle("go", k2 > 0.05);
    root.querySelectorAll(".fp-s").forEach((s, j) => {
      s.classList.toggle("on", k2 > 0.05 + (j / 12) * 0.5);
      s.classList.toggle("ok", k2 > 0.58 + (j / 12) * 0.36);
    });
    // 3: headsets go live in VR HUB
    const k3 = k(3);
    root.querySelectorAll<HTMLElement>(".hb-list li").forEach((r, j) => {
      const on = k3 > 0.08 + (j / 6) * 0.6;
      if (r.classList.contains("on") === on) return;
      r.classList.toggle("on", on);
      r.querySelector(".hb-st")!.textContent = on ? "In session" : "Ready";
    });
    const hn = Math.round(clamp(k3 / 0.75) * 60);
    if (hn !== last.current.hn) {
      last.current.hn = hn;
      root.querySelector(".hb-n b")!.textContent = String(hn);
    }
    root.querySelector(".hb-tech")!.classList.toggle("on", k3 > 0.8);
  };

  return (
    <Story ref={sec} nav="From order to experience" title="From order to experience." steps={STEPS} visClass="bg-card" kDiv={0.78} onFrame={frame}>
      <div className={`${SC} on`}>
        <div className={CARD + " w-[min(430px,100%)] p-[clamp(18px,2.2vw,28px)]"}>
          <p className="mt-0 mb-[6px] flex items-center justify-between text-[15px] font-[620]">
            <span>New rental request</span>
            <i className="size-[9px] rounded-full bg-blue" />
          </p>
          {FIELDS.map(([l]) => (
            <div key={l} className="border-b border-line py-[13px]">
              <small className="block text-[12.5px] text-muted">{l}</small>
              <span className="q-v block min-h-[1.45em] text-[length:clamp(17px,1.4vw,20px)] font-[560] [&.typing]:after:ml-[2px] [&.typing]:after:inline-block [&.typing]:after:h-[1.05em] [&.typing]:after:w-[2px] [&.typing]:after:align-[-0.15em] [&.typing]:after:bg-blue [&.typing]:after:[animation:blink_.9s_steps(1)_infinite] [&.typing]:after:content-['']" />
            </div>
          ))}
          <div className="q-send group/qs relative mt-[22px] grid h-[52px] place-items-center overflow-hidden rounded-full bg-ink text-[15px] font-semibold text-paper">
            <span>Send request</span>
            <span className="absolute inset-0 flex items-center justify-center gap-2 bg-blue text-ink [transform:translateY(102%)] [transition:transform_.6s_var(--e-out)] group-[.sent]/qs:[transform:none]">
              <svg className="size-[18px]">
                <use href="#i-check" />
              </svg>
              Quote on its way
            </span>
          </div>
        </div>
      </div>

      <div className={SC}>
        <div className="mb-[clamp(16px,2vw,26px)] flex flex-wrap justify-center gap-2">
          {[
            ["i-batt", "Charged"],
            ["i-shield", "Cleaned"],
            ["i-play", "Content loaded"],
          ].map(([ic, t]) => (
            <span key={t} className="rk-c inline-flex h-9 items-center gap-[7px] rounded-full bg-paper px-[14px] text-[14px] font-[560] text-stone [transition:background-color_.4s,color_.4s,transform_.5s_var(--e-spring)] [&.ok]:bg-blue [&.ok]:text-ink [&.ok]:[transform:scale(1.04)]">
              <svg className="size-4">
                <use href={`#${ic}`} />
              </svg>
              {t}
            </span>
          ))}
        </div>
        <div className="grid w-[min(470px,100%)] grid-cols-6 gap-[clamp(6px,.8vw,10px)]">
          {Array.from({ length: 24 }, (_, j) => (
            <span key={j} className="rk group/rk relative grid aspect-[1.2] place-items-center rounded-[clamp(10px,1vw,14px)] bg-paper text-[rgba(5,5,5,.28)] transition-colors duration-400 [&.done]:text-ink">
              <svg className="size-[52%]">
                <use href="#i-vr" />
              </svg>
              <b className="absolute inset-x-[16%] bottom-[12%] h-[3px] overflow-hidden rounded-[3px] bg-line after:absolute after:inset-0 after:origin-left after:bg-blue after:[transform:scaleX(var(--b,0))] after:content-['']" />
              <i className="absolute -top-[5px] -right-[5px] grid size-[18px] place-items-center rounded-full bg-ink text-paper [transform:scale(0)] [transition:transform_.45s_var(--e-spring)] group-[.done]/rk:[transform:none]">
                <svg className="size-[11px]">
                  <use href="#i-check" />
                </svg>
              </i>
            </span>
          ))}
        </div>
      </div>

      <div className={SC}>
        <svg className="fp group/fp h-auto w-[min(540px,100%)] overflow-visible" viewBox="0 0 400 300">
          <rect className="fill-paper stroke-[rgba(5,5,5,.22)] [stroke-width:1.5]" x="14" y="14" width="372" height="272" rx="18" />
          <path className="stroke-card [stroke-width:5]" d="M170 286h60" />
          <path className="fill-none stroke-blue opacity-0 transition-opacity duration-600 [animation:fpFlow_1.4s_linear_infinite] [stroke-dasharray:5_7] [stroke-width:2] group-[.go]/fp:opacity-100" d="M200 280V236H60M200 236H340" />
          {STATIONS.map(([x, y]) => (
            <g key={`${x}-${y}`} className="fp-s group/st [transform:scale(0)] [transition:transform_.55s_var(--e-spring)] [&.on]:[transform:none]" style={{ transformOrigin: `${x}px ${y}px` }}>
              <circle className="fill-card stroke-ink [stroke-width:1.5] [transition:fill_.35s] group-[.ok]/st:fill-blue group-[.ok]/st:stroke-blue" cx={x} cy={y} r="18" />
              <path className="fill-none stroke-ink [stroke-dasharray:20] [stroke-dashoffset:20] [stroke-linecap:round] [stroke-linejoin:round] [stroke-width:2] [transition:stroke-dashoffset_.5s_var(--e-out)_.1s] group-[.ok]/st:[stroke-dashoffset:0]" d={`M${x - 7} ${y + 0.5}l4.5 4.5 9-9`} />
            </g>
          ))}
          <text className="fill-muted text-[12px] [font-family:var(--f)]" x="200" y="272" textAnchor="middle">
            Entrance
          </text>
        </svg>
      </div>

      <div className={SC}>
        <div className={CARD + " w-[min(440px,100%)] overflow-hidden"}>
          <div className="flex items-center justify-between bg-ink px-5 py-[15px] text-[14.5px] font-semibold text-paper">
            <span className="inline-flex items-center gap-[9px]">
              <i className="size-2 rounded-full bg-blue [animation:blink_1.6s_steps(1)_infinite]" />
              VR HUB
            </span>
            <span className="hb-n font-[520] text-white/60">
              <b className="font-[640] text-paper">0</b>/60 live
            </span>
          </div>
          <ul className="hb-list m-0 list-none py-1">
            {Array.from({ length: 6 }, (_, i) => (
              <li key={i} className="group/hr grid grid-cols-[1fr_auto_44px] items-center gap-3 px-5 py-[10px] text-[14.5px] font-[540] [&+li]:border-t [&+li]:border-line max-[999px]:px-4 max-[999px]:py-2 max-[999px]:[&:nth-child(n+5)]:hidden">
                <span>Headset {String(i + 1).padStart(2, "0")}</span>
                <span className="hb-st inline-flex h-[26px] items-center rounded-full bg-card px-[10px] text-[12.5px] font-[560] text-stone [transition:background-color_.35s,color_.35s] group-[.on]/hr:bg-blue group-[.on]/hr:text-ink">Ready</span>
                <span className="h-[6px] overflow-hidden rounded-[6px] bg-line">
                  <i className="block h-full bg-ink" style={{ width: `${78 + Math.round(rnd(i + 3) * 20)}%` }} />
                </span>
              </li>
            ))}
          </ul>
          <div className="hb-tech flex items-center gap-3 border-t border-line px-5 py-[14px] opacity-25 transition-opacity duration-500 [&.on]:opacity-100">
            <span className="grid size-[38px] flex-none place-items-center rounded-full bg-blue text-ink">
              <svg className="size-[18px]">
                <use href="#i-tool" />
              </svg>
            </span>
            <span>
              <b className="block text-[15px]">Technician on site</b>
              <small className="block text-[13px] text-muted">Hall B, until close</small>
            </span>
          </div>
        </div>
      </div>
    </Story>
  );
}

const CARD = "rounded-card bg-paper shadow-[0_30px_60px_-34px_rgba(5,5,5,.3)]";
