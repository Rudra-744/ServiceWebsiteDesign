// Diagnostic (CI only): runs Lighthouse's own LCP estimator on a saved gather and prints which requests/tasks decide the simulated LCP.
// usage: node scripts/lcp-nodes.mjs <gather dir> <label>   (LH_ROOT = file URL of the lighthouse package, default node_modules)
import fs from "node:fs";
const L = process.env.LH_ROOT ?? new URL("../node_modules/lighthouse", import.meta.url).href;
const { LanternLargestContentfulPaint: LCP } = await import(L + "/core/computed/metrics/lantern-largest-contentful-paint.js");
const { defaultSettings } = await import(L + "/core/config/constants.js");
const [dir, label] = process.argv.slice(2);
const read = (f) => JSON.parse(fs.readFileSync(`${dir}/${f}`, "utf8"));
const trace = read("defaultPass.trace.json"), devtoolsLog = read("defaultPass.devtoolslog.json"), art = read("artifacts.json");
const settings = { ...defaultSettings, throttlingMethod: "simulate", formFactor: "mobile" };
const r = await LCP.request({ trace, devtoolsLog, gatherContext: { gatherMode: "navigation" }, settings, URL: art.URL }, { computedCache: new Map(), settings });
const ev = trace.traceEvents, t0 = ev.find((e) => e.name === "navigationStart").ts, T = (e) => Math.round((e.ts - t0) / 1000);
const fcp = ev.find((e) => e.name === "firstContentfulPaint"), lcp = ev.filter((e) => e.name === "largestContentfulPaint::Candidate").pop();
const scripts = ev.filter((e) => e.name === "EvaluateScript" && e.dur > 0 && e.args?.data?.url?.includes("/_next/")).sort((a, b) => a.ts - b.ts);
const top = (est) => [...est.nodeTimings.entries()].map(([n, t]) => ({ end: Math.round(t.endTime), what: n.type === "network" ? `${n.request.url.split("/").pop().slice(0, 22)} ${n.request.resourceType}/${n.request.priority}` : `cpu ${Math.round(t.endTime - t.startTime)}ms` })).sort((a, b) => b.end - a.end).slice(0, 4).map((x) => `${x.what}@${x.end}`).join("; ");
const msg = `LCP sim ${Math.round(r.timing)} (opt ${Math.round(r.optimisticEstimate.timeInMs)}, pess ${Math.round(r.pessimisticEstimate.timeInMs)}) | observed FCP ${T(fcp)} LCP ${T(lcp)} | first script evals at ${scripts.slice(0, 3).map((e) => T(e) + " " + e.args.data.url.split("/").pop().slice(0, 10)).join(", ")} | graph nodes opt ${r.optimisticEstimate.nodeTimings.size} pess ${r.pessimisticEstimate.nodeTimings.size} | latest opt: ${top(r.optimisticEstimate)}`;
console.log(`::warning title=LCP nodes ${label}::${msg}`);
