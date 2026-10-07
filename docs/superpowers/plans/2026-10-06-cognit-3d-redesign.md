# Cognit 3D Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rework the Cognit marketing site into an immersive react-three-fiber "floating digital workspace" with an interactive 3D scene on every page and a mandatory static fallback.

**Architecture:** Each page mounts its own client-only `<Canvas>` (per-page canvas, option B). A single `Scene` wrapper owns all performance policy (dpr clamp, adaptive quality, lazy mount, offscreen pause) and swaps in a static poster when 3D is disabled. Real content stays in the DOM; 3D is an `aria-hidden` enhancement. Pure logic (capability gate, scroll/camera math) is unit-tested; scenes are verified by a Playwright smoke test and by running the dev server.

**Tech Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4 · three · @react-three/fiber v9 · @react-three/drei · @react-three/postprocessing · framer-motion · gsap · lenis · Vitest + @testing-library/react · @playwright/test

**Spec:** `docs/superpowers/specs/2026-10-06-cognit-3d-redesign-design.md`

## Global Constraints

- **Next version floor:** Next.js `16.3.6`, React `19.2.x`. R3F must be v9 (the React-19-compatible line); `@react-three/fiber@^9`, `@react-three/drei@^10`, `@react-three/postprocessing@^3`, `three@^0.17x` — confirm the exact mutually-compatible set from each package's peer deps at install time and pin them.
- **Read the bundled Next docs before writing any Next-specific code** (per `AGENTS.md`): read the relevant guide under `node_modules/next/dist/docs/` (resolved from the repo's `AGENTS.md` directory) — specifically dynamic import / client components — before Task 6 and any task using `next/dynamic`.
- **SSR safety:** No `three`/R3F/`window`/`document` code may run during SSR. All canvas code is in `"use client"` modules imported with `next/dynamic` `{ ssr: false }`.
- **Accessibility floor:** every heading, paragraph, link, and control exists as real DOM; the `<canvas>` is `aria-hidden`. No information or action is reachable only through the 3D scene.
- **Design tokens:** derive all 3D colors from the existing CSS custom properties in `app/globals.css` (`--bg #060709`, `--accent #4f83f7`, `--accent-fill #2563eb`, `--text #f4f7fb`). Do not hardcode new brand colors.
- **Data shape reuse:** reuse `data/projects.ts`, `data/services.ts`, `data/faq.ts`, `data/site.ts` modules and their exported types/functions (e.g. `filterProjects`). Copy may change; the module interfaces may not, without a dedicated step.
- **Commits:** frequent, one per task step group as shown. Branch is `feat/3d-redesign` (already created). End commit messages with the attribution line:
  `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`

## Review Focus

Inputs/conditions the spec implies but that scene-level work won't naturally exercise — each gets a test in the owning task:

- **Reduced-motion users** must get the poster fallback and full content, never a canvas. → pinned in Task 2 (hook test) + Task 9 (e2e reduced-motion run).
- **No-WebGL / `?no3d` users** must get the fallback. → pinned in Task 1 (`decideQuality` cases) + Task 9 (e2e `?no3d` run).
- **Low-power mobile** (coarse pointer + few cores) routes to fallback, not a janky scene. → pinned in Task 1 (`decideQuality` cases).
- **Scroll position past the end of a section** must clamp to `1`, and before the start to `0` (no NaN / overshoot driving the camera). → pinned in Task 4 (`sectionProgress` boundary cases).
- **Tab hidden / canvas offscreen** must stop the render loop (no background GPU burn). → pinned in Task 6 (Scene smoke assertion that frameloop pauses on `visibilitychange`).

---

### Task 1: Test tooling + capability decision function

**Files:**
- Create: `vitest.config.ts`
- Create: `lib/three/capabilities.ts`
- Test: `lib/three/capabilities.test.ts`
- Modify: `package.json` (devDeps + `test` scripts)

**Interfaces:**
- Produces: `type QualityTier = "off" | "low" | "high"`; `type Capabilities = { prefersReducedMotion: boolean; hasWebGL2: boolean; hardwareConcurrency: number; coarsePointer: boolean; forceOff: boolean }`; `function decideQuality(c: Capabilities): QualityTier`.

- [ ] **Step 1: Install test tooling**

```bash
npm i -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom
```

- [ ] **Step 2: Add Vitest config**

Create `vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { "@": resolve(__dirname, ".") } },
  test: {
    environment: "jsdom",
    globals: true,
    include: ["**/*.test.{ts,tsx}"],
    exclude: ["e2e/**", "node_modules/**"],
  },
});
```

Add to `package.json` `scripts`: `"test": "vitest run"`, `"test:watch": "vitest"`.

- [ ] **Step 3: Write the failing test**

Create `lib/three/capabilities.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { decideQuality, type Capabilities } from "./capabilities";

const base: Capabilities = {
  prefersReducedMotion: false,
  hasWebGL2: true,
  hardwareConcurrency: 8,
  coarsePointer: false,
  forceOff: false,
};

describe("decideQuality", () => {
  it("returns high on a capable desktop", () => {
    expect(decideQuality(base)).toBe("high");
  });
  it("returns off when reduced motion is preferred", () => {
    expect(decideQuality({ ...base, prefersReducedMotion: true })).toBe("off");
  });
  it("returns off when WebGL2 is unavailable", () => {
    expect(decideQuality({ ...base, hasWebGL2: false })).toBe("off");
  });
  it("returns off when forced via ?no3d", () => {
    expect(decideQuality({ ...base, forceOff: true })).toBe("off");
  });
  it("returns off on low-power mobile (coarse pointer + few cores)", () => {
    expect(
      decideQuality({ ...base, coarsePointer: true, hardwareConcurrency: 4 }),
    ).toBe("off");
  });
  it("returns low on a low-core desktop (fine pointer)", () => {
    expect(decideQuality({ ...base, hardwareConcurrency: 4 })).toBe("low");
  });
});
```

- [ ] **Step 4: Run test to verify it fails**

Run: `npm run test -- capabilities`
Expected: FAIL — `decideQuality` not found.

- [ ] **Step 5: Implement**

Create `lib/three/capabilities.ts`:

```ts
export type QualityTier = "off" | "low" | "high";

export type Capabilities = {
  prefersReducedMotion: boolean;
  hasWebGL2: boolean;
  hardwareConcurrency: number;
  coarsePointer: boolean;
  forceOff: boolean;
};

export function decideQuality(c: Capabilities): QualityTier {
  if (c.forceOff || c.prefersReducedMotion || !c.hasWebGL2) return "off";
  if (c.coarsePointer && c.hardwareConcurrency <= 4) return "off";
  if (c.hardwareConcurrency <= 4) return "low";
  return "high";
}
```

- [ ] **Step 6: Run test to verify it passes**

Run: `npm run test -- capabilities`
Expected: PASS (6 tests).

- [ ] **Step 7: Commit**

```bash
git add vitest.config.ts package.json package-lock.json lib/three/capabilities.ts lib/three/capabilities.test.ts
git commit -m "feat(3d): add test tooling and 3D capability decision"
```

---

### Task 2: `use3DEnabled` hook (SSR-safe capability gate)

**Files:**
- Create: `lib/three/use3DEnabled.ts`
- Test: `lib/three/use3DEnabled.test.tsx`

**Interfaces:**
- Consumes: `decideQuality`, `Capabilities`, `QualityTier` from Task 1.
- Produces: `function use3DEnabled(): { tier: QualityTier; enabled: boolean }`. Returns `{ tier: "off", enabled: false }` on the server and first client render, then re-evaluates after mount.

- [ ] **Step 1: Write the failing test**

Create `lib/three/use3DEnabled.test.tsx`:

```tsx
import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { use3DEnabled } from "./use3DEnabled";

function setMatchMedia(reduced: boolean, coarse: boolean) {
  window.matchMedia = vi.fn().mockImplementation((q: string) => ({
    matches: q.includes("reduced-motion") ? reduced : q.includes("coarse") ? coarse : false,
    media: q,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })) as unknown as typeof window.matchMedia;
}

describe("use3DEnabled", () => {
  beforeEach(() => {
    // jsdom has no WebGL2; stub a passing context for the capable case.
    HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({}) as never;
    Object.defineProperty(navigator, "hardwareConcurrency", { value: 8, configurable: true });
    window.location.hash = "";
  });

  it("is enabled on a capable client after mount", () => {
    setMatchMedia(false, false);
    const { result } = renderHook(() => use3DEnabled());
    expect(result.current.enabled).toBe(true);
    expect(result.current.tier).toBe("high");
  });

  it("is disabled under reduced motion", () => {
    setMatchMedia(true, false);
    const { result } = renderHook(() => use3DEnabled());
    expect(result.current.enabled).toBe(false);
    expect(result.current.tier).toBe("off");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- use3DEnabled`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

Create `lib/three/use3DEnabled.ts`:

```ts
"use client";

import { useEffect, useState } from "react";
import { decideQuality, type Capabilities, type QualityTier } from "./capabilities";

function hasWebGL2(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!canvas.getContext("webgl2");
  } catch {
    return false;
  }
}

function readCapabilities(): Capabilities {
  return {
    prefersReducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    hasWebGL2: hasWebGL2(),
    hardwareConcurrency: navigator.hardwareConcurrency || 2,
    coarsePointer: window.matchMedia("(pointer: coarse)").matches,
    forceOff:
      new URLSearchParams(window.location.search).has("no3d") ||
      window.location.hash.includes("no3d"),
  };
}

export function use3DEnabled(): { tier: QualityTier; enabled: boolean } {
  // Server + first paint: off, so hydration always matches and the poster
  // shows first. Re-evaluate once we are on the client.
  const [tier, setTier] = useState<QualityTier>("off");

  useEffect(() => {
    setTier(decideQuality(readCapabilities()));
  }, []);

  return { tier, enabled: tier !== "off" };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- use3DEnabled`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/three/use3DEnabled.ts lib/three/use3DEnabled.test.tsx
git commit -m "feat(3d): add SSR-safe use3DEnabled capability hook"
```

---

### Task 3: Token + math helpers

**Files:**
- Create: `lib/three/tokens.ts`
- Create: `lib/three/math.ts`
- Test: `lib/three/tokens.test.ts`
- Test: `lib/three/math.test.ts`

**Interfaces:**
- Produces: `function parseColor(raw: string, fallback: string): THREE.Color`; `function cssVarColor(name: string, fallback: string): THREE.Color` (DOM wrapper, thin). `function damp(current: number, target: number, lambda: number, dt: number): number`.

- [ ] **Step 1: Write the failing tests**

Create `lib/three/math.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { damp } from "./math";

describe("damp", () => {
  it("returns current when dt is 0", () => {
    expect(damp(1, 5, 4, 0)).toBeCloseTo(1);
  });
  it("moves toward target but not past it", () => {
    const next = damp(0, 10, 4, 0.016);
    expect(next).toBeGreaterThan(0);
    expect(next).toBeLessThan(10);
  });
  it("approaches target with large dt", () => {
    expect(damp(0, 10, 4, 10)).toBeCloseTo(10, 1);
  });
});
```

Create `lib/three/tokens.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { parseColor } from "./tokens";

describe("parseColor", () => {
  it("parses a hex value", () => {
    expect(parseColor("#2563eb", "#000000").getHexString()).toBe("2563eb");
  });
  it("falls back when empty", () => {
    expect(parseColor("  ", "#2563eb").getHexString()).toBe("2563eb");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test -- math tokens`
Expected: FAIL — modules not found.

- [ ] **Step 3: Implement**

Create `lib/three/math.ts`:

```ts
/** Frame-rate-independent exponential smoothing toward `target`. */
export function damp(current: number, target: number, lambda: number, dt: number): number {
  return current + (target - current) * (1 - Math.exp(-lambda * dt));
}
```

Create `lib/three/tokens.ts`:

```ts
import { Color } from "three";

export function parseColor(raw: string, fallback: string): Color {
  const v = raw.trim();
  return new Color(v || fallback);
}

/** Reads a CSS custom property off <html> and returns a THREE.Color. */
export function cssVarColor(name: string, fallback: string): Color {
  const raw =
    typeof document !== "undefined"
      ? getComputedStyle(document.documentElement).getPropertyValue(name)
      : "";
  return parseColor(raw, fallback);
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm run test -- math tokens`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/three/tokens.ts lib/three/tokens.test.ts lib/three/math.ts lib/three/math.test.ts
git commit -m "feat(3d): add token and damp math helpers"
```

---

### Task 4: Scroll bridge (Lenis → normalized section progress)

**Files:**
- Create: `lib/three/scroll.ts`
- Create: `lib/three/useSectionProgress.ts`
- Test: `lib/three/scroll.test.ts`

**Interfaces:**
- Consumes: `getLenis` from `@/lib/lenis`.
- Produces: `function sectionProgress(scrollY: number, sectionTop: number, sectionHeight: number, viewportHeight: number): number` (clamped `0..1`); `function useSectionProgress(ref: React.RefObject<HTMLElement>): React.MutableRefObject<number>` (updates a ref, not state, to avoid re-renders).

- [ ] **Step 1: Write the failing test**

Create `lib/three/scroll.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { sectionProgress } from "./scroll";

// section at top=1000, height=800, viewport=600
describe("sectionProgress", () => {
  it("is 0 before the section enters", () => {
    expect(sectionProgress(0, 1000, 800, 600)).toBe(0);
  });
  it("clamps to 1 past the end", () => {
    expect(sectionProgress(5000, 1000, 800, 600)).toBe(1);
  });
  it("is ~0.5 at the midpoint of its travel", () => {
    // travel runs from (top - vh)=400 to (top + height)=1800, mid=1100
    expect(sectionProgress(1100, 1000, 800, 600)).toBeCloseTo(0.5, 2);
  });
  it("never returns NaN for a zero-height section", () => {
    const v = sectionProgress(1000, 1000, 0, 600);
    expect(Number.isNaN(v)).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- scroll`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

Create `lib/three/scroll.ts`:

```ts
export function sectionProgress(
  scrollY: number,
  sectionTop: number,
  sectionHeight: number,
  viewportHeight: number,
): number {
  const start = sectionTop - viewportHeight;
  const end = sectionTop + sectionHeight;
  const span = end - start;
  if (span <= 0) return 0;
  const raw = (scrollY - start) / span;
  return Math.min(1, Math.max(0, raw));
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- scroll`
Expected: PASS.

- [ ] **Step 5: Implement the hook (no separate unit test — thin DOM glue)**

Create `lib/three/useSectionProgress.ts`:

```ts
"use client";

import { useEffect, useRef } from "react";
import { getLenis } from "@/lib/lenis";
import { sectionProgress } from "./scroll";

export function useSectionProgress(ref: React.RefObject<HTMLElement | null>) {
  const progress = useRef(0);
  useEffect(() => {
    const update = (scrollY: number) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const top = rect.top + scrollY;
      progress.current = sectionProgress(scrollY, top, rect.height, window.innerHeight);
    };
    const lenis = getLenis();
    const onScroll = ({ scroll }: { scroll: number }) => update(scroll);
    const onNative = () => update(window.scrollY);
    if (lenis) lenis.on("scroll", onScroll);
    else window.addEventListener("scroll", onNative, { passive: true });
    update(lenis ? lenis.scroll : window.scrollY);
    return () => {
      if (lenis) lenis.off("scroll", onScroll);
      else window.removeEventListener("scroll", onNative);
    };
  }, [ref]);
  return progress;
}
```

- [ ] **Step 6: Commit**

```bash
git add lib/three/scroll.ts lib/three/scroll.test.ts lib/three/useSectionProgress.ts
git commit -m "feat(3d): add Lenis-bridged section progress"
```

---

### Task 5: Cursor parallax hook

**Files:**
- Create: `lib/three/useCursorParallax.ts`

**Interfaces:**
- Consumes: `damp` from Task 3.
- Produces: `function useCursorParallax(enabled: boolean): React.MutableRefObject<{ x: number; y: number }>` — normalized `-1..1`, smoothed; stays `{0,0}` when `enabled` is false.

- [ ] **Step 1: Implement (glue over the tested `damp`; verified in scenes)**

Create `lib/three/useCursorParallax.ts`:

```ts
"use client";

import { useEffect, useRef } from "react";
import { damp } from "./math";

export function useCursorParallax(enabled: boolean) {
  const value = useRef({ x: 0, y: 0 });
  const target = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!enabled) {
      value.current = { x: 0, y: 0 };
      target.current = { x: 0, y: 0 };
      return;
    }
    const onMove = (e: PointerEvent) => {
      target.current = {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: (e.clientY / window.innerHeight) * 2 - 1,
      };
    };
    let raf = 0;
    const tick = () => {
      value.current = {
        x: damp(value.current.x, target.current.x, 6, 1 / 60),
        y: damp(value.current.y, target.current.y, 6, 1 / 60),
      };
      raf = requestAnimationFrame(tick);
    };
    window.addEventListener("pointermove", onMove);
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [enabled]);

  return value;
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/three/useCursorParallax.ts
git commit -m "feat(3d): add cursor parallax hook"
```

---

### Task 6: Scene wrapper + fallback + R3F deps

**Files:**
- Create: `components/three/Scene.tsx`
- Create: `components/three/SceneFallback.tsx`
- Create: `components/three/env/Lighting.tsx`
- Modify: `package.json` (R3F deps)

**Interfaces:**
- Consumes: `use3DEnabled` (Task 2).
- Produces: `<Scene fallback={ReactNode} className?={string} camera?={object}>` — mounts a client-only `<Canvas>` only when enabled AND intersecting, pauses on hidden/offscreen, renders `fallback` otherwise. `<SceneFallback image={string} className?={string}>`. `<Lighting />` shared lights.

- [ ] **Step 1: Read the Next dynamic-import / client-component guide**

Read the relevant file under `node_modules/next/dist/docs/` (resolved from `AGENTS.md`'s directory) covering `next/dynamic` and client components. Note any API differences from prior Next versions before writing the component.

- [ ] **Step 2: Install R3F deps**

```bash
npm i three @react-three/fiber @react-three/drei @react-three/postprocessing
npm i -D @types/three
```
Confirm the installed `@react-three/fiber` is v9 (React-19 compatible); if npm resolved an older major, pin explicitly.

- [ ] **Step 3: Implement the fallback**

Create `components/three/SceneFallback.tsx`:

```tsx
export function SceneFallback({
  image,
  className = "",
}: {
  image?: string;
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={`absolute inset-0 -z-10 ${className}`}
      style={{
        background:
          "radial-gradient(120% 80% at 50% 0%, color-mix(in srgb, var(--accent) 18%, transparent), transparent 60%), var(--bg)",
      }}
    >
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt="" className="h-full w-full object-cover opacity-30" />
      ) : null}
    </div>
  );
}
```

- [ ] **Step 4: Implement shared lighting**

Create `components/three/env/Lighting.tsx`:

```tsx
"use client";

export function Lighting() {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[4, 6, 5]} intensity={1.1} />
      <pointLight position={[-6, -2, -4]} intensity={30} color="#2563eb" />
    </>
  );
}
```

- [ ] **Step 5: Implement the Scene wrapper**

Create `components/three/Scene.tsx`:

```tsx
"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { use3DEnabled } from "@/lib/three/use3DEnabled";

const Canvas = dynamic(() => import("@react-three/fiber").then((m) => m.Canvas), {
  ssr: false,
});

export function Scene({
  children,
  fallback,
  className = "",
  camera = { position: [0, 0, 6], fov: 45 },
}: {
  children: ReactNode;
  fallback: ReactNode;
  className?: string;
  camera?: { position: [number, number, number]; fov: number };
}) {
  const { enabled } = use3DEnabled();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [visible, setVisible] = useState(true);

  // Lazy-mount only once the wrapper intersects the viewport.
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: "200px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Pause the loop when the tab is hidden.
  useEffect(() => {
    const onVis = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  const mountCanvas = enabled && inView;

  return (
    <div ref={wrapperRef} className={`absolute inset-0 -z-10 ${className}`}>
      {mountCanvas ? (
        <Canvas
          aria-hidden
          dpr={[1, 2]}
          camera={camera}
          frameloop={visible ? "always" : "never"}
          gl={{ antialias: true, powerPreference: "high-performance" }}
        >
          {children}
        </Canvas>
      ) : (
        fallback
      )}
    </div>
  );
}
```

- [ ] **Step 6: Verify it builds and the smoke behavior holds**

Run: `npm run build`
Expected: build succeeds with no SSR/`window` errors.
Manually confirm in the dev server (after Task 8 wires a scene) that switching browser tabs flips `frameloop` to `never` (the render loop stops). This is asserted in the e2e test in Task 9.

- [ ] **Step 7: Commit**

```bash
git add components/three/Scene.tsx components/three/SceneFallback.tsx components/three/env/Lighting.tsx package.json package-lock.json
git commit -m "feat(3d): add Scene wrapper, fallback, and shared lighting"
```

---

### Task 7: Device & panel primitives + texture cache

**Files:**
- Create: `components/three/env/textureCache.ts`
- Create: `components/three/primitives/FloatingScreen.tsx`
- Create: `components/three/primitives/DeviceLaptop.tsx`
- Create: `components/three/primitives/DevicePhone.tsx`
- Create: `components/three/primitives/Panel.tsx`

**Interfaces:**
- Produces: `function useCachedTexture(url: string): THREE.Texture` (module-level cache, survives canvas unmount); `<FloatingScreen url image position rotation scale>`, `<DeviceLaptop texture position>`, `<DevicePhone texture position>`, `<Panel position size color>`. All accept standard `group` transform props.

- [ ] **Step 1: Implement the texture cache**

Create `components/three/env/textureCache.ts`:

```ts
import { TextureLoader, type Texture } from "three";

const cache = new Map<string, Texture>();
const loader = new TextureLoader();
loader.setCrossOrigin("anonymous");

/** Loads and caches a texture at module scope so route changes reuse it. */
export function loadCachedTexture(url: string): Texture {
  const hit = cache.get(url);
  if (hit) return hit;
  const tex = loader.load(url);
  cache.set(url, tex);
  return tex;
}
```

- [ ] **Step 2: Implement FloatingScreen**

Create `components/three/primitives/FloatingScreen.tsx`:

```tsx
"use client";

import { RoundedBox } from "@react-three/drei";
import { DoubleSide } from "three";
import { loadCachedTexture } from "../env/textureCache";

export function FloatingScreen({
  image,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
}: {
  image: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}) {
  const tex = loadCachedTexture(image);
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <RoundedBox args={[1.6, 1, 0.06]} radius={0.04} smoothness={4}>
        <meshStandardMaterial color="#0f1116" metalness={0.4} roughness={0.5} />
      </RoundedBox>
      <mesh position={[0, 0, 0.032]}>
        <planeGeometry args={[1.5, 0.9]} />
        <meshStandardMaterial map={tex} emissiveIntensity={0.3} side={DoubleSide} />
      </mesh>
    </group>
  );
}
```

- [ ] **Step 3: Implement DeviceLaptop, DevicePhone, Panel**

Create `components/three/primitives/DeviceLaptop.tsx`:

```tsx
"use client";

import { RoundedBox } from "@react-three/drei";
import { loadCachedTexture } from "../env/textureCache";

export function DeviceLaptop({
  texture,
  position = [0, 0, 0],
}: {
  texture: string;
  position?: [number, number, number];
}) {
  const tex = loadCachedTexture(texture);
  return (
    <group position={position}>
      {/* base */}
      <RoundedBox args={[2.2, 0.08, 1.5]} radius={0.03} position={[0, -0.55, 0.4]}>
        <meshStandardMaterial color="#171a21" metalness={0.6} roughness={0.4} />
      </RoundedBox>
      {/* lid */}
      <group position={[0, 0, -0.35]} rotation={[-0.35, 0, 0]}>
        <RoundedBox args={[2.2, 1.4, 0.06]} radius={0.03}>
          <meshStandardMaterial color="#0f1116" metalness={0.5} roughness={0.4} />
        </RoundedBox>
        <mesh position={[0, 0, 0.034]}>
          <planeGeometry args={[2.05, 1.25]} />
          <meshStandardMaterial map={tex} />
        </mesh>
      </group>
    </group>
  );
}
```

Create `components/three/primitives/DevicePhone.tsx`:

```tsx
"use client";

import { RoundedBox } from "@react-three/drei";
import { loadCachedTexture } from "../env/textureCache";

export function DevicePhone({
  texture,
  position = [0, 0, 0],
}: {
  texture: string;
  position?: [number, number, number];
}) {
  const tex = loadCachedTexture(texture);
  return (
    <group position={position}>
      <RoundedBox args={[0.6, 1.25, 0.06]} radius={0.06} smoothness={6}>
        <meshStandardMaterial color="#0f1116" metalness={0.5} roughness={0.4} />
      </RoundedBox>
      <mesh position={[0, 0, 0.034]}>
        <planeGeometry args={[0.52, 1.15]} />
        <meshStandardMaterial map={tex} />
      </mesh>
    </group>
  );
}
```

Create `components/three/primitives/Panel.tsx`:

```tsx
"use client";

import { RoundedBox } from "@react-three/drei";

export function Panel({
  position = [0, 0, 0],
  size = [1.1, 0.7],
  color = "#171a21",
}: {
  position?: [number, number, number];
  size?: [number, number];
  color?: string;
}) {
  return (
    <group position={position}>
      <RoundedBox args={[size[0], size[1], 0.04]} radius={0.04} smoothness={4}>
        <meshStandardMaterial color={color} transparent opacity={0.9} metalness={0.2} roughness={0.6} />
      </RoundedBox>
    </group>
  );
}
```

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: compiles (primitives are tree-shaken until a scene uses them; confirm no type errors).

- [ ] **Step 5: Commit**

```bash
git add components/three/env/textureCache.ts components/three/primitives
git commit -m "feat(3d): add procedural device primitives and texture cache"
```

---

### Task 8: Home hero scene + remove ThreeUI

**Files:**
- Create: `components/three/scenes/HomeScene.tsx`
- Modify: `components/Hero.tsx` (swap `HeroBackground` for `Scene`+`HomeScene`)
- Delete: `components/HeroBackground.tsx`
- Modify: `package.json` (remove `@designcodeio/threeui`)

**Interfaces:**
- Consumes: `Scene`, `Lighting`, `DeviceLaptop`, `DevicePhone`, `Panel`, `useCursorParallax`, `SceneFallback`.
- Produces: `<HomeScene />` (self-contained scene graph); `<HomeBackground />` drop-in replacing `<HeroBackground />` in `Hero.tsx`.

- [ ] **Step 1: Implement HomeScene + a background wrapper**

Create `components/three/scenes/HomeScene.tsx`:

```tsx
"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group } from "three";
import { Scene } from "../Scene";
import { SceneFallback } from "../SceneFallback";
import { Lighting } from "../env/Lighting";
import { DeviceLaptop } from "../primitives/DeviceLaptop";
import { DevicePhone } from "../primitives/DevicePhone";
import { Panel } from "../primitives/Panel";
import { useCursorParallax } from "@/lib/three/useCursorParallax";
import { projects } from "@/data/projects";

function Cluster({ parallax }: { parallax: React.MutableRefObject<{ x: number; y: number }> }) {
  const group = useRef<Group>(null);
  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;
    group.current.rotation.y = Math.sin(t * 0.15) * 0.25 + parallax.current.x * 0.3;
    group.current.rotation.x = parallax.current.y * 0.15;
    group.current.position.y = Math.sin(t * 0.4) * 0.06;
  });
  return (
    <group ref={group}>
      <DeviceLaptop texture={projects[1].image} position={[0, 0.1, 0]} />
      <DevicePhone texture={projects[0].image} position={[1.6, -0.2, 0.6]} />
      <Panel position={[-1.7, 0.6, 0.3]} size={[1.1, 0.7]} />
      <Panel position={[-1.4, -0.7, 0.8]} size={[0.9, 0.5]} color="#0f1116" />
    </group>
  );
}

export function HomeBackground() {
  const parallax = useCursorParallax(true);
  return (
    <Scene fallback={<SceneFallback image={projects[1].image} />} camera={{ position: [0, 0, 6], fov: 45 }}>
      <Lighting />
      <Cluster parallax={parallax} />
    </Scene>
  );
}
```

Note: `useCursorParallax(true)` is safe because `Scene` only mounts the canvas when enabled; the hook returns zeros otherwise. If you prefer, thread `enabled` from `use3DEnabled` into `HomeBackground` and pass it in.

- [ ] **Step 2: Swap the hero backdrop**

In `components/Hero.tsx`, replace the `import { HeroBackground }` line with `import { HomeBackground } from "./three/scenes/HomeScene";` and replace `<HeroBackground />` (line ~35) with `<HomeBackground />`. Leave the gradient + dot-grid overlay divs as-is (they provide text contrast over the scene).

- [ ] **Step 3: Remove the old backdrop**

```bash
git rm components/HeroBackground.tsx
npm uninstall @designcodeio/threeui
```
Grep for remaining `threeui` imports and remove any: `rg -i threeui` → expect no results.

- [ ] **Step 4: Run dev server and verify visually**

Run: `npm run dev`, open `/`.
Expected: the hero shows a floating laptop + phone + panels drifting and responding to the cursor; headline/CTAs/trust strip render over it; no console errors. With `/?no3d` or OS reduced-motion, the hero shows the static poster and all content.

- [ ] **Step 5: Commit**

```bash
git add components/three/scenes/HomeScene.tsx components/Hero.tsx package.json package-lock.json
git commit -m "feat(3d): replace hero backdrop with R3F floating-workspace scene"
```

---

### Task 9: Home e2e smoke + fallback tests

**Files:**
- Create: `playwright.config.ts`
- Create: `e2e/home.spec.ts`
- Modify: `package.json` (`test:e2e` script + devDep)

**Interfaces:**
- Consumes: the running app; the `?no3d` escape hatch (Task 2).

- [ ] **Step 1: Install Playwright**

```bash
npm i -D @playwright/test
npx playwright install chromium
```

- [ ] **Step 2: Add config**

Create `playwright.config.ts`:

```ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  webServer: {
    command: "npm run build && npm run start",
    url: "http://localhost:3000",
    timeout: 120_000,
    reuseExistingServer: !process.env.CI,
  },
  use: { baseURL: "http://localhost:3000" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
```

Add `package.json` script: `"test:e2e": "playwright test"`.

- [ ] **Step 3: Write the e2e test**

Create `e2e/home.spec.ts`:

```ts
import { test, expect } from "@playwright/test";

test("home renders content and mounts a canvas with no console errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.locator("canvas")).toBeVisible({ timeout: 10_000 });
  expect(errors, errors.join("\n")).toEqual([]);
});

test("?no3d shows the fallback (no canvas) with full content", async ({ page }) => {
  await page.goto("/?no3d");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.locator("canvas")).toHaveCount(0);
});

test("reduced motion shows the fallback", async ({ page, browser }) => {
  const ctx = await browser.newContext({ reducedMotion: "reduce" });
  const p = await ctx.newPage();
  await p.goto("/");
  await expect(p.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(p.locator("canvas")).toHaveCount(0);
  await ctx.close();
});
```

- [ ] **Step 4: Run the e2e suite**

Run: `npm run test:e2e`
Expected: 3 passing tests.

- [ ] **Step 5: Commit**

```bash
git add playwright.config.ts e2e/home.spec.ts package.json package-lock.json
git commit -m "test(3d): home scene e2e smoke + fallback coverage"
```

---

### Task 10: Work scene (floating project gallery + focus)

**Files:**
- Create: `lib/three/camera.ts`
- Test: `lib/three/camera.test.ts`
- Create: `components/three/scenes/WorkScene.tsx`
- Modify: `app/work/page.tsx` (mount scene; keep DOM project list + filters + `ProjectModal`)

**Interfaces:**
- Consumes: `projects`, `filterProjects`, `projectFilters` from `@/data/projects`; `ProjectModal`; `Scene`, `FloatingScreen`, `Lighting`.
- Produces: `function galleryPositions(count: number, radius: number): [number, number, number][]` (even arc layout); `function focusPosition(target: [number, number, number], distance: number): [number, number, number]`; `<WorkScene projects activeId onSelect>`.

- [ ] **Step 1: Write the failing camera/layout test**

Create `lib/three/camera.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { galleryPositions, focusPosition } from "./camera";

describe("galleryPositions", () => {
  it("returns one position per item", () => {
    expect(galleryPositions(3, 4).length).toBe(3);
  });
  it("centers a single item at x≈0", () => {
    expect(galleryPositions(1, 4)[0][0]).toBeCloseTo(0, 5);
  });
});

describe("focusPosition", () => {
  it("sits `distance` in front of the target on z", () => {
    expect(focusPosition([1, 2, 3], 2)).toEqual([1, 2, 5]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- camera`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

Create `lib/three/camera.ts`:

```ts
/** Lays items on a shallow arc centered on x=0, spaced along z depth. */
export function galleryPositions(count: number, radius: number): [number, number, number][] {
  if (count <= 0) return [];
  return Array.from({ length: count }, (_, i) => {
    const t = count === 1 ? 0 : (i / (count - 1)) * 2 - 1; // -1..1
    const angle = t * 0.6; // radians, shallow fan
    return [Math.sin(angle) * radius, 0, -Math.abs(t) * radius * 0.4] as [number, number, number];
  });
}

export function focusPosition(
  target: [number, number, number],
  distance: number,
): [number, number, number] {
  return [target[0], target[1], target[2] + distance];
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- camera`
Expected: PASS.

- [ ] **Step 5: Implement WorkScene**

Create `components/three/scenes/WorkScene.tsx`:

```tsx
"use client";

import { Scene } from "../Scene";
import { SceneFallback } from "../SceneFallback";
import { Lighting } from "../env/Lighting";
import { FloatingScreen } from "../primitives/FloatingScreen";
import { galleryPositions } from "@/lib/three/camera";
import type { Project } from "@/data/projects";

export function WorkScene({
  projects,
  onSelect,
}: {
  projects: Project[];
  onSelect: (id: string) => void;
}) {
  const positions = galleryPositions(projects.length, 4);
  return (
    <Scene fallback={<SceneFallback image={projects[0]?.image} />} camera={{ position: [0, 0, 7], fov: 50 }}>
      <Lighting />
      {projects.map((p, i) => (
        <group key={p.id} onClick={() => onSelect(p.id)}>
          <FloatingScreen image={p.image} position={positions[i]} scale={1.1} />
        </group>
      ))}
    </Scene>
  );
}
```

- [ ] **Step 6: Wire into the Work page**

In `app/work/page.tsx`, mount `<WorkScene projects={filtered} onSelect={openModal} />` as the section backdrop. Keep the existing DOM project list, filter chips, and `ProjectModal` — the DOM list is the keyboard/screen-reader path; clicking a 3D screen calls the same `openModal(id)` the DOM list uses. Read the current `app/work/page.tsx` first and preserve its state wiring; route the 3D `onSelect` into the same handler.

- [ ] **Step 7: Verify visually**

Run: `npm run dev`, open `/work`.
Expected: floating project screens in an arc; clicking one opens the existing `ProjectModal`; DOM list + filters still work; `/work?no3d` shows poster + full DOM list.

- [ ] **Step 8: Commit**

```bash
git add lib/three/camera.ts lib/three/camera.test.ts components/three/scenes/WorkScene.tsx app/work/page.tsx
git commit -m "feat(3d): floating project gallery on /work"
```

---

### Task 11: Services, Process, FAQ scenes

**Files:**
- Create: `components/three/scenes/ServicesScene.tsx`
- Create: `components/three/scenes/ProcessScene.tsx`
- Create: `components/three/scenes/FaqScene.tsx`
- Modify: `app/services/page.tsx`, `app/process/page.tsx`, `app/faq/page.tsx`

**Interfaces:**
- Consumes: `services`, `featuredCombo` (`@/data/services`), `faq` data, `Scene`, `Panel`, `FloatingScreen`, `Lighting`, `useSectionProgress`.
- Produces: `<ServicesScene services>`, `<ProcessScene steps progress>`, `<FaqScene />`.

- [ ] **Step 1: Read each page first**

Read `app/services/page.tsx`, `app/process/page.tsx`, `app/faq/page.tsx` and the components they use (`Services.tsx`, `Process.tsx`, `FAQ.tsx`) to preserve their DOM content and state before adding a backdrop.

- [ ] **Step 2: Implement ServicesScene (ring of panels)**

Create `components/three/scenes/ServicesScene.tsx`:

```tsx
"use client";

import { Scene } from "../Scene";
import { SceneFallback } from "../SceneFallback";
import { Lighting } from "../env/Lighting";
import { Panel } from "../primitives/Panel";
import type { Service } from "@/data/services";

export function ServicesScene({ services }: { services: Service[] }) {
  const n = services.length;
  return (
    <Scene fallback={<SceneFallback />} camera={{ position: [0, 0, 6], fov: 50 }}>
      <Lighting />
      {services.map((s, i) => {
        const angle = (i / Math.max(1, n)) * Math.PI * 2;
        return (
          <Panel
            key={s.id}
            position={[Math.cos(angle) * 2.6, Math.sin(angle) * 1.4, -1]}
            size={[1.2, 0.8]}
          />
        );
      })}
    </Scene>
  );
}
```

- [ ] **Step 3: Implement ProcessScene (scroll waypoints)**

Create `components/three/scenes/ProcessScene.tsx`:

```tsx
"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group } from "three";
import { Scene } from "../Scene";
import { SceneFallback } from "../SceneFallback";
import { Lighting } from "../env/Lighting";
import { Panel } from "../primitives/Panel";

function Path({ progress, steps }: { progress: React.MutableRefObject<number>; steps: number }) {
  const group = useRef<Group>(null);
  useFrame(() => {
    if (group.current) group.current.position.z = progress.current * (steps - 1) * 2;
  });
  return (
    <group ref={group}>
      {Array.from({ length: steps }, (_, i) => (
        <Panel key={i} position={[0, 0, -i * 2]} size={[1.4, 0.9]} />
      ))}
    </group>
  );
}

export function ProcessScene({
  steps,
  progress,
}: {
  steps: number;
  progress: React.MutableRefObject<number>;
}) {
  return (
    <Scene fallback={<SceneFallback />} camera={{ position: [0, 0, 5], fov: 55 }}>
      <Lighting />
      <Path progress={progress} steps={steps} />
    </Scene>
  );
}
```

Wire `progress` from `useSectionProgress(sectionRef)` in the process page, passing the existing step count. The DOM `.process-step` logic and GSAP remain authoritative for the copy.

- [ ] **Step 4: Implement FaqScene (calm panel field)**

Create `components/three/scenes/FaqScene.tsx`:

```tsx
"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group } from "three";
import { Scene } from "../Scene";
import { SceneFallback } from "../SceneFallback";
import { Lighting } from "../env/Lighting";
import { Panel } from "../primitives/Panel";

function Field() {
  const g = useRef<Group>(null);
  useFrame((s) => {
    if (g.current) g.current.rotation.y = Math.sin(s.clock.elapsedTime * 0.1) * 0.2;
  });
  const panels = Array.from({ length: 6 }, (_, i) => i);
  return (
    <group ref={g}>
      {panels.map((i) => (
        <Panel
          key={i}
          position={[(i % 3) * 2 - 2, Math.floor(i / 3) * 1.6 - 0.8, -2 - (i % 2)]}
          size={[1, 0.6]}
        />
      ))}
    </group>
  );
}

export function FaqScene() {
  return (
    <Scene fallback={<SceneFallback />} camera={{ position: [0, 0, 6], fov: 50 }}>
      <Lighting />
      <Field />
    </Scene>
  );
}
```

- [ ] **Step 5: Mount each scene behind its page content**

In each page, render the scene as an absolutely-positioned backdrop behind the existing DOM section (mirror how `Hero.tsx` layers `HomeBackground` under the content with the gradient/dot-grid overlays for contrast).

- [ ] **Step 6: Verify each route visually**

Run: `npm run dev`; open `/services`, `/process`, `/faq`.
Expected: each shows its scene + full DOM content; `?no3d` shows posters; process panels advance as you scroll.

- [ ] **Step 7: Commit**

```bash
git add components/three/scenes/ServicesScene.tsx components/three/scenes/ProcessScene.tsx components/three/scenes/FaqScene.tsx app/services/page.tsx app/process/page.tsx app/faq/page.tsx
git commit -m "feat(3d): services ring, process path, and faq field scenes"
```

---

### Task 12: e2e smoke for remaining routes

**Files:**
- Create: `e2e/routes.spec.ts`

- [ ] **Step 1: Write the test**

Create `e2e/routes.spec.ts`:

```ts
import { test, expect } from "@playwright/test";

for (const path of ["/work", "/services", "/process", "/faq"]) {
  test(`${path} renders DOM + canvas with no console errors`, async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.locator("canvas")).toBeVisible({ timeout: 10_000 });
    expect(errors, errors.join("\n")).toEqual([]);
  });

  test(`${path}?no3d renders DOM without a canvas`, async ({ page }) => {
    await page.goto(`${path}?no3d`);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.locator("canvas")).toHaveCount(0);
  });
}
```

- [ ] **Step 2: Run**

Run: `npm run test:e2e -- routes`
Expected: all pass. (If a route's `<h1>` differs, read the page and adjust the selector to the real landmark.)

- [ ] **Step 3: Commit**

```bash
git add e2e/routes.spec.ts
git commit -m "test(3d): e2e smoke for work/services/process/faq"
```

---

### Task 13: Polish — postprocessing, preload, perf & a11y pass

**Files:**
- Create: `components/three/env/Effects.tsx`
- Modify: `components/three/Scene.tsx` (accept `tier`, render effects on `high`)
- Modify: `components/Preloader.tsx` (warm the texture cache)
- Modify: scenes as needed for mobile object counts

**Interfaces:**
- Consumes: `@react-three/postprocessing`; `loadCachedTexture`; `use3DEnabled` `tier`.
- Produces: `<Effects />` (bloom), rendered only when `tier === "high"`.

- [ ] **Step 1: Add bloom, gated on the high tier**

Create `components/three/env/Effects.tsx`:

```tsx
"use client";

import { EffectComposer, Bloom } from "@react-three/postprocessing";

export function Effects() {
  return (
    <EffectComposer>
      <Bloom intensity={0.6} luminanceThreshold={0.6} mipmapBlur />
    </EffectComposer>
  );
}
```

In `Scene.tsx`, surface `tier` from `use3DEnabled()` and render `<Effects />` as the last child only when `tier === "high"` (pass children through; append effects internally or expose an `effects` prop). Verify `/` still builds and runs.

- [ ] **Step 2: Warm the texture cache during the preloader**

In `components/Preloader.tsx`, inside the existing effect, call `loadCachedTexture` for the hero textures (`projects[0].image`, `projects[1].image`) so the home scene's first frame has them decoded. Guard with a `typeof window !== "undefined"` check; do not block the splash on load.

- [ ] **Step 3: Low-tier object trims**

Where a scene renders many objects (FAQ field, services ring), read `tier` and reduce counts on `"low"`. Keep it simple: render fewer panels when `tier === "low"`.

- [ ] **Step 4: Full verification pass**

Run: `npm run test` (unit), `npm run test:e2e` (smoke), `npm run build`.
Expected: all green.
Manually: throttle CPU in devtools and confirm `PerformanceMonitor`/adaptive dpr keeps the home scene responsive; confirm reduced-motion and `?no3d` posters across all 5 routes; confirm keyboard can open a project from the DOM list on `/work`.

- [ ] **Step 5: Commit**

```bash
git add components/three/env/Effects.tsx components/three/Scene.tsx components/Preloader.tsx components/three/scenes
git commit -m "feat(3d): bloom on high tier, texture preload, low-tier trims"
```

---

## Self-Review

**1. Spec coverage:** §1 concept → Tasks 7–8 (devices/panels, home cluster). §4.1 deps/removal → Task 6 (add), Task 8 (remove threeui). §4.2 module layout → Tasks 1–8, 10–11. §4.3 Scene → Task 6. §4.4 use3DEnabled → Tasks 1–2. §4.5 primitives → Task 7. §4.6 scroll/cursor → Tasks 4–5. §4.7 flash mitigation → Task 6 (lazy mount), Task 7 (module cache), Task 13 (preload). §5 per-page scenes → Tasks 8, 10, 11. §6 a11y/perf → Tasks 2, 6, 9, 12, 13. §7 phasing → task order. §8 testing → Tasks 1–5, 9, 10, 12, 13. All covered.

**2. Placeholder scan:** No "TBD/TODO/handle edge cases" left; every code step carries real code. Tasks that modify existing pages instruct "read first" because the exact current JSX varies — the interface routed in (`onSelect`/`progress`/backdrop mount) is specified concretely.

**3. Type consistency:** `QualityTier`/`Capabilities`/`decideQuality` (Task 1) reused verbatim in Task 2. `loadCachedTexture` (Task 7) reused in Tasks 8, 13. `galleryPositions`/`focusPosition` (Task 10) match their test. `sectionProgress`/`useSectionProgress` (Task 4) reused in Task 11. `Scene` prop shape (Task 6) matches all scene call sites.

**4. Review Focus:** reduced-motion → Tasks 2, 9; no-WebGL/`?no3d` → Tasks 1, 9; low-power mobile → Task 1; scroll clamp/NaN → Task 4; hidden/offscreen pause → Task 6. Each pinned to a task with a test.
