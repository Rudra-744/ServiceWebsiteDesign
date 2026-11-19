"use client";
import { scrollTrigger } from "./gsap";
import { addTick } from "./ticker";
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
  /** scrollY, read once at the start of every frame (before any ticker writes styles: a later read would force a layout) */
  y: 0,
  /** max scroll, cached on load/resize/height change (reading scrollHeight per frame forces a layout) */
  maxY: 0,
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
let collecting: (() => void)[] | null = null;
export function addMeasure(fn: () => void) {
  measures.add(fn);
  collecting?.push(fn);
  return () => void measures.delete(fn);
}
/** run a deferred section setup, then the measures it registered (the page's first measureAll has already happened) */
export function runSetup(setup: () => void | (() => void)) {
  collecting = [];
  let cleanup: void | (() => void);
  try {
    cleanup = setup();
  } finally {
    const added = collecting;
    collecting = null;
    added.forEach((m) => m());
  }
  return cleanup;
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
  scrollTrigger()?.refresh();
}

/** load, font, resize and height-change triggers coalesce into one re-measure (each run forces a full layout) */
let mt = 0;
const scheduleMeasure = () => {
  clearTimeout(mt);
  mt = window.setTimeout(measureAll, 120);
};

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
      if (wChanged || engine.FINE) scheduleMeasure();
    }, 140);
  });
  if (document.fonts?.ready) document.fonts.ready.then(scheduleMeasure);
  addEventListener("load", scheduleMeasure);
  // any late layout shift (font swap, images, lazy sections) moves the sections below it: re-read positions once it settles
  let lastH = 0;
  new ResizeObserver(() => {
    const h = document.documentElement.scrollHeight;
    engine.maxY = Math.max(0, h - innerHeight);
    if (Math.abs(h - lastH) < 1) return;
    lastH = h;
    scheduleMeasure();
  }).observe(document.body);
  // runs first on every frame, so per-frame code reads a cached scroll position instead of forcing layout mid-frame
  engine.y = scrollY;
  addTick(() => {
    engine.y = scrollY;
  }, true);
}

// flags must be known before any component effect reads them
if (typeof window !== "undefined") initEngine();

export const maxY =() => Math.max(0, document.documentElement.scrollHeight - engine.vh);

/** fired on window when a page has arrived (after the loader or a page morph): Home runs its hero intro */
export const INTRO = "cy:intro";
