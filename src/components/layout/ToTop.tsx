"use client";
import { scrollToY } from "@/lib/scroll";

export function ToTop() {
  return (
    <button type="button" className="link to-top" onClick={() => scrollToY(0)}>
      Back to top
    </button>
  );
}
