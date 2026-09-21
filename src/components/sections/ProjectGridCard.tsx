"use client";

import Link from "next/link";
import { sceneState } from "@/components/scene/sceneState";
import type { Project, ProjectCategory } from "@/content/projects";

interface ProjectGridCardProps {
  project: Project;
  category: ProjectCategory;
  detailHref?: string;
}

export default function ProjectGridCard({
  project,
  category,
  detailHref,
}: ProjectGridCardProps) {
  const applyAccent = () => {
    sceneState.accentOverride = category.accentColor;
  };
  const clearAccent = () => {
    sceneState.accentOverride = null;
  };

  return (
    <article
      onPointerEnter={applyAccent}
      onPointerLeave={clearAccent}
      onFocus={applyAccent}
      onBlur={clearAccent}
      className="group flex h-full flex-col border-t border-line pt-5"
      style={
        { "--project-accent": category.accentColor } as React.CSSProperties
      }
    >
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <p className="label tabular-nums">{project.period}</p>
        <p className="label text-(--project-accent)">{category.label}</p>
      </div>

      <h3 className="mt-3 text-lg leading-snug font-semibold tracking-tight text-fg transition-colors duration-(--dur-short) group-hover:text-(--project-accent)">
        {detailHref ? (
          <Link
            href={detailHref}
            className="inline-flex items-baseline gap-1.5"
          >
            {project.title}
            <span
              aria-hidden="true"
              className="text-sm transition-transform duration-(--dur-short) group-hover:translate-x-1"
            >
              →
            </span>
          </Link>
        ) : (
          project.title
        )}
      </h3>
      <p className="label mt-1">{project.role}</p>

      {/* 칸마다 높이가 들쭉날쭉하지 않게 요약은 세 줄에서 자른다 */}
      <p className="mt-3 line-clamp-3 text-(length:--text-label) leading-relaxed text-muted">
        {project.summary}
      </p>

      <ul className="mt-auto flex flex-wrap gap-x-3 gap-y-1 pt-4">
        {project.techStack.slice(0, 3).map((technology) => (
          <li key={technology} className="text-(length:--text-label) text-fg">
            {technology}
          </li>
        ))}
      </ul>
    </article>
  );
}
