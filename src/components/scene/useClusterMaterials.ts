"use client";

import { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import type { BodyRole } from "@/components/scene/clusterBodies";
import { sceneState } from "@/components/scene/sceneState";
import {
  SCENE_PALETTES,
  type ScenePalette,
  type ThemeName,
} from "@/components/scene/themePalette";

export type ClusterMaterials = Record<BodyRole, THREE.MeshPhysicalMaterial>;

const COLOR_FOLLOW_SPEED = 4;

function createMaterial(color: string): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    color,
    roughness: 0.35,
    metalness: 0.1,
    clearcoat: 1,
    clearcoatRoughness: 0.15,
  });
}

function createClusterMaterials(palette: ScenePalette): ClusterMaterials {
  return {
    neutral: createMaterial(palette.neutral),
    contrast: createMaterial(palette.contrast),
    accent: createMaterial(palette.accent),
  };
}

// 역할별 재질 3개를 모든 오브젝트가 공유하므로, 테마 전환 시 색 3개만 보간하면 된다
export function useClusterMaterials(
  themeName: ThemeName,
  instant: boolean,
): ClusterMaterials {
  const [materials] = useState(() =>
    createClusterMaterials(SCENE_PALETTES[themeName]),
  );
  const targetColor = useMemo(() => new THREE.Color(), []);

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
  });

  return materials;
}
