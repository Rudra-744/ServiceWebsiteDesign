"use client";
import type { ScrollTrigger as ST } from "gsap/ScrollTrigger";

// GSAP and ScrollTrigger are fetched together when the first scroll scene comes near, so pages without scenes
// (contact, privacy, terms) never download them. The frame loop is lib/ticker.ts, not gsap.ticker.
let loaded: typeof ST | null = null;
let loading: Promise<typeof ST> | null = null;

export function loadScrollTrigger() {
  loading ??= Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(([{ default: gsap }, { ScrollTrigger }]) => {
    gsap.registerPlugin(ScrollTrigger);
    loaded = ScrollTrigger;
    return ScrollTrigger;
  });
  return loading;
}
/** ScrollTrigger if it has loaded (callers that only refresh/update can skip until then) */
export const scrollTrigger = () => loaded;

export type ScrollTrigger = ST;
