import type { CSSProperties } from "react";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { SITE_DESCRIPTION } from "@/content/site";
import { ScrubWords } from "@/components/motion/ScrubWords";
import { Hero } from "@/sections/home/Hero";
import { Orbit } from "@/sections/home/Orbit";
import { Marquee } from "@/sections/home/Marquee";
import { Services } from "@/sections/home/Services";
import { Occasions } from "@/sections/home/Occasions";
import { Planet } from "@/sections/home/Planet";
import { HubTeaser } from "@/sections/home/HubTeaser";
import { Why } from "@/sections/home/Why";
import { FinalCta } from "@/sections/home/FinalCta";
import { Fleet } from "@/sections/shared/Fleet";
import { FloorPlan } from "@/sections/shared/FloorPlan";
import { Tour } from "@/sections/shared/Tour";
import { MANIFESTO, PLAN_STEPS_HOME } from "@/content/home";

export const metadata = { ...pageMetadata("home", "Home", SITE_DESCRIPTION), title:{ absolute: "Cyphon — VR headset rental, VR events, 360° video and VR HUB" } };

// Home: composes sections in the reference order (ANIMATION-SPEC §2, H1–H13).
export default function Home() {
  return (
    <div className="page" data-page="home">
      <Hero />
      <section data-nav="What we do" className="wrap pt-[clamp(110px,15vw,240px)] pb-[clamp(80px,10vw,160px)]" aria-label="What Cyphon does">
        <ScrubWords parts={MANIFESTO} />
      </section>
      <Orbit />
      <Fleet variant="pin" />
      <Marquee />
      <Services />
      <Occasions />
      <FloorPlan
        nav="Real estate VR"
        label="Real estate VR"
        tag="Real estate VR"
        title="Walk buyers through a home before it's built."
        lede="Our Virtual Sample House turns your floor plans into a space buyers can explore in a headset."
        steps={PLAN_STEPS_HOME}
      />
      <Tour />
      <Planet />
      <div className="wrap pt-2 pb-[clamp(72px,9vw,140px)]">
        <div className="flex flex-wrap gap-[10px]" data-reveal="">
          <span className={CHIP} style={{ "--i": 0 } as CSSProperties}>
            <svg aria-hidden="true"><use href="#i-cam" /></svg>Events &amp; functions
          </span>
          <span className={CHIP} style={{ "--i": 1 } as CSSProperties}>
            <svg aria-hidden="true"><use href="#i-lock" /></svg>Restricted areas*
          </span>
          <span className={CHIP} style={{ "--i": 2 } as CSSProperties}>
            <svg aria-hidden="true"><use href="#i-sparkle" /></svg>Custom projects
          </span>
        </div>
        <p className="mt-[18px] mb-0 text-[14px] text-stone">
          *Restricted area visits are subject to filming permissions.{" "}
          <Link className="link ml-[10px]" href="/360-video">
            Create your 360° video
          </Link>
        </p>
      </div>
      <HubTeaser />
      <Why />
      <FinalCta />
    </div>
  );
}

const CHIP = "pop inline-flex h-11 items-center gap-2 rounded-full bg-card px-[18px] text-[15.5px] font-[540] [font-stretch:102%] shadow-[inset_0_0_0_1px_var(--color-line)] [&_svg]:size-[18px] [&_svg]:flex-none";
