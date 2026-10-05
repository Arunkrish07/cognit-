"use client";

import Link from "next/link";
import { ArrowUp } from "lucide-react";
import { Logo } from "./Logo";
import { useContactModal } from "./ContactModalProvider";
import { getLenis } from "@/lib/lenis";
import { navLinks, site } from "@/data/site";

export function Footer() {
  const { openModal } = useContactModal();

  const scrollTop = () => {
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(0);
    else window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="border-t border-border bg-surface/50 py-12">
      <div className="container-main">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div>
            <Link href="/" aria-label="Cognit home">
              <Logo className="h-7 w-auto text-text" />
            </Link>
            <p className="mt-3 max-w-xs text-sm text-muted">{site.tagline}</p>
          </div>

          <nav aria-label="Footer navigation">
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted transition-colors hover:text-text"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <button
                  type="button"
                  onClick={openModal}
                  className="text-sm text-muted transition-colors hover:text-text"
                >
                  Contact
                </button>
              </li>
            </ul>
          </nav>

          <button
            type="button"
            onClick={scrollTop}
            className="inline-flex items-center gap-2 self-start rounded-full border border-border px-4 py-2 text-sm text-muted transition-colors hover:text-text"
          >
            Back to top <ArrowUp size={16} />
          </button>
        </div>

        <p className="mt-10 text-sm text-muted">
          © {site.year} Cognit. {site.tagline}
        </p>
      </div>
    </footer>
  );
}
