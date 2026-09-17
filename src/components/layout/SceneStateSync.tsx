"use client";

import { useEffect } from "react";
import { SECTION_IDS, sceneState } from "@/components/scene/sceneState";
import { useReducedMotion } from "@/hooks/useReducedMotion";

function measureSectionCenters(): number[] {
  return SECTION_IDS.map((sectionId) => {
    const sectionElement = document.getElementById(sectionId);
    if (!sectionElement) return 0;
    const sectionRect = sectionElement.getBoundingClientRect();
    return sectionRect.top + window.scrollY + sectionRect.height / 2;
  });
}

function computeSectionProgress(sectionCenters: number[]): number {
  const viewportCenter = window.scrollY + window.innerHeight / 2;
  const lastIndex = sectionCenters.length - 1;

  if (viewportCenter <= sectionCenters[0]) return 0;
  if (viewportCenter >= sectionCenters[lastIndex]) return lastIndex;

  for (let index = 0; index < lastIndex; index += 1) {
    const currentCenter = sectionCenters[index];
    const nextCenter = sectionCenters[index + 1];
    if (viewportCenter < nextCenter) {
      return (
        index + (viewportCenter - currentCenter) / (nextCenter - currentCenter)
      );
    }
  }
  return lastIndex;
}

export default function SceneStateSync() {
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) {
      sceneState.sectionProgress = 0;
      return;
    }

    let sectionCenters = measureSectionCenters();

    const updateSectionProgress = () => {
      sceneState.sectionProgress = computeSectionProgress(sectionCenters);
    };
    const remeasure = () => {
      sectionCenters = measureSectionCenters();
      updateSectionProgress();
    };

    // 글꼴 로딩처럼 resize 없이 섹션 높이가 바뀌는 경우까지 잡는다
    const resizeObserver = new ResizeObserver(remeasure);
    resizeObserver.observe(document.body);
    window.addEventListener("resize", remeasure);
    window.addEventListener("scroll", updateSectionProgress, { passive: true });
    updateSectionProgress();

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", remeasure);
      window.removeEventListener("scroll", updateSectionProgress);
    };
  }, [reducedMotion]);

  useEffect(() => {
    if (reducedMotion) {
      sceneState.pointerActive = false;
      return;
    }

    const handlePointerMove = (event: PointerEvent) => {
      sceneState.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
      sceneState.pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
      sceneState.pointerActive = true;
    };
    const deactivatePointer = () => {
      sceneState.pointerActive = false;
    };
    // 터치는 손가락을 떼면 포인터가 사라지므로 충돌체도 함께 치운다
    const handlePointerUp = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") deactivatePointer();
    };

    window.addEventListener("pointermove", handlePointerMove, {
      passive: true,
    });
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", deactivatePointer);
    window.addEventListener("blur", deactivatePointer);
    document.documentElement.addEventListener(
      "pointerleave",
      deactivatePointer,
    );

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", deactivatePointer);
      window.removeEventListener("blur", deactivatePointer);
      document.documentElement.removeEventListener(
        "pointerleave",
        deactivatePointer,
      );
    };
  }, [reducedMotion]);

  return null;
}
