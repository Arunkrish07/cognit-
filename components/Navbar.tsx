"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from "framer-motion";
import { Menu, X } from "lucide-react";
import { Logo } from "./Logo";
import { useContactModal } from "./ContactModalProvider";
import { navLinks, site } from "@/data/site";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const { openModal } = useContactModal();
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Hide-on-scroll-down via Motion's batched listener (no window scroll handler).
  const { scrollY } = useScroll();
  const lastY = useRef(0);
  useMotionValueEvent(scrollY, "change", (y) => {
    setHidden(y > lastY.current && y > 80 && !menuOpen);
    setScrolled(y > 40);
    lastY.current = y;
  });

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
    };
    if (menuOpen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen, closeMenu]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  // The home page's hero banner renders its own pill nav, so suppress the
  // global navbar there to avoid a double navigation bar.
  if (pathname === "/") return null;

  const openContact = () => {
    closeMenu();
    openModal();
  };

  return (
    <>
      <motion.header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-transform duration-300",
          hidden && !menuOpen && "-translate-y-full"
        )}
        style={{ transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)" }}
      >
        <nav
          className={cn(
            "glass-nav transition-[background,border] duration-300",
            scrolled && "shadow-sm"
          )}
          aria-label="Main navigation"
        >
          <div className="container-main flex h-[var(--nav-height)] items-center justify-between">
            <Link href="/" className="text-text" aria-label="Cognit home">
              <Logo className="h-7 w-auto" />
            </Link>

            <ul className="hidden items-center gap-7 md:flex">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      "text-sm font-medium transition-colors hover:text-accent",
                      isActive(link.href) ? "text-accent" : "text-muted"
                    )}
                    aria-current={isActive(link.href) ? "page" : undefined}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <button
                  type="button"
                  onClick={openModal}
                  className="text-sm font-medium text-muted transition-colors hover:text-accent"
                >
                  Contact
                </button>
              </li>
            </ul>

            <div className="hidden items-center gap-3 md:flex">
              <a
                href={site.whatsappPrefill}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary text-sm"
              >
                Book a free call
              </a>
            </div>

            <div className="flex items-center gap-2 md:hidden">
              <button
                type="button"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface"
                onClick={() => setMenuOpen(true)}
                aria-label="Open menu"
                aria-expanded={menuOpen}
              >
                <Menu size={20} />
              </button>
            </div>
          </div>
        </nav>
      </motion.header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="fixed inset-0 z-[60] flex flex-col bg-bg md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            role="dialog"
            aria-modal="true"
            aria-label="Mobile menu"
          >
            <div className="container-main flex h-[var(--nav-height)] items-center justify-between">
              <Logo className="h-7 w-auto text-text" />
              <button
                type="button"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface"
                onClick={closeMenu}
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>
            <ul className="flex flex-1 flex-col justify-center gap-6 px-5">
              {navLinks.map((link, i) => (
                <motion.li
                  key={link.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 * i, duration: 0.35 }}
                >
                  <Link
                    href={link.href}
                    onClick={closeMenu}
                    className={cn(
                      "block font-heading text-3xl font-bold",
                      isActive(link.href) ? "text-accent" : "text-text"
                    )}
                  >
                    {link.label}
                  </Link>
                </motion.li>
              ))}
              <motion.li
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 * navLinks.length, duration: 0.35 }}
              >
                <button
                  type="button"
                  onClick={openContact}
                  className="block font-heading text-3xl font-bold text-text"
                >
                  Contact
                </button>
              </motion.li>
              <motion.li
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 * (navLinks.length + 1), duration: 0.35 }}
                className="pt-4"
              >
                <a
                  href={site.whatsappPrefill}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary w-full"
                  onClick={closeMenu}
                >
                  Book a free call
                </a>
              </motion.li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
