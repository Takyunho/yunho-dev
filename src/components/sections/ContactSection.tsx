"use client";

import { useRef } from "react";
import ExternalLink from "@/components/layout/ExternalLink";
import { useRevealOnScroll } from "@/hooks/useRevealOnScroll";
import { PROFILE } from "@/content/profile";

const CURRENT_YEAR = new Date().getFullYear();

export default function ContactSection() {
  const sectionRef = useRef<HTMLElement>(null);
  useRevealOnScroll(sectionRef);

  return (
    // 뷰포트보다 짧으면 sectionProgress가 마지막 값에 닿지 못해 마무리 연출이 나오지 않는다
    <section
      id="contact"
      ref={sectionRef}
      className="flex min-h-svh flex-col justify-between px-5 pt-32 pb-8 md:px-10"
    >
      <div>
        <h2
          data-reveal
          className="display text-[clamp(3.75rem,13vw,12rem)] leading-[0.92] text-fg"
        >
          Let&apos;s talk
        </h2>

        <div data-reveal className="mt-10 flex flex-col items-start gap-3">
          <a
            href={`mailto:${PROFILE.email}`}
            className="text-link text-2xl font-medium tracking-tight text-fg md:text-4xl"
          >
            {PROFILE.email}
          </a>
          <ExternalLink
            href={PROFILE.githubUrl}
            label="github.com/Takyunho"
            className="text-link text-base text-muted md:text-lg"
          />
        </div>
      </div>

      {/* 웅덩이 위에 놓이므로 반투명 띠를 깔아 읽히게 한다 */}
      <footer className="label flex flex-col gap-1 border-t border-line bg-(--header-shade) px-1 pt-3 md:flex-row md:justify-between">
        <p>
          © {CURRENT_YEAR} {PROFILE.nameEnglish}
        </p>
        <p>Built with Next.js, React Three Fiber</p>
      </footer>
    </section>
  );
}
