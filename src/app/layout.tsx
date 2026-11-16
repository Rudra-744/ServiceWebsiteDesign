import type { Metadata, Viewport } from "next";
import { Archivo } from "next/font/google";
import "@/styles/globals.css";
import { Providers } from "@/providers/Providers";
import { IconSprite } from "@/components/layout/IconSprite";
import { Nav } from "@/components/layout/Nav";
import { Menu } from "@/components/layout/Menu";
import { Cursor } from "@/components/layout/Cursor";
import { Footer } from "@/components/layout/Footer";
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
const FLAGS = `try{var c=document.documentElement.classList;c.add(matchMedia("(prefers-reduced-motion: reduce)").matches?"rm":"motion");if(matchMedia("(hover: hover) and (pointer: fine)").matches)c.add("fine")}catch(e){}`;

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
