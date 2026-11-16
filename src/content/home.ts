// Home copy (from the reference index.html / site.js). CLIENT TO CONFIRM items are marked.

/** H1b "Without VR / With Cyphon" pairs (client to confirm) */
export const HERO_PAIRS = [
  { tab: "Exhibitions", l1: "A stall people", real: "walk past.", vr: "queue for.", lede: "A VR zone at your stall: headsets, your branded content and a crew to run it.", cta: "Plan my exhibition", svc: "VR event", note: "an exhibition stall", more: ["/vr-events", "See VR events"] },
  { tab: "Weddings", l1: "A wedding guests", real: "sit through.", vr: "never forget.", lede: "A VR games corner for guests of every age, set up and run by our crew.", cta: "Plan the wedding corner", svc: "VR event", note: "a wedding", more: ["/vr-events", "See VR events"] },
  { tab: "Schools", l1: "Students who", real: "read about Mars.", vr: "walk on Mars.", lede: "Headsets for the whole class, lessons loaded and a technician on site.", cta: "Plan a school session", svc: "Headset rental", note: "a school session", more: ["/vr-headset-rental", "See headset rental"] },
  { tab: "Property launches", l1: "Buyers who", real: "read a brochure.", vr: "walk the flat.", lede: "Your floor plans become a VR walkthrough that buyers explore at the launch.", cta: "Plan my launch", svc: "Real estate VR", note: "a property launch", more: ["/real-estate-vr", "See real estate VR"] },
  { tab: "Training", l1: "Staff who", real: "skim the manual.", vr: "practise for real.", lede: "Headsets, training content and VR HUB to run the whole batch at once.", cta: "Plan a training day", svc: "VR HUB", note: "a training day", more: ["/vr-hub", "See VR HUB"] },
] as const;
export type HeroPair = (typeof HERO_PAIRS)[number];

export const HERO_PROOF = "Our own fleet of 200+ headsets, set up and run by our crew.";

export const HERO_CAPS = [
  ["Inside the headset", "Step inside."],
  ["Headset rental", "200+ headsets, ready to deploy."],
  ["Real estate VR", "Walk a home before it's built."],
  ["360° video", "Every angle, in 360°."],
  ["VR HUB", "One console. Every headset."],
] as const;

/** H2 manifesto: words, with image pills in between */
export const MANIFESTO: (string | { img: string })[] = [
  "We put people inside the moment",
  { img: "/images/event.jpg" },
  "at expos, campuses, property launches",
  { img: "/images/realestate.jpg" },
  "festivals and weddings. Headsets, content and the software to run them, from one team.",
];

/** H3 orbit: [name, line, tags, href, link label, icon] (lines and tags: client to confirm) */
export const ORBIT = [
  ["Corporate teams", "Product launches, staff training and team days that people talk about.", ["Product launches", "Staff training", "Team days"], "/vr-events", "See VR events", "i-brief"],
  ["Event organisers", "Experience zones that pull crowds in and keep the queue moving.", ["Expos", "Brand activations", "Festivals"], "/vr-events", "See VR events", "i-party"],
  ["Schools & colleges", "Virtual field trips, science in 3D and open days students remember.", ["Field trips", "Science in 3D", "Open days"], "/vr-headset-rental", "See headset rental", "i-school"],
  ["Exhibition organisers", "Stands that draw visitors in, with demos they remember after the show.", ["Product demos", "Stand traffic", "Brand recall"], "/vr-events", "See VR events", "i-expo"],
  ["Real estate developers", "Buyers walk through a home before it's built, at the site office or the launch.", ["Sample house", "Launch events", "Site office"], "/real-estate-vr", "See real estate VR", "i-house"],
  ["Training providers", "Safe, repeatable practice for real-world skills, run for a whole group at once.", ["Skill practice", "Safety drills", "Group sessions"], "/vr-hub", "See VR HUB", "i-lamp"],
] as const;

export const MARQUEE = [["Corporate events", ""], ["Exhibitions", "o"], ["Classrooms", ""], ["Property launches", "o"], ["Festivals", ""], ["Weddings", "o"]] as const;

export const SERVICES = [
  { title: "VR headset rental", body: "A fleet of 200+ headsets, prepared and supported for your event or training day.", link: "Explore rental", href: "/vr-headset-rental", img: "/images/headset.jpg", alt: "White VR headset with blue trim" },
  { title: "VR events & experiences", body: "Turn exhibitions, corporate gatherings and celebrations into hands-on experiences.", link: "Explore events", href: "/vr-events", img: "/images/event.jpg", alt: "Visitors trying VR at an exhibition" },
  { title: "360° video production", body: "Capture the whole place and let your audience explore it from anywhere.", link: "Explore 360° video", href: "/360-video", img: "/images/camera360.jpg", alt: "360° camera on a tripod", pos: "50% 0" },
  { title: "Real estate VR", body: "Let buyers walk through a planned home before the first brick is laid.", link: "Explore real estate VR", href: "/real-estate-vr", img: "/images/realestate.jpg", alt: "Architectural model beside a VR headset" },
  { title: "VR HUB", body: "Manage headsets, content and sessions from one clear control point.", link: "Explore VR HUB", href: "/vr-hub" },
];

export const OCCASIONS = [
  ["Corporate & institutional", "i-expo", "Exhibitions & expos", "Attract visitors to your stand with interactive VR demonstrations."],
  ["Corporate & institutional", "i-school", "Schools & colleges", "Engage students through educational and immersive experiences."],
  ["Corporate & institutional", "i-lamp", "Religious festivals", "Offer engaging virtual experiences for visitors and attendees."],
  ["Corporate & institutional", "i-house", "Property launches", "Let potential buyers explore properties and sample homes virtually."],
  ["Corporate & institutional", "i-brief", "Corporate events", "Brand activations, product showcases and employee engagement activities."],
  ["Celebrations", "i-rings", "Weddings", "Give guests something new at weddings, marriage functions and anniversaries."],
  ["Celebrations", "i-cake", "Birthdays & parties", "Turn birthdays, private parties and social gatherings into an experience."],
] as const;

export const PLAN_STEPS_HOME = [
  ["Share your plans", "Architectural drawings, floor plans or any 3D designs you already have."],
  ["We build the virtual model", "A detailed 3D version of the proposed property, interiors included."],
  ["Buyers step inside", "They explore rooms, layouts and finishes in a VR headset."],
  ["Present it anywhere", "Sales offices, property launches, exhibitions and customer meetings."],
] as const;

export const PLANET_CAPS = ["One camera sees everything around it.", "Unwrap it, and that's a 360° frame.", "Step inside. Look anywhere."];
/** pins on the city strip: x along the 2400-wide strip */
export const PLANET_HOTS = [
  [300, "i-factory", "Company tours", "Factory floors and offices, open to every visitor."],
  [830, "i-campus", "Campus tours", "Show students the campus before they arrive."],
  [1330, "i-mountain", "Tourist destinations", "Let people explore a place before they travel."],
  [1800, "i-hospital", "Hospital tours", "Walk patients and staff through a facility."],
  [2190, "i-house", "Property walkthroughs", "Show a home before anyone visits it."],
] as const;

export const WHY = [
  ["200+ headsets for rental", "Support for events and deployments that need many devices at once."],
  ["End-to-end VR", "Rental hardware, immersive experiences, content production and management software."],
  ["Many industries", "Education, real estate, corporate events, entertainment and tourism."],
  ["Made for your brief", "Experiences tailored to your event, project and business goals."],
  ["Technical support", "Help with VR setup and deployment, based on what your project needs."],
] as const;

export const FIN_CAPS = [
  ["How we work", "From idea to wow, in four steps."],
  ["Step 1 of 4", "Tell us what you're planning."],
  ["Step 2 of 4", "We design the experience."],
  ["Step 3 of 4", "We deploy, sync and support."],
  ["Step 4 of 4", "Your audience steps inside."],
] as const;
export const FIN_CHIPS = ["Expos", "Weddings", "Campus tours", "200+ headsets", "Sample homes", "VR HUB", "360° films", "Festivals", "Product launches", "Training days", "Corporate events", "Schools"];

export const HEADSET_NAMES = ["Quest 01", "Quest 02", "PICO 03", "Quest 04", "Quest 05", "PICO 06", "Quest 07", "Quest 08"];
