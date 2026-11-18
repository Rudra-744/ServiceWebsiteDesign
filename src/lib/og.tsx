import { ImageResponse } from "next/og";

// Share image (1200 × 630) in the site's look: white card, cornflower band with the page line, logo mark.
// Rendered at build time by each route's opengraph-image.tsx. Uses the default sans font (no font file to ship).
export const OG_SIZE = { width: 1200, height: 630 };

export function ogImage(kicker: string, title: string) {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#ffffff", padding: 72, color: "#050505" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 40, fontWeight: 700 }}>
          <svg width="56" height="56" viewBox="0 0 32 32">
            <circle cx="16" cy="16" r="16" fill="#548CFF" />
            <path d="M21.2 11.6a6.6 6.6 0 1 0 0 8.8" fill="none" stroke="#050505" strokeWidth="3" strokeLinecap="round" />
          </svg>
          Cyphon
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: 30, color: "#4a4a50" }}>{kicker}</div>
          <div style={{ display: "flex", background: "#548CFF", borderRadius: 999, padding: "18px 44px", fontSize: 72, fontWeight: 700, letterSpacing: -2, lineHeight: 1.05, maxWidth: 1056 }}>{title}</div>
        </div>
      </div>
    ),
    OG_SIZE,
  );
}
