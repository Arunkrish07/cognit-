import type Lenis from "lenis";

// Shared reference to the single Lenis instance created in SmoothScroll,
// so route changes (template.tsx) and the footer can drive scroll without
// putting anything on `window` (the lenis package already types window.lenis).
let instance: Lenis | null = null;

export function setLenis(next: Lenis | null) {
  instance = next;
}

export function getLenis(): Lenis | null {
  return instance;
}
