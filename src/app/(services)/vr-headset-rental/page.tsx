import { JsonLd, pageGraph, pageMetadata } from "@/lib/seo";
import { FillWords } from "@/components/motion/FillWords";
import { CtaBand } from "@/components/ui/CtaBand";
import { Faq } from "@/components/ui/Faq";
import { FAQS } from "@/content/faqs";
import { Audiences } from "@/sections/rental/Audiences";
import { Planner } from "@/sections/rental/Planner";
import { Plans } from "@/sections/rental/Plans";
import { RentalHero } from "@/sections/rental/RentalHero";
import { RentalStory } from "@/sections/rental/RentalStory";
import { Unbox } from "@/sections/rental/Unbox";
import { Fleet } from "@/sections/shared/Fleet";
import { NextPage } from "@/sections/shared/PageIntro";

export const metadata = pageMetadata("rental", "VR headset rental");

// Headset rental (ANIMATION-SPEC §3, R1–R9), in the reference order.
export default function Page() {
  return (
    <div className="page" data-page="rental">
      <RentalHero />
      <FillWords nav="How it works" text="You pick the date and the headcount. We bring the headsets, set them up, run them with your guests and pack everything away after." />
      <Planner />
      <Fleet variant="view" />
      <RentalStory />
      <Plans />
      <Unbox />
      <Audiences />
      <Faq items={FAQS.rental!} ask={{ lead: "Something else on your mind?", label: "Ask us directly", service: "Headset rental" }} />
      <CtaBand title="Planning an event or training day?" text="Share the date, venue and headcount and we'll put together a rental plan." label="Rent VR headsets" service="Headset rental" quest />
      <NextPage to="events" />
      <JsonLd data={pageGraph("rental", "VR headset rental")} />
    </div>
  );
}
