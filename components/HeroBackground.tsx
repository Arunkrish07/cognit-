"use client";

import dynamic from "next/dynamic";
import { useReducedMotion } from "framer-motion";
import "@designcodeio/threeui/style.css";

// ThreeUI's StructureFlowCollection is a WebGL/Three.js component that reads
// `window`/`document`, so it must be client-only. A subpath import keeps the
// bundle smaller than the package barrel (which pulls in every component).
const StructureFlowCollection = dynamic(
  () =>
    import("@designcodeio/threeui/components/StructureFlowCollection").then(
      (m) => m.StructureFlowCollection,
    ),
  { ssr: false },
);

/**
 * Full-screen "Expanse Field" ShaderMaterial backdrop for the hero
 * (ThreeUI `StructureFlowCollection`, variant `expanse-field`).
 *
 * Renders nothing when the user prefers reduced motion — the Hero's gradient
 * and dot-grid overlays remain as a calm static fallback over the themed bg.
 */
export function HeroBackground() {
  const reduced = useReducedMotion();
  if (reduced) return null;

  return (
    <StructureFlowCollection
      variant="expanse-field"
      mode="light"
      // hue is a degree rotation (clamped -180..180) over the Expanse Field's
      // base blue (~233°). +90° lands it at ~323°, matching the "Neon Noir"
      // palette purples (#5D2742 / #843362 ≈ 327-330°).
      hue={90}
      saturation={1.1}
      brightness={1.0}
      className="absolute inset-0 h-full w-full"
    />
  );
}
