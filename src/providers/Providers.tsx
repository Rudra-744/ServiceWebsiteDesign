"use client";
import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useEffect } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { initEngine, measureAll } from "@/lib/engine";
import { startLenis, stopLenis } from "@/lib/scroll";
import { armReveals } from "@/lib/reveal";
import { LEGACY_HASH } from "@/content/site";
import { TransitionProvider } from "./TransitionProvider";

// Engine boot: shared state, Lenis (mouse only) driven by gsap.ticker and synced to ScrollTrigger,
// reveals armed and layout re-measured whenever a page mounts.
export function Providers({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    initEngine();
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    const lenis = startLenis();
    let tick: ((t: number) => void) | null = null;
    if (lenis) {
      lenis.on("scroll", ScrollTrigger.update);
      tick = (t: number) => lenis.raf(t * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
    }
    // the static site used /#rental style links: send them to the real page
    const h = location.hash.slice(1);
    if (location.pathname === "/" && LEGACY_HASH[h] && LEGACY_HASH[h] !== "/") router.replace(LEGACY_HASH[h]);
    return () => {
      if (tick) gsap.ticker.remove(tick);
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
