"use client";

import { useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { PROJECTS } from "@/lib/constants";
import ProjectModal from "@/components/ui/ProjectModal";
import styles from "@/styles/sections.module.css";
import projectStyles from "@/styles/projects.module.css";

const ProjectGallery3D = dynamic(
  () => import("@/components/three/ProjectGallery3D"),
  { ssr: false }
);

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.15,
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
    },
  }),
};

export default function ProjectsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);

  const activeProject = PROJECTS[activeIndex];

  const handleProjectClick = useCallback((index: number) => {
    setActiveIndex(index);
    setModalOpen(true);
  }, []);

  const handleClose = useCallback(() => setModalOpen(false), []);

  return (
    <>
      <section
        ref={sectionRef}
        id="projects"
        className="relative min-h-screen bg-bg"
      >
        {/* Section divider */}
        <div className="px-6 md:px-16 lg:px-24">
          <div className={styles.sectionDivider} />
        </div>

        {/* Header overlay — 3D 캔버스 위에 표시 */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 px-6 pt-24 md:px-16 lg:px-24">
          <div className="mx-auto max-w-6xl">
            {/* Section label */}
            <motion.div
              className={styles.sectionLabel}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              custom={0}
            >
              <span className="font-mono text-xs tracking-[0.2em] text-primary">
                03
              </span>
              <span className="font-mono text-xs tracking-[0.2em] uppercase text-text-muted">
                Projects
              </span>
            </motion.div>

            <motion.h2
              className="mt-8 text-3xl font-bold text-text md:text-4xl"
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              custom={1}
            >
              프로젝트 <span className="text-primary">갤러리</span>
            </motion.h2>
          </div>
        </div>

        {/* 3D Gallery */}
        <ProjectGallery3D
          projects={PROJECTS}
          activeIndex={activeIndex}
          setActiveIndex={setActiveIndex}
          onProjectClick={handleProjectClick}
          sectionRef={sectionRef}
        />

        {/* Bottom overlay — 활성 프로젝트 정보 + 네비게이션 */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 px-6 pb-6 md:px-16 lg:px-24">
          <div className="mx-auto max-w-6xl">
            {/* Tech stack tags */}
            <div className="flex flex-wrap gap-2">
              {activeProject.techStack.map((tech) => (
                <span
                  key={tech}
                  className={`${projectStyles.techTag} rounded-md border border-grid bg-bg/60 px-3 py-1 font-mono text-[10px] text-text-muted backdrop-blur-sm`}
                >
                  {tech}
                </span>
              ))}
            </div>

            {/* Navigation dots + progress */}
            <div className="mt-6 flex items-center gap-6">
              {/* Dots */}
              <div className="pointer-events-auto flex gap-2">
                {PROJECTS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveIndex(i)}
                    className={`${projectStyles.navDot} ${
                      i === activeIndex ? projectStyles.navDotActive : ""
                    } h-2 w-2 rounded-full transition-all ${
                      i === activeIndex
                        ? "scale-125 bg-primary"
                        : "bg-text-muted/30 hover:bg-text-muted/50"
                    }`}
                  />
                ))}
              </div>

              {/* Progress bar */}
              <div
                className={`${projectStyles.progressTrack} h-[2px] flex-1 rounded-full bg-grid/30`}
                style={
                  {
                    "--progress": `${((activeIndex + 1) / PROJECTS.length) * 100}%`,
                  } as React.CSSProperties
                }
              />

              {/* Counter */}
              <span className="font-mono text-xs text-text-muted">
                <span className="text-primary">{`0${activeIndex + 1}`}</span>
                {` / 0${PROJECTS.length}`}
              </span>

              {/* Click hint */}
              <span className="pointer-events-auto hidden font-mono text-[10px] text-text-muted/50 md:block">
                Click card to view details
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Project detail modal */}
      <ProjectModal
        project={activeProject}
        isOpen={modalOpen}
        onClose={handleClose}
      />
    </>
  );
}