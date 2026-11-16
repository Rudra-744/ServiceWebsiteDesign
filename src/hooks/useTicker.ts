"use client";
import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

/** one shared frame loop (gsap.ticker); fn(now ms, dt ms clamped to 64) */
export function useTicker(fn: (now: number, dt: number) => void, active = true) {
  const ref = useRef(fn);
  useEffect(() => {
    ref.current = fn;
  });
  useEffect(() => {
    if (!active) return;
    const cb = (_time: number, dt: number) => ref.current(performance.now(), Math.min(64, dt));
    gsap.ticker.add(cb);
    return () => gsap.ticker.remove(cb);
  }, [active]);
}
