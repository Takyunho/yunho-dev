"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { PROFILE } from "@/content/profile";

const TITLE_LINES = ["Frontend", "Engineer"];

export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const sectionElement = sectionRef.current;
    if (reducedMotion || !sectionElement) return;

    const gsapContext = gsap.context(() => {
      gsap.to(".line-mask > span", {
        y: 0,
        duration: 1.2,
        ease: "power4.out",
        stagger: 0.12,
        delay: 0.3,
      });
      gsap.from("[data-hero-fade]", {
        autoAlpha: 0,
        duration: 0.6,
        ease: "power3.out",
        stagger: 0.1,
        delay: 0.9,
      });
    }, sectionElement);

    return () => gsapContext.revert();
  }, [reducedMotion]);

  return (
    <section
      id="hero"
      ref={sectionRef}
      className="flex min-h-svh flex-col justify-end px-5 pt-28 pb-10 md:px-10 md:pb-14"
    >
      <div className="relative flex flex-col gap-8 before:absolute before:-inset-x-[8%] before:-inset-y-[18%] before:-z-10 before:rounded-[50%] before:bg-[radial-gradient(ellipse_at_50%_60%,var(--title-shade),transparent_72%)] before:content-[''] md:flex-row md:items-end md:justify-between">
        <h1 className="display text-[clamp(3.75rem,13vw,12rem)] leading-[0.92] text-fg">
          {TITLE_LINES.map((titleLine) => (
            <span key={titleLine} className="line-mask">
              <span>{titleLine}</span>
            </span>
          ))}
        </h1>

        <div className="max-w-xs md:pb-3 md:text-right">
          <p data-hero-fade className="label">
            {PROFILE.nameKorean} · {PROFILE.nameEnglish}
          </p>
          <p
            data-hero-fade
            className="mt-3 text-lg leading-snug font-medium text-fg md:text-xl"
          >
            {PROFILE.tagline}
          </p>
          <p data-hero-fade className="mt-6">
            <a href="#work" className="text-link text-base text-fg">
              프로젝트 보기 ↓
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
