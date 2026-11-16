# Cyphon web (Next.js) — project log

Next.js rebuild of the approved static site. Reference files (read-only): `C:\Users\dell\Downloads\cyphon-website\cyphon-website`
(`index.html`, `site.css`, `site.js`, `ANIMATION-SPEC.md`, `PROJECT-BRIEF.md`, `PROJECT-LOG.md`, `DESIGN-PLAYBOOK.md`).
Exact values come from `ANIMATION-SPEC.md` and the reference code; when they disagree, the code wins and the difference is noted here.

## Decisions (approved 2026-11-16)

- App lives in `web/`. The unused starter at the folder root is to be deleted after the client confirms (it contains non-default files).
- WebGL scenes are ported from the reference raw-WebGL code (typed, client-only, lazy, paused off-screen), not React Three Fiber.
- 3D model: keep `KHR_mesh_quantization`, re-encode textures to WebP with gltf-transform (stage 5).
- Lighthouse target 95+ everywhere; Home reported honestly.
- Preloader: hero headline stays painted under it; loader skipped on Save-Data or slow connections (stage 2).
- Business details: `TODO` placeholders from `.env` until the client sends them. Never invented.
- Email: Resend. Hosting: Vercel.
- Contact pre-fill: URL search params `/contact?service=…&note=…` (replaces the static site's `pendingService`/`pendingNote`).

---

## Stage 1 — 2026-11-16: setup, tokens, layout, engine, nav, menu, reveals, buttons, footer, transitions (base)

**What**

- Next.js 16.4.5 (App Router, Turbopack, TypeScript strict, `src/`), Tailwind v4 (`@tailwindcss/postcss`), GSAP 3 + ScrollTrigger, Lenis, zod.
- Routes (all static): `/`, `/vr-headset-rental`, `/vr-events`, `/360-video`, `/real-estate-vr`, `/vr-hub`, `/contact`, plus `/privacy` and `/terms` (TODO text, `noindex`). Each page currently shows its real hero copy (`StubPage`); sections arrive in stages 3–4.
- Global chrome ported 1:1: nav (G5), menu portal with live previews (G6), buttons with rolling labels and magnetic pull (G8), custom cursor (G9), tilt (G10), footer curtain (G12), split-text rise (G2), reveals with held cascade (G3), smooth wheel scroll (G4).
- Navigation base of G7: internal link clicks are intercepted, the old page's scroll is saved and restored on back/forward, the menu closes instantly (transitions off 80 ms) when a link inside it is used. The morph overlay itself is stage 2.

**How (mapping from the reference engine)**

| Reference (`site.js`) | Here |
|---|---|
| `RM`, `FINE`, `vw`, `vh`, `menuOpen`, `PRE.cover`, `busy` | `src/lib/engine.ts` (module singleton, initialised on import so every effect sees the flags) |
| `measures[]` / `measureAll()` | `addMeasure()` / `measureAll()` in `engine.ts`; run on page mount, font load, window load, resize (debounced 140 ms, width change or mouse devices) |
| `scene(el, fn, {type,start,end})` | `useScrollScene(ref, fn, opts)` on ScrollTrigger: `pin` = `top top` → `bottom bottom`; `view` = `top {start×100}%` → `bottom {end×100}%`; fn only when \|Δp\| > 0.0003 |
| `smoothStep` (lerp 0.105) | Lenis `{ lerp: 0.105, smoothWheel: true, syncTouch: false }`, mouse + no reduced motion only, driven by `gsap.ticker`, `lagSmoothing(0)`, synced with `ScrollTrigger.update` |
| `frame()` | `useTicker(fn)` on `gsap.ticker` (dt clamped to 64 ms) |
| `io` + `armReveals` + `holdReveals` + `releaseReveals` | `src/lib/reveal.ts`, same `rootMargin: 0px 0px -15% 0px`, same cascade (≤10, `gap` ms apart). Armed by `Providers` after each page mounts, so server-rendered `data-split`/`data-reveal` markup needs no client wrapper |
| `split()` | `<SplitText>` server component (identical `.w`/`.c` markup and `--i` index; `lines` prop for block lines sharing one index) |
| `charHTML` | `<Chars>` (button labels, menu links); nav chip keeps the imperative string version for its roll |
| `setMenu` | `src/lib/menu.ts` (`--mx/--my/--mr` from the burger, `menu-ready` after 1250 ms, scroll lock + `lenis.stop()`) |
| `html.motion/rm/fine` set by JS | inline `<head>` script before paint, so hidden "before" states never flash |
| hash routes `#rental` | real routes; `/#rental`-style URLs are replaced client-side with the real path |

- CSS: tokens in `:root` + Tailwind `@theme inline` (`src/styles/globals.css`); component CSS ported from `site.css` with the THEME overrides folded into final values (`chrome.css`, `pages.css`). Class names kept so JS toggles (`.in`, `.on`, `.hide`, `.compact`…) match the spec.
- Font: Archivo variable via `next/font/google` with `axes: ["wdth"]`, `display: swap`.
- Env validated with zod at build time (`src/lib/env.ts`, imported by `next.config.ts`). Contact email read from `NEXT_PUBLIC_CONTACT_EMAIL`; nothing hard-coded.
- `turbopack.root` pinned to `web/` because the parent folder has its own lockfile.

**Differences from the reference (intentional)**

- Footer column headings are `h2.foot-h` (were `h4`) to keep a clean heading order; same look.
- Footer adds Privacy and Terms links (required pages).
- Links inside `<Link>` are intercepted in the capture phase so the transition layer owns navigation.

**Tested**

- `npm run lint`, `tsc --noEmit`, `npm run build`: clean, all 11 routes static.
- Playwright (production build) at 1440×900 and 390×844: home, scrolled (nav hides on scroll down, shows on scroll up), menu open with hover preview (desktop) and stacked links (phone), menu link → Rental, footer curtain at page end, back → Home restored at y = 380 with the chip back on "Home". Zero console errors.

**Revert**: `git revert` the stage-1 commit (or delete `web/`).
