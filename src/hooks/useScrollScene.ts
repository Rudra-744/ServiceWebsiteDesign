"use client";
import { type RefObject, useEffect, useRef } from "react";
import { type ScrollTrigger, loadScrollTrigger } from "@/lib/gsap";
import { whenNear } from "@/lib/near";

export type SceneOpts = { type?: "pin" | "view"; start?: number; end?: number };

/**
 * Scroll scene (ANIMATION-SPEC §0.3) on ScrollTrigger.
 * - pin:  p = 0 when the section top hits the viewport top, 1 when its bottom hits the viewport bottom
 *         (the section is tall; its child is `position: sticky; height: 100svh`).
 * - view: p = 0 when the element top reaches `start × vh`, 1 when its bottom reaches `end × vh`.
 * fn only runs when p moved more than 0.0003 (or on refresh).
 * The trigger is created once the element is within 1.5 screens of the viewport (first frame for anything already there),
 * so far-away sections cost nothing at load; ScrollTrigger itself is fetched with the first scene that comes near.
 */
export function useScrollScene<T extends HTMLElement>(ref: RefObject<T | null>, fn: (p: number) => void, opts: SceneOpts = {}) {
  const cb = useRef(fn);
  useEffect(() => {
    cb.current = fn;
  });
  const { type = "pin", start = 1, end = 0 } = opts;
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let last = -1, st: ScrollTrigger | null = null, dead = false;
    const run = (p: number, force = false) => {
      if (force || Math.abs(p - last) > 0.0003) {
        last = p;
        cb.current(p);
      }
    };
    const off = whenNear(el, () =>
      loadScrollTrigger().then((ST) => {
        if (dead) return;
        st = ST.create({
          trigger: el,
          start: type === "pin" ? "top top" : `top ${start * 100}%`,
          end: type === "pin" ? "bottom bottom" : `bottom ${end * 100}%`,
          onUpdate: (s) => run(s.progress),
          onRefresh: (s) => run(s.progress, true),
        });
        run(st.progress, true);
      }),
    );
    return () => {
      dead = true;
      off();
      st?.kill();
    };
  }, [ref, type, start, end]);
}
