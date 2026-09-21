"use client";

import { useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
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

interface SceneContentsProps {
  themeName: ThemeName;
  isMobile: boolean;
  isFrozen: boolean;
}

function SceneContents({ themeName, isMobile, isFrozen }: SceneContentsProps) {
  const invalidate = useThree((state) => state.invalidate);
  const materials = usePartMaterials(themeName, isFrozen);
  const parts = usePartGroups(materials);
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
      <UiParts
        parts={parts}
        materials={materials}
        themeName={themeName}
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

export default function Scene() {
  // Canvas 안은 별도 렌더러라서 context 전달에 기대지 않고 밖에서 읽어 props로 내려준다
  const { resolvedTheme } = useTheme();
  const themeName: ThemeName = resolvedTheme === "dark" ? "dark" : "light";
  const isMobile = useMediaQuery("(max-width: 768px)");
  const reducedMotion = useReducedMotion();

  // reduced motion에서는 굳은 덩어리를 히어로에 정지시켜 두고 렌더 루프를 멈춘다
  const isFrozen = reducedMotion;

  return (
    <Canvas
      shadows={!isMobile}
      dpr={isMobile ? [1, 1.5] : [1, 2]}
      frameloop={isFrozen ? "demand" : "always"}
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
      />
    </Canvas>
  );
}
