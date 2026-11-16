import { SplitText } from "@/components/motion/SplitText";
import { HEAD_SPLIT } from "@/components/ui/layout";

// Six benefits (ANIMATION-SPEC RE4): each row's rule draws in on reveal and its tick draws itself (dashoffset 24 → 0).
const ITEMS = [
  "Showcase properties before construction is complete.",
  "Help buyers understand room layouts and spatial arrangements.",
  "Present interior designs and proposed finishes visually.",
  "Improve customer engagement during property sales.",
  "Create an interactive experience for launch events.",
  "Support property marketing and sales presentations.",
];

export function Benefits() {
  return (
    <section data-nav="Why developers" className="wrap sec">
      <div className={HEAD_SPLIT}>
        <SplitText as="h2" className="d2" text="Why developers use it." />
        <p className="lede fade" data-reveal="">
          Buyers understand a space faster when they can stand in it.
        </p>
      </div>
      <ul className="m-0 grid list-none p-0">
        {ITEMS.map((t) => (
          <li key={t} data-reveal="" className="relative grid grid-cols-[40px_1fr] items-center gap-[14px] py-5">
            <span className="rule absolute inset-x-0 top-0" />
            <svg className="size-8" viewBox="0 0 32 32" aria-hidden="true">
              <circle className="fill-blue" cx="16" cy="16" r="16" />
              <path
                className="fill-none stroke-ink [stroke-dasharray:24] [stroke-linecap:round] [stroke-linejoin:round] [stroke-width:2.6] motion:[stroke-dashoffset:24] motion:[transition:stroke-dashoffset_.7s_var(--e-out)_calc(var(--d,0s)+.25s)] in:[stroke-dashoffset:0]"
                d="M9.5 16.5l4.2 4.2 8.8-9"
              />
            </svg>
            <b className="d4 rv text-[length:clamp(19px,1.6vw,24px)]">{t}</b>
          </li>
        ))}
      </ul>
    </section>
  );
}
