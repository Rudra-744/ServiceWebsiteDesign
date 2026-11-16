"use client";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { SplitText } from "@/components/motion/SplitText";
import { HEAD_SPLIT } from "@/components/ui/layout";
import { HEADSET_NAMES } from "@/content/home";
import { pad } from "@/lib/motion";

// Live control demo (ANIMATION-SPEC HB4). Runs entirely in the browser and contacts no headsets.
// Play: selected headsets switch to Playing 70 ms apart (12 s progress bar); Pause stops them 50 ms apart; Reset → Idle.
// Restricted mode with too few credits blocks Play. Tapping a headset toggles it with a 180 ms bump. Log keeps the last 5.
const MEDIA = [
  ["Gallery tour", "12:40"],
  ["Safety briefing", "6:15"],
  ["Onboarding walkthrough", "4 questions, 9:00"],
];
const CREDITS = 5;
type St = "idle" | "playing" | "paused";
const s = (n: number) => `${n} headset${n > 1 ? "s" : ""}`;

export function LiveControl() {
  const [sel, setSel] = useState<boolean[]>(() => HEADSET_NAMES.map(() => true));
  const [st, setSt] = useState<St[]>(() => HEADSET_NAMES.map(() => "idle"));
  const [run, setRun] = useState<number[]>(() => HEADSET_NAMES.map(() => 0)); // bumping restarts the progress animation
  const [bump, setBump] = useState<number[]>([]);
  const [media, setMedia] = useState(0);
  const [restricted, setRestricted] = useState(false);
  const [log, setLog] = useState<{ id: number; t: string; m: ReactNode }[]>([]);
  const [payload, setPayload] = useState(false);
  const timers = useRef(new Set<number>());
  const stNow = useRef(st);
  useEffect(() => {
    stNow.current = st;
  });
  const logId = useRef(0);

  useEffect(() => {
    const t = timers.current;
    return () => t.forEach(clearTimeout);
  }, []);
  const later = (fn: () => void, ms: number) => {
    const id = window.setTimeout(() => (timers.current.delete(id), fn()), ms);
    timers.current.add(id);
  };
  const addLog = (m: ReactNode) => {
    const d = new Date();
    const t = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    setLog((l) => [{ id: ++logId.current, t, m }, ...l].slice(0, 5));
  };
  const setOne = (i: number, fn: (cur: St) => St | null, restart?: (cur: St) => boolean) => {
    const cur = stNow.current[i], next = fn(cur);
    if (next === null) return;
    stNow.current = stNow.current.map((v, j) => (j === i ? next : v));
    setSt(stNow.current);
    if (restart?.(cur)) setRun((r) => r.map((v, j) => (j === i ? v + 1 : v)));
  };

  const picked = sel.flatMap((on, i) => (on ? [i] : []));
  const act = (a: "play" | "pause" | "reset") => {
    if (!picked.length) return addLog("Select at least one headset first.");
    if (a === "play") {
      if (restricted && CREDITS < picked.length)
        return addLog(
          <>
            <b className="text-[#E5A100]">Play blocked</b> — {CREDITS} credits don&apos;t cover {picked.length} headsets.
          </>,
        );
      // paused → resume; idle → start (restart bar); already playing → restart bar
      picked.forEach((i, k) => later(() => setOne(i, () => "playing", (cur) => cur !== "paused"), k * 70));
      addLog(`Play “${MEDIA[media][0]}” sent to ${s(picked.length)}`);
    }
    if (a === "pause") {
      picked.forEach((i, k) => later(() => setOne(i, (cur) => (cur === "idle" ? null : "paused")), k * 50));
      addLog(`Pause sent to ${s(picked.length)}`);
    }
    if (a === "reset") {
      picked.forEach((i, k) => later(() => setOne(i, () => "idle", () => true), k * 50));
      addLog(`Reset sent to ${s(picked.length)}`);
    }
  };
  const toggle = (i: number) => {
    setSel((a) => a.map((v, j) => (j === i ? !v : v)));
    setBump((b) => [...b, i]);
    later(() => setBump((b) => b.filter((x) => x !== i)), 180);
  };

  const json = JSON.stringify(
    {
      event: "media-play",
      groupId: "gallery-a",
      mediaId: MEDIA[media][0].toLowerCase().replace(/\s+/g, "-"),
      configuration: { name: "Tour", volume: 70, brightness: 60 },
      targets: picked.map((i) => HEADSET_NAMES[i]),
    },
    null,
    2,
  );

  return (
    <section id="live" data-nav="Live control" className="wrap sec">
      <div className={HEAD_SPLIT}>
        <SplitText as="h2" className="d2" text="Press play once. Every headset follows." />
        <p className="lede fade" data-reveal="">
          Pick a video or interaction, choose the headsets and send Play, Pause or Reset. Try it — this demo runs in your browser and contacts no headsets.
        </p>
      </div>
      <div className="grid gap-4 min-[1000px]:grid-cols-2 min-[1000px]:items-start">
        <div className={LC}>
          <div className={LC_H}>
            <b className={LC_B}>Media control, Gallery A</b>
            <span>Tour configuration</span>
          </div>
          <div className="grid gap-2">
            {MEDIA.map(([m, d], i) => (
              <button
                key={m}
                type="button"
                aria-pressed={i === media}
                onClick={() => setMedia(i)}
                className="group/op flex items-center gap-3 rounded-[12px] bg-white px-[14px] py-[13px] text-left text-[15px] shadow-[inset_0_0_0_1px_var(--color-line)] [transition:box-shadow_.3s,background-color_.3s] aria-pressed:bg-blue-soft aria-pressed:shadow-[inset_0_0_0_1.5px_var(--color-blue)]"
              >
                <i className="size-4 flex-none rounded-full shadow-[inset_0_0_0_1.5px_#b3b3ba] [transition:box-shadow_.3s] group-aria-pressed/op:shadow-[inset_0_0_0_5px_var(--color-blue-deep)]" />
                {m}
                <small className="ml-auto text-[12.5px] text-muted">{d}</small>
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between rounded-[12px] bg-white px-[14px] py-3 text-[14.5px]">
            <span>
              Restricted user
              <small className="block text-[12.5px] text-muted">{restricted ? `${CREDITS} credits remaining, 1 per completed view` : `${CREDITS} credits remaining`}</small>
            </span>
            <button
              type="button"
              aria-label="Restricted user"
              aria-pressed={restricted}
              onClick={() => setRestricted(!restricted)}
              className="relative h-[26px] w-[46px] flex-none rounded-full bg-[#d9d9de] [transition:background-color_.3s] after:absolute after:top-[3px] after:left-[3px] after:size-5 after:rounded-full after:bg-white after:[transition:transform_.45s_var(--e-spring)] after:content-[''] aria-pressed:bg-blue aria-pressed:after:[transform:translateX(20px)]"
            />
          </div>
          <div className="grid grid-cols-[1fr_1.3fr_1fr] gap-2">
            {(
              [
                ["reset", "i-reset", "Reset"],
                ["play", "i-play", "Play"],
                ["pause", "i-pause", "Pause"],
              ] as const
            ).map(([a, ic, l]) => (
              <button key={a} type="button" onClick={() => act(a)} className={`flex h-[50px] items-center justify-center gap-2 rounded-[12px] text-[15px] font-semibold [transition:background-color_.3s,transform_.3s_var(--e-spring)] active:[transform:scale(.95)] ${a === "play" ? "bg-blue text-ink" : "bg-white shadow-[inset_0_0_0_1px_var(--color-line)]"}`}>
                <svg className="size-[14px]">
                  <use href={`#${ic}`} />
                </svg>
                {l}
              </button>
            ))}
          </div>
          <div className="grid max-h-[118px] min-h-[118px] content-start gap-1 overflow-hidden text-[13px] text-stone tabular-nums" aria-live="polite">
            {log.length ? (
              log.map((e) => (
                <p key={e.id} className="m-0 animate-[logIn_.5s_var(--e-out)]">
                  <b className="font-semibold text-ink">{e.t}</b> {e.m}
                </p>
              ))
            ) : (
              <p className="m-0">No commands sent yet.</p>
            )}
          </div>
        </div>
        <div className={LC}>
          <div className={LC_H}>
            <span>
              <b className={LC_B}>Target devices</b>
              <br />
              <span>{picked.length} of 8 selected</span>
            </span>
            <span className="flex gap-2">
              {(
                [
                  ["Select all", true],
                  ["Clear", false],
                ] as const
              ).map(([l, v]) => (
                <button key={l} type="button" onClick={() => setSel(sel.map(() => v))} className="h-8 rounded-full px-3 text-[13px] shadow-[inset_0_0_0_1px_var(--color-line)]">
                  {l}
                </button>
              ))}
            </span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {HEADSET_NAMES.map((n, i) => (
              <button
                key={n}
                type="button"
                aria-pressed={sel[i]}
                onClick={() => toggle(i)}
                className={`group/dv grid gap-[6px] rounded-[12px] p-[10px] text-left text-[13px] [transition:box-shadow_.3s,background-color_.4s,transform_.45s_var(--e-spring),opacity_.3s] ${DEV[st[i]]} ${sel[i] ? "" : "opacity-45"} ${bump.includes(i) ? "[transform:scale(.92)]" : ""}`}
              >
                <b className="flex items-center justify-between text-[12.5px] font-semibold">
                  {n}
                  <i className="size-[7px] rounded-full bg-ok" />
                </b>
                <span className={`text-[11.5px] ${st[i] === "idle" ? "text-muted" : "text-ink"}`}>{st[i] === "playing" ? "Playing" : st[i] === "paused" ? "Paused" : "Idle"}</span>
                <span className={`block h-[3px] overflow-hidden rounded-[2px] ${st[i] === "idle" ? "bg-[#e6e6ea]" : "bg-[rgba(5,5,5,.15)]"}`}>
                  <i
                    key={run[i]}
                    className={`block h-full origin-left [transform:scaleX(0)] ${st[i] === "idle" ? "bg-blue" : "bg-ink [animation:prog_12s_linear_forwards]"} ${st[i] === "paused" ? "[animation-play-state:paused]" : ""}`}
                  />
                </span>
              </button>
            ))}
          </div>
          <button type="button" className="link justify-self-start text-[14px]" onClick={() => setPayload(!payload)}>
            {payload ? "Hide command" : "View command"}
          </button>
          <div className={`grid [transition:grid-template-rows_.5s_var(--e-out)] ${payload ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
            <div className="overflow-hidden">
              <pre className="m-0 rounded-[12px] bg-white p-[14px] font-mono text-[12.5px] whitespace-pre-wrap text-stone shadow-[inset_0_0_0_1px_var(--color-line)]">{json}</pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const LC = "grid gap-[14px] rounded-card bg-card p-[clamp(16px,2vw,26px)] shadow-[0_0_0_1px_var(--color-line)]";
const LC_H = "flex items-center justify-between text-[14px] text-muted";
const LC_B = "text-[17px] font-[620] text-ink";
// selected/unselected ring, playing (cornflower) and paused (pale) backgrounds
const DEV: Record<St, string> = {
  idle: "bg-white shadow-[inset_0_0_0_1.5px_var(--color-blue)] aria-[pressed=false]:shadow-[inset_0_0_0_1.5px_var(--color-line)]",
  playing: "bg-blue",
  paused: "bg-[#bfd3ff]",
};
