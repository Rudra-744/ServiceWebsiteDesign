"use client";
import { type CSSProperties, useEffect, useRef, useState } from "react";
import { countUp } from "@/lib/reveal";
import { engine } from "@/lib/engine";
import { useScrollScene } from "@/hooks/useScrollScene";

// Platform pillars (ANIMATION-SPEC HB3). Desktop (≥ 820 px by the reference JS; pinned 440vh from 1000 px by CSS): active panel
// = min(3, floor(p × 4)). Phone: each panel turns on when 15% into view. Entering a panel starts its count-ups; panel 2 runs
// the upload simulation (20 segments, ≤ 5 at once, each 2–5 ticks of 170 ms), repeating 1.8 s after it finishes.
const NAV = [
  ["Devices", "Battery, charging, storage and connection for every headset."],
  ["Content", "A shared library of VR video, made for very large files."],
  ["Sync", "Bundle videos and settings, assign them to a group, sync."],
  ["Insight", "Answers, completion rates and views in one dashboard."],
];
const DEVICES = [
  ["Quest 01", 0.86, "61 / 128 GB", "1 min ago"],
  ["Quest 02", 1, "74 / 128 GB", "1 min ago"],
  ["PICO 03", 0.41, "22 / 256 GB", "3 min ago"],
  ["Quest 04", 0.18, "9 / 128 GB", "2 min ago"],
  ["PICO 05", 0.63, "140 / 256 GB", "2 days ago"],
] as const;
const MODES = [
  ["mono", "Mono", "grid-cols-[1fr_0fr] grid-rows-[1fr_0fr]"],
  ["sbs", "Side-by-side", "grid-cols-[1fr_1fr] grid-rows-[1fr_0fr]"],
  ["ou", "Over-under", "grid-cols-[1fr_0fr] grid-rows-[1fr_1fr]"],
] as const;

export function Platform() {
  const sec = useRef<HTMLElement>(null);
  const S = useRef({ cur: -1, up: 0 });
  const [mode, setMode] = useState(1);

  const upload = (root: HTMLElement) => {
    const st = S.current, segs = [...root.querySelectorAll<HTMLElement>(".segs i")], pct = root.querySelector(".upl-pct")!;
    clearInterval(st.up);
    clearTimeout(st.up);
    segs.forEach((s) => (s.dataset.s = ""));
    let next = 0, done = 0, active: { i: number; t: number }[] = [];
    st.up = window.setInterval(() => {
      active = active.filter((a) => {
        if (--a.t > 0) return true;
        segs[a.i].dataset.s = "ok";
        done++;
        return false;
      });
      while (active.length < 5 && next < 20) {
        segs[next].dataset.s = "up";
        active.push({ i: next, t: 2 + ((next * 7) % 4) });
        next++;
      }
      pct.textContent = Math.round((done / 20) * 100) + "%";
      if (done < 20) return;
      clearInterval(st.up);
      st.up = window.setTimeout(() => {
        if (st.cur === 1 || engine.vw < 820) upload(root);
      }, 1800);
    }, 170);
  };
  const enter = (pn: HTMLElement) => {
    pn.querySelectorAll<HTMLElement>("[data-count]").forEach((c) => countUp(c));
    if (pn.dataset.i === "1") upload(sec.current!);
  };

  useEffect(() => {
    const st = S.current, root = sec.current!;
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          const t = e.target as HTMLElement;
          if (e.isIntersecting && engine.vw < 820 && !t.classList.contains("on")) {
            t.classList.add("on");
            enter(t);
          }
        }),
      { rootMargin: "0px 0px -15% 0px" },
    );
    root.querySelectorAll(".panel").forEach((p) => io.observe(p));
    return () => {
      io.disconnect();
      clearInterval(st.up);
      clearTimeout(st.up);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only wiring; helpers read refs
  }, []);

  useScrollScene(sec, (p) => {
    if (engine.vw < 820) return;
    const st = S.current, i = Math.min(3, Math.floor(p * 4));
    if (i === st.cur) return;
    st.cur = i;
    const root = sec.current!, panels = root.querySelectorAll<HTMLElement>(".panel");
    panels.forEach((pn, j) => pn.classList.toggle("on", j === i));
    root.querySelectorAll(".pill-nav li").forEach((n, j) => n.classList.toggle("on", j === i));
    enter(panels[i]);
  });

  return (
    <section ref={sec} data-nav="Platform" className="wrap relative min-[1000px]:h-[440vh]">
      <div className="grid gap-10 min-[1000px]:sticky min-[1000px]:top-0 min-[1000px]:h-svh min-[1000px]:grid-cols-[.75fr_1.25fr] min-[1000px]:items-center min-[1000px]:gap-[5vw] min-[1000px]:pt-(--nav-h)">
        <div>
          <p className="tag">Platform</p>
          <h2 className="d2 mt-[14px] text-[length:clamp(32px,3.5vw,58px)]">Everything a session needs, before anyone puts on a headset.</h2>
          <ul className="pill-nav mt-7 mb-0 grid list-none gap-[2px] p-0 max-[999px]:hidden">
            {NAV.map(([t, s]) => (
              <li
                key={t}
                className="group/pv relative py-3 pl-[22px] text-[length:clamp(20px,1.8vw,28px)] font-semibold tracking-[-0.02em] text-[#b3b3ba] [font-stretch:108%] [transition:color_.4s] before:absolute before:top-1/2 before:left-0 before:-mt-1 before:size-2 before:rounded-full before:bg-[#dadbe2] before:[transition:background-color_.4s,transform_.4s_var(--e-spring)] before:content-[''] [&.on]:text-ink [&.on]:before:bg-blue [&.on]:before:[transform:scale(1.4)]"
              >
                {t}
                <small className="block max-h-0 overflow-hidden text-[15px] font-normal tracking-normal text-muted [font-stretch:100%] [transition:max-height_.5s_var(--e-out)] group-[.on]/pv:max-h-20">{s}</small>
              </li>
            ))}
          </ul>
        </div>
        <div className="relative min-[1000px]:h-[min(66vh,560px)]">
          <h3 className={MOB_H}>Devices</h3>
          <div className={PANEL} data-i="0">
            <div className={PH}>
              <b className={PH_B}>Device fleet</b>
              <span>5 devices, sorted by last sync</span>
            </div>
            <div className="grid gap-[6px] text-[13.5px]">
              <div className={`${FR_GRID} bg-transparent text-[12.5px] text-muted`}>
                <span>Device</span>
                <span>Battery</span>
                <span>Storage free</span>
                <span>Last sync</span>
              </div>
              {DEVICES.map(([n, b, s, t], i) => {
                const off = i === 4;
                return (
                  <div key={n} style={{ "--i": i } as CSSProperties} className={`${FR_GRID} ${FR} ${off ? "text-[#a9a9b0]" : ""}`}>
                    <b className="flex items-center gap-2 font-semibold">
                      <i className={`size-[7px] rounded-full ${off ? "bg-[#c4c4ca]" : "bg-ok"}`} />
                      {n}
                    </b>
                    <span className="h-[5px] overflow-hidden rounded-[3px] bg-[#e6e6ea]">
                      <i style={{ "--b": b } as CSSProperties} className={`block h-full origin-left [transform:scaleX(0)] [transition:transform_1.1s_var(--e-out)_calc(.3s+var(--i)*90ms)] group-[.on]/pn:[transform:scaleX(var(--b))] ${i === 3 ? "bg-warn" : "bg-blue"}`} />
                    </span>
                    <small className="text-muted">{s}</small>
                    <small className="text-muted">{t}</small>
                  </div>
                );
              })}
            </div>
            <div className={`${PH} mt-[6px]`}>
              <span>Quest 01 battery, last 7 days</span>
              <span>Headset</span>
            </div>
            <Spark d="M0 30 L60 38 L120 52 L180 22 L240 40 L300 58 L360 30 L420 18 L480 44 L540 26 L600 34" />
          </div>

          <h3 className={MOB_H}>Content</h3>
          <div className={PANEL} data-i="1">
            <div className={PH}>
              <b className={PH_B}>Media type</b>
              <span className="inline-flex gap-[2px] rounded-full bg-white p-1 shadow-[inset_0_0_0_1px_var(--color-line)]">
                {MODES.map(([k, label], i) => (
                  <button key={k} type="button" aria-pressed={i === mode} onClick={() => setMode(i)} className="h-[34px] rounded-full px-[14px] text-[13.5px] font-[560] text-muted [transition:background-color_.35s,color_.35s] aria-pressed:bg-ink aria-pressed:text-white max-[520px]:px-[10px] max-[520px]:text-[12.5px]">
                    {label}
                  </button>
                ))}
              </span>
            </div>
            <div className={`grid h-[190px] gap-[6px] [transition:grid-template-columns_.6s_var(--e-out),grid-template-rows_.6s_var(--e-out)] ${MODES[mode][2]}`}>
              {[
                ["L", "M0 90 C30 70 50 60 70 72 S110 40 140 60 S180 80 200 64 V120 H0Z", "col-start-1 row-start-1"],
                ["R", "M0 92 C30 72 52 62 72 74 S112 42 142 62 S182 82 200 66 V120 H0Z", mode === 2 ? "col-start-1 row-start-2" : "col-start-2 row-start-1"],
              ].map(([e, d, pos]) => (
                <div key={e} className={`relative min-h-0 min-w-0 overflow-hidden rounded-[12px] bg-blue-soft ${pos}`}>
                  <span className="absolute top-2 left-[10px] z-1 text-[11px] font-semibold text-stone">{e}</span>
                  <svg className="absolute inset-0 size-full" viewBox="0 0 200 120" preserveAspectRatio="none">
                    <path d={d} fill="#9DBBFF" />
                  </svg>
                </div>
              ))}
            </div>
            <div className="grid gap-2">
              <div className="flex justify-between text-[13.5px]">
                <span>
                  harbour-walkthrough.mp4
                  <br />
                  <small className="text-muted">10 MB parts, 5 uploading in parallel</small>
                </span>
                <b className="upl-pct tabular-nums">0%</b>
              </div>
              <div className="segs grid grid-cols-[repeat(20,1fr)] gap-[3px]">
                {Array.from({ length: 20 }, (_, i) => (
                  <i key={i} className="h-[10px] rounded-[2px] bg-[#e6e6ea] [transition:background-color_.25s] data-[s=ok]:bg-blue data-[s=up]:bg-[#b5ccff]" />
                ))}
              </div>
            </div>
          </div>

          <h3 className={MOB_H}>Sync</h3>
          <div className={PANEL} data-i="2">
            <div className={PH}>
              <b className={PH_B}>Group headsets. Bind a configuration. Sync.</b>
            </div>
            <div className="grid gap-[10px]">
              {[
                ["Content", "3 videos"],
                ["Configuration: Tour", "Volume 70%, brightness 60%"],
                ["Group: Gallery A", "8 headsets"],
              ].map(([b, s], i) => (
                <div key={b} style={{ "--i": i } as CSSProperties} className="flex items-center justify-between gap-[10px] rounded-[12px] bg-white px-[14px] py-3 text-[14px] opacity-0 [transform:translateY(14px)] [transition:opacity_.45s_calc(var(--i)*140ms),transform_.7s_var(--e-out)_calc(var(--i)*140ms)] group-[.on]/pn:opacity-100 group-[.on]/pn:[transform:none]">
                  <b className="font-semibold">{b}</b>
                  <small className="text-muted">{s}</small>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                ["5", "Synced", "text-ok"],
                ["2", "Syncing", "text-blue-deep"],
                ["1", "Not synced", "text-warn"],
              ].map(([n, l, c]) => (
                <div key={l} className="rounded-[12px] bg-white p-3 text-center">
                  <b className={`block text-[26px] font-[640] tabular-nums [font-stretch:110%] ${c}`} data-count={n}>
                    0
                  </b>
                  <small className="text-[12px] text-muted">{l}</small>
                </div>
              ))}
            </div>
            <div className={PH}>
              <span>Schedule it instead: once, daily or weekly</span>
              <span>Next run Mon 09:00</span>
            </div>
          </div>

          <h3 className={MOB_H}>Insight</h3>
          <div className={PANEL} data-i="3">
            <div className={PH}>
              <b className={PH_B}>Answers dashboard</b>
              <span>Last 30 days</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                ["Total responses", "128", ""],
                ["Unique devices", "8", ""],
                ["Completion", "89", "%"],
              ].map(([l, n, suf]) => (
                <div key={l} className="rounded-[12px] bg-white p-[14px]">
                  <small className="block text-[12px] text-muted">{l}</small>
                  <b className="text-[length:clamp(24px,2.4vw,34px)] font-[640] tabular-nums [font-stretch:110%]" data-count={n} data-suffix={suf || undefined}>
                    0
                  </b>
                </div>
              ))}
            </div>
            <div className="grid gap-[10px] text-[13.5px]">
              <span className="text-muted">Which room did you enjoy most?</span>
              {[
                ["Atrium", 0.46],
                ["East wing", 0.31],
                ["Sculpture hall", 0.23],
              ].map(([r, b], i) => (
                <div key={r} className="grid grid-cols-[96px_1fr_40px] items-center gap-[10px]">
                  <span>{r}</span>
                  <span className="h-[6px] overflow-hidden rounded-[3px] bg-[#e6e6ea]">
                    <i style={{ "--i": i, "--b": b } as CSSProperties} className="block h-full origin-left bg-blue [transform:scaleX(0)] [transition:transform_1.2s_var(--e-out)_calc(.3s+var(--i)*120ms)] group-[.on]/pn:[transform:scaleX(var(--b))]" />
                  </span>
                  <span className="text-right text-stone">{Math.round((b as number) * 100)}%</span>
                </div>
              ))}
            </div>
            <div className={PH}>
              <span>Completed views per day</span>
              <span>Export CSV</span>
            </div>
            <Spark d="M0 62 L60 54 L120 58 L180 42 L240 48 L300 32 L360 38 L420 22 L480 30 L540 10 L600 16" />
          </div>
        </div>
      </div>
    </section>
  );
}

function Spark({ d }: { d: string }) {
  return (
    <svg className="h-[70px] w-full" viewBox="0 0 600 70" preserveAspectRatio="none">
      <path className="fill-none stroke-blue [stroke-dasharray:600] [stroke-dashoffset:600] [stroke-width:2] [transition:stroke-dashoffset_1.8s_var(--e-out)_.6s] group-[.on]/pn:[stroke-dashoffset:0]" d={d} />
    </svg>
  );
}

const MOB_H = "d3 mt-10 hidden max-[999px]:block";
const PANEL =
  "panel group/pn grid content-start gap-[14px] rounded-card bg-card p-[clamp(16px,2vw,28px)] shadow-[0_0_0_1px_var(--color-line)] max-[999px]:mt-4 min-[1000px]:pointer-events-none min-[1000px]:absolute min-[1000px]:inset-0 min-[1000px]:opacity-0 min-[1000px]:[transform:translateY(30px)_scale(.97)] min-[1000px]:[transition:opacity_.5s_var(--e-out),transform_.8s_var(--e-out)] min-[1000px]:[&.on]:pointer-events-auto min-[1000px]:[&.on]:opacity-100 min-[1000px]:[&.on]:[transform:none]";
const PH = "flex items-center justify-between gap-[10px] text-[14px] text-muted max-[520px]:flex-wrap";
const PH_B = "text-[16px] font-[620] text-ink";
const FR_GRID = "grid grid-cols-[1.3fr_1fr_1fr_.8fr] items-center gap-[10px] rounded-[12px] px-3 py-[10px]";
const FR = "bg-white opacity-0 [transform:translateX(-18px)] [transition:opacity_.5s_calc(var(--i)*90ms),transform_.7s_var(--e-out)_calc(var(--i)*90ms),background-color_.4s_calc(var(--i)*90ms)] group-[.on]/pn:opacity-100 group-[.on]/pn:[transform:none]";
