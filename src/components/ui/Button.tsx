import Link from "next/link";
import type { CSSProperties, MouseEventHandler } from "react";
import { Chars } from "@/components/motion/SplitText";

// Pill button (ANIMATION-SPEC G8): fill wipe on hover, rolling letter label, optional magnetic pull (mouse only).
type Props = {
  label: string;
  href?: string;
  variant?: "blue" | "ink" | "line" | "paper";
  size?: "sm";
  magnetic?: boolean;
  className?: string;
  style?: CSSProperties;
  type?: "button" | "submit";
  onClick?: MouseEventHandler<HTMLElement>;
  /** passed through for tests and scroll-to buttons */
  data?: Record<string, string>;
};

export function Button({ label, href, variant = "blue", size, magnetic, className, style, type = "button", onClick, data }: Props) {
  const cls = ["btn", `btn-${variant}`, size === "sm" && "btn-sm", className].filter(Boolean).join(" ");
  const inner = (
    <span className="lbl" aria-hidden="true">
      <Chars text={label} />
    </span>
  );
  const common = { className: cls, style, "aria-label": label, "data-magnetic": magnetic ? "" : undefined, ...prefix(data) };
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

const prefix = (d?: Record<string, string>) => (d ? Object.fromEntries(Object.entries(d).map(([k, v]) => [`data-${k}`, v])) : {});
