"use client";

import { useEffect, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useTheme } from "next-themes";
import GlyphParticles from "@/components/scene/GlyphParticles";
import PoolDrops from "@/components/scene/PoolDrops";
import SceneLighting from "@/components/scene/SceneLighting";
import UiParts from "@/components/scene/UiParts";
import { CAMERA_DISTANCE, FIELD_OF_VIEW } from "@/components/scene/sceneLayout";
import type { ThemeName } from "@/components/scene/themePalette";
import { usePartGroups } from "@/components/scene/usePartGroups";
import { usePartMaterials } from "@/components/scene/usePartMaterials";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const MAX_CLOCK_STEP = 0.1;

// R3F는 frameloop을 바꿀 때 시계를 0으로 되돌리고, never로 바뀐 직후 한 번 더 도는 프레임에서는 rAF 시각(ms)을 그대로 넣는다.
// 부품의 흔들림은 시각에서 바로 계산하므로, 프레임 간격만 쌓은 시각으로 덮어써서 숨겼다 다시 보일 때 자세가 튀지 않게 한다.
// 다른 useFrame보다 먼저 돌아야 한다
function useContinuousClock() {
  const continuousTimeRef = useRef(0);
  useFrame((state, delta) => {
    continuousTimeRef.current += Math.min(Math.max(delta, 0), MAX_CLOCK_STEP);
    state.clock.elapsedTime = continuousTimeRef.current;
  }, -1);
}

interface SceneContentsProps {
  themeName: ThemeName;
  isMobile: boolean;
  isFrozen: boolean;
  isPaused: boolean;
}

function SceneContents({
  themeName,
  isMobile,
  isFrozen,
  isPaused,
}: SceneContentsProps) {
  const invalidate = useThree((state) => state.invalidate);
  useContinuousClock();
  const materials = usePartMaterials(themeName, isFrozen);
  const parts = usePartGroups(materials);
  const castShadows = !isMobile;

  // frameloop이 demand인 동안에는 테마가 바뀌어도 스스로 다시 그리지 않는다.
  // 숨겨져 있던 사이에 바뀐 테마와 창 크기도 다시 보일 때 한 번 그려야 한다
  useEffect(() => {
    invalidate();
  }, [invalidate, themeName, isFrozen, isPaused]);

  return (
    <>
      <SceneLighting
        themeName={themeName}
        instantTheme={isFrozen}
        castShadows={castShadows}
      />
      <UiParts
        parts={parts}
        materials={materials}
        isMobile={isMobile}
        isFrozen={isFrozen}
        castShadows={castShadows}
      />
      {!isFrozen && (
        <>
          <GlyphParticles
            parts={parts}
            themeName={themeName}
            isMobile={isMobile}
          />
          {/* 웅덩이 진행도를 GlyphParticles가 갱신한 뒤에 읽도록 뒤에 둔다 */}
          <PoolDrops themeName={themeName} />
        </>
      )}
    </>
  );
}

interface SceneProps {
  // 홈이 아닌 화면에서는 장면이 숨겨져 있으므로 아무것도 그리지 않는다
  isPaused: boolean;
}

export default function Scene({ isPaused }: SceneProps) {
  // Canvas 안은 별도 렌더러라서 context 전달에 기대지 않고 밖에서 읽어 props로 내려준다
  const { resolvedTheme } = useTheme();
  const themeName: ThemeName = resolvedTheme === "dark" ? "dark" : "light";
  const isMobile = useMediaQuery("(max-width: 768px)");
  const reducedMotion = useReducedMotion();

  // reduced motion에서는 굳은 덩어리를 히어로에 정지시켜 두고 렌더 루프를 멈춘다
  const isFrozen = reducedMotion;
  const continuousFrameloop = isFrozen ? "demand" : "always";

  return (
    <Canvas
      shadows={!isMobile}
      dpr={isMobile ? [1, 1.5] : [1, 2]}
      frameloop={isPaused ? "never" : continuousFrameloop}
      gl={{ alpha: true, antialias: true }}
      camera={{
        position: [0, 0, CAMERA_DISTANCE],
        fov: FIELD_OF_VIEW,
        near: 0.1,
        far: 100,
      }}
    >
      <SceneContents
        themeName={themeName}
        isMobile={isMobile}
        isFrozen={isFrozen}
        isPaused={isPaused}
      />
    </Canvas>
  );
}
