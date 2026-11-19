# Cyphon website

Marketing site for Cyphon (VR headset rental, VR events, 360° video, real estate VR and the VR HUB console), built with
Next.js 16, React 19, Tailwind CSS 4, GSAP and hand-written WebGL. It is a rebuild of the approved static site; the
animation spec and the build history are in [`PROJECT-LOG.md`](PROJECT-LOG.md).

## Requirements

- Node.js 22.18 or newer (CI uses 24)
- npm

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in the values (see below)
npm run dev                  # http://localhost:3000
```

## Environment variables

All are read and validated in `src/lib/env.ts` (the build fails on a malformed value). Nothing is hard-coded.

| Variable | Used for |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Canonical URLs, sitemap, robots, share images, `llms.txt`. Set to the real domain before launch. |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Email shown in the footer, menu and contact page. Hidden when empty. |
| `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL` | Contact form delivery through [Resend](https://resend.com). With any of them empty the form runs in preview mode and says it is not connected. |

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build / serve it |
| `npm run lint` / `npm run typecheck` | ESLint / TypeScript |
| `npm run check:enquiry` | Self-check of the contact form validation and rate limiter |
| `npm run test:e2e` | Playwright tests against the production build (run `npm run build` first) |
| `npx next analyze` | Turbopack bundle analyzer |

A pre-commit hook (Husky) runs lint and the type check.

## Project layout

```
src/app/            routes (pages, sitemap, robots, llms.txt, share images, contact Server Action)
src/sections/       page sections, one folder per page (+ shared/)
src/components/     layout (nav, menu, footer, loader, cursor), motion helpers, UI pieces
src/gl/             WebGL scenes, loaded on demand (hero Quest + particles, tiny planet, walkthrough)
src/lib/            engine (shared motion state), reveals, scroll, SEO, contact validation
src/content/        copy and data (pages, FAQs, occasions)
src/styles/         globals.css: Tailwind theme, variants, keyframes and the shared reveal utilities
tests/e2e/          Playwright tests
```

## How the motion works (short version)

- `lib/engine.ts` holds shared state (reduced motion, pointer type, menu open, loader/morph cover) and runs layout
  re-measures. Scroll scenes (`hooks/useScrollScene.ts`) are ScrollTrigger instances created only when a section comes
  within 1.5 screens; ScrollTrigger itself is downloaded with the first scene.
- Reveals: elements with `data-reveal` / `data-split` get `.in` from one IntersectionObserver (`lib/reveal.ts`). The
  first section of a page is revealed by CSS right after first paint (`html.booted`), so it never waits for JavaScript.
- WebGL scenes load with `import()`, draw only while on screen with the menu closed, and cap the pixel ratio.

## CI

GitHub Actions (`.github/workflows/ci.yml`) runs lint, type check, the enquiry self-check and the build, then Playwright
(desktop + phone) and Lighthouse CI (`lighthouserc.json`). Accessibility, best practices, SEO and layout shift fail the
build below their budgets; performance budgets (Home 85, inner pages 90) only warn, because CI runner speed varies.

## Deploying

The site is static apart from the contact Server Action; it is set up for Vercel. Set the environment variables in the
Vercel project, and change `NEXT_PUBLIC_SITE_URL` to the production domain.
