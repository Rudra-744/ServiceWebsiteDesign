import { INTRO } from "@/content/pages";
import { OG_SIZE, ogImage } from "@/lib/og";

export const alt = INTRO["contact"].h1;
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return ogImage(INTRO["contact"].crumb ?? "Cyphon", INTRO["contact"].h1);
}
