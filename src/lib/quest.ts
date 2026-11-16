"use client";
// The Quest 3 photo, pre-scaled into halving copies so 200 small headsets draw sharp and fast (reference `QUEST`).
export const QUEST = { mips: [] as HTMLCanvasElement[], ready: false, ar: 402 / 537, cbs: new Set<() => void>(), started: false };

export function loadQuest() {
  if (QUEST.started || typeof window === "undefined") return;
  QUEST.started = true;
  const im = new Image();
  im.onload = () => {
    QUEST.ar = im.naturalHeight / im.naturalWidth;
    let w = im.naturalWidth;
    let src: CanvasImageSource = im;
    while (w >= 24) {
      const c = document.createElement("canvas");
      c.width = Math.round(w);
      c.height = Math.round(w * QUEST.ar);
      const x = c.getContext("2d")!;
      x.imageSmoothingQuality = "high";
      x.drawImage(src, 0, 0, c.width, c.height);
      QUEST.mips.push(c);
      src = c;
      w /= 2;
    }
    QUEST.ready = true;
    QUEST.cbs.forEach((f) => f());
  };
  im.src = "/images/quest3.png";
}

export function drawQuest(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, alpha: number, dpr: number) {
  const need = w * dpr;
  let m = QUEST.mips[0];
  for (const c of QUEST.mips) if (c.width >= need) m = c;
  const h = w * QUEST.ar;
  ctx.globalAlpha = alpha;
  ctx.drawImage(m, x - w / 2, y - h / 2, w, h);
  ctx.globalAlpha = 1;
}

export function rrect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  r = Math.min(r, w / 2, h / 2);
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
