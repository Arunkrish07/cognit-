# Cognit 3D Redesign — Design Spec

**Date:** 2026-10-06
**Status:** Draft for review
**Author:** PkVishful + Claude

## 1. Goal & Intent

Rework the existing **Cognit** marketing site (a solo web/app/AI studio) into a
heavily 3D, immersive experience built on **react-three-fiber (R3F)**. Every page
(`/`, `/work`, `/services`, `/process`, `/faq`) gets its own interactive 3D scene.

The creative concept is a **"floating digital workspace"**: clean geometric
devices (laptop, phone) and UI panels float in the cool near-black space Cognit
already uses, displaying the actual work. The site should feel like one coherent
studio environment the visitor moves through.

**Success looks like:**
- Each route presents an interactive R3F scene that reacts to cursor/scroll.
- The site reads as one visual system — 3D palette derived from existing CSS tokens.
- No user is ever stranded: reduced-motion / no-WebGL / low-power devices get a
  tasteful static fallback, and all real content lives in the DOM.
- Performance stays acceptable: single clamped GL context per page, adaptive
  quality, lazy mount, offscreen pause.

**Decisions locked during brainstorming:**
- Direction: **interactive R3F scene** (not shader-only, not 2D-with-accents).
- Depth: **every page immersive**.
- Concept: **floating digital workspace** (procedural devices showing real work).
- Content: **open to change** — copy and page structure may be rewritten to fit.
- Canvas architecture: **B — per-page canvas** (each page mounts/unmounts its own
  `<Canvas>`). Chosen by the user over a persistent global canvas. Mitigations for
  the navigation flash are part of this spec (see §6).

## 2. Non-Goals (YAGNI)

- No downloaded GLTF/heavy 3D model assets — devices are built procedurally.
- No global persistent canvas or cross-route camera continuity (that was option A,
  not chosen).
- No CMS, no backend, no new data sources — reuse `data/*.ts`.
- No VR/AR, no physics engine, no audio.
- No change to the deployment target or the existing routing model.

## 3. Current State (baseline)

- **Framework:** Next.js 16.3.6 (App Router), React 19.2, TypeScript, Tailwind v4.
- **Routes:** `app/page.tsx` (home), `app/work`, `app/services`, `app/process`,
  `app/faq`, plus `layout.tsx`, `template.tsx` (per-navigation fade + scroll reset),
  `globals.css`.
- **Motion stack:** `framer-motion`, `gsap`, `lenis` (smooth scroll via `lib/lenis`).
- **Current 3D:** `@designcodeio/threeui` `StructureFlowCollection` powers only the
  hero backdrop via `components/HeroBackground.tsx`.
- **Design system ("Ink & Lime"):** dark default, cool near-black `--bg #060709`,
  cool off-white text, blue accent `--accent #4f83f7` / fill `#2563eb`; light theme
  = warm paper. Fonts: Space Grotesk (headings), Plus Jakarta Sans (body), JetBrains
  Mono (labels). Glass nav, pill buttons, 16px card radius.
- **Content:** mostly placeholders — `site.ts` has `Your Name`/`91XXXXXXXXXX`,
  `projects.ts` has 3 sample projects with `picsum.photos` images, `services.ts` has
  4 services + 1 combo. Content may be rewritten but the **data-module shape is
  reused**.

## 4. Architecture

### 4.1 Dependencies
- **Add:** `three`, `@react-three/fiber` (v9, React-19 compatible),
  `@react-three/drei`, `@react-three/postprocessing` (bloom, high-quality tier only).
  Exact compatible versions confirmed at implementation time against the bundled
  `node_modules/next/dist/docs` and the R3F React-19 compatibility matrix.
- **Remove:** `@designcodeio/threeui` and `components/HeroBackground.tsx` once the
  R3F hero replaces them.

### 4.2 New module layout
```
components/three/
  Scene.tsx              # client-only <Canvas> wrapper (perf, suspense, lazy mount)
  SceneFallback.tsx      # static poster shown when 3D disabled
  env/
    Lighting.tsx         # shared lights + rim/bloom config
    materials.ts         # shared materials derived from CSS tokens
    textureCache.ts      # module-level texture cache reused across routes
  primitives/
    DeviceLaptop.tsx     # procedural rounded-box laptop; screen = textured plane
    DevicePhone.tsx      # procedural phone
    FloatingScreen.tsx   # single floating panel showing a project image
    Panel.tsx            # generic UI card panel
  scenes/
    HomeScene.tsx
    WorkScene.tsx
    ServicesScene.tsx
    ProcessScene.tsx
    FaqScene.tsx
lib/three/
  use3DEnabled.ts        # capability gate hook
  useCursorParallax.ts
  useLenisScroll.ts      # bridge Lenis scroll -> normalized scene progress
  tokens.ts              # read CSS custom props -> THREE.Color at runtime
```

### 4.3 `Scene.tsx` contract
- **Purpose:** one place that owns the `<Canvas>` and all performance policy.
- **Props:** `children` (the scene graph), `className`, optional `camera` overrides,
  `fallback` (poster node).
- **Behavior:**
  - Client-only (`"use client"`); dynamically imported with `ssr: false` so no
    WebGL code runs during SSR.
  - `dpr={[1, 2]}` clamp; drei `PerformanceMonitor` + `AdaptiveDpr`/`AdaptiveEvents`
    to step quality down under load.
  - Wraps scene in `<Suspense>` with a lightweight loader.
  - **Lazy mount:** canvas only mounts once its wrapper intersects the viewport
    (IntersectionObserver); renders the poster until then.
  - **Offscreen/hidden pause:** `frameloop="demand"` or invalidation-driven where
    the scene is static-ish; pause on `document.hidden`.
  - Canvas element is `aria-hidden`.
- **Dependency:** reads `use3DEnabled()`; if disabled, renders `SceneFallback`
  instead of `<Canvas>` and never imports the heavy bundle.

### 4.4 `use3DEnabled.ts` contract
- Returns `boolean` (plus maybe a quality tier `'off' | 'low' | 'high'`).
- `false` when any of: `prefers-reduced-motion: reduce`, no WebGL2 context, coarse
  pointer + low `navigator.hardwareConcurrency` (mobile/low-power heuristic), or a
  `?no3d` escape-hatch query param.
- SSR-safe: returns `false` on the server, re-evaluates on mount (so first paint is
  the fallback, never a hydration mismatch).
- Pure, unit-testable: the decision logic is a separate pure function fed a
  capabilities object.

### 4.5 Device/panel primitives
- **Procedural geometry only** — rounded boxes (`RoundedBox` from drei) for bodies,
  planes for screens. Screens textured from real project images via the shared
  `textureCache`. Keeps bundle small and style consistent.
- Each primitive is self-contained: takes props (dimensions, texture URL, position,
  tilt) and does not reach into global scene state.

### 4.6 Scroll & cursor bridges
- `useLenisScroll` subscribes to the existing Lenis instance (`lib/lenis`) and
  exposes a normalized `0..1` progress for the current section; scenes read it to
  drive parallax/camera. Falls back to native scroll if Lenis absent.
- `useCursorParallax` exposes a smoothed pointer vector for tilt/orbit; disabled
  under reduced motion.

### 4.7 Route-transition flash mitigation (per-page canvas trade-off)
Because each page unmounts its canvas (option B), we reduce the re-init cost:
- Keep `template.tsx`'s opacity cross-fade covering the mount gap.
- Module-level `textureCache` persists across route changes (survives canvas
  unmount) so re-mounting reuses decoded textures.
- Scenes mount lazily behind the poster, so the first frame after navigation is the
  poster, then the canvas fades in — no black flash.
- Preload key textures via the existing `components/Preloader.tsx`.

## 5. Per-Page Scenes

All scenes keep the **real content in the DOM** (headings, paragraphs, links,
buttons) layered over or beside the canvas; the 3D is an enhancement.

- **Home (`/`)** — Hero workspace cluster: laptop + phone + 2–3 floating UI panels,
  slow idle orbit, cursor parallax/tilt; scroll parallaxes panels outward. Existing
  headline, subcopy, CTAs (WhatsApp + "See my work"), and trust strip stay as DOM.
  Below the hero, the current `Problem` and `CTABand` sections are restyled to sit
  in the same 3D space (lighter accents).
- **Work (`/work`)** — Centerpiece portfolio. Floating project screens arranged in a
  gallery; cursor/scroll drifts the gallery; clicking a screen dollies the camera to
  focus it and opens the existing `ProjectModal`. Reuses `projects.ts` +
  `filterProjects`; the filter chips remain DOM controls. Keyboard users select
  projects from a DOM list (not canvas picking).
- **Services (`/services`)** — Each service is a floating module/card arranged in a
  ring or arc; hover lifts and highlights; content from `services.ts` +
  `featuredCombo`. Detail (whatYouGet/timeline) shown in DOM on select.
- **Process (`/process`)** — Scroll-driven path: steps are waypoints; camera/objects
  advance per step, wired to the existing `.process-step.is-active` logic and GSAP
  ScrollTrigger. DOM step copy stays authoritative.
- **FAQ (`/faq`)** — Lightest scene (calm floating-panel field) behind a glass DOM
  accordion, to preserve perf headroom. Reuses `faq.ts` + `FAQ.tsx`.

## 6. Accessibility & Performance (non-negotiable)

- **Content in DOM:** every heading, paragraph, link, and control exists as real
  accessible DOM. Canvas is `aria-hidden`. No information lives only in 3D.
- **Keyboard/SR:** all actions (open project, pick service, read FAQ) operable via
  DOM; canvas picking is an enhancement, never the only path.
- **Fallback:** reduced-motion / no-WebGL / low-power → `SceneFallback` poster
  (gradient + representative image). `?no3d` forces fallback.
- **Perf budget:** dpr clamp `[1,2]`; adaptive quality via `PerformanceMonitor`;
  lazy mount on intersect; pause on hidden/offscreen; procedural geometry; textures
  cached & preloaded; postprocessing (bloom) only on the high tier.

## 7. Build Phasing

1. **P1 — Foundation:** add deps, build `Scene`, `SceneFallback`, `use3DEnabled`,
   token/scroll/cursor bridges, device primitives; replace the Home hero; delete
   `threeui`/`HeroBackground`.
2. **P2 — Work:** `WorkScene` + camera-focus + `ProjectModal` integration.
3. **P3 — Services / Process / FAQ:** remaining scenes.
4. **P4 — Polish:** postprocessing, texture-cache tuning, full perf + a11y pass,
   mobile verification.

Each phase is independently shippable (a page without its scene still renders the
DOM fallback).

## 8. Testing Strategy

- **TDD on pure logic:** the `use3DEnabled` decision function, the Lenis→progress
  normalization math, camera-focus target math, and reused `filterProjects`.
- **Playwright smoke test:** each route renders its DOM content and mounts either a
  canvas or the fallback, with **no console errors**; reduced-motion run asserts the
  fallback path.
- **Visual verification:** run the dev server and screenshot each scene (via the
  `run` skill / browser automation); 3D visuals are not unit-tested.
- **Fallback verification:** force `?no3d` and `prefers-reduced-motion` and confirm
  posters + full content.

## 9. Risks & Open Questions

- **R3F / React 19 / Next 16 compatibility:** must pin known-good versions; verify
  against bundled `next/dist/docs` before coding (per `AGENTS.md`).
- **Per-page canvas jank:** mitigated per §4.7; if navigation flash remains
  objectionable, revisit option A (persistent canvas) as a follow-up — out of scope
  here.
- **Mobile perf:** immersive-everywhere is heavy; the low-power heuristic may route
  many phones to the fallback. Acceptable per the accessibility stance; tune
  thresholds in P4.
- **Placeholder content:** real project images/copy still `REPLACE`-marked; scenes
  must look right with placeholders and with real assets.

## 10. Attribution

Spec authored collaboratively; implementation to follow via the writing-plans skill
after spec approval.
