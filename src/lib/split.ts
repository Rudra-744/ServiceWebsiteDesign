// String version of <SplitText> / <Chars> for markup that code swaps at runtime (hero headline, CTA labels).
// Must produce the same structure as components/motion/SplitText.tsx.
const esc = (c: string) => (c === "&" ? "&amp;" : c === "<" ? "&lt;" : c === ">" ? "&gt;" : c);

export function splitLinesHTML(lines: { text: string; cls?: string }[]) {
  let i = 0;
  return lines
    .map(({ text, cls }) => {
      const words = text
        .split(/(\s+)/)
        .filter(Boolean)
        .map((part) =>
          /^\s+$/.test(part)
            ? " "
            : `<span class="w" aria-hidden="true">${Array.from(part)
                .map((ch) => `<span class="c" style="--i:${i++}">${esc(ch)}</span>`)
                .join("")}</span>`,
        )
        .join("");
      return cls ? `<span class="${cls}">${words}</span>` : words;
    })
    .join("");
}

export const charHTML = (t: string) => [...t].map((c, i) => `<i style="--ci:${i}">${esc(c)}</i>`).join("");
