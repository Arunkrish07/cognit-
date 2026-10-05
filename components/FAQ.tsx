"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { faqItems } from "@/data/faq";
import { cn } from "@/lib/utils";

export function FAQ({ hideHeading = false }: { hideHeading?: boolean }) {
  const reduced = useReducedMotion();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section
      id="faq"
      className="section-padding"
      aria-labelledby={hideHeading ? undefined : "faq-heading"}
      aria-label={hideHeading ? "FAQ" : undefined}
    >
      <div className="container-main max-w-3xl">
        {!hideHeading && (
          <motion.h2
            id="faq-heading"
            className="heading-lg text-text"
            initial={reduced ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            FAQ
          </motion.h2>
        )}

        <ul className="mt-2 divide-y divide-border">
          {faqItems.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <li key={item.question}>
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-4 py-5 text-left"
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  aria-expanded={isOpen}
                >
                  <span className="font-medium text-text">{item.question}</span>
                  <ChevronDown
                    size={20}
                    className={cn(
                      "shrink-0 text-muted transition-transform duration-250",
                      isOpen && "rotate-180"
                    )}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="pb-5 text-muted">{item.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
