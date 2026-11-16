import type { Metadata } from "next";
import { SplitText } from "@/components/motion/SplitText";
import { Button } from "@/components/ui/Button";
import { Faq } from "@/components/ui/Faq";
import { FAQS } from "@/content/faqs";
import { contactHref } from "@/content/site";
import { Admins } from "@/sections/hub/Admins";
import { HowItWorks } from "@/sections/hub/HowItWorks";
import { HubHero } from "@/sections/hub/HubHero";
import { Interactions } from "@/sections/hub/Interactions";
import { LiveControl } from "@/sections/hub/LiveControl";
import { Platform } from "@/sections/hub/Platform";
import { Strike } from "@/sections/hub/Strike";

export const metadata: Metadata = { title: "VR HUB" };

// VR HUB (ANIMATION-SPEC §7, HB1–HB7), in the reference order. Last page in the sequence, so no "Next" link.
export default function Page() {
  return (
    <div className="page" data-page="vr-hub">
      <HubHero />
      <Strike />
      <Platform />
      <LiveControl />
      <Interactions />
      <HowItWorks />
      <Admins />
      <Faq items={FAQS["vr-hub"]!} title="Questions, answered." />
      <section data-nav="Get started" className="wrap grid justify-items-center gap-6 py-[clamp(110px,14vw,220px)] text-center">
        <p className="tag">Ready when your headsets are</p>
        <SplitText as="h2" className="d1 text-[length:clamp(44px,7.6vw,130px)]" text="Put the whole room in sync." />
        <p className="lede fade" data-reveal="">
          Connect headsets, upload your first video and run a session.
        </p>
        <div className="flex flex-wrap justify-center gap-3" data-reveal="">
          <Button href={contactHref("VR HUB")} label="Request access" variant="blue" magnetic className="fade" />
          <Button href={contactHref("VR HUB")} label="Book a demo" variant="line" magnetic className="fade [--d:.2s]" />
        </div>
        <small className="text-[14px] text-muted">Interface visuals on this page are illustrative.</small>
      </section>
    </div>
  );
}
