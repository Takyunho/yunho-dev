"use client";

import { useRef, useState, useEffect, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Project } from "@/lib/constants";
import { useMediaQuery } from "@/hooks/useMediaQuery";

gsap.registerPlugin(ScrollTrigger);

// ─── 단일 프로젝트 카드 (3D plane) ─────────────────────

interface ProjectCard3DProps {
  project: Project;
  index: number;
  activeIndex: number;
  onClick: (index: number) => void;
  isMobile: boolean;
}

function ProjectCard3D({
  project,
  index,
  activeIndex,
  onClick,
  isMobile,
}: ProjectCard3DProps) {
  const meshRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  const [hovered, setHovered] = useState(false);

  const cardWidth = isMobile ? 2.0 : 2.6;
  const cardHeight = isMobile ? 1.3 : 1.6;
  const spacing = isMobile ? 2.6 : 3.2;

  // 카드 위치 계산 — 중앙 기준 오프셋
  const offset = index - activeIndex;

  const targetPos = useMemo(() => {
    const x = offset * spacing;
    const z = -Math.abs(offset) * 1.2;
    const y = -Math.abs(offset) * 0.15;
    return { x, y, z };
  }, [offset, spacing]);

  const targetRotY = useMemo(() => offset * -0.12, [offset]);
  const targetOpacity = useMemo(
    () => Math.max(0.15, 1 - Math.abs(offset) * 0.35),
    [offset]
  );
  const targetScale = useMemo(
    () => Math.max(0.7, 1 - Math.abs(offset) * 0.12),
    [offset]
  );

  useFrame((_, delta) => {
    if (!meshRef.current || !materialRef.current) return;
    const lerp = 1 - Math.pow(0.001, delta);

    meshRef.current.position.x = THREE.MathUtils.lerp(
      meshRef.current.position.x,
      targetPos.x,
      lerp
    );
    meshRef.current.position.y = THREE.MathUtils.lerp(
      meshRef.current.position.y,
      targetPos.y + (hovered && offset === 0 ? 0.15 : 0),
      lerp
    );
    meshRef.current.position.z = THREE.MathUtils.lerp(
      meshRef.current.position.z,
      targetPos.z + (hovered && offset === 0 ? 0.4 : 0),
      lerp
    );
    meshRef.current.rotation.y = THREE.MathUtils.lerp(
      meshRef.current.rotation.y,
      targetRotY,
      lerp
    );
    const s = targetScale + (hovered && offset === 0 ? 0.04 : 0);
    meshRef.current.scale.setScalar(
      THREE.MathUtils.lerp(meshRef.current.scale.x, s, lerp)
    );

    materialRef.current.opacity = THREE.MathUtils.lerp(
      materialRef.current.opacity,
      targetOpacity,
      lerp
    );
  });

  const color = useMemo(() => new THREE.Color(project.color), [project.color]);

  // 라운드 사각형
  const geometry = useMemo(() => {
    const shape = new THREE.Shape();
    const r = 0.08;
    const w = cardWidth / 2;
    const h = cardHeight / 2;
    shape.moveTo(-w + r, -h);
    shape.lineTo(w - r, -h);
    shape.quadraticCurveTo(w, -h, w, -h + r);
    shape.lineTo(w, h - r);
    shape.quadraticCurveTo(w, h, w - r, h);
    shape.lineTo(-w + r, h);
    shape.quadraticCurveTo(-w, h, -w, h - r);
    shape.lineTo(-w, -h + r);
    shape.quadraticCurveTo(-w, -h, -w + r, -h);
    return new THREE.ShapeGeometry(shape);
  }, [cardWidth, cardHeight]);

  // 테두리 라인
  const borderPoints = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const r = 0.08;
    const w = cardWidth / 2;
    const h = cardHeight / 2;
    const segments = 8;
    // bottom-left to bottom-right
    pts.push(new THREE.Vector3(-w + r, -h, 0));
    pts.push(new THREE.Vector3(w - r, -h, 0));
    for (let i = 0; i <= segments; i++) {
      const a = -Math.PI / 2 + (Math.PI / 2) * (i / segments);
      pts.push(new THREE.Vector3(w - r + r * Math.cos(a), -h + r + r * Math.sin(a), 0));
    }
    pts.push(new THREE.Vector3(w, h - r, 0));
    for (let i = 0; i <= segments; i++) {
      const a = 0 + (Math.PI / 2) * (i / segments);
      pts.push(new THREE.Vector3(w - r + r * Math.cos(a), h - r + r * Math.sin(a), 0));
    }
    pts.push(new THREE.Vector3(-w + r, h, 0));
    for (let i = 0; i <= segments; i++) {
      const a = Math.PI / 2 + (Math.PI / 2) * (i / segments);
      pts.push(new THREE.Vector3(-w + r + r * Math.cos(a), h - r + r * Math.sin(a), 0));
    }
    pts.push(new THREE.Vector3(-w, -h + r, 0));
    for (let i = 0; i <= segments; i++) {
      const a = Math.PI + (Math.PI / 2) * (i / segments);
      pts.push(new THREE.Vector3(-w + r + r * Math.cos(a), -h + r + r * Math.sin(a), 0));
    }
    return pts;
  }, [cardWidth, cardHeight]);

  const borderGeo = useMemo(
    () => new THREE.BufferGeometry().setFromPoints(borderPoints),
    [borderPoints]
  );

  const isActive = offset === 0;

  return (
    <group ref={meshRef}>
      {/* 카드 배경 — 클릭/호버 이벤트는 이 메시에서만 처리 */}
      <mesh
        geometry={geometry}
        onClick={(e) => {
          e.stopPropagation();
          onClick(index);
        }}
        onPointerEnter={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerLeave={() => {
          setHovered(false);
          document.body.style.cursor = "auto";
        }}
      >
        <meshStandardMaterial
          ref={materialRef}
          color="#0a1025"
          transparent
          opacity={1}
        />
      </mesh>

      {/* 상단 프로젝트 컬러 라인 */}
      <mesh position={[0, cardHeight / 2 - 0.04, 0.01]}>
        <planeGeometry args={[cardWidth - 0.3, 0.03]} />
        <meshBasicMaterial color={color} transparent opacity={isActive ? 0.9 : 0.3} />
      </mesh>

      {/* 테두리 */}
      <lineLoop geometry={borderGeo}>
        <lineBasicMaterial
          color={isActive && hovered ? color : new THREE.Color("#3b82f6")}
          transparent
          opacity={isActive ? 0.6 : 0.2}
        />
      </lineLoop>

      {/* 프로젝트 번호 */}
      <Text
        position={[-cardWidth / 2 + 0.25, cardHeight / 2 - 0.35, 0.01]}
        fontSize={0.12}
        color="#64748b"
        anchorX="left"
        fontWeight={400}
      >
        {`0${index + 1}`}
      </Text>

      {/* 프로젝트 제목 */}
      <Text
        position={[-cardWidth / 2 + 0.25, 0.2, 0.01]}
        fontSize={isMobile ? 0.15 : 0.2}
        color={isActive ? "#e2e8f0" : "#64748b"}
        anchorX="left"
        maxWidth={cardWidth - 0.5}
        fontWeight={400}
      >
        {project.title}
      </Text>

      {/* 설명 (활성 카드만) */}
      {isActive && (
        <Text
          position={[-cardWidth / 2 + 0.25, -0.2, 0.01]}
          fontSize={0.11}
          color="#64748b"
          anchorX="left"
          maxWidth={cardWidth - 0.5}
          lineHeight={1.5}
          fontWeight={400}
        >
          {project.description.length > 60
            ? project.description.slice(0, 60) + "..."
            : project.description}
        </Text>
      )}

      {/* 기술 스택 도트 */}
      {isActive &&
        project.techStack.slice(0, 4).map((_, i) => (
          <mesh
            key={i}
            position={[
              -cardWidth / 2 + 0.3 + i * 0.2,
              -cardHeight / 2 + 0.3,
              0.01,
            ]}
          >
            <circleGeometry args={[0.04, 16]} />
            <meshBasicMaterial color={color} transparent opacity={0.6} />
          </mesh>
        ))}
    </group>
  );
}

// ─── 배경 그리드 라인 ───────────────────────────────────

function BackgroundGrid() {
  const gridLines = useMemo(() => {
    const lines: THREE.Vector3[][] = [];
    const range = 12;
    const step = 1.5;
    for (let x = -range; x <= range; x += step) {
      lines.push([
        new THREE.Vector3(x, -4, -6),
        new THREE.Vector3(x, 4, -6),
      ]);
    }
    for (let y = -4; y <= 4; y += step) {
      lines.push([
        new THREE.Vector3(-range, y, -6),
        new THREE.Vector3(range, y, -6),
      ]);
    }
    return lines;
  }, []);

  return (
    <group>
      {gridLines.map((pts, i) => (
        <line key={i}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[new Float32Array(pts.flatMap((p) => [p.x, p.y, p.z])), 3]}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#1e3a5f" transparent opacity={0.12} />
        </line>
      ))}
    </group>
  );
}

// ─── 씬 내부 (카메라 + 카드) ────────────────────────────

interface GallerySceneProps {
  projects: Project[];
  activeIndex: number;
  onCardClick: (index: number) => void;
  isMobile: boolean;
}

function GalleryScene({
  projects,
  activeIndex,
  onCardClick,
  isMobile,
}: GallerySceneProps) {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(0, -0.2, isMobile ? 6.5 : 6);
    camera.lookAt(0, -0.2, 0);
  }, [camera, isMobile]);

  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[5, 5, 5]} intensity={0.3} />
      <BackgroundGrid />
      {projects.map((project, i) => (
        <ProjectCard3D
          key={project.id}
          project={project}
          index={i}
          activeIndex={activeIndex}

          onClick={onCardClick}
          isMobile={isMobile}
        />
      ))}
    </>
  );
}

// ─── 메인 갤러리 (Canvas + ScrollTrigger) ───────────────

interface ProjectGallery3DProps {
  projects: Project[];
  activeIndex: number;
  setActiveIndex: (index: number) => void;
  onProjectClick: (index: number) => void;
  sectionRef: React.RefObject<HTMLElement | null>;
}

export default function ProjectGallery3D({
  projects,
  activeIndex,
  setActiveIndex,
  onProjectClick,
  sectionRef,
}: ProjectGallery3DProps) {
  const isMobile = useMediaQuery("(max-width: 768px)");

  // GSAP ScrollTrigger — 스크롤로 activeIndex 변경
  useEffect(() => {
    if (!sectionRef.current) return;

    const trigger = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: "top top",
      end: `+=${window.innerHeight * (projects.length - 1)}`,
      pin: true,
      scrub: 0.8,
      onUpdate: (self) => {
        const idx = Math.round(self.progress * (projects.length - 1));
        setActiveIndex(idx);
      },
    });

    return () => {
      trigger.kill();
    };
  }, [projects.length, sectionRef, setActiveIndex]);

  const handleCardClick = (index: number) => {
    if (index === activeIndex) {
      onProjectClick(index);
    } else {
      setActiveIndex(index);
    }
  };

  return (
    <div className="h-screen w-full">
      <Canvas
        dpr={isMobile ? [1, 1.5] : [1, 2]}
        gl={{ antialias: true, alpha: true }}
        camera={{ fov: 45, near: 0.1, far: 50 }}
        onPointerMissed={() => { }}
      >
        <GalleryScene
          projects={projects}
          activeIndex={activeIndex}
          onCardClick={handleCardClick}
          isMobile={isMobile}
        />
      </Canvas>
    </div>
  );
}