"use client";
import type { RefObject } from "react";
import { engine } from "@/lib/engine";
import { map } from "@/lib/motion";
import { useScrollScene } from "./useScrollScene";

/** Sticky stacked cards (reference `stackScene`): the card behind scales 1 − q×0.06 and its shade fades to q×0.16,
 *  q = map(next card top, vh, sticky top + 24). View scene start 1.6, end −0.6. */
export function useStackScene(ref: RefObject<HTMLElement | null>, cardSel: string, shadeSel: string, mobileOnly: boolean) {
  useScrollScene(
    ref,
    () => {
      const cards = [...ref.current!.querySelectorAll<HTMLElement>(cardSel)];
      const active = !mobileOnly || innerWidth < 820;
      cards.forEach((c, i) => {
        const n = cards[i + 1], shade = c.querySelector<HTMLElement>(shadeSel);
        if (!active || !n) {
          c.style.transform = "";
          if (shade) shade.style.opacity = "0";
          return;
        }
        const top = parseFloat(getComputedStyle(c).top) || 0;
        const q = map(n.getBoundingClientRect().top, engine.vh, top + 24);
        c.style.transform = q > 0 ? `scale(${(1 - q * 0.06).toFixed(4)})` : "";
        if (shade) shade.style.opacity = (q * 0.16).toFixed(3);
      });
    },
    { type: "view", start: 1.6, end: -0.6 },
  );
}
