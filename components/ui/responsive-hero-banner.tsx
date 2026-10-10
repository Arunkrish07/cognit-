"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, ArrowRight, Play, Menu, X } from "lucide-react";
import { Logo } from "@/components/Logo";
import { navLinks as defaultNavLinks, site } from "@/data/site";
import { cn } from "@/lib/utils";

interface NavLink {
  label: string;
  href: string;
}

interface ResponsiveHeroBannerProps {
  backgroundImageUrl?: string;
  navLinks?: readonly NavLink[];
  ctaButtonText?: string;
  ctaButtonHref?: string;
  badgeLabel?: string;
  badgeText?: string;
  title?: string;
  titleLine2?: string;
  description?: string;
  primaryButtonText?: string;
  primaryButtonHref?: string;
  secondaryButtonText?: string;
  secondaryButtonHref?: string;
}

const ResponsiveHeroBanner: React.FC<ResponsiveHeroBannerProps> = ({
  backgroundImageUrl = "/hero-bg.jpg",
  navLinks = defaultNavLinks,
  ctaButtonText = "Book a free call",
  ctaButtonHref = site.whatsappPrefill,
  badgeLabel = "New",
  badgeText = "AI & WhatsApp automation for growing businesses",
  title = "Websites, apps and AI",
  titleLine2 = "that work while you sleep.",
  description = "Cognit helps growing businesses get more customers and cut manual work. Made to think. Built to work.",
  primaryButtonText = "Start your project",
  primaryButtonHref = site.whatsappPrefill,
  secondaryButtonText = "See my work",
  secondaryButtonHref = "/work",
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeHref, setActiveHref] = useState<string | null>(null);

  // Scrollspy: highlight the nav link whose section is currently in view, so
  // the glass pill slides from Services → Work → Process → FAQ as you scroll.
  useEffect(() => {
    const sections = navLinks
      .filter((l) => l.href.startsWith("#"))
      .map((l) => document.getElementById(l.href.slice(1)))
      .filter((el): el is HTMLElement => el !== null);

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActiveHref("#" + visible[0].target.id);
      },
      // Detection band sits just above the vertical middle of the viewport.
      { rootMargin: "-45% 0px -50% 0px", threshold: [0, 0.25, 0.5, 1] }
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [navLinks]);

  return (
    <section
      id="hero"
      className="w-full isolate min-h-screen overflow-hidden relative z-[1]"
      aria-labelledby="hero-heading"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={backgroundImageUrl}
        alt=""
        className="w-full h-full object-cover absolute top-0 right-0 bottom-0 left-0"
      />
      {/* Light cinematic shade — the artwork is already near-black, so keep the
          glowing arc visible while holding text contrast at the top. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/55 via-black/20 to-black/45"
      />
      <div className="pointer-events-none absolute inset-0 ring-1 ring-black/30" />

      <header className="z-10 xl:top-4 relative">
        <div className="mx-6">
          <div className="flex items-center justify-between pt-4">
            <Link
              href="/"
              aria-label="Cognit home"
              className="inline-flex items-center justify-center text-white"
            >
              <Logo className="h-8 w-auto" />
            </Link>

            <nav className="hidden md:flex items-center gap-2">
              <div className="flex items-center gap-1 rounded-full bg-white/5 px-1 py-1 ring-1 ring-white/10 backdrop-blur">
                {navLinks.map((link, index) => {
                  const active = activeHref === link.href;
                  return (
                    <a
                      key={index}
                      href={link.href}
                      aria-current={active ? "true" : undefined}
                      className="relative px-3 py-2 text-sm font-medium font-sans transition-colors"
                    >
                      {active && (
                        <motion.span
                          layoutId="nav-glass"
                          aria-hidden
                          className="absolute inset-0 rounded-full bg-white/15 ring-1 ring-white/25 backdrop-blur-md"
                          transition={{ type: "spring", stiffness: 380, damping: 32 }}
                        />
                      )}
                      <span
                        className={cn(
                          "relative z-10",
                          active ? "text-white" : "text-white/80 hover:text-white"
                        )}
                      >
                        {link.label}
                      </span>
                    </a>
                  );
                })}
                <a
                  href={ctaButtonHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-1 inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-2 text-sm font-semibold text-neutral-900 hover:bg-white/90 font-sans transition-colors"
                >
                  {ctaButtonText}
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              </div>
            </nav>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/15 backdrop-blur text-white/90"
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* Mobile dropdown menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-3 rounded-2xl bg-black/60 p-2 ring-1 ring-white/10 backdrop-blur">
              {navLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block rounded-xl px-4 py-3 text-sm font-medium text-white/85 hover:bg-white/10 font-sans transition-colors"
                >
                  {link.label}
                </a>
              ))}
              <a
                href={ctaButtonHref}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className="mt-1 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-3 text-sm font-medium text-white ring-1 ring-white/25 backdrop-blur-md hover:bg-white/20 hover:ring-white/40 font-sans transition-colors"
              >
                {ctaButtonText}
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </div>
          )}
        </div>
      </header>

      <div className="z-10 relative">
        <div className="sm:pt-28 md:pt-32 lg:pt-40 max-w-7xl mx-auto pt-28 px-6 pb-16">
          <div className="mx-auto max-w-6xl text-center">
            <div className="mb-6 inline-flex items-center gap-3 rounded-full bg-white/10 px-2.5 py-2 ring-1 ring-white/15 backdrop-blur animate-fade-slide-in-1">
              <span className="inline-flex items-center text-xs font-medium text-neutral-900 bg-white/90 rounded-full py-0.5 px-2 font-sans">
                {badgeLabel}
              </span>
              <span className="text-sm font-medium text-white/90 font-sans">
                {badgeText}
              </span>
            </div>

            <h1
              id="hero-heading"
              className="sm:text-7xl md:text-8xl lg:text-9xl leading-[1.02] text-6xl text-white tracking-tight font-instrument-serif font-normal animate-fade-slide-in-2"
            >
              {title}
              <br className="hidden sm:block" /> {titleLine2}
            </h1>

            <p className="sm:text-lg animate-fade-slide-in-3 text-base text-white/80 max-w-3xl mt-6 mx-auto">
              {description}
            </p>

            <div className="flex flex-col sm:flex-row sm:gap-4 mt-10 gap-3 items-center justify-center animate-fade-slide-in-4">
              <a
                href={primaryButtonHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-white/10 px-6 py-3 text-sm font-medium text-white ring-1 ring-white/25 backdrop-blur-md hover:bg-white/20 hover:ring-white/40 font-sans transition-colors"
              >
                {primaryButtonText}
                <ArrowRight className="h-4 w-4" />
              </a>
              <Link
                href={secondaryButtonHref}
                className="inline-flex items-center gap-2 rounded-full bg-white/[0.06] px-6 py-3 text-sm font-medium text-white/90 ring-1 ring-white/15 backdrop-blur-md hover:bg-white/15 hover:text-white hover:ring-white/30 font-sans transition-colors"
              >
                {secondaryButtonText}
                <Play className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ResponsiveHeroBanner;
