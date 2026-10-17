"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, Link2, Clock } from "lucide-react";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface OrbitalItem {
  id: number;
  title: string;
  description: string;
  icon: React.ElementType;
  /** Short category label shown as the accent chip, e.g. "Website". */
  tag?: string;
  /** Right-aligned meta in the card header, e.g. a typical timeline. */
  meta?: string;
  /** "What you get" bullet list. */
  points?: string[];
  /** Tech / keyword chips. */
  chips?: string[];
  /** Ids of related nodes — these pulse and are linked in the card. */
  relatedIds: number[];
  /** CTA link (e.g. a WhatsApp prefill URL). */
  href?: string;
  ctaLabel?: string;
  featured?: boolean;
}

interface OrbitalTimelineProps {
  items: OrbitalItem[];
  className?: string;
}

export default function OrbitalTimeline({
  items,
  className,
}: OrbitalTimelineProps) {
  const prefersReduced = useReducedMotion();

  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [rotationAngle, setRotationAngle] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);
  const [radius, setRadius] = useState(180);

  const containerRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  // Pause auto-rotation entirely when the visitor prefers reduced motion.
  useEffect(() => {
    if (prefersReduced) setAutoRotate(false);
  }, [prefersReduced]);

  // Responsive orbit radius: derive from the box so nodes never overflow.
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const update = () => {
      const d = Math.min(el.clientWidth, el.clientHeight);
      setRadius(Math.max(108, Math.min(300, d / 2 - 64)));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Continuous slow orbit, paused while a node is open or on reduced motion.
  useEffect(() => {
    if (!autoRotate || prefersReduced || expandedId !== null) return;
    const timer = setInterval(() => {
      setRotationAngle((prev) => Number(((prev + 0.15) % 360).toFixed(3)));
    }, 50);
    return () => clearInterval(timer);
  }, [autoRotate, prefersReduced, expandedId]);

  const reset = () => {
    setExpandedId(null);
    setAutoRotate(!prefersReduced);
  };

  const handleBackgroundClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === containerRef.current || e.target === boxRef.current) {
      reset();
    }
  };

  const toggleItem = (id: number) => {
    setExpandedId((prev) => {
      const next = prev === id ? null : id;
      setAutoRotate(next === null ? !prefersReduced : false);
      if (next !== null) centerViewOnNode(id);
      return next;
    });
  };

  const centerViewOnNode = (nodeId: number) => {
    const index = items.findIndex((item) => item.id === nodeId);
    if (index < 0) return;
    setRotationAngle(270 - (index / items.length) * 360);
  };

  const calculateNodePosition = (index: number, total: number) => {
    const angle = ((index / total) * 360 + rotationAngle) % 360;
    const radian = (angle * Math.PI) / 180;
    // Round to a fixed precision so the server- and client-rendered inline
    // styles serialize to identical strings (avoids a hydration mismatch).
    const round = (n: number, p = 100) => Math.round(n * p) / p;
    const x = round(radius * Math.cos(radian));
    const y = round(radius * Math.sin(radian));
    const zIndex = Math.round(100 + 50 * Math.cos(radian));
    const opacity = round(
      Math.max(0.45, Math.min(1, 0.45 + 0.55 * ((1 + Math.sin(radian)) / 2))),
      1000
    );
    return { x, y, zIndex, opacity };
  };

  const relatedTo = (id: number | null) =>
    id === null ? [] : items.find((i) => i.id === id)?.relatedIds ?? [];

  const activeItem = items.find((i) => i.id === expandedId) ?? null;

  return (
    <div
      ref={containerRef}
      onClick={handleBackgroundClick}
      className={cn(
        "relative flex w-full items-center justify-center overflow-hidden",
        "h-[580px] sm:h-[680px] md:h-[760px]",
        className
      )}
    >
      {/* Soft warm core glow behind the orbit. */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-60 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, color-mix(in srgb, var(--accent) 45%, transparent) 0%, transparent 70%)",
        }}
      />

      <div
        ref={boxRef}
        className="relative flex h-full w-full max-w-4xl items-center justify-center"
        style={{ perspective: "1000px" }}
      >
        {/* Central orb — warm gradient with a cream core. */}
        <div className="absolute z-10 flex h-16 w-16 items-center justify-center">
          <div
            className="absolute h-16 w-16 rounded-full"
            style={{ background: "var(--grad-warm)" }}
          />
          <div
            className={cn(
              "absolute h-20 w-20 rounded-full border border-accent/40",
              !prefersReduced && "animate-ping opacity-70"
            )}
          />
          <div
            className={cn(
              "absolute h-24 w-24 rounded-full border border-accent/20",
              !prefersReduced && "animate-ping opacity-50"
            )}
            style={{ animationDelay: "0.6s" }}
          />
          <div className="h-7 w-7 rounded-full bg-[color:var(--accent-fill)] shadow-[0_0_20px_rgba(255,154,77,0.6)] backdrop-blur-md" />
        </div>

        {/* Orbit ring. */}
        <div
          aria-hidden
          className="absolute rounded-full border border-border"
          style={{ width: radius * 2, height: radius * 2 }}
        />

        {items.map((item, index) => {
          const pos = calculateNodePosition(index, items.length);
          const isExpanded = expandedId === item.id;
          const isRelated = relatedTo(expandedId).includes(item.id);
          const Icon = item.icon;

          return (
            <div
              key={item.id}
              className="absolute transition-all duration-700"
              style={{
                transform: `translate(${pos.x}px, ${pos.y}px)`,
                zIndex: isExpanded ? 200 : pos.zIndex,
                opacity: isExpanded ? 1 : pos.opacity,
              }}
            >
              {/* Energy halo. */}
              <div
                aria-hidden
                className={cn(
                  "absolute -inset-3 rounded-full",
                  isRelated && !prefersReduced && "animate-pulse"
                )}
                style={{
                  background:
                    "radial-gradient(circle, color-mix(in srgb, var(--accent) 22%, transparent) 0%, transparent 70%)",
                }}
              />

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleItem(item.id);
                }}
                aria-expanded={isExpanded}
                aria-label={`${item.title}${item.tag ? ` — ${item.tag}` : ""}`}
                className="group relative flex flex-col items-center outline-none"
              >
                <span
                  className={cn(
                    "flex h-11 w-11 items-center justify-center rounded-full border-2 transition-all duration-300",
                    "group-focus-visible:ring-2 group-focus-visible:ring-accent group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-bg",
                    isExpanded
                      ? "scale-150 border-accent bg-[color:var(--accent-fill)] text-[color:var(--on-accent)] shadow-[0_0_24px_rgba(255,154,77,0.55)]"
                      : isRelated
                        ? "border-accent bg-accent/25 text-text"
                        : "border-border bg-surface-2 text-accent md:group-hover:border-accent/60"
                  )}
                >
                  <Icon size={17} aria-hidden />
                </span>

                <span
                  className={cn(
                    "pointer-events-none absolute left-1/2 top-12 w-24 -translate-x-1/2 text-center font-heading text-[0.7rem] font-semibold leading-tight tracking-wide transition-all duration-300 sm:w-auto sm:whitespace-nowrap sm:text-xs",
                    isExpanded ? "scale-110 text-accent" : "text-text/70"
                  )}
                >
                  {item.title}
                </span>
              </button>
            </div>
          );
        })}

        {/* Detail card for the active build. Rendered once and anchored to the
            top-centre (where the active node settles), so it stays fully on
            screen — CTA included — at every width instead of dangling off a
            node near the edge. */}
        {activeItem && (
          <div
            className="absolute left-1/2 z-[300] w-[min(19rem,calc(100%-1.5rem))] -translate-x-1/2 overflow-y-auto overscroll-contain rounded-2xl border border-accent/30 bg-[color:var(--bg-2)]/95 p-4 text-left shadow-[0_30px_70px_-30px_rgba(0,0,0,0.85)] backdrop-blur-xl"
            style={{
              top: `calc(50% - ${radius}px + 2.5rem)`,
              maxHeight: `calc(50% + ${radius}px - 2.75rem)`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <span className="absolute -top-3 left-1/2 h-3 w-px -translate-x-1/2 bg-accent/50" />

            <div className="flex items-center justify-between gap-2">
              {activeItem.tag && (
                <span className="rounded-full border border-accent/40 bg-accent/15 px-2 py-0.5 font-mono text-[0.65rem] uppercase tracking-wider text-accent">
                  {activeItem.tag}
                </span>
              )}
              {activeItem.meta && (
                <span className="flex items-center gap-1 font-mono text-[0.65rem] text-muted">
                  <Clock size={10} aria-hidden />
                  {activeItem.meta}
                </span>
              )}
            </div>

            <h3 className="mt-2 font-heading text-sm font-bold text-text">
              {activeItem.title}
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-muted">
              {activeItem.description}
            </p>

            {activeItem.chips && activeItem.chips.length > 0 && (
              <ul className="mt-3 flex flex-wrap gap-1">
                {activeItem.chips.map((chip) => (
                  <li
                    key={chip}
                    className="rounded-full border border-border px-2 py-0.5 font-mono text-[0.6rem] text-muted"
                  >
                    {chip}
                  </li>
                ))}
              </ul>
            )}

            {activeItem.points && activeItem.points.length > 0 && (
              <ul className="mt-3 space-y-1 border-t border-border pt-3 text-xs text-muted">
                {activeItem.points.map((point) => (
                  <li key={point} className="flex gap-1.5">
                    <span className="mt-[2px] text-accent">·</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            )}

            {activeItem.relatedIds.length > 0 && (
              <div className="mt-3 border-t border-border pt-3">
                <p className="mb-2 flex items-center gap-1 font-mono text-[0.6rem] uppercase tracking-wider text-muted">
                  <Link2 size={10} aria-hidden /> Pairs well with
                </p>
                <div className="flex flex-wrap gap-1">
                  {activeItem.relatedIds.map((relId) => {
                    const rel = items.find((i) => i.id === relId);
                    if (!rel) return null;
                    return (
                      <button
                        key={relId}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleItem(relId);
                        }}
                        className="flex items-center gap-1 rounded-full border border-accent/25 px-2 py-0.5 text-[0.65rem] text-text/80 transition-colors hover:border-accent/60 hover:text-text"
                      >
                        {rel.title}
                        <ArrowRight size={9} className="text-accent" aria-hidden />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {activeItem.href && (
              <a
                href={activeItem.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="btn-primary mt-4 w-full text-xs"
              >
                {activeItem.ctaLabel ?? "Ask about this"}
                <ArrowRight size={13} aria-hidden />
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
