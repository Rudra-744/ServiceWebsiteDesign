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
- Styling: full Tailwind 4 utilities (client chose option C after stage 3); `globals.css` is the only stylesheet.
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

### Housekeeping — 2026-11-16

- The unused root starter was moved, not deleted, to `CyphonMarketingWebsite/_old-starter/` (client's choice).
- Git identity in `web/` is local only (`Cyphon`, client's email). **Change it before the first push to GitHub.**
- `npm audit`: 7 moderate, all in the dev-only ESLint toolchain (`eslint-config-next` → `@typescript-eslint/*` → `minimatch` ReDoS, GHSA-g3hv-75wg-m249). `npm audit --omit=dev`: 0. Not shipped to users; the non-forced `npm audit fix` cannot resolve it because `eslint-config-next@16.4.5` pins the range. Revisit when `eslint-config-next` updates.

---

## Stage 2 — 2026-11-16: preloader (G1) and the card-to-page morph (G7)

**What**

- **Preloader "Image reel"** (`components/layout/Preloader.tsx`), ported from `runPre()` with the spec values: frame `clamp(200px,19vw,300px)` 4:5 at 46% (phone 56vw at 44%), reel slides wipe up (`clip-path inset(100% 0 0 0)` → `inset(0)`, image 1.18 → 1, max 3 slides), first slide at 380 ms, gap `lerp(440,130,count/100)`, slide duration `min(360, gap×0.85)`, stops adding at 97; odometer rolls from .55 of each step; counter: 12 → 40 fonts → up to 85 visible images → 100 window load, floor `100×(.35k + .65·inOut(k))` over 2400 ms, creep `+dt×0.0012` (max 99), cap 7 s, easing `1 − 0.0015^(dt/1000)`. Finish: destination slide copies the page's `[data-morph-to]` colour and image box (offset-based `relBox`, `fill` → `contain`) at 420 ms, `.go` after 560 ms, after 260 ms the target is shown finished (`.morph-land .in`, hidden), the frame switches to explicit box and tweens to the target rect and radius (980 ms in-out; off screen: fade + scale 1.25 over 620 ms), white → transparent (0.7 s), nav drops in, scroll unlocks, held reveals release 320 ms later with an 80 ms cascade, then the `cy:intro` event.
- **Skip rule** (inline `<head>` script, before paint): skipped when `sessionStorage['cy-pre']` exists, with reduced motion, with `navigator.connection.saveData`, or when `effectiveType` is `slow-2g`, `2g` or `3g` (client decision: the headline must not wait behind the loader on slow devices). Otherwise `html.preloading` is set (hides the nav, holds reveals, locks scroll) before the first paint. The headline stays painted under the white layer. `.pre` is only displayed while `html.preloading` is set, so a blocked/failed script never shows a stuck loader.
- **Morph navigation** (`providers/TransitionProvider.tsx`, `lib/morph.ts`), ported from `go()`: source = nearest card (`.svc-panel, .next, .band, .rpl-card, .stack-card, .ri-card, .occ-card, .fin-portal, .tilt, .bcell, .orb-card`), the menu preview card from the menu, else the link; off screen → the nav chip. Grow 640 ms in-out (photo out over the last 45%, label in over the last 45–50% from +40 px; ink label on light colours, white on dark). Swap: menu closed instantly, old scroll saved, reveals held, `router.push(…, { scroll: false })`, wait for the new page to commit + 60 ms. Settle 820 ms out into `[data-morph-to]` (colour blend over the first ~70%, label out in the first 35%, target photo in from 20–70%), fade 260 ms; no visible target → drift up 8% while fading over 560 ms. Reveals release 160 ms into the settle. History stack of `{from, to, path}` (max 12); a link click during a morph is queued.
- **Back goes back into the card.** Browser back/forward is handled on `popstate`. Next swaps the route immediately, so the old page is held on screen as a static clone (`.morph-freeze`, z 57) while the overlay grows from the current page's `[data-morph-to]`; the clone is removed when the overlay covers the screen, the previous page is restored at its saved scroll, and the overlay shrinks into the exact card that was tapped (found again by its child-index path from `#main`, read before the push). Forward/unmatched pops grow from the nav chip and clear the stack, as in the reference. A pop during a forward morph settles into the page Next already shows instead of pushing.
- Reduced motion: no loader, instant page swap.

**Differences from the reference (implementation, same visible result)**

- Back/forward uses the freeze clone (the static site controlled history itself; Next owns it here).
- The tapped card is stored as a DOM path, because the page re-mounts after navigation.
- Skip rule adds Save-Data and 2G/3G (client decision).

**Tested** (production build, Playwright)

- Loader on Home (desktop) and Rental (phone): reel, name roll, odometer to 100, landing; nav hidden then dropped in; headline revealed after. Zero console errors.
- Home CTA → Contact grows from the button (blue), `?service=VR+event` kept; back → Home restored at y = 199 and the overlay shrinks into the same 192×54 button (traced frame by frame).
- Menu (preview card) → Rental: menu closed under the overlay. Rental "Next" → Events; back → Rental at the saved scroll, `.next` on screen.
- Reduced motion: no loader, instant navigation. Simulated 3G: `pre-skip`, no loader.

**Revert**: `git revert` the stage-2 commit.

### Fixes after stage 2 — 2026-11-16

- **Loader skip rule:** now Save-Data and `2g`/`slow-2g` only (3G shows the loader again; client decision). `/2g/` matches both `2g` and `slow-2g`. Verified: 3G → `preloading`, slow-2G → `pre-skip`.
- **Footer flash on back navigation** (see Known issues, fixed): the back/forward freeze now also clones the footer (fixed curtain under the cloned `<main>`; when the footer is static it gets the same scroll offset). Verified: back from a page scrolled to the bottom shows the footer in the frozen frame.

## Known issues

| # | Issue | Found | Status |
|---|---|---|---|
| 1 | Back navigation while scrolled to the bottom showed a white footer area for ~0.6 s (the freeze cloned only `<main>`). | Stage 2 | Fixed 2026-11-16 (footer cloned into the freeze). Re-check in the final audit. |

---

## Stage 3 — 2026-11-16: Home (H1–H13)

**What** (all values from ANIMATION-SPEC §2 and the reference code; files under `src/sections/home`, shared ones under `src/sections/shared`)

- **H1/H1b Hero** (`Hero.tsx`): occasion tabs (7.5 s cycle, progress line, arrow keys), fit-to-width font (`--hl-fs`), band clip geometry, wipe/retract timing, mouse/tap slide, "With Cyphon" tag, connector to the visor, occasion switch (letters out 0.34 s, new pair `.quick` rise, lede swap, CTA label/href, link, screen-reader sentence). CTA links now carry the note: `/contact?service=…&note=We'd like VR for …`. Pin timeline (380vh/340vh): lens clip from the visor to the screen, visor dissolve mask `--f`, headline+band fade as one layer, side text/tabs/hint exits, five captions. Shared `heroState` (progress, visor box) for the stage-5 WebGL layers.
- **H2 Manifesto** (`components/motion/ScrubWords.tsx`, shared with Events/360°).
- **H3 Orbit** (`Orbit.tsx`): ellipse, fake depth, burst-out entry, dwell-and-glide, beam redraw, card swap, tap-to-front.
- **H4 Fleet** (`shared/Fleet.tsx`, Canvas 2D, `variant="pin" | "view"` for Rental): zoom, pop-in with bubble rings, slots, ripple, VR HUB console card, counters.
- **H5 Marquee**, **H6 Services** (horizontal pin + phone stack via `hooks/useStackScene.ts`), **H7 Occasions**, **H8 Floor plan** (`shared/FloorPlan.tsx`, reused on Real estate), **H11 VR HUB teaser** (`HubTeaser.tsx`, shared clock, play signal, answers, Play/Pause), **H12 Why**, **H13 Final CTA** (`FinalCta.tsx`, Canvas 2D tunnel, portal clip, captions).
- **H9 Walkthrough** (`shared/Tour.tsx`): HUD, camera path/timeline (`lib/tourPath.ts`), room card swaps, ticks, mini-map, look-around drag and buttons, hotspot buttons. The WebGL renderer plugs into `tourRender.fn` in stage 5; until then the sky colour shows behind the HUD.
- **H10 360° planet** (`Planet.tsx`): heading fade, captions, "inside" HUD. A flat panorama strip (the reference's no-WebGL fallback) stands in until the stage-5 shader.

**Plan change (client informed):** the two Canvas 2D pieces (fleet, tunnel) were built now instead of stage 5. Stage 5 keeps only WebGL: hero particles, 3D Quest, tiny planet shader, walkthrough renderer.

**Engine changes**

- `armReveals` no longer strips `.in` and skips `data-manual`: pages re-mount on navigation, and the hero reveals its own manual elements on mount (the strip ran after the hero's effect and hid the first headline line).
- `measureAll()` ends with `ScrollTrigger.refresh()` (measures change section heights, e.g. the services track); `Providers` no longer refreshes separately.
- `SplitText` got `bare` (letters without `data-split`) for captions whose parent animates them.

**Differences from the reference**

- Fleet: the hand-drawn headset fallback shown while the photo loads was not ported (the 537 px photo loads in milliseconds); nothing is drawn for that instant.
- Planet HUD is no longer `aria-hidden` (it contains the Tilt button).

**Tested** (production build, Playwright, 1440×900 and 390×844)

- Every Home section screenshotted; pinned scenes at 10/40/65/90%. Hero autoplay wipe, tab switch (Property launches → "walk the flat.", CTA `?service=Real+estate+VR&note=We'd like VR for a property launch.`), orbit at 3 positions, fleet ripple and full sync (200/200), services horizontal track and phone stack, occasions active row + card, floor plan lens, walkthrough HUD room 2, hub teaser play + ask stages (5 yes, 3 no), tunnel step captions and the open portal.
- Loader on Home lands on the visor, then the hero intro plays. Reduced motion: scrolls through the whole page without errors.
- Zero console errors.

**Revert**: `git revert` the stage-3 commit.

---

## Tailwind conversion — 2026-11-16 (client chose option C: full Tailwind)

**What**

- All styling now lives in Tailwind 4 utilities in the components. `chrome.css`, `pages.css`, `home.css` and `tour.css` were deleted.
- `src/styles/globals.css` is the only stylesheet. It holds:
  - `@theme` tokens: colours, fonts, the three radii, eases.
  - Custom variants: `motion`, `rm`, `fine`, `fine-motion`, `menu-open`, `menu-ready`, `preloading`, `m-touch` and `in`.
  - Base rules and every keyframe.
  - Shared `@utility` classes: `split`, `split-rise`, `rv`, `fade`, `pop`, `clip-*`, `rule`, `link`, `d1`–`d4`, `lede`, `body-copy`, `tag`, `wrap`, `sec`, `sec-tight` and the morph classes.
- Repeated class sets are string constants in the component that uses them (for example `PADBTN`, `HS`, `HF_*`, `CHIP`), or in `components/ui/layout.ts` (`HEAD`, `HEAD_SPLIT`, `BAND`, `BAND_P`). `Button` exports `btnClass()`.
- Semantic class names (`.hc-play`, `.tour-room`, `.pl-cap` and so on) stay only where JS queries them.

**Conventions** (keep these in stage 4+)

- Reference `max-width:Xpx` → `max-[X+1px]:` (Tailwind's `max-[N]` means `width < N`). `min-width:Xpx` → `min-[Xpx]:`. Height or compound queries → `[@media(...)]:`.
- Use `[transform:…]` where the reference transitions `transform`. Tailwind's `translate-*` and `scale-*` set the separate `translate` and `scale` properties.
- Never put two plain utilities for the same property on one element. Override with a variant, `!` or an inline style.
- Classes toggled by JS: `[&.on]:` on the element itself, or a named group (`group/x` plus `group-[.on]/x:`) for children. Markup generated by JS is styled from its parent (`[&_.c]:`).
- Never glue a class to a template interpolation (`text-white${x}`): the scanner can't see it. Leave a space, and never build a variant prefix with `${}`.
- `font-[inherit]` compiles to `font-family`. For weight, use `[font-weight:inherit]`.
- Custom `@utility` classes sort before core utilities, so `mt-*` and `text-*` override `d2`/`lede`/`tag` without `!`.
- Renamed state classes that collided with utility names: cursor `link`/`big`/`hidden` → `is-link`/`is-big`/`is-out`; footer `static` → `is-static`.

**Fixes found while converting** (each checked against the reference)

- Hero headline: the fitted size is now 137.8 px at 1440×900, which matches the reference. Stage 3 rendered it smaller.
- Services images: the overscan (`inset:-4% -12%`, 124%×108%) now beats next/image's inline `inset:0`. Before, parallax exposed the image edge.
- Final CTA title on phones: `.fin-title` now beats `.d1`, as in the reference (40.6 px at 390 px wide).
- Hero "For" chips (`.chips`/`.chip`) under the planet were unstyled in stage 3. They now have the reference styles.

**Differences from the reference**

- Why rows: in motion mode the `rv`/`fade` reveal transitions replace the 0.4 s colour transition, so the hover text colour changes instantly. The fill wipe is unchanged.

**Tested** (production build, Playwright, 1440×900 and 390×844)

- Re-ran the stage-3 screenshot set and pixel-diffed it against stage 3. Most shots differ by under 1 %. Every larger difference comes from the three fixes above (hero size, services overscan, phone CTA title).
- Found and fixed during the check:
  - Active hero tab text was invisible: the class was glued to an interpolation.
  - Nav chip, loader name and orbit caption text rendered bold, because of `font-[inherit]`.
- Loader and reduced-motion script: no errors. Zero console errors. `tsc`, `lint` and `build` pass.

**Revert**: `git revert` this commit (the deleted CSS files come back with it).
