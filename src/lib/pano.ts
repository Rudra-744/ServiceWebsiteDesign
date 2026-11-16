import { rnd } from "./motion";

/**
 * Procedural 360° city strip (reference `panoSVG`, 2400 × 600 viewBox).
 * `planet: true` = city only (no ground, sun, compass or labels), used for the tiny-planet texture.
 * Deterministic (rnd), so server and client produce the same markup.
 */
export function panoSVG(o: { planet?: boolean } = {}) {
  const W = 2400, H = 600, G = 468;
  let s = `<svg viewBox="0 0 ${W} ${H}" aria-hidden="true"><rect width="${W}" height="${o.planet ? G : H}" fill="${o.planet ? "#FFFFFF" : "#F5F5F7"}"/>`;
  let d = `M0 ${G}`;
  for (let x = 0; x <= W; x += 40) {
    const y = G - 70 - Math.sin((x / W) * Math.PI * 6) * 36 - Math.sin((x / W) * Math.PI * 14 + 1) * 16;
    d += ` L${x} ${y.toFixed(1)}`;
  }
  s += `<path d="${d} L${W} ${G}Z" fill="#E4ECFF"/>`;
  if (!o.planet) s += `<circle cx="1560" cy="150" r="46" fill="#548CFF"/>`;
  const marks = [[160, 280], [700, 260], [1210, 240], [1700, 200], [2120, 140]];
  const busy = (x: number) => marks.some(([a, w]) => x > a - 40 && x < a + w + 40);
  let i = 0;
  for (let x = 30; x < W - 140; ) {
    const w = 60 + rnd(i) * 80, h = 70 + rnd(i + 3) * 170;
    if (!busy(x) && !busy(x + w)) {
      const fills = ["#FFFFFF", "#E4ECFF", "#FFFFFF", "#548CFF"];
      const f = fills[Math.floor(rnd(i + 9) * fills.length)];
      s += `<rect x="${x.toFixed(0)}" y="${(G - h).toFixed(0)}" width="${w.toFixed(0)}" height="${h.toFixed(0)}" fill="${f}" stroke="#1A1A1F" stroke-width="2"/>`;
      const wc = f === "#548CFF" ? "#FFFFFF" : "#1A1A1F";
      for (let wy = G - h + 16; wy < G - 22; wy += 26)
        for (let wx = x + 12; wx < x + w - 14; wx += 20)
          s += `<rect x="${wx.toFixed(0)}" y="${wy.toFixed(0)}" width="8" height="12" fill="${wc}" opacity="${f === "#548CFF" ? 0.9 : 0.7}"/>`;
      if (rnd(i + 5) > 0.5) {
        const tx = x + w + 16;
        s += `<path d="M${tx} ${G}V${G - 34}" stroke="#1A1A1F" stroke-width="3"/><circle cx="${tx}" cy="${G - 44}" r="${(14 + rnd(i) * 8).toFixed(0)}" fill="#1A1A1F"/>`;
      }
      x += w + 36 + rnd(i + 11) * 40;
    } else x += 30;
    i++;
  }
  // factory
  s += `<path d="M160 ${G}V${G - 150}l50-36v36l50-36v36l50-36v36l50-36v36h80V${G}Z" fill="#FFFFFF" stroke="#1A1A1F" stroke-width="2"/><rect x="390" y="${G - 250}" width="26" height="100" fill="#1A1A1F"/>`;
  for (let k = 0; k < 7; k++) s += `<rect x="${180 + k * 38}" y="${G - 100}" width="22" height="40" fill="#548CFF"/>`;
  // campus
  s += `<path d="M700 ${G - 190}L830 ${G - 250}L960 ${G - 190}Z" fill="#FFFFFF" stroke="#1A1A1F" stroke-width="2"/><rect x="700" y="${G - 190}" width="260" height="16" fill="#FFFFFF" stroke="#1A1A1F" stroke-width="2"/>`;
  for (let k = 0; k < 6; k++) s += `<rect x="${714 + k * 44}" y="${G - 174}" width="16" height="152" fill="#FFFFFF" stroke="#1A1A1F" stroke-width="2"/>`;
  s += `<rect x="690" y="${G - 22}" width="280" height="22" fill="#E4ECFF" stroke="#1A1A1F" stroke-width="2"/>`;
  // heritage dome
  s += `<rect x="1210" y="${G - 120}" width="240" height="120" fill="#FFFFFF" stroke="#1A1A1F" stroke-width="2"/><path d="M1250 ${G - 120}a80 80 0 0 1 160 0z" fill="#548CFF" stroke="#1A1A1F" stroke-width="2"/><path d="M1330 ${G - 200}v-40" stroke="#1A1A1F" stroke-width="3"/><circle cx="1330" cy="${G - 244}" r="6" fill="#1A1A1F"/>`;
  for (let k = 0; k < 4; k++) s += `<path d="M${1236 + k * 56} ${G}v-58a14 14 0 0 1 28 0v58" fill="#1A1A1F"/>`;
  // hospital
  s += `<rect x="1700" y="${G - 300}" width="200" height="300" fill="#FFFFFF" stroke="#1A1A1F" stroke-width="2"/><rect x="1776" y="${G - 340}" width="48" height="48" rx="6" fill="#548CFF"/><path d="M1800 ${G - 332}v32M1784 ${G - 316}h32" stroke="#FFFFFF" stroke-width="7"/>`;
  for (let wy = G - 270; wy < G - 30; wy += 34) for (let wx = 1716; wx < 1886; wx += 30) s += `<rect x="${wx}" y="${wy}" width="16" height="18" fill="#C9DAFF"/>`;
  // tower
  s += `<rect x="2120" y="${G - 380}" width="140" height="380" fill="#548CFF" stroke="#1A1A1F" stroke-width="2"/>`;
  for (let wy = G - 360; wy < G - 20; wy += 30) s += `<rect x="2112" y="${wy}" width="156" height="5" fill="#1A1A1F"/><rect x="2134" y="${wy + 9}" width="112" height="12" fill="#FFFFFF" opacity=".85"/>`;
  if (o.planet) return s + "</svg>";
  // ground + compass
  s += `<rect y="${G}" width="${W}" height="${H - G}" fill="#EDEDF0"/><path d="M0 ${G}H${W}" stroke="#1A1A1F" stroke-width="2"/>`;
  for (let a = 0; a < 360; a += 5) {
    const x = (a / 360) * W, big = a % 90 === 0, mid = a % 30 === 0;
    s += `<path d="M${x.toFixed(1)} ${G + 16}v${big ? 30 : mid ? 18 : 8}" stroke="#1A1A1F" stroke-width="${big ? 2.5 : 1.2}"/>`;
    if (big) s += `<text x="${(x + (a === 0 ? 8 : 0)).toFixed(1)}" y="${G + 82}" font-family="Archivo,Inter,sans-serif" font-weight="700" font-size="26" fill="#1A1A1F" text-anchor="${a === 0 ? "start" : "middle"}">${["N", "E", "S", "W"][a / 90]}</text>`;
    else if (mid) s += `<text x="${x.toFixed(1)}" y="${G + 64}" font-family="Archivo,Inter,sans-serif" font-size="14" fill="#6B6B72" text-anchor="middle">${a}°</text>`;
  }
  const hot: [number, number, string][] = [[300, G - 270, "Factory floor"], [830, G - 280, "Campus"], [1330, G - 280, "Heritage site"], [1800, G - 370, "Hospital wing"], [2190, G - 410, "Sample flat"]];
  hot.forEach(([x, y, t]) => {
    const tw = t.length * 10.5 + 30;
    s += `<g><circle cx="${x}" cy="${y}" r="20" fill="#548CFF" opacity=".18"/><circle cx="${x}" cy="${y}" r="9" fill="#548CFF" stroke="#FFFFFF" stroke-width="3"/><rect x="${x - tw / 2}" y="${y - 62}" width="${tw}" height="34" rx="17" fill="#1A1A1F"/><text x="${x}" y="${y - 39}" font-family="Archivo,Inter,sans-serif" font-weight="600" font-size="17" fill="#FFFFFF" text-anchor="middle">${t}</text></g>`;
  });
  return s + "</svg>";
}
