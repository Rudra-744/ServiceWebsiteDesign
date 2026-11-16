"use client";
import { ScrollTrigger } from "./gsap";
// Shared client state for the motion engine (reference site.js globals: RM, FINE, vw, vh, menuOpen, PRE.cover, busy).
// One module-level object, so every canvas loop can check "is something covering the page?" without React re-renders.

type Listener = () => void;

export const engine = {
  ready: false,
  RM: false,
  FINE: false,
  vw: 1280,
  vh: 800,
  /** menu portal is open: page canvases and marquees stop drawing */
  menuOpen: false,
  /** loader or page morph covers the screen */
  cover: false,
  /** a page transition is running */
  busy: false,
};

const listeners = new Set<Listener>();
export function onEngine(fn: Listener) {
  listeners.add(fn);
  return () => void listeners.delete(fn);
}
export function setEngine(patch: Partial<typeof engine>) {
  Object.assign(engine, patch);
  listeners.forEach((l) => l());
}

/** layout re-reads (reference `measures[]`): run on load, font load, resize and page change */
const measures = new Set<() => void>();
export function addMeasure(fn: () => void) {
  measures.add(fn);
  return () => void measures.delete(fn);
}
export function measureAll() {
  measures.forEach((m) => {
    try {
      m();
    } catch (err) {
      console.warn(err);
    }
  });
  // measures can change section heights (services track): scroll scenes re-read their positions
  ScrollTrigger.refresh();
}

export function initEngine() {
  if (engine.ready || typeof window === "undefined") return;
  engine.ready = true;
  engine.RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
  engine.FINE = matchMedia("(hover: hover) and (pointer: fine)").matches;
  engine.vw = innerWidth;
  engine.vh = innerHeight;
  let t = 0;
  let lastW = innerWidth;
  addEventListener("resize", () => {
    clearTimeout(t);
    t = window.setTimeout(() => {
      const wChanged = innerWidth !== lastW;
      engine.vw = innerWidth;
      engine.vh = innerHeight;
      lastW = innerWidth;
      // phones fire resize when the URL bar hides; only re-measure when the width changed (or on desktop)
      if (wChanged || engine.FINE) measureAll();
    }, 140);
  });
  if (document.fonts?.ready) document.fonts.ready.then(measureAll);
  addEventListener("load", measureAll);
}

// flags must be known before any component effect reads them
if (typeof window !== "undefined") initEngine();

export const maxY =() => Math.max(0, document.documentElement.scrollHeight - engine.vh);

/** fired on window when a page has arrived (after the loader or a page morph): Home runs its hero intro */
export const INTRO = "cy:intro";
