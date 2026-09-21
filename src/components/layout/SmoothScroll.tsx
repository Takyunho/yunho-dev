"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export default function SmoothScroll() {
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;

    // lerp가 작을수록 멈출 때까지 길게 미끄러지고, wheelMultiplier가 작을수록 휠 한 번에 덜 움직인다
    const lenis = new Lenis({
      autoRaf: false,
      anchors: true,
      lerp: 0.08,
      wheelMultiplier: 0.9,
    });
    lenis.on("scroll", ScrollTrigger.update);

    const updateLenis = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(updateLenis);
    // 탭 복귀 직후 GSAP이 시간을 건너뛰면 Lenis 스크롤 위치가 튄다
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(updateLenis);
      lenis.destroy();
    };
  }, [reducedMotion]);

  return null;
}
