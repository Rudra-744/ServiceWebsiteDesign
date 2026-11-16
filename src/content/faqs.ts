import type { RouteKey } from "./site";

// FAQ copy per page (reference index.html). Single source for the accordions and the FAQPage JSON-LD (stage 6).
export type FaqItem = { q: string; a: string };

export const FAQS: Partial<Record<RouteKey, FaqItem[]>> = {
  rental: [
    { q: "How many headsets can we rent?", a: "From a handful for a small session to 200+ for a large event. Tell us your headcount and we'll plan the right number." },
    { q: "Do you set up the headsets?", a: "Yes. Setup and deployment are part of the service, with technical assistance based on your project." },
    { q: "Can we rent for more than one day?", a: "Yes. We handle short-term rentals for single events and long-term rentals for ongoing programmes." },
    { q: "Do the headsets need a PC or cables?", a: "No. We rent standalone headsets, so guests just put them on. We'll confirm the exact models with your quote." },
    { q: "Are the headsets cleaned between guests?", a: "Every headset is cleaned before it reaches you, and we bring hygiene covers so each guest gets a fresh one." },
    { q: "Can you load our own app or content?", a: "Yes. Share it before the event and we'll install and test it on every headset." },
  ],
  events: [
    { q: "What kinds of events do you support?", a: "Exhibitions, school and college events, religious festivals, real estate launches and corporate events, plus private celebrations such as weddings, anniversaries and birthdays." },
    { q: "Do you bring the headsets and set them up?", a: "Yes. We provide the headsets with setup and deployment, plus technical support based on your event." },
    { q: "Can the experience be tailored to our brand?", a: "Yes. Experiences are customised to your event, product and business objectives." },
    { q: "How much space do we need?", a: "A small corner works for one or two stations, and we can fill a whole hall. Share your floor plan and we'll suggest a layout." },
    { q: "How long does each guest spend in VR?", a: "Usually a few minutes, depending on the experience. We plan the number of headsets around your expected crowd so the queue keeps moving." },
  ],
  video: [
    { q: "Where can people watch the videos?", a: "In VR headsets or on compatible devices, so viewers can look around in every direction." },
    { q: "Can you film in restricted locations?", a: "Yes, where permission to film is granted. Restricted area visits are always subject to filming permissions." },
    { q: "Can you make something that isn't on this list?", a: "Yes. Custom 360° projects are tailored to your business and industry." },
  ],
  "real-estate": [
    { q: "What do you need from us?", a: "Architectural drawings, floor plans or any available 3D designs." },
    { q: "How do buyers view it?", a: "In a VR headset at your sales office, launch event, exhibition or customer meeting." },
    { q: "Can we show interiors and finishes?", a: "Yes. Interior designs and proposed finishes can be presented visually in the virtual model." },
  ],
};
