// Particle world inside the hero visor (reference PTL, WebGL1 points). Shapes: 0 sphere, 1 grid of 200 headsets,
// 2 house, 3 360° globe, 4 VR HUB network, 5 the headset itself (sampled from the photo, or from the 3D model once it renders).
// The reference also built a "scanned room" (shape 5 there) whose scan uniforms were never switched on; it is not ported.
// Loaded with import() on the first scroll inside the hero.
import { E, clamp, lerp, map, rnd } from "@/lib/motion";
import { M4, dpr, lose, program } from "./util";

const HS = 5; // index of the headset buffer
type V3 = number[];

function shapes(N: number, portrait: boolean) {
  const R = (i: number) => rnd(i * 1.37 + 11.1);
  const fib = (i: number, n: number): V3 => {
    const y = 1 - (2 * (i + 0.5)) / n, r = Math.sqrt(1 - y * y), th = i * 2.39996323;
    return [Math.cos(th) * r, y, Math.sin(th) * r];
  };
  const shuffle = (arr: V3[], seed: number) => {
    const idx = arr.map((_, i) => i);
    for (let i = idx.length - 1; i > 0; i--) {
      const k = Math.floor(rnd(i * 3.1 + seed) * (i + 1));
      [idx[i], idx[k]] = [idx[k], idx[i]];
    }
    return idx.map((i) => arr[i]);
  };
  type Edge = [V3, V3];
  const along = (edges: Edge[], count: number, jit: number, seed: number) => {
    const lens = edges.map(([a, b]) => Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2])), tot = lens.reduce((s, v) => s + v, 0);
    const out: V3[] = [];
    let ei = 0, acc = 0;
    for (let i = 0; i < count; i++) {
      const d = ((i + 0.5) / count) * tot;
      while (ei < edges.length - 1 && d > acc + lens[ei]) acc += lens[ei++];
      const [a, b] = edges[ei], t = clamp((d - acc) / lens[ei]);
      out.push([a[0] + (b[0] - a[0]) * t + (R(i + seed) - 0.5) * jit, a[1] + (b[1] - a[1]) * t + (R(i + seed + 7) - 0.5) * jit, a[2] + (b[2] - a[2]) * t + (R(i + seed + 13) - 0.5) * jit]);
    }
    return out;
  };
  const sphere: V3[] = [];
  for (let i = 0; i < N; i++) sphere.push(fib(i, N));
  const poly = (pts: V3[], closed = true) => {
    const e: Edge[] = [];
    for (let i = 0; i < pts.length - (closed ? 0 : 1); i++) e.push([pts[i], pts[(i + 1) % pts.length]]);
    return e;
  };
  const rrect = (cx: number, cy: number, w: number, h: number, r: number, z = 0, n = 6) => {
    const pts: V3[] = [];
    for (const [ox, oy, q] of [[w / 2 - r, h / 2 - r, 0], [-w / 2 + r, h / 2 - r, 1], [-w / 2 + r, -h / 2 + r, 2], [w / 2 - r, -h / 2 + r, 3]])
      for (let i = 0; i <= n; i++) {
        const a = ((q + i / n) * Math.PI) / 2;
        pts.push([cx + ox + Math.cos(a) * r, cy + oy + Math.sin(a) * r, z]);
      }
    return poly(pts);
  };
  const arc = (cx: number, cy: number, rx: number, ry: number, a0: number, a1: number, n: number, z = 0, plane = "xy") => {
    const pts: V3[] = [];
    for (let i = 0; i <= n; i++) {
      const a = a0 + ((a1 - a0) * i) / n, u = Math.cos(a) * rx, v = Math.sin(a) * ry;
      pts.push(plane === "xy" ? [cx + u, cy + v, z] : plane === "xz" ? [cx + u, z, cy + v] : [z, cy + v, cx + u]);
    }
    return poly(pts, false);
  };
  // a generic VR headset, front view: body, lens window, side straps, top strap
  const headset = (cx: number, cy: number, s: number): Edge[] => [
    ...rrect(cx, cy, s, s * 0.58, s * 0.25, 0, 5),
    ...rrect(cx, cy - s * 0.02, s * 0.72, s * 0.28, s * 0.13, 0, 4),
    [[cx - s * 0.5, cy + s * 0.06, 0], [cx - s * 0.64, cy + s * 0.06, 0]],
    [[cx - s * 0.64, cy + s * 0.06, 0], [cx - s * 0.64, cy - s * 0.06, 0]],
    [[cx - s * 0.64, cy - s * 0.06, 0], [cx - s * 0.5, cy - s * 0.06, 0]],
    [[cx + s * 0.5, cy + s * 0.06, 0], [cx + s * 0.64, cy + s * 0.06, 0]],
    [[cx + s * 0.64, cy + s * 0.06, 0], [cx + s * 0.64, cy - s * 0.06, 0]],
    [[cx + s * 0.64, cy - s * 0.06, 0], [cx + s * 0.5, cy - s * 0.06, 0]],
    ...arc(cx, cy + s * 0.26, s * 0.3, s * 0.2, 0, Math.PI, 8),
  ];
  // 1 grid of 200 headset icons
  const cols = portrait ? 10 : 20, rows = portrait ? 20 : 10, sp = portrait ? 0.18 : 0.135, gy = portrait ? 0.3 : 0.12, ge: Edge[] = [];
  for (let k = 0; k < 200; k++) ge.push(...headset(((k % cols) - (cols - 1) / 2) * sp, ((rows - 1) / 2) * sp - Math.floor(k / cols) * sp + gy, sp * 0.64));
  const grid = along(ge, N, 0.004, 1);
  // 2 house: walls, pitched roof, door, windows, chimney, plot and path
  const X = 0.82, Y0 = -0.72, Y1 = 0.12, Z = 0.56, RY = 0.74;
  const he: Edge[] = [
    [[-X, Y0, -Z], [X, Y0, -Z]], [[X, Y0, -Z], [X, Y0, Z]], [[X, Y0, Z], [-X, Y0, Z]], [[-X, Y0, Z], [-X, Y0, -Z]],
    [[-X, Y1, -Z], [X, Y1, -Z]], [[X, Y1, -Z], [X, Y1, Z]], [[X, Y1, Z], [-X, Y1, Z]], [[-X, Y1, Z], [-X, Y1, -Z]],
    [[-X, Y0, -Z], [-X, Y1, -Z]], [[X, Y0, -Z], [X, Y1, -Z]], [[X, Y0, Z], [X, Y1, Z]], [[-X, Y0, Z], [-X, Y1, Z]],
    [[-X, RY, 0], [X, RY, 0]], [[-X, Y1, Z], [-X, RY, 0]], [[-X, Y1, -Z], [-X, RY, 0]], [[X, Y1, Z], [X, RY, 0]], [[X, Y1, -Z], [X, RY, 0]],
    ...poly([[-0.16, Y0, Z], [-0.16, -0.26, Z], [0.16, -0.26, Z], [0.16, Y0, Z]], false),
    ...poly([[-0.64, -0.42, Z], [-0.34, -0.42, Z], [-0.34, -0.14, Z], [-0.64, -0.14, Z]]), [[-0.49, -0.42, Z], [-0.49, -0.14, Z]],
    ...poly([[0.34, -0.42, Z], [0.64, -0.42, Z], [0.64, -0.14, Z], [0.34, -0.14, Z]]), [[0.49, -0.42, Z], [0.49, -0.14, Z]],
    ...poly([[X, -0.42, -0.3], [X, -0.42, 0.2], [X, -0.14, 0.2], [X, -0.14, -0.3]]),
    ...poly([[0.45, 0.44, -0.15], [0.45, 0.84, -0.15], [0.62, 0.84, -0.15], [0.62, 0.3, -0.15]], false),
    ...poly([[-1.25, Y0, -0.85], [1.25, Y0, -0.85], [1.25, Y0, 1.15], [-1.25, Y0, 1.15]]),
    [[-0.16, Y0, Z], [-0.16, Y0, 1.15]], [[0.16, Y0, Z], [0.16, Y0, 1.15]],
  ];
  const house = along(he, N, 0.012, 3);
  // 3 360° video: wireframe globe, an orbit arrow around it and a play button
  const GR = 0.78, g3: Edge[] = [];
  for (let k = 0; k < 6; k++) {
    const t = (k / 6) * Math.PI;
    g3.push(...arc(0, 0, GR, GR, 0, Math.PI * 2, 40).map(([a, b]): Edge => [[a[0] * Math.cos(t), a[1], a[0] * Math.sin(t)], [b[0] * Math.cos(t), b[1], b[0] * Math.sin(t)]]));
  }
  for (const l of [-60, -30, 0, 30, 60]) {
    const y = Math.sin((l * Math.PI) / 180) * GR, r = Math.cos((l * Math.PI) / 180) * GR;
    g3.push(...arc(0, 0, r, r, 0, Math.PI * 2, 40, y, "xz"));
  }
  const tilt = 0.32;
  const orb = arc(0, 0, 1.2, 1.2, 0.35, Math.PI * 2 - 0.1, 64, 0, "xz").map((e) => e.map(([x, y, z]) => [x, y * Math.cos(tilt) - z * Math.sin(tilt), y * Math.sin(tilt) + z * Math.cos(tilt)]) as Edge);
  const tip = orb[orb.length - 1][1], prev = orb[orb.length - 4][0], dx = tip[0] - prev[0], dz = tip[2] - prev[2], dl = Math.hypot(dx, dz) || 1;
  const side = (s: number): V3 => [tip[0] - (dx / dl) * 0.16 + (dz / dl) * 0.09 * s, tip[1], tip[2] - (dz / dl) * 0.16 - (dx / dl) * 0.09 * s];
  orb.push([tip, side(1)], [tip, side(-1)]);
  const play = poly([[-0.13, 0.17, GR + 0.02], [-0.13, -0.17, GR + 0.02], [0.18, 0, GR + 0.02]]);
  const city = [...along(g3, Math.floor(N * 0.5), 0.006, 21), ...along(orb, Math.floor(N * 0.3), 0.008, 23)];
  city.push(...along(play, N - city.length, 0.006, 25));
  // 4 VR HUB: one console in the middle, wired to 8 headsets
  const nodes: number[][] = [];
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2 + Math.PI / 8;
    nodes.push([Math.cos(a) * 1.08, Math.sin(a) * 1.08 * (portrait ? 1.25 : 0.8)]);
  }
  const con: Edge[] = [...rrect(0, 0.04, 0.5, 0.32, 0.04), ...rrect(0, 0.04, 0.42, 0.24, 0.02), [[0, -0.12, 0], [0, -0.2, 0]], [[-0.12, -0.2, 0], [0.12, -0.2, 0]]];
  const hs: Edge[] = [];
  nodes.forEach(([x, y]) => hs.push(...headset(x, y, 0.26)));
  const wires: Edge[] = [];
  nodes.forEach(([x, y]) => {
    const l = Math.hypot(x, y), ux = x / l, uy = y / l;
    for (let d = 0.36; d < l - 0.2; d += 0.09) wires.push([[ux * d, uy * d, 0], [ux * (d + 0.05), uy * (d + 0.05), 0]]);
  });
  const net = [...along(con, Math.floor(N * 0.18), 0.004, 61), ...along(hs, Math.floor(N * 0.5), 0.004, 63)];
  net.push(...along(wires, N - net.length, 0.004, 67));
  // desktop: keep the icons clear of the caption in the bottom-left corner
  const shift = (arr: V3[], dx2: number, dy2: number, k = 1) => {
    if (!portrait)
      arr.forEach((q) => {
        q[0] = q[0] * k + dx2;
        q[1] = q[1] * k + dy2;
        q[2] *= k;
      });
  };
  shift(grid, 0.55, 0.06);
  shift(house, 0.78, 0.14, 0.88);
  shift(city, 0.82, 0.16);
  shift(net, 0.72, 0.1);
  if (portrait)
    house.forEach((q) => {
      q[0] *= 0.84;
      q[1] = q[1] * 0.84 + 0.06;
      q[2] *= 0.84;
    });
  return [sphere, grid, house, city, net].map((s, i) => {
    const f = new Float32Array(N * 3);
    shuffle(s, i * 17 + 3).forEach((p, k) => f.set(p, k * 3));
    return f;
  });
}

const VS = `attribute vec3 aA;attribute vec3 aB;attribute vec4 aR;attribute vec3 aC;attribute float aD;
uniform float uT,uSA,uSB,uBurst,uSize,uCamZ,uSweep,uCA,uLens;uniform vec3 uWind;uniform vec2 uRot;uniform mat4 uP;
varying float vA;varying vec3 vCol;
void main(){float tt=mix(uT,clamp((uT-aD)/.52,0.,1.),uSweep);float e=tt*tt*(3.-2.*tt);float s=sin(tt*3.14159);
vec3 p=mix(aA*uSA,aB*uSB,e)+aR.xyz*s*uBurst+uWind*s*uSweep*(.6+aR.w*.8);
float cy=cos(uRot.x),sy=sin(uRot.x);p=vec3(cy*p.x+sy*p.z,p.y,-sy*p.x+cy*p.z);
float cx=cos(uRot.y),sx=sin(uRot.y);p=vec3(p.x,cx*p.y-sx*p.z,sx*p.y+cx*p.z);
vec4 v=vec4(p.x,p.y,p.z-uCamZ,1.);gl_Position=uP*v;float d=-v.z;
float ca=uCA*(1.-smoothstep(.5,.95,tt));float hv=1.-uCA*uSweep*(1.-smoothstep(0.,.04,tt));
gl_PointSize=clamp(uSize*uCamZ/max(d,.05),1.,18.)*(1.+ca*.35);
vA=mix(clamp(1.55-d/uCamZ*.6,.28,1.),1.,ca)*hv;vec3 wc=aR.w>.94?vec3(.02):vec3(1.);vec3 hc=mix(mix(aC,vec3(.33,.55,1.),smoothstep(.06,.4,tt)),wc,smoothstep(.55,.95,tt)*uLens);vCol=mix(wc,hc,uCA);}`;
const FS = `precision mediump float;varying float vA;varying vec3 vCol;
void main(){vec2 c=gl_PointCoord-.5;if(dot(c,c)>.25||vA<.01)discard;gl_FragColor=vec4(vCol,vA);}`;

/** weighted particle candidates sampled from RGBA pixels (edges and dark parts get more points) */
export type Cand = { cand: number[]; cum: number[]; iw: number; ih: number };
export function candidates(d: Uint8Array | Uint8ClampedArray, iw: number, ih: number, step: number): Cand | null {
  const L = (u: number, v: number) => {
    const k = (v * iw + u) * 4;
    return (d[k] * 0.3 + d[k + 1] * 0.59 + d[k + 2] * 0.11) / 255;
  };
  const cand: number[] = [], cum: number[] = [];
  let tot = 0;
  for (let v = 1; v < ih - 1; v += step)
    for (let u = 1; u < iw - 1; u += step) {
      const k = (v * iw + u) * 4;
      if (d[k + 3] < 200) continue;
      const l = L(u, v), ed = Math.abs(l - L(u + 1, v)) + Math.abs(l - L(u, v + 1)) + Math.abs(l - L(u - 1, v)) + Math.abs(l - L(u, v - 1));
      tot += 0.7 + Math.min(1, ed * 3) * 1.2 + (1 - l) * 0.25;
      cand.push(u, v, d[k] / 255, d[k + 1] / 255, d[k + 2] / 255);
      cum.push(tot);
    }
  return cand.length ? { cand, cum, iw, ih } : null;
}

type Rect = { x: number; y: number; w: number; h: number };

export function createParticles(cv: HTMLCanvasElement) {
  const gl = cv.getContext("webgl", { antialias: true, alpha: true, premultipliedAlpha: false });
  if (!gl) return null;
  let pr: WebGLProgram;
  try {
    pr = program(gl, VS, FS);
  } catch (err) {
    console.warn("Particle shader failed", err);
    return null;
  }
  const loc = Object.fromEntries(["aA", "aB", "aR", "aC", "aD"].map((k) => [k, gl.getAttribLocation(pr, k)]));
  const u = Object.fromEntries(["uT", "uSA", "uSB", "uBurst", "uSize", "uCamZ", "uRot", "uP", "uSweep", "uCA", "uWind", "uLens"].map((k) => [k, gl.getUniformLocation(pr, k)]));
  gl.enable(gl.BLEND);
  gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  gl.clearColor(0, 0, 0, 0);
  const S = { n: 0, W: 0, H: 0, dpr: 1, portrait: false, camZ: 3.2, dive: 8, P: [] as number[], ang: 0, tilt: 0, px: 0, py: 0, tpx: 0, tpy: 0, pk: 1, a: 0, b: 0, t: 0, sa: 1, sb: 1, speed: 1, sweep: 0, lensK: 1, last: 0 };
  let bufs: WebGLBuffer[] = [], rbuf: WebGLBuffer | null = null, cbuf: WebGLBuffer | null = null, dbuf: WebGLBuffer | null = null;
  let src: { c: Cand; rect: () => Rect | null; gl: boolean } | null = null;

  /** place shape 5 (the headset) over the photo or the 3D canvas, in world space at the camera's focal plane */
  const headset = () => {
    const r = src?.rect();
    if (!src || !r || !S.n || !S.W) return;
    const { cand, cum, iw, ih } = src.c, N = S.n, pos = new Float32Array(N * 3), col = new Float32Array(N * 3), del = new Float32Array(N);
    const f = 1 / Math.tan((25 * Math.PI) / 180), asp = S.W / S.H, cz = S.camZ, tot = cum[cum.length - 1];
    for (let i = 0; i < N; i++) {
      const q = rnd(i * 7.31 + 0.5) * tot;
      let lo = 0, hi = cum.length - 1;
      while (lo < hi) {
        const m = (lo + hi) >> 1;
        if (cum[m] < q) lo = m + 1;
        else hi = m;
      }
      const k = lo * 5, uu = cand[k] + (rnd(i * 3.7 + 1) - 0.5) * 1.6, vv = cand[k + 1] + (rnd(i * 5.9 + 2) - 0.5) * 1.6;
      const sx = r.x + (uu / iw) * r.w, sy = r.y + (vv / ih) * r.h;
      pos.set([((sx / S.W) * 2 - 1) * asp * (cz / f), (-((sy / S.H) * 2 - 1) * cz) / f, (rnd(i * 9.1 + 4) - 0.5) * 0.02], i * 3);
      col.set([cand[k + 2] * 0.86, cand[k + 3] * 0.87, cand[k + 4] * 0.9], i * 3);
      del[i] = (uu / iw) * 0.42 + rnd(i * 2.3 + 8) * 0.06;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, bufs[HS]);
    gl.bufferData(gl.ARRAY_BUFFER, pos, gl.DYNAMIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, cbuf);
    gl.bufferData(gl.ARRAY_BUFFER, col, gl.DYNAMIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, dbuf);
    gl.bufferData(gl.ARRAY_BUFFER, del, gl.DYNAMIC_DRAW);
  };

  return {
    dispose: () => lose(gl),
    /** size the canvas (DPR ≤ 2) and (re)build the shapes when the point count or orientation changes */
    build() {
      const W = cv.clientWidth, H = cv.clientHeight;
      if (!W || !H) return;
      S.dpr = dpr();
      cv.width = Math.round(W * S.dpr);
      cv.height = Math.round(H * S.dpr);
      gl.viewport(0, 0, cv.width, cv.height);
      S.W = W;
      S.H = H;
      const portrait = W / H < 0.9, N = W < 820 ? 7200 : 12000, fov = (50 * Math.PI) / 180, asp = W / H;
      S.camZ = 1.42 / (Math.tan(fov / 2) * Math.min(asp, 1));
      S.dive = S.camZ * 0.82;
      S.P = M4.persp(fov, asp, 0.05, 100);
      if (S.n !== N || S.portrait !== portrait) {
        S.n = N;
        S.portrait = portrait;
        bufs.forEach((b) => gl.deleteBuffer(b));
        const sh = shapes(N, portrait);
        bufs = sh.map((arr) => {
          const b = gl.createBuffer()!;
          gl.bindBuffer(gl.ARRAY_BUFFER, b);
          gl.bufferData(gl.ARRAY_BUFFER, arr, gl.STATIC_DRAW);
          return b;
        });
        const hb = gl.createBuffer()!; // shape 5 starts as the sphere until the headset is sampled
        gl.bindBuffer(gl.ARRAY_BUFFER, hb);
        gl.bufferData(gl.ARRAY_BUFFER, sh[0], gl.DYNAMIC_DRAW);
        bufs.push(hb);
        [cbuf, dbuf, rbuf].forEach((b) => b && gl.deleteBuffer(b));
        cbuf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, cbuf);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(N * 3).fill(1), gl.DYNAMIC_DRAW);
        dbuf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, dbuf);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(N), gl.DYNAMIC_DRAW);
        const r = new Float32Array(N * 4);
        for (let i = 0; i < N; i++) {
          const a = rnd(i * 2.1 + 5) * Math.PI * 2, z = rnd(i * 4.3 + 9) * 2 - 1, s = Math.sqrt(1 - z * z), m = 0.4 + rnd(i * 6.7 + 1) * 0.8;
          r.set([Math.cos(a) * s * m, z * m, Math.sin(a) * s * m, rnd(i * 8.9 + 3)], i * 4);
        }
        rbuf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, rbuf);
        gl.bufferData(gl.ARRAY_BUFFER, r, gl.STATIC_DRAW);
      }
      headset();
    },
    /** headset candidates: from the photo first; the 3D model's snapshot replaces them for good */
    setHeadset(c: Cand, rect: () => Rect | null, fromGL: boolean) {
      if (src?.gl && !fromGL) return;
      src = { c, rect, gl: fromGL };
      headset();
    },
    remeasure: headset,
    pointer(x: number, y: number) {
      S.tpx = x;
      S.tpy = y;
    },
    /** particle part of the hero scroll timeline: headset → sphere → dive inside → 200 grid → house → 360° → network */
    timeline(p: number) {
      const e = E.inOut(map(p, 0.14, 0.36)), mt = map(p, 0.05, 0.34), D = S.dive;
      let a = 0, b = 0, t = 0, sa = 1, sb = 1, sp = 1, sw = 0;
      if (p < 0.36) {
        a = HS;
        t = mt;
        sw = 1;
        sb = lerp(1, 1.3, E.inOut(map(p, 0.1, 0.36)));
      } else if (p < 0.46) {
        const q = map(p, 0.36, 0.46);
        sa = sb = lerp(1.3, D, E.inOut(q));
        sp = 1 + q * 5;
      } else if (p < 0.56) {
        b = 1;
        t = 1 - Math.pow(1 - map(p, 0.46, 0.56), 2.2);
        sa = D;
      } else if (p < 0.6) a = b = 1;
      else if (p < 0.68) [a, b, t] = [1, 2, map(p, 0.6, 0.68)];
      else if (p < 0.72) a = b = 2;
      else if (p < 0.8) [a, b, t] = [2, 3, map(p, 0.72, 0.8)];
      else if (p < 0.84) a = b = 3;
      else if (p < 0.92) [a, b, t] = [3, 4, map(p, 0.84, 0.92)];
      else a = b = 4;
      Object.assign(S, { a, b, t, sa, sb, speed: sp, sweep: sw, lensK: p < 0.36 ? e : 1 });
    },
    frame(now: number, rm: boolean) {
      if (!S.n) return;
      const dt = Math.min(64, now - (S.last || now)) / 1000;
      S.last = now;
      const dom = S.t < 0.5 ? S.a : S.b, hs = dom === HS;
      if (dom === 0) S.ang += dt * (rm ? 0 : 0.32 * S.speed);
      else {
        const tgt = Math.round(S.ang / (Math.PI * 2)) * Math.PI * 2 + (rm || hs ? 0 : Math.sin(now / 2400) * (dom === 2 ? 0.55 : 0.22));
        S.ang = lerp(S.ang, tgt, hs ? 0.12 : 0.08);
      }
      const tiltT = dom === 1 || dom === 4 || hs ? 0 : dom === 2 ? 0.3 : 0.22;
      S.pk = lerp(S.pk, hs ? 0 : 1, 0.08);
      S.tilt = lerp(S.tilt, tiltT, 0.06);
      S.px = lerp(S.px, S.tpx, 0.06);
      S.py = lerp(S.py, S.tpy, 0.06);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform1f(u.uT, S.t);
      gl.uniform1f(u.uSA, S.sa);
      gl.uniform1f(u.uSB, S.sb);
      gl.uniform1f(u.uBurst, 0.55);
      gl.uniform1f(u.uSize, (S.W < 820 ? 2.05 : 2.3) * S.dpr);
      gl.uniform1f(u.uCamZ, S.camZ);
      gl.uniform2f(u.uRot, S.ang + S.px * 0.7 * S.pk, S.tilt + S.py * 0.45 * S.pk);
      gl.uniform1f(u.uSweep, S.sweep);
      gl.uniform1f(u.uLens, S.lensK);
      gl.uniform1f(u.uCA, S.a === HS ? 1 : 0);
      gl.uniform3fv(u.uWind, [-0.75, 0.5, 1.1]);
      gl.uniformMatrix4fv(u.uP, false, new Float32Array(S.P));
      const bind = (l: number, b: WebGLBuffer | null, size: number) => {
        gl.bindBuffer(gl.ARRAY_BUFFER, b);
        gl.enableVertexAttribArray(l);
        gl.vertexAttribPointer(l, size, gl.FLOAT, false, 0, 0);
      };
      bind(loc.aA, bufs[S.a], 3);
      bind(loc.aB, bufs[S.b], 3);
      bind(loc.aR, rbuf, 4);
      bind(loc.aC, cbuf, 3);
      bind(loc.aD, dbuf, 1);
      gl.drawArrays(gl.POINTS, 0, S.n);
    },
    /** keep the timing clock from jumping after a pause */
    rest(now: number) {
      S.last = now;
    },
  };
}
export type Particles = NonNullable<ReturnType<typeof createParticles>>;
