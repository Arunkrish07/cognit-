"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Globe,
  Smartphone,
  Bot,
  MessageSquare,
  type LucideIcon,
} from "lucide-react";
import { services, featuredCombo, type Service } from "@/data/services";
import { site } from "@/data/site";
import { cn } from "@/lib/utils";

const iconMap: Record<Service["icon"], LucideIcon> = {
  globe: Globe,
  smartphone: Smartphone,
  bot: Bot,
  "message-square": MessageSquare,
};

export function Services({ hideHeading = false }: { hideHeading?: boolean }) {
  const reduced = useReducedMotion();
  const [expanded, setExpanded] = useState<string | null>(null);

  const openService = (id: string) =>
    setExpanded((prev) => (prev === id ? null : id));

  return (
    <section
      id="services"
      className="section-padding bg-surface/30"
      aria-labelledby={hideHeading ? undefined : "services-heading"}
      aria-label={hideHeading ? "Services" : undefined}
    >
      <div className="container-main">
        {!hideHeading && (
          <motion.h2
            id="services-heading"
            className="heading-lg text-text"
            initial={reduced ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            What Cognit builds
          </motion.h2>
        )}

        <div
          className={cn(
            "grid gap-4 md:grid-cols-6 md:grid-rows-2 md:gap-5",
            hideHeading ? "mt-2" : "mt-12"
          )}
        >
          {services.map((service, i) => (
            <ServiceCard
              key={service.id}
              service={service}
              className={cn(
                i === 0 && "md:col-span-3 md:row-span-1",
                i === 1 && "md:col-span-3 md:row-span-1",
                i === 2 && "md:col-span-2 md:row-span-1",
                i === 3 && "md:col-span-2 md:row-span-1"
              )}
              index={i}
              expanded={expanded === service.id}
              onToggle={() => openService(service.id)}
            />
          ))}

          <FeaturedComboCard
            service={featuredCombo}
            expanded={expanded === featuredCombo.id}
            onToggle={() => openService(featuredCombo.id)}
          />
        </div>
      </div>
    </section>
  );
}

function ServiceCard({
  service,
  className,
  index,
  expanded,
  onToggle,
}: {
  service: Service;
  className?: string;
  index: number;
  expanded: boolean;
  onToggle: () => void;
}) {
  const reduced = useReducedMotion();
  const Icon = iconMap[service.icon];

  return (
    <motion.article
      layout
      className={cn(
        "group relative rounded-2xl border border-border bg-surface p-6 transition-[transform,border-color,box-shadow] duration-200 md:hover:-translate-y-1 md:hover:border-accent/40 md:hover:shadow-[0_18px_50px_-24px_rgba(0,0,0,0.55)]",
        className
      )}
      initial={reduced ? false : { opacity: 0, scale: 0.96 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-5%" }}
      transition={{ delay: index * 0.08, duration: 0.5 }}
    >
      <button
        type="button"
        className="w-full text-left"
        onClick={onToggle}
        aria-expanded={expanded}
      >
        <Icon size={28} className="text-accent" aria-hidden />
        <h3 className="mt-4 font-heading text-xl font-bold text-text">
          {service.title}
        </h3>
        <p className="mt-2 text-muted">{service.description}</p>
        <ul className="mt-4 flex flex-wrap gap-2">
          {service.tags.map((tag) => (
            <li
              key={tag}
              className="rounded-full border border-border px-2.5 py-0.5 font-mono text-[0.7rem] text-muted"
            >
              {tag}
            </li>
          ))}
        </ul>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="mt-4 border-t border-border pt-4">
              <p className="text-sm font-medium text-text">What you get</p>
              <ul className="mt-2 space-y-1 text-sm text-muted">
                {service.whatYouGet.map((item) => (
                  <li key={item}>· {item}</li>
                ))}
              </ul>
              <p className="mt-3 text-sm">
                <span className="font-medium text-text">Typical timeline:</span>{" "}
                <span className="text-muted">{service.timeline}</span>
              </p>
              <a
                href={`${site.whatsappPrefill}&text=Hi%20Cognit%2C%20I%27m%20interested%20in%20${encodeURIComponent(service.title)}.`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary mt-4 text-sm"
              >
                Ask about this service
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}

function FeaturedComboCard({
  service,
  expanded,
  onToggle,
}: {
  service: Service;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <motion.article
      layout
      className="relative overflow-hidden rounded-2xl border border-accent/50 bg-surface p-6 md:col-span-2 md:row-span-1"
      style={{
        background:
          "linear-gradient(135deg, color-mix(in srgb, var(--accent-fill) 8%, var(--surface)), var(--surface))",
      }}
      initial={{ opacity: 0, scale: 0.96 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: 0.32, duration: 0.5 }}
    >
      <span
        className="absolute inset-x-0 top-0 h-1 bg-accent-fill"
        aria-hidden
      />
      <button
        type="button"
        className="w-full text-left"
        onClick={onToggle}
        aria-expanded={expanded}
      >
        <span className="mono-label">Featured package</span>
        <h3 className="mt-2 font-heading text-xl font-bold text-text">
          {service.title}
        </h3>
        <p className="mt-2 text-muted">{service.description}</p>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <ul className="mt-4 space-y-1 text-sm text-muted">
              {service.whatYouGet.map((item) => (
                <li key={item}>· {item}</li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      <a
        href={`${site.whatsappPrefill}&text=Hi%20Cognit%2C%20I%27m%20interested%20in%20the%20Website%20%2B%20WhatsApp%20bot%20starter%20package.`}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-primary mt-4 text-sm"
      >
        Ask about this package
      </a>
    </motion.article>
  );
}
