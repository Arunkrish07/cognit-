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
      // Shader colorMid is a horizontal gradient blue(left) -> pink(right);
      // our tall steps sit on the pink end. -40deg nudges that pink (~330deg)
      // toward magenta/violet (~290deg) so the hero echoes the site's
      // pink -> dark-purple brand gradient.
      hue={-40}
      saturation={1.1}
      brightness={0.97}
      className="absolute inset-0 h-full w-full"
    />
  );
}
