"use client";

import { useRef } from "react";
import {
  motion,
  useMotionValue,
  useMotionTemplate,
  useSpring,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import {
  MessageCircle,
  Clock,
  Sparkles,
  User,
  LifeBuoy,
  type LucideIcon,
} from "lucide-react";
import { whyPoints } from "@/data/site";
import { cn } from "@/lib/utils";

const icons: Record<(typeof whyPoints)[number]["icon"], LucideIcon> = {
  "message-circle": MessageCircle,
  clock: Clock,
  sparkles: Sparkles,
  user: User,
  "life-buoy": LifeBuoy,
};

export function WhyCognit() {
  const reduced = useReducedMotion();

  return (
    <section className="section-padding" aria-labelledby="why-heading">
      <div className="container-main">
        <motion.h2
          id="why-heading"
          className="heading-lg text-text"
          initial={reduced ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Why Cognit
        </motion.h2>

        {/* 5 points, asymmetric bento that fills exactly at lg:
            row 1 = two wide cards (3+3), row 2 = three cards (2+2+2).
            Collapses to a single column below lg (mobile override). */}
        <ul className="mt-12 grid gap-5 lg:grid-cols-6">
          {whyPoints.map((point, i) => (
            <WhyCard
              key={point.title}
              point={point}
              index={i}
              reduced={!!reduced}
            />
          ))}
        </ul>
      </div>
    </section>
  );
}

function WhyCard({
  point,
  index,
  reduced,
}: {
  point: (typeof whyPoints)[number];
  index: number;
  reduced: boolean;
}) {
  const Icon = icons[point.icon];
  const span = index < 2 ? "lg:col-span-3" : "lg:col-span-2";

  // Pointer position within the card, 0..1 on each axis.
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);

  // Spring the tilt so it eases rather than snapping to the cursor.
  const rotateX = useSpring(useTransform(py, [0, 1], [7, -7]), {
    stiffness: 150,
    damping: 18,
  });
  const rotateY = useSpring(useTransform(px, [0, 1], [-7, 7]), {
    stiffness: 150,
    damping: 18,
  });

  // Spotlight glow follows the cursor across the card face.
  const glowX = useTransform(px, (v) => `${v * 100}%`);
  const glowY = useTransform(py, (v) => `${v * 100}%`);
  const glow = useMotionTemplate`radial-gradient(22rem 22rem at ${glowX} ${glowY}, rgba(255,154,77,0.16), transparent 60%)`;

  const handleMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reduced) return;
    const rect = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - rect.left) / rect.width);
    py.set((e.clientY - rect.top) / rect.height);
  };

  const reset = () => {
    px.set(0.5);
    py.set(0.5);
  };

  const content = (
    <>
      {/* Cursor-tracking spotlight */}
      {!reduced && (
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ background: glow }}
        />
      )}
      <div className="relative" style={reduced ? undefined : { transform: "translateZ(40px)" }}>
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-accent-fill/12 text-accent transition-transform duration-300 group-hover:scale-110">
          <Icon size={20} aria-hidden />
        </span>
        <h3 className="mt-4 font-heading text-lg font-bold text-text">
          {point.title}
        </h3>
        <p className="mt-2 text-sm text-muted">{point.description}</p>
      </div>
    </>
  );

  return (
    <motion.li
      className={cn("[perspective:900px]", span)}
      initial={reduced ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.06, duration: 0.45 }}
    >
      <motion.div
        onPointerMove={handleMove}
        onPointerLeave={reset}
        style={
          reduced
            ? undefined
            : { rotateX, rotateY, transformStyle: "preserve-3d" }
        }
        className="group relative h-full overflow-hidden rounded-2xl border border-border bg-surface p-6 transition-colors duration-300 hover:border-accent/50 hover:shadow-[0_24px_60px_-30px_rgba(255,154,77,0.4)]"
      >
        {content}
      </motion.div>
    </motion.li>
  );
}
