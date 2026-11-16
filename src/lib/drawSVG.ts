"use client";
// Draw our own simple SVG strings (rect/path/circle) into a canvas without image URLs (reference `drawSVG`).
export function drawSVG(ctx: CanvasRenderingContext2D, str: string, k: number, ox: number, oy: number) {
  const doc = new DOMParser().parseFromString(str, "image/svg+xml");
  ctx.save();
  ctx.translate(ox, oy);
  ctx.scale(k, k);
  for (const el of doc.documentElement.querySelectorAll("rect,path,circle")) {
    const A = (n: string) => el.getAttribute(n);
    const f = A("fill"), sc = A("stroke");
    let p = new Path2D();
    if (el.tagName === "rect") {
      const x = +(A("x") || 0), y = +(A("y") || 0), w = +A("width")!, h = +A("height")!, rx = +(A("rx") || 0);
      if (rx && p.roundRect) p.roundRect(x, y, w, h, rx);
      else p.rect(x, y, w, h);
    } else if (el.tagName === "circle") p.arc(+A("cx")!, +A("cy")!, +A("r")!, 0, Math.PI * 2);
    else p = new Path2D(A("d")!);
    ctx.globalAlpha = A("opacity") ? +A("opacity")! : 1;
    if (f !== "none") {
      ctx.fillStyle = f || "#000";
      ctx.fill(p);
    }
    if (sc && sc !== "none") {
      ctx.strokeStyle = sc;
      ctx.lineWidth = +(A("stroke-width") || 1);
      ctx.stroke(p);
    }
  }
  ctx.restore();
}
