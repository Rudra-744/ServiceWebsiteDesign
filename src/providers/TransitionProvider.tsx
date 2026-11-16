"use client";
import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useEffect, useRef } from "react";
import { engine } from "@/lib/engine";
import { closeMenuInstant, setMenu } from "@/lib/menu";
import { scrollToY } from "@/lib/scroll";
import { routeByPath } from "@/content/site";

// Page transitions (ANIMATION-SPEC G7). Intercepts internal link clicks, saves the old page's scroll,
// and restores it on back/forward. Stage 2 adds the card-to-page morph overlay on top of this flow.
export function TransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const pageY = useRef<Record<string, number>>({});
  const popped = useRef(false);
  const prev = useRef(pathname);

  useEffect(() => {
    const click = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element).closest?.<HTMLAnchorElement>("a[href]");
      if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || !routeByPath(url.pathname)) return;
      if (url.pathname === location.pathname && url.hash) return; // in-page anchors (skip link)
      e.preventDefault();
      if (url.pathname === location.pathname) {
        // same page: just go to the top (Contact re-reads its query string itself)
        if (url.search !== location.search) router.replace(url.pathname + url.search, { scroll: false });
        if (engine.menuOpen) setMenu(false);
        scrollToY(0);
        return;
      }
      if (engine.busy) return;
      pageY.current[location.pathname] = scrollY;
      if (engine.menuOpen) closeMenuInstant();
      router.push(url.pathname + url.search, { scroll: false });
    };
    const pop = () => {
      popped.current = true;
    };
    // capture phase: runs before <Link>'s own handler, which then sees defaultPrevented and stands down
    document.addEventListener("click", click, true);
    addEventListener("popstate", pop);
    return () => {
      document.removeEventListener("click", click, true);
      removeEventListener("popstate", pop);
    };
  }, [router]);

  // runs after the new page committed (and before Providers re-arms reveals)
  useEffect(() => {
    if (prev.current === pathname) return;
    prev.current = pathname;
    const y = popped.current ? (pageY.current[pathname] ?? 0) : 0;
    popped.current = false;
    scrollToY(y, true);
  }, [pathname]);

  return children;
}
