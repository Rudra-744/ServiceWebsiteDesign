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
    <section ref={sec} data-nav="Services" className="svc relative max-[820px]:h-auto!" aria-label="Services">
      <div className="sticky top-0 flex h-svh flex-col justify-center overflow-hidden max-[820px]:static max-[820px]:block max-[820px]:h-auto max-[820px]:overflow-visible">
        <div ref={track} className="svc-track flex w-max items-stretch gap-[clamp(16px,1.6vw,26px)] px-(--pad) will-change-transform max-[820px]:w-auto max-[820px]:flex-col max-[820px]:gap-0 max-[820px]:[transform:none]!">
          <div className="flex w-[min(40vw,560px)] flex-col justify-between py-2 pr-[2vw] max-[820px]:w-auto max-[820px]:p-0 max-[820px]:pb-9">
            <div>
              <SplitText as="h2" className="d2 mb-6" text="Five ways to bring people inside." />
              <p className="lede fade" data-reveal="">
                Rent the hardware, run the event, film the place, show the home, manage the fleet. Pick one, or let us handle all five.
              </p>
            </div>
            <Link href={contactHref("Not sure yet")} className="link">
              Talk to us about your project
            </Link>
          </div>
          {SERVICES.map((s, k) => (
            <article
              key={s.title}
              data-cursor="View"
              style={{ "--k": k } as CSSProperties}
              className={`svc-panel relative flex h-[min(74vh,700px)] w-[clamp(320px,33vw,520px)] origin-[50%_0] flex-col overflow-hidden rounded-stage max-[820px]:sticky max-[820px]:top-[calc(var(--nav-h)+24px+var(--k)*10px)] max-[820px]:mb-5 max-[820px]:h-[min(74svh,600px)] max-[820px]:w-auto ${s.img ? "bg-card" : "bg-blue text-ink"}`}
            >
              <div className={`svc-media relative mx-[10px] mt-[10px] flex-1 overflow-hidden rounded-[calc(var(--radius-stage)-8px)] ${s.img ? "bg-render" : "bg-[#7aa5ff]"}`}>
                {s.img ? (
                  <Image
                    className="-inset-x-[12%]! -inset-y-[4%]! h-[108%]! w-[124%]! max-w-none object-cover will-change-transform"
                    src={s.img}
                    alt={s.alt!}
                    fill
                    sizes="(max-width: 819px) 110vw, 42vw"
                    style={s.pos ? { objectPosition: s.pos } : undefined}
                  />
                ) : (
                  <div className="absolute inset-0 grid grid-cols-4 content-center gap-2 px-[12%] py-[18%]">
                    {Array.from({ length: 8 }, (_, i) => (
                      <span
                        key={i}
                        style={{ "--i": i } as CSSProperties}
                        className="relative aspect-[1.2] overflow-hidden rounded-[10px] bg-[rgba(255,255,255,.62)] after:absolute after:inset-x-[10%] after:bottom-[14%] after:h-[3px] after:origin-left after:rounded-[2px] after:bg-ink after:[animation:mini_3s_linear_calc(var(--i)*-.37s)_infinite] after:content-['']"
                      />
                    ))}
                  </div>
                )}
              </div>
              <div className="grid gap-[10px] px-[26px] pt-[22px] pb-[26px]">
                <h3 className="d3">{s.title}</h3>
                <p className={`m-0 max-w-[36em] text-[16px] ${s.img ? "text-stone" : "text-[rgba(5,5,5,.75)]"}`}>{s.body}</p>
                <Link className="link mt-[6px] justify-self-start" href={s.href}>
                  {s.link}
                </Link>
              </div>
              <span className="svc-shade pointer-events-none absolute inset-0 rounded-[inherit] bg-ink opacity-0" />
            </article>
          ))}
        </div>
        <div className="svc-bar relative mx-(--pad) mt-[clamp(22px,3.5vh,40px)] h-[2px] bg-line max-[820px]:hidden">
          <i className="absolute inset-0 origin-left bg-blue [transform:scaleX(0)]" />
        </div>
      </div>
    </section>
  );
}
