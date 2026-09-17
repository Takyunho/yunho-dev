"use client";

import { useEffect, type RefObject } from "react";
import { gsap } from "@/lib/gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";

// 컨테이너 안의 [data-reveal] 요소가 화면에 들어올 때 아래에서 떠오르게 한다
export function useRevealOnScroll(
  containerRef: RefObject<HTMLElement | null>,
): void {
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const containerElement = containerRef.current;
    if (reducedMotion || !containerElement) return;

    const gsapContext = gsap.context(() => {
      const revealElements = gsap.utils.toArray<HTMLElement>("[data-reveal]");
      revealElements.forEach((revealElement) => {
        gsap.from(revealElement, {
          y: 48,
          autoAlpha: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: { trigger: revealElement, start: "top 88%" },
        });
      });
    }, containerElement);

    return () => gsapContext.revert();
  }, [containerRef, reducedMotion]);
}
