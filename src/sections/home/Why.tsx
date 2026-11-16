import { SplitText } from "@/components/motion/SplitText";
import { HEAD } from "@/components/ui/layout";
import { WHY } from "@/content/home";

// Why Cyphon (ANIMATION-SPEC H12): rules draw in on reveal; hover slides a cornflower fill up behind the row.
export function Why() {
  return (
    <section data-nav="Why Cyphon" className="sec wrap" aria-label="Why Cyphon">
      <div className={HEAD}>
        <SplitText as="h2" className="d2" text="Why teams choose Cyphon." />
      </div>
      <ul className="m-0 list-none p-0">
        {WHY.map(([t, d]) => (
          <li
            className="group/why relative isolate grid gap-[10px] overflow-hidden px-[clamp(0px,1.4vw,24px)] py-[clamp(22px,2.6vw,36px)] before:absolute before:inset-x-0 before:top-px before:bottom-0 before:-z-1 before:bg-blue before:[transform:translateY(101%)] before:[transition:transform_.6s_var(--e-out)] before:content-[''] hover:before:[transform:none] min-[820px]:grid-cols-[1.2fr_1fr] min-[820px]:items-baseline min-[820px]:gap-[4vw]"
            data-reveal=""
            key={t}
          >
            <span className="rule absolute inset-x-0 top-0" />
            <h3 className="d3 rv transition-colors duration-400 group-hover/why:text-ink motion:[transition:opacity_1s_var(--e-out)_var(--d,0s),transform_1.2s_var(--e-out)_var(--d,0s),color_.4s]">{t}</h3>
            <p className="fade m-0 text-stone transition-colors duration-400 group-hover/why:text-ink motion:[transition:opacity_1.2s_var(--e-out)_var(--d,.15s),color_.4s]">{d}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
