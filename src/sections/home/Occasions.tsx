"use client";
import { useEffect, useRef } from "react";
import { SplitText } from "@/components/motion/SplitText";
import { Button } from "@/components/ui/Button";
import { engine } from "@/lib/engine";
import { useScrollScene } from "@/hooks/useScrollScene";
import { OCCASIONS } from "@/content/home";

// Occasions (ANIMATION-SPEC H7): the row nearest 0.45×vh is active (current row gets a 24px advantage),
// mouse hover overrides; the sticky cornflower card swaps after 200 ms.
export function Occasions() {
  const list = useRef<HTMLUListElement>(null);
  const S = useRef({ cur: -1, hover: -1, t: 0, set: (i: number) => void i });

  useEffect(() => {
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
  }, []);

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
    <section data-nav="Occasions" className="sec wrap alt" aria-label="Occasions">
      <div className="head split">
        <SplitText as="h2" className="d2" text="Where we show up." />
        <p className="lede fade" data-reveal="">
          From expo floors to wedding lawns, we bring the headsets, the content and the people to run them.
        </p>
      </div>
      <div className="occ-grid">
        <ul className="occ-list" ref={list}>
          {OCCASIONS.map(([, , name, desc]) => (
            <li className="occ-row" data-reveal="" key={name}>
              <span className="rule" />
              <span className="occ-name">
                <i />
                {name}
              </span>
              <div className="occ-desc">
                <div>
                  <p>{desc}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
        <aside className="occ-side">
          <div className="occ-card">
            <div className="occ-card-txt">
              <svg className="occ-icon" aria-hidden="true">
                <use href={`#${o0[1]}`} />
              </svg>
              <p className="tag" style={{ marginTop: 22 }}>
                {o0[0]}
              </p>
              <h3 className="d3" style={{ marginTop: 8 }}>
                {o0[2]}
              </h3>
              <p className="occ-d" style={{ marginTop: 12 }}>
                {o0[3]}
              </p>
            </div>
            <Button href="/vr-events" label="Plan your VR event" variant="paper" magnetic />
          </div>
        </aside>
      </div>
    </section>
  );
}
