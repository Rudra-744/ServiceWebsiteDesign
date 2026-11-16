// Site-wide facts. Contact details come from the environment, never hard-coded (TODO until the client sends them).
export const site = {
  name: "Cyphon",
  tagline: "Immersive technology, made practical",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "",
  about: "End-to-end virtual reality for businesses, institutions, real estate and events.",
};

export type RouteKey = "home" | "rental" | "events" | "video" | "real-estate" | "vr-hub" | "contact";

/** every page: path, short title (nav chip, morph label, menu), menu descriptor */
export const ROUTES: Record<RouteKey, { href: string; title: string; menu: string }> = {
  home: { href: "/", title: "Home", menu: "Start here" },
  rental: { href: "/vr-headset-rental", title: "Headset rental", menu: "200+ headsets, ready to deploy" },
  events: { href: "/vr-events", title: "VR events", menu: "Expos, campuses, weddings" },
  video: { href: "/360-video", title: "360° video", menu: "Every angle, captured" },
  "real-estate": { href: "/real-estate-vr", title: "Real estate VR", menu: "Walk a home before it's built" },
  "vr-hub": { href: "/vr-hub", title: "VR HUB", menu: "Run every headset from one console" },
  contact: { href: "/contact", title: "Contact", menu: "Tell us what you're planning" },
};

export const ROUTE_ORDER: RouteKey[] = ["home", "rental", "events", "video", "real-estate", "vr-hub", "contact"];

export const routeByPath = (path: string): RouteKey | null => {
  const p = path.replace(/\/+$/, "") || "/";
  return ROUTE_ORDER.find((k) => ROUTES[k].href === p) ?? null;
};

/** old hash URLs of the static site (/#rental) → real paths */
export const LEGACY_HASH: Record<string, string> = {
  home: "/",
  rental: "/vr-headset-rental",
  events: "/vr-events",
  video: "/360-video",
  "real-estate": "/real-estate-vr",
  "vr-hub": "/vr-hub",
  contact: "/contact",
};

/** Contact pre-fill link (replaces the static site's data-service + pendingNote) */
export const contactHref = (service?: string, note?: string) => {
  const q = new URLSearchParams();
  if (service) q.set("service", service);
  if (note) q.set("note", note);
  const s = q.toString();
  return s ? `/contact?${s}` : "/contact";
};
