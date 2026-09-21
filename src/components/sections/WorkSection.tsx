"use client";

import { useRef } from "react";
import ProjectCard from "@/components/sections/ProjectCard";
import SectionHeading from "@/components/sections/SectionHeading";
import { useRevealOnScroll } from "@/hooks/useRevealOnScroll";
import { PROJECTS } from "@/content/projects";

export default function WorkSection() {
  const sectionRef = useRef<HTMLElement>(null);
  useRevealOnScroll(sectionRef);

  return (
    <section
      id="work"
      ref={sectionRef}
      className="mx-auto flex min-h-svh max-w-6xl flex-col justify-center px-5 py-24 md:px-10 md:py-32"
    >
      <SectionHeading title="Work" caption="프로젝트" />

      {/* 카드 사이 간격은 카드 자신의 위아래 여백으로만 만든다. 여기서 간격을 더하면 마지막 카드와
          아래 구분선 사이만 좁아져 카드마다 높이가 달라 보인다 */}
      <div data-scene-text className="border-b border-line">
        {PROJECTS.map((project, projectIndex) => (
          <ProjectCard
            key={project.id}
            project={project}
            displayIndex={String(projectIndex + 1).padStart(2, "0")}
          />
        ))}
      </div>
    </section>
  );
}
