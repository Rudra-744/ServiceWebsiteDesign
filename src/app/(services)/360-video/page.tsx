import { JsonLd, pageGraph, pageMetadata } from "@/lib/seo";
import { ScrubWords } from "@/components/motion/ScrubWords";
import { CtaBand } from "@/components/ui/CtaBand";
import { Faq } from "@/components/ui/Faq";
import { FAQS } from "@/content/faqs";
import { NextPage, PageIntro } from "@/sections/shared/PageIntro";
import { Bento } from "@/sections/video/Bento";
import { Pano } from "@/sections/video/Pano";

export const metadata = pageMetadata("video", "360° video production");

// 360° video (ANIMATION-SPEC §5, V1–V3), in the reference order.
export default function Page() {
  return (
    <div className="page" data-page="video">
      <PageIntro page="video">
        <Pano />
      </PageIntro>
      <Bento />
      <section data-nav="Why 360°" className="wrap sec-tight">
        <ScrubWords parts={["Our 360° content helps businesses showcase places, communicate experiences and connect with audiences in a more immersive way."]} />
      </section>
      <Faq items={FAQS.video!} />
      <CtaBand title="Got a place worth seeing?" text="Tell us where it is and who should see it. We'll plan the shoot." label="Create your 360° video" service="360° video" />
      <NextPage to="real-estate" />
      <JsonLd data={pageGraph("video", "360° video production")} />
    </div>
  );
}
