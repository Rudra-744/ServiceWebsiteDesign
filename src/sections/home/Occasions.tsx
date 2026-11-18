"use client";
import { useRef } from "react";
import { useNearEffect } from "@/hooks/useNearEffect";
import { SplitText } from "@/components/motion/SplitText";
import { Button } from "@/components/ui/Button";
import { engine } from "@/lib/engine";
import { useScrollScene } from "@/hooks/useScrollScene";
import { OCCASIONS } from "@/content/home";
import { HEAD_SPLIT } from "@/components/ui/layout";

// Occasions (ANIMATION-SPEC H7): the row nearest 0.45×vh is active (current row gets a 24px advantage),
// mouse hover overrides; the sticky cornflower card swaps after 200 ms.
export function Occasions() {
  const list = useRef<HTMLUListElement>(null);
  const S = useRef({ cur: -1, hover: -1, t: 0, set: (i: number) => void i });

  useNearEffect(list, () => {
    const st = S.current, ul = list.current!, rows = [...ul.querySelectorAll<HTMLElement>(".occ-row")];
    const card = ul.closest(".occ-grid")!.querySelector<HTMLElement>(".occ-card-txt")!;
    st.set = (i: number) => {
      if (i === st.cur) return;
      st.cur = i;
      rows.forEach((r, j) => r.classList.toggle("on", j === i));
      const o = OCCASIONS[i];
      card.classList.add("swap");
      clearTimeout(st.t);
      st.t = window.setTimeout(() => {
        card.querySelector("use")!.setAttribute("href", "#" + o[1]);
        card.querySelector(".tag")!.textContent = o[0];
        card.querySelector("h3")!.textContent = o[2];
        card.querySelector(".occ-d")!.textContent = o[3];
        card.classList.remove("swap");
      }, 200);
    };
    if (!engine.FINE) return () => clearTimeout(st.t);
    const offs = rows.map((r, i) => {
      const f = () => {
        st.hover = i;
        st.set(i);
      };
      r.addEventListener("pointerenter", f);
      return () => r.removeEventListener("pointerenter", f);
    });
    const leave = () => (st.hover = -1);
    ul.addEventListener("pointerleave", leave);
    return () => {
      offs.forEach((o) => o());
      ul.removeEventListener("pointerleave", leave);
      clearTimeout(st.t);
    };
  });

  useScrollScene(
    list,
    () => {
      const st = S.current;
      if (st.hover >= 0) return;
      let best = 0, bd = 1e9;
      list.current!.querySelectorAll<HTMLElement>(".occ-row").forEach((r, i) => {
        const b = r.getBoundingClientRect();
        let d = Math.abs(b.top + Math.min(b.height, 120) / 2 - engine.vh * 0.45);
        if (i === st.cur) d -= 24;
        if (d < bd) {
          bd = d;
          best = i;
        }
      });
      st.set(best);
    },
    { type: "view", start: 1.3, end: -0.3 },
  );

  const o0 = OCCASIONS[0];
  return (
    <section data-nav="Occasions" className="sec wrap bg-card" aria-label="Occasions">
      <div className={HEAD_SPLIT}>
        <SplitText as="h2" className="d2" text="Where we show up." />
        <p className="lede fade" data-reveal="">
          From expo floors to wedding lawns, we bring the headsets, the content and the people to run them.
        </p>
      </div>
      <div className="occ-grid grid gap-10 min-[960px]:grid-cols-[1.5fr_1fr] min-[960px]:gap-[5vw]">
        <ul className="occ-list m-0 list-none p-0" ref={list}>
          {OCCASIONS.map(([, , name, desc], i) => (
            // the first row starts open in the HTML, so the section never grows when its setup starts near the viewport
            <li className={`occ-row group/or relative cursor-default py-[clamp(14px,1.6vw,22px)] ${i === 0 ? "on" : ""}`} data-reveal="" key={name}>
              <span className="rule absolute inset-x-0 top-0" />
              <span className="flex items-center gap-[.3em] text-[length:clamp(34px,5vw,84px)] leading-none font-[620] tracking-[-0.035em] text-ink opacity-20 [font-stretch:116%] [transition:opacity_.5s_var(--e-out),transform_.7s_var(--e-out),color_.4s] group-[.on]/or:opacity-100 [@media(hover:hover)_and_(min-width:960px)]:group-[.on]/or:[transform:translateX(.2em)]">
                <i className="mr-[.08em] size-[.26em] flex-none rounded-full bg-blue [transform:scale(0)] [transition:transform_.5s_var(--e-spring)] group-[.on]/or:[transform:none]" />
                {name}
              </span>
              <div className="grid grid-rows-[0fr] [transition:grid-template-rows_.6s_var(--e-out)] group-[.on]/or:grid-rows-[1fr] min-[960px]:hidden">
                <div className="overflow-hidden">
                  <p className="m-0 max-w-[34em] pt-3 text-stone">{desc}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
        <aside className="hidden min-[960px]:sticky min-[960px]:top-[calc(50vh-180px)] min-[960px]:block min-[960px]:self-start">
          <div className="flex min-h-[360px] flex-col justify-between gap-7 rounded-stage bg-blue p-[clamp(28px,3vw,44px)] text-ink">
            <div className="occ-card-txt [transition:opacity_.35s,transform_.5s_var(--e-out)] [&.swap]:opacity-0 [&.swap]:[transform:translateY(10px)]">
              <svg className="size-16" aria-hidden="true">
                <use href={`#${o0[1]}`} />
              </svg>
              <p className="tag mt-[22px] text-[rgba(5,5,5,.62)]!">{o0[0]}</p>
              <h3 className="d3 mt-2">{o0[2]}</h3>
              <p className="occ-d mt-3 text-[rgba(5,5,5,.78)]">{o0[3]}</p>
            </div>
            <Button href="/vr-events" label="Plan your VR event" variant="paper" magnetic />
          </div>
        </aside>
      </div>
    </section>
  );
}
