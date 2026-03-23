"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface HeroModelProps {
  mouse: { x: number; y: number };
  isMobile: boolean;
}

/* ── Rounded rectangle shape helper ── */
function createRoundedRectShape(w: number, h: number, r: number): THREE.Shape {
  const x = -w / 2;
  const y = -h / 2;
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

/* ── Rounded rect outline (line loop from shape points) ── */
function RoundedRectOutline({
  w, h, r, color, opacity,
}: {
  w: number; h: number; r: number; color: string; opacity: number;
}) {
  const points = useMemo(() => {
    const shape = createRoundedRectShape(w, h, r);
    return shape.getPoints(48);
  }, [w, h, r]);

  const lineGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    return geo;
  }, [points]);

  return (
    <lineLoop geometry={lineGeo}>
      <lineBasicMaterial color={color} transparent opacity={opacity} />
    </lineLoop>
  );
}

/* ── Rounded rect filled mesh ── */
function RoundedRectFill({
  w, h, r, color, opacity,
}: {
  w: number; h: number; r: number; color: string; opacity: number;
}) {
  const geo = useMemo(() => {
    const shape = createRoundedRectShape(w, h, r);
    return new THREE.ShapeGeometry(shape);
  }, [w, h, r]);

  return (
    <mesh geometry={geo}>
      <meshBasicMaterial
        color={color}
        transparent
        opacity={opacity}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

/* ── Wireframe card (browser window style) ── */
interface CardProps {
  position: [number, number, number];
  size: [number, number];
  delay: number;
  speed: number;
  mouse: { x: number; y: number };
}

function WireframeCard({ position, size, delay, speed, mouse }: CardProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [w, h] = size;
  const radius = Math.min(w, h) * 0.06;

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;

    groupRef.current.position.y =
      position[1] + Math.sin(t * speed + delay) * 0.15;
    groupRef.current.position.x =
      position[0] + Math.sin(t * speed * 0.7 + delay) * 0.05;

    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x, mouse.y * 0.08, delta * 1.5
    );
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y, mouse.x * 0.08, delta * 1.5
    );
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Card outline (rounded) */}
      <RoundedRectOutline w={w} h={h} r={radius} color="#3b82f6" opacity={0.5} />

      {/* Card fill */}
      <mesh position={[0, 0, -0.001]}>
        <RoundedRectFill w={w} h={h} r={radius} color="#3b82f6" opacity={0.03} />
      </mesh>

      {/* Header divider line */}
      <mesh position={[0, h / 2 - h * 0.11, 0.01]}>
        <planeGeometry args={[w * 0.95, 0.004]} />
        <meshBasicMaterial color="#3b82f6" transparent opacity={0.2} />
      </mesh>

      {/* Window dots */}
      {[0, 0.055, 0.11].map((xOff, i) => (
        <mesh
          key={i}
          position={[-w / 2 + 0.08 + xOff, h / 2 - h * 0.06, 0.02]}
        >
          <circleGeometry args={[0.018, 12]} />
          <meshBasicMaterial
            color={i === 0 ? "#ef4444" : i === 1 ? "#eab308" : "#22c55e"}
            transparent
            opacity={0.7}
          />
        </mesh>
      ))}

      {/* Content placeholder lines */}
      {[0.22, 0.34, 0.46].map((yOff, i) => (
        <mesh key={`line-${i}`} position={[-(w * 0.08), h / 2 - h * yOff, 0.01]}>
          <planeGeometry args={[w * (0.6 - i * 0.1), 0.015]} />
          <meshBasicMaterial color="#60a5fa" transparent opacity={0.12} />
        </mesh>
      ))}

      {/* Code block accent (rounded, inside card) */}
      <group position={[0, -h * 0.28, 0.01]}>
        <RoundedRectOutline
          w={w * 0.75} h={h * 0.2} r={radius * 0.5}
          color="#3b82f6" opacity={0.15}
        />
        <RoundedRectFill
          w={w * 0.75} h={h * 0.2} r={radius * 0.5}
          color="#3b82f6" opacity={0.04}
        />
      </group>
    </group>
  );
}

/* ── Wireframe button (rounded) ── */
interface ButtonProps {
  position: [number, number, number];
  width: number;
  delay: number;
  mouse: { x: number; y: number };
}

function WireframeButton({ position, width, delay, mouse }: ButtonProps) {
  const ref = useRef<THREE.Group>(null);
  const bh = 0.18;
  const r = bh * 0.4;

  useFrame((state, delta) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.position.y = position[1] + Math.sin(t * 0.6 + delay) * 0.1;
    ref.current.rotation.x = THREE.MathUtils.lerp(
      ref.current.rotation.x, mouse.y * 0.06, delta * 1.5
    );
    ref.current.rotation.y = THREE.MathUtils.lerp(
      ref.current.rotation.y, mouse.x * 0.06, delta * 1.5
    );
  });

  return (
    <group ref={ref} position={position}>
      <RoundedRectOutline w={width} h={bh} r={r} color="#60a5fa" opacity={0.5} />
      <RoundedRectFill w={width} h={bh} r={r} color="#60a5fa" opacity={0.04} />
      {/* Button label */}
      <mesh>
        <planeGeometry args={[width * 0.45, 0.02]} />
        <meshBasicMaterial color="#60a5fa" transparent opacity={0.25} />
      </mesh>
    </group>
  );
}

/* ── Wireframe input field (rounded) ── */
interface InputProps {
  position: [number, number, number];
  width: number;
  delay: number;
  mouse: { x: number; y: number };
}

function WireframeInput({ position, width, delay, mouse }: InputProps) {
  const ref = useRef<THREE.Group>(null);
  const ih = 0.15;
  const r = ih * 0.35;

  useFrame((state, delta) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.position.y = position[1] + Math.sin(t * 0.5 + delay) * 0.08;
    ref.current.rotation.x = THREE.MathUtils.lerp(
      ref.current.rotation.x, mouse.y * 0.05, delta * 1.5
    );
    ref.current.rotation.y = THREE.MathUtils.lerp(
      ref.current.rotation.y, mouse.x * 0.05, delta * 1.5
    );
  });

  return (
    <group ref={ref} position={position}>
      <RoundedRectOutline w={width} h={ih} r={r} color="#3b82f6" opacity={0.4} />
      <RoundedRectFill w={width} h={ih} r={r} color="#3b82f6" opacity={0.03} />
      {/* Placeholder text */}
      <mesh position={[-width * 0.2, 0, 0.01]}>
        <planeGeometry args={[width * 0.35, 0.015]} />
        <meshBasicMaterial color="#3b82f6" transparent opacity={0.15} />
      </mesh>
      {/* Cursor */}
      <mesh position={[width * 0.05, 0, 0.01]}>
        <planeGeometry args={[0.008, 0.08]} />
        <meshBasicMaterial color="#60a5fa" transparent opacity={0.5} />
      </mesh>
    </group>
  );
}

/* ── Main export ── */
export default function HeroModel({ mouse, isMobile }: HeroModelProps) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y, mouse.x * 0.04, delta * 0.8
    );
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x, mouse.y * 0.02, delta * 0.8
    );
  });

  return (
    <group ref={groupRef}>
      {/* Main cards — spread out, no overlap */}
      <WireframeCard
        position={[-3.2, 1.0, -1]}
        size={[1.4, 1.1]}
        delay={0} speed={0.5} mouse={mouse}
      />
      <WireframeCard
        position={[3.0, 0.2, -0.5]}
        size={[1.2, 0.9]}
        delay={1.5} speed={0.6} mouse={mouse}
      />
      <WireframeCard
        position={[3.6, 2.0, -2]}
        size={[0.9, 0.65]}
        delay={3} speed={0.4} mouse={mouse}
      />

      {/* Buttons — far from cards */}
      <WireframeButton position={[-1.2, -2.2, -0.5]} width={0.8} delay={1} mouse={mouse} />
      <WireframeButton position={[1.4, 1.8, -1.5]} width={0.6} delay={2.5} mouse={mouse} />

      {/* Input field — bottom right, isolated */}
      <WireframeInput position={[1.5, -2.0, -1]} width={1.1} delay={2} mouse={mouse} />

      {!isMobile && (
        <>
          <WireframeCard
            position={[0.8, 2.5, -3.5]}
            size={[0.85, 0.6]}
            delay={4} speed={0.45} mouse={mouse}
          />
          <WireframeButton position={[4.0, -1.5, -2]} width={0.7} delay={3.5} mouse={mouse} />
          <WireframeInput position={[-3.2, -1.8, -2.5]} width={0.9} delay={4.5} mouse={mouse} />
        </>
      )}
    </group>
  );
}
