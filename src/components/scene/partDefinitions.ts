import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

// highlight는 포인트 색(라임)이라 작은 요소에만 쓴다. bright는 테마가 바뀌어도 밝게 남는 색이다
export type PartRole =
  | "neutral"
  | "contrast"
  | "accent"
  | "highlight"
  | "bright";
export type PartMaterials = Record<PartRole, THREE.MeshPhysicalMaterial>;

export interface PartDefinition {
  key: string;
  create: (materials: PartMaterials) => THREE.Group;
  // 옆 배치에서 화면 끝에서 얼마나 들여놓을지 정하는 부품의 반너비 (장면 단위)
  halfWidth: number;
  // 뭉쳤을 때 중심에서의 상대 위치
  clump: [number, number, number];
  rotation: [number, number, number];
  // 옆 배치의 방향(-1 왼쪽, 1 오른쪽), 세로 비율, 깊이
  side: [number, number, number];
  // 문구 사이 배치의 빈 공간 번호(0은 About과 Stack 사이)와 좌우
  gap: [number, -1 | 1];
}

const UP_DIRECTION = new THREE.Vector3(0, 1, 0);

// 한쪽 테마에서만 보이는 메시에 붙이는 표식. UiParts가 테마에 맞춰 보이기를 바꾸고, 입자는 이런 메시에 내려앉지 않는다
export const THEME_ONLY_KEY = "themeOnly";
export type ThemeOnly = "light" | "dark";

function showOnlyIn(meshes: THREE.Mesh[], themeOnly: ThemeOnly) {
  meshes.forEach((mesh) => {
    mesh.userData[THEME_ONLY_KEY] = themeOnly;
  });
}

function addMesh(
  group: THREE.Group,
  geometry: THREE.BufferGeometry,
  material: THREE.Material,
  position: [number, number, number] = [0, 0, 0],
  rotation: [number, number, number] = [0, 0, 0],
): THREE.Mesh {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(...position);
  mesh.rotation.set(...rotation);
  group.add(mesh);
  return mesh;
}

function addCapsuleBetween(
  group: THREE.Group,
  material: THREE.Material,
  start: [number, number],
  end: [number, number],
  radius: number,
  depth = 0,
): THREE.Mesh {
  const startPoint = new THREE.Vector3(start[0], start[1], depth);
  const endPoint = new THREE.Vector3(end[0], end[1], depth);
  const direction = endPoint.clone().sub(startPoint);
  const mesh = new THREE.Mesh(
    new THREE.CapsuleGeometry(radius, direction.length(), 8, 16),
    material,
  );
  mesh.position.copy(startPoint).add(endPoint).multiplyScalar(0.5);
  mesh.quaternion.setFromUnitVectors(UP_DIRECTION, direction.normalize());
  group.add(mesh);
  return mesh;
}

function createBrowserWindow(materials: PartMaterials): THREE.Group {
  const group = new THREE.Group();
  addMesh(
    group,
    new RoundedBoxGeometry(3.0, 2.0, 0.22, 5, 0.16),
    materials.neutral,
  );
  const dotGeometry = new THREE.SphereGeometry(0.075, 16, 16);
  addMesh(group, dotGeometry, materials.accent, [-1.23, 0.77, 0.13]);
  addMesh(group, dotGeometry, materials.contrast, [-1.02, 0.77, 0.13]);
  addMesh(group, dotGeometry, materials.contrast, [-0.8, 0.77, 0.13]);
  addMesh(
    group,
    new RoundedBoxGeometry(1.58, 0.17, 0.06, 3, 0.08),
    materials.contrast,
    [0.38, 0.77, 0.12],
  );
  addMesh(
    group,
    new RoundedBoxGeometry(1.12, 0.96, 0.08, 3, 0.1),
    materials.accent,
    [-0.75, -0.18, 0.13],
  );
  addMesh(
    group,
    new RoundedBoxGeometry(1.2, 0.14, 0.06, 3, 0.06),
    materials.contrast,
    [0.68, 0.17, 0.12],
  );
  addMesh(
    group,
    new RoundedBoxGeometry(1.2, 0.14, 0.06, 3, 0.06),
    materials.contrast,
    [0.68, -0.12, 0.12],
  );
  addMesh(
    group,
    new RoundedBoxGeometry(0.75, 0.14, 0.06, 3, 0.06),
    materials.contrast,
    [0.45, -0.4, 0.12],
  );
  return group;
}

interface DeviceSpec {
  center: [number, number, number];
  // 기기 몸체의 너비와 높이
  size: [number, number];
  cornerRadius: number;
  // 넓은 화면은 그림과 글줄이 나란히, 좁은 화면은 위아래로 쌓인다
  stacked: boolean;
}

// 기기 하나. 몸체, 화면, 그리고 화면 안의 같은 레이아웃(상단 바, 그림 블록, 글줄, 버튼)이다
function addDevice(
  group: THREE.Group,
  materials: PartMaterials,
  { center, size, cornerRadius, stacked }: DeviceSpec,
) {
  const [centerX, centerY, centerZ] = center;
  const [bodyWidth, bodyHeight] = size;
  const bezel = 0.07;
  const screenWidth = bodyWidth - bezel * 2;
  const screenHeight = bodyHeight - bezel * 2;
  addMesh(
    group,
    new RoundedBoxGeometry(bodyWidth, bodyHeight, 0.12, 4, cornerRadius),
    materials.neutral,
    center,
  );
  addMesh(
    group,
    new RoundedBoxGeometry(screenWidth, screenHeight, 0.04, 3, 0.04),
    materials.contrast,
    [centerX, centerY, centerZ + 0.06],
  );

  const contentZ = centerZ + 0.095;
  const padding = screenWidth * 0.08;
  const contentWidth = screenWidth - padding * 2;
  const contentLeft = centerX - contentWidth / 2;
  const barHeight = screenHeight * 0.09;
  const barY = centerY + screenHeight / 2 - padding - barHeight / 2;
  const addBlock = (
    material: THREE.Material,
    left: number,
    top: number,
    width: number,
    height: number,
  ) => {
    addMesh(
      group,
      new RoundedBoxGeometry(width, height, 0.04, 2, Math.min(0.03, height / 3)),
      material,
      [left + width / 2, top - height / 2, contentZ],
    );
  };
  addBlock(
    materials.neutral,
    contentLeft,
    barY + barHeight / 2,
    contentWidth,
    barHeight,
  );

  const bodyTop = barY - barHeight / 2 - padding;
  const bodyBottom = centerY - screenHeight / 2 + padding;
  const bodyHeightAvailable = bodyTop - bodyBottom;
  const lineHeight = Math.min(0.08, bodyHeightAvailable * 0.1);
  if (stacked) {
    const heroHeight = bodyHeightAvailable * 0.45;
    addBlock(materials.accent, contentLeft, bodyTop, contentWidth, heroHeight);
    const linesTop = bodyTop - heroHeight - padding;
    addBlock(materials.neutral, contentLeft, linesTop, contentWidth, lineHeight);
    addBlock(
      materials.neutral,
      contentLeft,
      linesTop - lineHeight * 2,
      contentWidth * 0.7,
      lineHeight,
    );
    addBlock(
      materials.highlight,
      contentLeft,
      bodyBottom + lineHeight * 1.6,
      contentWidth * 0.5,
      lineHeight * 1.6,
    );
  } else {
    const heroWidth = contentWidth * 0.46;
    addBlock(
      materials.accent,
      contentLeft,
      bodyTop,
      heroWidth,
      bodyHeightAvailable,
    );
    const linesLeft = contentLeft + heroWidth + padding;
    const linesWidth = contentWidth - heroWidth - padding;
    addBlock(materials.neutral, linesLeft, bodyTop, linesWidth, lineHeight);
    addBlock(
      materials.neutral,
      linesLeft,
      bodyTop - lineHeight * 2,
      linesWidth,
      lineHeight,
    );
    addBlock(
      materials.neutral,
      linesLeft,
      bodyTop - lineHeight * 4,
      linesWidth * 0.6,
      lineHeight,
    );
    addBlock(
      materials.highlight,
      linesLeft,
      bodyBottom + lineHeight * 1.8,
      linesWidth * 0.5,
      lineHeight * 1.8,
    );
  }
}

// 반응형 기기 묶음. 모니터, 태블릿, 휴대폰이 앞으로 나오며 겹쳐 있고 세 화면에 같은 레이아웃이 크기에 맞게 들어 있다
function createResponsiveDevices(materials: PartMaterials): THREE.Group {
  const group = new THREE.Group();
  const monitorX = -0.4;
  addDevice(group, materials, {
    center: [monitorX, 0.22, -0.2],
    size: [2.0, 1.3],
    cornerRadius: 0.1,
    stacked: false,
  });
  // 모니터 받침
  addMesh(
    group,
    new RoundedBoxGeometry(0.22, 0.34, 0.1, 3, 0.04),
    materials.neutral,
    [monitorX, -0.58, -0.25],
  );
  addMesh(
    group,
    new RoundedBoxGeometry(0.9, 0.1, 0.42, 3, 0.05),
    materials.neutral,
    [monitorX, -0.78, -0.2],
  );
  addDevice(group, materials, {
    center: [0.68, -0.18, 0.2],
    size: [0.92, 1.24],
    cornerRadius: 0.1,
    stacked: true,
  });
  addDevice(group, materials, {
    center: [1.24, -0.36, 0.55],
    size: [0.5, 0.94],
    cornerRadius: 0.09,
    stacked: true,
  });
  return group;
}

// 모달. 내용이 있는 페이지 한가운데에 제목 바와 닫기(X), 본문, 버튼을 가진 창이 떠 있다
function createModal(materials: PartMaterials): THREE.Group {
  const group = new THREE.Group();
  // 뒤의 페이지. 창 둘레로 상단 바와 카드가 비쳐 보여야 빈 판이 아니라 페이지로 읽힌다
  const pageDepth = -0.28;
  addMesh(
    group,
    new RoundedBoxGeometry(2.5, 1.8, 0.1, 4, 0.05),
    materials.neutral,
    [0, 0, pageDepth],
  );
  const pageContentDepth = pageDepth + 0.06;
  addMesh(
    group,
    new RoundedBoxGeometry(2.2, 0.1, 0.04, 2, 0.02),
    materials.contrast,
    [0, 0.74, pageContentDepth],
  );
  const pageCards: [number, number][] = [
    [-0.78, -0.72],
    [0, -0.72],
    [0.78, -0.72],
  ];
  pageCards.forEach(([cardX, cardY]) => {
    addMesh(
      group,
      new RoundedBoxGeometry(0.64, 0.16, 0.04, 2, 0.03),
      materials.accent,
      [cardX, cardY, pageContentDepth],
    );
  });

  // 떠 있는 창
  const windowDepth = 0.12;
  const windowFront = windowDepth + 0.08;
  addMesh(
    group,
    new RoundedBoxGeometry(1.9, 1.2, 0.16, 5, 0.08),
    materials.contrast,
    [0, -0.02, windowDepth],
  );
  // 제목 바
  addMesh(
    group,
    new RoundedBoxGeometry(1.9, 0.3, 0.2, 5, 0.08),
    materials.accent,
    [0, 0.43, windowDepth + 0.01],
  );
  const headerFront = windowDepth + 0.11;
  addMesh(
    group,
    new RoundedBoxGeometry(0.7, 0.08, 0.04, 2, 0.03),
    materials.bright,
    [-0.48, 0.43, headerFront + 0.01],
  );
  addCapsuleBetween(
    group,
    materials.bright,
    [0.71, 0.5],
    [0.85, 0.36],
    0.028,
    headerFront + 0.02,
  );
  addCapsuleBetween(
    group,
    materials.bright,
    [0.85, 0.5],
    [0.71, 0.36],
    0.028,
    headerFront + 0.02,
  );
  // 본문 두 줄
  addMesh(
    group,
    new RoundedBoxGeometry(1.55, 0.09, 0.04, 2, 0.03),
    materials.neutral,
    [-0.02, 0.12, windowFront + 0.01],
  );
  addMesh(
    group,
    new RoundedBoxGeometry(1.1, 0.09, 0.04, 2, 0.03),
    materials.neutral,
    [-0.245, -0.06, windowFront + 0.01],
  );
  // 창 안쪽 오른쪽 아래의 취소와 확인 버튼
  addMesh(
    group,
    new RoundedBoxGeometry(0.5, 0.2, 0.08, 3, 0.07),
    materials.neutral,
    [0.0, -0.4, windowFront + 0.02],
  );
  addMesh(
    group,
    new RoundedBoxGeometry(0.5, 0.2, 0.08, 3, 0.07),
    materials.highlight,
    [0.58, -0.4, windowFront + 0.02],
  );
  return group;
}

// 초승달. 큰 원에서 비스듬히 놓인 작은 원을 뺀 모양을 두께를 줘서 세운다
function createCrescentGeometry(): THREE.BufferGeometry {
  const outerRadius = 0.3;
  const innerRadius = 0.25;
  const innerCenter = new THREE.Vector2(0.13, 0.07);
  const centerDistance = innerCenter.length();
  // 두 원이 만나는 두 점
  const alongDistance =
    (outerRadius * outerRadius -
      innerRadius * innerRadius +
      centerDistance * centerDistance) /
    (2 * centerDistance);
  const sideDistance = Math.sqrt(
    outerRadius * outerRadius - alongDistance * alongDistance,
  );
  const direction = innerCenter.clone().normalize();
  const normal = new THREE.Vector2(-direction.y, direction.x);
  const upperPoint = direction
    .clone()
    .multiplyScalar(alongDistance)
    .addScaledVector(normal, sideDistance);
  const lowerPoint = direction
    .clone()
    .multiplyScalar(alongDistance)
    .addScaledVector(normal, -sideDistance);

  const shape = new THREE.Shape();
  shape.moveTo(upperPoint.x, upperPoint.y);
  // 바깥 원은 달의 등 쪽으로, 안쪽 원은 같은 쪽으로 되돌아오며 파인 면을 만든다
  shape.absarc(
    0,
    0,
    outerRadius,
    Math.atan2(upperPoint.y, upperPoint.x),
    Math.atan2(lowerPoint.y, lowerPoint.x),
    false,
  );
  shape.absarc(
    innerCenter.x,
    innerCenter.y,
    innerRadius,
    Math.atan2(lowerPoint.y - innerCenter.y, lowerPoint.x - innerCenter.x),
    Math.atan2(upperPoint.y - innerCenter.y, upperPoint.x - innerCenter.x),
    true,
  );
  return new THREE.ExtrudeGeometry(shape, {
    depth: 0.08,
    bevelEnabled: true,
    bevelSize: 0.025,
    bevelThickness: 0.025,
    bevelSegments: 3,
    curveSegments: 32,
  });
}

// 양 끝이 반원인 알약 윤곽을 두께만큼 밀어 올린다. RoundedBoxGeometry는 반지름이 두께의 절반으로 제한되어 알약이 되지 않는다
function createPillGeometry(
  width: number,
  height: number,
  depth: number,
): THREE.BufferGeometry {
  const bevel = Math.min(0.06, depth / 3);
  const endRadius = height / 2 - bevel;
  const straightHalf = width / 2 - height / 2;
  const shape = new THREE.Shape();
  shape.moveTo(-straightHalf, -endRadius);
  shape.lineTo(straightHalf, -endRadius);
  shape.absarc(straightHalf, 0, endRadius, -Math.PI / 2, Math.PI / 2, false);
  shape.lineTo(-straightHalf, endRadius);
  shape.absarc(-straightHalf, 0, endRadius, Math.PI / 2, -Math.PI / 2, false);
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: depth - bevel * 2,
    bevelEnabled: true,
    bevelSize: bevel,
    bevelThickness: bevel,
    bevelSegments: 4,
    curveSegments: 32,
  });
  // 밀어 올린 두께의 가운데가 원점에 오게 한다
  geometry.translate(0, 0, -(depth - bevel * 2) / 2);
  return geometry;
}

// 구름 하나를 이루는 구들의 [x, y, 반지름]
const CLOUD_PUFFS: [number, number, number][] = [
  [-0.13, -0.02, 0.09],
  [-0.02, 0.04, 0.13],
  [0.11, 0.01, 0.1],
  [0.04, -0.05, 0.09],
];
const TOGGLE_CLOUDS: [number, number][] = [
  [-0.28, -0.17],
  [0.22, 0.2],
];
const TOGGLE_STARS: [number, number][] = [
  [-0.62, -0.3],
  [-0.45, 0.3],
  [-0.05, 0.33],
  [0.1, -0.32],
  [0.5, -0.12],
  [-1.2, -0.28],
];

const SUN_RAY_COUNT = 8;

// 테마 토글. 알약형 트레이 안에 하늘이 있고 왼쪽에 초승달(라이트 모드에서는 해), 가운데에 구름과 별,
// 오른쪽에 원통 손잡이가 있다
function createThemeToggle(materials: PartMaterials): THREE.Group {
  const group = new THREE.Group();
  addMesh(
    group,
    createPillGeometry(3.0, 1.3, 0.42),
    materials.neutral,
  );
  const skyDepth = 0.23;
  addMesh(
    group,
    createPillGeometry(2.72, 1.02, 0.1),
    materials.accent,
    [0, 0, skyDepth - 0.04],
  );
  const surfaceDepth = skyDepth + 0.01;
  const celestialX = -0.95;
  const moon = addMesh(group, createCrescentGeometry(), materials.highlight, [
    celestialX,
    0.04,
    surfaceDepth,
  ]);
  showOnlyIn([moon], "dark");

  const sunMeshes: THREE.Mesh[] = [];
  const sunCore = addMesh(
    group,
    new THREE.SphereGeometry(0.19, 24, 24),
    materials.highlight,
    [celestialX, 0, surfaceDepth + 0.04],
  );
  // 하늘 판에 붙은 볼록한 원반처럼 보이게 앞뒤로 누른다
  sunCore.scale.z = 0.5;
  sunMeshes.push(sunCore);
  for (let rayIndex = 0; rayIndex < SUN_RAY_COUNT; rayIndex += 1) {
    const angle = (rayIndex / SUN_RAY_COUNT) * Math.PI * 2;
    sunMeshes.push(
      addCapsuleBetween(
        group,
        materials.highlight,
        [celestialX + Math.cos(angle) * 0.27, Math.sin(angle) * 0.27],
        [celestialX + Math.cos(angle) * 0.36, Math.sin(angle) * 0.36],
        0.035,
        surfaceDepth + 0.04,
      ),
    );
  }
  showOnlyIn(sunMeshes, "light");

  TOGGLE_CLOUDS.forEach(([cloudX, cloudY]) => {
    CLOUD_PUFFS.forEach(([puffX, puffY, puffRadius]) => {
      addMesh(
        group,
        new THREE.SphereGeometry(puffRadius, 16, 16),
        materials.bright,
        [cloudX + puffX, cloudY + puffY, surfaceDepth + puffRadius * 0.7],
      );
    });
  });
  const starGeometry = new THREE.SphereGeometry(0.025, 8, 8);
  showOnlyIn(
    TOGGLE_STARS.map(([starX, starY]) =>
      addMesh(group, starGeometry, materials.highlight, [
        starX,
        starY,
        surfaceDepth + 0.01,
      ]),
    ),
    "dark",
  );
  // 원통은 기본 축이 y라서 화면 앞을 보도록 세운다
  addMesh(
    group,
    new THREE.CylinderGeometry(0.4, 0.4, 0.08, 32),
    materials.bright,
    [0.9, 0, surfaceDepth + 0.04],
    [Math.PI / 2, 0, 0],
  );
  addMesh(
    group,
    new THREE.CylinderGeometry(0.34, 0.34, 0.26, 32),
    materials.bright,
    [0.9, 0, surfaceDepth + 0.17],
    [Math.PI / 2, 0, 0],
  );
  return group;
}

// 모서리가 둥글고 면이 살짝 볼록한 상자. 면이 완전히 평평하면 조명을 정면으로 반사할 때 면 전체가 한꺼번에 밝아져
// 네모난 얼룩처럼 보인다. 구의 각 좌표를 거듭제곱해서 만든다(|x/a|^n + |y/b|^n + |z/c|^n = 1). 지수가 클수록 상자에 가깝다
function createPillowGeometry(
  width: number,
  height: number,
  depth: number,
  exponent: number,
): THREE.BufferGeometry {
  const geometry = new THREE.SphereGeometry(1, 64, 48);
  const halfSize = [width / 2, height / 2, depth / 2];
  const positions = geometry.attributes.position;
  const normals = geometry.attributes.normal;
  const normal = new THREE.Vector3();
  for (let vertexIndex = 0; vertexIndex < positions.count; vertexIndex += 1) {
    const direction = [
      positions.getX(vertexIndex),
      positions.getY(vertexIndex),
      positions.getZ(vertexIndex),
    ];
    const point = direction.map(
      (component, axis) =>
        Math.sign(component) *
        Math.abs(component) ** (2 / exponent) *
        halfSize[axis],
    );
    // 이음매에서 정점이 겹치는 구라서 면에서 다시 계산하면 줄이 생긴다. 곡면 식의 기울기로 법선을 직접 구한다
    normal
      .set(
        ...(point.map(
          (component, axis) =>
            (Math.sign(component) *
              Math.abs(component / halfSize[axis]) ** (exponent - 1)) /
            halfSize[axis],
        ) as [number, number, number]),
      )
      .normalize();
    positions.setXYZ(vertexIndex, point[0], point[1], point[2]);
    normals.setXYZ(vertexIndex, normal.x, normal.y, normal.z);
  }
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
  return geometry;
}

function createCheckbox(materials: PartMaterials): THREE.Group {
  const group = new THREE.Group();
  addMesh(group, createPillowGeometry(1.15, 1.15, 0.4, 5), materials.accent);
  // 체크 표시는 파란 바탕 위에 있어서 테마와 상관없이 흰색이어야 읽힌다. contrast는 라이트 모드에서 검정이다
  addCapsuleBetween(
    group,
    materials.bright,
    [-0.3, 0.0],
    [-0.08, -0.24],
    0.075,
    0.23,
  );
  addCapsuleBetween(
    group,
    materials.bright,
    [-0.08, -0.24],
    [0.32, 0.26],
    0.075,
    0.23,
  );
  return group;
}

function createCodeBrackets(materials: PartMaterials): THREE.Group {
  const group = new THREE.Group();
  addCapsuleBetween(group, materials.contrast, [-0.75, 0.42], [-1.2, 0], 0.11);
  addCapsuleBetween(group, materials.contrast, [-1.2, 0], [-0.75, -0.42], 0.11);
  addCapsuleBetween(
    group,
    materials.accent,
    [0.18, 0.55],
    [-0.18, -0.55],
    0.11,
  );
  addCapsuleBetween(group, materials.contrast, [0.75, 0.42], [1.2, 0], 0.11);
  addCapsuleBetween(group, materials.contrast, [1.2, 0], [0.75, -0.42], 0.11);
  return group;
}

// 가장 작은 두 부품(체크박스, 코드 괄호)을 가장 좁은 Work와 Lab 사이에 둔다
export const PART_DEFINITIONS: PartDefinition[] = [
  {
    key: "browser-window",
    create: createBrowserWindow,
    halfWidth: 1.5,
    clump: [0.5, 0.55, -0.6],
    rotation: [-0.25, 0.45, 0.08],
    side: [-1, 0.42, -0.5],
    gap: [0, -1],
  },
  {
    key: "responsive-devices",
    create: createResponsiveDevices,
    halfWidth: 1.5,
    clump: [-2.0, -2.0, 0.9],
    rotation: [0.2, -0.4, -0.06],
    side: [1, -0.52, 0.4],
    gap: [1, 1],
  },
  {
    key: "modal",
    create: createModal,
    halfWidth: 1.25,
    // 앞으로 나와 있어 원근 때문에 더 크게, 더 바깥으로 보인다. 화면 오른쪽 끝에 붙지 않게 x를 덜 준다
    clump: [1.8, -1.9, 1.0],
    // 흩어지면 y로 0.6만큼 더 돌기 때문에, 창이 납작하게 눕지 않도록 반대쪽으로 돌려 둔다
    rotation: [-0.12, -0.3, 0.08],
    side: [-1, -0.5, 0.6],
    gap: [1, -1],
  },
  {
    key: "theme-toggle",
    create: createThemeToggle,
    halfWidth: 1.5,
    clump: [-1.4, 2.65, 0.6],
    // 흩어지면 y로 0.6만큼 더 돌기 때문에, 그때 정면에 가깝게 보이도록 반대쪽으로 돌려 둔다
    rotation: [0.15, -0.4, -0.12],
    // 세로 비율은 맞은편의 브라우저 창과 같은 값이라 둘이 같은 높이에 놓인다
    side: [1, 0.42, 0.2],
    gap: [0, 1],
  },
  {
    key: "checkbox",
    create: createCheckbox,
    halfWidth: 0.6,
    clump: [2.9, 1.9, 0.4],
    rotation: [0.4, -0.5, 0.3],
    // 세로 비율은 맞은편의 코드 괄호와 같은 값이라 둘이 같은 높이에 놓인다
    side: [1, -0.04, -0.3],
    gap: [2, 1],
  },
  {
    key: "code-brackets",
    create: createCodeBrackets,
    halfWidth: 1.2,
    clump: [-3.2, 0.3, -0.2],
    rotation: [0.1, 0.35, 0.12],
    side: [-1, -0.04, 0.1],
    gap: [2, -1],
  },
];

export const PART_COUNT = PART_DEFINITIONS.length;
export const WIDEST_PART_WIDTH =
  Math.max(...PART_DEFINITIONS.map((definition) => definition.halfWidth)) * 2;

// 뭉친 덩어리가 중심에서 좌우로 차지하는 너비 (배율 1 기준). About에서 문구 옆 영역에 맞출 때 쓴다
export const CLUMP_LEFT_EXTENT = Math.max(
  ...PART_DEFINITIONS.map(
    (definition) => definition.halfWidth - definition.clump[0],
  ),
);
export const CLUMP_RIGHT_EXTENT = Math.max(
  ...PART_DEFINITIONS.map(
    (definition) => definition.halfWidth + definition.clump[0],
  ),
);

// 문구 사이 배치에서 세로로 얼마나 차지하는지 알기 위해 기본 회전 상태의 높이를 잰다 (배율 1 기준)
export function measurePartHeight(
  group: THREE.Group,
  definition: PartDefinition,
): number {
  group.rotation.set(...definition.rotation);
  group.updateMatrixWorld(true);
  const bounds = new THREE.Box3().setFromObject(group);
  return bounds.max.y - bounds.min.y;
}
