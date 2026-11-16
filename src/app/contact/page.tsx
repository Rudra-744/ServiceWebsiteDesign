import type { Metadata } from "next";
import { Suspense } from "react";
import { SplitText } from "@/components/motion/SplitText";
import { site } from "@/content/site";
import { ContactForm, ContactFromParams } from "@/sections/contact/ContactForm";

export const metadata: Metadata = { title: "Contact" };

// Contact (ANIMATION-SPEC §8, C1). The form reads ?service / ?note on the client, so it sits in a Suspense boundary
// and the page stays static (the fallback is the same form without the pre-fill).
export default function Page() {
  return (
    <div className="page" data-page="contact">
      <section data-nav="Contact" className="wrap sec grid gap-[clamp(40px,6vw,96px)] pt-[calc(var(--nav-h)+clamp(60px,8vw,120px))] min-[1000px]:grid-cols-[1fr_1.15fr] min-[1000px]:items-start">
        <div className="grid gap-[26px] min-[1000px]:sticky min-[1000px]:top-[calc(var(--nav-h)+60px)]">
          <p className="m-0 text-[14px] text-stone">Contact</p>
          <SplitText as="h1" className="d1" text="Let's talk." />
          <p className="lede fade" data-reveal="">
            Tell us what you&apos;re planning — an event, a training programme, a 360° film, a sample house or a VR HUB setup. We&apos;ll come back with the right mix of headsets, content and support.
          </p>
          {/* TODO(client): the address comes from NEXT_PUBLIC_CONTACT_EMAIL; nothing is shown until it is set */}
          {site.email && (
            <div className="fade grid gap-[10px] text-[18px]" data-reveal="">
              <span className="tag">Email</span>
              <a className="font-semibold" href={`mailto:${site.email}`}>
                {site.email}
              </a>
            </div>
          )}
        </div>
        <Suspense fallback={<ContactForm />}>
          <ContactFromParams />
        </Suspense>
      </section>
    </div>
  );
}
