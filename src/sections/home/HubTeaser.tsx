"use client";
import { useEffect, useRef } from "react";
import { SplitText } from "@/components/motion/SplitText";
import { Button } from "@/components/ui/Button";
import { addMeasure, engine } from "@/lib/engine";
import { drawSVG } from "@/lib/drawSVG";
import { E, clamp, map, pad, rnd } from "@/lib/motion";
import { panoSVG } from "@/lib/pano";
import { scrollToY } from "@/lib/scroll";
import { useScrollScene } from "@/hooks/useScrollScene";
import { useTicker } from "@/hooks/useTicker";
import { HEADSET_NAMES } from "@/content/home";

// VR HUB teaser "Press play once" (ANIMATION-SPEC H11, reference v26), pinned 340vh (320vh under 960px).
// Stages: ready (<.24) → sync (<.46) → play (<.70, one shared clock: same frame on every headset) → ask.
const ANS = [1, 0, 1, 1, 0, 1, 1, 0]; // 5 yes, 3 no
const AORD = [3, 0, 6, 1, 5, 7, 2, 4]; // the order the answers come in
const SW = 720, SH = 180;

export function HubTeaser() {
  const sec = useRef<HTMLElement>(null);
  const S = useRef({ p: 0, t: 0, lastM: 0, lastS: -1, stage: -2, paused: false, vis: false, btnState: -1, nR: -1, nY: -1, nNo: -1, pt: 0, hs: [] as { el: HTMLElement; st: HTMLElement; rf: SVGCircleElement; a: number; ao: number; d: number; r: number; s: number; txt: string }[] });
  const q = <T extends Element = HTMLElement>(s: string) => sec.current!.querySelector<T>(s)!;

  const press = () => {
    if (engine.RM) return;
    const b = q(".hc-play");
    b.classList.add("pressed");
    clearTimeout(S.current.pt);
    S.current.pt = window.setTimeout(() => b.classList.remove("pressed"), 260);
  };
  const time = () => {
    const st = S.current;
    st.t = ((st.t % 240) + 240) % 240;
    q(".hc-grid").style.setProperty("--ph", ((st.t / 24) % 1).toFixed(4)); // one full turn every 24 s
    const s = Math.floor(st.t);
    if (s !== st.lastS) {
      st.lastS = s;
      q(".hc-tc").textContent = `${Math.floor(s / 60)}:${pad(s % 60)}`;
    }
    q(".hc-pbar").style.transform = `scaleX(${(st.t / 240).toFixed(4)})`;
  };
  const update = () => {
    const st = S.current, root = sec.current!, p = st.p, stage = p < 0.24 ? -1 : p < 0.46 ? 0 : p < 0.7 ? 1 : 2;
    if (stage !== st.stage) {
      const prev = st.stage;
      st.stage = stage;
      root.querySelectorAll(".hc-steps li").forEach((li, i) => {
        li.classList.toggle("on", i === stage);
        li.classList.toggle("done", i < stage);
      });
      root.querySelectorAll<HTMLElement>(".hf").forEach((f) => f.classList.toggle("on", +f.dataset.f! === stage));
      const wave = q(".hc-wave");
      if (stage >= 1 && prev < 1) {
        st.paused = false;
        if (prev !== -2 && !engine.RM) {
          press();
          wave.classList.remove("go");
          void wave.offsetWidth;
          wave.classList.add("go");
        }
      }
      if (stage < 1 && prev >= 1) {
        st.t = 0;
        st.paused = false;
        wave.classList.remove("go");
      }
    }
    const playing = stage >= 1;
    q(".hc").classList.toggle("paused", playing && st.paused);
    const pz = playing && !st.paused, bs = pz ? 1 : playing ? 2 : 0;
    if (st.btnState !== bs) {
      st.btnState = bs;
      const b = q(".hc-play");
      b.classList.toggle("is-pause", pz);
      q(".hc-pl").textContent = pz ? "Pause" : "Play";
      b.setAttribute("aria-label", pz ? "Pause every headset" : playing ? "Resume every headset" : "Play on every headset");
    }
    const k1 = map(p, 0.24, 0.42), k3 = map(p, 0.7, 0.9);
    let ready = 0, sum = 0, yes = 0, no = 0;
    st.hs.forEach((h, i) => {
      const show = p > 0.16 + i * 0.02, s = clamp(k1 * h.r - h.d), ans = stage === 2 && k3 > 0.08 + h.ao * 0.1;
      const cl = h.el.classList;
      cl.toggle("show", show);
      cl.toggle("sync", s > 0 && s < 1);
      cl.toggle("rdy", s >= 1);
      cl.toggle("on", playing);
      cl.toggle("ans", ans);
      if (s !== h.s) {
        h.s = s;
        h.rf.style.strokeDashoffset = (56.55 * (1 - s)).toFixed(2);
      }
      const txt = !show ? "Offline" : ans ? "Answered" : playing ? (st.paused ? "Paused" : "Playing") : s >= 1 ? "Ready" : s > 0 ? `Syncing ${Math.round(s * 100)}%` : "Online";
      if (txt !== h.txt) {
        h.txt = txt;
        h.st.textContent = txt;
      }
      if (s >= 1) ready++;
      sum += s;
      if (ans) {
        if (h.a) yes++;
        else no++;
      }
    });
    if (st.nR !== ready) {
      st.nR = ready;
      q(".hc-rdy").textContent = String(ready);
    }
    q(".hc-sbar").style.transform = `scaleX(${(sum / 8).toFixed(4)})`;
    if (st.nY !== yes || st.nNo !== no) {
      st.nY = yes;
      st.nNo = no;
      q(".hc-y").textContent = String(yes);
      q(".hc-n").textContent = String(no);
      q(".hc-yb").style.width = (yes / 8) * 100 + "%";
      q(".hc-nb").style.width = (no / 8) * 100 + "%";
    }
    time();
  };

  useEffect(() => {
    const st = S.current, root = sec.current!, hc = q(".hc"), grid = q(".hc-grid"), btn = q(".hc-play"), wave = q(".hc-wave");
    // the 360° city strip, drawn once (twice side by side so it loops) and copied into every headset screen
    const off = document.createElement("canvas");
    off.width = SW * 2;
    off.height = SH;
    const pano = panoSVG(), octx = off.getContext("2d")!;
    drawSVG(octx, pano, SH / 600, 0, 0);
    drawSVG(octx, pano, SH / 600, SW, 0);
    st.hs = [...grid.querySelectorAll<HTMLElement>(".hs")].map((el, i) => {
      el.querySelector<HTMLCanvasElement>(".hs-pan")!.getContext("2d")!.drawImage(off, 0, 0);
      const d = rnd(i + 21) * 0.25;
      return { el, st: el.querySelector<HTMLElement>(".hs-st")!, rf: el.querySelector<SVGCircleElement>(".hs-rf")!, a: ANS[i], ao: AORD.indexOf(i), d, r: 1 + d + rnd(i + 31) * 0.25, s: -1, txt: "" };
    });
    const io = new IntersectionObserver((es) => es.forEach((e) => (st.vis = e.isIntersecting)));
    io.observe(root);
    // the play signal starts at the Play button; headsets nearest the button switch on first
    const offM = addMeasure(() => {
      const hb = hc.getBoundingClientRect();
      if (!hb.width) return;
      const bb = btn.getBoundingClientRect(), bx = bb.left + bb.width / 2 - hb.left, by = bb.top + bb.height / 2 - hb.top;
      const R = Math.hypot(Math.max(bx, hb.width - bx), Math.max(by, hb.height - by));
      Object.assign(wave.style, { left: bx + "px", top: by + "px", width: 2 * R + "px", height: 2 * R + "px" });
      const ds = st.hs.map((h) => {
        const r = h.el.getBoundingClientRect();
        return Math.hypot(r.left + r.width / 2 - hb.left - bx, r.top + r.height / 2 - hb.top - by);
      });
      ds.map((_, i) => i)
        .sort((x, y) => ds[x] - ds[y])
        .forEach((i, k) => st.hs[i].el.style.setProperty("--d", k * 40 + "ms"));
    });
    const click = () => {
      if (st.stage < 1) {
        // not playing yet: take the visitor to the moment it plays
        const r = root.getBoundingClientRect();
        scrollToY(scrollY + r.top + 0.5 * (root.offsetHeight - engine.vh));
        return;
      }
      st.paused = !st.paused;
      press();
      update();
    };
    btn.addEventListener("click", click);
    update();
    return () => {
      io.disconnect();
      offM();
      btn.removeEventListener("click", click);
      clearTimeout(st.pt);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only wiring; helpers read refs
  }, []);

  useScrollScene(sec, (p) => {
    const st = S.current, mobile = innerWidth < 820;
    st.p = p;
    const e = E.inOut(map(p, 0, 0.18));
    const iv = (((mobile ? 6 : 8) * engine.vh) / 100) * (1 - e), ih = (((mobile ? 3 : 4) * engine.vw) / 100) * (1 - e), rad = (mobile ? 28 : 40) * (1 - e);
    q(".hubt-panel").style.clipPath = `inset(${iv.toFixed(1)}px ${ih.toFixed(1)}px round ${rad.toFixed(1)}px)`;
    const mm = map(p, 0.46, 0.94); // scrolling while it plays also scrubs the shared clock (up to 60 s)
    if (st.stage >= 1 && !st.paused) st.t += (mm - st.lastM) * 60;
    st.lastM = mm;
    if (st.hs.length) update();
  });

  // the shared clock: while playing, every headset shows the same frame
  useTicker((_, dt) => {
    const st = S.current;
    if (!st.vis || st.stage < 1 || st.paused || engine.RM || engine.menuOpen) return;
    st.t += dt / 1000;
    time();
  });

  return (
    <section data-nav="VR HUB" className="relative h-[340vh] max-[959px]:h-[320vh]" aria-label="VR HUB" ref={sec}>
      <div className="sticky top-0 h-svh overflow-hidden">
        <div className="hubt-panel absolute inset-0 grid content-center gap-8 bg-blue-soft px-(--pad) pt-[calc(var(--nav-h)+20px)] pb-8 text-ink [clip-path:inset(8vh_4vw_round_40px)] will-change-[clip-path] max-[959px]:content-start max-[959px]:gap-[22px] max-[959px]:pt-[calc(var(--nav-h)+44px)] max-[959px]:[clip-path:inset(6vh_3vw_round_28px)] min-[960px]:grid-cols-[.9fr_1.1fr] min-[960px]:items-center min-[960px]:gap-[5vw]">
          <div>
            <p className="tag text-blue-deep!">Our software</p>
            <SplitText as="h2" className={`d2 mt-[14px] mb-[22px] max-[959px]:text-[length:clamp(32px,9vw,48px)]! [@media(max-width:959px)_and_(max-height:760px)]:mb-4!`} text="Press play once. Every headset follows." />
            <p className={`lede [@media(max-width:959px)_and_(max-height:760px)]:hidden`}>VR HUB is our console for group sessions on Meta Quest and PICO: sync 360° video to every headset, start playback together and collect answers from inside the experience.</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button href="/vr-hub" label="Explore VR HUB" variant="ink" magnetic />
            </div>
          </div>
          <div className="hc group/hc relative isolate grid gap-[14px] overflow-hidden rounded-card bg-white p-[clamp(14px,1.6vw,22px)] shadow-[0_0_0_1px_var(--color-line)] max-[959px]:gap-[10px] max-[959px]:rounded-[20px] max-[959px]:p-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <b className="block text-[17px] font-[640] [font-stretch:108%] max-[959px]:text-[15px]">Gallery A</b>
                <small className="mt-[2px] block text-[13.5px] text-muted max-[959px]:text-[12px]">8 headsets, Tour configuration</small>
              </div>
              <button
                className="hc-play group/play relative z-2 inline-flex h-[42px] cursor-pointer items-center gap-[9px] rounded-full border-0 bg-ink pr-[18px] pl-4 text-[15px] font-[620] text-white [transition:background-color_.3s,color_.3s,transform_.45s_var(--e-spring)] hover:bg-blue hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-blue max-[959px]:h-[38px] max-[959px]:pr-[15px] max-[959px]:pl-[13px] max-[959px]:text-[14px] [&.pressed]:bg-blue [&.pressed]:text-ink [&.pressed]:[transform:scale(.92)] [&_svg]:size-3 [&_svg]:fill-current"
                type="button"
                aria-label="Play on every headset"
              >
                <svg className="group-[.is-pause]/play:hidden" aria-hidden="true"><use href="#i-play" /></svg>
                <svg className="hidden group-[.is-pause]/play:block" aria-hidden="true"><use href="#i-pause" /></svg>
                <span className="hc-pl">Play</span>
              </button>
            </div>
            <ol className="hc-steps m-0 flex list-none gap-[6px] p-0 text-[13px] font-[560] max-[959px]:hidden" aria-hidden="true">
              {["Sync content", "Play together", "Ask a question"].map((t, i) => (
                <li key={t} className="group/st inline-flex h-[30px] items-center gap-[7px] rounded-full bg-card pr-3 pl-1 text-muted [transition:background-color_.4s,color_.4s] [&.done]:text-ink [&.on]:bg-blue [&.on]:text-ink">
                  <i className="grid size-[22px] place-items-center rounded-full bg-white text-[12px] font-[650] not-italic [transition:background-color_.4s,color_.4s] group-[.on]/st:bg-ink group-[.on]/st:text-white">{i + 1}</i>
                  {t}
                </li>
              ))}
            </ol>
            <div className="hc-grid grid grid-cols-4 gap-[10px] max-[959px]:gap-[6px]" aria-hidden="true">
              {HEADSET_NAMES.map((n, i) => (
                <div className={`hs ${ANS[i] ? "" : "no "}${HS}`} key={n}>
                  <div className="flex items-center justify-between gap-[6px]">
                    <b className="text-[13px] font-[620] whitespace-nowrap max-[959px]:text-[10.5px]">{n}</b>
                    <i className="size-[7px] flex-none rounded-full bg-[#c9c9cf] transition-colors duration-300 group-[.show]/hs:bg-ok max-[959px]:size-[6px]" />
                  </div>
                  <div className="relative rounded-[13px_13px_16px_16px] bg-ink p-1 after:absolute after:-bottom-px after:left-1/2 after:z-3 after:h-[17%] after:w-[20%] after:-translate-x-1/2 after:rounded-[999px_999px_0_0] after:bg-(--tb) after:content-[''] max-[959px]:rounded-[9px_9px_11px_11px] max-[959px]:p-[3px]">
                    <div className="relative aspect-[2/1] overflow-hidden rounded-[9px_9px_11px_11px] bg-[#17171a] max-[959px]:rounded-[6px_6px_8px_8px]">
                      <canvas
                        className="hs-pan absolute top-0 left-0 h-full w-auto max-w-none opacity-0 brightness-[2.4] will-change-transform [transform:translate3d(calc(var(--ph,0)*-50%),0,0)] [transition:opacity_.3s_var(--d,0ms),filter_.9s_var(--e-out)_var(--d,0ms)] group-[.on]/hs:opacity-100 group-[.on]/hs:filter-none"
                        width={SW * 2}
                        height={SH}
                      />
                      <svg className="absolute top-1/2 left-1/2 aspect-square w-[42%] max-w-[30px] opacity-0 transition-opacity duration-250 [transform:translate(-50%,-50%)_rotate(-90deg)] group-[.sync]/hs:opacity-100 [&_circle]:fill-none [&_circle]:[stroke-width:2.6]" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="9" stroke="rgba(255,255,255,.18)" />
                        <circle className="hs-rf stroke-blue [stroke-dasharray:56.55] [stroke-dashoffset:56.55] [stroke-linecap:round]" cx="12" cy="12" r="9" />
                      </svg>
                      <svg className="absolute top-1/2 left-1/2 -mt-[11px] -ml-[11px] size-[22px] rounded-full bg-blue p-[5px] stroke-current text-ink opacity-0 [transform:scale(.3)] [transition:opacity_.25s,transform_.5s_var(--e-spring)] group-[.rdy:not(.on)]/hs:opacity-100 group-[.rdy:not(.on)]/hs:[transform:none] max-[959px]:-mt-2 max-[959px]:-ml-2 max-[959px]:size-4 max-[959px]:p-[3px]">
                        <use href="#i-check" />
                      </svg>
                      <span className="absolute inset-0 z-2 grid place-items-center bg-[rgba(5,5,5,.38)] opacity-0 transition-opacity duration-250 before:h-3 before:w-[3px] before:-translate-x-[3px] before:rounded-[1px] before:bg-white before:shadow-[6px_0_#fff] before:content-[''] group-[.paused]/hc:group-[.on]/hs:opacity-100" />
                      <span className="absolute top-[5px] right-[5px] z-2 origin-top-right rounded-full bg-ink px-2 py-[2px] text-[11px] leading-4 font-[650] text-white opacity-0 [transform:scale(.4)] [transition:opacity_.25s,transform_.55s_var(--e-spring)] group-[.ans]/hs:opacity-100 group-[.ans]/hs:[transform:none] group-[.no]/hs:bg-white group-[.no]/hs:text-ink group-[.no]/hs:shadow-[inset_0_0_0_1.5px_var(--color-ink)] max-[959px]:top-[3px] max-[959px]:right-[3px] max-[959px]:px-[5px] max-[959px]:py-0 max-[959px]:text-[9.5px] max-[959px]:leading-[13px]">
                        {ANS[i] ? "Yes" : "No"}
                      </span>
                    </div>
                  </div>
                  <span className="hs-st text-[12px] whitespace-nowrap text-muted transition-colors duration-300 group-[.on]/hs:text-ink max-[959px]:hidden">Offline</span>
                </div>
              ))}
            </div>
            <div className="relative h-14 border-t border-line max-[959px]:h-[46px]" aria-hidden="true">
              <div className={`hf on ${HF}`} data-f="-1">
                <span className={HF_L}>Ready to sync</span>
                <span className={HF_R}>Gallery tour, 1.2 GB</span>
                <span className={HF_BAR}><i className={HF_I} /></span>
              </div>
              <div className={`hf ${HF}`} data-f="0">
                <span className={HF_L}>Syncing Gallery tour</span>
                <span className={HF_R}><b className="hc-rdy">0</b> of 8 ready</span>
                <span className={HF_BAR}><i className={`hc-sbar ${HF_I}`} /></span>
              </div>
              <div className={`hf ${HF}`} data-f="1">
                <span className={HF_L}><b className="hc-tc tabular-nums">0:00</b> / 4:00</span>
                <span className={HF_R}>Same frame on all 8</span>
                <span className={HF_BAR}><i className={`hc-pbar ${HF_I}`} /></span>
              </div>
              <div className={`hf ${HF}`} data-f="2">
                <span className={HF_L}>Is this your first time in VR?</span>
                <span className={HF_R}><b className="hc-y">0</b> yes, <b className="hc-n">0</b> no</span>
                <span className={HF_BAR}>
                  <i className={`hc-yb ${HF_SPLIT} bg-blue`} />
                  <i className={`hc-nb ${HF_SPLIT} bg-ink`} />
                </span>
              </div>
            </div>
            <span className="hc-wave pointer-events-none absolute top-0 left-0 -z-1 size-0 rounded-full bg-blue opacity-0 [transform:translate(-50%,-50%)_scale(0)] motion-reduce:hidden [&.go]:[animation:hcWave_1.1s_var(--e-out)_forwards]" aria-hidden="true" />
          </div>
        </div>
      </div>
    </section>
  );
}

const HS = "group/hs grid gap-2 rounded-[14px] bg-(--tb) p-[10px] opacity-0 [--tb:var(--color-card)] [transform:translateY(14px)_scale(.9)] [transition:opacity_.4s,transform_.7s_var(--e-spring),--tb_.45s_var(--d,0ms)] motion-reduce:transition-none! motion-reduce:[&_*]:transition-none! max-[959px]:gap-[5px] max-[959px]:rounded-[10px] max-[959px]:p-[6px] [&.on]:[--tb:var(--color-blue)] [&.show]:opacity-100 [&.show]:[transform:none]";
const HF = "pointer-events-none absolute inset-x-0 top-3 bottom-0 grid grid-cols-[1fr_auto] content-start items-baseline gap-x-3 gap-y-[9px] opacity-0 [transform:translateY(8px)] [transition:opacity_.3s,transform_.5s_var(--e-out)] max-[959px]:top-[10px] max-[959px]:gap-x-[10px] max-[959px]:gap-y-[7px] [&.on]:opacity-100 [&.on]:[transform:none]";
const HF_L = "overflow-hidden text-[14.5px] font-semibold text-ellipsis whitespace-nowrap text-ink max-[959px]:text-[12.5px]";
const HF_R = "text-[13px] whitespace-nowrap text-muted max-[959px]:text-[11.5px] [&_b]:font-[640] [&_b]:text-ink";
const HF_BAR = "col-span-full flex h-1 overflow-hidden rounded-[2px] bg-[#e7e7ea]";
const HF_I = "block h-full w-full flex-none origin-left bg-blue [transform:scaleX(0)]";
const HF_SPLIT = "block h-full w-0 flex-none [transition:width_.5s_var(--e-out)]";
