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
      className="flex min-h-svh flex-col justify-between px-5 pt-32 md:px-10"
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

      {/* 웅덩이 위에 놓인다. 반투명 띠를 깔면 그 위 경계가 선처럼 보여서, 화면 아래로 갈수록 짙어지는
          그라데이션으로 바탕을 만든다. 좌우 여백 바깥까지 덮도록 음수 여백으로 넓힌다 */}
      <footer className="label relative -mx-5 px-5 pt-24 pb-7 md:-mx-10 md:px-10">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-linear-to-b from-transparent to-(--header-shade)"
        />
        <div className="relative flex items-center justify-between gap-6">
          <p>
            © <span className="tabular-nums">{CURRENT_YEAR}</span>{" "}
            {PROFILE.nameEnglish}
          </p>
          {/* 헤더의 유리 알약과 같은 재질로 두어 화면 위아래가 같은 언어로 읽히게 한다 */}
          <a
            href="#hero"
            aria-label="맨 위로"
            className="liquid-glass group relative flex size-10 shrink-0 items-center justify-center rounded-full text-fg transition-colors duration-(--dur-short) hover:text-accent"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="transition-transform duration-(--dur-short) group-hover:-translate-y-0.5"
            >
              <path d="M12 19V5M5 12l7-7 7 7" />
            </svg>
          </a>
        </div>
      </footer>
    </section>
  );
}
