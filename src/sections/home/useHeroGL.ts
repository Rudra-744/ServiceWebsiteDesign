"use client";
import { type RefObject, useEffect, useRef } from "react";
import type { Cand, Particles } from "@/gl/particles";
import type { Pose, Quest } from "@/gl/quest";
import { INTRO, addMeasure, engine } from "@/lib/engine";
import { heroState } from "@/lib/heroState";
import { lerp, map } from "@/lib/motion";
import { useScrollScene } from "@/hooks/useScrollScene";
import { useTicker } from "@/hooks/useTicker";

// Hero WebGL layers (ANIMATION-SPEC H1), both loaded with import():
// - 3D Quest (gl/quest.ts): fetched on the visitor's first interaction (pointer, touch, wheel, key or scroll) after the
//   intro, when the browser is idle (WebGL2 only). Until then the photo shows. Idles, spins on drag,
//   eases back to the fixed pose, and hands its silhouette to the particles. The photo stays until the model has drawn its
//   first frame and faded in over it (.7s); only then does the photo fade out underneath.
// - Particles (gl/particles.ts): loaded on the first scroll inside the hero (they only show once the lens opens at p ≈ .14).
// Both draw only while the hero is on screen, no loader/morph covers it and the menu is closed; DPR is capped at 2.
const POSE = { yaw: (-26 * Math.PI) / 180, pitch: (7 * Math.PI) / 180 };
type Q = number[];
const qMul = (a: Q, b: Q): Q => [a[3] * b[0] + a[0] * b[3] + a[1] * b[2] - a[2] * b[1], a[3] * b[1] - a[0] * b[2] + a[1] * b[3] + a[2] * b[0], a[3] * b[2] + a[0] * b[1] - a[1] * b[0] + a[2] * b[3], a[3] * b[3] - a[0] * b[0] - a[1] * b[1] - a[2] * b[2]];
const qAxis = (x: number, y: number, z: number, a: number): Q => {
  const s = Math.sin(a / 2);
  return [x * s, y * s, z * s, Math.cos(a / 2)];
};
const qNorm = (q: Q) => {
  const l = Math.hypot(...q) || 1;
  return q.map((v) => v / l);
};
const qLerp = (a: Q, b: Q, t: number) => {
  const s = a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3] < 0 ? -1 : 1;
  return qNorm(a.map((v, i) => v + (b[i] * s - v) * t));
};
const QI = [0, 0, 0, 1];
const idle = (fn: () => void) => ("requestIdleCallback" in window ? requestIdleCallback(fn, { timeout: 2600 }) : setTimeout(fn, 1400));

export function useHeroGL(sec: RefObject<HTMLElement | null>, pin: RefObject<HTMLDivElement | null>) {
  const G = useRef({
    ptl: null as Particles | null,
    ptlLoading: false,
    q3: null as Quest | null,
    q3Shown: false,
    visor: null as HTMLElement | null,
    glCand: null as Cand | null,
    q: QI,
    vx: 0,
    vy: 0,
    drag: false,
    lastDrag: 0,
    lx: 0,
    ly: 0,
    lt: 0,
    mx: 0,
    my: 0,
    tmx: 0,
    tmy: 0,
    t0: 0,
    alive: true,
    loadPtl: () => {},
    spin: (ax: number, ay: number): unknown => [ax, ay],
  });

  useEffect(() => {
    const g = G.current, root = pin.current!, visor = root.querySelector<HTMLElement>(".visor")!;
    const qcv = root.querySelector<HTMLCanvasElement>(".q3-cv")!, fcv = root.querySelector<HTMLCanvasElement>(".fov-cv")!;
    g.alive = true;
    g.visor = visor;
    g.t0 = performance.now();
    const q3Rect = () => {
      const c = qcv.getBoundingClientRect(), p = root.getBoundingClientRect();
      return { x: c.left - p.left, y: c.top - p.top, w: c.width, h: c.height };
    };

    // particles: shapes are built on the first scroll; the headset starts from the photo's pixels
    g.loadPtl = () => {
      if (g.ptlLoading) return;
      g.ptlLoading = true;
      import("@/gl/particles").then(({ createParticles, candidates }) => {
        if (!g.alive) return;
        const P = createParticles(fcv);
        if (!P) return;
        g.ptl = P;
        P.build();
        P.timeline(heroState.p);
        if (g.glCand) P.setHeadset(g.glCand, q3Rect, true);
        const im = new Image();
        im.onload = () => {
          if (!g.alive || !g.ptl) return;
          const c = document.createElement("canvas");
          c.width = im.naturalWidth;
          c.height = im.naturalHeight;
          const x = c.getContext("2d")!;
          x.drawImage(im, 0, 0);
          const cand = candidates(x.getImageData(0, 0, c.width, c.height).data, c.width, c.height, 2);
          if (cand) g.ptl.setHeadset(cand, () => heroState.r, false);
        };
        im.src = "/images/quest3.png";
      });
    };

    // 3D Quest: fit the fixed pose into the visor box, then sample its silhouette for the particles
    const q3Size = () => {
      const R = g.q3;
      if (!R) return;
      const W = qcv.clientWidth, H = qcv.clientHeight;
      if (!W || !H) return;
      const k = Math.min(2, devicePixelRatio || 1);
      qcv.width = Math.round(W * k);
      qcv.height = Math.round(H * k);
      R.fit = [1, 0, 0];
      const sw = 320, sh = Math.max(2, Math.round((sw * H) / W)), px = R.snapshot(POSE, sw, sh);
      let x0 = sw, x1 = -1, y0 = sh, y1 = -1;
      for (let y = 0; y < sh; y++)
        for (let x = 0; x < sw; x++)
          if (px[(y * sw + x) * 4 + 3] > 20) {
            if (x < x0) x0 = x;
            if (x > x1) x1 = x;
            if (y < y0) y0 = y;
            if (y > y1) y1 = y;
          }
      if (x1 > x0) {
        const a0 = (x0 / sw) * 2 - 1, a1 = ((x1 + 1) / sw) * 2 - 1, b0 = (y0 / sh) * 2 - 1, b1 = ((y1 + 1) / sh) * 2 - 1;
        const kk = Math.min(1.3 / (a1 - a0), 1.3 / (b1 - b0));
        R.fit = [kk, (-kk * (a0 + a1)) / 2, (-kk * (b0 + b1)) / 2];
      }
      // silhouette for the particles (GL rows come bottom-first: flip them)
      const w2 = 560, h2 = Math.max(2, Math.round((w2 * H) / W)), raw = R.snapshot(POSE, w2, h2), d = new Uint8Array(raw.length), row = w2 * 4;
      for (let y = 0; y < h2; y++) d.set(raw.subarray((h2 - 1 - y) * row, (h2 - y) * row), y * row);
      import("@/gl/particles").then(({ candidates }) => {
        const c = candidates(d, w2, h2, 2);
        if (!c || !g.alive) return;
        g.glCand = c;
        g.ptl?.setHeadset(c, q3Rect, true);
      });
    };
    let q3Started = false, idleId = 0;
    const startQ3 = () => {
      if (q3Started || !window.WebGL2RenderingContext) return;
      q3Started = true;
      idleId = idle(() =>
        Promise.all([import("@/gl/quest"), import("@/gl/quest").then((m) => m.loadModel("/models/quest3.glb"))])
          .then(([{ createQuest }, model]) => {
            if (!g.alive) return;
            g.q3 = createQuest(qcv, model, { fov: (22 * Math.PI) / 180, dist: 0.9 });
            if (!g.q3) return;
            q3Size();
            // `.gl` (photo → model) is added by the ticker once the canvas holds its first frame
          })
          .catch((err) => console.warn("Quest 3 model unavailable, using the photo", err)),
      ) as unknown as number;
    };
    // deferred to the first interaction after the intro: the model upload and its snapshots are heavy main-thread work on phones
    const EVS = ["pointermove", "pointerdown", "touchstart", "wheel", "keydown", "scroll"];
    let introDone = false, interacted = false;
    const tryStart = () => introDone && interacted && startQ3();
    const onInteract = () => {
      interacted = true;
      EVS.forEach((ev) => removeEventListener(ev, onInteract));
      tryStart();
    };
    const onIntro = () => {
      introDone = true;
      tryStart();
    };
    EVS.forEach((ev) => addEventListener(ev, onInteract, { passive: true }));
    addEventListener(INTRO, onIntro);
    if (!document.documentElement.classList.contains("preloading") && !engine.busy) onIntro();

    const offM = addMeasure(() => {
      g.ptl?.build();
      q3Size();
    });

    // drag the headset to spin it freely; the mouse also leans the model and the particles
    if (window.WebGL2RenderingContext) visor.dataset.cursor = "Drag";
    const spin = (ax: number, ay: number) => (g.q = qNorm(qMul(qAxis(0, 1, 0, ax), qMul(qAxis(1, 0, 0, ay), g.q))));
    const down = (e: PointerEvent) => {
      if (!g.q3 || heroState.p > 0.01) return;
      Object.assign(g, { drag: true, lx: e.clientX, ly: e.clientY, lt: performance.now(), vx: 0, vy: 0 });
      visor.classList.add("drag");
      try {
        visor.setPointerCapture(e.pointerId);
      } catch {}
    };
    const move = (e: PointerEvent) => {
      if (engine.FINE) {
        g.tmx = e.clientX / innerWidth - 0.5;
        g.tmy = e.clientY / innerHeight - 0.5;
        g.ptl?.pointer(g.tmx, g.tmy);
      }
      if (!g.drag) return;
      const now = performance.now(), k = engine.FINE ? 0.009 : 0.012, ax = (e.clientX - g.lx) * k, ay = (e.clientY - g.ly) * k, dt = Math.max(8, now - g.lt);
      spin(ax, ay);
      Object.assign(g, { vx: (ax / dt) * 16, vy: (ay / dt) * 16, lx: e.clientX, ly: e.clientY, lt: now, lastDrag: now });
    };
    const end = () => {
      if (!g.drag) return;
      g.drag = false;
      g.lastDrag = performance.now();
      visor.classList.remove("drag");
    };
    visor.addEventListener("pointerdown", down);
    addEventListener("pointermove", move, { passive: true });
    addEventListener("pointerup", end);
    addEventListener("pointercancel", end);
    g.spin = spin;

    return () => {
      g.alive = false;
      removeEventListener(INTRO, onIntro);
      EVS.forEach((ev) => removeEventListener(ev, onInteract));
      if ("cancelIdleCallback" in window) cancelIdleCallback(idleId);
      else clearTimeout(idleId);
      offM();
      visor.removeEventListener("pointerdown", down);
      removeEventListener("pointermove", move);
      removeEventListener("pointerup", end);
      removeEventListener("pointercancel", end);
      g.ptl?.dispose();
      g.q3?.dispose();
      Object.assign(g, { ptl: null, q3: null, q3Shown: false, visor: null, ptlLoading: false, glCand: null });
    };
  }, [pin]);

  // particle timeline follows the hero pin; the first scroll loads the particles
  useScrollScene(sec, (p) => {
    const g = G.current;
    if (p > 0) g.loadPtl();
    g.ptl?.timeline(p);
  });

  useTicker((now) => {
    const g = G.current, on = heroState.vis && !engine.cover && !engine.menuOpen;
    if (g.ptl) {
      if (on) g.ptl.frame(now, engine.RM);
      else g.ptl.rest(now);
    }
    const R = g.q3, p = heroState.p;
    if (!R || !on || p > 0.35) return;
    const t = (now - g.t0) / 1000, w = 1 - map(p, 0.004, 0.04);
    if (!g.drag) {
      if (Math.abs(g.vx) + Math.abs(g.vy) > 1e-4) {
        g.spin(g.vx, g.vy);
        g.vx *= 0.94;
        g.vy *= 0.94;
      }
      if (now - g.lastDrag > 2600) g.q = qLerp(g.q, QI, 0.03);
    }
    g.mx = lerp(g.mx, g.tmx, 0.05);
    g.my = lerp(g.my, g.tmy, 0.05);
    const rm = engine.RM, iy = rm ? 0 : Math.sin(t * 0.42) * 0.22, ip = rm ? 0 : Math.sin(t * 0.66) * 0.045;
    const pose: Pose = { q: qLerp(QI, g.q, w), yaw: POSE.yaw + (iy + g.mx * 0.4) * w, pitch: POSE.pitch + (ip + g.my * 0.2) * w, y: (rm ? 0 : Math.sin(t * 0.9) * 0.005) * w };
    R.draw(pose, R.gl.canvas.width, R.gl.canvas.height);
    if (!g.q3Shown) {
      g.q3Shown = true;
      g.visor?.classList.add("gl");
    }
  });
}
