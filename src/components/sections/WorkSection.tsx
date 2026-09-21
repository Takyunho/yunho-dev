"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import ProjectCard from "@/components/sections/ProjectCard";
import ProjectGridCard from "@/components/sections/ProjectGridCard";
import SectionHeading from "@/components/sections/SectionHeading";
import { ScrollTrigger } from "@/lib/gsap";
import { PROJECT_DETAILS } from "@/content/projectDetails";
import { useRevealOnScroll } from "@/hooks/useRevealOnScroll";
import {
  PROJECTS,
  PROJECT_CATEGORIES,
  type Project,
  type ProjectCategoryId,
} from "@/content/projects";

const ALL_FILTER = "all";
type FilterId = typeof ALL_FILTER | ProjectCategoryId;

type ViewMode = "list" | "grid";

// 한 면에 담는 개수. 리스트는 한 줄이 길어서 적게, 그리드는 3×3으로 들어간다
const PROJECTS_PER_PAGE: Record<ViewMode, number> = { list: 4, grid: 9 };

const VIEW_MODES: { id: ViewMode; label: string }[] = [
  { id: "list", label: "리스트" },
  { id: "grid", label: "그리드" },
];

function detailHrefOf(project: Project): string | undefined {
  return PROJECT_DETAILS[project.id] ? `/work/${project.id}` : undefined;
}

export default function WorkSection() {
  const sectionRef = useRef<HTMLElement>(null);
  useRevealOnScroll(sectionRef);
  const [selectedFilter, setSelectedFilter] = useState<FilterId>(ALL_FILTER);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [pageIndex, setPageIndex] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [reservedListHeight, setReservedListHeight] = useState(0);

  // 세로 스크롤을 막지 않으면서 좌우로만 끌리게 한다
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
  });

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

  const pages = useMemo(() => {
    const visibleProjects =
      selectedFilter === ALL_FILTER
        ? PROJECTS
        : PROJECTS.filter((project) => project.categoryId === selectedFilter);
    const pageSize = PROJECTS_PER_PAGE[viewMode];
    const grouped: Project[][] = [];
    for (
      let startIndex = 0;
      startIndex < visibleProjects.length;
      startIndex += pageSize
    ) {
      grouped.push(visibleProjects.slice(startIndex, startIndex + pageSize));
    }
    return grouped;
  }, [selectedFilter, viewMode]);

  useEffect(() => {
    if (!emblaApi) return;
    const syncPosition = () => {
      setPageIndex(emblaApi.selectedScrollSnap());
      setPageCount(emblaApi.scrollSnapList().length);
    };
    syncPosition();
    emblaApi.on("select", syncPosition).on("reInit", syncPosition);
    return () => {
      emblaApi.off("select", syncPosition).off("reInit", syncPosition);
    };
  }, [emblaApi]);

  // 분류나 보기 방식이 바뀌면 면의 수와 높이가 달라진다. 첫 면으로 되돌리고 스크롤 연출 기준점도 다시 잡는다
  useEffect(() => {
    if (emblaApi) {
      emblaApi.reInit();
      emblaApi.scrollTo(0, true);
    }
    ScrollTrigger.refresh();
  }, [emblaApi, selectedFilter, viewMode]);

  // 분류를 좁히면 목록이 짧아지고, 그만큼 문서 전체가 줄어 보던 자리가 위로 밀린다.
  // 그래서 지금까지 나온 가장 높은 면만큼 자리를 계속 비워 둔다. 자리가 줄지 않으니 화면도 움직이지 않는다
  const reserveTallestPage = useCallback(() => {
    if (!emblaApi) return;
    const pageHeight = emblaApi.containerNode().offsetHeight;
    setReservedListHeight((reserved) => Math.max(reserved, pageHeight));
  }, [emblaApi]);

  useEffect(reserveTallestPage, [reserveTallestPage, pages]);

  // 폭이 달라지면 카드가 접히는 줄 수가 바뀌어 재 둔 높이가 맞지 않는다. 비워 두었던 자리를 걷고 다시 잰다
  useEffect(() => {
    const remeasure = () => {
      setReservedListHeight(0);
      window.setTimeout(reserveTallestPage, 0);
    };
    window.addEventListener("resize", remeasure);
    return () => window.removeEventListener("resize", remeasure);
  }, [reserveTallestPage]);

  const scrollPrevious = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  return (
    <section
      id="work"
      ref={sectionRef}
      className="mx-auto flex min-h-svh max-w-6xl flex-col justify-center px-5 py-24 md:px-10 md:py-32"
    >
      <SectionHeading title="Work" caption="프로젝트" />

      <div data-scene-text>
        <div className="flex flex-col gap-4 md:flex-row md:items-baseline md:justify-between">
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
                  // 마우스를 올렸을 때만 글자와 숫자에 밑줄이 한 줄로 이어져 붙는다
                  className={`text-(length:--text-body) whitespace-nowrap decoration-1 underline-offset-[0.3em] transition-colors duration-(--dur-short) hover:underline ${
                    isSelected
                      ? "font-semibold text-fg"
                      : "text-muted hover:text-fg"
                  }`}
                >
                  {filter.label}{" "}
                  <span className="label tabular-nums">{filter.count}</span>
                </button>
              );
            })}
          </div>

          {/* 고르는 값이 둘뿐이라 세그먼트 컨트롤로 둔다. 무엇을 고를 수 있는지가 한눈에 보인다.
              label 클래스는 색을 직접 정하므로 여기서는 크기와 색 유틸리티를 따로 쓴다 */}
          <div
            role="group"
            aria-label="보기 방식"
            className="flex shrink-0 items-center self-start rounded-full border border-line p-0.5 md:self-auto"
          >
            {VIEW_MODES.map((mode) => {
              const isSelected = mode.id === viewMode;
              return (
                <button
                  key={mode.id}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => setViewMode(mode.id)}
                  className={`rounded-full px-3 py-1 text-(length:--text-label) whitespace-nowrap transition-colors duration-(--dur-short) ${
                    isSelected
                      ? "bg-surface font-medium text-fg"
                      : "text-muted hover:text-fg"
                  }`}
                >
                  {mode.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 면이 하나뿐이면 넘길 곳이 없어 감추지만 자리는 남긴다. 사라졌다 나타나면 그만큼 목록이 위아래로 뛴다 */}
        <div
          aria-hidden={pageCount <= 1}
          className={`mt-6 flex items-center justify-end gap-4 ${
            pageCount > 1 ? "" : "invisible"
          }`}
        >
          <p className="label tabular-nums">
            {pageIndex + 1} / {pageCount}
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="이전 프로젝트 보기"
              onClick={scrollPrevious}
              disabled={pageIndex === 0}
              className="flex size-9 items-center justify-center rounded-full border border-line text-fg transition-colors duration-(--dur-short) hover:border-accent hover:text-accent disabled:pointer-events-none disabled:opacity-35"
            >
              <span aria-hidden="true">←</span>
            </button>
            <button
              type="button"
              aria-label="다음 프로젝트 보기"
              onClick={scrollNext}
              disabled={pageIndex === pageCount - 1}
              className="flex size-9 items-center justify-center rounded-full border border-line text-fg transition-colors duration-(--dur-short) hover:border-accent hover:text-accent disabled:pointer-events-none disabled:opacity-35"
            >
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>

        {/* 끌어서 넘기는 영역이다. 면 하나에 보기 방식별 개수만큼 들어간다 */}
        <div
          className="mt-4 overflow-hidden"
          ref={emblaRef}
          style={
            reservedListHeight ? { minHeight: reservedListHeight } : undefined
          }
        >
          <div className="flex">
            {pages.map((pageProjects, currentPageIndex) => (
              <div
                key={currentPageIndex}
                aria-label={`${currentPageIndex + 1} / ${pages.length} 페이지`}
                className={`min-w-0 shrink-0 grow-0 basis-full border-b border-line ${
                  viewMode === "grid"
                    ? "grid grid-cols-1 gap-x-8 gap-y-6 pb-8 sm:grid-cols-2 lg:grid-cols-3"
                    : ""
                }`}
              >
                {pageProjects.map((project) => {
                  const category = categoryById.get(project.categoryId);
                  if (!category) return null;
                  return viewMode === "grid" ? (
                    <ProjectGridCard
                      key={project.id}
                      project={project}
                      category={category}
                      detailHref={detailHrefOf(project)}
                    />
                  ) : (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      category={category}
                      detailHref={detailHrefOf(project)}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
