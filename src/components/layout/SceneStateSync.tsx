"use client";

import { useEffect } from "react";
import {
  GAP_PADDING_RATIO,
  SECTION_IDS,
  sceneState,
  type SceneTextGap,
  type SectionId,
} from "@/components/scene/sceneState";
import { useReducedMotion } from "@/hooks/useReducedMotion";

// 부품이 둘씩 들어가는 문구 사이 빈 공간. 순서가 partDefinitions의 gap 번호다
const TEXT_GAP_PAIRS: [SectionId, SectionId][] = [
  ["about", "stack"],
  ["stack", "work"],
  ["work", "lab"],
];
const POINTER_ENERGY_PER_DISTANCE = 6;
const POINTER_ENERGY_MAX = 1.5;

function measureSectionCenters(): number[] {
  return SECTION_IDS.map((sectionId) => {
    const sectionElement = document.getElementById(sectionId);
    if (!sectionElement) return 0;
    const sectionRect = sectionElement.getBoundingClientRect();
    return sectionRect.top + window.scrollY + sectionRect.height / 2;
  });
}

function computeSectionProgress(
  sectionCenters: number[],
  scrollY: number,
): number {
  const viewportCenter = scrollY + window.innerHeight / 2;
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

interface TextBounds {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

// 섹션 안의 data-scene-text 요소들을 합친 사각형. 제목과 목록처럼 나뉘어 있어도 하나로 본다
function measureTextBounds(sectionId: SectionId): TextBounds | null {
  const sectionElement = document.getElementById(sectionId);
  if (!sectionElement) return null;
  const textElements = sectionElement.querySelectorAll("[data-scene-text]");
  if (textElements.length === 0) return null;

  let top = Infinity;
  let bottom = -Infinity;
  let left = Infinity;
  let right = -Infinity;
  textElements.forEach((textElement) => {
    const rect = textElement.getBoundingClientRect();
    top = Math.min(top, rect.top);
    bottom = Math.max(bottom, rect.bottom);
    left = Math.min(left, rect.left);
    right = Math.max(right, rect.right);
  });
  return { top, bottom, left, right };
}

function measureTextGaps(): SceneTextGap[] {
  const padding = window.innerHeight * GAP_PADDING_RATIO;
  return TEXT_GAP_PAIRS.map(([aboveId, belowId]) => {
    const aboveSection = document.getElementById(aboveId);
    const belowSection = document.getElementById(belowId);
    const aboveText = measureTextBounds(aboveId);
    const belowText = measureTextBounds(belowId);
    if (!aboveSection || !belowSection || !aboveText || !belowText) {
      return { top: 0, bottom: 0, band: 0 };
    }
    // 위 섹션이 정렬됐을 때 문구 아래에 남는 여백과 아래 섹션이 정렬됐을 때 문구 위에 남는 여백 중 좁은 쪽
    const spaceBelowAbove =
      aboveSection.getBoundingClientRect().bottom - aboveText.bottom;
    const spaceAboveBelow =
      belowText.top - belowSection.getBoundingClientRect().top;
    return {
      top: aboveText.bottom + window.scrollY,
      bottom: belowText.top + window.scrollY,
      band: Math.min(spaceBelowAbove, spaceAboveBelow) - padding * 2,
    };
  });
}

function measureLayout() {
  sceneState.layout.contentMarginPixels = measureTextBounds("stack")?.left ?? 0;
  sceneState.layout.aboutTextRightPixels =
    measureTextBounds("about")?.right ?? 0;
  sceneState.layout.gaps = measureTextGaps();
  const contactSection = document.getElementById("contact");
  sceneState.layout.contactTopPixels = contactSection
    ? contactSection.getBoundingClientRect().top + window.scrollY
    : 0;
}

export default function SceneStateSync() {
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) {
      sceneState.sectionProgress = 0;
      measureLayout();
      return;
    }

    let sectionCenters = measureSectionCenters();
    let disposed = false;

    const updateSectionProgress = () => {
      sceneState.sectionProgress = computeSectionProgress(
        sectionCenters,
        window.scrollY,
      );
    };
    const remeasure = () => {
      sectionCenters = measureSectionCenters();
      const aboutSection = document.getElementById("about");
      if (aboutSection) {
        sceneState.aboutArrivalProgress = computeSectionProgress(
          sectionCenters,
          aboutSection.getBoundingClientRect().top + window.scrollY,
        );
      }
      measureLayout();
      updateSectionProgress();
    };

    // 글꼴 로딩처럼 resize 없이 섹션 높이가 바뀌는 경우까지 잡는다
    const resizeObserver = new ResizeObserver(remeasure);
    resizeObserver.observe(document.body);
    window.addEventListener("resize", remeasure);
    window.addEventListener("scroll", updateSectionProgress, { passive: true });
    document.fonts.ready.then(() => {
      if (!disposed) remeasure();
    });
    remeasure();

    return () => {
      disposed = true;
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

    const setPointerFromEvent = (event: PointerEvent) => {
      sceneState.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
      sceneState.pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
      sceneState.pointerActive = true;
    };
    const handlePointerMove = (event: PointerEvent) => {
      const previousX = sceneState.pointer.x;
      const previousY = sceneState.pointer.y;
      const wasActive = sceneState.pointerActive;
      setPointerFromEvent(event);
      // 창 밖에서 다시 들어온 첫 이동은 옛 좌표와의 거리라서 에너지로 쌓지 않는다
      if (wasActive) {
        // 많이 움직일수록 파도를 세게 일으킨다
        const movedDistance = Math.hypot(
          sceneState.pointer.x - previousX,
          sceneState.pointer.y - previousY,
        );
        sceneState.pointerEnergy = Math.min(
          sceneState.pointerEnergy +
            movedDistance * POINTER_ENERGY_PER_DISTANCE,
          POINTER_ENERGY_MAX,
        );
      }
    };
    // 터치 스크롤 중에는 pointermove가 오지 않으므로 탭이 그 자리에서 파도를 일으킨다
    const handlePointerDown = (event: PointerEvent) => {
      if (event.pointerType === "mouse") return;
      setPointerFromEvent(event);
      sceneState.pointerEnergy = 1;
    };
    const deactivatePointer = () => {
      sceneState.pointerActive = false;
    };
    // 터치는 손가락을 떼면 포인터가 사라진다
    const handlePointerUp = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") deactivatePointer();
    };

    window.addEventListener("pointermove", handlePointerMove, {
      passive: true,
    });
    window.addEventListener("pointerdown", handlePointerDown, {
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
      window.removeEventListener("pointerdown", handlePointerDown);
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
