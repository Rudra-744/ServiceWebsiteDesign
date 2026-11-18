"use client";
// One shared IntersectionObserver that fires once per element when it comes within 1.5 screens of the viewport.
// Lower Home sections start their scroll scenes and heavy setup only then (they keep their server HTML meanwhile).
const MARGIN = "150% 0px 150% 0px";
const waiting = new Map<Element, Set<() => void>>();
let io: IntersectionObserver | null = null;

/** run `cb` once `el` is near the viewport (on the next frame if it already is); returns a cancel function */
export function whenNear(el: Element, cb: () => void) {
  io ??= new IntersectionObserver(
    (es) =>
      es.forEach((e) => {
        if (!e.isIntersecting) return;
        const cbs = waiting.get(e.target);
        waiting.delete(e.target);
        io!.unobserve(e.target);
        cbs?.forEach((f) => f());
      }),
    { rootMargin: MARGIN },
  );
  let set = waiting.get(el);
  if (!set) {
    set = new Set();
    waiting.set(el, set);
    io.observe(el);
  }
  set.add(cb);
  return () => {
    const s = waiting.get(el);
    if (!s) return;
    s.delete(cb);
    if (!s.size) {
      waiting.delete(el);
      io?.unobserve(el);
    }
  };
}
