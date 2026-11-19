"use client";
import { useEffect, useRef } from "react";
import { SplitText } from "@/components/motion/SplitText";
import type { createPlanet } from "@/gl/planet";
import { addMeasure, engine } from "@/lib/engine";
import { E, clamp, lerp, map } from "@/lib/motion";
import { panoSVG } from "@/lib/pano";
import { useScrollScene } from "@/hooks/useScrollScene";
import { useTicker } from "@/hooks/useTicker";
import { PLANET_CAPS, PLANET_HOTS } from "@/content/home";

// 360° tiny planet (ANIMATION-SPEC H10), pinned 560svh (500svh phone).
// The scroll scene drives the heading, captions and the "inside" HUD. The WebGL view (gl/planet.ts) is imported when the
// section is within 60% of a screen; it draws only while visible, with the menu closed and when something changed.
// It also places the camera icon, the building pins and the degrees readout. Drag (inside view) and tilt (phones) look around.
// Without WebGL the flat panorama strip stays.
const PANO = panoSVG();
const CAP_RANGES = [[0.12, 0.26], [0.34, 0.5], [0.56, 0.7]];
const PW = 2400, D2R = Math.PI / 180;
const HOT_DIR = PLANET_HOTS.map(([x]) => {
  const lon = (+x / PW - 0.5) * Math.PI * 2, la = 26 * D2R;
  return [Math.sin(lon) * Math.cos(la), Math.sin(la), Math.cos(lon) * Math.cos(la)];
});
type PlanetGL = NonNullable<ReturnType<typeof createPlanet>>;

export function Planet() {
  const sec = useRef<HTMLElement>(null);
  const gl = useRef<PlanetGL | null>(null);
  const S = useRef({ p: 0, vis: false, idle: 0, drag: 0, dv: 0, gy: 0, gp: 0, dragging: false, needs: true, W: 0, H: 0, lastAct: -1 });

  useScrollScene(sec, (p) => {
    const root = sec.current!, head = root.querySelector<HTMLElement>(".pl-head")!, narrow = innerWidth < 900;
    S.current.p = p;
    S.current.needs = true;
    const ho = 1 - map(p, 0.22, 0.32);
    head.style.opacity = ho.toFixed(3);
    head.style.transform = `translate3d(0,${((1 - ho) * -40).toFixed(1)}px,0)`;
    head.style.visibility = ho <= 0 ? "hidden" : "";
    root.querySelectorAll(".pl-cap").forEach((c, i) => c.classList.toggle("on", !(narrow && i === 0) && p >= CAP_RANGES[i][0] && p < CAP_RANGES[i][1]));
    root.classList.toggle("inside", p > 0.66);
  });

  useEffect(() => {
    const st = S.current, root = sec.current!, cv = root.querySelector<HTMLCanvasElement>(".pl-cv")!, tilt = root.querySelector<HTMLButtonElement>(".pl-tilt")!;
    let alive = true, inited = false;
    const size = () => {
      if (!gl.current) return;
      Object.assign(st, gl.current.size());
      st.needs = true;
    };
    // draws only while on screen; the module is imported earlier, within 60% of a screen
    const io = new IntersectionObserver((es) => es.forEach((e) => ((st.vis = e.isIntersecting), (st.needs = true))));
    io.observe(root);
    const near = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (!e.isIntersecting || inited) return;
          inited = true;
          near.disconnect();
          import("@/gl/planet").then(({ createPlanet }) => {
            if (!alive) return;
            gl.current = createPlanet(cv);
            if (!gl.current) return;
            root.classList.add("gl");
            size();
          });
        }),
      { rootMargin: "60% 0px" },
    );
    near.observe(root);
    const offM = addMeasure(size);

    // drag to look around (inside view)
    let sx = 0, sd = 0, lx = 0, lt = 0;
    const down = (e: PointerEvent) => {
      if (st.p < 0.62) return;
      st.dragging = true;
      sx = lx = e.clientX;
      sd = st.drag;
      lt = performance.now();
      st.dv = 0;
      root.classList.add("drag");
    };
    const move = (e: PointerEvent) => {
      if (!st.dragging) return;
      const k = engine.FINE ? 0.22 : 0.32, now = performance.now();
      st.drag = sd - (e.clientX - sx) * k;
      st.dv = (-(e.clientX - lx) * k) / Math.max(8, now - lt) * 16;
      lx = e.clientX;
      lt = now;
      st.needs = true;
    };
    const end = () => {
      st.dragging = false;
      root.classList.remove("drag");
    };
    cv.addEventListener("pointerdown", down);
    addEventListener("pointermove", move);
    addEventListener("pointerup", end);
    addEventListener("pointercancel", end);

    // tilt (gyroscope) on phones
    let gyro: null | { a: number; b: number } = null;
    const onOri = (e: DeviceOrientationEvent) => {
      if (e.alpha == null || e.beta == null) return;
      gyro ??= { a: e.alpha, b: e.beta };
      const da = ((e.alpha - gyro.a + 540) % 360) - 180;
      st.gy = -da;
      st.gp = clamp((e.beta - gyro.b) * 0.7, -30, 30);
      st.needs = true;
    };
    const clickTilt = async () => {
      if (tilt.classList.contains("on")) {
        removeEventListener("deviceorientation", onOri);
        tilt.classList.remove("on");
        gyro = null;
        st.gy = st.gp = 0;
        st.needs = true;
        return;
      }
      const DOE = DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> };
      try {
        if (typeof DOE.requestPermission === "function" && (await DOE.requestPermission()) !== "granted") return;
      } catch {
        return;
      }
      addEventListener("deviceorientation", onOri);
      tilt.classList.add("on");
    };
    if (!engine.FINE && "DeviceOrientationEvent" in window) {
      root.classList.add("touch-tilt");
      tilt.addEventListener("click", clickTilt);
    }
    return () => {
      alive = false;
      io.disconnect();
      near.disconnect();
      offM();
      cv.removeEventListener("pointerdown", down);
      removeEventListener("pointermove", move);
      removeEventListener("pointerup", end);
      removeEventListener("pointercancel", end);
      removeEventListener("deviceorientation", onOri);
      tilt.removeEventListener("click", clickTilt);
      gl.current?.dispose();
      gl.current = null;
    };
  }, []);

  useTicker((_, dt) => {
    const st = S.current, R = gl.current;
    if (!st.vis || !R || engine.menuOpen || !st.W) return;
    if (!engine.RM && st.p < 0.3) {
      st.idle = (st.idle + dt * 0.004) % 360;
      st.needs = true;
    }
    if (!st.dragging && Math.abs(st.dv) > 0.01) {
      st.drag += st.dv;
      st.dv *= 0.93;
      st.needs = true;
    }
    if (!st.needs) return;
    st.needs = false;
    const root = sec.current!, p = st.p, narrow = st.W < 900, portrait = st.H > st.W;
    const a = E.out(map(p, 0, 0.14)), u = E.inOut(map(p, 0.26, 0.5)), dvv = E.inOut(map(p, 0.5, 0.66)), inW = map(p, 0.6, 0.7);
    const sP = narrow ? 5.6 : 6.7, sIn = portrait ? 0.58 : 0.84;
    let s = sP * lerp(2.2, 1, a);
    s = Math.exp(lerp(Math.log(s), Math.log(2.1), u));
    s = Math.exp(lerp(Math.log(s), Math.log(sIn), dvv));
    const offP = narrow ? [0, -0.32 * (portrait ? 1.6 : 1)] : [0.62, -0.04];
    const off = [lerp(offP[0], 0, u), lerp(offP[1], 0, u)];
    const d = 1 - dvv;
    const idleA = ((st.idle + 180) % 360) - 180;
    const yScroll = p < 0.66 ? p * 200 : 132 + ((p - 0.66) / 0.34) * 360;
    const yawD = -112 + yScroll + idleA * (1 - map(p, 0.2, 0.32)) + st.drag + st.gy * inW;
    const pitchD = lerp(-90, 0, u) + (portrait ? 26 : 16) * dvv + st.gp * inW;
    const y = yawD * D2R, pt = pitchD * D2R, cp = Math.cos(pt);
    const Wv = [Math.sin(y) * cp, Math.sin(pt), Math.cos(y) * cp], Rv = [Math.cos(y), 0, -Math.sin(y)];
    const Uv = [Wv[1] * Rv[2] - Wv[2] * Rv[1], Wv[2] * Rv[0] - Wv[0] * Rv[2], Wv[0] * Rv[1] - Wv[1] * Rv[0]];
    R.draw({ W: Wv, R: Rv, U: Uv, d, s, off });
    // screen projection for the overlays
    const hs = Math.min(st.W, st.H) / 2;
    const proj = (v: number[]) => {
      const cx = v[0] * Rv[0] + v[1] * Rv[1] + v[2] * Rv[2], cy = v[0] * Uv[0] + v[1] * Uv[1] + v[2] * Uv[2], cz = v[0] * Wv[0] + v[1] * Wv[1] + v[2] * Wv[2];
      if (cz + d < 0.05) return null;
      const k = (1 + d) / (cz + d);
      return [st.W / 2 + ((cx * k) / s + off[0]) * hs, st.H / 2 - ((cy * k) / s + off[1]) * hs, (cx * k) / s];
    };
    const cam = root.querySelector<SVGElement>(".pl-cam")!, n = proj([0, -1, 0]), camA = 1 - map(p, 0.22, 0.34);
    if (n && camA > 0) {
      cam.style.opacity = camA.toFixed(3);
      cam.style.transform = `translate3d(${n[0].toFixed(1)}px,${n[1].toFixed(1)}px,0) scale(${((sP / s) * (narrow ? 1.1 : 1.3)).toFixed(3)})`;
    } else cam.style.opacity = "0";
    const inside = p > 0.66, hots = [...root.querySelectorAll<HTMLElement>(".pl-hot")];
    let best = -1, bd = narrow ? 0.55 : 0.9;
    hots.forEach((h, i) => {
      const q = inside ? proj(HOT_DIR[i]) : null;
      const on = !!q && q[0] > -40 && q[0] < st.W + 40 && q[1] > 60 && q[1] < st.H - 60;
      h.classList.toggle("vis", on);
      if (!q || !on) return;
      h.style.transform = `translate3d(${q[0].toFixed(1)}px,${q[1].toFixed(1)}px,0)`;
      // keep the card inside the screen
      const c = h.querySelector<HTMLElement>(".pl-card")!, w = Math.max(c.offsetWidth, h.classList.contains("act") ? (st.W < 900 ? 222 : 262) : 0);
      let l = -10;
      if (q[0] + l + w > st.W - 12) l = st.W - 12 - w - q[0];
      if (q[0] + l < 12) l = 12 - q[0];
      c.style.left = l.toFixed(0) + "px";
      if (Math.abs(q[2]) < bd) {
        bd = Math.abs(q[2]);
        best = i;
      }
    });
    if (best !== st.lastAct) {
      hots.forEach((h, i) => h.classList.toggle("act", i === best));
      st.lastAct = best;
    }
    root.querySelector(".pl-deg")!.textContent = Math.round(((yawD % 360) + 360) % 360) + "°";
  });

  return (
    <section data-nav="360° video" className="planet cv group/pl relative h-[560svh] bg-white max-[899px]:h-[500svh]" data-planet="" aria-label="360° video" ref={sec}>
      <div className="sticky top-0 h-svh overflow-hidden">
        <div className="pl-fallback group-[.gl]/pl:hidden absolute inset-x-0 top-1/2 flex h-[46vh] -translate-y-1/2 overflow-hidden [&_svg]:h-full [&_svg]:w-auto [&_svg]:max-w-none [&_svg]:flex-none" aria-hidden="true" dangerouslySetInnerHTML={{ __html: PANO + PANO }} />
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
