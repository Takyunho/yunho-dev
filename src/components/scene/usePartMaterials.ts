"use client";

import { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import type { PartMaterials } from "@/components/scene/partDefinitions";
import { sceneState } from "@/components/scene/sceneState";
import {
  SCENE_PALETTES,
  type ScenePalette,
  type ThemeName,
} from "@/components/scene/themePalette";

const COLOR_FOLLOW_SPEED = 4;

function createMaterial(
  color: string,
  glow: string,
): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    color,
    emissive: glow,
    emissiveIntensity: 0,
    roughness: 0.35,
    metalness: 0.1,
    clearcoat: 1,
    clearcoatRoughness: 0.15,
    // 점 단위로 채워지듯 나타나서 입자 표현과 이어진다. opacity는 UiParts가 매 프레임 solid 값으로 둔다
    alphaHash: true,
    opacity: 0,
  });
}

function createPartMaterials(palette: ScenePalette): PartMaterials {
  return {
    neutral: createMaterial(palette.neutral, palette.glow),
    contrast: createMaterial(palette.contrast, palette.glow),
    accent: createMaterial(palette.accent, palette.glow),
    highlight: createMaterial(palette.highlight, palette.glow),
    bright: createMaterial(palette.bright, palette.glow),
  };
}

// 역할별 재질 5개를 모든 부품이 공유하므로, 테마 전환 시 색 5개만 보간하면 된다
export function usePartMaterials(
  themeName: ThemeName,
  instant: boolean,
): PartMaterials {
  const [materials] = useState(() =>
    createPartMaterials(SCENE_PALETTES[themeName]),
  );
  const targetColor = useMemo(() => new THREE.Color(), []);
  const materialList = useMemo(() => Object.values(materials), [materials]);

  useEffect(() => {
    return () => {
      Object.values(materials).forEach((material) => material.dispose());
    };
  }, [materials]);

  useFrame((_, delta) => {
    const palette = SCENE_PALETTES[themeName];
    const blendRatio = instant ? 1 : 1 - Math.exp(-delta * COLOR_FOLLOW_SPEED);

    materials.neutral.color.lerp(targetColor.set(palette.neutral), blendRatio);
    materials.contrast.color.lerp(
      targetColor.set(palette.contrast),
      blendRatio,
    );
    materials.accent.color.lerp(
      targetColor.set(sceneState.accentOverride ?? palette.accent),
      blendRatio,
    );
    materials.highlight.color.lerp(
      targetColor.set(palette.highlight),
      blendRatio,
    );
    materials.bright.color.lerp(targetColor.set(palette.bright), blendRatio);
    materialList.forEach((material) => {
      material.emissive.lerp(targetColor.set(palette.glow), blendRatio);
    });
  });

  return materials;
}
