// VR events page copy (reference index.html / site.js v19).
export type Occasion = [icon: string, name: string, line: string];

export const EV: Record<"corp" | "ent", Occasion[]> = {
  corp: [
    ["i-expo", "Exhibitions & expos", "Attract visitors with interactive VR demonstrations."],
    ["i-school", "School & college events", "Engage students through educational, immersive experiences."],
    ["i-lamp", "Religious festivals", "Offer engaging virtual experiences for visitors and attendees."],
    ["i-house", "Real estate launches", "Let buyers explore properties and sample homes virtually."],
    ["i-brief", "Corporate events", "Brand activations, product showcases and employee engagement."],
  ],
  ent: [
    ["i-cake", "Birthday parties", "Give guests something new to try at birthday parties."],
    ["i-rings", "Weddings & marriage functions", "Add an immersive experience to weddings and marriage functions."],
    ["i-star", "Anniversary celebrations", "Make anniversary celebrations more memorable."],
    ["i-party", "Private parties", "Entertain guests at private parties and social gatherings."],
    ["i-sparkle", "Special occasions & promotions", "Stand out at special occasions and promotional events."],
  ],
};
export const ALL_OCCASIONS = [...EV.corp, ...EV.ent];

export const IDEAS: Record<string, string[]> = {
  "Exhibitions & expos": ["Try your product in VR before it ships", "Walk through a virtual factory or plant", "Play a branded game that draws a crowd"],
  "School & college events": ["Take a virtual field trip", "Explore science and space in 3D", "Visit historic places without leaving campus"],
  "Religious festivals": ["Take virtual tours of holy places", "See festival stories come alive in 360°", "Share the experience with the whole family"],
  "Real estate launches": ["Walk through sample homes before they're built", "See the view from every floor", "Compare layouts side by side"],
  "Corporate events": ["Launch a product in VR", "Run team challenges and games", "Train staff on real tasks safely"],
  "Birthday parties": ["Play VR games with friends", "Ride a virtual roller coaster", "Cheer each other on from the queue"],
  "Weddings & marriage functions": ["A VR games corner for guests", "Keep younger guests entertained", "Something new for everyone to talk about"],
  "Anniversary celebrations": ["Relive memories in 360°", "Travel somewhere new together, virtually", "Play couple challenges in VR"],
  "Private parties": ["Multiplayer VR games", "Friendly competitions between friends", "Fun for all ages"],
  "Special occasions & promotions": ["A branded experience that pulls people in", "A demo people remember", "Get people talking online"],
};

export const ROLL_WORDS = ["exhibitions", "school fests", "festivals", "property launches", "corporate events", "birthdays", "weddings", "anniversaries", "private parties", "promotions"];
