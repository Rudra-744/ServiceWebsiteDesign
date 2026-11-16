"use client";
import { type CSSProperties, useEffect, useRef } from "react";
import { engine } from "@/lib/engine";
import { map } from "@/lib/motion";
import { scrollToY } from "@/lib/scroll";
import { tourPathAt, tourTimeline } from "@/lib/tourPath";
import { useScrollScene } from "@/hooks/useScrollScene";
import { useTicker } from "@/hooks/useTicker";
import { TOUR_STOPS } from "@/content/tour";

// 3D walkthrough of the sample apartment (ANIMATION-SPEC H9 / RE2), pinned 520vh.
// This file owns the HUD, the camera path, the look-around state and the controls.
// The WebGL renderer plugs in through `tour.render` (stage 5); until then the sky colour shows behind the HUD.

export type TourCam = { x: number; z: number; yaw: number; yawO: number; pitO: number };

const MAP = `<svg viewBox="-.5 -.5 12 9" aria-hidden="true">
  <rect x="0" y="0" width="7" height="8" fill="#EEF3FF"/><rect x="7" y="0" width="4" height="4.5" fill="#F5F5F7"/><rect x="7" y="4.5" width="4" height="3.5" fill="#E4ECFF"/>
  <g fill="none" stroke="#050505" stroke-width=".16" stroke-linecap="round"><path d="M3 8H0V0H11V8H4"/><path d="M7 0V2.4M7 3.4V6.1M7 7V8M7 4.5H11"/></g>
  <g fill="#050505" font-family="Archivo,Inter,sans-serif" font-size=".62" font-weight="600" opacity=".55"><text x=".4" y="1">Kitchen</text><text x=".4" y="7.4">Living</text><text x="7.4" y="1">Bedroom</text><text x="7.4" y="7.4">Bath</text></g>
  <g class="tm-cam"><path d="M0 0L-1.1-2A2.3 2.3 0 0 1 1.1-2Z" fill="#548CFF" opacity=".28"/><circle r=".36" fill="#548CFF" stroke="#fff" stroke-width=".14"/></g>
</svg>`;

export function Tour({ style }: { style?: CSSProperties }) {
  const sec = useRef<HTMLElement>(null);
  const S = useRef({ yawO: 0, yawT: 0, pitO: 0, pitT: 0, base: { x: 3.5, z: 0.6, yaw: 0 }, stop: -1, vis: false, dirty: true, swapT: 0 });

  const go = (i: number) => {
    const r = sec.current!.getBoundingClientRect();
    S.current.yawT = 0;
    S.current.pitT = 0;
    scrollToY(r.top + scrollY + TOUR_STOPS[i].p * (r.height - engine.vh));
  };

  const setStop = (i: number) => {
    const st = S.current, root = sec.current!;
    st.stop = i;
    const room = root.querySelector<HTMLElement>(".tour-room .txt")!, s = TOUR_STOPS[i];
    room.classList.add("swap");
    clearTimeout(st.swapT);
    st.swapT = window.setTimeout(() => {
      room.querySelector("small")!.textContent = `Room ${i + 1} of 4`;
      room.querySelector("b")!.textContent = s.name;
      room.querySelector("span")!.textContent = s.desc;
      room.classList.remove("swap");
    }, 180);
    root.querySelector<HTMLButtonElement>(".tour-pad .up")!.disabled = i >= 3;
    root.querySelector<HTMLButtonElement>(".tour-pad .dn")!.disabled = i <= 0;
  };

  useEffect(() => {
    const st = S.current, root = sec.current!, cv = root.querySelector<HTMLCanvasElement>(".tour-cv")!, hint = root.querySelector<HTMLElement>(".tour-hint")!;
    let drag: null | { x: number; y: number; yaw: number; pit: number; touch: boolean } = null;
    const down = (e: PointerEvent) => {
      drag = { x: e.clientX, y: e.clientY, yaw: st.yawT, pit: st.pitT, touch: e.pointerType !== "mouse" };
      cv.classList.add("drag");
      try {
        cv.setPointerCapture(e.pointerId);
      } catch {}
    };
    const move = (e: PointerEvent) => {
      if (!drag) return;
      st.yawT = drag.yaw - (e.clientX - drag.x) * (drag.touch ? 0.3 : 0.22);
      if (!drag.touch) st.pitT = Math.max(-28, Math.min(28, drag.pit + (e.clientY - drag.y) * 0.15));
      hint.style.opacity = "0";
      st.dirty = true;
    };
    const up = () => {
      drag = null;
      cv.classList.remove("drag");
    };
    cv.addEventListener("pointerdown", down);
    cv.addEventListener("pointermove", move);
    cv.addEventListener("pointerup", up);
    cv.addEventListener("pointercancel", up);
    const io = new IntersectionObserver((es) => es.forEach((e) => ((st.vis = e.isIntersecting), (st.dirty = true))));
    io.observe(root);
    return () => {
      cv.removeEventListener("pointerdown", down);
      cv.removeEventListener("pointermove", move);
      cv.removeEventListener("pointerup", up);
      cv.removeEventListener("pointercancel", up);
      io.disconnect();
      clearTimeout(st.swapT);
    };
  }, []);

  useScrollScene(sec, (p) => {
    const st = S.current, root = sec.current!;
    const tl = tourTimeline(p);
    st.base = tourPathAt(tl.u);
    if (tl.walking) {
      st.yawT *= 0.9;
      st.pitT *= 0.9;
    }
    if (tl.stop !== st.stop) setStop(tl.stop);
    const ip = map(p, 0.02, 0.07), intro = root.querySelector<HTMLElement>(".tour-intro")!;
    intro.style.opacity = (1 - ip).toFixed(3);
    intro.style.transform = `translate3d(0,${(-ip * 30).toFixed(1)}px,0)`;
    intro.style.pointerEvents = ip > 0.5 ? "none" : "";
    const seg = [[0, 0.1], [0.1, 0.4], [0.4, 0.7], [0.7, 1]];
    root.querySelectorAll<HTMLElement>(".tour-ticks b").forEach((b, i) => (b.style.transform = `scaleX(${map(p, seg[i][0], seg[i][1] - (i ? 0.1 : 0)).toFixed(3)})`));
    st.dirty = true;
  });

  useTicker(() => {
    const st = S.current;
    if (!st.vis || engine.menuOpen) return;
    const k = engine.RM ? 1 : 0.14, dy = st.yawT - st.yawO, dp = st.pitT - st.pitO;
    if (Math.abs(dy) > 0.02 || Math.abs(dp) > 0.02) {
      st.yawO += dy * k;
      st.pitO += dp * k;
      st.dirty = true;
    }
    if (!st.dirty) return;
    st.dirty = false;
    const yaw = st.base.yaw + st.yawO;
    sec.current!.querySelector(".tm-cam")!.setAttribute("transform", `translate(${st.base.x.toFixed(2)} ${(8 - st.base.z).toFixed(2)}) rotate(${yaw.toFixed(1)})`);
    // stage 5: the WebGL view renders here and projects the room hotspots
    tourRender.fn?.(sec.current!, { ...st.base, yawO: st.yawO, pitO: st.pitO }, st.stop);
  });

  const s0 = TOUR_STOPS[0];
  return (
    <section data-nav="Walkthrough" className="tour" aria-label="Virtual walkthrough of a sample apartment" style={style} ref={sec}>
      <div className="tour-pin">
        <canvas className="tour-cv" aria-hidden="true" />
        <div className="tour-hots">
          {TOUR_STOPS.map((s, i) => (
            <button type="button" className="tour-hot" key={s.name} onClick={() => go(i)}>
              <i />
              {s.name}
            </button>
          ))}
        </div>
        <div className="tour-intro">
          <p className="tag" style={{ fontSize: 13 }}>
            Virtual sample house
          </p>
          <h2 className="d3">Take the tour.</h2>
          <p>This is what buyers see in the headset. Scroll to walk from room to room, and use the arrows or drag to look around.</p>
        </div>
        <div className="tour-map">
          <small>You are here</small>
          <span dangerouslySetInnerHTML={{ __html: MAP }} />
        </div>
        <p className="tour-hint">Drag to look around</p>
        <div className="tour-room" aria-live="polite">
          <div className="txt">
            <small>Room 1 of 4</small>
            <b>{s0.name}</b>
            <span>{s0.desc}</span>
          </div>
          <div className="tour-ticks">
            {TOUR_STOPS.map((s) => (
              <i key={s.name}>
                <b />
              </i>
            ))}
          </div>
        </div>
        <p className="tour-note">Illustrative sample apartment</p>
        <div className="tour-pad" role="group" aria-label="Walkthrough controls">
          <button type="button" className="up" aria-label="Next room" onClick={() => go(Math.min(3, S.current.stop + 1))}>
            <svg aria-hidden="true"><use href="#i-up" /></svg>
          </button>
          <button type="button" className="lt" aria-label="Look left" onClick={() => ((S.current.yawT -= 45), (S.current.dirty = true))}>
            <svg aria-hidden="true"><use href="#i-turnl" /></svg>
          </button>
          <button type="button" className="ct" aria-label="Look ahead" onClick={() => ((S.current.yawT = 0), (S.current.pitT = 0), (S.current.dirty = true))}>
            <svg aria-hidden="true"><use href="#i-eye" /></svg>
          </button>
          <button type="button" className="rt" aria-label="Look right" onClick={() => ((S.current.yawT += 45), (S.current.dirty = true))}>
            <svg aria-hidden="true"><use href="#i-turnr" /></svg>
          </button>
          <button type="button" className="dn" aria-label="Previous room" onClick={() => go(Math.max(0, S.current.stop - 1))}>
            <svg aria-hidden="true" style={{ transform: "rotate(180deg)" }}><use href="#i-up" /></svg>
          </button>
        </div>
      </div>
    </section>
  );
}

/** stage 5 sets this to the WebGL renderer (loaded lazily) */
export const tourRender: { fn: null | ((root: HTMLElement, cam: TourCam, stop: number) => void) } = { fn: null };
