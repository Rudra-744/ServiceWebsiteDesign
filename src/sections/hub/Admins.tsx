import type { CSSProperties } from "react";
import { SplitText } from "@/components/motion/SplitText";
import { HEAD_SPLIT } from "@/components/ui/layout";

// Roles, alerts and reliability (ANIMATION-SPEC HB7): reveal sections; numbers count up over 1.2 s when revealed.
// Desktop: the outer role cards slide in from behind the middle one.
const ROLES = [
  ["Admin", "Runs the account.", ["Invites users and sets each account's role", "Sets device and media-upload limits per account", "Adds credits with an expiry date", "Suspends or removes accounts"]],
  ["User", "Runs their own fleet.", ["Registers and manages their own headsets", "Uploads media, builds configurations and groups", "Creates questions and interactions", "Controls playback and reviews analytics"]],
  ["Restricted user", "Same tools, credit-based playback.", ["One credit is used per completed view", "Play is blocked when credits don't cover the selected headsets", "Unused credits expire on their date", "A personal page shows total, used, remaining and expired credits"]],
] as const;
// desktop entrance per card (outer ones tucked behind the middle one until the row is revealed)
const ROLE_IN = [
  "min-[1000px]:motion:[transition:transform_1.1s_var(--e-out),opacity_.6s] min-[1000px]:motion:group-[:not(.in)]/roles:opacity-60 min-[1000px]:motion:group-[:not(.in)]/roles:[transform:translateX(104%)_rotate(-4deg)]",
  "min-[1000px]:relative min-[1000px]:z-2 min-[1000px]:motion:[transition:transform_1.1s_var(--e-out),opacity_.6s] min-[1000px]:motion:group-[:not(.in)]/roles:[transform:scale(.94)]",
  "min-[1000px]:motion:[transition:transform_1.1s_var(--e-out),opacity_.6s] min-[1000px]:motion:group-[:not(.in)]/roles:opacity-60 min-[1000px]:motion:group-[:not(.in)]/roles:[transform:translateX(-104%)_rotate(4deg)]",
];
const THRESHOLDS = [
  ["Low battery", "An online, unplugged headset drops to", "20", "%"],
  ["Device offline", "A headset hasn't checked in for", "24", " h"],
  ["Low storage", "Free storage falls below", "10", "%"],
  ["Sync not progressing", "A started sync hasn't finished after", "2", " h"],
  ["Credits expiring", "Unused credits expire within", "7", " days"],
];
const NOTES = [
  ["i-batt", "text-[#E5484D]", "Low battery", "Quest 04 headset battery is at 9%.", "2 minutes ago"],
  ["i-sync", "text-warn", "Sync not progressing", "PICO 03 started syncing 3 hours ago and has not finished.", "18 minutes ago"],
  ["i-offline", "text-[#8B8FA8]", "Device offline", "PICO 05 has been offline since 23 Oct, 18:40.", "1 hour ago"],
];
const RELY = [
  ["Every 5 minutes", "Headsets that stop checking in are marked offline."],
  ["Every 15 minutes", "Alert thresholds are checked for every headset."],
  ["Every hour", "Unfinished uploads are cleaned up and stalled syncs reset."],
];

export function Admins() {
  return (
    <>
      <section data-nav="For admins" className="wrap sec">
        <div className={HEAD_SPLIT}>
          <SplitText as="h2" className="d2" text="Built for the people who run the sessions." />
          <p className="lede fade" data-reveal="">
            Accounts, limits and credits are managed in the console. Alerts flag a problem headset before the session starts.
          </p>
        </div>
        <div className="group/roles grid gap-[14px] [perspective:1200px] min-[1000px]:grid-cols-3" data-reveal="">
          {ROLES.map(([tag, h, list], i) => {
            const blue = i === 1;
            return (
              <article key={tag} className={`grid content-start gap-[18px] rounded-stage p-[clamp(24px,2.4vw,36px)] ${blue ? "bg-blue" : "bg-card"} ${ROLE_IN[i]}`}>
                <p className={`tag ${blue ? "text-[rgba(5,5,5,.65)]!" : ""}`}>{tag}</p>
                <h3 className="d3">{h}</h3>
                <ul className="m-0 grid list-none gap-[10px] p-0">
                  {list.map((li) => (
                    <li key={li} className={`relative pl-5 text-[15.5px] before:absolute before:top-[.62em] before:left-0 before:h-[1.5px] before:w-2 before:bg-current before:content-[''] ${blue ? "text-[rgba(5,5,5,.8)]" : "text-stone"}`}>
                      {li}
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>
        <div className="mt-[clamp(64px,8vw,120px)] grid gap-[22px] min-[1000px]:grid-cols-2 min-[1000px]:items-start min-[1000px]:gap-[5vw]">
          <div>
            <SplitText as="h3" className="d2" text="Hear about the flat battery before the session." />
            <p className="body-copy fade mt-5" data-reveal="">
              Thresholds are checked every 15 minutes, and each alert is raised at most once a day per headset. Every threshold can be switched off or adjusted.
            </p>
            <ul className="mt-5 mb-0 list-none p-0">
              {THRESHOLDS.map(([b, s, n, suf]) => (
                <li key={b} data-reveal="" className="relative flex items-baseline justify-between gap-4 py-4">
                  <span className="rule absolute inset-x-0 top-0" />
                  <span>
                    <b className="block font-semibold">{b}</b>
                    <small className="text-[14px] text-muted">{s}</small>
                  </span>
                  <span className="text-[22px] font-[640] whitespace-nowrap tabular-nums [font-stretch:110%]" data-count={n} data-suffix={suf}>
                    0{suf}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="group/nf grid gap-2 rounded-card bg-card p-4" data-reveal="">
            <div className="flex items-center justify-between px-1 pt-1 pb-2 text-[14px]">
              <b className="text-[16px] font-[620]">Notifications</b>
              <span className="relative grid size-10 place-items-center rounded-full shadow-[inset_0_0_0_1px_var(--color-line)]">
                <svg className="size-[18px] origin-[50%_10%] group-[.in]/nf:[animation:ring_1s_ease-in-out_.3s_2]">
                  <use href="#i-bell" />
                </svg>
                <em className="absolute -top-[2px] -right-[2px] grid h-[18px] min-w-[18px] place-items-center rounded-[9px] bg-[#e5484d] text-[11px] font-bold text-white not-italic [transform:scale(0)] [transition:transform_.5s_var(--e-spring)_1.2s] group-[.in]/nf:[transform:none]">3</em>
              </span>
            </div>
            {NOTES.map(([ic, col, b, t, ago], i) => (
              <div key={b} style={{ "--i": i } as CSSProperties} className="grid grid-cols-[28px_1fr] gap-[10px] rounded-[12px] bg-white p-3 text-[14px] motion:opacity-0 motion:[transform:translateY(-22px)_scale(.96)] motion:[transition:opacity_.45s_calc(.5s+var(--i)*260ms),transform_.7s_var(--e-spring)_calc(.5s+var(--i)*260ms)] in:opacity-100 in:[transform:none]">
                <svg className={`mt-[2px] size-[18px] ${col}`}>
                  <use href={`#${ic}`} />
                </svg>
                <div>
                  <b className="block font-semibold">{b}</b>
                  <span className="text-stone">{t}</span>
                  <small className="mt-[2px] block text-[12px] text-[#9a9aa2]">{ago}</small>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section data-nav="Reliability" className="wrap sec-tight">
        <div className="grid gap-[14px] min-[820px]:grid-cols-3" data-reveal="">
          {RELY.map(([b, t], i) => (
            <div key={b} className="pop grid gap-2 rounded-card p-[26px] shadow-[0_0_0_1px_var(--color-line)]" style={{ "--i": i } as CSSProperties}>
              <b className="text-[length:clamp(22px,2vw,30px)] leading-[1.1] font-[620] tracking-[-0.02em] [font-stretch:108%]">{b}</b>
              <span className="text-[15px] text-stone">{t}</span>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
