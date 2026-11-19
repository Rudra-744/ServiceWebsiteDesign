"use client";
import { useEffect, useRef } from "react";
import { addTick } from "@/lib/ticker";

/** one shared frame loop (lib/ticker); fn(now ms, dt ms clamped to 64) */
export function useTicker(fn: (now: number, dt: number) => void, active = true) {
  const ref = useRef(fn);
  useEffect(() => {
    ref.current = fn;
  });
  useEffect(() => {
    if (!active) return;
    return addTick((now, dt) => ref.current(now, dt));
  }, [active]);
}
