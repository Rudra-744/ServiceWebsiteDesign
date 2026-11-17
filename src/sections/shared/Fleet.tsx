"use client";
import { useEffect, useRef } from "react";
import { addMeasure, engine } from "@/lib/engine";
import { E, clamp, lerp, map, rnd } from "@/lib/motion";
import { QUEST, drawQuest, loadQuest, rrect } from "@/lib/quest";
import { useScrollScene } from "@/hooks/useScrollScene";

// 200+ fleet (ANIMATION-SPEC H4 / R4): one Quest zooms out into a rack of 200 that pop in from the hub,
// a VR HUB console card appears, a ripple connects every headset, counters climb to 200.
// Home: pinned (300vh / 280vh phone). Rental: in view (start .85, end .2).

type Item = { x: number; y: number; d: number; k: number; thr: number; born: number };
const C = { slot: "rgba(5,5,5,.2)", ring: "255,255,255", hubDot: "#548CFF", dotOn: "#050505", dotOff: "rgba(5,5,5,.38)" };
const back = (t: number) => {
  const s = 1.70158, u = t - 1;
  return 1 + (s + 1) * u * u * u + s * u * u;
};

export function Fleet({ variant }: { variant: "pin" | "view" }) {
  const sec = useRef<HTMLElement>(null);
  const F = useRef({ list: [] as Item[], cols: 0, rows: 0, cell: 0, W: 0, H: 0, dpr: 1, hub: { x: 0, y: 0 }, hubW: 0, hubH: 0, maxD: 1, shown: -1, lastP: 0, raf: 0, draw: (p: number) => void p });

  useEffect(() => {
    const st = F.current, root = sec.current!;
    const cv = root.querySelector<HTMLCanvasElement>(".fleet-cv")!, ctx = cv.getContext("2d")!;
    const cnt = root.querySelector(".fleet-count")!, plus = root.querySelector(".plus")!, dep = root.querySelector(".fs-dep")!, con = root.querySelector(".fs-con")!;

    st.draw = (p: number) => {
      st.lastP = p;
      if (!st.list.length) return;
      const N = st.list.length, W = st.W, H = st.H;
      const e = E.inOut(map(p, 0.06, 0.56));
      const rip = map(p, 0.6, 0.86), R = E.inOut(rip) * st.maxD;
      const first = st.list[0];
      const s0 = (W < 600 ? W * 0.66 : Math.min(W, H * 1.6) * 0.52) / (st.cell * 0.78);
      const s = Math.pow(s0, 1 - e);
      const cx = lerp(first.x, W / 2, e), cy = lerp(first.y, H / 2, e);
      const tx = (X: number) => W / 2 + (X - cx) * s, ty = (Y: number) => H / 2 + (Y - cy) * s;
      ctx.setTransform(st.dpr, 0, 0, st.dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      const hw = st.cell * 0.78 * s;
      // empty slots
      const slotA = map(e, 0.25, 0.7);
      if (slotA > 0) {
        ctx.strokeStyle = C.slot;
        ctx.lineWidth = 1;
        ctx.beginPath();
        st.list.forEach((o) => {
          const x = tx(o.x), y = ty(o.y) - hw * 0.06;
          if (x < -hw || x > W + hw || y < -hw || y > H + hw) return;
          const w = hw * 0.9, h = w * 0.6;
          rrect(ctx, x - w / 2, y - h / 2 + w * 0.05, w, h, h * 0.46);
        });
        ctx.globalAlpha = slotA;
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
      // ripple rings from the hub
      if (rip > 0 && rip < 1) {
        for (let k = 0; k < 3; k++) {
          const rr = (R - k * 1.4) * st.cell * s;
          if (rr <= 0) continue;
          ctx.strokeStyle = `rgba(${C.ring},${((1 - k * 0.3) * (1 - rip * 0.6)).toFixed(3)})`;
          ctx.lineWidth = k ? 1 : 1.6;
          ctx.beginPath();
          ctx.arc(tx(st.hub.x), ty(st.hub.y), rr, 0, 6.2832);
          ctx.stroke();
        }
      }
      // headsets: each pops in with a springy scale and a bubble ring when it deploys
      let synced = 0, active = false;
      const now = performance.now(), ghost = lerp(1, 0.62, map(e, 0.04, 0.2));
      for (const o of st.list) {
        const t = o.thr < 0 ? 1 : clamp((e - o.thr) / 0.06);
        if (t <= 0) {
          o.born = 0;
          continue;
        }
        if (!o.born) o.born = now;
        const age = engine.RM ? 9 : (now - o.born) / 560;
        if (age < 1.15) active = true;
        const x = tx(o.x), y = ty(o.y);
        if (x < -hw || x > W + hw || y < -hw || y > H + hw) continue;
        const on = rip > 0 && o.d < R;
        if (on) synced++;
        const fresh = on ? clamp(1 - (R - o.d) / 1.2) : 0;
        const pop = age >= 1 ? 1 : back(clamp(age)), w = hw * pop * (1 + 0.16 * fresh), a = clamp(age * 3);
        if (age < 1) {
          ctx.strokeStyle = `rgba(255,255,255,${((1 - age) * 0.6).toFixed(3)})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(x, y - hw * 0.04, hw * (0.38 + 0.5 * E.out(age)), 0, 6.2832);
          ctx.stroke();
        }
        if (QUEST.ready) {
          drawQuest(ctx, x, y - w * 0.06, w, a * (on ? 1 : ghost), st.dpr);
          if (e > 0.12) {
            const dr = clamp(w * 0.045, 1.6, 5), dy = y - w * 0.06 + (w * QUEST.ar) / 2 + dr * 2.6;
            ctx.globalAlpha = a;
            ctx.beginPath();
            ctx.arc(x, dy, dr, 0, 6.2832);
            if (on) {
              ctx.fillStyle = C.dotOn;
              ctx.fill();
            } else {
              ctx.strokeStyle = C.dotOff;
              ctx.lineWidth = 1.2;
              ctx.stroke();
            }
            ctx.globalAlpha = 1;
          }
        }
      }
      if (rip >= 1) synced = N;
      // VR HUB console card: live count of connected headsets and a sync bar
      const hb = map(p, 0.52, 0.6);
      if (hb > 0) {
        const sc = back(hb), x = tx(st.hub.x), y = ty(st.hub.y), gap = st.cell * 0.16;
        const cw = (st.hubW - gap) * sc, ch = (st.hubH - gap) * sc, rr = Math.min(cw, ch) * 0.16, pad = Math.min(cw, ch) * 0.14;
        const nC = Math.round((synced / N) * 200), x0 = x - cw / 2, y0 = y - ch / 2, fs = Math.max(9, ch * 0.13), fam = "Archivo, Inter, system-ui, sans-serif";
        ctx.save();
        ctx.globalAlpha = clamp(hb * 2.5);
        ctx.fillStyle = "#050505";
        ctx.beginPath();
        rrect(ctx, x0, y0, cw, ch, rr);
        ctx.fill();
        ctx.textBaseline = "middle";
        ctx.textAlign = "left";
        const hy = y0 + pad + fs * 0.5, live = rip > 0 && rip < 1;
        ctx.fillStyle = C.hubDot;
        ctx.beginPath();
        ctx.arc(x0 + pad + fs * 0.32, hy, fs * 0.32, 0, 6.2832);
        ctx.fill();
        if (live) {
          ctx.strokeStyle = "rgba(84,140,255,.55)";
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.arc(x0 + pad + fs * 0.32, hy, fs * (0.6 + 0.35 * ((now / 700) % 1)), 0, 6.2832);
          ctx.stroke();
          active = true;
        }
        ctx.fillStyle = "#FFFFFF";
        ctx.font = `620 ${fs.toFixed(1)}px ${fam}`;
        ctx.fillText("VR HUB", x0 + pad + fs * 0.95, hy + 0.5);
        const stt = live ? "Syncing" : rip >= 1 ? "Live" : "Ready", lw = ctx.measureText("VR HUB").width;
        ctx.font = `520 ${(fs * 0.9).toFixed(1)}px ${fam}`;
        if (x0 + pad + fs * 0.95 + lw + fs * 0.8 + ctx.measureText(stt).width < x0 + cw - pad) {
          ctx.fillStyle = "rgba(255,255,255,.55)";
          ctx.textAlign = "right";
          ctx.fillText(stt, x0 + cw - pad, hy + 0.5);
          ctx.textAlign = "left";
        }
        const big = ch * 0.34, ny = y0 + ch * 0.56;
        ctx.fillStyle = "#FFFFFF";
        ctx.font = `680 ${big.toFixed(1)}px ${fam}`;
        ctx.fillText(String(nC), x0 + pad - big * 0.04, ny);
        const nw = ctx.measureText(String(nC)).width;
        ctx.fillStyle = "rgba(255,255,255,.5)";
        ctx.font = `560 ${(big * 0.42).toFixed(1)}px ${fam}`;
        ctx.fillText("/200", x0 + pad + nw + big * 0.06, ny + big * 0.14);
        const bwid = cw - pad * 2, bhh = Math.max(3, ch * 0.045), by = y0 + ch - pad - bhh;
        ctx.fillStyle = "rgba(255,255,255,.16)";
        ctx.beginPath();
        rrect(ctx, x0 + pad, by, bwid, bhh, bhh / 2);
        ctx.fill();
        if (nC > 0) {
          ctx.fillStyle = C.hubDot;
          ctx.beginPath();
          rrect(ctx, x0 + pad, by, Math.max(bhh, (bwid * nC) / 200), bhh, bhh / 2);
          ctx.fill();
        }
        ctx.restore();
      }
      // a short redraw loop only while a pop or the live pulse is animating
      if (active && !st.raf && !engine.menuOpen) st.raf = requestAnimationFrame(() => ((st.raf = 0), st.draw(st.lastP)));
      const count = Math.max(1, Math.round(clamp(e / 0.97) * 200));
      if (count !== st.shown) {
        st.shown = count;
        cnt.textContent = String(count);
        dep.textContent = String(count);
        plus.classList.toggle("on", count >= 200);
      }
      con.textContent = String(Math.round((synced / N) * 200));
    };

    const layout = () => {
      const W = cv.clientWidth, H = cv.clientHeight;
      if (!W || !H) return;
      st.dpr = Math.min(2, window.devicePixelRatio || 1);
      cv.width = Math.round(W * st.dpr);
      cv.height = Math.round(H * st.dpr);
      st.W = W;
      st.H = H;
      const wide = W / H > 1.25;
      st.cols = wide ? 25 : 10;
      st.rows = wide ? 8 : clamp(Math.round((10 * H) / W), 8, 20);
      st.cell = Math.min(W / st.cols, H / st.rows);
      const ox = (W - st.cols * st.cell) / 2, oy = (H - st.rows * st.cell) / 2;
      const mid = Math.floor((st.rows - 1) / 2), hubC = wide ? [10, 11, 12, 13, 14] : [3, 4, 5, 6], hubR = wide ? [2, 3, 4, 5] : [mid - 1, mid, mid + 1];
      st.hubW = hubC.length * st.cell;
      st.hubH = hubR.length * st.cell;
      st.hub = { x: ox + ((hubC[0] + hubC[hubC.length - 1] + 1) / 2) * st.cell, y: oy + ((hubR[0] + hubR[hubR.length - 1] + 1) / 2) * st.cell };
      st.list = [];
      for (let r = 0; r < st.rows; r++)
        for (let c = 0; c < st.cols; c++) {
          if (hubC.includes(c) && hubR.includes(r)) continue;
          const x = ox + (c + 0.5) * st.cell, y = oy + (r + 0.5) * st.cell;
          const d = Math.hypot((x - st.hub.x) / st.cell, (y - st.hub.y) / st.cell);
          st.list.push({ x, y, d, k: d + rnd(r * 31 + c) * 1.3, thr: 0, born: 0 });
        }
      st.list.sort((a, b) => a.k - b.k);
      st.list.forEach((o, i) => (o.thr = i === 0 ? -1 : Math.pow(i / st.list.length, 0.9) * 0.94));
      st.maxD = Math.max(...st.list.map((o) => o.d)) + 1;
      st.draw(st.lastP);
    };
    loadQuest();
    const ready = () => st.draw(st.lastP);
    QUEST.cbs.add(ready);
    const offM = addMeasure(layout);
    layout();
    return () => {
      offM();
      QUEST.cbs.delete(ready);
      cancelAnimationFrame(st.raf);
    };
  }, []);

  useScrollScene(sec, (p) => F.current.draw(p), variant === "pin" ? { type: "pin" } : { type: "view", start: 0.85, end: 0.2 });

  const stats = (
    <div className="flex flex-wrap gap-x-[22px] gap-y-2 text-[14.5px] font-[540] text-ink max-[960px]:flex-none max-[960px]:gap-x-[18px] max-[960px]:gap-y-[6px] max-[960px]:text-[13.5px] [&_b]:min-w-[2.4em] [&_b]:font-[660] [&_b]:[font-stretch:110%] [&>span]:inline-flex [&>span]:items-center [&>span]:gap-2">
      <span>
        <i className="size-[9px] rounded-full shadow-[inset_0_0_0_1.5px_currentColor]" />
        Deployed <b className="fs-dep tabular-nums">0</b>
      </span>
      <span>
        <i className="size-[9px] rounded-full bg-current" />
        Connected <b className="fs-con tabular-nums">0</b>
      </span>
    </div>
  );
  if (variant === "pin")
    return (
      <section ref={sec} data-nav="200+ headsets" className="fleet wrap relative h-[300vh] max-[960px]:h-[280vh]" aria-label="Our headset fleet">
        <div className="sticky top-0 isolate grid h-svh grid-cols-1 content-center gap-[clamp(18px,3vh,34px)] px-[clamp(24px,4.5vw,72px)] pt-[calc(var(--nav-h)+58px)] pb-[50px] before:absolute before:inset-x-0 before:top-[calc(var(--nav-h)+26px)] before:bottom-[22px] before:-z-1 before:rounded-stage before:bg-blue before:content-[''] max-[960px]:flex max-[960px]:flex-col max-[960px]:justify-start max-[960px]:gap-0 max-[960px]:px-[22px] max-[960px]:pt-[calc(var(--nav-h)+52px)] max-[960px]:pb-[44px]">
          <div className="min-[960px]:flex min-[960px]:items-end min-[960px]:justify-between min-[960px]:gap-[5vw] max-[960px]:block max-[960px]:flex-none">
            <p className="m-0 flex items-start text-[length:clamp(110px,13vw,230px)] leading-[.8] font-bold tracking-[-0.06em] tabular-nums [font-stretch:122%] max-[960px]:text-[length:clamp(64px,20vw,112px)]"><span className="sr-only">200+</span>
              <span className="fleet-count" aria-hidden="true">
                0
              </span>
              <span className="plus inline-block origin-[20%_60%] text-white [transform:scale(0)] [transition:transform_.7s_var(--e-spring)] [&.on]:[transform:none]" aria-hidden="true">
                +
              </span>
            </p>
            <div className="mt-[clamp(14px,2vw,28px)] grid max-w-[30em] gap-[14px] min-[960px]:mt-0 min-[960px]:mb-[.6em] min-[960px]:max-w-[27em] max-[960px]:mt-3 max-[960px]:max-w-none max-[960px]:gap-2">
              <h2 className="d3 max-[960px]:text-[length:clamp(24px,6.8vw,32px)]! max-[960px]:leading-[1.05]!">Headsets, connected and ready.</h2>
              <p className="m-0 max-w-[36em] text-[rgba(5,5,5,.78)] max-[960px]:text-[14px] max-[960px]:leading-[1.45] [@media(max-width:959px)_and_(max-height:800px)]:hidden">
                Deployed, synced and run from one console — enough for a classroom, a conference hall or a full expo floor, with our team on hand to support.
              </p>
            </div>
          </div>
          <div className="grid w-full min-w-0 gap-[14px] max-[960px]:mt-[18px] max-[960px]:flex max-[960px]:min-h-0 max-[960px]:flex-[1_1_0] max-[960px]:flex-col max-[960px]:gap-3">
            <canvas className="fleet-cv block w-full min-[960px]:h-[min(46vh,500px)] max-[960px]:min-h-0 max-[960px]:flex-[1_1_0]" aria-hidden="true" />
            {stats}
          </div>
        </div>
      </section>
    );
  return (
    <section ref={sec} data-nav="200+ headsets" className="sec-tight wrap">
      <div className="grid gap-[clamp(28px,4vw,64px)] min-[960px]:grid-cols-[1fr_1.1fr] min-[960px]:items-center">
        <div>
          <p className="m-0 text-[length:clamp(96px,16vw,280px)] leading-[.8] font-bold tracking-[-0.06em] tabular-nums [font-stretch:122%]"><span className="sr-only">200+</span>
            <span className="fleet-count" aria-hidden="true">
              0
            </span>
            <em className="plus inline-block text-blue not-italic" aria-hidden="true">
              +
            </em>
          </p>
          <h2 className="d3 mt-5">Headsets available for rental.</h2>
          <p className="body-copy mt-3">A reliable partner for small sessions and large-scale events alike.</p>
        </div>
        <div className="grid w-full min-w-0 gap-[14px]">
          <canvas className="fleet-cv block aspect-[20/10.6] w-full rounded-card bg-blue max-[960px]:aspect-[10/12.4]" aria-hidden="true" />
          {stats}
        </div>
      </div>
    </section>
  );
}
