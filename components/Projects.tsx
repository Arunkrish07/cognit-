"use client";

import { useState } from "react";
import { motion, LayoutGroup, useReducedMotion } from "framer-motion";
import {
  projects,
  projectFilters,
  filterProjects,
  type Project,
  type ProjectFilter,
} from "@/data/projects";
import { ProjectModal } from "./ProjectModal";
import { cn } from "@/lib/utils";

export function Projects({ hideHeading = false }: { hideHeading?: boolean }) {
  const reduced = useReducedMotion();
  const [filter, setFilter] = useState<ProjectFilter>("All");
  const [selected, setSelected] = useState<Project | null>(null);
  const filtered = filterProjects(projects, filter);

  return (
    <section
      id="work"
      className="section-padding"
      aria-labelledby={hideHeading ? undefined : "work-heading"}
      aria-label={hideHeading ? "Work" : undefined}
    >
      <div className="container-main">
        {!hideHeading && (
          <motion.h2
            id="work-heading"
            className="heading-lg text-text"
            initial={reduced ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Work that shows results
          </motion.h2>
        )}

        <div className="relative mt-2 flex flex-wrap gap-2">
          {projectFilters.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={cn(
                "relative rounded-full px-4 py-2 text-sm font-medium transition-colors",
                filter === f ? "text-text" : "text-muted hover:text-text"
              )}
            >
              {filter === f && (
                <motion.span
                  layoutId="filter-pill"
                  className="absolute inset-0 rounded-full border border-border bg-surface-2"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">{f}</span>
            </button>
          ))}
        </div>

        <LayoutGroup>
          <motion.ul
            layout
            className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {filtered.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onOpen={() => setSelected(project)}
              />
            ))}
          </motion.ul>
        </LayoutGroup>
      </div>

      <ProjectModal project={selected} onClose={() => setSelected(null)} />
    </section>
  );
}

function ProjectCard({
  project,
  onOpen,
}: {
  project: Project;
  onOpen: () => void;
}) {
  const isPhone =
    project.type === "Mobile app" || project.type === "WhatsApp automation";

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.35 }}
    >
      <button
        type="button"
        onClick={onOpen}
        className="group w-full rounded-2xl border border-border bg-surface p-5 text-left transition-[transform,border-color,box-shadow] duration-200 md:hover:-translate-y-1 md:hover:border-accent/40 md:hover:shadow-[0_18px_50px_-24px_rgba(0,0,0,0.55)]"
      >
        <div
          className={cn(
            "relative mx-auto mb-4 overflow-hidden rounded-xl bg-surface-2",
            isPhone ? "h-48 w-32" : "h-40 w-full"
          )}
        >
          {/* Placeholder cover imagery — replace with real screenshots */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={project.image}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover opacity-85 grayscale transition duration-300 group-hover:opacity-100 group-hover:grayscale-0"
          />
        </div>

        <span className="mono-label text-accent">{project.type}</span>
        <h3 className="mt-2 font-heading text-lg font-bold text-text">
          {project.name}
        </h3>
        <p className="mt-2 text-sm text-muted">{project.result}</p>

        <div className="mt-4 max-h-0 overflow-hidden opacity-0 transition-all duration-300 group-hover:max-h-40 group-hover:opacity-100 md:group-hover:max-h-40">
          <p className="text-sm text-muted">
            <span className="font-medium text-text">Problem:</span>{" "}
            {project.problem}
          </p>
          <p className="mt-2 text-sm text-muted">
            <span className="font-medium text-text">Solution:</span>{" "}
            {project.solution}
          </p>
        </div>
      </button>
    </motion.li>
  );
}
