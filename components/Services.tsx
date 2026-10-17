"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  Globe,
  Smartphone,
  Bot,
  MessageSquare,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import OrbitalTimeline, {
  type OrbitalItem,
} from "@/components/ui/orbital-timeline";
import { services, featuredCombo, type Service } from "@/data/services";
import { site } from "@/data/site";

const iconMap: Record<Service["icon"], LucideIcon> = {
  globe: Globe,
  smartphone: Smartphone,
  bot: Bot,
  "message-square": MessageSquare,
};

// Stable numeric ids for the orbit (relatedIds reference these).
const idMap: Record<string, number> = {
  website: 1,
  mobile: 2,
  ai: 3,
  whatsapp: 4,
  combo: 5,
};

// Which builds naturally pair up — drives the "Pairs well with" links and
// the related-node pulse.
const relations: Record<string, string[]> = {
  website: ["whatsapp", "combo"],
  mobile: ["ai"],
  ai: ["whatsapp", "mobile"],
  whatsapp: ["website", "ai", "combo"],
  combo: ["website", "whatsapp"],
};

const tagLabel: Record<string, string> = {
  website: "Website",
  mobile: "Mobile",
  ai: "AI",
  whatsapp: "WhatsApp",
  combo: "Starter",
};

function whatsappHref(title: string) {
  return `${site.whatsappPrefill}&text=Hi%20Cognit%2C%20I%27m%20interested%20in%20${encodeURIComponent(
    title
  )}.`;
}

function toOrbitalItem(service: Service): OrbitalItem {
  return {
    id: idMap[service.id],
    title: service.title,
    description: service.description,
    icon: service.combo ? Sparkles : iconMap[service.icon],
    tag: tagLabel[service.id],
    meta: service.timeline,
    points: service.whatYouGet,
    chips: service.tags,
    relatedIds: (relations[service.id] ?? []).map((key) => idMap[key]),
    href: whatsappHref(service.title),
    ctaLabel: service.combo ? "Ask about this package" : "Ask about this build",
    featured: service.featured,
  };
}

const orbitalItems: OrbitalItem[] = [...services, featuredCombo].map(
  toOrbitalItem
);

export function Services({ hideHeading = false }: { hideHeading?: boolean }) {
  const reduced = useReducedMotion();

  return (
    <section
      id="services"
      className="section-padding bg-surface/30"
      aria-labelledby={hideHeading ? undefined : "services-heading"}
      aria-label={hideHeading ? "Services" : undefined}
    >
      <div className="container-main">
        {!hideHeading && (
          <div className="max-w-2xl">
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
            <motion.p
              className="mt-4 text-muted"
              initial={reduced ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.08 }}
            >
              Four core builds that orbit one goal — more enquiries, less busywork.
              Tap a node to explore it, or follow the links to see what pairs well.
            </motion.p>
          </div>
        )}

        <OrbitalTimeline
          items={orbitalItems}
          className={hideHeading ? "mt-2" : "mt-6 md:mt-4"}
        />
      </div>
    </section>
  );
}
