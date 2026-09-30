"use client";

import { useRef } from "react";
import SectionHeading from "@/components/sections/SectionHeading";
import { useRevealOnScroll } from "@/hooks/useRevealOnScroll";
import { SIDE_PROJECTS } from "@/content/sideProjects";

export default function SideProjectsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  useRevealOnScroll(sectionRef);

  return (
    <section
      id="side-projects"
      ref={sectionRef}
      className="mx-auto flex min-h-svh max-w-6xl flex-col justify-center px-5 py-24 md:px-10 md:py-32"
    >
      <SectionHeading title="Side Projects" caption="개인 프로젝트" />

      <ul data-scene-text className="border-b border-line">
        {SIDE_PROJECTS.map((sideProject) => (
          <li key={sideProject.name} data-reveal className="border-t border-line">
            {/* 다섯 칸 배치는 설명 칸이 넉넉한 1024px부터 쓴다. 768px에서는 설명 칸이 65px 남짓이라
                "프로토타입입니다."처럼 줄을 바꿀 수 없는 낱말이 칸을 밀어 화면 밖으로 넘친다 */}
            <a
              href={sideProject.url}
              target="_blank"
              rel="noreferrer"
              className="group grid grid-cols-[1fr_auto] items-baseline gap-x-6 gap-y-1 py-6 transition-colors lg:grid-cols-[18rem_1fr_8rem_4rem_2rem]"
            >
              <span className="text-xl font-medium tracking-tight text-fg transition-colors group-hover:text-accent md:text-2xl">
                {sideProject.name}
              </span>
              <span className="order-3 col-span-2 text-base leading-relaxed text-muted lg:order-none lg:col-span-1">
                {sideProject.description}
              </span>
              <span className="hidden font-mono text-(length:--text-label) text-muted lg:block">
                {sideProject.language}
              </span>
              <span className="font-mono text-(length:--text-label) text-muted tabular-nums lg:text-right">
                {sideProject.year}
              </span>
              <span
                aria-hidden="true"
                className="hidden text-right text-muted transition-transform group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-accent lg:block"
              >
                ↗
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
