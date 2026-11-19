"use client";
import { type CSSProperties, useRef } from "react";
import { useNearEffect } from "@/hooks/useNearEffect";
import { SplitText } from "@/components/motion/SplitText";
import { Button } from "@/components/ui/Button";
import { addMeasure, engine } from "@/lib/engine";
import { clamp, lerp, map, rnd } from "@/lib/motion";
import { rrect } from "@/lib/quest";
import { useScrollScene } from "@/hooks/useScrollScene";
import { useTicker } from "@/hooks/useTicker";
import { FIN_CAPS, FIN_CHIPS } from "@/content/home";
import { contactHref, site } from "@/content/site";

// Final CTA (ANIMATION-SPEC H13), pinned 470vh (430vh phone): fly through twelve lens rings (four are the
// steps 01–04) past floating chips into a cornflower portal that opens the CTA.
type Ring = { z: number; step: number; rot: number; dir: number; seg: number };

export function FinalCta() {
  const sec = useRef<HTMLElement>(null);
  const T = useRef({ vis: false, p: 0, cur: -2, px: 0, py: 0, tpx: 0, tpy: 0, open: false, W: 0, H: 0, R: 0, diag: 0, dpr: 1, rings: [] as Ring[], chips: [] as { t: string; z: number; a: number; r: number }[], portalZ: 0, c0: 0, c1: 0 });

  useNearEffect(sec, () => {
    const st = T.current, root = sec.current!, cv = root.querySelector<HTMLCanvasElement>(".tun-cv")!;
    st.rings = [];
    let z = 0, n = 0;
    ["d", "s", "d", "d", "s", "d", "d", "s", "d", "d", "s", "d"].forEach((k, i) => {
      st.rings.push({ z, step: k === "s" ? ++n : 0, rot: rnd(i * 7 + 1) * 6.283, dir: i % 2 ? 1 : -1, seg: 3 + Math.floor(rnd(i * 5 + 3) * 4) });
      z += 0.62;
    });
    st.portalZ = z + 0.15;
    st.chips = FIN_CHIPS.map((t, i) => ({ t, z: 0.9 + (i * (st.portalZ - 1.5)) / 12 + rnd(i) * 0.25, a: rnd(i + 4) * 6.283, r: 0.42 + rnd(i + 9) * 0.38 }));
    st.c0 = st.rings.find((r) => r.step === 1)!.z - 3.3;
    st.c1 = st.portalZ - 0.045;
    const io = new IntersectionObserver((es) => es.forEach((e) => (st.vis = e.isIntersecting)));
    io.observe(root);
    const move = (e: PointerEvent) => {
      st.tpx = e.clientX / innerWidth - 0.5;
      st.tpy = e.clientY / innerHeight - 0.5;
    };
    if (engine.FINE) root.addEventListener("pointermove", move);
    const offM = addMeasure(() => {
      const W = cv.clientWidth, H = cv.clientHeight;
      if (!W || !H) return;
      st.dpr = Math.min(2, window.devicePixelRatio || 1);
      cv.width = Math.round(W * st.dpr);
      cv.height = Math.round(H * st.dpr);
      st.W = W;
      st.H = H;
      st.R = Math.min(W, H) * 0.44;
      st.diag = Math.hypot(W, H) / 2;
    });
    return () => {
      io.disconnect();
      root.removeEventListener("pointermove", move);
      offM();
    };
  });

  useScrollScene(sec, (p) => (T.current.p = p));

  useTicker((now) => {
    const st = T.current, root = sec.current;
    if (!root || !st.vis || !st.W || engine.menuOpen) return;
    const ctx = root.querySelector<HTMLCanvasElement>(".tun-cv")!.getContext("2d")!;
    const { W, H, R, diag } = st, p = st.p, time = engine.RM ? 0 : now;
    st.px = lerp(st.px, st.tpx, 0.06);
    st.py = lerp(st.py, st.tpy, 0.06);
    const cam = lerp(st.c0, st.c1, map(p, 0.03, 0.86));
    const centre = (k: number) => [W / 2 + st.px * W * 0.07 * k, H / 2 + st.py * H * 0.07 * k];
    ctx.setTransform(st.dpr, 0, 0, st.dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    // rings, far to near
    for (let i = st.rings.length - 1; i >= 0; i--) {
      const g = st.rings[i], d = g.z - cam;
      if (d <= 0.03) continue;
      const k = 1 / d, r = R * k;
      const a = map(d, 4.4, 2.6) * (1 - map(r, diag * 0.9, diag * 1.35));
      if (a <= 0.01) continue;
      const [cx, cy] = centre(k);
      const ang = g.rot + g.dir * (time * 0.00009 + cam * 0.9);
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(ang);
      if (g.step) {
        ctx.globalAlpha = a;
        ctx.strokeStyle = "#050505";
        ctx.lineWidth = clamp(1.2 + k * 0.9, 1.2, 4);
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, 6.2832);
        ctx.stroke();
        ctx.lineWidth = clamp(0.8 + k * 0.5, 0.8, 2.4);
        ctx.beginPath();
        for (let t = 0; t < 72; t++) {
          const th = (t / 72) * 6.2832, L = t % 6 === 0 ? r * 0.07 : r * 0.035;
          ctx.moveTo(Math.cos(th) * r, Math.sin(th) * r);
          ctx.lineTo(Math.cos(th) * (r - L), Math.sin(th) * (r - L));
        }
        ctx.stroke();
        ctx.strokeStyle = "#548CFF";
        ctx.lineWidth = clamp(2 + k * 2, 2, 8);
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.arc(0, 0, r * 1.035, -0.5, 0.5);
        ctx.stroke();
        ctx.rotate(-ang);
        ctx.fillStyle = "#050505";
        ctx.font = `650 ${Math.round(clamp(13 * k * 1.4, 11, 70))}px Archivo, Inter, system-ui, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        ctx.fillText("0" + g.step, 0, -r * 1.07);
      } else {
        ctx.globalAlpha = a * 0.5;
        ctx.strokeStyle = "#050505";
        ctx.lineWidth = 1;
        const seg = g.seg, gap = 0.22;
        for (let s = 0; s < seg; s++) {
          const a0 = (s / seg) * 6.2832;
          ctx.beginPath();
          ctx.arc(0, 0, r, a0, a0 + 6.2832 / seg - gap);
          ctx.stroke();
        }
        ctx.globalAlpha = a * 0.35;
        ctx.setLineDash([2, clamp(10 * k, 6, 40)]);
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.9, 0, 6.2832);
        ctx.stroke();
        ctx.setLineDash([]);
      }
      ctx.restore();
    }
    // floating chips
    ctx.textBaseline = "middle";
    ctx.textAlign = "left";
    for (const ch of st.chips) {
      const d = ch.z - cam;
      if (d <= 0.05) continue;
      const k = 1 / d;
      if (k < 0.32 || k > 3.4) continue;
      const a = map(k, 0.32, 0.7) * (1 - map(k, 2.2, 3.4));
      if (a <= 0.01) continue;
      const [cx, cy] = centre(k);
      const x = cx + Math.cos(ch.a) * ch.r * R * k, y = cy + Math.sin(ch.a) * ch.r * R * k * 0.82;
      const fs = clamp(14 * k, 9, 46);
      ctx.font = `560 ${fs.toFixed(1)}px Archivo, Inter, system-ui, sans-serif`;
      const tw = ctx.measureText(ch.t).width, ph = fs * 2.2, pw = tw + fs * 1.9;
      ctx.globalAlpha = a;
      ctx.fillStyle = "#FFFFFF";
      ctx.strokeStyle = "#E2E2E6";
      ctx.lineWidth = 1;
      ctx.beginPath();
      rrect(ctx, x - pw / 2, y - ph / 2, pw, ph, ph / 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#548CFF";
      ctx.beginPath();
      ctx.arc(x - pw / 2 + fs * 0.95, y, fs * 0.22, 0, 6.3);
      ctx.fill();
      ctx.fillStyle = "#050505";
      ctx.fillText(ch.t, x - pw / 2 + fs * 1.4, y + 1);
    }
    ctx.globalAlpha = 1;
    // portal: a blue disc far away that grows with depth until it fills the screen
    const pd = Math.max(0.001, st.portalZ - cam), pk = 1 / pd, pr = R * 0.12 * pk;
    const [pcx, pcy] = centre(Math.min(pk, 3));
    if (pr < diag * 1.6) {
      const pa = map(pk, 0.12, 0.45);
      for (let qq = 0; qq < 4; qq++) {
        const rr = pr * (1.22 + qq * 0.32), dash = clamp(rr * 0.08, 3, 60);
        ctx.save();
        ctx.translate(pcx, pcy);
        ctx.rotate((qq % 2 ? 1 : -1) * (time * 0.00025 + cam * 0.8));
        ctx.strokeStyle = `rgba(84,140,255,${(pa * (0.75 - qq * 0.16)).toFixed(3)})`;
        ctx.lineWidth = qq === 0 ? 2 : 1.2;
        if (qq % 2) ctx.setLineDash([dash, dash * 0.7]);
        ctx.beginPath();
        ctx.arc(0, 0, rr, 0, 6.2832);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
      }
    }
    const portal = root.querySelector<HTMLElement>(".fin-portal")!;
    portal.style.clipPath = pr >= diag * 1.02 ? "none" : `circle(${pr.toFixed(1)}px at ${pcx.toFixed(1)}px ${pcy.toFixed(1)}px)`;
    const open = pr > diag * 0.92;
    if (open !== st.open) {
      st.open = open;
      root.querySelector(".fin-inner")!.classList.toggle("in", open);
      root.querySelector(".fin-title")!.classList.toggle("in", open);
    }
    // centre captions
    let act = -1, best = 9;
    if (st.rings.find((r) => r.step === 1)!.z - cam > 2.15) act = 0;
    else
      st.rings.forEach((g) => {
        if (!g.step) return;
        const d = g.z - cam;
        if (d > 0.3 && d < 2.25 && d < best) {
          best = d;
          act = g.step;
        }
      });
    if (pr > R * 0.55) act = -1;
    if (act !== st.cur) {
      st.cur = act;
      root.querySelectorAll<HTMLElement>(".tun-cap").forEach((c, j) => {
        if (j === act) {
          c.classList.add("notr");
          c.classList.remove("gone");
          void c.offsetWidth;
          c.classList.remove("notr");
          c.classList.add("on");
        } else if (c.classList.contains("on")) {
          c.classList.remove("on");
          c.classList.add("gone");
        }
      });
    }
  });

  return (
    <section data-nav="Get started" className="cv relative h-[470vh] max-[819px]:h-[430vh]" aria-label="How we work and start a project" ref={sec}>
      <div className="sticky top-0 h-svh overflow-hidden bg-paper">
        <canvas className="tun-cv absolute inset-0 block size-full" aria-hidden="true" />
        <ol className="sr-only">
          {FIN_CAPS.slice(1).map(([, t]) => (
            <li key={t}>{t}</li>
          ))}
        </ol>
        <div className="pointer-events-none absolute top-1/2 left-1/2 z-3 h-0 w-[min(88vw,940px)] -translate-x-1/2 text-center" aria-hidden="true">
          {FIN_CAPS.map(([s, t]) => (
            <p
              className="tun-cap group/tc absolute inset-x-0 top-0 m-0 -translate-y-1/2 text-ink [&_.c]:inline-block [&_.c]:[transform:translate3d(0,112%,0)] [&_.c]:[transition:transform_.85s_var(--e-out)_calc(var(--i)*13ms)] [&.gone_.c]:[transform:translate3d(0,-112%,0)] [&.gone_.c]:[transition:transform_.5s_var(--e-out)_calc(var(--i)*5ms)] [&.notr_.c]:transition-none! [&.on_.c]:[transform:none]"
              key={t}
            >
              <small className="mb-4 block text-[14px] font-[560] text-blue-deep opacity-0 [transform:translateY(10px)] [transition:opacity_.4s,transform_.6s_var(--e-out)] group-[.notr]/tc:transition-none! group-[.on]/tc:opacity-100 group-[.on]/tc:[transform:none] group-[.on]/tc:delay-[.12s]">{s}</small>
              <SplitText className="mx-auto block max-w-[13ch] text-[length:clamp(34px,5vw,84px)] leading-[.95] font-[650] tracking-[-0.04em] [font-stretch:118%] max-[819px]:text-[length:clamp(30px,8.8vw,46px)]" text={t} ariaHidden bare />
            </p>
          ))}
        </div>
        <div className="fin-portal absolute inset-0 z-2 grid place-items-center bg-blue px-(--pad) pt-[calc(var(--nav-h)+20px)] pb-8 text-center text-ink [clip-path:circle(0px_at_50%_50%)] will-change-[clip-path]">
          <span className={`${RING} size-[62vmax] -mt-[31vmax] -ml-[31vmax] border-dashed border-white/55 [animation:spin_60s_linear_infinite]`} />
          <span className={`${RING} size-[90vmax] -mt-[45vmax] -ml-[45vmax] border-solid border-white/28 [animation:spin_60s_linear_infinite_reverse]`} />
          <span className={`${RING} size-[124vmax] -mt-[62vmax] -ml-[62vmax] border-dashed border-white/35 [animation:spin_90s_linear_infinite]`} />
          <div className="fin-inner relative grid max-w-[980px] justify-items-center gap-6 max-[819px]:gap-[18px]">
            <p className="tag fade text-[rgba(5,5,5,.66)]!" style={{ "--d": "0s" } as CSSProperties}>
              Your turn
            </p>
            <SplitText as="h2" className="d1 fin-title text-[length:clamp(40px,7.2vw,124px)]! max-[819px]:text-[length:clamp(36px,10.4vw,56px)]!" text="Let's build an immersive experience together." manual />
            <p className="fade m-0 max-w-[30em] text-[length:clamp(17px,1.5vw,22px)] text-[rgba(5,5,5,.78)]" style={{ "--d": ".45s" } as CSSProperties}>
              Headsets for an event, a 360° film, a console for your fleet or a virtual sample house — we&apos;ll help you shape the right mix.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button href={contactHref("Not sure yet")} label="Get a quote" variant="ink" magnetic className="pop" style={{ "--i": 0, "--d": ".55s" } as CSSProperties} />
              <Button href={contactHref("Not sure yet")} label="Discuss your project" variant="line" magnetic className="pop" style={{ "--i": 1, "--d": ".55s" } as CSSProperties} />
              <Button href="/contact" label="Contact us" variant="line" magnetic className="pop" style={{ "--i": 2, "--d": ".55s" } as CSSProperties} />
            </div>
            {site.email && (
              <p className="fade m-0 text-[15px] font-[560] text-[rgba(5,5,5,.72)]" style={{ "--d": ".85s" } as CSSProperties}>
                {site.email}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

const RING = "pointer-events-none absolute top-1/2 left-1/2 rounded-full border-[1.5px] rm:animate-none!";
