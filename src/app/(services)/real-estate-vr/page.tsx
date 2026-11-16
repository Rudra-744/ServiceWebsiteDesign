import type { Metadata } from "next";
import { StubPage } from "@/sections/shared/StubPage";

export const metadata: Metadata = { title: "Real estate VR" };

export default function Page() {
  return <StubPage page="real-estate" />;
}
