"use client";
import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useEffect, useRef } from "react";
import { INTRO, engine, setEngine } from "@/lib/engine";
import { closeMenuInstant, setMenu } from "@/lib/menu";
import { E, clamp, lerp, tween, wait } from "@/lib/motion";
import { type RGB, type Snap, fromPath, lumOf, mix3, morphSource, morphTarget, onScreen, pathOf, snap } from "@/lib/morph";
import { holdReveals, releaseReveals } from "@/lib/reveal";
import { pauseSmooth, scrollToY } from "@/lib/scroll";
import { ROUTES, routeByPath } from "@/content/site";

// Page transitions — "the card becomes the page" (ANIMATION-SPEC G7).
// 1. Grow (640 ms in-out): the tapped element (or the nav chip) grows to the viewport; its photo fades out,
//    the destination name fades up.  2. Swap the route underneath, holding reveals.
// 3. Settle (820 ms out) into the new page's [data-morph-to] (or, going back, into the exact card that was tapped),
//    blending colour, then fade (260 ms). Reveals release 160 ms into the settle.
// Browser back/forward: Next swaps the page right away, so the old page is frozen (a static clone) while the overlay grows.

type Trail = { from: string; to: string; path: number[] | null };
const titleOf = (path: string) => ROUTES[routeByPath(path) ?? "home"].title;

export function TransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const box = useRef<HTMLDivElement>(null);
  const s = useRef({
    pageY: {} as Record<string, number>,
    trails: [] as Trail[],
    queued: null as { href: string; src: Element | null } | null,
    prev: pathname,
    kind: "push" as "push" | "back" | "pop",
    mounted: null as (() => void) | null,
    popBusy: false,
  });

  useEffect(() => {
    const st = s.current;
    const ov = box.current!, img1 = ov.querySelector<HTMLImageElement>(".morph-img")!, img2 = ov.querySelector<HTMLImageElement>(".morph-img2")!;
    const lbl = ov.querySelector<HTMLElement>(".morph-lbl span")!;
    const setBox = (q: { x: number; y: number; w: number; h: number }, rad: number, col: RGB) => {
      const o = ov.style;
      o.left = q.x.toFixed(2) + "px";
      o.top = q.y.toFixed(2) + "px";
      o.width = q.w.toFixed(2) + "px";
      o.height = q.h.toFixed(2) + "px";
      o.borderRadius = rad.toFixed(2) + "px";
      o.backgroundColor = `rgb(${col.map((v) => Math.round(v)).join(",")})`;
    };
    const fallback = (): Snap => snap(document.querySelector(".nav-now")) ?? { x: innerWidth / 2 - 30, y: innerHeight / 2 - 30, w: 60, h: 60, r: 30, c: [84, 140, 255], img: null };
    const nextMount = () => new Promise<void>((res) => (st.mounted = res));

    // phase 1: grow from A to the viewport
    const grow = async (A: Snap, title: string) => {
      const dark = lumOf(A.c) < 0.5;
      lbl.textContent = title;
      lbl.parentElement!.style.color = dark ? "#fff" : "#050505";
      img1.style.opacity = A.img ? "1" : "0";
      if (A.img) img1.src = A.img;
      img2.style.opacity = "0";
      ov.style.opacity = "";
      ov.classList.add("on");
      setBox(A, A.r, A.c);
      await tween(640, E.inOut, (k) => {
        setBox({ x: lerp(A.x, 0, k), y: lerp(A.y, 0, k), w: lerp(A.w, innerWidth, k), h: lerp(A.h, innerHeight, k) }, lerp(A.r, 0, k), A.c);
        if (A.img) img1.style.opacity = (1 - clamp((k - 0.55) / 0.45)).toFixed(3);
        lbl.style.opacity = clamp((k - 0.55) / 0.45).toFixed(3);
        lbl.style.transform = `translate3d(0,${((1 - clamp((k - 0.5) / 0.5)) * 40).toFixed(1)}px,0)`;
      });
    };

    // phase 3: settle into the target element (or melt away when there is none on screen)
    const settle = async (tEl: Element | null, col: RGB, back: boolean) => {
      const B = onScreen(snap(tEl)) ? snap(tEl) : null;
      if (B && tEl) {
        tEl.classList.add("morph-hit");
        if (!back) tEl.classList.add("in");
      }
      if (B?.img) img2.src = B.img;
      setTimeout(() => {
        releaseReveals();
        window.dispatchEvent(new Event(INTRO));
      }, 160);
      const V = { w: innerWidth, h: innerHeight };
      if (B) {
        await tween(820, E.out, (k) => {
          setBox({ x: lerp(0, B.x, k), y: lerp(0, B.y, k), w: lerp(V.w, B.w, k), h: lerp(V.h, B.h, k) }, lerp(0, B.r, k), mix3(col, B.c, clamp(k * 1.4)));
          lbl.style.opacity = (1 - clamp(k / 0.35)).toFixed(3);
          if (B.img) img2.style.opacity = clamp((k - 0.2) / 0.5).toFixed(3);
        });
        await tween(260, E.out, (k) => (ov.style.opacity = (1 - k).toFixed(3)));
      } else {
        await tween(560, E.inOut, (k) => {
          setBox({ x: 0, y: lerp(0, -V.h * 0.08, k), w: V.w, h: V.h }, 0, col);
          ov.style.opacity = (1 - k).toFixed(3);
          lbl.style.opacity = (1 - clamp(k / 0.4)).toFixed(3);
        });
      }
      ov.classList.remove("on");
      ov.style.opacity = "";
      if (tEl) setTimeout(() => tEl.classList.remove("morph-hit"), 50);
    };

    const begin = () => {
      setEngine({ busy: true });
      pauseSmooth(true);
    };
    const end = () => {
      setEngine({ busy: false });
      pauseSmooth(false);
      const q = st.queued;
      st.queued = null;
      if (q && new URL(q.href, location.href).pathname !== location.pathname) go(q.href, q.src);
    };

    // link navigation
    const go = async (href: string, srcEl: Element | null) => {
      if (engine.busy) {
        st.queued = { href, src: srcEl };
        return;
      }
      const from = location.pathname, to = new URL(href, location.href).pathname;
      if (engine.RM) {
        if (engine.menuOpen) setMenu(false);
        st.pageY[from] = scrollY;
        st.kind = "push";
        router.push(href, { scroll: false });
        return;
      }
      begin();
      st.popBusy = false;
      let A = snap(srcEl);
      if (!onScreen(A)) A = fallback();
      await grow(A, titleOf(to));
      if (st.popBusy) {
        // the visitor pressed back during the grow: that page is already here, settle into it
        await wait(60);
        await settle(morphTarget(), A.c, false);
        st.trails.length = 0;
        end();
        return;
      }
      closeMenuInstant();
      st.pageY[from] = scrollY;
      holdReveals();
      st.kind = "push";
      // read the card's place now: after the push the old page is unmounted
      const trailable = !!srcEl && srcEl !== document.querySelector(".nav-now") && !srcEl.closest(".nav, .menu");
      const path = trailable ? pathOf(srcEl!) : null;
      const mounted = nextMount();
      router.push(href, { scroll: false });
      await mounted;
      await wait(60);
      if (trailable && path) {
        st.trails.push({ from, to, path });
        if (st.trails.length > 12) st.trails.shift();
      } else st.trails.length = 0;
      await settle(morphTarget(), A.c, false);
      end();
    };

    const click = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element).closest?.<HTMLAnchorElement>("a[href]");
      if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || !routeByPath(url.pathname)) return;
      if (url.pathname === location.pathname && url.hash) return; // in-page anchors (skip link)
      e.preventDefault();
      if (url.pathname === location.pathname) {
        // same page: go to the top (Contact re-reads its query string itself)
        if (url.search !== location.search) router.replace(url.pathname + url.search, { scroll: false });
        if (engine.menuOpen) setMenu(false);
        scrollToY(0);
        return;
      }
      go(url.pathname + url.search, morphSource(a));
    };

    // browser back / forward
    const pop = () => {
      const from = st.prev, to = location.pathname;
      if (from === to) return;
      if (engine.busy) {
        st.popBusy = true;
        st.kind = "pop";
        return;
      }
      const trail = st.trails[st.trails.length - 1];
      const back = !!trail && trail.to === from && trail.from === to;
      st.kind = back ? "back" : "pop";
      if (!back) st.pageY[from] = scrollY;
      if (engine.RM) return;
      let A = back ? snap(morphTarget()) : null;
      if (!onScreen(A)) A = fallback();
      // hold the old page on screen while Next swaps it underneath
      const main = document.getElementById("main")!;
      const fz = document.createElement("div");
      fz.className = "morph-freeze";
      fz.setAttribute("aria-hidden", "true");
      const copy = main.cloneNode(true) as HTMLElement;
      copy.removeAttribute("id");
      copy.style.transform = `translate3d(0,${-scrollY}px,0)`;
      fz.appendChild(copy);
      // the footer too: fixed under <main> (curtain), or in flow after it when it is taller than the screen
      const foot = document.querySelector<HTMLElement>(".foot");
      if (foot) {
        const fc = foot.cloneNode(true) as HTMLElement;
        if (foot.classList.contains("static")) fc.style.transform = copy.style.transform;
        fz.appendChild(fc);
      }
      document.body.appendChild(fz);
      if (engine.menuOpen) closeMenuInstant();
      holdReveals();
      begin();
      const mounted = nextMount();
      const A0 = A;
      (async () => {
        await grow(A0, titleOf(to));
        fz.remove();
        await mounted;
        await wait(60);
        const tEl = back ? fromPath(trail.path) : morphTarget();
        if (back) st.trails.pop();
        else st.trails.length = 0;
        await settle(tEl, A0.c, back);
        end();
      })();
    };

    // capture phase: runs before <Link>'s own handler, which then sees defaultPrevented and stands down
    document.addEventListener("click", click, true);
    addEventListener("popstate", pop);
    return () => {
      document.removeEventListener("click", click, true);
      removeEventListener("popstate", pop);
    };
  }, [router]);

  // the new page committed (runs before Providers re-arms its reveals)
  useEffect(() => {
    const st = s.current;
    if (st.prev === pathname) return;
    st.prev = pathname;
    scrollToY(st.kind === "back" ? (st.pageY[pathname] ?? 0) : 0, true);
    st.kind = "push";
    st.mounted?.();
    st.mounted = null;
  }, [pathname]);

  return (
    <>
      {children}
      <div className="morph" aria-hidden="true" ref={box}>
        {/* eslint-disable-next-line @next/next/no-img-element -- src is set at runtime from the tapped card */}
        <img className="morph-img" alt="" />
        {/* eslint-disable-next-line @next/next/no-img-element -- src is set at runtime from the target */}
        <img className="morph-img2" alt="" />
        <span className="morph-lbl">
          <span />
        </span>
      </div>
    </>
  );
}
