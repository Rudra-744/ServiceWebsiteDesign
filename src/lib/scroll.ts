"use client";
import type Lenis from "lenis";
import { engine, maxY } from "./engine";
import { clamp } from "./motion";

// Smooth wheel scroll (ANIMATION-SPEC G4): mouse only, never with reduced motion. Touch keeps native scrolling.
let lenis: Lenis | null = null;

/** fetched only on mouse devices without reduced motion (touch keeps native scrolling and never downloads it) */
export async function startLenis() {
  if (lenis || !engine.FINE || engine.RM) return lenis;
  const { default: L } = await import("lenis");
  lenis ??= new L({ lerp: 0.105, smoothWheel: true, syncTouch: false, autoRaf: false });
  return lenis;
}
export function stopLenis() {
  lenis?.destroy();
  lenis = null;
}

/** scroll the window to y; `instant` jumps (used on page change and back navigation) */
export function scrollToY(y: number, instant = false) {
  y = clamp(y, 0, maxY());
  if (lenis) {
    // a new page just committed: Lenis still holds the previous page height as its limit, so re-read it first
    lenis.resize();
    lenis.scrollTo(y, { immediate: instant || engine.RM, force: true });
    return;
  }
  if (instant || engine.RM) window.scrollTo(0, y);
  else window.scrollTo({ top: y, behavior: "smooth" });
}

/** ignore wheel smoothing while a page morph runs (the reference drops wheel input when `busy`) */
export function pauseSmooth(on: boolean) {
  if (!lenis) return;
  if (on) lenis.stop();
  else lenis.start();
}

/** freeze/unfreeze page scrolling (menu, loader) */
export function lockScroll(on: boolean) {
  document.documentElement.style.overflow = on ? "hidden" : "";
  if (lenis) {
    if (on) lenis.stop();
    else lenis.start();
  }
}
