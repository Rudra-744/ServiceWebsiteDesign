import type { CSSProperties } from "react";
import Link from "next/link";
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

// Home: composes sections in the reference order (ANIMATION-SPEC §2, H1–H13).
export default function Home() {
  return (
    <div className="page" data-page="home">
      <Hero />
      <section data-nav="What we do" className="mani wrap" aria-label="What Cyphon does">
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
      <div className="wrap pl-after">
        <div className="chips" data-reveal="">
          <span className="chip pop" style={{ "--i": 0 } as CSSProperties}>
            <svg aria-hidden="true"><use href="#i-cam" /></svg>Events &amp; functions
          </span>
          <span className="chip pop" style={{ "--i": 1 } as CSSProperties}>
            <svg aria-hidden="true"><use href="#i-lock" /></svg>Restricted areas*
          </span>
          <span className="chip pop" style={{ "--i": 2 } as CSSProperties}>
            <svg aria-hidden="true"><use href="#i-sparkle" /></svg>Custom projects
          </span>
        </div>
        <p className="foot-note">
          *Restricted area visits are subject to filming permissions.{" "}
          <Link className="link" href="/360-video" style={{ marginLeft: 10 }}>
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
