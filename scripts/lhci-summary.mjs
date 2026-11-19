// Prints the median Lighthouse scores per URL from the reports `lhci autorun` wrote to lhci-reports/,
// as workflow notices (readable without downloading the artifact) and in the job summary.
import { appendFileSync, readdirSync, readFileSync } from "node:fs";

const DIR = "lhci-reports";
const med = (a) => [...a].sort((x, y) => x - y)[Math.floor(a.length / 2)];
const byUrl = new Map();
for (const f of readdirSync(DIR).filter((f) => /^lhr-.*\.json$/.test(f))) {
  const r = JSON.parse(readFileSync(`${DIR}/${f}`, "utf8"));
  const key = new URL(r.finalDisplayedUrl ?? r.finalUrl).pathname;
  const c = r.categories, a = r.audits;
  (byUrl.get(key) ?? byUrl.set(key, []).get(key)).push({
    perf: c.performance.score * 100, a11y: c.accessibility.score * 100, bp: c["best-practices"].score * 100, seo: c.seo.score * 100,
    tbt: a["total-blocking-time"].numericValue, lcp: a["largest-contentful-paint"].numericValue, cls: a["cumulative-layout-shift"].numericValue,
  });
}
let md = "| page | runs | perf | a11y | best practices | SEO | TBT ms | LCP s | CLS |\n|---|---|---|---|---|---|---|---|---|\n";
for (const [path, rs] of byUrl) {
  const m = (k) => med(rs.map((r) => r[k]));
  const row = `${path} | ${rs.length} | ${Math.round(m("perf"))} | ${Math.round(m("a11y"))} | ${Math.round(m("bp"))} | ${Math.round(m("seo"))} | ${Math.round(m("tbt"))} | ${(m("lcp") / 1000).toFixed(1)} | ${m("cls").toFixed(3)}`;
  md += `| ${row} |\n`;
  console.log(`::notice title=Lighthouse mobile median::${row}`);
}
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, `### Lighthouse mobile (median)\n\n${md}`);
