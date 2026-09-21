"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ProjectCard from "@/components/sections/ProjectCard";
import SectionHeading from "@/components/sections/SectionHeading";
import { ScrollTrigger } from "@/lib/gsap";
import { useRevealOnScroll } from "@/hooks/useRevealOnScroll";
import {
  PROJECTS,
  PROJECT_CATEGORIES,
  type ProjectCategoryId,
} from "@/content/projects";

const ALL_FILTER = "all";
type FilterId = typeof ALL_FILTER | ProjectCategoryId;

export default function WorkSection() {
  const sectionRef = useRef<HTMLElement>(null);
  useRevealOnScroll(sectionRef);
  const [selectedFilter, setSelectedFilter] = useState<FilterId>(ALL_FILTER);

  const categoryById = useMemo(
    () =>
      new Map(PROJECT_CATEGORIES.map((category) => [category.id, category])),
    [],
  );

  const filters = useMemo(
    () => [
      { id: ALL_FILTER as FilterId, label: "전체", count: PROJECTS.length },
      ...PROJECT_CATEGORIES.map((category) => ({
        id: category.id as FilterId,
        label: category.label,
        count: PROJECTS.filter((project) => project.categoryId === category.id)
          .length,
      })),
    ],
    [],
  );

  const visibleProjects =
    selectedFilter === ALL_FILTER
      ? PROJECTS
      : PROJECTS.filter((project) => project.categoryId === selectedFilter);

  // 목록 높이가 바뀌면 아래 섹션의 스크롤 연출 기준점도 달라진다
  useEffect(() => {
    ScrollTrigger.refresh();
  }, [selectedFilter]);

  return (
    <section
      id="work"
      ref={sectionRef}
      className="mx-auto flex min-h-svh max-w-6xl flex-col justify-center px-5 py-24 md:px-10 md:py-32"
    >
      <SectionHeading title="Work" caption="프로젝트" />

      <div data-scene-text>
        <div
          role="group"
          aria-label="프로젝트 분류"
          className="flex flex-wrap items-baseline gap-x-5 gap-y-2"
        >
          {filters.map((filter) => {
            const isSelected = filter.id === selectedFilter;
            return (
              <button
                key={filter.id}
                type="button"
                aria-pressed={isSelected}
                onClick={() => setSelectedFilter(filter.id)}
                className={`text-(length:--text-body) whitespace-nowrap transition-colors duration-(--dur-short) ${
                  isSelected ? "text-link text-fg" : "text-muted hover:text-fg"
                }`}
              >
                {filter.label}
                <span className="label ml-1.5 tabular-nums">
                  {filter.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* 카드 사이 간격은 카드 자신의 위아래 여백으로만 만든다. 여기서 간격을 더하면 마지막 카드와
            아래 구분선 사이만 좁아져 카드마다 높이가 달라 보인다 */}
        <div className="mt-8 border-b border-line">
          {visibleProjects.map((project) => {
            const category = categoryById.get(project.categoryId);
            if (!category) return null;
            return (
              <ProjectCard
                key={project.id}
                project={project}
                category={category}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
