import { INTRO } from "@/content/pages";
import type { RouteKey } from "@/content/site";
import { NextPage, PageIntro } from "./PageIntro";

// Stage-1 page shell: real hero copy, the page's sections are built in stages 3–4.
export function StubPage({ page }: { page: RouteKey }) {
  const next = INTRO[page].next;
  return (
    <div className="page" data-page={page}>
      <PageIntro page={page} />
      <div style={{ height: "60vh" }} aria-hidden="true" />
      {next && <NextPage to={next} />}
    </div>
  );
}
