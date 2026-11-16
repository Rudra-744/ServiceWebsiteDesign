import { SplitText } from "@/components/motion/SplitText";
import { WHY } from "@/content/home";

// Why Cyphon (ANIMATION-SPEC H12): rules draw in on reveal; hover slides a cornflower fill up behind the row.
export function Why() {
  return (
    <section data-nav="Why Cyphon" className="sec wrap" aria-label="Why Cyphon">
      <div className="head">
        <SplitText as="h2" className="d2" text="Why teams choose Cyphon." />
      </div>
      <ul className="why-list">
        {WHY.map(([t, d]) => (
          <li className="why-row" data-reveal="" key={t}>
            <span className="rule" />
            <h3 className="d3 rv">{t}</h3>
            <p className="fade">{d}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
