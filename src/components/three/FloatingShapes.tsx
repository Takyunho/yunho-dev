"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";

/* ── Rounded rect helpers ── */
function createRoundedRect(w: number, h: number, r: number): THREE.Shape {
  const x = -w / 2, y = -h / 2;
  const shape = new THREE.Shape();
  shape.moveTo(x + r, y);
  shape.lineTo(x + w - r, y);
  shape.quadraticCurveTo(x + w, y, x + w, y + r);
  shape.lineTo(x + w, y + h - r);
  shape.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  shape.lineTo(x + r, y + h);
  shape.quadraticCurveTo(x, y + h, x, y + h - r);
  shape.lineTo(x, y + r);
  shape.quadraticCurveTo(x, y, x + r, y);
  return shape;
}

function RoundedOutline({ w, h, r, color, opacity }: {
  w: number; h: number; r: number; color: string; opacity: number;
}) {
  const geo = useMemo(() => {
    const pts = createRoundedRect(w, h, r).getPoints(48);
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, [w, h, r]);

  return (
    <lineLoop geometry={geo}>
      <lineBasicMaterial color={color} transparent opacity={opacity} />
    </lineLoop>
  );
}

/* ── Profile Card ── */
function ProfileCard() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;

    // Gentle floating
    groupRef.current.position.y = Math.sin(t * 0.4) * 0.08;

    // Slight tilt — card feel
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      -0.15 + Math.sin(t * 0.3) * 0.03,
      delta * 2
    );
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      0.25 + Math.sin(t * 0.2) * 0.05,
      delta * 2
    );
  });

  const cw = 3.4, ch = 2.1, cr = 0.14;

  return (
    <group ref={groupRef}>
      {/* Card outline */}
      <RoundedOutline w={cw} h={ch} r={cr} color="#3b82f6" opacity={0.45} />

      {/* Card fill */}
      <mesh position={[0, 0, -0.01]}>
        <shapeGeometry args={[createRoundedRect(cw, ch, cr)]} />
        <meshBasicMaterial color="#3b82f6" transparent opacity={0.03} side={THREE.DoubleSide} />
      </mesh>

      {/* Top accent line */}
      <mesh position={[0, ch / 2 - 0.1, 0.01]}>
        <planeGeometry args={[cw * 0.92, 0.003]} />
        <meshBasicMaterial color="#3b82f6" transparent opacity={0.2} />
      </mesh>

      {/* Avatar — user icon */}
      <group position={[-cw / 2 + 0.5, ch / 2 - 0.45, 0.02]}>
        <mesh position={[0, 0.03, 0]}>
          <circleGeometry args={[0.075, 16]} />
          <meshBasicMaterial color="#60a5fa" transparent opacity={0.25} />
        </mesh>
        <mesh position={[0, -0.16, 0]}>
          <circleGeometry args={[0.12, 16, 0, Math.PI]} />
          <meshBasicMaterial color="#60a5fa" transparent opacity={0.18} />
        </mesh>
      </group>

      {/* Name */}
      <Text
        position={[-cw / 2 + 1.2, ch / 2 - 0.32, 0.02]}
        fontSize={0.18}
        color="#e2e8f0"
        anchorX="left"
        anchorY="middle"
        fillOpacity={0.9}
      >
        탁윤호
      </Text>

      {/* Role */}
      <Text
        position={[-cw / 2 + 1.2, ch / 2 - 0.56, 0.02]}
        fontSize={0.095}
        color="#3b82f6"
        anchorX="left"
        anchorY="middle"
        fillOpacity={0.7}
      >
        Frontend Developer
      </Text>

      {/* Divider */}
      <mesh position={[0, ch / 2 - 0.82, 0.01]}>
        <planeGeometry args={[cw * 0.85, 0.002]} />
        <meshBasicMaterial color="#3b82f6" transparent opacity={0.15} />
      </mesh>

      {/* Info rows */}
      <InfoRow
        position={[-cw / 2 + 0.3, ch / 2 - 1.1, 0.02]}
        label="경력"
        value="4년 · 2022.03 ~"
      />
      <InfoRow
        position={[-cw / 2 + 0.3, ch / 2 - 1.4, 0.02]}
        label="스택"
        value="React · TypeScript · Next.js"
      />
      <InfoRow
        position={[-cw / 2 + 0.3, ch / 2 - 1.7, 0.02]}
        label="관심"
        value="3D 웹 · 인터랙션 · DX"
      />

      {/* Corner accent dots */}
      {[
        [-cw / 2 + 0.07, -ch / 2 + 0.07],
        [cw / 2 - 0.07, -ch / 2 + 0.07],
      ].map(([cx, cy], i) => (
        <mesh key={i} position={[cx, cy, 0.01]}>
          <circleGeometry args={[0.018, 8]} />
          <meshBasicMaterial color="#3b82f6" transparent opacity={0.3} />
        </mesh>
      ))}
    </group>
  );
}

function InfoRow({ position, label, value }: {
  position: [number, number, number];
  label: string;
  value: string;
}) {
  return (
    <group position={position}>
      <Text
        position={[0, 0, 0]}
        fontSize={0.08}
        color="#64748b"
        anchorX="left"
        anchorY="middle"
        fillOpacity={0.7}
      >
        {label}
      </Text>
      <Text
        position={[0.55, 0, 0]}
        fontSize={0.08}
        color="#e2e8f0"
        anchorX="left"
        anchorY="middle"
        fillOpacity={0.6}
      >
        {value}
      </Text>
    </group>
  );
}

export default function FloatingShapes() {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 4.5], fov: 42 }}
      className="h-full w-full"
    >
      <ambientLight intensity={0.5} />
      <ProfileCard />
    </Canvas>
  );
}
