"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import {
  BallCollider,
  RigidBody,
  type RapierRigidBody,
} from "@react-three/rapier";
import { sceneState } from "@/components/scene/sceneState";

const ORIGIN = new THREE.Vector3(0, 0, 0);
const PARKED_POSITION = { x: 0, y: 1000, z: 0 };
const COLLIDER_RADIUS = 1.3;

// 커서를 따라다니며 오브젝트를 밀어내는 보이지 않는 충돌체
export default function PointerCollider() {
  const colliderBodyRef = useRef<RapierRigidBody>(null);
  const wasActiveRef = useRef(false);
  const worldPosition = useMemo(() => new THREE.Vector3(), []);

  useFrame((state) => {
    const colliderBody = colliderBodyRef.current;
    if (!colliderBody) return;

    if (!sceneState.pointerActive) {
      if (wasActiveRef.current)
        colliderBody.setTranslation(PARKED_POSITION, true);
      wasActiveRef.current = false;
      return;
    }

    const viewportSize = state.viewport.getCurrentViewport(
      state.camera,
      ORIGIN,
    );
    worldPosition.set(
      (sceneState.pointer.x * viewportSize.width) / 2,
      (sceneState.pointer.y * viewportSize.height) / 2,
      0,
    );

    if (wasActiveRef.current) {
      colliderBody.setNextKinematicTranslation(worldPosition);
    } else {
      // 세워둔 자리에서 kinematic 이동으로 끌고 오면 그 속도가 오브젝트에 충격으로 전달된다
      colliderBody.setTranslation(worldPosition, true);
    }
    wasActiveRef.current = true;
  });

  return (
    <RigidBody
      ref={colliderBodyRef}
      type="kinematicPosition"
      colliders={false}
      position={[PARKED_POSITION.x, PARKED_POSITION.y, PARKED_POSITION.z]}
    >
      <BallCollider args={[COLLIDER_RADIUS]} />
    </RigidBody>
  );
}
