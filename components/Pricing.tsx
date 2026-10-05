"use client";

import { motion, useReducedMotion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { site } from "@/data/site";

export function Pricing() {
  const reduced = useReducedMotion();

  return (
    <section
      id="pricing"
      className="section-padding bg-surface/30"
      aria-labelledby="pricing-heading"
    >
      <div className="container-main">
        <motion.div
          className="mx-auto max-w-xl rounded-2xl border border-border bg-surface p-8 text-center md:p-12"
          initial={reduced ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 id="pricing-heading" className="font-heading text-2xl font-bold text-text md:text-3xl">
            Get a free quote
          </h2>
          <p className="mt-4 text-muted">
            Every project is different. Tell me what you need and I&apos;ll send
            a clear quote with a timeline. No pressure, no jargon.
          </p>
          <a
            href={site.whatsappPrefill}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary mt-8 inline-flex"
          >
            <MessageCircle size={18} className="text-success" />
            Chat on WhatsApp
          </a>
        </motion.div>
      </div>
    </section>
  );
}
