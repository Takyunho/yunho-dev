"use client";

import { useState, useSyncExternalStore } from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useReducedMotion } from "@/hooks/useReducedMotion";

// three 번들을 첫 HTML과 텍스트가 기다리지 않게 한다
const Scene = dynamic(() => import("@/components/scene/Scene"), {
  ssr: false,
});

const HOME_PATHNAME = "/";

let cachedWebGLSupport: boolean | null = null;

function detectWebGLSupport(): boolean {
  if (cachedWebGLSupport === null) {
    try {
      const testCanvas = document.createElement("canvas");
      cachedWebGLSupport = Boolean(
        testCanvas.getContext("webgl2") ?? testCanvas.getContext("webgl"),
      );
    } catch {
      cachedWebGLSupport = false;
    }
  }
  return cachedWebGLSupport;
}

const subscribeToNothing = () => () => {};

export default function SceneLoader() {
  const reducedMotion = useReducedMotion();
  const isWebGLSupported = useSyncExternalStore(
    subscribeToNothing,
    detectWebGLSupport,
    () => true,
  );
  const isHome = usePathname() === HOME_PATHNAME;

  // 돌아올 때마다 WebGL 컨텍스트와 셰이더, 입자를 새로 만들면 첫 프레임이 막혀서, 한 번 만든 장면은 다른 주소에서도 버리지 않는다.
  // 상세 페이지로 바로 들어온 방문자는 홈에 오기 전까지 three 번들을 받지 않는다
  const [hasVisitedHome, setHasVisitedHome] = useState(isHome);
  if (isHome && !hasVisitedHome) setHasVisitedHome(true);
  if (!hasVisitedHome) return null;

  // reduced motion에서는 스크롤 연출이 없으므로 장면을 고정하지 않고 히어로와 함께 흘려보낸다
  const positionClassName = reducedMotion
    ? "absolute inset-x-0 top-0 h-svh"
    : "fixed inset-0";
  // display: none이면 캔버스 크기가 0이 되어 돌아올 때 드로잉 버퍼를 다시 잡으므로, 자리는 두고 보이지만 않게 한다
  const visibilityClassName = isHome ? "" : "invisible";

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none z-0 ${positionClassName} ${visibilityClassName}`}
    >
      {isWebGLSupported ? (
        <Scene isPaused={!isHome} />
      ) : (
        <div className="h-full w-full bg-[radial-gradient(circle_at_50%_40%,color-mix(in_srgb,var(--accent)_28%,transparent),transparent_60%)]" />
      )}
    </div>
  );
}
