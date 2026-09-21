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
    // 3D 부품도 바탕에 맞는 밝기라야 배경에 묻히지 않는다. next-themes가 써 둔 값을 그대로 읽는다
    const isDarkTheme = document.documentElement.dataset.theme === "dark";
    sceneState.accentOverride = isDarkTheme
      ? project.accentColor.dark
      : project.accentColor.light;
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
      data-project-accent
      className="group grid grid-cols-1 gap-x-8 gap-y-3 border-t border-line py-7 md:grid-cols-[16rem_1fr_auto] md:py-8"
      style={
        {
          "--project-accent-light": project.accentColor.light,
          "--project-accent-dark": project.accentColor.dark,
        } as React.CSSProperties
      }
    >
      {/* 왼쪽 열은 언제 무엇으로 했는지다. 오른쪽 본문과 같은 줄에서 시작한다.
          기간은 숫자라 모노로, 분류는 다섯 값 중 하나라 테두리를 둘러 서로 다른 것으로 읽히게 한다.
          강조색은 프로젝트마다 다르므로 분류에는 쓰지 않는다 */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 md:block">
        <p className="label font-mono tabular-nums">{project.period}</p>
        <p className="label w-fit rounded-full border border-line bg-surface px-2 py-1 whitespace-nowrap md:mt-2">
          {category.label}
        </p>
      </div>

      <div>
        <h3 className={titleClassName}>
          {detailHref ? (
            <Link href={detailHref} className="hover:underline">
              {project.title}
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
          {/* 기술명은 고유명사라 모노로 적어 본문과 다른 목소리를 준다. 분류 칩과 겹치지 않도록 테두리는 두르지 않는다 */}
          <ul className="flex flex-wrap gap-x-3 gap-y-1">
            {project.techStack.map((technology) => (
              <li
                key={technology}
                className="font-mono text-(length:--text-label) text-muted"
              >
                {technology}
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
            {project.links.map((projectLink) => (
              <ExternalLink
                key={projectLink.url}
                href={projectLink.url}
                label={projectLink.label}
                className="text-link text-(length:--text-label) font-medium whitespace-nowrap text-fg"
              />
            ))}
          </div>
        </div>
      </div>

      {/* 상세로 들어가는 자리다. 카드 어느 곳을 가리켜도 보이도록 오른쪽 끝에 따로 둔다 */}
      {detailHref && (
        <Link
          href={detailHref}
          aria-label={`${project.title} 자세히 보기`}
          className="flex size-10 shrink-0 items-center justify-center justify-self-end rounded-full border border-line text-fg transition-colors duration-(--dur-short) group-hover:border-(--project-accent) group-hover:text-(--project-accent) md:self-center"
        >
          <svg
            width="18"
            height="18"
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
    </article>
  );
}
