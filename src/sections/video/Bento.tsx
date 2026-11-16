import type { CSSProperties } from "react";
import { SplitText } from "@/components/motion/SplitText";
import { HEAD_SPLIT } from "@/components/ui/layout";

// "What we film" bento (ANIMATION-SPEC V2): 1 → 2 (700 px) → 4 columns (1100 px); cells clip in from different sides;
// hover turns the icon −8° and scales it 1.08. One cell cornflower, one soft blue.
type Cell = { ic: string; t: string; d: string; big?: boolean; span?: string; tone?: "blue" | "soft"; from: string; delay?: string; note?: string };
const CELLS: Cell[] = [
  { ic: "i-factory", t: "Company tours", d: "Showcase offices, factories, production facilities and workplaces.", big: true, span: "min-[1100px]:col-span-2", from: "clip-l" },
  { ic: "i-campus", t: "College & university tours", d: "Give prospective students a virtual campus experience.", from: "clip-t", delay: ".08s" },
  { ic: "i-mountain", t: "Tourist destinations", d: "Immersive previews of destinations, attractions and travel experiences.", big: true, span: "min-[1100px]:row-span-2", tone: "blue", from: "clip-r", delay: ".16s" },
  { ic: "i-lock", t: "Restricted area visits", d: "Virtual visits to places that are difficult, unsafe or restricted to access.", tone: "soft", from: "clip-c", note: "Subject to filming permissions" },
  { ic: "i-hospital", t: "Hospital tours", d: "Help patients and visitors explore hospital facilities.", from: "clip-l", delay: ".08s" },
  { ic: "i-cam", t: "Events & functions", d: "Weddings, celebrations, corporate events and special occasions in 360°.", from: "clip-t", delay: ".16s" },
  { ic: "i-house", t: "Real estate & property tours", d: "Present properties through immersive virtual walkthroughs.", big: true, span: "min-[1100px]:col-span-2", from: "clip-r" },
  { ic: "i-sparkle", t: "Custom 360° projects", d: "Tailored production for your business or industry.", span: "min-[1100px]:col-span-2", from: "clip-c", delay: ".08s" },
];
const TONE = { blue: ["bg-blue text-ink", "text-ink", "text-[rgba(5,5,5,.75)]"], soft: ["bg-blue-soft text-ink", "text-blue-deep", "text-stone"], none: ["bg-card", "text-blue-deep", "text-stone"] };

export function Bento() {
  return (
    <section data-nav="What we film" className="wrap sec">
      <div className={HEAD_SPLIT}>
        <SplitText as="h2" className="d2" text="What we film." />
        <p className="lede fade" data-reveal="">
          Tours, places and moments that are hard to visit in person, or worth seeing again.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-[14px] min-[700px]:grid-cols-2 min-[1100px]:auto-rows-[minmax(230px,auto)] min-[1100px]:grid-cols-4">
        {CELLS.map((c) => {
          const [bg, ic, p] = TONE[c.tone ?? "none"];
          return (
            <div
              key={c.t}
              data-reveal=""
              style={c.delay ? ({ "--d": c.delay } as CSSProperties) : undefined}
              className={`bcell group/bc clip ${c.from} relative flex min-h-[220px] flex-col justify-between gap-9 overflow-hidden rounded-card p-[26px] ${bg} ${c.span ?? ""}`}
            >
              <svg className={`size-12 [transition:transform_.7s_var(--e-out)] group-hover/bc:[transform:rotate(-8deg)_scale(1.08)] ${ic}`}>
                <use href={`#${c.ic}`} />
              </svg>
              <div>
                <h3 className={c.big ? "d3" : "d4"}>{c.t}</h3>
                <p className={`mt-2 mb-0 text-[16px] ${p}`}>{c.d}</p>
                {c.note && <small className="mt-[10px] block text-[13px] opacity-75">{c.note}</small>}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
