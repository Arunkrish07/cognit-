"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { images } from "@/data/images";

gsap.registerPlugin(ScrollTrigger);

const steps = [
  {
    number: "01",
    title: "Discover",
    text: "We talk through your idea and goals.",
  },
  {
    number: "02",
    title: "Design",
    text: "You see the plan and the look before we build.",
  },
  {
    number: "03",
    title: "Build",
    text: "I build it, test it, and share progress often.",
  },
  {
    number: "04",
    title: "Launch and support",
    text: "We go live, and I stay available after launch.",
  },
];

export function Process({ hideHeading = false }: { hideHeading?: boolean }) {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const figureRef = useRef<HTMLElement>(null);
  const groupRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const mm = gsap.matchMedia();

    // Horizontal pinned timeline on every screen (phones, tablets, desktop).
    // Reduced-motion users get the static vertical fallback instead.
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const stage = stageRef.current;
      const track = trackRef.current;
      const figure = figureRef.current;
      const group = groupRef.current;
      const line = lineRef.current;
      if (!stage || !track || !figure || !group || !line) return;

      const panels = gsap.utils.toArray<HTMLElement>(".process-panel", group);
      const distance = () => Math.max(0, track.scrollWidth - stage.clientWidth);
      // Touch devices get a lighter reveal offset so copy never clips.
      const coarse = window.matchMedia("(pointer: coarse)").matches;

      // Master timeline, pinned + scrubbed. Phase 1 reveals the image,
      // phase 2 slides the whole track so the timeline travels through.
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: stage,
          start: "top top",
          end: () => "+=" + distance() * 1.45,
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      // Phase 1 — the image "comes in" as you begin scrolling.
      tl.fromTo(
        figure,
        { autoAlpha: 0, scale: 0.9, filter: "blur(14px)" },
        { autoAlpha: 1, scale: 1, filter: "blur(0px)", ease: "power2.out", duration: 0.5 },
        0
      )
        .fromTo(
          figure.querySelector("img"),
          { scale: 1.18 },
          { scale: 1, ease: "none", duration: 0.5 },
          0
        )
        .to({}, { duration: 0.12 }); // brief hold on the full image

      // Phase 2 — slide the track; the accent line draws in lock-step.
      tl.to(track, { x: () => -distance(), ease: "none", duration: 1 }, "move")
        .fromTo(line, { scaleX: 0 }, { scaleX: 1, ease: "none", duration: 1 }, "move");

      // Each milestone reveals as it reaches centre (horizontal position).
      panels.forEach((panel) => {
        const items = panel.querySelectorAll<HTMLElement>("[data-reveal]");
        gsap.fromTo(
          items,
          { y: 48, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            stagger: 0.08,
            ease: "power3.out",
            scrollTrigger: {
              trigger: panel,
              containerAnimation: tl,
              start: coarse ? "left 92%" : "left 80%",
              toggleActions: "play none none reverse",
            },
          }
        );

        const dot = panel.querySelector<HTMLElement>("[data-dot]");
        if (dot) {
          gsap.fromTo(
            dot,
            { scale: 0 },
            {
              scale: 1,
              duration: 0.45,
              ease: "back.out(2)",
              scrollTrigger: {
                trigger: panel,
                containerAnimation: tl,
                start: coarse ? "left 90%" : "left 76%",
                toggleActions: "play none none reverse",
              },
            }
          );
        }
      });
    });

    // Fonts/images change measured widths; recalc once they settle.
    let killed = false;
    if (typeof document !== "undefined" && document.fonts) {
      document.fonts.ready.then(() => {
        if (!killed) ScrollTrigger.refresh();
      });
    }

    return () => {
      killed = true;
      mm.revert();
    };
  }, []);

  return (
    <section
      id="process"
      ref={sectionRef}
      className="relative overflow-hidden bg-surface/20"
      aria-labelledby={hideHeading ? undefined : "process-heading"}
      aria-label={hideHeading ? "How we work together" : undefined}
    >
      {/* Centered headline moment */}
      {!hideHeading && (
        <div className="relative flex min-h-[72vh] items-center justify-center px-6 py-24 text-center md:min-h-screen">
          <div
            className="glow"
            style={{
              width: "38rem",
              height: "38rem",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              background: "var(--accent)",
              opacity: 0.12,
            }}
            aria-hidden
          />
          <div className="relative max-w-4xl">
            <p className="kicker mb-5">The process</p>
            <h2 id="process-heading" className="heading-xl text-text">
              How we work <span className="text-warm">together</span>
            </h2>
            <p className="mx-auto mt-7 max-w-xl text-lg leading-relaxed text-muted md:text-xl">
              A clear path from the first call to launch — and I stay with you
              after we go live.
            </p>
            <span
              className="mt-10 inline-block text-2xl text-accent motion-safe:animate-bounce"
              aria-hidden
            >
              &darr;
            </span>
          </div>
        </div>
      )}

      {/* ---------- Image reveal + pinned horizontal timeline (all sizes) ---------- */}
      <div className="hidden motion-safe:block">
        <div
          ref={stageRef}
          className="relative flex h-screen items-center overflow-hidden"
        >
          <div
            className="glow"
            style={{
              width: "46rem",
              height: "46rem",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              background: "var(--accent)",
              opacity: 0.09,
            }}
            aria-hidden
          />

          <div
            ref={trackRef}
            className="relative flex h-full items-center gap-[9vw] pl-[8vw] pr-[36vw] will-change-transform sm:gap-[7vw] sm:pr-[28vw] md:pr-[26vw]"
          >
            {/* Leading image — reveals first, then slides away */}
            <figure
              ref={figureRef}
              className="relative h-[54vh] w-[84vw] flex-none overflow-hidden rounded-[var(--radius-card)] border border-border shadow-[0_40px_120px_-40px_rgba(0,0,0,0.85)] sm:h-[60vh] sm:w-[68vw] md:w-[60vw] lg:h-[66vh] lg:w-[50vw]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={images.processTimeline}
                alt="Precision-cut glass blocks arranged in a stepped layout"
                draggable={false}
                className="h-full w-full object-cover"
              />
              <figcaption className="absolute bottom-5 left-5 font-mono text-xs tracking-[0.18em] text-white/90 drop-shadow sm:bottom-6 sm:left-7 sm:text-sm">
                FROM FIRST CALL TO LAUNCH
              </figcaption>
            </figure>

            {/* Timeline group — baseline + milestones */}
            <div ref={groupRef} className="relative flex h-full items-center">
              <div className="pointer-events-none absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-border" />
              <div
                ref={lineRef}
                className="pointer-events-none absolute left-0 top-1/2 h-px w-full -translate-y-1/2 origin-left bg-accent"
              />

              {steps.map((step, i) => {
                const above = i % 2 === 0;
                return (
                  <article
                    key={step.number}
                    className="process-panel group relative flex h-full w-[80vw] flex-none items-center sm:w-[58vw] md:w-[46vw] lg:w-[38vw] xl:w-[32vw]"
                  >
                    <span
                      data-dot
                      aria-hidden
                      className="absolute left-0 top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent shadow-[0_0_22px_rgba(255,154,77,0.75)] transition-transform duration-300 group-hover:scale-125"
                    />
                    <div
                      className={`absolute left-0 w-[min(26rem,86%)] ${
                        above ? "bottom-1/2 mb-10 sm:mb-12" : "top-1/2 mt-10 sm:mt-12"
                      }`}
                    >
                      <span
                        aria-hidden
                        className={`absolute left-0 w-px bg-gradient-to-b from-accent/70 to-accent/0 ${
                          above ? "top-full h-10 rotate-180 sm:h-12" : "bottom-full h-10 sm:h-12"
                        }`}
                      />
                      <span
                        data-reveal
                        className="inline-block font-mono text-sm tracking-[0.15em] text-accent"
                      >
                        {step.number}
                      </span>
                      <h3
                        data-reveal
                        className="mt-3 font-heading text-3xl font-bold leading-[0.98] text-text sm:mt-4 sm:text-4xl lg:text-5xl"
                      >
                        {step.title}
                      </h3>
                      <p
                        data-reveal
                        className="mt-4 max-w-sm text-base leading-relaxed text-muted sm:mt-5 sm:text-lg"
                      >
                        {step.text}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ---------- Reduced-motion fallback: stacked image + vertical timeline ---------- */}
      <div className="container-main block pb-20 motion-safe:hidden">
        <figure className="mt-8 overflow-hidden rounded-[var(--radius-card)] border border-border shadow-[0_30px_80px_-40px_rgba(0,0,0,0.85)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images.processTimeline}
            alt="Precision-cut glass blocks arranged in a stepped layout"
            draggable={false}
            className="aspect-[16/10] w-full object-cover"
          />
        </figure>

        <ol className="relative mt-12 space-y-12">
          <div className="absolute left-[1.3rem] top-3 bottom-3 w-px bg-border" />
          {steps.map((step) => (
            <li key={step.number} className="relative pl-16">
              <span className="absolute left-0 top-0 flex size-11 items-center justify-center rounded-full border border-border bg-bg-2 font-mono text-sm text-accent">
                {step.number}
              </span>
              <h3 className="font-heading text-2xl font-bold text-text md:text-3xl">
                {step.title}
              </h3>
              <p className="mt-2 text-lg leading-relaxed text-muted">
                {step.text}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
