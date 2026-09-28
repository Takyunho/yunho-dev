"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { useFrame, useThree } from "@react-three/fiber";
import {
  SCENE_PALETTES,
  type ThemeName,
} from "@/components/scene/themePalette";

interface SceneLightingProps {
  themeName: ThemeName;
  instantTheme: boolean;
  castShadows: boolean;
}

const INTENSITY_FOLLOW_SPEED = 4;
// 오브젝트가 화면 가장자리로 퍼졌을 때도 그림자가 잘리지 않는 범위
const SHADOW_CAMERA_EXTENT = 16;
// 팔레트의 조명 세기는 예전 조명 단위(three r155 이전)로 읽는다. three r155부터 물리 단위를 써서 같은 숫자면 빛이 π배 약해지므로 되돌린다
const LEGACY_LIGHT_SCALE = Math.PI;
// 반사 환경을 흐리는 정도. 작을수록 방의 창과 조명이 부품 표면에 또렷하게 비친다
const ENVIRONMENT_BLUR = 0.04;

export default function SceneLighting({
  themeName,
  instantTheme,
  castShadows,
}: SceneLightingProps) {
  const ambientLightRef = useRef<THREE.AmbientLight>(null);
  const keyLightRef = useRef<THREE.DirectionalLight>(null);
  const initialPalette = SCENE_PALETTES[themeName];
  const renderer = useThree((state) => state.gl);
  const scene = useThree((state) => state.scene);

  // 외부 HDR 파일 없이 코드로 만든 밝은 방을 반사 환경으로 쓴다. 어두운 공간에 발광 면 몇 개만 두면
  // 부품이 대부분 검은 환경을 비춰 색이 가라앉는다
  useEffect(() => {
    const generator = new THREE.PMREMGenerator(renderer);
    const room = new RoomEnvironment();
    const environmentMap = generator.fromScene(room, ENVIRONMENT_BLUR).texture;
    scene.environment = environmentMap;
    room.dispose();
    generator.dispose();
    return () => {
      if (scene.environment === environmentMap) scene.environment = null;
      environmentMap.dispose();
    };
  }, [renderer, scene]);

  useFrame((state, delta) => {
    const palette = SCENE_PALETTES[themeName];
    const follow = (currentValue: number, targetValue: number) =>
      instantTheme
        ? targetValue
        : THREE.MathUtils.damp(
            currentValue,
            targetValue,
            INTENSITY_FOLLOW_SPEED,
            delta,
          );

    if (ambientLightRef.current) {
      ambientLightRef.current.intensity = follow(
        ambientLightRef.current.intensity,
        palette.ambientIntensity * LEGACY_LIGHT_SCALE,
      );
    }
    if (keyLightRef.current) {
      keyLightRef.current.intensity = follow(
        keyLightRef.current.intensity,
        palette.keyLightIntensity * LEGACY_LIGHT_SCALE,
      );
    }
    state.scene.environmentIntensity = follow(
      state.scene.environmentIntensity,
      palette.environmentIntensity,
    );
  });

  return (
    <>
      <ambientLight
        ref={ambientLightRef}
        intensity={initialPalette.ambientIntensity * LEGACY_LIGHT_SCALE}
      />
      <directionalLight
        ref={keyLightRef}
        position={[6, 10, 12]}
        intensity={initialPalette.keyLightIntensity * LEGACY_LIGHT_SCALE}
        castShadow={castShadows}
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-camera-left={-SHADOW_CAMERA_EXTENT}
        shadow-camera-right={SHADOW_CAMERA_EXTENT}
        shadow-camera-top={SHADOW_CAMERA_EXTENT}
        shadow-camera-bottom={-SHADOW_CAMERA_EXTENT}
        shadow-camera-near={1}
        shadow-camera-far={50}
      />
    </>
  );
}
