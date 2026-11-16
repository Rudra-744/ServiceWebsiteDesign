import type { Metadata } from "next";
import { CtaBand } from "@/components/ui/CtaBand";
import { Faq } from "@/components/ui/Faq";
import { FAQS } from "@/content/faqs";
import { Benefits } from "@/sections/realestate/Benefits";
import { GrowMedia } from "@/sections/realestate/GrowMedia";
import { PerfectFor } from "@/sections/realestate/PerfectFor";
import { FloorPlan } from "@/sections/shared/FloorPlan";
import { NextPage, PageIntro } from "@/sections/shared/PageIntro";
import { Tour } from "@/sections/shared/Tour";

export const metadata: Metadata = { title: "Real estate VR" };

const STEPS = [
  ["Share your plans", "Provide architectural drawings, floor plans or available 3D designs."],
  ["We create the virtual model", "A detailed 3D representation of the proposed property."],
  ["Buyers experience it in VR", "They explore the virtual home using a VR headset."],
  ["Present to buyers", "Use it at sales offices, property launches, exhibitions and customer meetings."],
] as const;

// Real estate VR (ANIMATION-SPEC §6, RE1–RE6), in the reference order.
export default function Page() {
  return (
    <div className="page" data-page="real-estate">
      <PageIntro page="real-estate">
        <GrowMedia />
      </PageIntro>
      <Tour style={{ marginTop: "clamp(72px,9vw,140px)" }} />
      <FloorPlan nav="How it works" label="How it works" tag="How it works" title="From floor plan to front door." steps={STEPS} />
      <Benefits />
      <PerfectFor />
      <Faq items={FAQS["real-estate"]!} />
      <CtaBand title="Launching a project soon?" text="Send us your plans and we'll show you what buyers will see." label="Create your virtual sample house" service="Real estate VR" />
      <NextPage to="vr-hub" />
    </div>
  );
}
