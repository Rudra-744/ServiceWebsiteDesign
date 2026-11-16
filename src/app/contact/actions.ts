"use server";
import { headers } from "next/headers";
import { env } from "@/lib/env";
import { enquirySubject, enquiryText, rateLimiter, readEnquiry } from "@/lib/enquiry";

export type EnquiryState = { status: "idle" | "invalid" | "limited" | "preview" | "sent" | "error" };

// shortcut: in-memory, per server instance (resets on cold start, not shared across instances); move to a KV store if spam gets through
const allow = rateLimiter(5, 10 * 60_000);

/** Contact form Server Action (ANIMATION-SPEC C1): honeypot → zod validation → rate limit → Resend.
 *  Without the Resend settings the form runs in preview mode and says so. */
export async function sendEnquiry(_prev: EnquiryState, fd: FormData): Promise<EnquiryState> {
  if (String(fd.get("website") ?? "")) return { status: "sent" }; // honeypot filled: a bot, pretend it worked
  const parsed = readEnquiry(fd);
  if (!parsed.success) return { status: "invalid" };

  const h = await headers();
  const ip = (h.get("x-forwarded-for") ?? "").split(",")[0].trim() || h.get("x-real-ip") || "unknown";
  if (!allow(ip)) return { status: "limited" };

  if (!env.RESEND_API_KEY || !env.CONTACT_TO_EMAIL || !env.CONTACT_FROM_EMAIL) return { status: "preview" };
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: env.CONTACT_FROM_EMAIL,
        to: [env.CONTACT_TO_EMAIL],
        reply_to: parsed.data.email,
        subject: enquirySubject(parsed.data),
        text: enquiryText(parsed.data),
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) console.error("Resend error", res.status, await res.text().catch(() => ""));
    return { status: res.ok ? "sent" : "error" };
  } catch (err) {
    console.error("Resend request failed", err);
    return { status: "error" };
  }
}
