import { E, lerp, map } from "./motion";
import { TOUR_PATH, TOUR_SI } from "@/content/tour";

// Camera path along the flat (Catmull-Rom through TOUR_PATH) and the scroll timeline (ANIMATION-SPEC H9 steps 2–3).
const cr = (a: number, b: number, c: number, d: number, t: number) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t * t + (-a + 3 * b - 3 * c + d) * t * t * t);

export function tourPathAt(u: number) {
  const P = TOUR_PATH, n = P.length, i = Math.min(n - 2, Math.max(0, Math.floor(u))), t = u - i;
  const a = P[Math.max(0, i - 1)], b = P[i], c = P[i + 1], d = P[Math.min(n - 1, i + 2)];
  return { x: cr(a.x, b.x, c.x, d.x, t), z: cr(a.z, b.z, c.z, d.z, t), yaw: cr(a.yaw, b.yaw, c.yaw, d.yaw, t) };
}

/** each stop dwells 0.1 of the scroll, each walk takes 0.2, eased in-out */
export function tourTimeline(p: number) {
  const segs = [[0, 0.1, 0, 0], [0.1, 0.3, 0, 1], [0.3, 0.4, 1, 1], [0.4, 0.6, 1, 2], [0.6, 0.7, 2, 2], [0.7, 0.9, 2, 3], [0.9, 1.0001, 3, 3]];
  for (const [a, b, s0, s1] of segs)
    if (p < b) {
      const t = E.inOut(map(p, a, b));
      return { u: lerp(TOUR_SI[s0], TOUR_SI[s1], t), stop: t < 0.5 ? s0 : s1, walking: s0 !== s1 && t > 0 && t < 1 };
    }
  return { u: TOUR_SI[3], stop: 3, walking: false };
}
