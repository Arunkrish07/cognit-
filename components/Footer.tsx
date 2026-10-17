"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUp, MessageCircle, Sparkles } from "lucide-react";
import { Logo } from "./Logo";
import { useContactModal } from "./ContactModalProvider";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { getLenis } from "@/lib/lenis";
import { navLinks, site } from "@/data/site";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// Warm-Noir theming for the cinematic footer. Mirrors the project's CSS vars
// (--text / --bg / --accent / --accent-2 / --muted / --border) rather than the
// shadcn token names, and disables the ambient animations under reduced motion.
const STYLES = `
.cinematic-footer {
  font-family: var(--font-jakarta), system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;

  --pill-bg-1: color-mix(in oklch, var(--text) 4%, transparent);
  --pill-bg-2: color-mix(in oklch, var(--text) 1%, transparent);
  --pill-shadow: color-mix(in oklch, var(--bg) 60%, transparent);
  --pill-highlight: color-mix(in oklch, var(--text) 12%, transparent);
  --pill-inset-shadow: color-mix(in oklch, var(--bg) 80%, transparent);
  --pill-border: color-mix(in oklch, var(--text) 10%, transparent);

  --pill-bg-1-hover: color-mix(in oklch, var(--accent) 14%, transparent);
  --pill-bg-2-hover: color-mix(in oklch, var(--text) 3%, transparent);
  --pill-border-hover: color-mix(in oklch, var(--accent) 45%, transparent);
  --pill-shadow-hover: color-mix(in oklch, var(--bg) 70%, transparent);
  --pill-highlight-hover: color-mix(in oklch, var(--text) 22%, transparent);
}

@keyframes footer-breathe {
  0% { transform: translate(-50%, -50%) scale(1); opacity: 0.55; }
  100% { transform: translate(-50%, -50%) scale(1.1); opacity: 0.95; }
}
@keyframes footer-marquee {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}
.animate-footer-breathe { animation: footer-breathe 8s ease-in-out infinite alternate; }
.animate-footer-marquee { animation: footer-marquee 42s linear infinite; }

.footer-bg-grid {
  background-size: 60px 60px;
  background-image:
    linear-gradient(to right, color-mix(in oklch, var(--text) 4%, transparent) 1px, transparent 1px),
    linear-gradient(to bottom, color-mix(in oklch, var(--text) 4%, transparent) 1px, transparent 1px);
  mask-image: linear-gradient(to bottom, transparent, black 30%, black 70%, transparent);
  -webkit-mask-image: linear-gradient(to bottom, transparent, black 30%, black 70%, transparent);
}

.footer-aurora {
  background: radial-gradient(
    circle at 50% 50%,
    color-mix(in oklch, var(--accent) 18%, transparent) 0%,
    color-mix(in oklch, var(--accent-2) 14%, transparent) 40%,
    transparent 70%
  );
}

.footer-glass-pill {
  background: linear-gradient(145deg, var(--pill-bg-1) 0%, var(--pill-bg-2) 100%);
  box-shadow:
    0 10px 30px -10px var(--pill-shadow),
    inset 0 1px 1px var(--pill-highlight),
    inset 0 -1px 2px var(--pill-inset-shadow);
  border: 1px solid var(--pill-border);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  transition: background .4s cubic-bezier(.16,1,.3,1), border-color .4s cubic-bezier(.16,1,.3,1), box-shadow .4s cubic-bezier(.16,1,.3,1), color .3s ease;
}
.footer-glass-pill:hover {
  background: linear-gradient(145deg, var(--pill-bg-1-hover) 0%, var(--pill-bg-2-hover) 100%);
  border-color: var(--pill-border-hover);
  box-shadow: 0 20px 40px -10px var(--pill-shadow-hover), inset 0 1px 1px var(--pill-highlight-hover);
  color: var(--text);
}

.footer-giant-text {
  font-family: var(--font-space-grotesk), sans-serif;
  font-size: 26vw;
  line-height: 0.75;
  font-weight: 700;
  letter-spacing: -0.05em;
  color: transparent;
  -webkit-text-stroke: 1px color-mix(in oklch, var(--text) 6%, transparent);
  background: linear-gradient(180deg, color-mix(in oklch, var(--text) 10%, transparent) 0%, transparent 60%);
  -webkit-background-clip: text;
  background-clip: text;
}

.footer-text-glow {
  background: linear-gradient(180deg, var(--text) 0%, color-mix(in oklch, var(--text) 45%, transparent) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0 0 24px color-mix(in oklch, var(--accent) 20%, transparent));
}

@media (prefers-reduced-motion: reduce) {
  .animate-footer-breathe,
  .animate-footer-marquee { animation: none !important; }
}
`;

const marqueeWords = [
  "Web Development",
  "Mobile Apps",
  "AI Automation",
  "WhatsApp Automation",
  "UI/UX Design",
  "Launch & Support",
];

function MarqueeRow() {
  return (
    <div className="flex items-center gap-10 px-5">
      {marqueeWords.map((word, i) => (
        <span key={word} className="flex items-center gap-10">
          {word}
          <span
            aria-hidden
            className={i % 2 === 0 ? "text-accent/60" : "text-accent-2/60"}
          >
            &#10022;
          </span>
        </span>
      ))}
    </div>
  );
}

export function Footer() {
  const { openModal } = useContactModal();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const giantTextRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!wrapperRef.current) return;

    // All scroll-driven motion is opt-in; reduced-motion users get it static.
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const ctx = gsap.context(() => {
        gsap.fromTo(
          giantTextRef.current,
          { y: "10vh", scale: 0.85, opacity: 0 },
          {
            y: "0vh",
            scale: 1,
            opacity: 1,
            ease: "power1.out",
            scrollTrigger: {
              trigger: wrapperRef.current,
              start: "top 80%",
              end: "bottom bottom",
              scrub: 1,
            },
          }
        );

        gsap.fromTo(
          [headingRef.current, linksRef.current],
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            stagger: 0.15,
            ease: "power3.out",
            scrollTrigger: {
              trigger: wrapperRef.current,
              start: "top 45%",
              end: "bottom bottom",
              scrub: 1,
            },
          }
        );
      }, wrapperRef);
      return () => ctx.revert();
    });

    return () => mm.revert();
  }, []);

  const scrollTop = () => {
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(0, { duration: 1.2 });
    else window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      {/* Curtain-reveal wrapper: clip-path keeps the fixed footer visible only
          within this box, so it slides into view as the page scrolls over it. */}
      <div
        ref={wrapperRef}
        className="relative h-screen w-full"
        style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)" }}
      >
        <footer className="cinematic-footer fixed bottom-0 left-0 flex h-screen w-full flex-col justify-between overflow-hidden bg-bg text-text">
          {/* Ambient light + grid */}
          <div className="footer-aurora pointer-events-none absolute left-1/2 top-1/2 z-0 h-[60vh] w-[80vw] -translate-x-1/2 -translate-y-1/2 animate-footer-breathe rounded-[50%] blur-[80px]" />
          <div className="footer-bg-grid pointer-events-none absolute inset-0 z-0" />

          {/* Giant brand wordmark */}
          <div
            ref={giantTextRef}
            className="footer-giant-text pointer-events-none absolute -bottom-[4vh] left-1/2 z-0 -translate-x-1/2 select-none whitespace-nowrap"
          >
            cognit
          </div>

          {/* Diagonal marquee */}
          <div className="absolute left-0 top-14 z-10 w-full -rotate-2 scale-110 overflow-hidden border-y border-border/60 bg-bg/50 py-3.5 shadow-2xl backdrop-blur-md">
            <div className="flex w-max animate-footer-marquee text-xs font-bold uppercase tracking-[0.3em] text-muted md:text-sm">
              <MarqueeRow />
              <MarqueeRow />
            </div>
          </div>

          {/* Center content */}
          <div className="relative z-10 mx-auto mt-16 flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-6">
            <h2
              ref={headingRef}
              className="footer-text-glow mb-10 text-center font-heading text-5xl font-bold tracking-tighter md:text-8xl"
            >
              Ready to build?
            </h2>

            <div ref={linksRef} className="flex w-full flex-col items-center gap-6">
              {/* Primary actions */}
              <div className="flex w-full flex-wrap justify-center gap-4">
                <MagneticButton
                  as="button"
                  type="button"
                  onClick={openModal}
                  className="footer-glass-pill group flex items-center gap-2.5 rounded-full px-9 py-4 text-sm font-bold text-text md:text-base"
                >
                  <Sparkles
                    size={18}
                    aria-hidden
                    className="text-accent transition-colors"
                  />
                  Start a project
                </MagneticButton>

                <MagneticButton
                  as="a"
                  href={site.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-glass-pill group flex items-center gap-2.5 rounded-full px-9 py-4 text-sm font-bold text-text md:text-base"
                >
                  <MessageCircle
                    size={18}
                    aria-hidden
                    className="text-[var(--success)] transition-colors"
                  />
                  Message on WhatsApp
                </MagneticButton>
              </div>

              {/* Secondary links */}
              <div className="mt-1 flex w-full flex-wrap justify-center gap-2.5 md:gap-4">
                {navLinks.map((link) => (
                  <MagneticButton
                    key={link.href}
                    as="a"
                    href={link.href}
                    strength={0.25}
                    className="footer-glass-pill rounded-full px-5 py-2.5 text-xs font-medium text-muted md:text-sm"
                  >
                    {link.label}
                  </MagneticButton>
                ))}
                <MagneticButton
                  as="button"
                  type="button"
                  onClick={openModal}
                  strength={0.25}
                  className="footer-glass-pill rounded-full px-5 py-2.5 text-xs font-medium text-muted md:text-sm"
                >
                  Contact
                </MagneticButton>
              </div>
            </div>
          </div>

          {/* Bottom bar. Back-to-top sits on the left and the right corner is
              left clear, so the global WhatsApp FAB never overlaps a control. */}
          <div className="relative z-20 flex w-full flex-col items-center gap-5 px-6 pb-24 md:flex-row md:px-12 md:pb-10">
            <div className="order-2 flex items-center gap-4 md:order-1 md:flex-1">
              <MagneticButton
                as="button"
                type="button"
                onClick={scrollTop}
                aria-label="Back to top"
                strength={0.3}
                className="footer-glass-pill group flex size-11 items-center justify-center rounded-full text-muted hover:text-text"
              >
                <ArrowUp
                  size={18}
                  className="transition-transform duration-300 group-hover:-translate-y-1"
                />
              </MagneticButton>
              <Link href="/" aria-label="Cognit home">
                <Logo className="h-6 w-auto text-text" />
              </Link>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-muted md:text-xs">
                &copy; {site.year} Cognit
              </span>
            </div>

            <div className="footer-glass-pill order-1 flex cursor-default items-center gap-2 rounded-full px-5 py-2.5 md:order-2">
              <span
                aria-hidden
                className="inline-block size-1.5 rounded-full bg-accent"
              />
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted md:text-xs">
                {site.tagline}
              </span>
            </div>

            {/* Spacer balances the left cluster and keeps the FAB corner clear. */}
            <div className="order-3 hidden md:block md:flex-1" aria-hidden />
          </div>
        </footer>
      </div>
    </>
  );
}
