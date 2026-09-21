"use client";

import { useSyncExternalStore } from "react";
import dynamic from "next/dynamic";
import { useReducedMotion } from "@/hooks/useReducedMotion";

// three 번들을 첫 HTML과 텍스트가 기다리지 않게 한다
const Scene = dynamic(() => import("@/components/scene/Scene"), {
  ssr: false,
});

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

  // reduced motion에서는 스크롤 연출이 없으므로 장면을 고정하지 않고 히어로와 함께 흘려보낸다
  const positionClassName = reducedMotion
    ? "absolute inset-x-0 top-0 h-svh"
    : "fixed inset-0";

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none z-0 ${positionClassName}`}
    >
      {isWebGLSupported ? (
        <Scene />
      ) : (
        <div className="h-full w-full bg-[radial-gradient(circle_at_50%_40%,color-mix(in_srgb,var(--accent)_28%,transparent),transparent_60%)]" />
      )}
    </div>
  );
}
