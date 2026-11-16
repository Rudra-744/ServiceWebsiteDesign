import type { Metadata } from "next";
import { StubPage } from "@/sections/shared/StubPage";

export const metadata: Metadata = { title: "VR headset rental" };

export default function Page() {
  return <StubPage page="rental" />;
}
