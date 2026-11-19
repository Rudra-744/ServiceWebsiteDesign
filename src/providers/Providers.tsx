"use client";
import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useEffect } from "react";
import { scrollTrigger } from "@/lib/gsap";
import { addTick } from "@/lib/ticker";
import { initEngine, measureAll } from "@/lib/engine";
import { startLenis, stopLenis } from "@/lib/scroll";
import { armReveals } from "@/lib/reveal";
import { LEGACY_HASH } from "@/content/site";
import { TransitionProvider } from "./TransitionProvider";

// Engine boot: shared state, Lenis (mouse only) driven by the shared frame loop and synced to ScrollTrigger,
// reveals armed and layout re-measured whenever a page mounts.
export function Providers({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    initEngine();
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    let offTick: (() => void) | null = null, alive = true;
    startLenis().then((lenis) => {
      if (!lenis || !alive) return;
      lenis.on("scroll", () => scrollTrigger()?.update());
      offTick = addTick((now) => lenis.raf(now));
    });
    // the static site used /#rental style links: send them to the real page
    const h = location.hash.slice(1);
    if (location.pathname === "/" && LEGACY_HASH[h] && LEGACY_HASH[h] !== "/") router.replace(LEGACY_HASH[h]);
    return () => {
      alive = false;
      offTick?.();
      stopLenis();
    };
  }, [router]);

  // a page mounted: arm its reveals and re-measure (child effects already registered their scenes)
  useEffect(() => {
    const main = document.getElementById("main");
    if (main) armReveals(main);
    measureAll();
  }, [pathname]);

  return <TransitionProvider>{children}</TransitionProvider>;
}
