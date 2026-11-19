import { JsonLd, pageGraph, pageMetadata } from "@/lib/seo";
import { ScrubWords } from "@/components/motion/ScrubWords";
import { CtaBand } from "@/components/ui/CtaBand";
import { Faq } from "@/components/ui/Faq";
import { FAQS } from "@/content/faqs";
import { BrandPreview } from "@/sections/events/BrandPreview";
import { EventsHero } from "@/sections/events/EventsHero";
import { EventsStory } from "@/sections/events/EventsStory";
import { Explorer } from "@/sections/events/Explorer";
import { Includes } from "@/sections/events/Includes";
import { NextPage } from "@/sections/shared/PageIntro";

export const metadata = pageMetadata("events", "VR events & experiences");

// VR events (ANIMATION-SPEC §4, E1–E5), in the reference order.
export default function Page() {
  return (
    <div className="page" data-page="events">
      <EventsHero />
      <section data-nav="Why it works" className="wrap py-[clamp(90px,13vw,200px)]">
        <ScrubWords parts={["Cyphon helps event organisers create experiences that entertain audiences and leave a lasting impression."]} />
      </section>
      <Explorer />
      <EventsStory />
      <BrandPreview />
      <Includes />
      <Faq items={FAQS.events!} ask={{ lead: "Planning something different?", label: "Tell us about it", service: "VR event" }} />
      <CtaBand title="Have a date in mind?" text="Tell us about the venue and your guests and we'll suggest an experience that fits." label="Plan your VR event" service="VR event" quest />
      <NextPage to="video" />
      <JsonLd data={pageGraph("events", "VR events and experiences")} />
    </div>
  );
}
