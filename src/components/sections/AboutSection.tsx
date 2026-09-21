"use client";

import { useRef } from "react";
import SectionHeading from "@/components/sections/SectionHeading";
import { useRevealOnScroll } from "@/hooks/useRevealOnScroll";
import { PROFILE } from "@/content/profile";

const PROFILE_FACTS = [
  { label: "Role", value: PROFILE.role },
  { label: "Company", value: PROFILE.company },
  { label: "Based in", value: PROFILE.location },
];

export default function AboutSection() {
  const sectionRef = useRef<HTMLElement>(null);
  useRevealOnScroll(sectionRef);

  return (
    <section
      id="about"
      ref={sectionRef}
      className="flex min-h-svh flex-col justify-center px-5 py-24 md:px-10 md:py-32"
    >
      {/* 데스크톱에서는 오른쪽 절반을 3D 덩어리 자리로 비워둔다 */}
      <div data-scene-text className="md:w-1/2">
        <SectionHeading index="01" title="About" caption="소개" />

        <p
          data-reveal
          className="text-2xl leading-snug font-medium tracking-tight text-fg md:text-4xl"
        >
          {PROFILE.introduction}
        </p>

        <ul className="mt-12 space-y-8">
          {PROFILE.principles.map((principle) => (
            <li
              key={principle.title}
              data-reveal
              className="border-t border-line pt-5"
            >
              <h3 className="text-base font-semibold text-fg">
                {principle.title}
              </h3>
              <p className="mt-2 text-base leading-relaxed text-muted">
                {principle.description}
              </p>
            </li>
          ))}
        </ul>

        <dl
          data-reveal
          className="mt-12 grid grid-cols-1 gap-6 border-t border-line pt-6 sm:grid-cols-3"
        >
          {PROFILE_FACTS.map((profileFact) => (
            <div key={profileFact.label}>
              <dt className="font-mono text-xs tracking-[0.2em] text-muted uppercase">
                {profileFact.label}
              </dt>
              <dd className="mt-2 text-base font-medium text-fg">
                {profileFact.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
