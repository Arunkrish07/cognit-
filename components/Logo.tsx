"use client";

import { motion, useReducedMotion } from "framer-motion";

type LogoProps = {
  className?: string;
  size?: "sm" | "md";
  showPulse?: boolean;
};

export function Logo({ className = "", size = "md", showPulse = false }: LogoProps) {
  const reduced = useReducedMotion();
  const fontSize = size === "sm" ? 18 : 24;

  return (
    <svg
      viewBox="0 0 120 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="cognit"
      role="img"
    >
      <text
        x="0"
        y="24"
        fill="currentColor"
        fontFamily="var(--font-space-grotesk), system-ui, sans-serif"
        fontSize={fontSize}
        fontWeight="700"
        letterSpacing="-0.02em"
      >
        cogn
      </text>
      <text
        x="68"
        y="24"
        fill="currentColor"
        fontFamily="var(--font-space-grotesk), system-ui, sans-serif"
        fontSize={fontSize}
        fontWeight="700"
        letterSpacing="-0.02em"
      >
        t
      </text>
      <motion.circle
        cx="92"
        cy="8"
        r="4"
        fill="var(--accent-fill)"
        initial={showPulse && !reduced ? { scale: 0.6, opacity: 0.5 } : false}
        animate={
          showPulse && !reduced
            ? { scale: [0.6, 1.2, 1], opacity: [0.5, 1, 1] }
            : { scale: 1, opacity: 1 }
        }
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      />
    </svg>
  );
}

export function FaviconMark() {
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="8" fill="#141416" />
      <text
        x="8"
        y="23"
        fill="#F3F2EC"
        fontFamily="system-ui, sans-serif"
        fontSize="18"
        fontWeight="700"
      >
        c
      </text>
      <circle cx="24" cy="8" r="3" fill="#C6F24D" />
    </svg>
  );
}
