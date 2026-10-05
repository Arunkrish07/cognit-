"use client";

import { motion, useScroll, useSpring } from "framer-motion";

export function ScrollProgress() {
  // Drive the bar with a scaleX transform off the scroll motion value:
  // GPU-accelerated, no per-frame React re-render, and no animating
  // width/height (both are performance anti-patterns).
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    mass: 0.2,
  });

  return (
    <motion.div
      className="fixed left-0 right-0 top-0 z-[100] h-0.5 origin-left bg-accent"
      style={{ scaleX }}
      aria-hidden
    />
  );
}
