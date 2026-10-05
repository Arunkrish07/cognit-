"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { PhoneChat } from "./PhoneChat";
import { site } from "@/data/site";
import { images } from "@/data/images";

const headlineLines = [
  "Websites, apps and AI",
  "that work while you sleep.",
];

export function Hero() {
  const reduced = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const phoneY = useTransform(scrollYProgress, [0, 1], [0, 40]);
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "16%"]);

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative min-h-[100dvh] overflow-hidden pt-[var(--nav-height)]"
      aria-labelledby="hero-heading"
    >
      {/* Parallax background image, dark-tinted for text contrast. */}
      <motion.div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{ y: reduced ? 0 : bgY }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={images.heroBackground}
          alt=""
          className="h-[120%] w-full object-cover opacity-40"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-bg/70 via-bg/85 to-bg" />
        <div className="absolute inset-0 dot-grid opacity-60" />
      </motion.div>

      <div className="container-main section-padding grid items-center gap-12 lg:grid-cols-[1.25fr_0.75fr] lg:gap-16">
        <div>
          <h1 id="hero-heading" className="heading-xl text-text">
            {headlineLines.map((line, i) => (
              <span key={i} className="block overflow-hidden">
                <motion.span
                  className="block"
                  initial={reduced ? false : { y: "110%" }}
                  animate={{ y: 0 }}
                  transition={{
                    delay: 0.15 + i * 0.08,
                    duration: 0.65,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  {line}
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.p
            className="mt-6 max-w-xl text-lg text-muted"
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45, duration: 0.5 }}
          >
            Cognit helps growing businesses get more customers and cut manual
            work. {site.tagline}
          </motion.p>

          <motion.div
            className="mt-8 flex flex-wrap gap-4"
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

        <motion.div style={{ y: reduced ? 0 : phoneY }}>
          <PhoneChat />
        </motion.div>
      </div>

      <TrustStrip />
    </section>
  );
}

function TrustStrip() {
  const items = site.trustStats
    ? [
        `${site.trustStats.projects}+ projects delivered`,
        `${site.trustStats.clients}+ happy clients`,
        "Fast delivery",
        "Post-launch support",
      ]
    : ["Fast delivery", "Post-launch support", "Clear communication", "One person, full stack"];

  return (
    <div className="border-t border-border bg-surface/50">
      <ul className="container-main flex flex-wrap items-center justify-center gap-y-3 py-5 text-sm text-muted md:divide-x md:divide-border">
        {items.map((item) => (
          <li key={item} className="px-5 first:pl-0">
            {item}
          </li>
        ))}
      </ul>
    </div>
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
