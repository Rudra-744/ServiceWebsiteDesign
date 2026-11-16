import { z } from "zod";

// Environment, validated at build time (imported by next.config.ts). Business details stay TODO until the client sends them.
const schema = z.object({
  NEXT_PUBLIC_SITE_URL: z.url().default("http://localhost:3000"),
  NEXT_PUBLIC_CONTACT_EMAIL: z.union([z.email(), z.literal("")]).default(""),
  // Contact form (Resend), used from stage 4. Empty = form shows the "not connected yet" message.
  RESEND_API_KEY: z.string().default(""),
  CONTACT_TO_EMAIL: z.union([z.email(), z.literal("")]).default(""),
  CONTACT_FROM_EMAIL: z.string().default(""),
});

export const env = schema.parse(process.env);
