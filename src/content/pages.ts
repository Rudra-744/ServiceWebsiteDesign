import type { RouteKey } from "./site";

// Page intros (copy from the reference index.html). Sections are added to each page in stages 3–4.
export type Intro = {
  crumb?: string;
  h1: string;
  lede: string;
  cta: { label: string; service: string };
  next?: RouteKey;
};

export const INTRO: Record<RouteKey, Intro> = {
  home: {
    h1: "Make reality more immersive.",
    lede: "A VR zone at your stall: headsets, your branded content and a crew to run it.",
    cta: { label: "Plan my exhibition", service: "VR event" },
  },
  rental: {
    crumb: "Headset rental",
    h1: "Rent VR headsets for any occasion.",
    lede: "Corporate events, exhibitions, classrooms and product demos. We bring the headsets, set them up and stay on hand until the last session ends.",
    cta: { label: "Rent VR headsets", service: "Headset rental" },
    next: "events",
  },
  events: {
    crumb: "VR events & experiences",
    h1: "Make your events more interactive with VR.",
    lede: "Bring your audience closer to your brand, products and experiences at corporate functions, educational programmes, celebrations and public events.",
    cta: { label: "Plan your VR event", service: "VR event" },
    next: "video",
  },
  video: {
    crumb: "360° video production",
    h1: "Capture every angle. Experience every moment.",
    lede: "Professional 360° video that lets viewers explore a place from every direction, in a VR headset or on a compatible device.",
    cta: { label: "Create your 360° video", service: "360° video" },
    next: "real-estate",
  },
  "real-estate": {
    crumb: "Real estate VR",
    h1: "Showcase your dream home before construction.",
    lede: "Our Virtual Sample House lets prospective buyers explore layouts, interiors and rooms in VR — long before the building is finished.",
    cta: { label: "Create your virtual sample house", service: "Real estate VR" },
    next: "vr-hub",
  },
  "vr-hub": {
    crumb: "VR HUB",
    h1: "Run a room full of VR headsets from one console.",
    lede: "Upload VR video, sync it to groups of headsets, start playback on all of them at once and collect answers to questions asked inside the experience.",
    cta: { label: "Request access", service: "VR HUB" },
  },
  contact: {
    h1: "Let's talk.",
    lede: "Tell us what you're planning — an event, a training programme, a 360° film, a sample house or a VR HUB setup. We'll come back with the right mix of headsets, content and support.",
    cta: { label: "Send enquiry", service: "Not sure yet" },
  },
};
