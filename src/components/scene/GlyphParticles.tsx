"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { MeshSurfaceSampler } from "three/addons/math/MeshSurfaceSampler.js";
import { useFrame } from "@react-three/fiber";
import {
  ATLAS_COLUMNS,
  ATLAS_ROWS,
  CODE_CORPUS,
  createGlyphAtlasTexture,
  glyphIndexForCharacterCode,
} from "@/components/scene/glyphAtlas";
import {
  GLYPH_FRAGMENT_SHADER,
  GLYPH_VERTEX_SHADER,
  STREAM_DEPTH_FAR,
  STREAM_DEPTH_NEAR,
  STREAM_HALF_WIDTH,
} from "@/components/scene/glyphShaders";
import {
  PART_COUNT,
  THEME_ONLY_KEY,
} from "@/components/scene/partDefinitions";
import {
  FIELD_OF_VIEW,
  computeViewportUnits,
  createViewportUnits,
  resolveSceneProfile,
} from "@/components/scene/sceneLayout";
import { sceneState } from "@/components/scene/sceneState";
import {
  computeClumpCenter,
  createScenePhases,
  samplePhases,
  type ClumpCenter,
} from "@/components/scene/sectionChoreography";
import {
  SCENE_PALETTES,
  type ScenePalette,
  type ThemeName,
} from "@/components/scene/themePalette";
import type { PartSet } from "@/components/scene/usePartGroups";
import {
  WAVE_COLUMNS,
  configureWaveSurface,
  resetWaveSurface,
  stepWaveSurface,
  waveSurface,
} from "@/components/scene/waveSurface";

interface GlyphParticlesProps {
  parts: PartSet;
  themeName: ThemeName;
  isMobile: boolean;
}

const MAX_FRAME_DELTA = 0.1;
const COLOR_FOLLOW_SPEED = 4;
// 커서가 멈추면 에너지가 반 초 정도에 걸쳐 빠지면서 파도도 잦아든다
const POINTER_ENERGY_DECAY = 2.5;
// 웅덩이의 가로세로 비율 근사값. 격자 칸을 정사각형에 가깝게 만드는 데만 쓴다
const POOL_ASPECT = 6.5;

interface ParticleLayout {
  columnCount: number;
  slotsPerColumn: number;
  poolMemberCount: number;
}

const DESKTOP_LAYOUT: ParticleLayout = {
  columnCount: 112,
  slotsPerColumn: 104,
  poolMemberCount: 5200,
};
const MOBILE_LAYOUT: ParticleLayout = {
  columnCount: 48,
  slotsPerColumn: 84,
  poolMemberCount: 1800,
};

interface SurfaceTarget {
  x: number;
  y: number;
  z: number;
  partIndex: number;
}

function computeSurfaceArea(mesh: THREE.Mesh): number {
  const positionAttribute = mesh.geometry.attributes.position;
  const indexAttribute = mesh.geometry.index;
  const triangleCount = indexAttribute
    ? indexAttribute.count / 3
    : positionAttribute.count / 3;
  const vertexA = new THREE.Vector3();
  const vertexB = new THREE.Vector3();
  const vertexC = new THREE.Vector3();
  let area = 0;
  for (
    let triangleIndex = 0;
    triangleIndex < triangleCount;
    triangleIndex += 1
  ) {
    const offset = triangleIndex * 3;
    const indexA = indexAttribute ? indexAttribute.getX(offset) : offset;
    const indexB = indexAttribute
      ? indexAttribute.getX(offset + 1)
      : offset + 1;
    const indexC = indexAttribute
      ? indexAttribute.getX(offset + 2)
      : offset + 2;
    vertexA.fromBufferAttribute(positionAttribute, indexA);
    vertexB.fromBufferAttribute(positionAttribute, indexB);
    vertexC.fromBufferAttribute(positionAttribute, indexC);
    area += vertexB.sub(vertexA).cross(vertexC.sub(vertexA)).length() * 0.5;
  }
  return area;
}

// 부품 표면에서 넓이에 비례하는 수의 목표점을 뽑는다. 부품 로컬 좌표라서 부품이 어디에 있든 쓸 수 있다
function sampleSurfaceTargets(
  groups: THREE.Group[],
  totalCount: number,
): SurfaceTarget[] {
  const meshEntries: { mesh: THREE.Mesh; partIndex: number; area: number }[] =
    [];
  groups.forEach((group, partIndex) => {
    group.children.forEach((child) => {
      // 한쪽 테마에서만 보이는 메시는 뺀다. 입자가 보이지 않는 표면에 내려앉으면 안 된다
      if (child instanceof THREE.Mesh && !child.userData[THEME_ONLY_KEY]) {
        child.updateMatrix();
        meshEntries.push({
          mesh: child,
          partIndex,
          area: computeSurfaceArea(child),
        });
      }
    });
  });
  const totalArea = meshEntries.reduce((sum, entry) => sum + entry.area, 0);

  const targets: SurfaceTarget[] = [];
  const sampledPosition = new THREE.Vector3();
  meshEntries.forEach((entry) => {
    const sampler = new MeshSurfaceSampler(entry.mesh).build();
    const sampleCount = Math.max(
      12,
      Math.round((entry.area / totalArea) * totalCount),
    );
    for (let sampleIndex = 0; sampleIndex < sampleCount; sampleIndex += 1) {
      sampler.sample(sampledPosition);
      sampledPosition.applyMatrix4(entry.mesh.matrix);
      targets.push({
        x: sampledPosition.x,
        y: sampledPosition.y,
        z: sampledPosition.z,
        partIndex: entry.partIndex,
      });
    }
  });
  // 같은 기둥의 글자가 한 부품으로만 몰리지 않게 섞는다
  for (let index = targets.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [targets[index], targets[swapIndex]] = [targets[swapIndex], targets[index]];
  }
  return targets;
}

function createParticleGeometry(
  layout: ParticleLayout,
  groups: THREE.Group[],
): THREE.BufferGeometry {
  const particleCount = layout.columnCount * layout.slotsPerColumn;
  const targets = sampleSurfaceTargets(groups, particleCount);
  const streamAttribute = new Float32Array(particleCount * 3);
  const randomAttribute = new Float32Array(particleCount * 4);
  const targetAttribute = new Float32Array(particleCount * 3);
  const glyphAttribute = new Float32Array(particleCount);

  for (
    let columnIndex = 0;
    columnIndex < layout.columnCount;
    columnIndex += 1
  ) {
    const columnX = (Math.random() * 2 - 1) * STREAM_HALF_WIDTH;
    const columnZ =
      STREAM_DEPTH_FAR +
      Math.pow(Math.random(), 0.8) * (STREAM_DEPTH_NEAR - STREAM_DEPTH_FAR);
    const columnSpeed = 0.012 + Math.random() * 0.03;
    const corpusOffset = Math.floor(Math.random() * CODE_CORPUS.length);

    for (let slotIndex = 0; slotIndex < layout.slotsPerColumn; slotIndex += 1) {
      const particleIndex = columnIndex * layout.slotsPerColumn + slotIndex;
      const target = targets[particleIndex % targets.length];

      streamAttribute[particleIndex * 3] = columnX;
      streamAttribute[particleIndex * 3 + 1] =
        slotIndex / layout.slotsPerColumn;
      streamAttribute[particleIndex * 3 + 2] = columnZ;

      randomAttribute[particleIndex * 4] = columnSpeed;
      randomAttribute[particleIndex * 4 + 1] = Math.random();
      randomAttribute[particleIndex * 4 + 2] = target.partIndex;
      randomAttribute[particleIndex * 4 + 3] = columnIndex / layout.columnCount;

      targetAttribute[particleIndex * 3] = target.x;
      targetAttribute[particleIndex * 3 + 1] = target.y;
      targetAttribute[particleIndex * 3 + 2] = target.z;

      // 기둥이 위로 올라가도 위에서 아래로 읽히도록 위쪽 칸일수록 앞 글자를 둔다
      const corpusIndex =
        (corpusOffset + (layout.slotsPerColumn - 1 - slotIndex)) %
        CODE_CORPUS.length;
      glyphAttribute[particleIndex] = glyphIndexForCharacterCode(
        CODE_CORPUS.charCodeAt(corpusIndex),
      );
    }
  }

  // 웅덩이에 들어가는 입자만 육각 격자에 배치한다. 나머지는 웅덩이로 변할 때 사라진다
  const poolAttribute = new Float32Array(particleCount * 3);
  const poolMetaAttribute = new Float32Array(particleCount * 2);
  const shuffledIndices = Array.from(
    { length: particleCount },
    (_, index) => index,
  );
  for (let index = shuffledIndices.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffledIndices[index], shuffledIndices[swapIndex]] = [
      shuffledIndices[swapIndex],
      shuffledIndices[index],
    ];
  }
  const poolMemberCount = Math.min(layout.poolMemberCount, particleCount);
  const poolGridColumns = Math.round(Math.sqrt(poolMemberCount * POOL_ASPECT));
  const poolGridRows = Math.ceil(poolMemberCount / poolGridColumns);
  shuffledIndices.forEach((particleIndex, order) => {
    const isMember = order < poolMemberCount;
    const gridColumn = order % poolGridColumns;
    const gridRow = Math.floor(order / poolGridColumns);
    const hexOffset = gridRow % 2 === 0 ? 0 : 0.5;
    const jitterX = (Math.random() - 0.5) * 0.5;
    const jitterY = (Math.random() - 0.5) * 0.5;
    poolAttribute[particleIndex * 3] = isMember
      ? ((gridColumn + hexOffset + 0.5 + jitterX) / poolGridColumns) * 2 - 1
      : Math.random() * 2 - 1;
    poolAttribute[particleIndex * 3 + 1] = isMember
      ? (gridRow + 0.5 + jitterY) / poolGridRows
      : Math.random();
    poolAttribute[particleIndex * 3 + 2] = (Math.random() - 0.5) * 0.8;
    poolMetaAttribute[particleIndex * 2] = isMember ? 1 : 0;
    poolMetaAttribute[particleIndex * 2 + 1] = Math.random();
  });

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(new Float32Array(particleCount * 3), 3),
  );
  geometry.setAttribute(
    "aStream",
    new THREE.BufferAttribute(streamAttribute, 3),
  );
  geometry.setAttribute(
    "aRandom",
    new THREE.BufferAttribute(randomAttribute, 4),
  );
  geometry.setAttribute(
    "aTarget",
    new THREE.BufferAttribute(targetAttribute, 3),
  );
  geometry.setAttribute("aGlyph", new THREE.BufferAttribute(glyphAttribute, 1));
  geometry.setAttribute("aPool", new THREE.BufferAttribute(poolAttribute, 3));
  geometry.setAttribute(
    "aPoolMeta",
    new THREE.BufferAttribute(poolMetaAttribute, 2),
  );
  return geometry;
}

function createParticleMaterial(
  partMatrices: THREE.Matrix4[],
  palette: ScenePalette,
): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    blending: palette.additive ? THREE.AdditiveBlending : THREE.NormalBlending,
    uniforms: {
      uTime: { value: 0 },
      uMorph: { value: 0 },
      uFade: { value: 1 },
      uInk: { value: palette.additive ? 0 : 1 },
      uPixelScale: { value: 1 },
      uDotScale: { value: 1 },
      uFrustum: { value: new THREE.Vector2(1, 1) },
      uPointerNdc: { value: new THREE.Vector2(0, 0) },
      uPointerStrength: { value: 0 },
      uAtlas: { value: createGlyphAtlasTexture() },
      uGrid: { value: new THREE.Vector2(ATLAS_COLUMNS, ATLAS_ROWS) },
      uColorDim: { value: new THREE.Color(palette.glyphDim) },
      uColorBright: { value: new THREE.Color(palette.glyphBright) },
      uColorDot: { value: new THREE.Color(palette.dot) },
      uPartMatrices: { value: partMatrices },
      uPool: { value: 0 },
      uPoolHalfWidth: { value: 1 },
      uPoolFloorY: { value: -1 },
      uWaveHeight: { value: waveSurface.heights },
      uWaveVelocity: { value: waveSurface.velocities },
    },
    transparent: true,
    depthWrite: false,
    depthTest: false,
    toneMapped: false,
    defines: { PART_COUNT, WAVE_COLUMNS },
    vertexShader: GLYPH_VERTEX_SHADER,
    fragmentShader: GLYPH_FRAGMENT_SHADER,
  });
}

export default function GlyphParticles({
  parts,
  themeName,
  isMobile,
}: GlyphParticlesProps) {
  const layout = isMobile ? MOBILE_LAYOUT : DESKTOP_LAYOUT;
  const geometry = useMemo(
    () => createParticleGeometry(layout, parts.groups),
    [layout, parts],
  );
  // 색은 테마 전환 때 useFrame이 보간하므로 처음 팔레트만 여기서 심는다
  const [material] = useState(() =>
    createParticleMaterial(parts.matrices, SCENE_PALETTES[themeName]),
  );
  const phases = useMemo(() => createScenePhases(), []);
  const viewport = useMemo(() => createViewportUnits(), []);
  const clumpCenter = useMemo<ClumpCenter>(
    () => ({ x: 0, y: 0, scale: 1 }),
    [],
  );
  const targetColor = useMemo(() => new THREE.Color(), []);
  const pointsRef = useRef<THREE.Points>(null);
  const configuredViewportKey = useRef("");

  useEffect(() => {
    return () => geometry.dispose();
  }, [geometry]);

  useEffect(() => {
    return () => {
      (material.uniforms.uAtlas.value as THREE.Texture).dispose();
      material.dispose();
    };
  }, [material]);

  // 혼합 모드는 보간할 수 없어서 테마가 바뀌면 즉시 바꾼다. 색은 useFrame에서 보간한다
  useEffect(() => {
    const palette = SCENE_PALETTES[themeName];
    material.blending = palette.additive
      ? THREE.AdditiveBlending
      : THREE.NormalBlending;
    material.uniforms.uInk.value = palette.additive ? 0 : 1;
    material.needsUpdate = true;
  }, [material, themeName]);

  useFrame((state, delta) => {
    // 높이가 0이면 단위 환산이 0으로 나뉘어 NaN이 된다
    if (state.size.height === 0) return;
    const frameDelta = Math.min(delta, MAX_FRAME_DELTA);
    const elapsedTime = state.clock.elapsedTime;
    computeViewportUnits(state.size.width, state.size.height, viewport);
    const profile = resolveSceneProfile(
      isMobile,
      sceneState.layout.contentMarginPixels,
      viewport,
    );
    samplePhases(sceneState.sectionProgress, profile, phases);
    computeClumpCenter(
      phases,
      viewport,
      profile,
      window.scrollY,
      sceneState.layout,
      clumpCenter,
    );

    // 화면 크기가 바뀔 때만 웅덩이 바닥과 너비를 다시 잡는다
    const viewportKey = `${state.size.width}x${state.size.height}`;
    if (viewportKey !== configuredViewportKey.current) {
      configureWaveSurface(viewport);
      material.uniforms.uPoolFloorY.value = waveSurface.floorY;
      material.uniforms.uPoolHalfWidth.value = waveSurface.halfWidth;
      configuredViewportKey.current = viewportKey;
    }

    const tangentHalfFov = Math.tan(((FIELD_OF_VIEW / 2) * Math.PI) / 180);
    const { uniforms } = material;
    uniforms.uTime.value = elapsedTime;
    uniforms.uMorph.value = phases.morph;
    uniforms.uFade.value = phases.particleFade;
    uniforms.uPool.value = phases.pool;
    uniforms.uDotScale.value = clumpCenter.scale * (isMobile ? 1.5 : 1);
    uniforms.uFrustum.value.set(
      tangentHalfFov * (state.size.width / state.size.height),
      tangentHalfFov,
    );
    uniforms.uPixelScale.value =
      (state.size.height * state.gl.getPixelRatio()) / (2 * tangentHalfFov);
    uniforms.uPointerNdc.value.set(sceneState.pointer.x, sceneState.pointer.y);
    uniforms.uPointerStrength.value +=
      ((sceneState.pointerActive ? 1 : 0) - uniforms.uPointerStrength.value) *
      (1 - Math.exp(-frameDelta * 8));

    const palette = SCENE_PALETTES[themeName];
    const blendRatio = 1 - Math.exp(-frameDelta * COLOR_FOLLOW_SPEED);
    uniforms.uColorDim.value.lerp(
      targetColor.set(palette.glyphDim),
      blendRatio,
    );
    uniforms.uColorBright.value.lerp(
      targetColor.set(palette.glyphBright),
      blendRatio,
    );
    uniforms.uColorDot.value.lerp(targetColor.set(palette.dot), blendRatio);

    // 파도. 커서 에너지는 여기서 줄이고, 글자 출렁임을 위해 진행도를 waveSurface에 남긴다
    const pointerActivity = sceneState.pointerActive
      ? Math.min(sceneState.pointerEnergy, 1)
      : 0;
    sceneState.pointerEnergy *= Math.exp(-frameDelta * POINTER_ENERGY_DECAY);
    waveSurface.pool = phases.pool;
    if (phases.pool > 0.001) {
      stepWaveSurface(
        frameDelta,
        elapsedTime,
        sceneState.pointer.x * viewport.halfWidth,
        sceneState.pointer.y * viewport.halfHeight,
        pointerActivity,
        viewport.halfHeight * 2,
      );
    } else if (waveSurface.velocities[0] !== 0) {
      resetWaveSurface();
    }

    if (pointsRef.current) {
      pointsRef.current.visible = phases.particleFade > 0.001;
    }
  });

  return (
    <points
      ref={pointsRef}
      geometry={geometry}
      material={material}
      frustumCulled={false}
      renderOrder={2}
    />
  );
}
