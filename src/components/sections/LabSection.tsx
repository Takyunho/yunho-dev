"use client";

import { useRef } from "react";
import SectionHeading from "@/components/sections/SectionHeading";
import { useRevealOnScroll } from "@/hooks/useRevealOnScroll";
import { LAB_ITEMS } from "@/content/lab";

export default function LabSection() {
  const sectionRef = useRef<HTMLElement>(null);
  useRevealOnScroll(sectionRef);

  return (
    <section
      id="lab"
      ref={sectionRef}
      className="mx-auto max-w-6xl px-5 py-24 md:px-10 md:py-32"
    >
      <SectionHeading title="Lab" caption="실험과 학습" />

      <ul data-scene-text className="border-b border-line">
        {LAB_ITEMS.map((labItem) => (
          <li key={labItem.name} data-reveal className="border-t border-line">
            <a
              href={labItem.url}
              target="_blank"
              rel="noreferrer"
              className="group grid grid-cols-[1fr_auto] items-baseline gap-x-6 gap-y-1 py-6 transition-colors md:grid-cols-[18rem_1fr_8rem_4rem_2rem]"
            >
              <span className="text-xl font-medium tracking-tight text-fg transition-colors group-hover:text-accent md:text-2xl">
                {labItem.name}
              </span>
              <span className="order-3 col-span-2 text-sm leading-relaxed text-muted md:order-none md:col-span-1 md:text-base">
                {labItem.description}
              </span>
              <span className="hidden font-mono text-(length:--text-label) text-muted md:block">
                {labItem.language}
              </span>
              <span className="font-mono text-(length:--text-label) text-muted tabular-nums md:text-right">
                {labItem.year}
              </span>
              <span
                aria-hidden="true"
                className="hidden text-right text-muted transition-transform group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-accent md:block"
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
