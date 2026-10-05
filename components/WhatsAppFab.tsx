"use client";

import { useState } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from "framer-motion";
import { MessageCircle } from "lucide-react";
import { site } from "@/data/site";

export function WhatsAppFab() {
  const [visible, setVisible] = useState(false);
  const [showTip, setShowTip] = useState(false);

  // Show the FAB once the hero has scrolled out of view. useScroll's
  // batched listener replaces the banned window scroll handler and only
  // flips React state when the boolean actually changes.
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", () => {
    const hero = document.getElementById("hero");
    if (!hero) return;
    const next = hero.getBoundingClientRect().bottom < 0;
    setVisible((prev) => (prev === next ? prev : next));
  });

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed z-50"
          style={{
            bottom: "max(1.25rem, env(safe-area-inset-bottom))",
            right: "max(1.25rem, env(safe-area-inset-right))",
          }}
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ duration: 0.25 }}
          onMouseEnter={() => setShowTip(true)}
          onMouseLeave={() => setShowTip(false)}
          onFocus={() => setShowTip(true)}
          onBlur={() => setShowTip(false)}
        >
          {showTip && (
            <span className="absolute -top-10 right-0 whitespace-nowrap rounded-lg bg-surface px-3 py-1.5 text-xs text-text shadow-lg">
              Chat with me
            </span>
          )}
          <a
            href={site.whatsappPrefill}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-14 w-14 items-center justify-center rounded-full bg-success text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
            aria-label="Chat on WhatsApp"
          >
            <MessageCircle size={26} />
          </a>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
