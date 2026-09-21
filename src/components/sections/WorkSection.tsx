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

      <div data-scene-text className="space-y-6 border-b border-line md:space-y-10">
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
