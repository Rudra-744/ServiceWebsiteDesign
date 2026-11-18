import { INTRO } from "@/content/pages";
import { OG_SIZE, ogImage } from "@/lib/og";

export const alt = INTRO["video"].h1;
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return ogImage(INTRO["video"].crumb ?? "Cyphon", INTRO["video"].h1);
}
