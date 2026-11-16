"use client";
import Image from "next/image";
import Link from "next/link";
import { type CSSProperties, useEffect, useRef } from "react";
import { SplitText } from "@/components/motion/SplitText";
import { addMeasure, engine } from "@/lib/engine";
import { clamp } from "@/lib/motion";
import { useScrollScene } from "@/hooks/useScrollScene";
import { useStackScene } from "@/hooks/useStackScene";
import { SERVICES } from "@/content/home";
import { contactHref } from "@/content/site";

// Services (ANIMATION-SPEC H6): desktop = pinned horizontal track (section height = overflow + vh, image parallax);
// phone (<820px) = sticky stacked cards, the card behind scales 1 − q×0.06 and its shade fades in.
export function Services() {
  const sec = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const dist = useRef(0);

  useEffect(
    () =>
      addMeasure(() => {
        const s = sec.current!, t = track.current!;
        if (innerWidth >= 820) {
          s.style.height = "";
          t.style.transform = "none";
          dist.current = Math.max(0, t.scrollWidth - s.clientWidth);
          s.style.height = dist.current + innerHeight + "px";
        } else {
          s.style.height = "";
          t.style.transform = "";
          dist.current = 0;
          t.querySelectorAll<HTMLElement>(".svc-media img").forEach((i) => (i.style.transform = ""));
        }
      }),
    [],
  );

  useScrollScene(sec, (p) => {
    if (innerWidth < 820) return;
    const t = track.current!;
    t.style.transform = `translate3d(${(-p * dist.current).toFixed(1)}px,0,0)`;
    sec.current!.querySelector<HTMLElement>(".svc-bar i")!.style.transform = `scaleX(${p.toFixed(4)})`;
    t.querySelectorAll<HTMLElement>(".svc-media img").forEach((img) => {
      const r = img.parentElement!.getBoundingClientRect();
      const o = clamp((r.left + r.width / 2 - engine.vw / 2) / engine.vw, -1.2, 1.2);
      img.style.transform = `translate3d(${(o * -7).toFixed(2)}%,0,0)`;
    });
  });
  useStackScene(track, ".svc-panel", ".svc-shade", true);

  return (
    <section data-nav="Services" className="svc" aria-label="Services" ref={sec}>
      <div className="svc-pin">
        <div className="svc-track" ref={track}>
          <div className="svc-intro">
            <div>
              <SplitText as="h2" className="d2" text="Five ways to bring people inside." />
              <p className="lede fade" data-reveal="">
                Rent the hardware, run the event, film the place, show the home, manage the fleet. Pick one, or let us handle all five.
              </p>
            </div>
            <Link href={contactHref("Not sure yet")} className="link">
              Talk to us about your project
            </Link>
          </div>
          {SERVICES.map((s, k) => (
            <article className={`svc-panel${s.img ? "" : " blue"}`} style={{ "--k": k } as CSSProperties} data-cursor="View" key={s.title}>
              <div className="svc-media">
                {s.img ? (
                  <Image src={s.img} alt={s.alt!} fill sizes="(max-width: 819px) 90vw, 40vw" style={s.pos ? { objectPosition: s.pos } : undefined} />
                ) : (
                  <div className="mini-console">
                    {Array.from({ length: 8 }, (_, i) => (
                      <span key={i} style={{ "--i": i } as CSSProperties} />
                    ))}
                  </div>
                )}
              </div>
              <div className="svc-body">
                <h3 className="d3">{s.title}</h3>
                <p className="body">{s.body}</p>
                <Link className="link" href={s.href}>
                  {s.link}
                </Link>
              </div>
              <span className="svc-shade" />
            </article>
          ))}
        </div>
        <div className="svc-bar">
          <i />
        </div>
      </div>
    </section>
  );
}
