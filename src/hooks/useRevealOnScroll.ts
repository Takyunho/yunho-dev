"use client";

import { useEffect, type RefObject } from "react";
import { gsap } from "@/lib/gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";

// 컨테이너 안의 [data-reveal] 요소가 화면에 들어올 때 짧게 페이드한다. 모든 요소가 떠오르면 템플릿처럼 읽혀서 이동은 뺐다
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
          autoAlpha: 0,
          duration: 0.6,
          ease: "power2.out",
          scrollTrigger: { trigger: revealElement, start: "top 88%" },
        });
      });
    }, containerElement);

    return () => gsapContext.revert();
  }, [containerRef, reducedMotion]);
}
