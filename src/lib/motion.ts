// Easings, helpers and durations from ANIMATION-SPEC.md §0.1 (same formulas as the reference site.js).
export const clamp = (v: number, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const map = (v: number, a: number, b: number) => clamp((v - a) / (b - a));
export const pad = (n: number) => String(n).padStart(2, "0");
/** deterministic pseudo-random 0..1 from an index */
export const rnd = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

export const E = {
  out: (t: number) => 1 - Math.pow(1 - t, 3),
  inOut: (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  expo: (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)),
};

export const EASE = {
  out: "cubic-bezier(.16,1,.3,1)",
  inOut: "cubic-bezier(.76,0,.24,1)",
  spring: "cubic-bezier(.34,1.56,.64,1)",
} as const;

/** px breakpoints used by the reference CSS/JS */
export const BP = { mobile: 820, tablet: 960, desktop: 1100 } as const;

/** tween helper: calls fn(easedK, rawK) every frame for `ms`, resolves when done */
export function tween(ms: number, ease: (t: number) => number, fn: (k: number, raw: number) => void) {
  return new Promise<void>((res) => {
    const t0 = performance.now();
    const st = (now: number) => {
      const k = clamp((now - t0) / ms);
      fn(ease(k), k);
      if (k < 1) requestAnimationFrame(st);
      else res();
    };
    requestAnimationFrame(st);
  });
}

export const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
