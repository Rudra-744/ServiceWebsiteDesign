"use client";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { LogoMark } from "./IconSprite";
import { INTRO, setEngine } from "@/lib/engine";
import { bgOf } from "@/lib/morph";
import { E, clamp, lerp, tween, wait } from "@/lib/motion";
import { releaseReveals } from "@/lib/reveal";
import { lockScroll } from "@/lib/scroll";
import { ROUTES, routeByPath, site } from "@/content/site";

// Preloader "Image reel" (ANIMATION-SPEC G1). A frame flicks through the services (faster as the count rises),
// the odometer follows real loading (2.4 s minimum, creep, 7 s cap). At 100 the frame shows the page's own
// [data-morph-to] visual and grows into exactly where it sits. Skipped (by the <head> script) for returning
// visitors in the session, reduced motion, Save-Data and slow connections.

const REEL: [string, string, string?][] = [
  ["/images/headset.jpg", "Headset rental"],
  ["/images/event.jpg", "VR events"],
  ["/images/camera360.jpg", "360° video"],
  ["/images/realestate.jpg", "Real estate VR"],
  ["/images/quest3.png", "VR HUB", "card"],
];
const DIGITS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];

/** element box relative to an ancestor from offsets, so entrance transforms don't skew it */
function relBox(el: HTMLElement, root: HTMLElement) {
  let x = 0, y = 0;
  let n: HTMLElement | null = el;
  while (n && n !== root) {
    x += n.offsetLeft;
    y += n.offsetTop;
    n = n.offsetParent as HTMLElement | null;
  }
  if (n !== root) {
    const r = el.getBoundingClientRect(), q = root.getBoundingClientRect();
    return { x: r.left - q.left, y: r.top - q.top, w: r.width, h: r.height };
  }
  return { x, y, w: el.offsetWidth, h: el.offsetHeight };
}


export function Preloader() {
  const ref = useRef<HTMLDivElement>(null);
  const [gone, setGone] = useState(false);
  const pathname = usePathname();
  const first = useRef(pathname);

  useEffect(() => {
    const pre = ref.current!;
    const html = document.documentElement;
    const finishNow = () => {
      html.classList.remove("preloading");
      setGone(true);
      window.dispatchEvent(new Event(INTRO));
    };
    if (html.classList.contains("pre-skip") || !html.classList.contains("preloading")) {
      finishNow();
      return;
    }
    try {
      sessionStorage.setItem("cy-pre", "1");
    } catch {}
    setEngine({ cover: true });
    lockScroll(true);

    const key = routeByPath(first.current) ?? "home";
    const tEl = document.querySelector<HTMLElement>("#main [data-morph-to]");
    const frameEl = pre.querySelector<HTMLElement>(".rl-frame")!, slides = pre.querySelector<HTMLElement>(".rl-slides")!, ns = pre.querySelector<HTMLElement>(".rl-ns")!;
    const cols = [...pre.querySelectorAll<HTMLElement>(".od")], strips = [...pre.querySelectorAll<HTMLElement>(".od-s")];
    ns.innerHTML = REEL.map((r) => `<b>${r[1]}</b>`).join("") + `<b>${key === "home" ? "Cyphon" : ROUTES[key].title}</b>`;
    REEL.forEach((r) => {
      const i = new Image();
      i.src = r[0];
    });
    const nameTo = (i: number) => (ns.style.transform = `translate3d(0,${(-i * 1.15).toFixed(2)}em,0)`);
    let z = 1;
    const addSlide = (inner: string, cls: string, dur: number, bg?: string) => {
      const el = document.createElement("div");
      el.className = "rl-s " + cls;
      el.style.zIndex = String(++z);
      el.style.setProperty("--sd", dur + "ms");
      if (bg) el.style.background = bg;
      el.innerHTML = inner;
      slides.appendChild(el);
      requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add("on")));
      while (slides.children.length > 3) slides.firstElementChild!.remove();
      return el;
    };
    // odometer: the digit holds until .55 of the fraction, then the next one rolls in
    const odo = (raw: number) => {
      const fr = raw % 1, v = Math.floor(raw) + (fr < 0.55 ? 0 : E.inOut((fr - 0.55) / 0.45));
      const pos = [Math.floor(v / 100) + Math.max(0, (v % 100) - 99), (Math.floor(v / 10) % 10) + Math.max(0, (v % 10) - 9), v % 10];
      pos.forEach((q, i) => (strips[i].style.transform = `translate3d(0,${(-q).toFixed(3)}em,0)`));
      cols[0].classList.toggle("z", v < 99.5);
      cols[1].classList.toggle("z", v < 9.5);
    };
    // real loading milestones
    let real = 12;
    const bump = (v: number) => (real = Math.max(real, v));
    if (document.fonts?.ready) document.fonts.ready.then(() => bump(40));
    else bump(40);
    const pageImgs = [...document.querySelectorAll<HTMLImageElement>("#main img")].filter((i) => i.getBoundingClientRect().top < innerHeight * 1.5);
    let left = pageImgs.length;
    const oneImg = () => {
      left--;
      bump(40 + 45 * (1 - left / Math.max(1, pageImgs.length)));
    };
    pageImgs.forEach((i) => {
      if (i.complete) oneImg();
      else {
        i.addEventListener("load", oneImg, { once: true });
        i.addEventListener("error", oneImg, { once: true });
      }
    });
    if (!pageImgs.length) bump(85);
    if (document.readyState === "complete") bump(100);
    else addEventListener("load", () => bump(100), { once: true });

    const T0 = performance.now(), MIN = 2400, CAP = 7000;
    let cur = 0, last = T0, nextAt = T0 + 380, ri = -1, out = false, raf = 0;

    // the page's own main visual, laid out as on the page, as the last slide
    const destSlide = () => {
      const col = tEl ? bgOf(tEl) : [255, 255, 255];
      let inner = "";
      const im = tEl?.querySelector("img");
      if (tEl && im && tEl.offsetWidth) {
        const b = relBox(im, tEl), W = tEl.offsetWidth, H = tEl.offsetHeight, fit = getComputedStyle(im).objectFit || "fill";
        inner = `<img src="${im.currentSrc || im.src}" alt="" style="inset:auto;left:${((b.x / W) * 100).toFixed(2)}%;top:${((b.y / H) * 100).toFixed(2)}%;width:${((b.w / W) * 100).toFixed(2)}%;height:${((b.h / H) * 100).toFixed(2)}%;object-fit:${fit === "fill" ? "contain" : fit}">`;
      }
      nameTo(REEL.length);
      return addSlide(inner, "dest", 420, `rgb(${col.join(",")})`);
    };

    const finish = async () => {
      destSlide();
      await wait(560);
      pre.classList.add("go");
      await wait(260);
      // the page's main element in its finished state, under the frame
      if (tEl) {
        tEl.classList.add("morph-land", "in");
        tEl.style.visibility = "hidden";
      }
      const A = frameEl.getBoundingClientRect();
      const B = tEl ? tEl.getBoundingClientRect() : null;
      const ok = !!B && B.width > 2 && B.height > 2 && B.top < innerHeight && B.bottom > 0;
      const rB = ok && tEl ? Math.min(parseFloat(getComputedStyle(tEl).borderTopLeftRadius) || 0, B!.height / 2) : 0;
      const st = frameEl.style;
      frameEl.classList.add("free");
      const put = (x: number, y: number, w: number, h: number, r: number) => {
        st.left = x.toFixed(2) + "px";
        st.top = y.toFixed(2) + "px";
        st.width = w.toFixed(2) + "px";
        st.height = h.toFixed(2) + "px";
        st.borderRadius = r.toFixed(2) + "px";
      };
      put(A.left, A.top, A.width, A.height, 18);
      st.aspectRatio = "auto";
      pre.classList.add("open");
      html.classList.remove("preloading");
      lockScroll(false);
      setEngine({ cover: false });
      setTimeout(() => {
        releaseReveals(80);
        window.dispatchEvent(new Event(INTRO));
      }, 320);
      if (ok && B && tEl) {
        await tween(980, E.inOut, (k) => put(lerp(A.left, B.left, k), lerp(A.top, B.top, k), lerp(A.width, B.width, k), lerp(A.height, B.height, k), lerp(18, rB, k)));
        tEl.style.visibility = "";
        await tween(280, E.out, (k) => (st.opacity = (1 - k).toFixed(3)));
      } else {
        await tween(620, E.inOut, (k) => {
          st.opacity = (1 - k).toFixed(3);
          st.transform = `scale(${(1 + 0.25 * k).toFixed(3)})`;
        });
      }
      if (tEl) {
        tEl.style.visibility = "";
        setTimeout(() => tEl.classList.remove("morph-land"), 60);
      }
      setGone(true);
    };

    const step = (now: number) => {
      if (out) return;
      const dt = Math.min(64, now - last);
      last = now;
      const t = now - T0;
      const kk = clamp(t / MIN), floor = 100 * (0.35 * kk + 0.65 * E.inOut(kk));
      let goal = Math.min(floor, t > CAP ? 100 : real);
      // held back by real loading and already caught up: creep instead of freezing
      if (goal < floor && cur >= goal - 0.3) goal = Math.min(99, cur + dt * 0.0012);
      cur = Math.min(100, cur + Math.max(0, goal - cur) * (1 - Math.pow(0.0015, dt / 1000)));
      if (100 - cur < 0.2 && goal >= 100) cur = 100;
      odo(cur);
      // the reel speeds up as the count rises
      if (now >= nextAt && cur < 97) {
        ri = (ri + 1) % REEL.length;
        const r = REEL[ri], gap = lerp(440, 130, cur / 100), dur = Math.round(Math.min(360, gap * 0.85));
        addSlide(`<img src="${r[0]}" alt="">`, r[2] ?? "", dur);
        nameTo(ri);
        nextAt = now + gap;
      }
      if (cur >= 100 && t >= MIN) {
        out = true;
        finish();
        return;
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, []);

  if (gone) return null;
  return (
    <div className="pre" aria-hidden="true" ref={ref}>
      <div className="rl">
        <div className="rl-top">
          <span className="pre-logo">
            <LogoMark />
            Cyphon
          </span>
          <span className="rl-tag">{site.tagline}</span>
        </div>
        <div className="rl-bot">
          <div className="rl-name">
            <span className="rl-ns" />
          </div>
          <div className="pre-num num">
            {[0, 1, 2].map((c) => (
              <span className="od" key={c}>
                <span className="od-s">
                  {DIGITS.map((d, i) => (
                    <span key={i}>{d}</span>
                  ))}
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="rl-frame">
        <div className="rl-slides" />
      </div>
    </div>
  );
}
