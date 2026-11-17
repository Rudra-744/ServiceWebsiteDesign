// Walkthrough renderer (ANIMATION-SPEC H9 / RE2): the 11 × 8 m sample flat as flat-shaded boxes and cylinders,
// one draw call, vertex colours. Loaded with import() when the walkthrough comes near the viewport.
import { M4, dpr, lose, program } from "./util";

type Geo = { P: Float32Array; C: Float32Array; n: number };
let GEO: Geo | null = null;

function geometry(): Geo {
  if (GEO) return GEO;
  const P: number[] = [], C: number[] = [];
  const hex = (h: string) => [parseInt(h.slice(1, 3), 16) / 255, parseInt(h.slice(3, 5), 16) / 255, parseInt(h.slice(5, 7), 16) / 255];
  const Ld = (() => {
    const v = [0.45, 0.55, -0.7], l = Math.hypot(...v);
    return v.map((a) => a / l);
  })();
  const face = (vs: number[][], n: number[], col: number[], flat?: boolean) => {
    const d = n[0] * Ld[0] + n[1] * Ld[1] + n[2] * Ld[2];
    const sh = flat ? 1 : 0.8 + 0.2 * Math.max(0, d) + (n[1] > 0.5 ? 0.04 : 0);
    const c = col.map((v) => Math.min(1, v * sh));
    for (const t of [[0, 1, 2], [0, 2, 3]])
      for (const i of t) {
        const v = vs[i];
        P.push(v[0], v[1], -v[2]);
        C.push(c[0], c[1], c[2]);
      }
  };
  const box = (x0: number, y0: number, z0: number, x1: number, y1: number, z1: number, h: string, flat?: boolean) => {
    const c = hex(h);
    face([[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]], [0, 1, 0], c, flat);
    face([[x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1]], [0, -1, 0], c, flat);
    face([[x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0]], [0, 0, -1], c, flat);
    face([[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]], [0, 0, 1], c, flat);
    face([[x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0]], [-1, 0, 0], c, flat);
    face([[x1, y0, z0], [x1, y0, z1], [x1, y1, z1], [x1, y1, z0]], [1, 0, 0], c, flat);
  };
  const cyl = (cx: number, cz: number, y0: number, y1: number, r: number, h: string, seg = 16) => {
    const c = hex(h);
    for (let i = 0; i < seg; i++) {
      const a0 = (i / seg) * Math.PI * 2, a1 = ((i + 1) / seg) * Math.PI * 2, am = (a0 + a1) / 2;
      const p0 = [cx + Math.cos(a0) * r, cz + Math.sin(a0) * r], p1 = [cx + Math.cos(a1) * r, cz + Math.sin(a1) * r];
      face([[p0[0], y0, p0[1]], [p1[0], y0, p1[1]], [p1[0], y1, p1[1]], [p0[0], y1, p0[1]]], [Math.cos(am), 0, Math.sin(am)], c);
      face([[cx, y1, cz], [p0[0], y1, p0[1]], [p1[0], y1, p1[1]], [cx, y1, cz]], [0, 1, 0], c);
    }
  };
  const H = 2.8, T = 0.12;
  const WALL = "#F0EFEB", GLASS = "#CFDDFF", INK = "#1A1A1F", BLUE = "#548CFF", PAPER = "#FFFFFF", SOFT = "#E4ECFF", WOOD = "#C8B89A", DARKW = "#A8926E", GREEN = "#3E7D5A", RUG = "#E8EEFF";
  type Hole = { a: number; b: number; sill: number; top: number; glass?: 1; door?: 1 };
  // wall with openings along x (horizontal wall at z0..z1)
  const wallX = (x0: number, x1: number, z0: number, z1: number, holes: Hole[]) => {
    let cx = x0;
    holes
      .sort((a, b) => a.a - b.a)
      .forEach((o) => {
        if (o.a > cx) box(cx, 0, z0, o.a, H, z1, WALL);
        if (o.sill > 0) box(o.a, 0, z0, o.b, o.sill, z1, WALL);
        box(o.a, o.top, z0, o.b, H, z1, WALL);
        if (o.glass) {
          box(o.a, o.sill, (z0 + z1) / 2 - 0.01, o.b, o.top, (z0 + z1) / 2 + 0.01, GLASS, true);
          box((o.a + o.b) / 2 - 0.025, o.sill, z0 - 0.01, (o.a + o.b) / 2 + 0.025, o.top, z1 + 0.01, INK);
          box(o.a - 0.03, o.sill - 0.04, z0 - 0.03, o.b + 0.03, o.sill, z1 + 0.03, PAPER);
        }
        if (o.door) {
          box(o.a - 0.05, 0, z0 - 0.02, o.a, o.top + 0.05, z1 + 0.02, INK);
          box(o.b, 0, z0 - 0.02, o.b + 0.05, o.top + 0.05, z1 + 0.02, INK);
          box(o.a - 0.05, o.top, z0 - 0.02, o.b + 0.05, o.top + 0.05, z1 + 0.02, INK);
        }
        cx = o.b;
      });
    if (cx < x1) box(cx, 0, z0, x1, H, z1, WALL);
  };
  const wallZ = (z0: number, z1: number, x0: number, x1: number, holes: Hole[]) => {
    let cz = z0;
    holes
      .sort((a, b) => a.a - b.a)
      .forEach((o) => {
        if (o.a > cz) box(x0, 0, cz, x1, H, o.a, WALL);
        if (o.sill > 0) box(x0, 0, o.a, x1, o.sill, o.b, WALL);
        box(x0, o.top, o.a, x1, H, o.b, WALL);
        if (o.glass) {
          box((x0 + x1) / 2 - 0.01, o.sill, o.a, (x0 + x1) / 2 + 0.01, o.top, o.b, GLASS, true);
          box(x0 - 0.01, o.sill, (o.a + o.b) / 2 - 0.025, x1 + 0.01, o.top, (o.a + o.b) / 2 + 0.025, INK);
          box(x0 - 0.03, o.sill - 0.04, o.a - 0.03, x1 + 0.03, o.sill, o.b + 0.03, PAPER);
        }
        if (o.door) {
          box(x0 - 0.02, 0, o.a - 0.05, x1 + 0.02, o.top + 0.05, o.a, INK);
          box(x0 - 0.02, 0, o.b, x1 + 0.02, o.top + 0.05, o.b + 0.05, INK);
          box(x0 - 0.02, o.top, o.a - 0.05, x1 + 0.02, o.top + 0.05, o.b + 0.05, INK);
        }
        cz = o.b;
      });
    if (cz < z1) box(x0, 0, cz, x1, H, z1, WALL);
  };
  // floor + ceiling
  box(0, -0.02, 0, 7, 0, 8, WOOD, true);
  box(7, -0.02, 3.5, 11, 0, 8, "#CDBFA3", true);
  box(7, -0.02, 0, 11, 0, 3.5, SOFT, true);
  box(-T, H, -T, 11 + T, H + 0.02, 8 + T, "#FBFBFA", true);
  // outer walls
  wallX(-T, 11 + T, -T, 0, [{ a: 0.6, b: 2.4, sill: 0.9, top: 2.2, glass: 1 }, { a: 3, b: 4, sill: 0, top: 2.1, door: 1 }]);
  wallX(-T, 11 + T, 8, 8 + T, [{ a: 2.2, b: 3.8, sill: 1.2, top: 2.2, glass: 1 }]);
  wallZ(0, 8, -T, 0, [{ a: 4.6, b: 7.4, sill: 0.55, top: 2.4, glass: 1 }]);
  wallZ(0, 8, 11, 11 + T, [{ a: 5, b: 7, sill: 0.8, top: 2.3, glass: 1 }]);
  // interior
  wallZ(0, 8, 6.94, 7.06, [{ a: 1, b: 1.9, sill: 0, top: 2.1, door: 1 }, { a: 4.6, b: 5.6, sill: 0, top: 2.1, door: 1 }]);
  box(7.06, 0, 3.44, 11, H, 3.56, WALL);
  box(6.9, 0, 1.02, 6.94, 2.08, 1.88, PAPER);
  box(6.86, 0.98, 1.7, 6.9, 1.04, 1.82, INK);
  // skirting
  box(0, 0, 0, 7, 0.08, 0.02, PAPER);
  box(0, 0, 7.98, 7, 0.08, 8, PAPER);
  box(0, 0, 0, 0.02, 0.08, 8, PAPER);
  // living
  box(1.1, 0, 1.3, 4.2, 0.012, 3.7, RUG, true);
  box(4.4, 0, 1.6, 5.3, 0.42, 3.8, BLUE);
  box(5.08, 0, 1.6, 5.35, 0.88, 3.8, "#3E77F0");
  box(4.4, 0, 1.6, 5.3, 0.62, 1.8, "#3E77F0");
  box(4.4, 0, 3.6, 5.3, 0.62, 3.8, "#3E77F0");
  box(4.75, 0.42, 1.95, 5.0, 0.78, 2.5, PAPER);
  box(4.75, 0.42, 2.9, 5.0, 0.78, 3.45, PAPER);
  box(0, 0, 1.6, 0.45, 0.48, 3.8, PAPER);
  box(0, 0.48, 1.6, 0.45, 0.5, 3.8, INK);
  box(0.04, 0.85, 1.95, 0.09, 1.65, 3.45, INK);
  box(0.09, 0.9, 2.0, 0.1, 1.6, 3.4, "#26262C", true);
  box(2.3, 0.34, 2.2, 3.3, 0.38, 3.2, DARKW);
  for (const [a, b] of [[2.35, 2.25], [3.2, 2.25], [2.35, 3.1], [3.2, 3.1]]) box(a, 0, b, a + 0.05, 0.34, b + 0.05, INK);
  box(0.25, 0, 0.25, 0.6, 0.42, 0.6, INK);
  cyl(0.425, 0.425, 0.42, 1.3, 0.32, GREEN, 9);
  cyl(0.425, 0.425, 1.3, 1.45, 0.2, GREEN, 9);
  cyl(5.9, 4.1, 0, 0.03, 0.18, INK);
  box(5.89, 0.03, 4.09, 5.91, 1.55, 4.11, INK);
  cyl(5.9, 4.1, 1.45, 1.75, 0.22, PAPER);
  box(6.9, 1.25, 2.4, 6.94, 2.05, 3.7, INK);
  box(6.88, 1.32, 2.47, 6.9, 1.98, 3.63, BLUE, true);
  box(6.875, 1.5, 2.6, 6.88, 1.8, 3.1, PAPER, true);
  box(1.0, 2.0, -0.005, 2.0, 2.0, 0.0, PAPER);
  // kitchen + dining
  box(0.6, 0, 7.4, 5.8, 0.86, 8, SOFT);
  box(0.6, 0.86, 7.35, 5.8, 0.91, 8, INK);
  box(0.6, 1.5, 7.65, 2.2, 2.2, 8, PAPER);
  box(3.8, 1.5, 7.65, 5.8, 2.2, 8, PAPER);
  for (let x = 1.4; x < 5.8; x += 0.8) box(x - 0.005, 0.1, 7.39, x + 0.005, 0.8, 7.4, "#B8C8F0");
  box(2.6, 0.87, 7.55, 3.4, 0.92, 7.85, "#D3D3D8");
  box(2.98, 0.91, 7.88, 3.02, 1.2, 7.92, INK);
  box(4.5, 0.91, 7.5, 5.1, 0.95, 7.9, INK);
  box(5.8, 0, 7.3, 6.6, 2.0, 8, "#EDEDEF");
  box(5.82, 1.0, 7.29, 5.86, 1.6, 7.3, INK);
  box(2.4, 0.72, 5.2, 4.4, 0.77, 6.2, DARKW);
  for (const [a, b] of [[2.5, 5.3], [4.25, 5.3], [2.5, 6.05], [4.25, 6.05]]) box(a, 0, b, a + 0.06, 0.72, b + 0.06, INK);
  for (const x of [2.75, 3.4, 4.05]) {
    box(x - 0.22, 0.44, 4.7, x + 0.22, 0.48, 5.12, INK);
    box(x - 0.22, 0.48, 4.7, x + 0.22, 0.95, 4.75, INK);
    box(x - 0.22, 0.44, 6.28, x + 0.22, 0.48, 6.7, INK);
    box(x - 0.22, 0.48, 6.65, x + 0.22, 0.95, 6.7, INK);
  }
  for (const x of [2.9, 3.9]) {
    box(x - 0.005, 1.95, 5.695, x + 0.005, H, 5.705, INK);
    cyl(x, 5.7, 1.75, 1.95, 0.2, BLUE, 14);
  }
  box(0.05, 0, 7.2, 0.5, 0.4, 7.6, INK);
  cyl(0.27, 7.4, 0.4, 1.1, 0.26, GREEN, 9);
  // bedroom
  box(7.6, 0, 4.6, 10.4, 0.012, 6.3, RUG, true);
  box(8.1, 0, 5.8, 9.9, 0.32, 7.95, DARKW);
  box(8.15, 0.32, 5.85, 9.85, 0.52, 7.9, PAPER);
  box(8.12, 0.52, 5.85, 9.88, 0.6, 7.15, BLUE);
  box(8.12, 0.52, 7.0, 9.88, 0.62, 7.15, "#3E77F0");
  box(8.3, 0.52, 7.35, 8.95, 0.7, 7.82, PAPER);
  box(9.05, 0.52, 7.35, 9.7, 0.7, 7.82, PAPER);
  box(7.95, 0, 7.9, 10.05, 1.25, 8, INK);
  box(7.4, 0, 7.45, 7.95, 0.5, 8, PAPER);
  box(10.05, 0, 7.45, 10.6, 0.5, 8, PAPER);
  cyl(7.67, 7.72, 0.5, 0.82, 0.1, BLUE, 12);
  cyl(10.32, 7.72, 0.5, 0.82, 0.1, BLUE, 12);
  box(8.4, 0, 3.56, 10.8, 2.3, 4.16, PAPER);
  box(9.595, 0.1, 4.16, 9.605, 2.2, 4.17, "#D3D3D8");
  box(9.4, 1.0, 4.17, 9.44, 1.4, 4.2, INK);
  box(9.76, 1.0, 4.17, 9.8, 1.4, 4.2, INK);
  box(10.5, 0, 4.4, 10.85, 0.38, 4.75, INK);
  cyl(10.675, 4.575, 0.38, 1.15, 0.26, GREEN, 9);
  box(10.98, 1.3, 4.1, 11, 1.95, 4.75, BLUE, true);
  GEO = { P: new Float32Array(P), C: new Float32Array(C), n: P.length / 3 };
  return GEO;
}

export type TourCamera = { x: number; z: number; yaw: number; yawO: number; pitO: number };

/** returns null without WebGL; `draw` returns each hotspot's CSS position (or null when it should hide) */
export function createTour(cv: HTMLCanvasElement) {
  const gl = cv.getContext("webgl", { antialias: true, alpha: false, preserveDrawingBuffer: false });
  if (!gl) return null;
  const pr = program(gl, "attribute vec3 p;attribute vec3 c;uniform mat4 m;varying vec3 v;void main(){gl_Position=m*vec4(p,1.);v=c;}", "precision mediump float;varying vec3 v;void main(){gl_FragColor=vec4(v,1.);}");
  const g = geometry();
  for (const [data, name] of [[g.P, "p"], [g.C, "c"]] as const) {
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(pr, name);
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 3, gl.FLOAT, false, 0, 0);
  }
  const um = gl.getUniformLocation(pr, "m");
  gl.enable(gl.DEPTH_TEST);
  gl.clearColor(0.788, 0.855, 1, 1);
  let W = 0, H = 0;

  return {
    dispose: () => lose(gl),
    size() {
      const k = dpr();
      W = cv.clientWidth;
      H = cv.clientHeight;
      const w = Math.round(W * k), h = Math.round(H * k);
      if (cv.width !== w || cv.height !== h) {
        cv.width = w;
        cv.height = h;
      }
      gl.viewport(0, 0, w, h);
    },
    draw(cam: TourCamera, hots: readonly { hot: readonly number[] }[], stop: number) {
      if (!W) return [];
      const yaw = ((cam.yaw + cam.yawO) * Math.PI) / 180, pit = ((-9 + cam.pitO) * Math.PI) / 180;
      const eye = [cam.x, 1.6, -cam.z], f = [Math.sin(yaw) * Math.cos(pit), Math.sin(pit), -Math.cos(yaw) * Math.cos(pit)];
      const asp = W / H, fov = ((asp < 1 ? 92 : asp < 1.3 ? 75 : 62) * Math.PI) / 180;
      const m = M4.mul(M4.persp(fov, asp, 0.05, 60), M4.look(eye, [eye[0] + f[0], eye[1] + f[1], eye[2] + f[2]], [0, 1, 0]));
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.uniformMatrix4fv(um, false, new Float32Array(m));
      gl.drawArrays(gl.TRIANGLES, 0, g.n);
      return hots.map((s, i) => {
        const v = [s.hot[0], s.hot[1], -s.hot[2]];
        const cx = m[0] * v[0] + m[4] * v[1] + m[8] * v[2] + m[12], cy = m[1] * v[0] + m[5] * v[1] + m[9] * v[2] + m[13], cw = m[3] * v[0] + m[7] * v[1] + m[11] * v[2] + m[15];
        if (i === stop || cw <= 0.3) return null;
        const sx = ((cx / cw + 1) / 2) * W, sy = ((1 - cy / cw) / 2) * H;
        return sx > 40 && sx < W - 40 && sy > 90 && sy < H - 140 ? [sx, sy] : null;
      });
    },
  };
}
