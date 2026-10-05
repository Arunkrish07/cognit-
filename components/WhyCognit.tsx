"use client";

import { motion, useReducedMotion } from "framer-motion";
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
          {whyPoints.map((point, i) => {
            const Icon = icons[point.icon];
            const span = i < 2 ? "lg:col-span-3" : "lg:col-span-2";
            return (
              <motion.li
                key={point.title}
                className={cn(
                  "rounded-2xl border border-border bg-surface p-6",
                  span
                )}
                initial={reduced ? false : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.45 }}
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-accent-fill/12 text-accent">
                  <Icon size={20} aria-hidden />
                </span>
                <h3 className="mt-4 font-heading text-lg font-bold text-text">
                  {point.title}
                </h3>
                <p className="mt-2 text-sm text-muted">{point.description}</p>
              </motion.li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
