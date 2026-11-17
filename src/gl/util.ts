// Shared WebGL helpers for the lazily loaded scenes (hero Quest + particles, tiny planet, walkthrough).
// Matrices are column-major Float32-ready arrays, as in the reference.

/** device pixel ratio, capped (2 by default; the planet uses 1.5) */
export const dpr = (cap = 2) => Math.min(cap, window.devicePixelRatio || 1);

type GL = WebGLRenderingContext | WebGL2RenderingContext;
/** free the GPU context now instead of waiting for GC (pages re-mount on navigation; browsers cap live contexts) */
export const lose = (gl: GL) => gl.getExtension("WEBGL_lose_context")?.loseContext();
export function program(gl: GL, vs: string, fs: string) {
  const sh = (t: number, s: string) => {
    const o = gl.createShader(t)!;
    gl.shaderSource(o, s);
    gl.compileShader(o);
    if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(o) || "shader");
    return o;
  };
  const pr = gl.createProgram()!;
  gl.attachShader(pr, sh(gl.VERTEX_SHADER, vs));
  gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(pr);
  if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(pr) || "link");
  gl.useProgram(pr);
  return pr;
}

export type Mat = number[];
export const M4 = {
  persp(f: number, a: number, n: number, fa: number): Mat {
    const t = 1 / Math.tan(f / 2), nf = 1 / (n - fa);
    return [t / a, 0, 0, 0, 0, t, 0, 0, 0, 0, (fa + n) * nf, -1, 0, 0, 2 * fa * n * nf, 0];
  },
  mul(a: Mat, b: Mat): Mat {
    const o = new Array<number>(16);
    for (let c = 0; c < 4; c++)
      for (let r = 0; r < 4; r++) {
        let s = 0;
        for (let k = 0; k < 4; k++) s += a[k * 4 + r] * b[c * 4 + k];
        o[c * 4 + r] = s;
      }
    return o;
  },
  look(e: number[], c: number[], u: number[]): Mat {
    let z = [e[0] - c[0], e[1] - c[1], e[2] - c[2]];
    let l = Math.hypot(...z);
    z = z.map((v) => v / l);
    let x = [u[1] * z[2] - u[2] * z[1], u[2] * z[0] - u[0] * z[2], u[0] * z[1] - u[1] * z[0]];
    l = Math.hypot(...x);
    x = x.map((v) => v / l);
    const y = [z[1] * x[2] - z[2] * x[1], z[2] * x[0] - z[0] * x[2], z[0] * x[1] - z[1] * x[0]];
    return [x[0], y[0], z[0], 0, x[1], y[1], z[1], 0, x[2], y[2], z[2], 0, -(x[0] * e[0] + x[1] * e[1] + x[2] * e[2]), -(y[0] * e[0] + y[1] * e[1] + y[2] * e[2]), -(z[0] * e[0] + z[1] * e[1] + z[2] * e[2]), 1];
  },
  trs: (t: number[], s: number): Mat => [s, 0, 0, 0, 0, s, 0, 0, 0, 0, s, 0, t[0], t[1], t[2], 1],
  tr: (x: number, y: number, z: number): Mat => [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1],
  rotX(a: number): Mat {
    const c = Math.cos(a), s = Math.sin(a);
    return [1, 0, 0, 0, 0, c, s, 0, 0, -s, c, 0, 0, 0, 0, 1];
  },
  rotY(a: number): Mat {
    const c = Math.cos(a), s = Math.sin(a);
    return [c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 0, 0, 1];
  },
  rotZ(a: number): Mat {
    const c = Math.cos(a), s = Math.sin(a);
    return [c, s, 0, 0, -s, c, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
  },
  quat([x, y, z, w]: number[]): Mat {
    return [1 - 2 * (y * y + z * z), 2 * (x * y + z * w), 2 * (x * z - y * w), 0, 2 * (x * y - z * w), 1 - 2 * (x * x + z * z), 2 * (y * z + x * w), 0, 2 * (x * z + y * w), 2 * (y * z - x * w), 1 - 2 * (x * x + y * y), 0, 0, 0, 0, 1];
  },
};
