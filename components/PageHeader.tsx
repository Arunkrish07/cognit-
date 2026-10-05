"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  intro?: string;
  image: string;
};

/**
 * Route-page banner: large title over a parallaxing, dark-tinted image.
 * The image drifts on scroll (transform only) for depth.
 */
export function PageHeader({ eyebrow, title, intro, image }: PageHeaderProps) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const imgY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);

  return (
    <section
      ref={ref}
      className="relative flex min-h-[52vh] items-end overflow-hidden pt-[var(--nav-height)]"
    >
      <motion.div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{ y: reduced ? 0 : imgY }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image}
          alt=""
          className="h-[120%] w-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/85 to-bg/55" />
        <div className="absolute inset-0 dot-grid opacity-40" />
      </motion.div>

      <div className="container-main pb-14 pt-20">
        {eyebrow && (
          <motion.p
            className="mono-label mb-4"
            initial={reduced ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {eyebrow}
          </motion.p>
        )}
        <div className="overflow-hidden">
          <motion.h1
            className="heading-xl text-text"
            initial={reduced ? false : { y: "110%" }}
            animate={{ y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            {title}
          </motion.h1>
        </div>
        {intro && (
          <motion.p
            className="mt-5 max-w-xl text-lg text-muted"
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25, duration: 0.6 }}
          >
            {intro}
          </motion.p>
        )}
      </div>
    </section>
  );
}
