"use client";

import { useState } from "react";
import { useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import StackingCards, {
  StackingCardItem,
} from "@/components/ui/stacking-cards";
import { projects, type Project } from "@/data/projects";
import { ProjectModal } from "./ProjectModal";
import { cn } from "@/lib/utils";

export function Projects({ hideHeading = false }: { hideHeading?: boolean }) {
  const reduced = useReducedMotion();
  const [selected, setSelected] = useState<Project | null>(null);

  return (
    <section
      id="work"
      className="relative"
      aria-labelledby={hideHeading ? undefined : "work-heading"}
      aria-label={hideHeading ? "Work that shows results" : undefined}
    >
      {/* Intro moment */}
      {!hideHeading && (
        <div className="relative flex min-h-[62vh] items-center justify-center px-6 py-24 text-center md:min-h-[72vh]">
          <div
            className="glow"
            style={{
              width: "40rem",
              height: "40rem",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              background: "var(--accent)",
              opacity: 0.1,
            }}
            aria-hidden
          />
          <div className="relative max-w-4xl">
            <p className="kicker mb-5">Selected work</p>
            <h2 id="work-heading" className="heading-xl text-text">
              Work that shows <span className="text-warm">results</span>
            </h2>
            <p className="mx-auto mt-7 max-w-xl text-lg leading-relaxed text-muted md:text-xl">
              Real problems, solved end to end. Scroll through a few builds and
              open any one for the full story.
            </p>
          </div>
        </div>
      )}

      {reduced ? (
        /* Reduced-motion: plain stacked list, no scroll scaling */
        <div className="container-main space-y-8 pb-24">
          {projects.map((project, i) => (
            <ProjectCard
              key={project.id}
              project={project}
              index={i}
              onOpen={() => setSelected(project)}
            />
          ))}
        </div>
      ) : (
        /* Scroll-driven stacking cards */
        <StackingCards totalCards={projects.length} className="relative w-full">
          {projects.map((project, i) => (
            <StackingCardItem key={project.id} index={i} className="h-svh">
              <div className="mx-auto flex h-full max-w-6xl items-center px-4 sm:px-6 lg:px-8">
                <ProjectCard
                  project={project}
                  index={i}
                  onOpen={() => setSelected(project)}
                />
              </div>
            </StackingCardItem>
          ))}
        </StackingCards>
      )}

      <ProjectModal project={selected} onClose={() => setSelected(null)} />
    </section>
  );
}

function ProjectCard({
  project,
  index,
  onOpen,
}: {
  project: Project;
  index: number;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group pointer-events-auto relative grid w-full overflow-hidden rounded-[var(--radius-card)] border border-border bg-bg-2 text-left shadow-[0_40px_120px_-50px_rgba(0,0,0,0.9)] transition-colors duration-300 hover:border-accent/40 md:h-[70vh] md:grid-cols-2 lg:h-[72vh]"
    >
      {/* Media */}
      <div className="relative h-56 overflow-hidden sm:h-72 md:h-full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={project.image}
          alt=""
          loading="lazy"
          draggable={false}
          className="h-full w-full object-cover opacity-90 grayscale transition duration-700 ease-out group-hover:scale-105 group-hover:opacity-100 group-hover:grayscale-0"
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-bg-2 via-bg-2/20 to-transparent md:bg-gradient-to-r"
          aria-hidden
        />
        <span
          className="absolute left-5 top-4 font-mono text-sm tracking-[0.2em] text-accent sm:left-7 sm:top-6"
          aria-hidden
        >
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>

      {/* Content */}
      <div className="relative flex flex-col justify-center gap-5 p-6 sm:p-9 lg:p-12">
        <span className="mono-label text-accent">{project.type}</span>
        <h3 className="font-heading text-2xl font-bold leading-[1.05] text-text sm:text-3xl lg:text-4xl">
          {project.name}
        </h3>
        <p className="max-w-md text-base leading-relaxed text-muted sm:text-lg">
          {project.result}
        </p>
        <ul className="flex flex-wrap gap-2">
          {project.tech.map((t) => (
            <li
              key={t}
              className="rounded-full border border-border px-3 py-1 font-mono text-[0.7rem] text-muted"
            >
              {t}
            </li>
          ))}
        </ul>
        <span
          className={cn(
            "mt-1 inline-flex items-center gap-1.5 font-medium text-text",
            "transition-colors group-hover:text-accent"
          )}
        >
          View case
          <ArrowUpRight
            size={18}
            className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </span>
      </div>
    </button>
  );
}
