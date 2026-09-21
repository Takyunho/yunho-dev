"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import {
  computeViewportUnits,
  createViewportUnits,
  FIELD_OF_VIEW,
} from "@/components/scene/sceneLayout";
import { sceneState } from "@/components/scene/sceneState";
import {
  SCENE_PALETTES,
  type ThemeName,
} from "@/components/scene/themePalette";
import {
  readCursorImmersion,
  sampleWaveHeight,
  splashWaveSurface,
  waveSurface,
} from "@/components/scene/waveSurface";

// 한 번에 쏟아지는 점의 수와, 화면에 동시에 떠 있을 수 있는 점의 수
const DROPS_PER_CLICK = 90;
const MAX_DROPS = 450;
// 점마다 떨어지기 시작하는 때가 이 시간 안에서 달라진다. 한꺼번에 떨어지면 덩어리로 보인다
const DROP_STAGGER_SECONDS = 0.4;
// 떨어지는 점이 받는 중력 (장면 단위/초²)
const DROP_GRAVITY = 14;
// 누른 자리를 중심으로 점이 생기는 범위 (장면 단위)
const DROP_SPREAD_X = 1.2;
const DROP_SPREAD_Y = 0.6;
const DROP_SPREAD_Z = 0.4;
// 첫 속도. 좌우로 퍼지면서 떨어지고, 아래로 미는 속도가 제각각이라 줄줄이 흩어진다
const DROP_START_SPEED_X = 1.2;
const DROP_START_SPEED_Y = 2.2;
const DROP_WORLD_SIZE = 0.1;
const DROP_OPACITY = 0.8;
const MAX_FRAME_DELTA = 1 / 30;

// 점의 상태
const EMPTY = 0;
const WAITING = 1;
const FALLING = 2;

const DROP_VERTEX_SHADER = /* glsl */ `
  attribute float aScale;
  uniform float uPixelScale;

  void main() {
    vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * viewPosition;
    gl_PointSize = aScale * uPixelScale / -viewPosition.z;
  }
`;

// 웅덩이의 점과 같은 모양이다. 가운데가 진하고 가장자리로 갈수록 옅어지는 원이다
const DROP_FRAGMENT_SHADER = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;

  void main() {
    float distanceFromCenter = length(gl_PointCoord - 0.5);
    float alpha = smoothstep(0.5, 0.2, distanceFromCenter);
    gl_FragColor = vec4(uColor, alpha * uOpacity);
    #include <colorspace_fragment>
  }
`;

interface PoolDropsProps {
  themeName: ThemeName;
}

// 웅덩이 위 빈 곳을 누르면 그 자리에서 점이 우수수 떨어지고, 물에 닿은 자리가 파이며 파도가 인다
export default function PoolDrops({ themeName }: PoolDropsProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const viewport = useMemo(() => createViewportUnits(), []);
  const positions = useMemo(() => new Float32Array(MAX_DROPS * 3), []);
  // 버퍼에 올리는 크기다. 0이면 그려지지 않아서 떨어지기 전과 사라진 뒤에 쓴다
  const scales = useMemo(() => new Float32Array(MAX_DROPS), []);
  const fallingSizes = useMemo(() => new Float32Array(MAX_DROPS), []);
  const velocities = useMemo(() => new Float32Array(MAX_DROPS * 2), []);
  const delays = useMemo(() => new Float32Array(MAX_DROPS), []);
  const states = useMemo(() => new Uint8Array(MAX_DROPS), []);
  const nextDropIndex = useRef(0);
  const hadVisibleDrops = useRef(false);

  const geometry = useMemo(() => {
    const created = new THREE.BufferGeometry();
    created.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3).setUsage(THREE.DynamicDrawUsage),
    );
    created.setAttribute(
      "aScale",
      new THREE.BufferAttribute(scales, 1).setUsage(THREE.DynamicDrawUsage),
    );
    return created;
  }, [positions, scales]);

  const [material] = useState(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uPixelScale: { value: 1 },
          uColor: { value: new THREE.Color(SCENE_PALETTES[themeName].dot) },
          uOpacity: { value: DROP_OPACITY },
        },
        transparent: true,
        depthWrite: false,
        depthTest: false,
        toneMapped: false,
        vertexShader: DROP_VERTEX_SHADER,
        fragmentShader: DROP_FRAGMENT_SHADER,
      }),
  );

  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  // 점은 잠깐 떨어지고 사라져서 테마 색을 보간하지 않고 바로 바꾼다
  useEffect(() => {
    const palette = SCENE_PALETTES[themeName];
    material.uniforms.uColor.value.set(palette.dot);
    material.blending = palette.additive
      ? THREE.AdditiveBlending
      : THREE.NormalBlending;
    material.needsUpdate = true;
  }, [material, themeName]);

  useFrame((state, delta) => {
    if (state.size.height === 0) return;
    const frameDelta = Math.min(delta, MAX_FRAME_DELTA);
    computeViewportUnits(state.size.width, state.size.height, viewport);

    const poolClick = sceneState.pendingPoolClick;
    sceneState.pendingPoolClick = null;
    const hasPool = waveSurface.pool > 0.001;
    if (hasPool && poolClick) {
      const originX = poolClick.x * viewport.halfWidth;
      const originY = poolClick.y * viewport.halfHeight;
      // 이미 물속인 자리를 누르면 떨어질 높이가 없다
      if (readCursorImmersion(originX, originY) <= 0) {
        for (let count = 0; count < DROPS_PER_CLICK; count += 1) {
          const index = nextDropIndex.current;
          nextDropIndex.current = (index + 1) % MAX_DROPS;
          positions[index * 3] =
            originX + (Math.random() - 0.5) * DROP_SPREAD_X;
          positions[index * 3 + 1] =
            originY + (Math.random() - 0.5) * DROP_SPREAD_Y;
          positions[index * 3 + 2] = (Math.random() - 0.5) * DROP_SPREAD_Z;
          velocities[index * 2] = (Math.random() - 0.5) * DROP_START_SPEED_X;
          velocities[index * 2 + 1] = -Math.random() * DROP_START_SPEED_Y;
          fallingSizes[index] = DROP_WORLD_SIZE * (0.7 + Math.random() * 0.6);
          delays[index] = Math.random() * DROP_STAGGER_SECONDS;
          states[index] = WAITING;
          scales[index] = 0;
        }
      }
    }

    let hasVisibleDrops = false;
    for (let index = 0; index < MAX_DROPS; index += 1) {
      if (states[index] === EMPTY) continue;
      // 웅덩이가 사라지면 떨어지던 점도 함께 걷는다
      if (!hasPool) {
        states[index] = EMPTY;
        scales[index] = 0;
        continue;
      }
      if (states[index] === WAITING) {
        delays[index] -= frameDelta;
        if (delays[index] > 0) continue;
        states[index] = FALLING;
        scales[index] = fallingSizes[index];
      }
      velocities[index * 2 + 1] -= DROP_GRAVITY * frameDelta;
      positions[index * 3] += velocities[index * 2] * frameDelta;
      positions[index * 3 + 1] += velocities[index * 2 + 1] * frameDelta;
      const surfaceY =
        waveSurface.floorY +
        sampleWaveHeight(positions[index * 3] / waveSurface.halfWidth);
      if (positions[index * 3 + 1] > surfaceY) {
        hasVisibleDrops = true;
        continue;
      }
      // 물에 닿은 점은 수면을 끌어내리고 사라진다
      splashWaveSurface(positions[index * 3]);
      states[index] = EMPTY;
      scales[index] = 0;
    }

    const points = pointsRef.current;
    if (points) points.visible = hasVisibleDrops;
    if (hasVisibleDrops || hadVisibleDrops.current) {
      geometry.attributes.position.needsUpdate = true;
      geometry.attributes.aScale.needsUpdate = true;
    }
    hadVisibleDrops.current = hasVisibleDrops;

    const tangentHalfFov = Math.tan(((FIELD_OF_VIEW / 2) * Math.PI) / 180);
    material.uniforms.uPixelScale.value =
      (state.size.height * state.gl.getPixelRatio()) / (2 * tangentHalfFov);
  });

  return (
    // 점이 매 프레임 움직여서 경계 상자를 다시 재지 않는다. 화면 밖으로 잘리지 않게 컬링을 끈다
    <points
      ref={pointsRef}
      geometry={geometry}
      material={material}
      frustumCulled={false}
      visible={false}
    />
  );
}
