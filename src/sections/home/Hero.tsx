"use client";
import Image from "next/image";
import { type CSSProperties, useEffect, useRef } from "react";
import { SplitText } from "@/components/motion/SplitText";
import { Button } from "@/components/ui/Button";
import { INTRO, addMeasure, engine } from "@/lib/engine";
import { heroState } from "@/lib/heroState";
import { E, clamp, lerp, map } from "@/lib/motion";
import { charHTML, splitLinesHTML } from "@/lib/split";
import { useScrollScene } from "@/hooks/useScrollScene";
import { useTicker } from "@/hooks/useTicker";
import { HERO_CAPS, HERO_PAIRS, HERO_PROOF } from "@/content/home";
import { contactHref } from "@/content/site";

// Home hero (ANIMATION-SPEC H1 + H1b).
// H1b: occasion tabs; "Without VR" line, then a cornflower band wipes the second line into the Cyphon version,
//      a tag and a connector line to the headset; 7.5 s per occasion; the mouse slides the band.
// H1:  pinned 380vh (340vh phone) timeline: headline/side text leave, the visor dissolves left to right (--f mask),
//      the cornflower lens opens from the headset to the screen, captions per service. Particles + 3D: stage 5.

const P0 = HERO_PAIRS[0];
const pairHTML = (l1: string, l2: string) => splitLinesHTML([{ text: l1, cls: "hl-1" }, { text: l2, cls: "hl-2" }]);
const srText = (q: (typeof HERO_PAIRS)[number]) => `Without VR: ${q.l1.toLowerCase()} ${q.real} With Cyphon: ${q.l1.toLowerCase()} ${q.vr}`;
const ctaHref = (q: (typeof HERO_PAIRS)[number]) => contactHref(q.svc, `We'd like VR for ${q.note}.`);
/** one cycle per occasion (7.5 s): today's line 1.4 s → band wipes 1.1 s → Cyphon's line to 7.2 s → retracts 0.3 s */
const HLC = { real: 1.4, wipe: 1.1, out: 7.2, end: 7.5 };

export function Hero() {
  const sec = useRef<HTMLElement>(null);
  const setRef = useRef<((i: number) => void) | null>(null);
  const pin = useRef<HTMLDivElement>(null);
  const S = useRef({
    cap: -2,
    i: 0,
    mx: 0,
    my: -1e9,
    lastMove: -1e9,
    ct: 0,
    w: 0,
    g: null as null | { fs: number; bl: number; bw: number; bt: number; bb: number; zt: number; zb: number },
    drawn: "",
    hold: null as boolean | null,
    started: false,
    manual: false,
    swapping: false,
    wasScrub: false,
    lk: 0,
    len: 0,
    lastNow: 0,
    probe: null as HTMLSpanElement | null,
  });

  // DOM lookups inside the pin (cached once)
  const q = <T extends Element = HTMLElement>(s: string) => pin.current!.querySelector<T>(s)!;

  useEffect(() => {
    const st = S.current, root = pin.current!;
    const title = q(".hero-title"), realEl = q(".hl-real"), vrEl = q(".hl-vr"), tabsEl = q(".hl-tabs"), lede = q(".hl-lede span");
    const cta = q<HTMLAnchorElement>(".hl-cta"), more = q<HTMLAnchorElement>(".hl-more"), sr = q("[data-hl-sr]"), tag = q(".hl-tag");
    const tabs = [...root.querySelectorAll<HTMLButtonElement>(".hl-tab")];
    const visor = q(".visor");

    // one font size fitting the longest line of every pair (≤16.5% of the height, 64px on phones)
    const hlGeo = () => {
      const fs = parseFloat(getComputedStyle(title).fontSize);
      const r2 = realEl.querySelector<HTMLElement>(".hl-2")!, v2 = vrEl.querySelector<HTMLElement>(".hl-2")!;
      const L = (el: HTMLElement) => title.offsetLeft + el.offsetLeft, R = (el: HTMLElement) => L(el) + el.offsetWidth;
      const top = title.offsetTop + r2.offsetTop;
      const bl = Math.min(L(r2), L(v2)) - fs * 0.14, br = Math.max(R(r2), R(v2)) + fs * 0.16;
      st.g = { fs, bl, bw: br - bl, bt: top - fs * 0.03, bb: top + fs * 1.06, zt: title.offsetTop - fs * 0.3, zb: top + fs * 1.4 };
      st.drawn = "";
    };
    const measure = () => {
      const W = root.clientWidth, H = root.clientHeight, pad = parseFloat(getComputedStyle(title).left) || 20;
      if (!st.probe) {
        st.probe = document.createElement("span");
        st.probe.className = "d1";
        st.probe.setAttribute("aria-hidden", "true");
        Object.assign(st.probe.style, { position: "absolute", left: "-9999px", top: "0", fontSize: "100px", whiteSpace: "nowrap", visibility: "hidden" });
        document.body.appendChild(st.probe);
      }
      let mw = 0;
      HERO_PAIRS.forEach((p) =>
        [p.l1, p.real, p.vr].forEach((t) => {
          st.probe!.textContent = t;
          mw = Math.max(mw, st.probe!.getBoundingClientRect().width);
        }),
      );
      const fs = Math.min(((W - 2 * pad) / mw) * 100 * 0.97, H * 0.165, W < 820 ? 64 : 300);
      root.style.setProperty("--hl-fs", fs.toFixed(1) + "px");
      // visor box for the lens, the connector and the WebGL layers
      const vr = visor.getBoundingClientRect(), pr = root.getBoundingClientRect();
      heroState.W = W;
      heroState.H = H;
      const r = { x: vr.left - pr.left, y: vr.top - pr.top, w: vr.width, h: vr.height };
      heroState.r = { ...r, cx: r.x + r.w / 2, cy: r.y + r.h / 2 };
      hlGeo();
    };
    const offM = addMeasure(measure);
    measure();

    const hlSet = (i: number) => {
      if (i === st.i) return;
      const p = HERO_PAIRS[i];
      st.i = i;
      if (!tabsEl.classList.contains("auto")) st.manual = true;
      tabs.forEach((b, k) => {
        b.classList.toggle("on", k === i);
        b.setAttribute("aria-selected", String(k === i));
        b.tabIndex = k === i ? 0 : -1;
        b.style.setProperty("--pg", "0");
      });
      sr.textContent = srText(p);
      st.swapping = true;
      [realEl, vrEl].forEach((el) => el.classList.add("out"));
      lede.classList.add("swap");
      setTimeout(
        () => {
          (
            [
              [realEl, p.real],
              [vrEl, p.vr],
            ] as const
          ).forEach(([el, l2]) => {
            el.innerHTML = pairHTML(p.l1, l2);
            el.classList.remove("out", "in");
            el.classList.add("quick");
            void el.offsetWidth;
            el.classList.add("in");
          });
          lede.textContent = p.lede;
          lede.classList.remove("swap");
          cta.querySelector(".lbl")!.innerHTML = charHTML(p.cta);
          cta.setAttribute("aria-label", p.cta);
          cta.setAttribute("href", ctaHref(p));
          more.setAttribute("href", p.more[0]);
          more.querySelector(".lbl")!.innerHTML = charHTML(p.more[1]);
          more.setAttribute("aria-label", p.more[1]);
          hlGeo();
          st.ct = 0;
          st.w = 0;
          st.swapping = false;
        },
        engine.RM ? 0 : 300,
      );
    };
    setRef.current = hlSet;
    const tabClick = (i: number) => () => {
      tabsEl.classList.remove("auto");
      hlSet(i);
    };
    const tabOffs = tabs.map((b, i) => {
      const f = tabClick(i);
      b.addEventListener("click", f);
      return () => b.removeEventListener("click", f);
    });
    const keys = (e: KeyboardEvent) => {
      const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
      if (!d) return;
      const n = (st.i + d + HERO_PAIRS.length) % HERO_PAIRS.length;
      tabsEl.classList.remove("auto");
      hlSet(n);
      tabs[n].focus();
    };
    tabsEl.addEventListener("keydown", keys);
    // the mouse slides the band (on the headline); a tap on the headline does it on touch screens
    const pt = (e: PointerEvent) => {
      const r = root.getBoundingClientRect();
      st.mx = e.clientX - r.left;
      st.my = e.clientY - r.top;
      st.lastMove = performance.now();
      tag.classList.add("used");
    };
    const move = (e: PointerEvent) => {
      if (e.pointerType === "mouse" && heroState.p < 0.02) pt(e);
    };
    const down = (e: PointerEvent) => {
      if (e.pointerType === "mouse" || !st.g || heroState.p > 0.02) return;
      const y = e.clientY - root.getBoundingClientRect().top;
      if (y > st.g.zt && y < st.g.zb) pt(e);
    };
    root.addEventListener("pointermove", move);
    root.addEventListener("pointerdown", down);

    // intro: after the loader / page morph, or straight away when neither covers the page
    const intro = () => {
      root.querySelectorAll(".hero-title, .hero-side, .hero-hint, .hl-real, .hl-vr, .hl-tabs").forEach((el) => el.classList.add("in"));
      hlGeo();
      st.started = true;
      st.ct = 0;
      st.w = 0;
      if (!st.manual) tabsEl.classList.add("auto");
    };
    addEventListener(INTRO, intro);
    if (!document.documentElement.classList.contains("preloading") && !engine.busy) intro();

    const vis = new IntersectionObserver((es) => es.forEach((e) => (heroState.vis = e.isIntersecting)));
    vis.observe(sec.current!);
    return () => {
      offM();
      tabOffs.forEach((o) => o());
      tabsEl.removeEventListener("keydown", keys);
      root.removeEventListener("pointermove", move);
      root.removeEventListener("pointerdown", down);
      removeEventListener(INTRO, intro);
      vis.disconnect();
      st.probe?.remove();
      st.probe = null;
      heroState.vis = false;
    };
  }, []);

  // H1 scroll timeline (DOM part of heroFn)
  useScrollScene(sec, (p) => {
    heroState.p = p;
    const r = heroState.r, W = heroState.W, H = heroState.H, root = pin.current;
    if (!r || !root) return;
    const e = E.inOut(map(p, 0.14, 0.36));
    const cx = lerp(r.cx, W / 2, e), cy = lerp(r.cy, H / 2, e), rad = lerp(0, Math.hypot(W, H) / 2 + 30, e);
    q(".fov").style.clipPath = `circle(${rad.toFixed(1)}px at ${cx.toFixed(1)}px ${cy.toFixed(1)}px)`;
    const mt = map(p, 0.05, 0.34), visor = q(".visor");
    visor.style.setProperty("--f", (((mt - 0.03) / 0.42) * 100).toFixed(2) + "%");
    visor.style.visibility = mt > 0.99 ? "hidden" : "";
    visor.classList.toggle("idle", p < 0.004);
    // headline + band leave as one layer, so today's line never shows through the band
    const wrap = q(".hl-wrap");
    wrap.style.transform = `translate3d(0,${(-e * H * 0.22).toFixed(1)}px,0)`;
    wrap.style.opacity = (1 - map(p, 0.02, 0.2)).toFixed(3);
    const side = q(".hero-side");
    side.style.opacity = (1 - map(p, 0, 0.12)).toFixed(3);
    side.style.transform = `translate3d(0,${(-p * 140).toFixed(1)}px,0)`;
    q(".hero-hint").style.opacity = (1 - map(p, 0, 0.05)).toFixed(3);
    const tabs = q(".hl-tabs");
    tabs.style.opacity = (1 - map(p, 0, 0.1)).toFixed(3);
    tabs.style.transform = `translate3d(0,${(-p * 100).toFixed(1)}px,0)`;
    tabs.style.visibility = p > 0.12 ? "hidden" : "";
    // captions
    const i = p < 0.37 ? -1 : p < 0.47 ? 0 : p < 0.51 ? -1 : p < 0.62 ? 1 : p < 0.65 ? -1 : p < 0.74 ? 2 : p < 0.77 ? -1 : p < 0.86 ? 3 : p < 0.885 ? -1 : 4;
    const st = S.current;
    if (i !== st.cap) {
      st.cap = i;
      root.querySelectorAll(".fov-cap").forEach((c, j) => {
        if (j === i) {
          c.classList.add("notr");
          c.classList.remove("gone");
          void (c as HTMLElement).offsetWidth;
          c.classList.remove("notr");
          c.classList.add("on");
        } else if (c.classList.contains("on")) {
          c.classList.remove("on");
          c.classList.add("gone");
        }
      });
    }
  });

  // H1b band, tag and connector (hlFrame)
  useTicker((now) => {
    const st = S.current, root = pin.current;
    if (!root || !st.g) return;
    const dt = Math.min(250, now - (st.lastNow || now));
    st.lastNow = now; // real time, so the cycle keeps its pace on slow frames
    const vis = !engine.cover && !engine.menuOpen && heroState.p < 0.22 && heroState.vis;
    const scrub = now - st.lastMove < 2600 && st.my > st.g.zt && st.my < st.g.zb;
    const hold = !vis || scrub;
    if (st.hold !== hold) {
      st.hold = hold;
      root.classList.toggle("hl-hold", hold);
    }
    if (!vis || !st.started) return;
    const g = st.g, tabsEl = q(".hl-tabs"), auto = tabsEl.classList.contains("auto");
    let target: number;
    if (scrub) target = clamp((st.mx - g.bl) / g.bw);
    else {
      if (st.wasScrub) {
        st.wasScrub = false;
        st.ct = Math.max(st.ct, HLC.real + HLC.wipe * st.w);
      }
      if (!st.swapping) st.ct += dt / 1000;
      const c = st.ct;
      if (c < HLC.real) target = 0;
      else if (c < HLC.real + HLC.wipe) target = engine.RM ? 1 : E.inOut((c - HLC.real) / HLC.wipe);
      else if (!auto || c < HLC.out) target = 1;
      else target = engine.RM ? 0 : 1 - clamp((c - HLC.out) / (HLC.end - HLC.out));
      if (auto && c >= HLC.end && !st.swapping) setRef.current?.((st.i + 1) % HERO_PAIRS.length);
      root.querySelectorAll<HTMLElement>(".hl-tab")[st.i].style.setProperty("--pg", auto ? clamp(c / HLC.end).toFixed(4) : "0");
      st.w = target;
    }
    if (scrub) {
      st.wasScrub = true;
      st.w += (target - st.w) * (1 - Math.pow(1 - 0.2, dt / 16.67));
    }
    // the connector to the headset draws once the band is complete
    st.lk += ((st.w > 0.995 ? 1 : 0) - st.lk) * (engine.RM ? 1 : 1 - Math.pow(1 - 0.07, dt / 16.67));
    const w = st.w, key = `${w.toFixed(4)},${g.bl.toFixed(1)},${g.bw.toFixed(1)},${st.lk.toFixed(3)}`;
    if (key === st.drawn) return;
    st.drawn = key;
    const lens = q(".hl-lens"), tag = q(".hl-tag"), rim = q<SVGPathElement>(".hl-rim path"), dot = q<SVGCircleElement>(".hl-d2");
    const wp = g.bw * w, W = root.clientWidth, H = root.clientHeight;
    if (wp < 1) {
      lens.style.clipPath = "inset(50% 50% 50% 50%)";
      tag.style.setProperty("--to", "0");
      rim.style.strokeDashoffset = String(st.len || 9999);
      dot.style.opacity = "0";
      return;
    }
    const rad = Math.min((g.bb - g.bt) / 2, wp / 2);
    lens.style.clipPath = `inset(${g.bt.toFixed(1)}px ${(W - g.bl - wp).toFixed(1)}px ${(H - g.bb).toFixed(1)}px ${g.bl.toFixed(1)}px round ${rad.toFixed(1)}px)`;
    tag.style.setProperty("--tx", (g.bl + wp).toFixed(1) + "px");
    tag.style.setProperty("--ty", (g.bb + 14).toFixed(1) + "px");
    tag.style.setProperty("--to", clamp((w - 0.3) / 0.3).toFixed(3));
    q(".hl-grid").style.setProperty("--gx", (-wp * 0.04).toFixed(1) + "px");
    const vr = heroState.r;
    if (vr && st.lk > 0.005) {
      const tw = tag.offsetWidth, sx = g.bl + wp + 10, sy = g.bb + 28, ex = vr.x + vr.w * 0.1, ey = vr.y + vr.h * 0.58;
      const below = ex < sx + 40; // phones: the headset sits under the line, so the curve drops down
      const d = below
        ? `M${(sx - tw / 2).toFixed(1)} ${(sy + 16).toFixed(1)}C${(sx - tw / 2).toFixed(1)} ${(sy + (ey - sy) * 0.6).toFixed(1)} ${ex.toFixed(1)} ${(ey - (ey - sy) * 0.5).toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}`
        : `M${sx.toFixed(1)} ${sy.toFixed(1)}C${(sx + (ex - sx) * 0.55).toFixed(1)} ${sy.toFixed(1)} ${(ex - (ex - sx) * 0.35).toFixed(1)} ${ey.toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}`;
      if (rim.getAttribute("d") !== d) {
        rim.setAttribute("d", d);
        st.len = rim.getTotalLength();
        rim.style.strokeDasharray = String(st.len);
      }
      rim.style.strokeDashoffset = (st.len * (1 - st.lk)).toFixed(1);
      dot.setAttribute("cx", ex.toFixed(1));
      dot.setAttribute("cy", ey.toFixed(1));
      dot.style.opacity = clamp((st.lk - 0.85) / 0.15).toFixed(3);
    } else {
      rim.style.strokeDashoffset = String(st.len || 9999);
      dot.style.opacity = "0";
    }
  });

  return (
    <section ref={sec} data-nav="Intro" className="hero relative h-[380vh] max-[820px]:h-[340vh]" aria-label="Introduction">
      <div
        ref={pin}
        className="hero-pin sticky top-0 h-svh overflow-hidden [--hl-fs:clamp(44px,7.4vw,134px)] [--hl-top:calc(var(--nav-h)+clamp(18px,3.4vh,44px)+clamp(38px,2.3vw,46px)+52px+clamp(10px,1.6vh,22px))] max-[820px]:[--hl-fs:clamp(40px,11.4vw,64px)] max-[820px]:[--hl-top:calc(var(--nav-h)+104px)]"
      >
        <div className="hl-wrap pointer-events-none absolute inset-0 will-change-[opacity,transform]">
          <h1 className={`hero-title ${HL_POS} will-change-[transform,opacity]`}>
            <span className="hl-was fade absolute bottom-[calc(100%+clamp(10px,1.6vh,22px))] left-0 inline-flex h-7 items-center rounded-full px-3 text-[13px] leading-none font-semibold tracking-normal whitespace-nowrap text-muted shadow-[inset_0_0_0_1.5px_var(--color-line)] [font-stretch:100%] max-[820px]:h-6 max-[820px]:px-[10px] max-[820px]:text-[12px]" aria-hidden="true">
              Without VR
            </span>
            <span className="sr-only" data-hl-sr="">
              {srText(P0)}
            </span>
            <span className={`hl-real ${HL_LINES}`} aria-hidden="true" data-split="" data-manual="" dangerouslySetInnerHTML={{ __html: pairHTML(P0.l1, P0.real) }} />
          </h1>
          <div className="hl-fx pointer-events-none absolute inset-0 will-change-[transform,opacity]" aria-hidden="true">
            <div className="hl-lens absolute inset-0 overflow-hidden bg-blue [clip-path:circle(0px_at_50%_50%)]">
              <i className="hl-grid absolute -inset-20 bg-[radial-gradient(rgba(5,5,5,.18)_1.2px,transparent_1.5px)] bg-size-[24px_24px] [transform:translate3d(var(--gx,0px),var(--gy,0px),0)]" />
              <div className={`hl-vr ${HL_POS} text-ink ${HL_LINES}`} data-split="" data-manual="" dangerouslySetInnerHTML={{ __html: pairHTML(P0.l1, P0.vr) }} />
            </div>
            <svg className="hl-rim absolute top-0 left-0 size-full overflow-visible">
              <path className="fill-none stroke-[rgba(5,5,5,.38)] [stroke-linecap:round] [stroke-width:1.5]" />
              <circle className="hl-d2 fill-blue stroke-white opacity-0 [stroke-width:3]" r="6" />
            </svg>
            <span className="hl-tag group/tag absolute top-0 left-0 flex flex-row-reverse items-center gap-[10px] whitespace-nowrap opacity-[var(--to,0)] [transform:translate3d(var(--tx,-9999px),var(--ty,0px),0)_translateX(-100%)] max-[820px]:gap-2">
              <b className="inline-flex h-7 items-center rounded-full bg-ink px-3 text-[13px] font-[620] text-white max-[820px]:h-6 max-[820px]:px-[10px] max-[820px]:text-[12px]">With Cyphon</b>
              <small className="text-[13px] text-muted transition-opacity duration-400 group-[.used]/tag:opacity-0 max-[820px]:hidden">Slide along the line</small>
            </span>
          </div>
        </div>
        <div
          className="hl-tabs fade absolute top-[calc(var(--nav-h)+clamp(18px,3.4vh,44px))] right-(--pad) left-(--pad) z-3 flex flex-wrap items-center gap-2 will-change-[opacity,transform] max-[820px]:top-[calc(var(--nav-h)+16px)] max-[820px]:mr-[calc(var(--pad)*-1)] max-[820px]:flex-nowrap max-[820px]:overflow-x-auto max-[820px]:pr-(--pad) max-[820px]:[scrollbar-width:none] max-[820px]:[&::-webkit-scrollbar]:hidden"
          role="tablist"
          aria-label="Choose your occasion"
          data-manual=""
        >
          <span className="mr-1 text-[length:clamp(14px,.85vw,16px)] text-muted max-[820px]:hidden">For</span>
          {HERO_PAIRS.map((p, i) => (
            <button
              type="button"
              key={p.tab}
              className={`hl-tab relative h-[clamp(38px,2.3vw,46px)] cursor-pointer overflow-hidden rounded-full border-0 px-[clamp(15px,1vw,20px)] text-[length:clamp(14px,.88vw,17px)] font-[580] whitespace-nowrap [transition:background-color_.3s,color_.3s] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue max-[820px]:h-9 max-[820px]:flex-none max-[820px]:px-[14px] max-[820px]:text-[14px] [&:not(.on)]:bg-card [&:not(.on)]:text-ink hover:[&:not(.on)]:bg-[#e8e8ec] [&.on]:bg-ink [&.on]:text-white ${i === 0 ? "on" : ""}`}
              role="tab"
              aria-selected={i === 0}
              tabIndex={i === 0 ? 0 : -1}
            >
              {p.tab}
              <i className="absolute inset-x-0 bottom-0 h-[3px] origin-left bg-blue [transform:scaleX(var(--pg,0))]" />
            </button>
          ))}
        </div>
        <div className="hero-side absolute bottom-[clamp(28px,7vh,80px)] left-(--pad) z-3 max-w-[390px] will-change-[opacity,transform] min-[820px]:max-w-[clamp(440px,34vw,640px)] max-[820px]:right-(--pad) max-[820px]:bottom-6 max-[820px]:max-w-none" data-manual="">
          <p className="hl-lede fade mb-6 max-w-[34em] text-[18px] leading-[1.45] text-stone min-[1100px]:text-[length:clamp(18px,1.12vw,24px)] max-[820px]:mb-[18px] max-[820px]:text-[16.5px] [@media(max-width:819px)_and_(max-height:700px)]:hidden">
            <span className="inline-block [transition:opacity_.25s,transform_.45s_var(--e-out)] [&.swap]:opacity-0 [&.swap]:[transform:translateY(8px)]">{P0.lede}</span>
          </p>
          <div className="btns fade flex flex-wrap gap-3" style={{ "--d": ".3s" } as CSSProperties}>
            <Button href={ctaHref(P0)} label={P0.cta} variant="blue" magnetic className={`hl-cta ${HERO_BTN}`} />
            <Button href={P0.more[0]} label={P0.more[1]} variant="line" className={`hl-more ${HERO_BTN} max-[820px]:hidden`} />
          </div>
          <p
            className="hl-proof fade mt-[18px] text-[length:clamp(13px,.8vw,15px)] text-muted [@media(max-width:819px)_and_(max-height:779.98px)]:hidden [@media(max-width:819px)_and_(min-height:780px)]:mt-3 [@media(max-width:819px)_and_(min-height:780px)]:text-[12.5px]"
            style={{ "--d": ".45s" } as CSSProperties}
          >
            {HERO_PROOF}
          </p>
        </div>
        <div className="hero-hint fade absolute top-[calc(var(--nav-h)+40px)] right-(--pad) flex items-center gap-[10px] text-[14px] text-muted max-[820px]:hidden" data-manual="">
          <i className="relative h-[34px] w-[1.5px] overflow-hidden bg-line after:absolute after:inset-x-0 after:top-0 after:h-[40%] after:animate-[hint_1.8s_var(--e-io)_infinite] after:bg-ink after:content-['']" />
          Scroll to put it on
        </div>

        <div className="fov absolute inset-0 overflow-hidden bg-blue text-ink will-change-[clip-path] [clip-path:circle(0px_at_50%_50%)]" aria-hidden="true" />
        <div
          className="visor group/visor pointer-events-none absolute right-(--pad) bottom-[clamp(36px,9vh,110px)] w-[min(40vw,580px)] [--f:-20%] will-change-[transform,opacity] min-[1100px]:w-[min(32vw,52vh)] max-[820px]:top-[38%] max-[820px]:right-auto max-[820px]:bottom-auto max-[820px]:left-[9vw] max-[820px]:w-[82vw] [&.gl]:pointer-events-auto [&.gl]:cursor-grab [&.gl]:touch-none [&.gl.drag]:cursor-grabbing"
          data-morph-to=""
        >
          <Image
            className={`q3 block h-auto w-full select-none ${DISSOLVE} group-[.idle]/visor:animate-[q3Float_6s_ease-in-out_infinite] group-[.gl]/visor:animate-none! group-[.gl]/visor:opacity-0 group-[.gl]/visor:[transition:opacity_.7s_var(--e-out)] rm:animate-none!`}
            src="/images/quest3.png"
            alt="Meta Quest 3 headset"
            width={537}
            height={402}
            priority
            draggable={false}
            sizes="(max-width: 819px) 82vw, (min-width: 1100px) min(32vw, 52vh), min(40vw, 580px)"
          />
          <canvas className={`q3-cv pointer-events-none absolute -top-1/4 -left-1/4 block size-[150%] opacity-0 [transition:opacity_.7s_var(--e-out)] ${DISSOLVE} group-[.gl]/visor:opacity-100`} role="img" aria-label="3D model of the Meta Quest 3. Drag to rotate it in any direction." />
        </div>
        <canvas className="fov-cv pointer-events-none absolute inset-0 block size-full" aria-hidden="true" />
        <div className="pointer-events-none absolute right-(--pad) bottom-[clamp(40px,9vh,100px)] left-(--pad) h-0 max-[820px]:bottom-[calc(36px+env(safe-area-inset-bottom,0px))]" aria-hidden="true">
          {HERO_CAPS.map(([small, t]) => (
            <p className="fov-cap group/cap absolute inset-x-0 bottom-0 m-0 text-ink" key={t}>
              <small className="mb-3 block text-[14px] font-[560] tracking-normal opacity-0 [font-stretch:100%] [transform:translateY(10px)] [transition:opacity_.4s,transform_.6s_var(--e-out)] group-[.on]/cap:opacity-[.72] group-[.on]/cap:[transform:none] group-[.on]/cap:delay-150 group-[.notr]/cap:transition-none!">{small}</small>
              <SplitText className={`fc-t block max-w-[12ch] text-[length:clamp(36px,5.8vw,100px)] leading-[.94] font-[650] tracking-[-0.04em] [font-stretch:118%] max-[820px]:text-[length:clamp(32px,9.6vw,48px)] ${CAP_LETTERS}`} text={t} ariaHidden bare />
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}

// headline and the VR band line share one absolute position and the fitted font size (--hl-fs beats .d1)
const HL_POS = "d1 absolute top-(--hl-top) right-(--pad) left-(--pad) m-0 text-(length:--hl-fs)!";
// runtime-generated lines (.hl-1/.hl-2) are block spans sized to their text
const HL_LINES = "split split-rise [&_.hl-1]:block [&_.hl-1]:w-fit [&_.hl-2]:block [&_.hl-2]:w-fit";
const HERO_BTN = "min-[1100px]:h-[clamp(54px,3.1vw,64px)]! min-[1100px]:px-[clamp(26px,1.6vw,34px)]! min-[1100px]:text-[length:clamp(15.5px,.9vw,18px)]! max-[820px]:h-[50px]! max-[820px]:px-[22px]!";
// the photo and the 3D canvas dissolve left to right with the --f mask edge
const DISSOLVE = "[-webkit-mask-image:linear-gradient(90deg,transparent_calc(var(--f)_-_5%),#000_calc(var(--f)_+_5%))] [mask-image:linear-gradient(90deg,transparent_calc(var(--f)_-_5%),#000_calc(var(--f)_+_5%))]";
// caption letters rise in (.on) and leave upwards (.gone); .notr resets without animating
const CAP_LETTERS = "[&_.c]:inline-block [&_.c]:[transform:translate3d(0,112%,0)] [&_.c]:[transition:transform_.85s_var(--e-out)_calc(var(--i)*14ms)] group-[.on]/cap:[&_.c]:[transform:none] group-[.gone]/cap:[&_.c]:[transform:translate3d(0,-112%,0)] group-[.gone]/cap:[&_.c]:[transition:transform_.5s_var(--e-out)_calc(var(--i)*5ms)] group-[.notr]/cap:[&_.c]:transition-none!";
