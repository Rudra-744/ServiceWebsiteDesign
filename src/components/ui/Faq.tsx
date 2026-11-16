"use client";
import Link from "next/link";
import { useState } from "react";
import { SplitText } from "@/components/motion/SplitText";
import { HEAD } from "@/components/ui/layout";
import { contactHref } from "@/content/site";
import type { FaqItem } from "@/content/faqs";

// FAQ (ANIMATION-SPEC R9): rules draw in on reveal; the answer opens with grid-template-rows 0fr → 1fr.
// With `ask`, the heading sits in a sticky side column with a contact link (rental/events layout).
export function Faq({ items, ask, title = "Questions." }: { items: FaqItem[]; ask?: { lead: string; label: string; service: string }; title?: string }) {
  const list = (
    <ul className="m-0 list-none p-0">
      {items.map((it) => (
        <FaqRow key={it.q} {...it} />
      ))}
    </ul>
  );
  return (
    <section data-nav="Questions" className="wrap sec">
      {ask ? (
        <div className="grid gap-[clamp(30px,4vw,48px)] min-[1000px]:grid-cols-[.8fr_1.2fr] min-[1000px]:gap-[6vw]">
          <div className="min-[1000px]:sticky min-[1000px]:top-[calc(var(--nav-h)+60px)] min-[1000px]:self-start">
            <SplitText as="h2" className="d2" text={title} />
            <p className="body-copy fade mt-[22px]" data-reveal="">
              {ask.lead}{" "}
              <Link href={contactHref(ask.service)} className="text-blue-deep underline underline-offset-3">
                {ask.label}
              </Link>
              .
            </p>
          </div>
          {list}
        </div>
      ) : (
        <>
          <div className={HEAD}>
            <SplitText as="h2" className="d2" text={title} />
          </div>
          {list}
        </>
      )}
    </section>
  );
}

function FaqRow({ q, a }: FaqItem) {
  const [open, setOpen] = useState(false);
  return (
    <li className="group/fq relative" data-reveal="" data-open={open || undefined}>
      <span className="rule absolute inset-x-0 top-0" />
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-5 py-6 text-left text-[length:clamp(19px,1.6vw,24px)] font-semibold tracking-[-0.015em] [font-stretch:104%]"
      >
        {q}
        <i className="relative size-10 flex-none rounded-full shadow-[inset_0_0_0_1px_var(--color-line)] [transition:background-color_.4s,transform_.6s_var(--e-out)] before:absolute before:inset-x-[13px] before:top-[19.25px] before:h-[1.5px] before:bg-current before:content-[''] after:absolute after:inset-x-[13px] after:top-[19.25px] after:h-[1.5px] after:bg-current after:[transform:rotate(90deg)] after:content-[''] group-data-open/fq:bg-blue group-data-open/fq:text-ink group-data-open/fq:shadow-none group-data-open/fq:[transform:rotate(45deg)]" />
      </button>
      <div className="grid grid-rows-[0fr] [transition:grid-template-rows_.55s_var(--e-out)] group-data-open/fq:grid-rows-[1fr]">
        <div className="overflow-hidden">
          <p className="m-0 max-w-[42em] pr-14 pb-[26px] text-stone">{a}</p>
        </div>
      </div>
    </li>
  );
}
