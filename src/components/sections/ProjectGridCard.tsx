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
          <Link href={detailHref} className="hover:underline">
            {project.title}
          </Link>
        ) : (
          project.title
        )}
      </h3>
      <p className="label mt-1">{project.role}</p>

      {/* 칸 안의 다른 글자가 모두 라벨 크기라 설명만 한 단계 키워 먼저 읽히게 한다.
          칸마다 높이가 들쭉날쭉하지 않게 세 줄에서 자른다 */}
      <p className="mt-3 line-clamp-3 text-[0.9375rem] leading-relaxed text-muted">
        {project.summary}
      </p>

      <div className="mt-auto flex items-end justify-between gap-4 pt-4">
        <ul className="flex flex-wrap gap-x-3 gap-y-1">
          {project.techStack.slice(0, 3).map((technology) => (
            <li key={technology} className="text-(length:--text-label) text-fg">
              {technology}
            </li>
          ))}
        </ul>

        {/* 상세로 들어가는 자리다. 칸 오른쪽 끝에 두어 카드마다 같은 위치에서 찾을 수 있게 한다 */}
        {detailHref && (
          <Link
            href={detailHref}
            aria-label={`${project.title} 자세히 보기`}
            className="flex size-9 shrink-0 items-center justify-center rounded-full border border-line text-fg transition-colors duration-(--dur-short) group-hover:border-(--project-accent) group-hover:text-(--project-accent)"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        )}
      </div>
    </article>
  );
}
