"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import {
  PART_DEFINITIONS,
  THEME_ONLY_KEY,
  type PartMaterials,
} from "@/components/scene/partDefinitions";
import {
  computeViewportUnits,
  createPartPlacement,
  createViewportUnits,
  placeAtSide,
  placeBetweenTexts,
  resolveSceneProfile,
} from "@/components/scene/sceneLayout";
import { sceneState } from "@/components/scene/sceneState";
import {
  REDUCED_MOTION_PHASES,
  computeClumpCenter,
  computeLaneRoute,
  createLaneRoute,
  createScenePhases,
  samplePhases,
  type ClumpCenter,
} from "@/components/scene/sectionChoreography";
import type { ThemeName } from "@/components/scene/themePalette";
import type { PartSet } from "@/components/scene/usePartGroups";

interface UiPartsProps {
  parts: PartSet;
  materials: PartMaterials;
  themeName: ThemeName;
  isMobile: boolean;
  isFrozen: boolean;
  castShadows: boolean;
}

const MAX_FRAME_DELTA = 0.1;
// 커서가 부품 반너비의 이 배수 안에 오면 부품이 커서 반대쪽으로 밀리고 기운다
const LEAN_REACH_RATIO = 1.5;
const LEAN_MAX_OFFSET = 0.5;
const LEAN_MAX_TILT = (12 * Math.PI) / 180;
const LEAN_FOLLOW_SPEED = 6;
// Lab과 Contact 사이 빈 줄은 섹션 여백 두 개 높이라서, 가장 큰 부품이 들어가도록 건너가는 동안 이만큼 줄인다
const LANE_CROSS_SHRINK = 0.3;
const EMPTY_GAP = { top: 0, bottom: 0, band: 0 };

export default function UiParts({
  parts,
  materials,
  themeName,
  isMobile,
  isFrozen,
  castShadows,
}: UiPartsProps) {
  const phases = useMemo(() => createScenePhases(), []);
  const viewport = useMemo(() => createViewportUnits(), []);
  const placement = useMemo(() => createPartPlacement(), []);
  const clumpCenter = useMemo<ClumpCenter>(
    () => ({ x: 0, y: 0, scale: 1 }),
    [],
  );
  const leanOffsets = useMemo(
    () => PART_DEFINITIONS.map(() => new THREE.Vector2()),
    [],
  );
  const leanTarget = useMemo(() => new THREE.Vector2(), []);
  const laneRoute = useMemo(() => createLaneRoute(), []);
  const lastAtmosphereOpacity = useRef("");
  const materialList = useMemo(() => Object.values(materials), [materials]);

  // 부품 메시는 코드로 만들어져 JSX prop으로 그림자를 켤 수 없어서 여기서 직접 켠다
  useEffect(() => {
    parts.groups.forEach((group) => {
      group.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = castShadows;
          child.receiveShadow = castShadows;
        }
      });
    });
  }, [parts, castShadows]);

  // 테마 토글의 해와 달처럼 한쪽 테마에서만 보이는 메시를 바꿔 보인다
  useEffect(() => {
    parts.groups.forEach((group) => {
      group.children.forEach((child) => {
        const themeOnly = child.userData[THEME_ONLY_KEY];
        if (themeOnly) child.visible = themeOnly === themeName;
      });
    });
  }, [parts, themeName]);

  useFrame((state, delta) => {
    // 높이가 0이면 단위 환산이 0으로 나뉘어 NaN이 된다
    if (state.size.height === 0) return;
    const frameDelta = Math.min(delta, MAX_FRAME_DELTA);
    computeViewportUnits(state.size.width, state.size.height, viewport);
    const profile = resolveSceneProfile(
      isMobile,
      sceneState.layout.contentMarginPixels,
      viewport,
    );
    const currentPhases = isFrozen
      ? REDUCED_MOTION_PHASES
      : samplePhases(
          sceneState.sectionProgress,
          sceneState.aboutArrivalProgress,
          profile,
          phases,
        );
    const scrollY = window.scrollY;
    computeClumpCenter(
      currentPhases,
      viewport,
      profile,
      isFrozen ? 0 : scrollY,
      sceneState.layout,
      clumpCenter,
    );

    const contentMarginUnits =
      sceneState.layout.contentMarginPixels / viewport.pixelsPerUnit;
    const sideLayout = profile === "side";
    // Lab 목록 아래 여백과 Contact 위 여백이 같아서 섹션 경계가 둘 사이 빈 줄의 가운데다
    const laneY =
      viewport.halfHeight -
      (sceneState.layout.contactTopPixels - scrollY) / viewport.pixelsPerUnit;
    computeLaneRoute(currentPhases.regather, laneRoute);
    const elapsedTime = state.clock.elapsedTime;
    const cursorX = sceneState.pointer.x * viewport.halfWidth;
    const cursorY = sceneState.pointer.y * viewport.halfHeight;
    const canLean =
      sceneState.pointerActive &&
      currentPhases.solid > 0.999 &&
      currentPhases.pool < 0.001;

    parts.groups.forEach((group, partIndex) => {
      const definition = PART_DEFINITIONS[partIndex];
      const clumpScale = clumpCenter.scale;
      const clumpX = clumpCenter.x + definition.clump[0] * clumpScale;
      const clumpY = clumpCenter.y + definition.clump[1] * clumpScale;
      const clumpZ = definition.clump[2] * clumpScale;

      if (sideLayout) {
        placeAtSide(
          definition,
          viewport,
          contentMarginUnits,
          clumpScale,
          placement,
        );
      } else {
        placeBetweenTexts(
          definition,
          parts.heights[partIndex],
          sceneState.layout.gaps[definition.gap[0]] ?? EMPTY_GAP,
          viewport,
          clumpScale,
          scrollY,
          placement,
        );
      }

      const spread = currentPhases.spread;
      let baseX: number;
      let baseY: number;
      let baseZ: number;
      let crossShrink = 1;
      if (sideLayout && currentPhases.regather > 0) {
        // 다시 뭉칠 때는 spread가 1에서 줄어드는 값이라 자리와 덩어리 자리를 경로 단계별로 직접 잇는다
        baseX = placement.x + (clumpX - placement.x) * laneRoute.traverse;
        const laneArrivalY =
          placement.y + (laneY - placement.y) * laneRoute.descend;
        baseY = laneArrivalY + (clumpY - laneArrivalY) * laneRoute.settle;
        baseZ = placement.z + (clumpZ - placement.z) * laneRoute.traverse;
        crossShrink =
          1 - Math.sin(laneRoute.traverse * Math.PI) * LANE_CROSS_SHRINK;
      } else if (currentPhases.regather > 0) {
        // 문구 사이 자리는 이때 화면 위쪽 밖이다. 거기서 내려오면 Lab 목록과 Contact 제목을 가로지르므로,
        // 화면 아래 밖에서 덩어리 자리로 올라온다. 덩어리 자리 아래에는 문구가 없다
        const belowScreenY =
          -viewport.halfHeight - parts.heights[partIndex] * clumpScale;
        baseX = clumpX;
        baseY = belowScreenY + (clumpY - belowScreenY) * currentPhases.regather;
        baseZ = clumpZ;
      } else {
        // 휴대폰은 문구를 가로질러 날아가지 않게 화면 옆으로 돌아 나갔다가 자리로 들어온다
        const sidewaysArc = isMobile
          ? definition.side[0] *
            viewport.halfWidth *
            1.3 *
            Math.sin(spread * Math.PI)
          : 0;
        baseX = clumpX + (placement.x - clumpX) * spread + sidewaysArc;
        baseY = clumpY + (placement.y - clumpY) * spread;
        baseZ = clumpZ + (placement.z - clumpZ) * spread;
      }
      const scale =
        clumpScale * (1 + (placement.fitScale - 1) * spread) * crossShrink;

      // 커서 반대 방향으로 밀렸다가 스프링처럼 돌아온다
      const leanOffset = leanOffsets[partIndex];
      leanTarget.set(0, 0);
      if (canLean) {
        const reach = definition.halfWidth * scale * LEAN_REACH_RATIO;
        const awayX = baseX - cursorX;
        const awayY = baseY - cursorY;
        const distance = Math.hypot(awayX, awayY);
        if (distance < reach && distance > 0.0001) {
          const strength = (1 - distance / reach) * LEAN_MAX_OFFSET;
          leanTarget.set(
            (awayX / distance) * strength,
            (awayY / distance) * strength,
          );
        }
      }
      leanOffset.lerp(
        leanTarget,
        1 - Math.exp(-frameDelta * LEAN_FOLLOW_SPEED),
      );
      // 밀린 방향으로 기운다. 최대로 밀렸을 때 LEAN_MAX_TILT만큼이다
      const tiltX = (leanOffset.y / LEAN_MAX_OFFSET) * LEAN_MAX_TILT;
      const tiltY = -(leanOffset.x / LEAN_MAX_OFFSET) * LEAN_MAX_TILT;

      group.position.set(baseX + leanOffset.x, baseY + leanOffset.y, baseZ);
      group.rotation.set(
        definition.rotation[0] +
          Math.sin(elapsedTime * 0.5 + partIndex) * 0.14 +
          tiltX,
        definition.rotation[1] +
          Math.cos(elapsedTime * 0.4 + partIndex * 2) * 0.2 +
          spread * 0.6 +
          tiltY,
        definition.rotation[2] + Math.sin(elapsedTime * 0.3 + partIndex) * 0.08,
      );
      group.scale.setScalar(scale);
      group.visible = currentPhases.solid > 0.001;
      group.updateMatrixWorld(true);
      parts.matrices[partIndex].copy(group.matrixWorld);
    });

    // 굳어지는 순간에만 빛이 돌았다가 사라진다
    const glowPulse = Math.sin(currentPhases.solid * Math.PI) * 0.55;
    materialList.forEach((material) => {
      material.opacity = currentPhases.solid;
      material.emissiveIntensity = glowPulse;
    });

    // 3D 쪽이 DOM에 쓰는 유일한 값. 같은 값이면 쓰지 않는다
    const atmosphereOpacity = (1 - currentPhases.solid * 0.7).toFixed(3);
    if (atmosphereOpacity !== lastAtmosphereOpacity.current) {
      document.documentElement.style.setProperty(
        "--atmosphere-opacity",
        atmosphereOpacity,
      );
      lastAtmosphereOpacity.current = atmosphereOpacity;
    }
  });

  return (
    <>
      {parts.groups.map((group, partIndex) => (
        <primitive key={PART_DEFINITIONS[partIndex].key} object={group} />
      ))}
    </>
  );
}
