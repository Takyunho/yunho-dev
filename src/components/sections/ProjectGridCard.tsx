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
    sceneState.accentOverride = project.accentColor;
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
      style={{ "--project-accent": project.accentColor } as React.CSSProperties}
    >
      {/* 기간은 숫자라 모노로, 분류는 다섯 값 중 하나라 테두리를 둘러 서로 다른 것으로 읽히게 한다.
          강조색은 프로젝트마다 다르므로 분류에는 쓰지 않는다 */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <p className="label font-mono tabular-nums">{project.period}</p>
        <p className="label rounded-full border border-line bg-surface px-2 py-1 whitespace-nowrap">
          {category.label}
        </p>
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
          줄 수를 맞춰 자르면 칸마다 길이가 달랐던 흔적이 지워져 한 틀로 찍어낸 것처럼 보인다.
          아래쪽 스택은 mt-auto로 붙어 있어 길이가 달라도 칸 밑은 가지런하다 */}
      <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted">
        {project.summary}
      </p>

      <div className="mt-auto flex items-end justify-between gap-4 pt-4">
        {/* 기술명은 고유명사라 모노로 적어 본문과 다른 목소리를 준다. 분류 칩과 겹치지 않도록 테두리는 두르지 않는다 */}
        <ul className="flex flex-wrap gap-x-3 gap-y-1">
          {project.techStack.slice(0, 3).map((technology) => (
            <li
              key={technology}
              className="font-mono text-(length:--text-label) text-muted"
            >
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
