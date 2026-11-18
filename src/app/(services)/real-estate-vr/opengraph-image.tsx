import { INTRO } from "@/content/pages";
import { OG_SIZE, ogImage } from "@/lib/og";

export const alt = INTRO["real-estate"].h1;
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return ogImage(INTRO["real-estate"].crumb ?? "Cyphon", INTRO["real-estate"].h1);
}
