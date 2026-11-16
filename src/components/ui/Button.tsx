import Link from "next/link";
import type { CSSProperties, MouseEventHandler } from "react";
import { Chars } from "@/components/motion/SplitText";

// Pill button (ANIMATION-SPEC G8): fill wipes up on hover, letters roll to a copy of themselves (12 ms apart),
// optional magnetic pull (mouse only, see Cursor). `btn` stays as the hook for morphs and the magnetic effect.
type Variant = "blue" | "ink" | "line" | "paper";
type Props = {
  label: string;
  href?: string;
  variant?: Variant;
  size?: "sm";
  magnetic?: boolean;
  className?: string;
  style?: CSSProperties;
  type?: "button" | "submit";
  onClick?: MouseEventHandler<HTMLElement>;
};

const BASE =
  "btn group/btn relative isolate inline-flex items-center justify-center gap-[10px] overflow-hidden whitespace-nowrap rounded-full font-semibold tracking-[-0.005em] [font-stretch:108%] [transition:color_.45s_var(--e-out),transform_.6s_var(--e-out),box-shadow_.45s] " +
  "before:absolute before:inset-0 before:-z-10 before:rounded-[inherit] before:bg-(--fill) before:content-[''] before:[transform:translateY(102%)] before:[transition:transform_.55s_var(--e-out)] hover:before:[transform:none]";

export const BTN: Record<Variant, string> = {
  blue: "bg-blue text-ink [--fill:var(--color-ink)] hover:text-white",
  ink: "bg-ink text-paper [--fill:var(--color-blue)] hover:text-ink",
  line: "shadow-[inset_0_0_0_1.5px_currentColor] [--fill:var(--color-ink)] hover:text-paper",
  paper: "bg-paper text-ink [--fill:var(--color-ink)] hover:text-paper",
};

/** the rolling label: each letter carries a copy of itself 1.3em below */
export const LBL =
  "lbl inline-block h-[1.3em] overflow-hidden leading-[1.3] [&_i]:inline-block [&_i]:whitespace-pre [&_i]:not-italic [&_i]:[text-shadow:0_1.3em_currentColor] [&_i]:[transition:transform_.55s_var(--e-out)_calc(var(--ci)*12ms)] group-hover/btn:[&_i]:[transform:translateY(-1.3em)] group-focus-visible/btn:[&_i]:[transform:translateY(-1.3em)] rm:[&_i]:duration-[.01ms] rm:[&_i]:delay-0";

export function btnClass(variant: Variant = "blue", size?: "sm", extra?: string) {
  // size lives here, never in BASE: two plain utilities for the same property have no reliable order (override with a variant or inline style)
  return [BASE, BTN[variant], size === "sm" ? "h-[42px] px-[18px] text-[14px]" : "h-[54px] px-[26px] text-[15.5px]", extra].filter(Boolean).join(" ");
}

export function Button({ label, href, variant = "blue", size, magnetic, className, style, type = "button", onClick }: Props) {
  const cls = btnClass(variant, size, className);
  const inner = (
    <span className={LBL} aria-hidden="true">
      <Chars text={label} />
    </span>
  );
  const common = { className: cls, style, "aria-label": label, "data-magnetic": magnetic ? "" : undefined };
  if (href)
    return (
      <Link href={href} {...common} onClick={onClick}>
        {inner}
      </Link>
    );
  return (
    <button type={type} {...common} onClick={onClick}>
      {inner}
    </button>
  );
}
