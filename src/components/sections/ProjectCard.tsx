"use client";

import Link from "next/link";
import ExternalLink from "@/components/layout/ExternalLink";
import { sceneState } from "@/components/scene/sceneState";
import type { Project, ProjectCategory } from "@/content/projects";

interface ProjectCardProps {
  project: Project;
  category: ProjectCategory;
  // 상세를 쓴 프로젝트만 값이 있다. 없으면 제목이 링크가 되지 않는다
  detailHref?: string;
}

export default function ProjectCard({
  project,
  category,
  detailHref,
}: ProjectCardProps) {
  const titleClassName =
    "text-xl leading-snug font-semibold tracking-tight text-fg transition-colors duration-(--dur-short) group-hover:text-(--project-accent) md:text-2xl";
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
      className="group grid grid-cols-1 gap-x-8 gap-y-3 border-t border-line py-7 md:grid-cols-[16rem_1fr] md:py-8"
      style={
        { "--project-accent": category.accentColor } as React.CSSProperties
      }
    >
      {/* 왼쪽 열은 언제 무엇으로 했는지다. 오른쪽 본문과 같은 줄에서 시작한다 */}
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 md:block">
        <p className="label tabular-nums">{project.period}</p>
        <p className="label mt-0 text-(--project-accent) md:mt-1">
          {category.label}
        </p>
      </div>

      <div>
        <h3 className={titleClassName}>
          {detailHref ? (
            <Link href={detailHref} className="inline-flex items-baseline gap-2">
              {project.title}
              <span
                aria-hidden="true"
                className="text-base transition-transform duration-(--dur-short) group-hover:translate-x-1"
              >
                →
              </span>
            </Link>
          ) : (
            project.title
          )}
        </h3>
        <p className="label mt-1">{project.role}</p>

        <p className="mt-3 max-w-(--measure) text-(length:--text-body) leading-relaxed text-muted">
          {project.summary}
        </p>

        <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-baseline md:justify-between md:gap-8">
          <ul className="flex flex-wrap gap-x-3 gap-y-1">
            {project.techStack.map((technology) => (
              <li
                key={technology}
                className="text-(length:--text-label) text-fg"
              >
                {technology}
              </li>
            ))}
          </ul>

          {project.links.length > 0 && (
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              {project.links.map((projectLink) => (
                <ExternalLink
                  key={projectLink.url}
                  href={projectLink.url}
                  label={projectLink.label}
                  className="text-link text-(length:--text-label) font-medium whitespace-nowrap text-fg"
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
