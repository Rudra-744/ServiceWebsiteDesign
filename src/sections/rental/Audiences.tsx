"use client";
import { type CSSProperties, useEffect, useRef } from "react";
import { SplitText } from "@/components/motion/SplitText";
import { addMeasure, engine } from "@/lib/engine";

// "Who rents from us" rail (ANIMATION-SPEC R8): native scroll-snap; arrows scroll one card + 16 px; mouse drag
// (after 4 px) turns snapping off and follows the pointer, then snaps to the nearest card and cancels the click.
const CARDS = [
  ["i-brief", "Corporate companies", "Team days, training and product launches."],
  ["i-party", "Event organisers", "Experience zones that keep queues moving."],
  ["i-school", "Schools", "Virtual field trips and lessons in 3D."],
  ["i-campus", "Colleges", "Labs, fests and open days."],
  ["i-expo", "Exhibition organisers", "Stands that pull people in."],
  ["i-lamp", "Training providers", "Safe, repeatable practice for real skills."],
];

export function Audiences() {
  const track = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLElement>(null);

  useEffect(() => {
    const tr = track.current!, b = bar.current!;
    const upd = () => {
      const w = tr.clientWidth / Math.max(1, tr.scrollWidth), m = tr.scrollWidth - tr.clientWidth;
      b.style.width = (w * 100).toFixed(2) + "%";
      b.style.transform = `translateX(${m > 0 ? ((tr.scrollLeft / m) * (1 / w - 1) * 100).toFixed(2) : 0}%)`;
    };
    tr.addEventListener("scroll", upd, { passive: true });
    const offM = addMeasure(upd);
    upd();
    let down = false, sx = 0, sl = 0, moved = false;
    const pd = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      down = true;
      moved = false;
      sx = e.clientX;
      sl = tr.scrollLeft;
    };
    const pm = (e: PointerEvent) => {
      if (!down) return;
      const d = e.clientX - sx;
      if (!moved && Math.abs(d) > 4) {
        moved = true;
        tr.classList.add("drag");
      }
      if (moved) tr.scrollLeft = sl - d;
    };
    const pu = () => {
      if (!down) return;
      down = false;
      if (!moved) return;
      const s = tr.firstElementChild!.clientWidth + 16, x = tr.scrollLeft;
      tr.classList.remove("drag");
      tr.scrollLeft = x;
      tr.scrollTo({ left: Math.round(x / s) * s, behavior: "smooth" });
    };
    const click = (e: MouseEvent) => {
      if (!moved) return;
      e.preventDefault();
      e.stopPropagation();
      moved = false;
    };
    if (engine.FINE) {
      tr.addEventListener("pointerdown", pd);
      addEventListener("pointermove", pm);
      addEventListener("pointerup", pu);
      tr.addEventListener("click", click, true);
    }
    return () => {
      tr.removeEventListener("scroll", upd);
      offM();
      tr.removeEventListener("pointerdown", pd);
      removeEventListener("pointermove", pm);
      removeEventListener("pointerup", pu);
      tr.removeEventListener("click", click, true);
    };
  }, []);

  const go = (dir: number) => {
    const tr = track.current!;
    tr.scrollBy({ left: dir * (tr.firstElementChild!.clientWidth + 16), behavior: engine.RM ? "auto" : "smooth" });
  };

  return (
    <section data-nav="Ideal for" className="sec-tight">
      <div className="wrap mb-[clamp(30px,4vw,56px)] flex items-end justify-between gap-5">
        <SplitText as="h2" className="d2" text="Who rents from us." />
        <div className="flex flex-none gap-[10px]">
          {[-1, 1].map((d) => (
            <button key={d} type="button" className={NAV_BTN} aria-label={d < 0 ? "Previous" : "Next"} onClick={() => go(d)}>
              <svg viewBox="0 0 24 24">
                <path d={d < 0 ? "M19 12H5M11 6l-6 6 6 6" : "M5 12h14M13 6l6 6-6 6"} />
              </svg>
            </button>
          ))}
        </div>
      </div>
      <div ref={track} data-reveal="" data-cursor="Drag" className="flex cursor-grab snap-x snap-mandatory gap-4 overflow-x-auto px-(--pad) [scroll-padding-inline:var(--pad)] [scrollbar-width:none] select-none [&.drag]:cursor-grabbing [&.drag]:snap-none [&::-webkit-scrollbar]:hidden">
        {CARDS.map(([ic, t, d], i) => (
          <article key={t} style={{ "--i": i } as CSSProperties} className={CARD}>
            <span className="grid size-[60px] place-items-center rounded-full bg-paper [transition:transform_.7s_var(--e-spring)] group-hover/ri:[transform:rotate(-12deg)_scale(1.08)]">
              <svg className="size-7">
                <use href={`#${ic}`} />
              </svg>
            </span>
            <div>
              <h3 className="d4">{t}</h3>
              <p className="mt-2 mb-0 text-[15.5px] text-stone transition-colors duration-500 group-hover/ri:text-[rgba(5,5,5,.78)]">{d}</p>
            </div>
          </article>
        ))}
      </div>
      <div className="wrap">
        <div className="relative mt-7 h-[2px] overflow-hidden bg-line" aria-hidden="true">
          <i ref={bar} className="absolute inset-y-0 left-0 bg-ink [transition:transform_.15s_linear]" />
        </div>
      </div>
    </section>
  );
}

// pop's transition is replaced in motion mode, so the hover background ease is merged into it
const CARD =
  "ri-card group/ri pop flex aspect-[3/3.7] w-[clamp(250px,25vw,350px)] flex-none snap-start flex-col justify-between rounded-card bg-card p-[clamp(20px,2vw,28px)] [transition:background-color_.5s_var(--e-out)] motion:[transition:opacity_.45s_var(--e-out)_calc(var(--d,0s)+var(--i,0)*65ms),transform_.8s_var(--e-spring)_calc(var(--d,0s)+var(--i,0)*65ms),background-color_.5s_var(--e-out)] hover:bg-blue max-[640px]:w-[74vw]";
const NAV_BTN =
  "grid size-[52px] place-items-center rounded-full shadow-[inset_0_0_0_1.5px_var(--color-line)] [transition:background-color_.35s,color_.35s,box-shadow_.35s] hover:bg-ink hover:text-paper hover:shadow-none max-[640px]:size-11 [&_svg]:size-[22px] [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:[stroke-width:1.8] [&_svg]:[stroke-linecap:round] [&_svg]:[stroke-linejoin:round]";
