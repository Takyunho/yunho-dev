"use client";

import { useRef } from "react";
import WaveText from "@/components/sections/WaveText";
import { useRevealOnScroll } from "@/hooks/useRevealOnScroll";
import { useWaveText } from "@/hooks/useWaveText";
import { PROFILE } from "@/content/profile";

const CURRENT_YEAR = new Date().getFullYear();

export default function ContactSection() {
  const sectionRef = useRef<HTMLElement>(null);
  useRevealOnScroll(sectionRef);
  useWaveText(sectionRef);

  return (
    // 뷰포트보다 짧으면 sectionProgress가 마지막 값에 닿지 못해 마무리 연출이 나오지 않는다
    <section
      id="contact"
      ref={sectionRef}
      className="flex min-h-svh flex-col justify-between px-5 pt-32 pb-8 md:px-10"
    >
      <div>
        <p
          data-reveal
          className="font-mono text-xs tracking-[0.2em] text-muted uppercase"
        >
          05 / 연락처
        </p>
        <h2
          data-reveal
          className="mt-3 text-[clamp(3.5rem,12vw,11rem)] leading-[0.9] font-semibold tracking-tighter text-fg"
        >
          <WaveText text="Let's talk" />
        </h2>

        <div data-reveal className="mt-10 flex flex-col items-start gap-3">
          <a
            href={`mailto:${PROFILE.email}`}
            className="text-2xl font-medium tracking-tight text-fg underline decoration-line decoration-1 underline-offset-8 transition-colors hover:text-accent hover:decoration-accent md:text-4xl"
          >
            <WaveText text={PROFILE.email} />
          </a>
          <a
            href={PROFILE.githubUrl}
            target="_blank"
            rel="noreferrer"
            className="text-base text-muted transition-colors hover:text-accent md:text-lg"
          >
            github.com/Takyunho ↗
          </a>
        </div>
      </div>

      {/* 웅덩이 위에 놓이므로 반투명 띠를 깔아 읽히게 한다 */}
      <footer className="flex flex-col gap-2 rounded-xl bg-bg/60 px-4 py-3 font-mono text-xs text-muted backdrop-blur-sm md:flex-row md:justify-between">
        <p>
          © {CURRENT_YEAR} {PROFILE.nameEnglish}
        </p>
        <p>Built with Next.js, React Three Fiber</p>
      </footer>
    </section>
  );
}
