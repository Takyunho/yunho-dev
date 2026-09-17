"use client";

import { Suspense, useEffect, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import { useTheme } from "next-themes";
import PhysicsCluster from "@/components/scene/PhysicsCluster";
import PointerCollider from "@/components/scene/PointerCollider";
import SceneLighting from "@/components/scene/SceneLighting";
import type { ThemeName } from "@/components/scene/themePalette";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const DESKTOP_BODY_COUNT = 40;
const MOBILE_BODY_COUNT = 14;
const DESKTOP_CAMERA_DISTANCE = 18;
const MOBILE_CAMERA_DISTANCE = 24;
const REDUCED_MOTION_SETTLE_MILLISECONDS = 3000;

interface SceneContentsProps {
  themeName: ThemeName;
  isMobile: boolean;
  isFrozen: boolean;
}

function SceneContents({ themeName, isMobile, isFrozen }: SceneContentsProps) {
  const invalidate = useThree((state) => state.invalidate);
  const castShadows = !isMobile;

  // frameloop이 demand인 동안에는 테마가 바뀌어도 스스로 다시 그리지 않는다
  useEffect(() => {
    invalidate();
  }, [invalidate, themeName, isFrozen]);

  return (
    <>
      <SceneLighting
        themeName={themeName}
        instantTheme={isFrozen}
        castShadows={castShadows}
      />
      <Suspense fallback={null}>
        <Physics gravity={[0, 0, 0]} paused={isFrozen}>
          <PhysicsCluster
            bodyCount={isMobile ? MOBILE_BODY_COUNT : DESKTOP_BODY_COUNT}
            isMobile={isMobile}
            themeName={themeName}
            instantTheme={isFrozen}
            castShadows={castShadows}
          />
          <PointerCollider />
        </Physics>
      </Suspense>
    </>
  );
}

export default function Scene() {
  // Canvas 안은 별도 렌더러라서 context 전달에 기대지 않고 밖에서 읽어 props로 내려준다
  const { resolvedTheme } = useTheme();
  const themeName: ThemeName = resolvedTheme === "dark" ? "dark" : "light";
  const isMobile = useMediaQuery("(max-width: 768px)");
  const reducedMotion = useReducedMotion();
  const [hasSettled, setHasSettled] = useState(false);

  useEffect(() => {
    if (!reducedMotion) return;
    const settleTimeoutId = window.setTimeout(
      () => setHasSettled(true),
      REDUCED_MOTION_SETTLE_MILLISECONDS,
    );
    return () => window.clearTimeout(settleTimeoutId);
  }, [reducedMotion]);

  // reduced motion에서는 오브젝트가 자리를 잡은 뒤 물리와 렌더 루프를 멈춘다
  const isFrozen = reducedMotion && hasSettled;

  return (
    <Canvas
      shadows={!isMobile}
      dpr={isMobile ? [1, 1.5] : [1, 2]}
      frameloop={isFrozen ? "demand" : "always"}
      gl={{ alpha: true, antialias: true }}
      camera={{
        position: [
          0,
          0,
          isMobile ? MOBILE_CAMERA_DISTANCE : DESKTOP_CAMERA_DISTANCE,
        ],
        fov: 35,
        near: 0.1,
        far: 100,
      }}
    >
      <SceneContents
        themeName={themeName}
        isMobile={isMobile}
        isFrozen={isFrozen}
      />
    </Canvas>
  );
}
