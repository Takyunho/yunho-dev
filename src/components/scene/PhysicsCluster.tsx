"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { useFrame } from "@react-three/fiber";
import {
  BallCollider,
  CapsuleCollider,
  CuboidCollider,
  CylinderCollider,
  RigidBody,
  type RapierRigidBody,
} from "@react-three/rapier";
import {
  createClusterBodies,
  type BodyShape,
} from "@/components/scene/clusterBodies";
import { sceneState } from "@/components/scene/sceneState";
import {
  createSceneKeyframe,
  sampleChoreography,
} from "@/components/scene/sectionChoreography";
import type { ThemeName } from "@/components/scene/themePalette";
import { useClusterMaterials } from "@/components/scene/useClusterMaterials";

interface PhysicsClusterProps {
  bodyCount: number;
  isMobile: boolean;
  themeName: ThemeName;
  instantTheme: boolean;
  castShadows: boolean;
}

const ORIGIN = new THREE.Vector3(0, 0, 0);
const CAMERA_FOLLOW_SPEED = 3;
// 가장자리로 퍼졌을 때 옆으로 겹쳐 쌓이는 대신 앞뒤로 흩어지게 하는 깊이
const SPREAD_DEPTH = 3;
const REFERENCE_FRAME_RATE = 60;
const MAX_FRAME_DELTA = 0.1;

const SPHERE_RADIUS = 0.75;
const CAPSULE_RADIUS = 0.45;
const CAPSULE_LENGTH = 1.1;
const BOX_SIZE = 1.2;
const TORUS_RADIUS = 0.62;
const TORUS_TUBE_RADIUS = 0.27;

function createGeometries(): Record<BodyShape, THREE.BufferGeometry> {
  return {
    sphere: new THREE.SphereGeometry(SPHERE_RADIUS, 48, 48),
    capsule: new THREE.CapsuleGeometry(CAPSULE_RADIUS, CAPSULE_LENGTH, 12, 32),
    box: new RoundedBoxGeometry(BOX_SIZE, BOX_SIZE, BOX_SIZE, 6, 0.22),
    torus: new THREE.TorusGeometry(TORUS_RADIUS, TORUS_TUBE_RADIUS, 32, 64),
  };
}

// 메시에서 자동으로 만드는 hull 충돌체는 오브젝트마다 정점 수천 개로 볼록 껍질을 계산해서
// 장면이 뜨기까지 몇 초가 걸린다. 그래서 형태별 기본 도형 충돌체를 직접 지정한다
function BodyCollider({ shape }: { shape: BodyShape }) {
  switch (shape) {
    case "sphere":
      return <BallCollider args={[SPHERE_RADIUS]} />;
    case "capsule":
      return <CapsuleCollider args={[CAPSULE_LENGTH / 2, CAPSULE_RADIUS]} />;
    case "box":
      return (
        <CuboidCollider args={[BOX_SIZE / 2, BOX_SIZE / 2, BOX_SIZE / 2]} />
      );
    case "torus":
      // 토러스는 납작한 원기둥으로 근사한다. 원기둥 축(Y)을 토러스 축(Z)에 맞춰 눕힌다
      return (
        <CylinderCollider
          args={[TORUS_TUBE_RADIUS, TORUS_RADIUS + TORUS_TUBE_RADIUS]}
          rotation={[Math.PI / 2, 0, 0]}
        />
      );
  }
}

export default function PhysicsCluster({
  bodyCount,
  isMobile,
  themeName,
  instantTheme,
  castShadows,
}: PhysicsClusterProps) {
  const bodyDescriptors = useMemo(
    () => createClusterBodies(bodyCount),
    [bodyCount],
  );
  const geometries = useMemo(() => createGeometries(), []);
  const materials = useClusterMaterials(themeName, instantTheme);

  const rigidBodies = useRef<(RapierRigidBody | null)[]>([]);
  const keyframe = useMemo(() => createSceneKeyframe(), []);
  const impulse = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => {
    return () => {
      Object.values(geometries).forEach((geometry) => geometry.dispose());
    };
  }, [geometries]);

  useFrame((state, delta) => {
    // 주사율이 달라도 같은 힘이 되도록 60fps 기준으로 환산한다
    const frameScale = Math.min(delta, MAX_FRAME_DELTA) * REFERENCE_FRAME_RATE;
    sampleChoreography(sceneState.sectionProgress, isMobile, keyframe);

    const viewportSize = state.viewport.getCurrentViewport(
      state.camera,
      ORIGIN,
    );
    const elapsedTime = state.clock.elapsedTime;
    // 가만히 있어도 덩어리가 숨 쉬듯 움직이도록 중심을 천천히 흔든다
    const centerX =
      keyframe.centerX * viewportSize.width +
      Math.sin(elapsedTime * 0.6) * 0.35;
    const centerY =
      keyframe.centerY * viewportSize.height +
      Math.cos(elapsedTime * 0.45) * 0.25;
    const spreadWidth = keyframe.spreadX * viewportSize.width * 0.5;
    const spreadHeight = keyframe.spreadY * viewportSize.height * 0.5;
    const spreadDepth = keyframe.spreadX * SPREAD_DEPTH;

    rigidBodies.current.forEach((rigidBody, bodyIndex) => {
      const bodyDescriptor = bodyDescriptors[bodyIndex];
      if (!rigidBody || !bodyDescriptor) return;

      // spread가 0이면 모든 목표가 중심 한 점이 되어 뭉치고, 커질수록 각자의 자리로 흩어진다
      const [homeX, homeY, homeZ] = bodyDescriptor.home;
      const targetX = centerX + homeX * spreadWidth;
      const targetY = centerY + homeY * spreadHeight;
      const targetZ = homeZ * spreadDepth;

      const position = rigidBody.translation();
      // 질량을 곱해서 큰 오브젝트와 작은 오브젝트가 같은 가속도로 끌려오게 한다
      const impulseScale =
        keyframe.attractionStrength * frameScale * rigidBody.mass();
      impulse.set(
        (targetX - position.x) * impulseScale,
        (targetY - position.y) * impulseScale,
        (targetZ - position.z) * impulseScale,
      );
      rigidBody.applyImpulse(impulse, true);
    });

    state.camera.position.z = THREE.MathUtils.damp(
      state.camera.position.z,
      keyframe.cameraDistance,
      CAMERA_FOLLOW_SPEED,
      delta,
    );
  });

  return (
    <>
      {bodyDescriptors.map((bodyDescriptor, bodyIndex) => (
        <RigidBody
          key={bodyDescriptor.key}
          ref={(rigidBody) => {
            rigidBodies.current[bodyIndex] = rigidBody;
          }}
          colliders={false}
          position={bodyDescriptor.position}
          rotation={bodyDescriptor.rotation}
          scale={bodyDescriptor.scale}
          linearDamping={4}
          angularDamping={1.2}
          friction={0.1}
        >
          <mesh
            geometry={geometries[bodyDescriptor.shape]}
            material={materials[bodyDescriptor.role]}
            castShadow={castShadows}
            receiveShadow={castShadows}
          />
          <BodyCollider shape={bodyDescriptor.shape} />
        </RigidBody>
      ))}
    </>
  );
}
