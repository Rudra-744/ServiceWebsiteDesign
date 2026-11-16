"use client";
import Lenis from "lenis";
import { engine, maxY } from "./engine";
import { clamp } from "./motion";

// Smooth wheel scroll (ANIMATION-SPEC G4): mouse only, never with reduced motion. Touch keeps native scrolling.
let lenis: Lenis | null = null;

export function startLenis() {
  if (lenis || !engine.FINE || engine.RM) return lenis;
  lenis = new Lenis({ lerp: 0.105, smoothWheel: true, syncTouch: false, autoRaf: false });
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
    lenis.scrollTo(y, { immediate: instant || engine.RM, force: true });
    return;
  }
  if (instant || engine.RM) window.scrollTo(0, y);
  else window.scrollTo({ top: y, behavior: "smooth" });
}

/** freeze/unfreeze page scrolling (menu, loader) */
export function lockScroll(on: boolean) {
  document.documentElement.style.overflow = on ? "hidden" : "";
  if (lenis) {
    if (on) lenis.stop();
    else lenis.start();
  }
}
