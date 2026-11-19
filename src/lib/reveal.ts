"use client";
import { E, clamp } from "./motion";
import { engine } from "./engine";

// Reveals (ANIMATION-SPEC G3): add `.in` to [data-split]/[data-reveal] once 15% inside the viewport.
// While a loader or page morph covers the screen, intersecting elements wait in `held` and are
// released top to bottom with a short cascade when the cover lifts.

let io: IntersectionObserver | null = null;
// the <head> script marks html.preloading before paint when the loader will run
let hold = typeof document !== "undefined" && document.documentElement.classList.contains("preloading");
const held = new Set<Element>();

export function countUp(el: HTMLElement, dur = 1200) {
  const to = parseFloat(el.dataset.count || "0");
  const suf = el.dataset.suffix || "";
  if (engine.RM) {
    el.textContent = to + suf;
    return;
  }
  const t0 = performance.now();
  const step = (t: number) => {
    const k = clamp((t - t0) / dur);
    el.textContent = Math.round(E.out(k) * to) + suf;
    if (k < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

export function reveal(el: Element) {
  el.classList.add("in");
  el.querySelectorAll<HTMLElement>("[data-count]").forEach((c) => countUp(c));
  if (el instanceof HTMLElement && el.matches("[data-count]")) countUp(el);
  io?.unobserve(el);
}

function observer() {
  if (io) return io;
  io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) {
          held.delete(e.target);
          return;
        }
        if (hold) {
          held.add(e.target);
          return;
        }
        reveal(e.target);
      });
    },
    { rootMargin: "0px 0px -15% 0px", threshold: 0 },
  );
  return io;
}

export function holdReveals() {
  hold = true;
  held.clear();
}
export const revealsHeld = () => hold;

/** play held reveals that are on screen, top to bottom, `gap` ms apart (max 10 in the cascade) */
export function releaseReveals(gap = 70) {
  hold = false;
  const list = [...held].filter((el) => el.isConnected);
  held.clear();
  const pos = list
    .map((el) => [el, el.getBoundingClientRect()] as const)
    .filter(([, r]) => r.top < innerHeight * 0.85 && r.bottom > 0);
  pos.sort((a, b) => a[1].top - b[1].top || a[1].left - b[1].left);
  pos.forEach(([el], i) => setTimeout(() => reveal(el), engine.RM ? 0 : Math.min(i, 9) * gap));
  list
    .filter((el) => !pos.some(([x]) => x === el))
    .forEach((el) => {
      io?.unobserve(el);
      io?.observe(el);
    });
}

/** arm every reveal element inside `root` (called when a page mounts). Pages re-mount on navigation, so nothing
 *  carries `.in` over; manual elements (hero intro) may already have been revealed by their own effect. */
export function armReveals(root: ParentNode) {
  const o = observer(), html = document.documentElement;
  // first load: html.booted already revealed the first section in CSS; make it permanent with .in and hand back to
  // the observer (later page mounts keep the normal held-reveal cascade). The flag stops a late boot frame re-adding it.
  (window as { __cyArmed?: boolean }).__cyArmed = true;
  if (html.classList.contains("booted")) {
    root.querySelectorAll(".page > :first-child :is([data-split],[data-reveal]):not([data-manual]), .page > :first-child:is([data-split],[data-reveal]):not([data-manual])").forEach(reveal);
    html.classList.remove("booted");
  }
  root.querySelectorAll("[data-split],[data-reveal]").forEach((el) => {
    if (!el.hasAttribute("data-manual") && !el.classList.contains("in")) o.observe(el);
  });
}
