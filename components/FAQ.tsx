"use client";

import { useRef, useState } from "react";
import {
  motion,
  AnimatePresence,
  useInView,
  useReducedMotion,
} from "framer-motion";
import { ChevronDown, Sparkles } from "lucide-react";
import { faqItems } from "@/data/faq";
import { StreamingText } from "@/components/ui/streaming-text";
import { cn } from "@/lib/utils";

export function FAQ({ hideHeading = false }: { hideHeading?: boolean }) {
  const reduced = useReducedMotion();
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const listRef = useRef<HTMLUListElement>(null);
  // Once the list is on screen, the open answer starts to type itself out.
  const inView = useInView(listRef, { once: true, margin: "-10% 0px" });

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

        <ul ref={listRef} className="mt-8 space-y-3">
          {faqItems.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <li
                key={item.question}
                className={cn(
                  "overflow-hidden rounded-2xl border bg-surface transition-colors duration-300",
                  isOpen
                    ? "border-accent/40"
                    : "border-border hover:border-accent/25"
                )}
              >
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left sm:px-6"
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  aria-expanded={isOpen}
                >
                  <span className="flex items-center gap-3 font-medium text-text">
                    <Sparkles
                      aria-hidden
                      size={16}
                      strokeWidth={2}
                      className={cn(
                        "shrink-0 transition-colors duration-300",
                        isOpen ? "text-accent" : "text-muted"
                      )}
                    />
                    {item.question}
                  </span>
                  <ChevronDown
                    size={20}
                    aria-hidden
                    className={cn(
                      "shrink-0 text-muted transition-transform duration-300",
                      isOpen && "rotate-180 text-accent"
                    )}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <StreamingText
                        text={item.answer}
                        play={inView}
                        speed={14}
                        className="px-5 pb-5 leading-relaxed text-muted sm:px-6"
                      />
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
