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
import { site } from "@/content/site";

// Archivo variable with the width axis (headlines run at font-stretch 104–125%)
const archivo = Archivo({ subsets: ["latin"], axes: ["wdth"], display: "swap", variable: "--font-archivo" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: "Cyphon — VR headset rental, VR events, 360° video and VR HUB", template: "%s — Cyphon" },
  description:
    "Cyphon provides end-to-end virtual reality: 200+ VR headsets for rental, immersive events, 360° video production, virtual sample houses for real estate and the VR HUB headset management console.",
};

export const viewport: Viewport = { themeColor: "#ffffff" };

// Runs before paint: motion flags decide which "before" states apply (content stays visible without JS).
// The loader runs once per session, never with reduced motion, Save-Data or a 2G/3G connection.
const FLAGS = `try{var d=document.documentElement,c=d.classList,rm=matchMedia("(prefers-reduced-motion: reduce)").matches;c.add(rm?"rm":"motion");if(matchMedia("(hover: hover) and (pointer: fine)").matches)c.add("fine");var n=navigator.connection,slow=!!n&&(n.saveData||/2g|3g/.test(n.effectiveType||""));if(rm||slow||sessionStorage.getItem("cy-pre"))c.add("pre-skip");else{c.add("preloading");d.style.overflow="hidden"}}catch(e){}`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-IN" className={archivo.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: FLAGS }} />
      </head>
      <body>
        <a className="skip" href="#main">
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
