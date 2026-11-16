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
    <section data-nav="VR HUB" className="hubt" aria-label="VR HUB" ref={sec}>
      <div className="hubt-pin">
        <div className="hubt-panel">
          <div>
            <p className="tag">Our software</p>
            <SplitText as="h2" className="d2" style={{ margin: "14px 0 22px" }} text="Press play once. Every headset follows." />
            <p className="lede">VR HUB is our console for group sessions on Meta Quest and PICO: sync 360° video to every headset, start playback together and collect answers from inside the experience.</p>
            <div className="btns" style={{ marginTop: 28 }}>
              <Button href="/vr-hub" label="Explore VR HUB" variant="ink" magnetic />
            </div>
          </div>
          <div className="hc">
            <div className="hc-top">
              <div className="hc-id">
                <b>Gallery A</b>
                <small>8 headsets, Tour configuration</small>
              </div>
              <button className="hc-play" type="button" aria-label="Play on every headset">
                <svg className="hc-i-play" aria-hidden="true"><use href="#i-play" /></svg>
                <svg className="hc-i-pause" aria-hidden="true"><use href="#i-pause" /></svg>
                <span className="hc-pl">Play</span>
              </button>
            </div>
            <ol className="hc-steps" aria-hidden="true">
              {["Sync content", "Play together", "Ask a question"].map((t, i) => (
                <li key={t}>
                  <i>{i + 1}</i>
                  {t}
                </li>
              ))}
            </ol>
            <div className="hc-grid" aria-hidden="true">
              {HEADSET_NAMES.map((n, i) => (
                <div className={`hs${ANS[i] ? "" : " no"}`} key={n}>
                  <div className="hs-h">
                    <b>{n}</b>
                    <i />
                  </div>
                  <div className="hs-vz">
                    <div className="hs-scr">
                      <canvas className="hs-pan" width={SW * 2} height={SH} />
                      <svg className="hs-ring" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="9" />
                        <circle className="hs-rf" cx="12" cy="12" r="9" />
                      </svg>
                      <svg className="hs-ok"><use href="#i-check" /></svg>
                      <span className="hs-pz" />
                      <span className="hs-ans">{ANS[i] ? "Yes" : "No"}</span>
                    </div>
                  </div>
                  <span className="hs-st">Offline</span>
                </div>
              ))}
            </div>
            <div className="hc-foot" aria-hidden="true">
              <div className="hf on" data-f="-1">
                <span className="hf-l">Ready to sync</span>
                <span className="hf-r">Gallery tour, 1.2 GB</span>
                <span className="hf-bar"><i /></span>
              </div>
              <div className="hf" data-f="0">
                <span className="hf-l">Syncing Gallery tour</span>
                <span className="hf-r"><b className="num hc-rdy">0</b> of 8 ready</span>
                <span className="hf-bar"><i className="hc-sbar" /></span>
              </div>
              <div className="hf" data-f="1">
                <span className="hf-l"><b className="num hc-tc">0:00</b> / 4:00</span>
                <span className="hf-r">Same frame on all 8</span>
                <span className="hf-bar"><i className="hc-pbar" /></span>
              </div>
              <div className="hf" data-f="2">
                <span className="hf-l">Is this your first time in VR?</span>
                <span className="hf-r"><b className="num hc-y">0</b> yes, <b className="num hc-n">0</b> no</span>
                <span className="hf-bar hf-split"><i className="hc-yb" /><i className="hc-nb" /></span>
              </div>
            </div>
            <span className="hc-wave" aria-hidden="true" />
          </div>
        </div>
      </div>
    </section>
  );
}
