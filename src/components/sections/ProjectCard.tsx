"use client";

import { sceneState } from "@/components/scene/sceneState";
import type { Project } from "@/content/projects";

interface ProjectCardProps {
  project: Project;
  displayIndex: string;
}

export default function ProjectCard({
  project,
  displayIndex,
}: ProjectCardProps) {
  const applyAccent = () => {
    sceneState.accentOverride = project.accentColor;
  };
  const clearAccent = () => {
    sceneState.accentOverride = null;
  };

  return (
    <article
      data-reveal
      onPointerEnter={applyAccent}
      onPointerLeave={clearAccent}
      onFocus={applyAccent}
      onBlur={clearAccent}
      className="group rounded-3xl border border-line bg-surface/70 p-7 backdrop-blur-md transition-colors duration-500 hover:border-(--project-accent) md:p-12"
      style={{ "--project-accent": project.accentColor } as React.CSSProperties}
    >
      <div className="flex items-start justify-between gap-6">
        <p className="font-mono text-xs tracking-[0.2em] text-muted uppercase">
          {displayIndex}
          {project.period ? ` / ${project.period}` : ""}
        </p>
        <span
          aria-hidden="true"
          className="h-3 w-3 rounded-full bg-(--project-accent) transition-transform duration-500 group-hover:scale-150"
        />
      </div>

      <h3 className="mt-6 text-3xl leading-tight font-semibold tracking-tight text-fg md:text-6xl">
        {project.title}
      </h3>

      <p className="mt-6 max-w-3xl text-base leading-relaxed text-muted md:text-lg">
        {project.summary}
      </p>

      {project.highlights && project.highlights.length > 0 && (
        <ul className="mt-6 max-w-3xl list-disc space-y-2 pl-5 text-base leading-relaxed text-muted">
          {project.highlights.map((highlight) => (
            <li key={highlight}>{highlight}</li>
          ))}
        </ul>
      )}

      <div className="mt-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <ul className="flex flex-wrap gap-2">
          {project.techStack.map((technology) => (
            <li
              key={technology}
              className="rounded-full border border-line px-3 py-1 text-sm text-fg"
            >
              {technology}
            </li>
          ))}
        </ul>

        <div className="flex flex-wrap gap-3">
          {project.links.map((projectLink) => (
            <a
              key={projectLink.url}
              href={projectLink.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-fg px-5 py-2.5 text-sm font-medium text-bg transition-colors hover:bg-(--project-accent) hover:text-white"
            >
              {projectLink.label}
              <span aria-hidden="true">↗</span>
            </a>
          ))}
        </div>
      </div>
    </article>
  );
}
