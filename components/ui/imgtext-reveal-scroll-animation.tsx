"use client";

import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export interface RevealLine {
  id?: string;
  prefix?: string;
  image?: string;
  alt?: string;
  suffix?: string;
  fullText?: string;
}

export interface ImageTextRevealProps {
  lines?: RevealLine[];
  revealWidthDesktop?: number;
  revealWidthMobile?: number;
  className?: string;
  textClassName?: string;
  /** Fallback image used if a line image fails to load. */
  fallbackImage?: string;
}

// Known-good image on this site's CDN, used if any line image 404s.
const SAFE_FALLBACK =
  "https://images.unsplash.com/photo-1614851099511-773084f6911d?q=80&w=1200&auto=format&fit=crop";

const DEFAULT_LINES: RevealLine[] = [
  { fullText: "We build things" },
  { prefix: "that", image: SAFE_FALLBACK, alt: "", suffix: "work." },
];

/**
 * On scroll, inline image "slots" inside oversized headline lines expand from
 * zero width (a GSAP ScrollTrigger scrub), and hovering a slot floats a large
 * preview that follows the cursor. Adapted from the 21st.dev ImageTextReveal:
 * retuned for this site's dark/warm theme (the original is hardcoded white),
 * with image load fallbacks, and reduced-motion support so the images still
 * show (statically) instead of staying collapsed. ScrollTrigger is already
 * driven by Lenis globally (see SmoothScroll), so no extra wiring is needed.
 */
export const ImageTextReveal: React.FC<ImageTextRevealProps> = ({
  lines = DEFAULT_LINES,
  revealWidthDesktop = 300,
  revealWidthMobile = 110,
  className = "",
  textClassName = "",
  fallbackImage = SAFE_FALLBACK,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseImgRef = useRef<HTMLDivElement>(null);
  const [activeImage, setActiveImage] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    // Guard against a 0 width (hidden/background tab) → treat as desktop.
    const vw = window.innerWidth || 1280;
    const isMobile = vw < 768;
    const revealWidth = isMobile ? revealWidthMobile : revealWidthDesktop;
    const spans = containerRef.current.querySelectorAll<HTMLElement>(
      ".img-reveal-span",
    );

    // Reduced motion / no-scrub: reveal the images statically so no content
    // is hidden, and skip the cursor follower.
    if (reduced) {
      spans.forEach((s) => {
        s.style.width = `${revealWidth}px`;
      });
      return;
    }

    const ctx = gsap.context(() => {
      const lineEls =
        containerRef.current!.querySelectorAll<HTMLElement>(".reveal-line");

      lineEls.forEach((line) => {
        const imgSpan = line.querySelector(".img-reveal-span");
        if (!imgSpan) return;
        gsap.to(imgSpan, {
          width: revealWidth,
          ease: "none",
          scrollTrigger: {
            trigger: line,
            start: "top 85%",
            end: "top 40%",
            scrub: 1,
            invalidateOnRefresh: true,
          },
        });
      });
    }, containerRef);

    const refreshTimer = window.setTimeout(() => ScrollTrigger.refresh(), 150);

    const moveMouse = (e: MouseEvent) => {
      if (!mouseImgRef.current) return;
      gsap.to(mouseImgRef.current, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.5,
        ease: "power3.out",
      });
    };
    window.addEventListener("mousemove", moveMouse);

    return () => {
      window.clearTimeout(refreshTimer);
      window.removeEventListener("mousemove", moveMouse);
      ctx.revert();
    };
  }, [revealWidthDesktop, revealWidthMobile]);

  const defaultTextClass =
    "font-heading text-[clamp(2rem,7vw,6.5rem)] font-bold tracking-[-0.03em] leading-[0.95] whitespace-nowrap uppercase select-none text-white";

  const combinedTextClass = textClassName
    ? `${defaultTextClass} ${textClassName}`
    : defaultTextClass;

  const fallbackFirstImage = lines.find((l) => l.image)?.image || fallbackImage;

  return (
    <div
      className={`relative w-full overflow-x-hidden cursor-default py-24 md:py-36 ${className}`}
    >
      {/* Cursor-following preview (desktop hover only). */}
      <div
        ref={mouseImgRef}
        aria-hidden
        className={`fixed left-0 top-0 h-[190px] w-[280px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl bg-white/5 ring-1 ring-white/15 shadow-[0_30px_70px_-10px_rgba(0,0,0,0.6)] pointer-events-none z-[60] transition-opacity duration-300 md:h-[330px] md:w-[500px] ${
          activeImage ? "opacity-100" : "opacity-0"
        }`}
      >
        <img
          src={activeImage || fallbackFirstImage}
          alt=""
          className="h-full w-full object-cover"
          onError={(e) => {
            e.currentTarget.src = fallbackImage;
          }}
        />
      </div>

      <div
        ref={containerRef}
        className="flex w-full flex-col items-center justify-center space-y-3 px-4 md:space-y-6"
      >
        {lines.map((line, idx) => {
          if (line.fullText) {
            return (
              <div
                key={line.id || `line-${idx}`}
                className="reveal-line flex items-center justify-center"
              >
                <span className={combinedTextClass}>{line.fullText}</span>
              </div>
            );
          }

          return (
            <div
              key={line.id || `line-${idx}`}
              className="reveal-line flex flex-wrap items-center justify-center gap-2 md:flex-nowrap md:gap-6"
            >
              {line.prefix && (
                <span className={combinedTextClass}>{line.prefix}</span>
              )}

              {line.image && (
                <span
                  onMouseEnter={() => setActiveImage(line.image!)}
                  onMouseLeave={() => setActiveImage(null)}
                  className="img-reveal-span relative h-11 w-0 shrink-0 cursor-pointer overflow-hidden rounded-md bg-white/10 shadow-inner md:h-24 md:rounded-2xl"
                >
                  <img
                    src={line.image}
                    alt={line.alt || ""}
                    className="h-full w-full object-cover opacity-85 transition-opacity duration-300 hover:opacity-100"
                    onError={(e) => {
                      e.currentTarget.src = fallbackImage;
                    }}
                  />
                </span>
              )}

              {line.suffix && (
                <span className={combinedTextClass}>{line.suffix}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ImageTextReveal;
