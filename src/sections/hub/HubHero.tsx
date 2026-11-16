"use client";
import { useEffect, useRef } from "react";
import { SplitText } from "@/components/motion/SplitText";
import { Button } from "@/components/ui/Button";
import { HEADSET_NAMES } from "@/content/home";
import { contactHref } from "@/content/site";
import { engine } from "@/lib/engine";
import { E, map } from "@/lib/motion";
import { scrollToY } from "@/lib/scroll";
import { useTicker } from "@/hooks/useTicker";

// Network hero (ANIMATION-SPEC HB1): hub box at (280, 230), eight nodes on an ellipse (215 × 172), links bowed 20 px.
// 6 s cycle per link, offset i × 0.025: 0–.25 the link draws, .25–.45 a dot travels, .45–.9 the node plays, .9–1 it fades.
// Runs only while visible; off with reduced motion.
const CX = 280, CY = 230;
const NET = (() => {
  let lines = "", pk = "", nodes = "";
  HEADSET_NAMES.forEach((nm, i) => {
    const a = -Math.PI / 2 + (i * Math.PI) / 4, x = CX + Math.cos(a) * 215, y = CY + Math.sin(a) * 172;
    const mx = (CX + x) / 2 + Math.cos(a + Math.PI / 2) * 20, my = (CY + y) / 2 + Math.sin(a + Math.PI / 2) * 20;
    const d = `M${CX} ${CY}Q${mx.toFixed(1)} ${my.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}`;
    lines += `<path class="fill-none stroke-[#dadbe2] [stroke-width:1.5]" d="${d}"/><path class="ln-on fill-none stroke-blue [stroke-width:1.5]" d="${d}"/>`;
    pk += `<circle class="pk fill-blue-deep" r="4.5" cx="${CX}" cy="${CY}" opacity="0"/>`;
    const tx = (x - 38).toFixed(1);
    nodes +=
      `<g class="node group/nd"><rect class="fill-white stroke-[#dadbe2] [stroke-width:1.5] [transition:fill_.4s,stroke_.4s] group-[.on]/nd:fill-blue group-[.on]/nd:stroke-blue" x="${(x - 50).toFixed(1)}" y="${(y - 23).toFixed(1)}" width="100" height="46" rx="12"/>` +
      `<text class="fill-ink [font:600_12px_var(--f)]" x="${tx}" y="${(y - 3).toFixed(1)}">${nm}</text>` +
      `<text class="fill-muted [font:500_10.5px_var(--f)] group-[.on]/nd:fill-ink group-[.on]/nd:opacity-0" x="${tx}" y="${(y + 13).toFixed(1)}">Idle</text>` +
      `<text class="fill-muted opacity-0 [font:500_10.5px_var(--f)] group-[.on]/nd:fill-ink group-[.on]/nd:opacity-100" x="${tx}" y="${(y + 13).toFixed(1)}">Playing</text></g>`;
  });
  const hub = `<g><rect class="fill-ink" x="${CX - 72}" y="${CY - 30}" width="144" height="60" rx="16"/><text class="fill-white [font:700_15px_var(--f)] [font-stretch:112%]" x="${CX}" y="${CY + 5}" text-anchor="middle">VR HUB</text></g>`;
  return `<svg class="h-auto w-full overflow-visible" viewBox="-20 0 600 460">${lines}${pk}${nodes}${hub}</svg>`;
})();

type Link = { l: SVGPathElement; L: number; pk: SVGCircleElement; node: Element; on: boolean };

export function HubHero() {
  const box = useRef<HTMLDivElement>(null);
  const N = useRef({ vis: false, t0: 0, links: [] as Link[] });

  useEffect(() => {
    const n = N.current, root = box.current!;
    const pks = root.querySelectorAll<SVGCircleElement>(".pk"), nds = root.querySelectorAll(".node");
    n.t0 = performance.now();
    n.links = [...root.querySelectorAll<SVGPathElement>(".ln-on")].map((l, i) => {
      const L = l.getTotalLength();
      l.style.strokeDasharray = String(L);
      l.style.strokeDashoffset = String(L);
      return { l, L, pk: pks[i], node: nds[i], on: false };
    });
    const io = new IntersectionObserver((es) => es.forEach((e) => (n.vis = e.isIntersecting)));
    io.observe(root);
    return () => io.disconnect();
  }, []);

  useTicker((now) => {
    const n = N.current;
    if (!n.vis || engine.RM || engine.menuOpen) return;
    const T = (now - n.t0) / 6000;
    n.links.forEach((o, i) => {
      const ph = (((T - i * 0.025) % 1) + 1) % 1;
      o.l.style.strokeDashoffset = (o.L * (1 - E.inOut(map(ph, 0, 0.25)))).toFixed(1);
      o.l.style.opacity = (1 - map(ph, 0.9, 1)).toFixed(3);
      if (ph > 0.25 && ph < 0.45) {
        const pt = o.l.getPointAtLength(o.L * E.inOut(map(ph, 0.25, 0.45)));
        o.pk.setAttribute("cx", pt.x.toFixed(1));
        o.pk.setAttribute("cy", pt.y.toFixed(1));
        o.pk.setAttribute("opacity", "1");
      } else if (o.pk.getAttribute("opacity") !== "0") o.pk.setAttribute("opacity", "0");
      const lit = ph > 0.45 && ph < 0.9;
      if (lit !== o.on) o.node.classList.toggle("on", (o.on = lit));
    });
  });

  const toLive = () => {
    const el = document.querySelector<HTMLElement>("#live");
    if (el) scrollToY(el.getBoundingClientRect().top + scrollY - 20);
  };

  return (
    <section data-nav="VR HUB" className="wrap grid min-h-svh content-center gap-[clamp(28px,4vw,56px)] pt-[calc(var(--nav-h)+clamp(56px,8vw,110px))] pb-12 min-[1000px]:grid-cols-2 min-[1000px]:items-center">
      <div>
        <span className="mb-6 inline-flex h-[34px] items-center gap-2 rounded-full px-[14px] text-[14px] text-stone shadow-[inset_0_0_0_1px_var(--color-line)]">
          <i className="size-[7px] rounded-full bg-ok" />
          Fleet console for Meta Quest and PICO
        </span>
        <SplitText as="h1" className="d1 text-[length:clamp(42px,6.2vw,112px)]" text="Run a room full of VR headsets from one console." />
        <p className="lede fade mt-6" data-reveal="">
          Upload VR video, sync it to groups of headsets, start playback on all of them at once and collect answers to questions asked inside the experience.
        </p>
        <div className="mt-[30px] flex flex-wrap gap-3" data-reveal="">
          <Button href={contactHref("VR HUB")} label="Request access" variant="blue" magnetic className="fade" />
          <Button label="See live control" variant="line" className="fade [--d:.25s]" onClick={toLive} />
        </div>
      </div>
      <div ref={box} data-morph-to="" aria-hidden="true" dangerouslySetInnerHTML={{ __html: NET }} />
    </section>
  );
}
