import type { CSSProperties, ElementType, ReactNode } from "react";

// Split-text headline rise (ANIMATION-SPEC G2), split on the server so markup is stable.
// Each word → span.w (mask), each letter → span.c with --i = running letter index across the heading.

type Line = { text: string; className?: string };

function splitWords(text: string, start: number): ReactNode[] {
  let i = start;
  const out: ReactNode[] = [];
  text.split(/(\s+)/).forEach((part, k) => {
    if (!part) return;
    if (/^\s+$/.test(part)) {
      out.push(" ");
      return;
    }
    out.push(
      <span className="w" aria-hidden="true" key={k}>
        {Array.from(part).map((ch) => (
          <span className="c" key={i} style={{ "--i": i++ } as CSSProperties}>
            {ch}
          </span>
        ))}
      </span>,
    );
  });
  return out;
}

type Props = {
  as?: ElementType;
  text?: string;
  /** block lines (e.g. the hero's .hl-1/.hl-2) sharing one letter index */
  lines?: Line[];
  className?: string;
  style?: CSSProperties;
  /** revealed by code, not by the scroll observer */
  manual?: boolean;
  ariaHidden?: boolean;
  label?: string;
  /** letters only, no data-split: the parent animates them (hero and tunnel captions) */
  bare?: boolean;
};

export function SplitText({ as: Tag = "span", text, lines, className, style, manual, ariaHidden, label, bare }: Props) {
  const all = lines ?? [{ text: text ?? "" }];
  // running letter index: each line starts after the letters of the lines before it
  const letters = (t: string) => Array.from(t.replace(/\s+/g, "")).length;
  const kids = all.map((l, n) => {
    const nodes = splitWords(l.text, all.slice(0, n).reduce((s, x) => s + letters(x.text), 0));
    return lines ? (
      <span className={l.className} key={n}>
        {nodes}
      </span>
    ) : (
      nodes
    );
  });
  const full = all.map((l) => l.text).join(" ");
  return (
    <Tag
      className={[bare ? "split" : "split split-rise", className].filter(Boolean).join(" ")}
      style={style}
      data-split={bare ? undefined : ""}
      data-manual={manual ? "" : undefined}
      aria-hidden={ariaHidden || undefined}
      aria-label={ariaHidden ? undefined : (label ?? full)}
    >
      {kids}
    </Tag>
  );
}

/** rolling-label letters (<i style="--ci:n">) used by buttons, the nav chip and menu links */
export function Chars({ text }: { text: string }) {
  return (
    <>
      {Array.from(text).map((c, i) => (
        <i key={i} style={{ "--ci": i } as CSSProperties}>
          {c}
        </i>
      ))}
    </>
  );
}
