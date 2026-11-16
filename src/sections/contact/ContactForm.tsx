"use client";
import { type CSSProperties, useActionState, useState } from "react";
import { useSearchParams } from "next/navigation";
import { FIELD_INPUT, FIELD_LABEL } from "@/components/ui/field";
import { type EnquiryState, sendEnquiry } from "@/app/contact/actions";
import { SERVICES } from "@/content/services";
import { site } from "@/content/site";

// Contact form (ANIMATION-SPEC C1): floating labels, multi-select service pills, headcount slider 10–250 ("250+" at the top),
// client check for name + email, then the Server Action. On success the button shrinks to a green circle and a tick draws.
const MSG: Record<EnquiryState["status"], string> = {
  idle: "",
  invalid: "Add your name and a valid email so we can reply.",
  limited: "Too many enquiries from this connection. Please try again in a few minutes.",
  preview: `Preview only: this form is not connected to email yet.${site.email ? ` Please write to ${site.email}.` : ""}`,
  sent: "Thanks. Your enquiry is on its way and we'll reply soon.",
  error: `Something went wrong sending your enquiry. Please try again${site.email ? ` or write to ${site.email}` : ""}.`,
};

/** reads ?service=…&note=… (links from the service pages and the planner); render inside <Suspense> */
export function ContactFromParams() {
  const q = useSearchParams();
  const service = q.get("service") ?? "", note = q.get("note") ?? "";
  return <ContactForm key={service + note} service={service} note={note} />;
}

export function ContactForm({ service = "", note = "" }: { service?: string; note?: string }) {
  const [state, action, pending] = useActionState<EnquiryState, FormData>(sendEnquiry, { status: "idle" });
  const [picked, setPicked] = useState<string[]>(() => ((SERVICES as readonly string[]).includes(service) ? [service] : []));
  const [hc, setHc] = useState(40);
  const [clientErr, setClientErr] = useState(false);
  const done = !clientErr && (state.status === "preview" || state.status === "sent");
  const err = clientErr || state.status === "invalid" || state.status === "limited" || state.status === "error";
  const msg = clientErr ? MSG.invalid : MSG[state.status];

  return (
    <form
      action={action}
      noValidate
      data-reveal=""
      data-morph-to=""
      className="grid gap-[18px] rounded-stage bg-card p-[clamp(22px,3vw,44px)]"
      onSubmit={(e) => {
        const f = new FormData(e.currentTarget), name = String(f.get("name")).trim(), mail = String(f.get("email")).trim();
        const bad = !name || !/^\S+@\S+\.\S+$/.test(mail);
        setClientErr(bad);
        if (bad) e.preventDefault();
      }}
    >
      <div className={F2}>
        <Field id="f-name" name="name" label="Your name" autoComplete="name" />
        <Field id="f-co" name="company" label="Company or institution" autoComplete="organization" />
      </div>
      <div className={F2}>
        <Field id="f-mail" name="email" type="email" label="Email" autoComplete="email" />
        <Field id="f-tel" name="phone" type="tel" label="Phone" autoComplete="tel" />
      </div>
      <p className={F_LABEL}>What do you need?</p>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Services">
        {SERVICES.map((s) => {
          const on = picked.includes(s);
          return (
            <button
              key={s}
              type="button"
              aria-pressed={on}
              onClick={() => setPicked(on ? picked.filter((x) => x !== s) : [...picked, s])}
              className="h-11 rounded-full bg-white px-4 text-[15px] font-[540] shadow-[inset_0_0_0_1px_var(--color-line)] [transition:background-color_.35s,color_.35s,box-shadow_.35s,transform_.5s_var(--e-spring)] active:[transform:scale(.95)]! aria-pressed:bg-blue aria-pressed:text-ink aria-pressed:shadow-none aria-pressed:[transform:scale(1.04)]"
            >
              {s}
            </button>
          );
        })}
        {picked.map((s) => (
          <input key={s} type="hidden" name="service" value={s} />
        ))}
      </div>
      <div className={F2}>
        <div className="relative">
          <input id="f-date" name="date" type="date" className={FIELD_INPUT} />
          <label htmlFor="f-date" className={`${FIELD_LABEL} text-blue-deep! [transform:translateY(-11px)_scale(.76)]`}>
            Event or start date
          </label>
        </div>
        <div className="grid gap-[10px]">
          <div className="flex items-baseline justify-between">
            <span className={`${F_LABEL} m-0!`}>Headcount</span>
            <b className="text-[32px] font-[640] tracking-[-0.03em] tabular-nums [font-stretch:112%]">{hc >= 250 ? "250+" : hc}</b>
          </div>
          <input
            name="headcount"
            type="range"
            min={10}
            max={250}
            step={10}
            value={hc}
            aria-label="Headcount"
            onChange={(e) => setHc(+e.target.value)}
            style={{ "--v": ((hc - 10) / 240) * 100 + "%" } as CSSProperties}
            className={RANGE}
          />
        </div>
      </div>
      <div className="relative">
        <textarea id="f-msg" name="message" placeholder=" " defaultValue={note} className={`${FIELD_INPUT} h-[130px]! resize-y pt-7!`} />
        <label htmlFor="f-msg" className={FIELD_LABEL}>
          Tell us about your project
        </label>
      </div>
      {/* honeypot: hidden from people, bots fill it */}
      <div className="absolute -left-[9999px] size-px overflow-hidden" aria-hidden="true">
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <button
        type="submit"
        disabled={pending || done}
        className={`group/sb relative h-[60px] w-full justify-self-start overflow-hidden rounded-full bg-blue text-[16px] font-[620] text-ink [font-stretch:108%] [transition:width_.6s_var(--e-out),background-color_.4s] disabled:cursor-progress [&.done]:w-[60px] [&.done]:cursor-default [&.done]:bg-ok ${done ? "done" : ""}`}
      >
        <span className="transition-opacity duration-300 group-[.done]/sb:opacity-0">{pending ? "Sending…" : "Send enquiry"}</span>
        <svg className="absolute top-1/2 left-1/2 -mt-[14px] -ml-[14px] size-7 opacity-0 group-[.done]/sb:opacity-100" viewBox="0 0 28 28" aria-hidden="true">
          <path className="fill-none stroke-white [stroke-dasharray:30] [stroke-dashoffset:30] [stroke-linecap:round] [stroke-linejoin:round] [stroke-width:3] [transition:stroke-dashoffset_.6s_var(--e-out)_.45s] group-[.done]/sb:[stroke-dashoffset:0]" d="M7 14.5l4.5 4.5L21 9.5" />
        </svg>
      </button>
      <p className={`m-0 min-h-[1.4em] text-[15px] ${err ? "text-[#c0392b]" : "text-stone"}`} aria-live="polite">
        {msg}
      </p>
    </form>
  );
}

function Field({ id, name, label, type = "text", autoComplete }: { id: string; name: string; label: string; type?: string; autoComplete: string }) {
  return (
    <div className="relative">
      <input id={id} name={name} type={type} placeholder=" " autoComplete={autoComplete} className={FIELD_INPUT} />
      <label htmlFor={id} className={FIELD_LABEL}>
        {label}
      </label>
    </div>
  );
}

const F2 = "grid gap-[18px] min-[640px]:grid-cols-2";
const F_LABEL = "mt-[6px] mb-[2px] text-[15px] font-semibold";
const RANGE =
  "h-7 w-full appearance-none bg-transparent " +
  "[&::-webkit-slider-runnable-track]:h-1 [&::-webkit-slider-runnable-track]:rounded-[2px] [&::-webkit-slider-runnable-track]:[background:linear-gradient(var(--color-blue),var(--color-blue))_0/var(--v,10%)_100%_no-repeat,var(--color-line)] " +
  "[&::-webkit-slider-thumb]:-mt-[11px] [&::-webkit-slider-thumb]:size-[26px] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue [&::-webkit-slider-thumb]:shadow-[0_0_0_4px_#fff] " +
  "[&::-moz-range-track]:h-1 [&::-moz-range-track]:rounded-[2px] [&::-moz-range-track]:bg-line [&::-moz-range-progress]:h-1 [&::-moz-range-progress]:rounded-[2px] [&::-moz-range-progress]:bg-blue [&::-moz-range-thumb]:size-[26px] [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-blue";
