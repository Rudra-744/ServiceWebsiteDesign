"use client";
import { usePathname } from "next/navigation";
import { type ReactNode, useEffect, useRef } from "react";
import { addMeasure, maxY } from "@/lib/engine";
import { useTicker } from "@/hooks/useTicker";

// Footer curtain (ANIMATION-SPEC G12): fixed under <main>, uncovered at the end of the page.
// Becomes static when taller than 92% of the viewport. The giant word rises once 55% of it is uncovered.
export function FooterCurtain({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  const h = useRef(0);
  const pathname = usePathname();

  useEffect(
    () =>
      addMeasure(() => {
        const foot = ref.current!, main = document.getElementById("main")!;
        foot.classList.remove("is-static");
        h.current = foot.offsetHeight;
        if (h.current > innerHeight * 0.92) {
          foot.classList.add("is-static");
          main.style.marginBottom = "0px";
        } else main.style.marginBottom = h.current + "px";
      }),
    [],
  );
  useEffect(() => ref.current?.classList.remove("in"), [pathname]);

  useTicker(() => {
    const foot = ref.current;
    if (foot && !foot.classList.contains("in") && scrollY >= maxY() - h.current * 0.55) foot.classList.add("in");
  });

  return (
    <footer ref={ref} className="foot group/foot fixed inset-x-0 bottom-0 z-1 bg-ink px-(--pad) pt-[clamp(48px,6vw,88px)] pb-6 text-[#f2f2f4] [&.is-static]:relative">
      {children}
    </footer>
  );
}
