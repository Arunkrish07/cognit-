"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "framer-motion";

gsap.registerPlugin(ScrollTrigger);

const steps = [
  {
    number: "1",
    title: "Discover",
    text: "We talk through your idea and goals.",
  },
  {
    number: "2",
    title: "Design",
    text: "You see the plan and the look before we build.",
  },
  {
    number: "3",
    title: "Build",
    text: "I build it, test it, and share progress often.",
  },
  {
    number: "4",
    title: "Launch and support",
    text: "We go live, and I stay available after launch.",
  },
];

export function Process({ hideHeading = false }: { hideHeading?: boolean }) {
  const reduced = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const desktopRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reduced || !sectionRef.current) return;

    const mm = gsap.matchMedia();

    mm.add("(min-width: 768px)", () => {
      const ctx = gsap.context(() => {
        const panels = gsap.utils.toArray<HTMLElement>(".process-step");
        const line = lineRef.current;

        ScrollTrigger.create({
          trigger: sectionRef.current,
          start: "top top",
          end: `+=${panels.length * 100}%`,
          pin: desktopRef.current,
          scrub: 1,
          anticipatePin: 1,
        });

        panels.forEach((panel, i) => {
          ScrollTrigger.create({
            trigger: sectionRef.current,
            start: `top+=${i * 25}% top`,
            end: `top+=${(i + 1) * 25}% top`,
            onEnter: () => {
              panels.forEach((p, j) =>
                p.classList.toggle("is-active", j === i)
              );
            },
            onEnterBack: () => {
              panels.forEach((p, j) =>
                p.classList.toggle("is-active", j === i)
              );
            },
          });
        });

        if (line) {
          gsap.fromTo(
            line,
            { scaleY: 0 },
            {
              scaleY: 1,
              ease: "none",
              scrollTrigger: {
                trigger: sectionRef.current,
                start: "top center",
                end: "bottom center",
                scrub: true,
              },
            }
          );
        }
      }, sectionRef);

      return () => ctx.revert();
    });

    return () => mm.revert();
  }, [reduced]);

  return (
    <section
      id="process"
      ref={sectionRef}
      className="section-padding bg-surface/30"
      aria-labelledby={hideHeading ? undefined : "process-heading"}
      aria-label={hideHeading ? "Process" : undefined}
    >
      <div className="container-main">
        {!hideHeading && (
          <h2 id="process-heading" className="heading-lg text-text">
            How we work together
          </h2>
        )}

        {/* Desktop pinned timeline */}
        <div ref={desktopRef} className="relative mt-16 hidden md:block">
          <div className="grid grid-cols-[48px_1fr] gap-8">
            <div className="relative flex justify-center">
              <div
                ref={lineRef}
                className="absolute top-0 h-full w-0.5 origin-top bg-accent/30"
              />
              <div className="absolute top-0 h-full w-0.5 bg-accent/10" />
            </div>
            <div className="relative min-h-[320px]">
              {steps.map((step, i) => (
                <div
                  key={step.number}
                  className={`process-step absolute inset-0 transition-opacity duration-500 ${
                    i === 0 ? "is-active opacity-100" : "opacity-0"
                  }`}
                >
                  <span
                    className="font-mono text-5xl font-medium text-accent/35"
                    aria-hidden
                  >
                    0{step.number}
                  </span>
                  <h3 className="mt-3 font-heading text-3xl font-bold text-text">
                    {step.title}
                  </h3>
                  <p className="mt-4 max-w-lg text-lg text-muted">{step.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile vertical timeline */}
        <ol className="relative mt-12 space-y-10 md:hidden">
          <div className="absolute left-4 top-2 h-[calc(100%-1rem)] w-0.5 bg-border" />
          {steps.map((step) => (
            <li key={step.number} className="relative pl-12">
              <span className="absolute left-0 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface font-mono text-sm text-accent">
                {step.number}
              </span>
              <h3 className="font-heading text-xl font-bold text-text">
                {step.title}
              </h3>
              <p className="mt-2 text-muted">{step.text}</p>
            </li>
          ))}
        </ol>
      </div>

    </section>
  );
}
