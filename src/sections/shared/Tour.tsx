"use client";
import { type CSSProperties, useEffect, useRef } from "react";
import type { createTour } from "@/gl/tour";
import { addMeasure, engine } from "@/lib/engine";
import { map } from "@/lib/motion";
import { scrollToY } from "@/lib/scroll";
import { tourPathAt, tourTimeline } from "@/lib/tourPath";
import { useScrollScene } from "@/hooks/useScrollScene";
import { useTicker } from "@/hooks/useTicker";
import { TOUR_STOPS } from "@/content/tour";

// 3D walkthrough of the sample apartment (ANIMATION-SPEC H9 / RE2), pinned 520vh.
// This file owns the HUD, the camera path, the look-around state and the controls.
// The WebGL renderer (gl/tour.ts) is imported when the section comes within one screen of the viewport; it only draws
// while the section is on screen, the menu is closed and the view changed. Without WebGL the sky colour shows behind the HUD.
type TourGL = NonNullable<ReturnType<typeof createTour>>;

const MAP = `<svg viewBox="-.5 -.5 12 9" aria-hidden="true">
  <rect x="0" y="0" width="7" height="8" fill="#EEF3FF"/><rect x="7" y="0" width="4" height="4.5" fill="#F5F5F7"/><rect x="7" y="4.5" width="4" height="3.5" fill="#E4ECFF"/>
  <g fill="none" stroke="#050505" stroke-width=".16" stroke-linecap="round"><path d="M3 8H0V0H11V8H4"/><path d="M7 0V2.4M7 3.4V6.1M7 7V8M7 4.5H11"/></g>
  <g fill="#050505" font-family="Archivo,Inter,sans-serif" font-size=".62" font-weight="600" opacity=".55"><text x=".4" y="1">Kitchen</text><text x=".4" y="7.4">Living</text><text x="7.4" y="1">Bedroom</text><text x="7.4" y="7.4">Bath</text></g>
  <g class="tm-cam"><path d="M0 0L-1.1-2A2.3 2.3 0 0 1 1.1-2Z" fill="#548CFF" opacity=".28"/><circle r=".36" fill="#548CFF" stroke="#fff" stroke-width=".14"/></g>
</svg>`;

export function Tour({ style }: { style?: CSSProperties }) {
  const sec = useRef<HTMLElement>(null);
  const S = useRef({ yawO: 0, yawT: 0, pitO: 0, pitT: 0, base: { x: 3.5, z: 0.6, yaw: 0 }, stop: -1, vis: false, dirty: true, swapT: 0 });
  const gl = useRef<TourGL | null>(null);

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
    // lazy WebGL: load the renderer once the walkthrough is within one screen
    let alive = true;
    const near = new IntersectionObserver(
      (es) => {
        if (!es.some((e) => e.isIntersecting)) return;
        near.disconnect();
        import("@/gl/tour").then(({ createTour }) => {
          if (!alive) return;
          gl.current = createTour(cv);
          gl.current?.size();
          st.dirty = true;
        });
      },
      { rootMargin: "100% 0px" },
    );
    near.observe(root);
    const offM = addMeasure(() => {
      gl.current?.size();
      st.dirty = true;
    });
    return () => {
      alive = false;
      near.disconnect();
      offM();
      gl.current?.dispose();
      gl.current = null;
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
    const R = gl.current;
    if (!R) return;
    const pos = R.draw({ ...st.base, yawO: st.yawO, pitO: st.pitO }, TOUR_STOPS, st.stop);
    sec.current!.querySelectorAll<HTMLElement>(".tour-hot").forEach((b, i) => {
      const q = pos[i];
      b.classList.toggle("show", !!q);
      if (q) b.style.transform = `translate3d(${q[0].toFixed(1)}px,${q[1].toFixed(1)}px,0) translate(-50%,-50%)`;
    });
  });

  const s0 = TOUR_STOPS[0];
  return (
    <section ref={sec} data-nav="Walkthrough" className="tour cv relative h-[520vh] max-[820px]:h-[500vh]" aria-label="Virtual walkthrough of a sample apartment" style={style}>
      <div className="sticky top-0 isolate h-svh overflow-hidden bg-[#c9daff]">
        <canvas className="tour-cv absolute inset-0 block size-full cursor-grab touch-pan-y [&.drag]:cursor-grabbing" aria-hidden="true" />
        <div className="tour-hots">
          {TOUR_STOPS.map((s, i) => (
            <button
              type="button"
              key={s.name}
              onClick={() => go(i)}
              className="tour-hot pointer-events-none absolute top-0 left-0 inline-flex h-[38px] items-center gap-2 rounded-full bg-white pr-[14px] pl-[10px] text-[14px] font-[560] whitespace-nowrap text-ink opacity-0 shadow-[0_0_0_1px_var(--color-line)] will-change-transform [transform:translate(-50%,-50%)] [transition:opacity_.35s,background-color_.3s] hover:bg-blue max-[820px]:h-[34px] max-[820px]:text-[13px] [&.show]:pointer-events-auto [&.show]:opacity-100"
            >
              <i className="relative size-[18px] rounded-full bg-blue shadow-[0_0_0_3px_#fff] after:absolute after:-inset-[7px] after:animate-[hotPulse_1.8s_ease-out_infinite] after:rounded-full after:border-2 after:border-blue after:opacity-60 after:content-['']" />
              {s.name}
            </button>
          ))}
        </div>
        <div className="tour-intro absolute top-[calc(var(--nav-h)+40px)] left-(--pad) max-w-[460px] rounded-card bg-white px-[26px] pt-6 pb-[26px] text-ink shadow-[0_0_0_1px_var(--color-line)] will-change-[opacity,transform] max-[820px]:top-[calc(var(--nav-h)+28px)] max-[820px]:right-[calc(var(--pad)+122px)] max-[820px]:max-w-none max-[820px]:px-4 max-[820px]:pt-4 max-[820px]:pb-[18px]">
          <p className="tag" style={{ fontSize: 13 }}>
            Virtual sample house
          </p>
          <h2 className="d3 mt-[6px] mb-[10px] max-[820px]:text-[26px]!">Take the tour.</h2>
          <p className="m-0 text-[16px] text-stone max-[820px]:text-[14.5px]">This is what buyers see in the headset. Scroll to walk from room to room, and use the arrows or drag to look around.</p>
        </div>
        <div className="absolute top-[calc(var(--nav-h)+40px)] right-(--pad) w-[clamp(120px,14vw,190px)] rounded-[18px] bg-white p-[10px] shadow-[0_0_0_1px_var(--color-line)] max-[820px]:top-[calc(var(--nav-h)+28px)] max-[820px]:w-[112px] max-[820px]:rounded-[14px] max-[820px]:p-2 [&_svg]:h-auto [&_svg]:w-full">
          <small className="mx-[2px] mt-[2px] mb-[6px] block text-[11.5px] font-[540] text-muted max-[820px]:hidden">You are here</small>
          <span dangerouslySetInnerHTML={{ __html: MAP }} />
        </div>
        <p className="tour-hint absolute top-[calc(var(--nav-h)+40px)] left-1/2 m-0 -translate-x-1/2 rounded-full bg-ink px-[14px] py-2 text-[13.5px] whitespace-nowrap text-white transition-opacity duration-500 max-[820px]:top-auto max-[820px]:bottom-[calc(12px+190px)] max-[820px]:left-3 max-[820px]:translate-x-0">
          Drag to look around
        </p>
        <div
          className="tour-room absolute bottom-[calc(28px+env(safe-area-inset-bottom,0px))] left-(--pad) w-[min(380px,calc(100%_-_2*var(--pad)_-_170px))] rounded-card bg-white px-5 pt-[18px] pb-5 text-ink shadow-[0_0_0_1px_var(--color-line)] max-[820px]:right-3 max-[820px]:bottom-[calc(12px+env(safe-area-inset-bottom,0px))] max-[820px]:left-3 max-[820px]:w-auto max-[820px]:pt-[14px] max-[820px]:pr-[calc(3*44px+2*5px+28px)] max-[820px]:pb-4 max-[820px]:pl-4"
          aria-live="polite"
        >
          <div className="txt [transition:opacity_.3s,transform_.5s_var(--e-out)] [&.swap]:opacity-0 [&.swap]:[transform:translateY(8px)]">
            <small className="block text-[13px] font-[540] text-muted">Room 1 of 4</small>
            <b className="mt-1 mb-[6px] block text-[length:clamp(22px,2.2vw,32px)] leading-[1.05] font-[640] tracking-[-0.025em] [font-stretch:112%] max-[820px]:text-[21px]">{s0.name}</b>
            <span className="block text-[15px] leading-[1.4] text-muted max-[820px]:text-[13.5px]">{s0.desc}</span>
          </div>
          <div className="tour-ticks mt-[14px] grid grid-cols-4 gap-[5px]">
            {TOUR_STOPS.map((s) => (
              <i key={s.name} className="relative h-[3px] overflow-hidden rounded-[2px] bg-[#e6e6ea]">
                <b className="absolute inset-0 m-0 origin-left bg-blue [transform:scaleX(0)]" />
              </i>
            ))}
          </div>
        </div>
        <p className="absolute right-(--pad) bottom-[calc(28px+3*54px+2*6px+12px)] m-0 text-[12px] text-ink opacity-70 max-[820px]:hidden">Illustrative sample apartment</p>
        <div
          className="tour-pad absolute right-(--pad) bottom-[calc(28px+env(safe-area-inset-bottom,0px))] grid grid-cols-[repeat(3,54px)] grid-rows-[repeat(3,54px)] gap-[6px] max-[820px]:right-5 max-[820px]:bottom-[calc(22px+env(safe-area-inset-bottom,0px))] max-[820px]:grid-cols-[repeat(3,44px)] max-[820px]:grid-rows-[repeat(3,44px)] max-[820px]:gap-[5px]"
          role="group"
          aria-label="Walkthrough controls"
        >
          <button type="button" className={`up col-start-2 row-start-1 ${PADBTN} ${PADLIGHT}`} aria-label="Next room" onClick={() => go(Math.min(3, S.current.stop + 1))}>
            <svg aria-hidden="true"><use href="#i-up" /></svg>
          </button>
          <button type="button" className={`col-start-1 row-start-2 ${PADBTN} ${PADLIGHT}`} aria-label="Look left" onClick={() => ((S.current.yawT -= 45), (S.current.dirty = true))}>
            <svg aria-hidden="true"><use href="#i-turnl" /></svg>
          </button>
          <button type="button" className={`col-start-2 row-start-2 ${PADBTN} rounded-full! bg-ink text-white`} aria-label="Look ahead" onClick={() => ((S.current.yawT = 0), (S.current.pitT = 0), (S.current.dirty = true))}>
            <svg aria-hidden="true"><use href="#i-eye" /></svg>
          </button>
          <button type="button" className={`col-start-3 row-start-2 ${PADBTN} ${PADLIGHT}`} aria-label="Look right" onClick={() => ((S.current.yawT += 45), (S.current.dirty = true))}>
            <svg aria-hidden="true"><use href="#i-turnr" /></svg>
          </button>
          <button type="button" className={`dn col-start-2 row-start-3 ${PADBTN} ${PADLIGHT}`} aria-label="Previous room" onClick={() => go(Math.max(0, S.current.stop - 1))}>
            <svg aria-hidden="true" className="rotate-180"><use href="#i-up" /></svg>
          </button>
        </div>
      </div>
    </section>
  );
}

const PADBTN = "grid place-items-center rounded-[16px] [transition:background-color_.3s,color_.3s,transform_.35s_var(--e-spring)] active:[transform:scale(.9)] disabled:pointer-events-none disabled:opacity-40 max-[820px]:rounded-[13px] [&_svg]:size-[22px] max-[820px]:[&_svg]:size-[19px]";
const PADLIGHT = "bg-white text-ink shadow-[0_0_0_1px_var(--color-line)] hover:bg-blue hover:shadow-none";
