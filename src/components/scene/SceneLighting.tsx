"use client";

import { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
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

export default function SceneLighting({
  themeName,
  instantTheme,
  castShadows,
}: SceneLightingProps) {
  const ambientLightRef = useRef<THREE.AmbientLight>(null);
  const keyLightRef = useRef<THREE.DirectionalLight>(null);
  const initialPalette = SCENE_PALETTES[themeName];

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
        palette.ambientIntensity,
      );
    }
    if (keyLightRef.current) {
      keyLightRef.current.intensity = follow(
        keyLightRef.current.intensity,
        palette.keyLightIntensity,
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
        intensity={initialPalette.ambientIntensity}
      />
      <directionalLight
        ref={keyLightRef}
        position={[6, 10, 12]}
        intensity={initialPalette.keyLightIntensity}
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

      {/* 외부 HDR 파일 없이 발광 면 몇 개로 반사용 환경을 만든다 */}
      <Environment resolution={256}>
        <group rotation={[-Math.PI / 3, 0, 1]}>
          <Lightformer
            form="circle"
            intensity={4}
            rotation-x={Math.PI / 2}
            position={[0, 5, -9]}
            scale={2}
          />
          <Lightformer
            form="circle"
            intensity={2}
            rotation-y={Math.PI / 2}
            position={[-5, 1, -1]}
            scale={2}
          />
          <Lightformer
            form="circle"
            intensity={2}
            rotation-y={Math.PI / 2}
            position={[-5, -1, -1]}
            scale={2}
          />
          <Lightformer
            form="circle"
            intensity={2}
            rotation-y={-Math.PI / 2}
            position={[10, 1, 0]}
            scale={8}
          />
        </group>
      </Environment>
    </>
  );
}
