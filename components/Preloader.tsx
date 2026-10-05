"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Logo } from "./Logo";

export function Preloader() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("cognit-visited")) return;

    // Reveal on the next frame (not synchronously in the effect body).
    const raf = requestAnimationFrame(() => setVisible(true));
    // Mark visited only when the splash actually completes, so React's
    // dev StrictMode remount (mount → cleanup → mount) can't leave the
    // preloader stuck visible with its hide timer cancelled.
    const timer = setTimeout(() => {
      setVisible(false);
      sessionStorage.setItem("cognit-visited", "1");
    }, 900);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
    };
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-bg"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <Logo className="h-8 w-auto text-text" showPulse />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
