"use client";
// Home hero state shared between the DOM timeline (sections/home/Hero) and the WebGL layers (stage 5:
// particles, 3D Quest). `p` = hero pin progress; `r` = visor box relative to the pin.
export const heroState = {
  p: 0,
  W: 0,
  H: 0,
  r: null as null | { x: number; y: number; w: number; h: number; cx: number; cy: number },
  /** the pin is on screen */
  vis: false,
};
