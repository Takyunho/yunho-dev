"use client";

import { useRef } from "react";
import SectionHeading from "@/components/sections/SectionHeading";
import { useRevealOnScroll } from "@/hooks/useRevealOnScroll";
import { STACK_CATEGORIES } from "@/content/stack";

export default function StackSection() {
  const sectionRef = useRef<HTMLElement>(null);
  useRevealOnScroll(sectionRef);

  return (
    <section
      id="stack"
      ref={sectionRef}
      className="mx-auto flex min-h-svh max-w-6xl flex-col justify-center px-5 py-24 md:px-10 md:py-32"
    >
      <SectionHeading title="Stack" caption="기술 스택" />

      <ul data-scene-text className="border-b border-line">
        {STACK_CATEGORIES.map((stackCategory) => (
          <li
            key={stackCategory.label}
            data-reveal
            className="grid grid-cols-1 gap-3 border-t border-line py-7 md:grid-cols-[14rem_1fr] md:gap-8 md:py-9"
          >
            <p className="text-base text-muted md:pt-2">
              {stackCategory.label}
              <span className="ml-2 text-sm">{stackCategory.labelKorean}</span>
            </p>
            <p className="text-2xl leading-snug font-medium tracking-tight text-fg md:text-[2rem] md:leading-[1.35]">
              {stackCategory.items.map((stackItem, itemIndex) => (
                // xy-flow처럼 하이픈이 든 이름이 중간에서 줄바꿈되지 않게 항목 단위로 묶는다
                <span key={stackItem} className="whitespace-nowrap">
                  {stackItem}
                  {itemIndex < stackCategory.items.length - 1 && (
                    <span className="whitespace-normal">, </span>
                  )}
                </span>
              ))}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
