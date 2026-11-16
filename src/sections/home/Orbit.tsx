"use client";
import Image from "next/image";
import Link from "next/link";
import { type CSSProperties, useEffect, useRef } from "react";
import { SplitText } from "@/components/motion/SplitText";
import { addMeasure, engine } from "@/lib/engine";
import { E, clamp, lerp } from "@/lib/motion";
import { scrollToY } from "@/lib/scroll";
import { useScrollScene } from "@/hooks/useScrollScene";
import { ORBIT } from "@/content/home";

// "Orbit" — who we work with (ANIMATION-SPEC H3, reference v25). Six pills on a tilted ellipse around the Quest,
// fake depth from sin θ, dwell-and-glide with scroll, beam + card swap for the front pill, tap to bring to front.
export function Orbit() {
  const sec = useRef<HTMLElement>(null);
  const S = useRef({ W: 0, H: 0, cx: 0, cy: 0, rx: 0, ry: 0, cw: 0, pw: [] as number[], ph: [] as number[], target: 0, cur: 0, intro: 0, introT: 0, active: -1, raf: 0, armed: false, pinTop: 0, pinLen: 1, swapT: 0, draw: () => {}, kick: () => {} });
  const N = ORBIT.length, STEP = (Math.PI * 2) / N;

  useEffect(() => {
    const st = S.current, root = sec.current!;
    const stage = root.querySelector<HTMLElement>(".orb-stage")!, core = root.querySelector<HTMLElement>(".orb-core")!, disc = root.querySelector<HTMLElement>(".orb-disc")!;
    const ps = [...root.querySelectorAll<HTMLButtonElement>(".orb-p")], rings = [...root.querySelectorAll<SVGEllipseElement>(".orb-ring")];
    const beam = root.querySelector<SVGLineElement>(".orb-beam")!, card = root.querySelector<HTMLElement>(".orb-card")!, cs = root.querySelector<HTMLElement>(".orb-cs")!;
    const C = { t: card.querySelector(".orb-t")!, d: card.querySelector(".orb-d")!, tags: card.querySelector(".orb-tags")!, link: card.querySelector(".orb-link")!, ll: card.querySelector(".orb-link span")! };

    const setActive = (i: number) => {
      if (i === st.active) return;
      const first = st.active < 0;
      st.active = i;
      ps.forEach((p, j) => {
        p.classList.toggle("on", j === i);
        p.setAttribute("aria-pressed", String(j === i));
      });
      cs.style.transform = `translate3d(0,${(-i * 1.1).toFixed(2)}em,0)`;
      const fill = () => {
        const d = ORBIT[i];
        C.t.textContent = d[0];
        C.d.textContent = d[1];
        C.tags.innerHTML = d[2].map((t) => `<li>${t}</li>`).join("");
        C.link.setAttribute("href", d[3]);
        C.ll.textContent = d[4];
      };
      if (first || engine.RM) return fill();
      card.classList.add("swap");
      clearTimeout(st.swapT);
      st.swapT = window.setTimeout(() => {
        fill();
        void card.offsetWidth;
        card.classList.remove("swap");
      }, 190);
      // re-draw the beam towards the new front planet
      beam.style.transition = "none";
      beam.style.setProperty("--bo", "var(--bl)");
      void beam.getBoundingClientRect();
      beam.style.transition = "";
      requestAnimationFrame(() => beam.style.setProperty("--bo", "0"));
    };

    st.draw = () => {
      if (!st.W) return;
      const off = -st.cur * STEP;
      let front = 0, best = -9;
      ps.forEach((p, i) => {
        // each planet bursts out of the headset on entry (staggered), then rides the orbit
        const e = engine.RM ? 1 : E.out(clamp((st.intro - i * 0.07) / 0.6));
        const th = Math.PI / 2 + i * STEP + off, sn = Math.sin(th), d = (sn + 1) / 2;
        const x = st.cx + Math.cos(th) * st.rx * e, y = st.cy + sn * st.ry * e;
        const s = (0.6 + 0.5 * d) * (0.4 + 0.6 * e);
        p.style.transform = `translate3d(${(x - st.pw[i] / 2).toFixed(1)}px,${(y - st.ph[i] / 2).toFixed(1)}px,0) scale(${s.toFixed(3)})`;
        p.style.opacity = (e * (0.3 + 0.7 * d)).toFixed(3);
        p.style.zIndex = d > 0.5 ? "5" : "3";
        if (sn > best) {
          best = sn;
          front = i;
        }
      });
      core.style.transform = `translate3d(${(st.cx - st.cw / 2).toFixed(1)}px,${(st.cy - st.cw / 2 - st.ry * 0.12).toFixed(1)}px,0)`;
      disc.style.setProperty("--ds", (0.86 + 0.14 * st.intro).toFixed(3));
      setActive(front);
      const th = Math.PI / 2 + front * STEP + off, fx = st.cx + Math.cos(th) * st.rx, fy = st.cy + Math.sin(th) * st.ry - st.ph[front] * 0.2;
      beam.setAttribute("x1", st.cx.toFixed(1));
      beam.setAttribute("y1", (st.cy - st.ry * 0.12 + st.cw * 0.18).toFixed(1));
      beam.setAttribute("x2", fx.toFixed(1));
      beam.setAttribute("y2", fy.toFixed(1));
      beam.style.setProperty("--bl", (Math.hypot(fx - st.cx, fy - st.cy - st.ry * 0.12 + st.cw * 0.18) + 2).toFixed(0));
    };
    const measure = () => {
      st.W = stage.clientWidth;
      st.H = stage.clientHeight;
      const narrow = innerWidth < 900;
      st.rx = Math.min(st.W * (narrow ? 0.44 : 0.4), 600);
      st.ry = Math.min(st.rx * (narrow ? 0.56 : 0.3), st.H * 0.36);
      st.cx = st.W * 0.5;
      st.cy = st.H * 0.46;
      st.cw = Math.min(narrow ? st.W * 0.34 : st.W * 0.2, st.H * 0.42, 300);
      core.style.setProperty("--cw", st.cw.toFixed(0) + "px");
      rings.forEach((e) => {
        const k = e.classList.contains("r2") ? 1.22 : 1;
        e.setAttribute("cx", String(st.cx));
        e.setAttribute("cy", String(st.cy));
        e.setAttribute("rx", (st.rx * k).toFixed(1));
        e.setAttribute("ry", (st.ry * k).toFixed(1));
      });
      st.pw = ps.map((p) => p.offsetWidth);
      st.ph = ps.map((p) => p.offsetHeight);
      st.pinTop = root.getBoundingClientRect().top + scrollY;
      st.pinLen = Math.max(1, root.offsetHeight - innerHeight);
      st.draw();
    };
    const loop = (now: number) => {
      st.raf = 0;
      if (st.armed && st.intro < 1) st.intro = Math.min(1, (now - st.introT) / 1300);
      st.cur = lerp(st.cur, st.target, engine.RM ? 1 : 0.12);
      if (Math.abs(st.cur - st.target) < 0.0005) st.cur = st.target;
      st.draw();
      if (st.cur !== st.target || (st.armed && st.intro < 1)) st.raf = requestAnimationFrame(loop);
    };
    st.kick = () => {
      if (!st.raf) st.raf = requestAnimationFrame(loop);
    };
    const offM = addMeasure(measure);
    measure();
    // burst out when the section comes into view
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (e.isIntersecting && !st.armed) {
            st.armed = true;
            st.introT = performance.now();
            st.kick();
          }
        }),
      { rootMargin: "0px 0px -25% 0px" },
    );
    io.observe(stage);
    // tap a planet: the orbit turns it to the front (scroll stays the single source of truth)
    const offs = ps.map((p, i) => {
      const f = () => scrollToY(st.pinTop + (i / (N - 1)) * st.pinLen * 0.999);
      p.addEventListener("click", f);
      return () => p.removeEventListener("click", f);
    });
    return () => {
      offM();
      io.disconnect();
      offs.forEach((o) => o());
      cancelAnimationFrame(st.raf);
      clearTimeout(st.swapT);
    };
  }, [N, STEP]);

  useScrollScene(sec, (p) => {
    // dwell on each audience, then glide to the next
    const u = p * (N - 1), i = Math.floor(u), f = u - i;
    S.current.target = Math.min(N - 1, i + E.inOut(clamp((f - 0.2) / 0.6)));
    S.current.kick();
  });

  const d0 = ORBIT[0];
  return (
    <section ref={sec} data-nav="Who we work with" className="orb relative h-[360vh] max-[900px]:h-[330vh]" aria-label="Who we work with">
      <div className="wrap sticky top-0 grid h-svh grid-rows-[auto_1fr_auto] overflow-hidden pt-[calc(var(--nav-h)+clamp(28px,4vw,56px))] pb-[clamp(20px,3.4vw,44px)]">
        <div className="relative z-6 flex items-end justify-between gap-5">
          <SplitText as="h2" className="d2" text="Who we work with." />
          <p className="m-0 flex flex-none items-baseline gap-2 text-[length:clamp(20px,1.8vw,28px)] font-[620] whitespace-nowrap text-stone tabular-nums [font-stretch:112%]" aria-hidden="true">
            <span className="block h-[1.1em] overflow-hidden leading-[1.1] text-ink">
              <span className="orb-cs block [transition:transform_.6s_var(--e-out)] [&_b]:block [&_b]:h-[1.1em] [&_b]:[font-weight:inherit]">
                {ORBIT.map((_, i) => (
                  <b key={i}>{String(i + 1).padStart(2, "0")}</b>
                ))}
              </span>
            </span>
            <span>/ 06</span>
          </p>
        </div>
        <div className="orb-stage relative min-h-0">
          <svg className="pointer-events-none absolute inset-0 size-full overflow-visible" aria-hidden="true">
            <ellipse className="orb-ring r2 animate-[orbDash_18s_linear_infinite] fill-none stroke-[rgba(5,5,5,.18)] [stroke-dasharray:3_9] [stroke-width:1.2]" />
            <ellipse className="orb-ring r1 fill-none stroke-[rgba(5,5,5,.14)] [stroke-width:1.2]" />
            <line className="orb-beam stroke-blue [stroke-dasharray:var(--bl,400)] [stroke-dashoffset:var(--bo,400)] [stroke-linecap:round] [stroke-width:2] [transition:stroke-dashoffset_.7s_var(--e-out)]" />
          </svg>
          <div className="orb-core pointer-events-none absolute top-0 left-0 z-4 size-[var(--cw,260px)] will-change-transform" aria-hidden="true">
            <span className="orb-disc absolute inset-0 rounded-full bg-blue [transform:scale(var(--ds,1))] [transition:transform_.9s_var(--e-out)]" />
            <span className="absolute inset-0 grid animate-[rhBob_6s_ease-in-out_infinite] place-items-center">
              <Image className="h-auto w-[118%] max-w-none drop-shadow-[0_22px_26px_rgba(5,5,5,.25)]" src="/images/quest3.png" alt="" width={537} height={402} sizes="(max-width: 899px) 40vw, 360px" />
            </span>
          </div>
          {ORBIT.map(([name, , , , , ic], i) => (
            <button
              type="button"
              key={name}
              data-i={i}
              aria-pressed={i === 0}
              className="orb-p group/op absolute top-0 left-0 inline-flex h-[54px] items-center gap-[10px] rounded-full pr-5 pl-[7px] text-[16px] font-semibold whitespace-nowrap text-ink will-change-[transform,opacity] [transition:background-color_.45s,box-shadow_.45s] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-ink motion:opacity-0 max-[900px]:size-12 max-[900px]:justify-center max-[900px]:gap-0 max-[900px]:px-1 [&.on]:bg-blue [&.on]:shadow-[0_18px_40px_-18px_rgba(84,140,255,.9)] [&:not(.on)]:bg-white [&:not(.on)]:shadow-[inset_0_0_0_1px_var(--color-line),0_14px_30px_-18px_rgba(5,5,5,.3)]"
            >
              <span className="grid size-10 flex-none place-items-center rounded-full [transition:background-color_.45s,transform_.6s_var(--e-spring)] group-[.on]/op:bg-white group-[.on]/op:[transform:rotate(-12deg)_scale(1.06)] group-[:not(.on)]/op:bg-card">
                <svg className="size-5" aria-hidden="true">
                  <use href={`#${ic}`} />
                </svg>
              </span>
              <span className="max-[900px]:hidden">{name}</span>
            </button>
          ))}
        </div>
        <div
          className="orb-card relative z-6 grid grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_auto] items-end gap-x-10 gap-y-[14px] border-t border-line pt-[clamp(14px,2vw,24px)] max-[900px]:grid-cols-1 max-[900px]:gap-[10px] [&.swap>*]:opacity-0 [&.swap>*]:[transform:translate3d(0,12px,0)] [&.swap>*]:[transition:opacity_.18s_var(--e-out),transform_.18s_var(--e-out)] [&>*]:[transition:opacity_.3s_var(--e-out)_calc(var(--o,0)*50ms),transform_.5s_var(--e-out)_calc(var(--o,0)*50ms)]"
          aria-live="polite"
        >
          <h3 className="orb-t m-0 text-[length:clamp(26px,2.8vw,44px)] leading-[1.02] font-[650] tracking-[-0.035em] [font-stretch:116%]" style={{ "--o": 0 } as CSSProperties}>
            {d0[0]}
          </h3>
          <p className="orb-d m-0 max-w-[34em] text-[length:clamp(16px,1.25vw,19px)] leading-[1.45] text-stone max-[900px]:text-[15.5px]" style={{ "--o": 1 } as CSSProperties}>
            {d0[1]}
          </p>
          <ul
            className="orb-tags col-start-2 m-0 flex list-none flex-wrap gap-2 p-0 max-[900px]:col-start-1 [@media(max-height:720px)_and_(max-width:899px)]:hidden [&_li]:inline-flex [&_li]:h-[34px] [&_li]:items-center [&_li]:rounded-full [&_li]:bg-card [&_li]:px-[14px] [&_li]:text-[14px] [&_li]:font-[540]"
            style={{ "--o": 2 } as CSSProperties}
          >
            {d0[2].map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
          <Link
            className="orb-link group/ol col-start-3 row-span-2 row-start-1 inline-flex h-[52px] items-center gap-[10px] self-end rounded-full bg-ink px-[22px] text-[15px] font-semibold whitespace-nowrap text-white [transition:background-color_.35s,color_.35s] hover:bg-blue hover:text-ink max-[900px]:col-start-1 max-[900px]:row-auto max-[900px]:h-[46px] max-[900px]:justify-self-start"
            href={d0[3]}
            style={{ "--o": 3 } as CSSProperties}
          >
            <span>{d0[4]}</span>
            <svg viewBox="0 0 24 24" aria-hidden="true" className="size-[18px] fill-none stroke-current [stroke-linecap:round] [stroke-linejoin:round] [stroke-width:1.8] [transition:transform_.4s_var(--e-out)] group-hover/ol:[transform:translateX(4px)]">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
