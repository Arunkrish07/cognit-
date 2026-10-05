"use client";

import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";

type RevealProps = {
  children: React.ReactNode;
  /** Stagger delay in seconds. */
  delay?: number;
  /** Travel distance in px (default 28). */
  y?: number;
  as?: "div" | "li" | "section" | "span";
  className?: string;
} & Omit<HTMLMotionProps<"div">, "children">;

/**
 * Scroll-reveal wrapper: fades + rises into view once, respecting
 * prefers-reduced-motion. Uses whileInView (IntersectionObserver under
 * the hood) — no scroll listeners.
 */
export function Reveal({
  children,
  delay = 0,
  y = 28,
  as = "div",
  className,
  ...rest
}: RevealProps) {
  const reduced = useReducedMotion();
  const MotionTag = motion[as] as typeof motion.div;

  return (
    <MotionTag
      className={className}
      initial={reduced ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      {...rest}
    >
      {children}
    </MotionTag>
  );
}
