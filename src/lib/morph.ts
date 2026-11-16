"use client";
import { lerp } from "./motion";

// Helpers for "the card becomes the page" (ANIMATION-SPEC G7) and the preloader landing (G1).
export type RGB = number[];
export type Snap = { x: number; y: number; w: number; h: number; r: number; c: RGB; img: string | null };

const rgbOf = (c: string): RGB | null => {
  const m = (c || "").match(/rgba?\(([^)]+)\)/);
  if (!m) return null;
  const v = m[1].split(",").map(Number);
  return v.length > 3 && v[3] < 0.05 ? null : v.slice(0, 3);
};

/** background colour of the first opaque ancestor */
export function bgOf(el: Element): RGB {
  for (let n: Element | null = el; n && n !== document.documentElement; n = n.parentElement) {
    const c = rgbOf(getComputedStyle(n).backgroundColor);
    if (c) return c;
  }
  return [255, 255, 255];
}

/** rect, top-left radius (≤ half height), colour and a covering photo (≥85% of the box, not `contain`) */
export function snap(el: Element | null): Snap | null {
  if (!el) return null;
  const r = el.getBoundingClientRect();
  if (r.width < 2 || r.height < 2) return null;
  const rad = parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0;
  let img = el.matches(".btn, .link, .rfq-link, .next, .nav-now, .logo") ? null : el.querySelector("img");
  if (img) {
    const ir = img.getBoundingClientRect();
    if (ir.width * ir.height < r.width * r.height * 0.85 || getComputedStyle(img).objectFit === "contain") img = null;
  }
  return {
    x: r.left,
    y: r.top,
    w: r.width,
    h: r.height,
    r: Math.min(rad, r.height / 2),
    c: bgOf(el),
    img: img && img.complete && img.naturalWidth ? img.currentSrc || img.src : null,
  };
}

export const onScreen = (q: Snap | null): q is Snap => !!q && q.y < innerHeight && q.y + q.h > 0 && q.x < innerWidth && q.x + q.w > 0;

/** the element that grows when a link is tapped */
export function morphSource(a: Element): Element {
  if (a.closest(".menu")) return document.querySelector(".menu-pv") || a;
  return a.closest(".svc-panel, .next, .band, .rpl-card, .stack-card, .ri-card, .occ-card, .fin-portal, .tilt, .bcell, .orb-card, .hx-card") || a;
}

export const morphTarget = () => document.querySelector<HTMLElement>("#main [data-morph-to]");

export const mix3 = (a: RGB, b: RGB, k: number) => a.map((v, i) => lerp(v, b[i], k));
export const lumOf = (c: RGB) => (0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2]) / 255;

/** child-index path from #main, so a tapped card can be found again after the page re-mounts (back navigation) */
export function pathOf(el: Element): number[] | null {
  const main = document.getElementById("main");
  const out: number[] = [];
  for (let n: Element | null = el; n && n !== main; n = n.parentElement) {
    if (!n.parentElement) return null;
    out.unshift([...n.parentElement.children].indexOf(n));
  }
  return out;
}
export function fromPath(p: number[] | null): Element | null {
  let n: Element | null = document.getElementById("main");
  for (const i of p ?? []) n = n?.children[i] ?? null;
  return p ? n : null;
}
