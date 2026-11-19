"use client";
// One shared requestAnimationFrame loop for every per-frame callback (replaces gsap.ticker, so GSAP is only downloaded
// with ScrollTrigger). fn(now ms, dt ms clamped to 64). `first` callbacks run before the others in each frame.
type Fn = (now: number, dt: number) => void;
const fns: Fn[] = [];
let raf = 0, last = 0;

function loop(now: number) {
  const dt = last ? Math.min(64, now - last) : 16.7;
  last = now;
  for (const f of fns.slice()) f(now, dt);
  raf = fns.length ? requestAnimationFrame(loop) : 0;
  if (!raf) last = 0;
}

export function addTick(fn: Fn, first = false) {
  if (first) fns.unshift(fn);
  else fns.push(fn);
  if (!raf && typeof window !== "undefined") raf = requestAnimationFrame(loop);
  return () => {
    const i = fns.indexOf(fn);
    if (i >= 0) fns.splice(i, 1);
  };
}
