"use client";

import dynamic from "next/dynamic";

const HeroSection = dynamic(
  () => import("@/components/sections/HeroSection"),
  { ssr: false }
);

const AboutSection = dynamic(
  () => import("@/components/sections/AboutSection"),
  { ssr: false }
);

const SkillsSection = dynamic(
  () => import("@/components/sections/SkillsSection"),
  { ssr: false }
);

const ProjectsSection = dynamic(
  () => import("@/components/sections/ProjectsSection"),
  { ssr: false }
);

export default function HeroLoader() {
  return (
    <>
      <HeroSection />
      <AboutSection />
      <SkillsSection />
      <ProjectsSection />
    </>
  );
}
