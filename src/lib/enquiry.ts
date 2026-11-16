import { z } from "zod";
import { SERVICES } from "../content/services.ts";

// Contact enquiry: validation (trust boundary for the Server Action), the plain-text email body and a tiny rate limiter.
// No path aliases here (relative .ts imports only), so scripts/check-enquiry.mjs can import it directly with Node.

const text = (max: number) => z.string().trim().max(max);
export const enquirySchema = z.object({
  name: text(100).min(1),
  email: text(200).pipe(z.email()),
  company: text(200),
  phone: text(40),
  services: z.array(z.enum(SERVICES)).max(SERVICES.length),
  date: z.union([z.literal(""), z.iso.date()]),
  headcount: z.coerce.number().int().min(10).max(250),
  message: text(5000),
});
export type Enquiry = z.infer<typeof enquirySchema>;

export function readEnquiry(fd: FormData) {
  const s = (k: string) => fd.get(k) ?? "";
  return enquirySchema.safeParse({
    name: s("name"),
    email: s("email"),
    company: s("company"),
    phone: s("phone"),
    services: fd.getAll("service"),
    date: s("date"),
    headcount: s("headcount"),
    message: s("message"),
  });
}

/** plain text only, so nothing the visitor typed is ever rendered as HTML */
export function enquiryText(e: Enquiry) {
  return [
    `Name: ${e.name}`,
    `Email: ${e.email}`,
    `Company: ${e.company || "-"}`,
    `Phone: ${e.phone || "-"}`,
    `Services: ${e.services.join(", ") || "-"}`,
    `Date: ${e.date || "-"}`,
    `Headcount: ${e.headcount >= 250 ? "250+" : e.headcount}`,
    "",
    e.message || "(no message)",
  ].join("\n");
}

export const enquirySubject = (e: Enquiry) => `New enquiry from ${e.name.replace(/\s+/g, " ")}`;

/** fixed-window limiter: `limit` hits per key per `windowMs` */
export function rateLimiter(limit: number, windowMs: number) {
  const hits = new Map<string, number[]>();
  return (key: string, now = Date.now()) => {
    if (hits.size > 10_000) hits.clear(); // bound memory if many different addresses hit the form
    const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
    const ok = recent.length < limit;
    if (ok) recent.push(now);
    hits.set(key, recent);
    return ok;
  };
}
