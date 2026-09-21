"use client";

import { useEffect, type RefObject } from "react";
import { gsap } from "@/lib/gsap";
import {
  clamp,
  computeViewportUnits,
  createViewportUnits,
} from "@/components/scene/sceneLayout";
import { sampleWaveHeight, waveSurface } from "@/components/scene/waveSurface";
import { useReducedMotion } from "@/hooks/useReducedMotion";

// 수면이 글자 밑선에서 이 거리 안으로 오면 글자가 반응하기 시작한다 (장면 단위)
const LETTER_APPROACH = 3;
// 파도가 멀리 있을 때와 글자에 닿았을 때, 물결 높이 중 글자에 전해지는 비율.
// 줄마다 비슷하게 움직여야 줄끼리 겹치지 않으므로 잠긴 깊이만큼 띄우는 항은 두지 않는다
const LETTER_LIFT_FAR = 0.05;
const LETTER_LIFT_NEAR = 0.3;
const LETTER_MAX_TILT = 0.35;

interface WaveLetter {
  element: HTMLElement;
  documentCenterX: number;
  documentBottom: number;
}

// 컨테이너 안의 WaveText 글자를 마지막 구간에서 파도를 따라 들어 올리고 기울인다
export function useWaveText(containerRef: RefObject<HTMLElement | null>) {
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const container = containerRef.current;
    if (reducedMotion || !container) return;

    const letters: WaveLetter[] = Array.from(
      container.querySelectorAll<HTMLElement>("[data-wave-letter]"),
    ).map((element) => ({ element, documentCenterX: 0, documentBottom: 0 }));
    const viewport = createViewportUnits();
    let displaced = false;
    let disposed = false;

    const clearTransforms = () => {
      letters.forEach((letter) => {
        letter.element.style.transform = "";
      });
      displaced = false;
    };

    // 변형을 지운 상태에서 문서 기준 자리를 재 둔다. data-reveal의 transform이 rect에는 섞이므로 offset 체인으로 잰다
    const measure = () => {
      if (disposed) return;
      clearTransforms();
      letters.forEach((letter) => {
        let documentLeft = 0;
        let documentTop = 0;
        let offsetElement: HTMLElement | null = letter.element;
        while (offsetElement) {
          documentLeft += offsetElement.offsetLeft;
          documentTop += offsetElement.offsetTop;
          offsetElement = offsetElement.offsetParent as HTMLElement | null;
        }
        letter.documentCenterX = documentLeft + letter.element.offsetWidth / 2;
        letter.documentBottom = documentTop + letter.element.offsetHeight;
      });
    };

    const update = () => {
      if (waveSurface.pool < 0.001) {
        if (displaced) clearTransforms();
        return;
      }
      displaced = true;
      computeViewportUnits(window.innerWidth, window.innerHeight, viewport);
      const {
        pool,
        restHeight,
        floorY,
        halfWidth: poolHalfWidth,
      } = waveSurface;

      letters.forEach((letter) => {
        const screenBottom = letter.documentBottom - window.scrollY;
        const sceneX =
          (letter.documentCenterX / window.innerWidth) *
            2 *
            viewport.halfWidth -
          viewport.halfWidth;
        const sceneBottomY =
          viewport.halfHeight - screenBottom / viewport.pixelsPerUnit;
        const u = sceneX / poolHalfWidth;
        const height = sampleWaveHeight(u);
        const swell = Math.max(0, height - restHeight);
        // 수면과 글자 밑선 사이 거리. 음수면 글자가 수면에 잠긴 것이다
        const gap = sceneBottomY - (floorY + height);
        const proximity = 1 - clamp(gap / LETTER_APPROACH, 0, 1);
        const lift =
          swell *
          (LETTER_LIFT_FAR + (LETTER_LIFT_NEAR - LETTER_LIFT_FAR) * proximity);
        // 수면의 기울기를 따라 글자도 기운다. CSS는 시계 방향이 양수라서 부호를 뒤집는다
        const slope =
          (sampleWaveHeight(u + 0.02) - sampleWaveHeight(u - 0.02)) /
          (0.04 * poolHalfWidth);
        const tilt = clamp(
          Math.atan(slope) * 0.5 * proximity,
          -LETTER_MAX_TILT,
          LETTER_MAX_TILT,
        );
        letter.element.style.transform = `translate3d(0, ${(
          -lift *
          pool *
          viewport.pixelsPerUnit
        ).toFixed(1)}px, 0) rotate(${(-tilt * pool).toFixed(3)}rad)`;
      });
    };

    measure();
    document.fonts.ready.then(measure);
    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(container);
    window.addEventListener("resize", measure);
    gsap.ticker.add(update);

    return () => {
      disposed = true;
      gsap.ticker.remove(update);
      resizeObserver.disconnect();
      window.removeEventListener("resize", measure);
      clearTransforms();
    };
  }, [containerRef, reducedMotion]);
}
