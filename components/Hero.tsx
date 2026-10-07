"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { site } from "@/data/site";

const headlineLines = [
  "Websites, apps and AI",
  "that work while you sleep.",
];

export function Hero() {
  const reduced = useReducedMotion();

  return (
    <section
      id="hero"
      className="relative flex min-h-[100dvh] flex-col justify-end overflow-hidden pt-[var(--nav-height)]"
      aria-labelledby="hero-heading"
    >
      {/* The page-wide image backdrop (.page-bg) shows through here; this
          adds a little extra shade behind the copy for headline contrast. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-t from-black/55 via-transparent to-transparent"
      />

      <div className="container-main pb-14 pt-28">
        <div className="max-w-4xl">
          <h1 id="hero-heading" className="heading-xl text-white">
            {headlineLines.map((line, i) => (
              <span key={i} className="block overflow-hidden pb-[0.08em]">
                <motion.span
                  className="block"
                  initial={reduced ? false : { y: "110%" }}
                  animate={{ y: 0 }}
                  transition={{
                    delay: 0.15 + i * 0.08,
                    duration: 0.7,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  {i === 0 ? (
                    <>
                      Websites, apps and <span className="text-warm">AI</span>
                    </>
                  ) : (
                    line
                  )}
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.p
            className="mt-8 max-w-xl text-lg leading-relaxed text-white/80 md:text-xl"
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45, duration: 0.5 }}
          >
            Cognit helps growing businesses get more customers and cut manual
            work. {site.tagline}
          </motion.p>

          <motion.div
            className="mt-10 flex flex-wrap gap-4"
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55, duration: 0.5 }}
          >
            <MagneticButton href={site.whatsappPrefill} primary>
              <MessageCircle size={18} className="text-success" />
              Start your project
            </MagneticButton>
            <Link href="/work" className="btn-secondary">
              See my work
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function MagneticButton({
  href,
  children,
  primary,
}: {
  href: string;
  children: React.ReactNode;
  primary?: boolean;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const reduced = useReducedMotion();

  const onMove = (e: React.MouseEvent) => {
    if (reduced || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) * 0.15;
    const y = (e.clientY - rect.top - rect.height / 2) * 0.15;
    ref.current.style.transform = `translate(${Math.max(-8, Math.min(8, x))}px, ${Math.max(-8, Math.min(8, y))}px)`;
  };

  const onLeave = () => {
    if (ref.current) ref.current.style.transform = "";
  };

  return (
    <a
      ref={ref}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={primary ? "btn-primary" : "btn-secondary"}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      {children}
    </a>
  );
}
