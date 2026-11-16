"use client";
import { engine, setEngine } from "./engine";
import { lockScroll } from "./scroll";

// Menu portal open/close (ANIMATION-SPEC G6 step 1). The circle grows from the burger centre to the farthest corner + 24px.
let readyT = 0;

export function setMenu(open: boolean) {
  const menu = document.querySelector<HTMLElement>(".menu");
  const burger = document.querySelector<HTMLElement>(".burger");
  if (!menu || !burger) return;
  if (open) {
    const r = burger.getBoundingClientRect();
    const mx = r.left + r.width / 2, my = r.top + r.height / 2;
    menu.style.setProperty("--mx", mx.toFixed(0) + "px");
    menu.style.setProperty("--my", my.toFixed(0) + "px");
    menu.style.setProperty("--mr", (Math.hypot(Math.max(mx, innerWidth - mx), Math.max(my, innerHeight - my)) + 24).toFixed(0) + "px");
  }
  const b = document.body.classList;
  b.toggle("menu-open", open);
  b.remove("menu-ready");
  clearTimeout(readyT);
  // after the entrance, hover rolls stop using the entry delays
  if (open) readyT = window.setTimeout(() => b.add("menu-ready"), engine.RM ? 0 : 1250);
  burger.setAttribute("aria-expanded", String(open));
  burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  lockScroll(open);
  setEngine({ menuOpen: open });
}

/** close instantly (transitions off for 80 ms), used when a page morph already covers the screen */
export function closeMenuInstant() {
  const mn = document.querySelector<HTMLElement>(".menu");
  if (!mn || !engine.menuOpen) return;
  const all = [mn, ...mn.querySelectorAll<HTMLElement>("*")];
  all.forEach((x) => (x.style.transition = "none"));
  setMenu(false);
  void mn.offsetWidth;
  setTimeout(() => all.forEach((x) => (x.style.transition = "")), 80);
}
