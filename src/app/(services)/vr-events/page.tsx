import type { Metadata } from "next";
import { StubPage } from "@/sections/shared/StubPage";

export const metadata: Metadata = { title: "VR events" };

export default function Page() {
  return <StubPage page="events" />;
}
