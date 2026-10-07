"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

const lines = [
  "Replying to every WhatsApp message yourself.",
  "Losing leads because your website looks outdated.",
  "Spending hours on tasks a system could do.",
];

export function Problem() {
  const reduced = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const lineRefs = useRef<(HTMLParagraphElement | null)[]>([]);

  useEffect(() => {
    if (reduced) return;

    // A narrow band across the viewport center: the line crossing it
    // becomes active. IntersectionObserver replaces the banned scroll
    // listener — no per-frame work.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const idx = lineRefs.current.indexOf(
              entry.target as HTMLParagraphElement
            );
            if (idx !== -1) setActiveIndex(idx);
          }
        }
      },
      { rootMargin: "-48% 0px -48% 0px", threshold: 0 }
    );

    const els = lineRefs.current.filter(Boolean) as HTMLParagraphElement[];
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [reduced]);

  return (
    <section
      className="relative overflow-hidden section-padding"
      aria-labelledby="problem-heading"
    >
      <div
        aria-hidden
        className="glow"
        style={{
          width: "32rem",
          height: "32rem",
          top: "20%",
          right: "-10rem",
          background: "radial-gradient(circle, rgba(255,138,61,0.16), transparent 68%)",
        }}
      />
      <div className="container-main relative">
        <motion.h2
          id="problem-heading"
          className="heading-lg text-text"
          initial={reduced ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          Still doing it all by hand?
        </motion.h2>

        <div className="mt-12 space-y-8 md:space-y-12">
          {lines.map((line, i) => (
            <p
              key={line}
              ref={(el) => {
                lineRefs.current[i] = el;
              }}
              className="text-xl transition-opacity duration-500 md:text-2xl lg:text-3xl"
              style={{
                opacity: reduced ? 1 : activeIndex === i ? 1 : 0.25,
                color: activeIndex === i || reduced ? "var(--text)" : "var(--muted)",
              }}
            >
              {line}
            </p>
          ))}
        </div>

        <motion.p
          className="text-warm mt-12 font-heading text-3xl font-bold md:text-5xl"
          initial={reduced ? false : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          Cognit fixes this.
        </motion.p>
      </div>
    </section>
  );
}
