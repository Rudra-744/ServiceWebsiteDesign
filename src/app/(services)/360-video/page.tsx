import type { Metadata } from "next";
import { StubPage } from "@/sections/shared/StubPage";

export const metadata: Metadata = { title: "360° video production" };

export default function Page() {
  return <StubPage page="video" />;
}
