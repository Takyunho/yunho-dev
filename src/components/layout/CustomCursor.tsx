"use client";

import { useEffect, useRef } from "react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const FOLLOW_EASING = 0.18;
const INTERACTIVE_SELECTOR = "a, button";
const INTERACTIVE_SCALE = 2.2;

export default function CustomCursor() {
  const ringRef = useRef<HTMLDivElement>(null);
  const hasFinePointer = useMediaQuery("(pointer: fine)");
  const reducedMotion = useReducedMotion();
  const isEnabled = hasFinePointer && !reducedMotion;

  useEffect(() => {
    const ringElement = ringRef.current;
    if (!isEnabled || !ringElement) return;

    const targetPosition = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    };
    const currentPosition = { ...targetPosition };
    let targetScale = 1;
    let currentScale = 1;
    let animationFrameId = 0;

    const handlePointerMove = (event: PointerEvent) => {
      targetPosition.x = event.clientX;
      targetPosition.y = event.clientY;
      ringElement.style.opacity = "1";

      const hoveredElement = event.target as Element | null;
      targetScale = hoveredElement?.closest(INTERACTIVE_SELECTOR)
        ? INTERACTIVE_SCALE
        : 1;
    };
    const hideRing = () => {
      ringElement.style.opacity = "0";
    };

    const animate = () => {
      currentPosition.x +=
        (targetPosition.x - currentPosition.x) * FOLLOW_EASING;
      currentPosition.y +=
        (targetPosition.y - currentPosition.y) * FOLLOW_EASING;
      currentScale += (targetScale - currentScale) * FOLLOW_EASING;
      ringElement.style.transform = `translate3d(${currentPosition.x}px, ${currentPosition.y}px, 0) translate(-50%, -50%) scale(${currentScale})`;
      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener("pointermove", handlePointerMove, {
      passive: true,
    });
    document.documentElement.addEventListener("pointerleave", hideRing);
    animationFrameId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      document.documentElement.removeEventListener("pointerleave", hideRing);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isEnabled]);

  if (!isEnabled) return null;

  return (
    <div
      ref={ringRef}
      aria-hidden="true"
      // difference 블렌딩이라 흰 테두리가 라이트와 다크 양쪽에서 배경과 반전되어 보인다
      className="pointer-events-none fixed top-0 left-0 z-50 h-8 w-8 rounded-full border border-white opacity-0 mix-blend-difference transition-opacity duration-300"
    />
  );
}
