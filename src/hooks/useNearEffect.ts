"use client";
import { type RefObject, useEffect, useRef } from "react";
import { runSetup } from "@/lib/engine";
import { whenNear } from "@/lib/near";

/** a mount-only effect that waits until `ref` is within 1.5 screens of the viewport (lower Home sections: canvases,
 *  panoramas, measures). Its measures run once right after setup; its cleanup runs on unmount as usual. */
export function useNearEffect(ref: RefObject<Element | null>, setup: () => void | (() => void)) {
  const fn = useRef(setup);
  useEffect(() => {
    fn.current = setup;
  });
  useEffect(() => {
    let cleanup: void | (() => void);
    const off = whenNear(ref.current!, () => (cleanup = runSetup(() => fn.current())));
    return () => {
      off();
      cleanup?.();
    };
  }, [ref]);
}
