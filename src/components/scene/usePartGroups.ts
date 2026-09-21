"use client";

import { useEffect, useState } from "react";
import * as THREE from "three";
import {
  PART_DEFINITIONS,
  measurePartHeight,
  type PartMaterials,
} from "@/components/scene/partDefinitions";

export interface PartSet {
  groups: THREE.Group[];
  // 배율 1 기준 장면 단위 높이
  heights: number[];
  // 매 프레임 UiParts가 채우고 GlyphParticles가 uniform으로 넘기는 부품 행렬
  matrices: THREE.Matrix4[];
}

export function usePartGroups(materials: PartMaterials): PartSet {
  const [partSet] = useState<PartSet>(() => {
    const groups = PART_DEFINITIONS.map((definition) =>
      definition.create(materials),
    );
    return {
      groups,
      heights: groups.map((group, partIndex) =>
        measurePartHeight(group, PART_DEFINITIONS[partIndex]),
      ),
      matrices: groups.map(() => new THREE.Matrix4()),
    };
  });

  useEffect(() => {
    return () => {
      partSet.groups.forEach((group) => {
        group.traverse((child) => {
          if (child instanceof THREE.Mesh) child.geometry.dispose();
        });
      });
    };
  }, [partSet]);

  return partSet;
}
