"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink } from "lucide-react";
import type { Project } from "@/data/projects";

type ProjectModalProps = {
  project: Project | null;
  onClose: () => void;
};

export function ProjectModal({ project, onClose }: ProjectModalProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (project) {
      previousFocus.current = document.activeElement as HTMLElement;
      closeRef.current?.focus();
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      previousFocus.current?.focus();
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [project]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (project) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [project, onClose]);

  return (
    <AnimatePresence>
      {project && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-end justify-center p-4 sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <motion.button
            type="button"
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            aria-label="Close modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            className="relative max-h-[90dvh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-surface p-6 sm:p-8"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface-2"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            <div className="mb-6 h-48 overflow-hidden rounded-xl bg-surface-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={project.image}
                alt={`${project.name} preview`}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </div>

            <span className="mono-label text-accent">{project.type}</span>
            <h2 id="modal-title" className="mt-1 font-heading text-2xl font-bold text-text">
              {project.name}
            </h2>

            <div className="mt-6 space-y-4 text-muted">
              <div>
                <h3 className="font-medium text-text">Problem</h3>
                <p className="mt-1">{project.problem}</p>
              </div>
              <div>
                <h3 className="font-medium text-text">Solution</h3>
                <p className="mt-1">{project.solution}</p>
              </div>
              <div>
                <h3 className="font-medium text-text">Result</h3>
                <p className="mt-1">{project.result}</p>
              </div>
            </div>

            <ul className="mt-6 flex flex-wrap gap-2">
              {project.tech.map((t) => (
                <li
                  key={t}
                  className="rounded-full border border-border px-3 py-1 font-mono text-[0.7rem] text-muted"
                >
                  {t}
                </li>
              ))}
            </ul>

            {project.link && (
              <a
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary mt-6 inline-flex"
              >
                View live <ExternalLink size={16} />
              </a>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
