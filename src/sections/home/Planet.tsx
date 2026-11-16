"use client";
import { useRef } from "react";
import { SplitText } from "@/components/motion/SplitText";
import { map } from "@/lib/motion";
import { panoSVG } from "@/lib/pano";
import { useScrollScene } from "@/hooks/useScrollScene";
import { PLANET_CAPS, PLANET_HOTS } from "@/content/home";

// 360° tiny planet (ANIMATION-SPEC H10), pinned 560svh (500svh phone).
// Stage 3: heading fade, captions and the "inside" HUD follow scroll; a flat panorama strip stands in for the view.
// Stage 5: the WebGL projection (planet → panorama → inside), the camera icon, drag/tilt and the building pins.
const PANO = panoSVG();
const CAP_RANGES = [[0.12, 0.26], [0.34, 0.5], [0.56, 0.7]];

export function Planet() {
  const sec = useRef<HTMLElement>(null);
  useScrollScene(sec, (p) => {
    const root = sec.current!, head = root.querySelector<HTMLElement>(".pl-head")!, narrow = innerWidth < 900;
    const ho = 1 - map(p, 0.22, 0.32);
    head.style.opacity = ho.toFixed(3);
    head.style.transform = `translate3d(0,${((1 - ho) * -40).toFixed(1)}px,0)`;
    head.style.visibility = ho <= 0 ? "hidden" : "";
    root.querySelectorAll(".pl-cap").forEach((c, i) => c.classList.toggle("on", !(narrow && i === 0) && p >= CAP_RANGES[i][0] && p < CAP_RANGES[i][1]));
    root.classList.toggle("inside", p > 0.66);
  });

  return (
    <section data-nav="360° video" className="planet" data-planet="" aria-label="360° video" ref={sec}>
      <div className="pl-stage">
        <div className="pl-fallback" aria-hidden="true" dangerouslySetInnerHTML={{ __html: PANO + PANO }} />
        <canvas className="pl-cv" aria-hidden="true" />
        <svg className="pl-cam" viewBox="0 0 40 64" aria-hidden="true" style={{ opacity: 0 }}>
          <rect x="8" y="2" width="24" height="40" rx="12" fill="#050505" />
          <circle cx="20" cy="16" r="7" fill="#548CFF" />
          <circle cx="20" cy="16" r="2.6" fill="#fff" />
          <rect x="18" y="42" width="4" height="20" fill="#050505" />
        </svg>
        <div className="pl-head">
          <SplitText as="h2" className="d2" text="Every angle, captured." />
          <p className="lede fade" data-reveal="">
            Professional 360° video that lets viewers look in any direction — in a headset or on their phone.
          </p>
        </div>
        <div className="pl-caps" aria-hidden="true">
          {PLANET_CAPS.map((c) => (
            <p className="pl-cap" key={c}>
              {c}
            </p>
          ))}
        </div>
        <div className="pl-hots">
          {PLANET_HOTS.map(([x, ic, t, d]) => (
            <div className="pl-hot" data-x={x} key={t}>
              <i />
              <span className="pl-card">
                <b>
                  <svg aria-hidden="true">
                    <use href={`#${ic}`} />
                  </svg>
                  {t}
                </b>
                <small>{d}</small>
              </span>
            </div>
          ))}
        </div>
        <div className="pl-hud">
          <span className="pl-note">Drag to look around</span>
          <button className="pl-tilt" type="button">
            Tilt to look around
          </button>
          <span className="pl-deg num">0°</span>
        </div>
      </div>
    </section>
  );
}
