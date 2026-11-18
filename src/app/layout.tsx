import type { Metadata, Viewport } from "next";
import { Archivo } from "next/font/google";
import "@/styles/globals.css";
import { Providers } from "@/providers/Providers";
import { IconSprite } from "@/components/layout/IconSprite";
import { Nav } from "@/components/layout/Nav";
import { Menu } from "@/components/layout/Menu";
import { Cursor } from "@/components/layout/Cursor";
import { Footer } from "@/components/layout/Footer";
import { Preloader } from "@/components/layout/Preloader";
import { SITE_DESCRIPTION, site } from "@/content/site";
import { JsonLd, organization, website } from "@/lib/seo";

// Archivo variable with the width axis (headlines run at font-stretch 104–125%)
const archivo = Archivo({ subsets: ["latin"], axes: ["wdth"], display: "swap", variable: "--font-archivo" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: "Cyphon — VR headset rental, VR events, 360° video and VR HUB", template: "%s — Cyphon" },
  description: SITE_DESCRIPTION,
};

export const viewport: Viewport = { themeColor: "#ffffff" };

// Runs before paint: motion flags decide which "before" states apply (content stays visible without JS).
// The loader runs once per session on desktop only: never on phones/touch screens (hover: none or < 820 px wide),
// with reduced motion, Save-Data or a 2G/slow-2G connection.
const FLAGS = `try{var d=document.documentElement,c=d.classList,rm=matchMedia("(prefers-reduced-motion: reduce)").matches;c.add(rm?"rm":"motion");if(matchMedia("(hover: hover) and (pointer: fine)").matches)c.add("fine");var n=navigator.connection,slow=!!n&&(n.saveData||/2g/.test(n.effectiveType||"")),phone=matchMedia("(hover: none), (max-width: 819px)").matches;if(rm||slow||phone||sessionStorage.getItem("cy-pre"))c.add("pre-skip");else{c.add("preloading");d.style.overflow="hidden"}}catch(e){}`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-IN" className={archivo.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: FLAGS }} />
      </head>
      <body>
        <JsonLd data={[organization(), website()]} />
        <a className="fixed top-3 left-3 z-200 -translate-y-[200%] rounded-full bg-ink px-4 py-[10px] font-semibold text-white focus:translate-y-0" href="#main">
          Skip to content
        </a>
        <IconSprite />
        <Cursor />
        <Preloader />
        <Providers>
          <Nav />
          <Menu />
          <main id="main">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
