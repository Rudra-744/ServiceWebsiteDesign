import type { Metadata } from "next";
import { StubPage } from "@/sections/shared/StubPage";

export const metadata: Metadata = { title: "Contact" };

export default function Page() {
  return <StubPage page="contact" />;
}
