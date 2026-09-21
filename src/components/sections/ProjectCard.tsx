"use client";

import ExternalLink from "@/components/layout/ExternalLink";
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
      className="group border-t border-line py-8 md:grid md:grid-cols-[9rem_1fr] md:gap-8 md:py-10"
      style={{ "--project-accent": project.accentColor } as React.CSSProperties}
    >
      {/* 왼쪽 열은 기간처럼 데이터로 읽히는 정보다. 제목과 같은 줄에서 시작한다 */}
      <p className="font-mono text-(length:--text-label) text-muted tabular-nums md:pt-3">
        {project.period ?? displayIndex}
      </p>

      <div>
        <h3 className="text-3xl leading-tight font-semibold tracking-tight text-fg transition-colors duration-(--dur-short) group-hover:text-(--project-accent) md:text-[2.75rem]">
          {project.title}
        </h3>

        <p className="mt-5 max-w-(--measure) text-(length:--text-body) leading-relaxed text-muted md:text-lg">
          {project.summary}
        </p>

        {project.highlights && project.highlights.length > 0 && (
          <ul className="mt-5 max-w-(--measure) list-disc space-y-2 pl-5 text-(length:--text-body) leading-relaxed text-muted">
            {project.highlights.map((highlight) => (
              <li key={highlight}>{highlight}</li>
            ))}
          </ul>
        )}

        <div className="mt-8 flex flex-col gap-5 md:flex-row md:items-baseline md:justify-between">
          <ul className="flex flex-wrap gap-x-4 gap-y-1">
            {project.techStack.map((technology) => (
              <li key={technology} className="text-[0.9375rem] text-fg">
                {technology}
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {project.links.map((projectLink) => (
              <ExternalLink
                key={projectLink.url}
                href={projectLink.url}
                label={projectLink.label}
                className="text-link text-base font-medium whitespace-nowrap text-fg"
              />
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}
