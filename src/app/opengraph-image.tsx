import { INTRO } from "@/content/pages";
import { OG_SIZE, ogImage } from "@/lib/og";

export const alt = INTRO["home"].h1;
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return ogImage("VR headsets, events, 360° video and VR HUB", INTRO["home"].h1);
}
