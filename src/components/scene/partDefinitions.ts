import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

// highlight는 포인트 색(라임)이라 작은 요소에만 쓴다. bright는 테마가 바뀌어도 밝게 남는 색이다
export type PartRole =
  "neutral" | "contrast" | "accent" | "highlight" | "bright";
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

type Vector3Tuple = [number, number, number];

// 한쪽 테마에서만 보이는 메시에 붙이는 표식. UiParts가 테마에 맞춰 보이기를 바꾸고, 입자는 이런 메시에 내려앉지 않는다
export const THEME_ONLY_KEY = "themeOnly";
export type ThemeOnly = "light" | "dark";

// 입자는 부품 그룹의 바로 아래 메시에만 내려앉는다. 메시를 하위 그룹에 넣으면 그 그룹의 변환이 빠진 자리로 날아간다
function addMesh(
  group: THREE.Group,
  geometry: THREE.BufferGeometry,
  material: THREE.Material,
  position: Vector3Tuple = [0, 0, 0],
  rotation: Vector3Tuple = [0, 0, 0],
): THREE.Mesh {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(...position);
  mesh.rotation.set(...rotation);
  group.add(mesh);
  return mesh;
}

// 반지름이 가장 짧은 변의 절반을 넘으면 모서리가 뒤집힌다
function roundedBox(
  width: number,
  height: number,
  depth: number,
  radius: number,
  segments = 3,
): THREE.BufferGeometry {
  return new RoundedBoxGeometry(
    width,
    height,
    depth,
    segments,
    Math.min(radius, width / 2, height / 2, depth / 2),
  );
}

const placementMatrix = new THREE.Matrix4();
const placementRotation = new THREE.Quaternion();
const placementEuler = new THREE.Euler();
const UNIT_SCALE = new THREE.Vector3(1, 1, 1);

// 합치기 전에 조각을 자리에 놓는다. 합친 메시는 하나의 변환만 갖기 때문이다
function placed(
  geometry: THREE.BufferGeometry,
  position: Vector3Tuple,
  rotation: Vector3Tuple = [0, 0, 0],
): THREE.BufferGeometry {
  placementRotation.setFromEuler(placementEuler.set(...rotation));
  placementMatrix.compose(
    new THREE.Vector3(...position),
    placementRotation,
    UNIT_SCALE,
  );
  return geometry.applyMatrix4(placementMatrix);
}

// 같은 재질의 작은 조각은 한 메시로 합친다. 입자는 메시마다 최소 12개씩 내려앉아서 조각이 많으면 그 부품에 입자가 몰린다.
// RoundedBoxGeometry는 인덱스가 없고 관, 구, 원통은 있다. 합치려면 한쪽으로 맞춰야 해서 모두 인덱스 없이 푼다
function addMerged(
  group: THREE.Group,
  pieces: THREE.BufferGeometry[],
  material: THREE.Material,
): THREE.Mesh {
  const unindexed = pieces.map((piece) =>
    piece.index ? piece.toNonIndexed() : piece,
  );
  const merged = mergeGeometries(unindexed);
  new Set([...pieces, ...unindexed]).forEach((piece) => piece.dispose());
  return addMesh(group, merged, material);
}

// 실시간 파형. 센서 값이 흐르는 선이 점선 기준선을 한 번 넘고, 넘은 자리에 표시가 박혀 있다
function createLiveWaveform(materials: PartMaterials): THREE.Group {
  const group = new THREE.Group();
  addMesh(group, roundedBox(3.0, 1.8, 0.22, 0.16, 5), materials.neutral);

  const frontZ = 0.13;
  const guides = [
    placed(roundedBox(0.62, 0.09, 0.05, 0.04), [-0.98, 0.68, frontZ]),
    placed(roundedBox(2.64, 0.026, 0.026, 0.013, 1), [0, -0.64, frontZ]),
  ];
  const dashCount = 13;
  for (let dashIndex = 0; dashIndex < dashCount; dashIndex += 1) {
    guides.push(
      placed(roundedBox(0.11, 0.03, 0.03, 0.015, 1), [
        -1.26 + dashIndex * 0.21,
        0.3,
        frontZ,
      ]),
    );
  }
  addMerged(group, guides, materials.contrast);
  addMesh(group, roundedBox(0.34, 0.14, 0.06, 0.06), materials.accent, [
    1.1,
    0.68,
    frontZ,
  ]);

  const spikeX = 0.55;
  const valueAt = (x: number) =>
    -0.16 +
    0.1 * Math.sin(x * 5.1) +
    0.06 * Math.sin(x * 11.3 + 1) +
    0.66 * Math.exp(-(((x - spikeX) / 0.075) ** 2));
  const wavePoints: THREE.Vector3[] = [];
  const waveSamples = 80;
  for (let sampleIndex = 0; sampleIndex <= waveSamples; sampleIndex += 1) {
    const x = -1.3 + (2.6 * sampleIndex) / waveSamples;
    wavePoints.push(new THREE.Vector3(x, valueAt(x), frontZ + 0.02));
  }
  addMesh(
    group,
    new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3(wavePoints),
      240,
      0.036,
      10,
    ),
    materials.accent,
  );

  const peak: Vector3Tuple = [spikeX, valueAt(spikeX), frontZ + 0.04];
  addMesh(
    group,
    new THREE.SphereGeometry(0.085, 24, 24),
    materials.highlight,
    peak,
  );
  addMesh(
    group,
    new THREE.TorusGeometry(0.17, 0.016, 10, 48),
    materials.highlight,
    peak,
  );
  return group;
}

const GRAPH_NODE_WIDTH = 0.78;
const GRAPH_NODE_HEIGHT = 0.6;
const GRAPH_PORT_RADIUS = 0.065;
const GRAPH_NODES: { x: number; y: number }[] = [
  { x: -1.08, y: 0.4 },
  { x: 0, y: -0.4 },
  { x: 1.08, y: 0.4 },
];

// 시나리오 그래프. 노드 세 개를 곡선이 잇고, 두 번째 선 위에 신호 하나가 지나가고 있다.
// 첫 노드의 머리는 강조색으로 시작점임을, 마지막 노드의 출력 단자는 라임으로 결과가 나가는 자리임을 알린다
function createScenarioGraph(materials: PartMaterials): THREE.Group {
  const group = new THREE.Group();
  const portOffset = GRAPH_NODE_WIDTH / 2;
  const frontZ = 0.11;

  const bodies: THREE.BufferGeometry[] = [];
  const marks: THREE.BufferGeometry[] = [];
  const ports: THREE.BufferGeometry[] = [];
  GRAPH_NODES.forEach(({ x, y }, nodeIndex) => {
    bodies.push(
      placed(roundedBox(GRAPH_NODE_WIDTH, GRAPH_NODE_HEIGHT, 0.2, 0.1, 4), [
        x,
        y,
        0,
      ]),
    );
    if (nodeIndex > 0) {
      marks.push(
        placed(roundedBox(0.64, 0.11, 0.05, 0.05), [x, y + 0.17, frontZ]),
      );
    }
    marks.push(
      placed(roundedBox(0.44, 0.06, 0.04, 0.025, 2), [
        x - 0.1,
        y - 0.03,
        frontZ,
      ]),
      placed(roundedBox(0.28, 0.06, 0.04, 0.025, 2), [
        x - 0.18,
        y - 0.15,
        frontZ,
      ]),
    );
    ports.push(
      placed(new THREE.SphereGeometry(GRAPH_PORT_RADIUS, 20, 20), [
        x - portOffset,
        y,
        0.02,
      ]),
    );
    if (nodeIndex < GRAPH_NODES.length - 1) {
      ports.push(
        placed(new THREE.SphereGeometry(GRAPH_PORT_RADIUS, 20, 20), [
          x + portOffset,
          y,
          0.02,
        ]),
      );
    }
  });

  const edgeCurves: THREE.CubicBezierCurve3[] = [];
  for (let nodeIndex = 0; nodeIndex < GRAPH_NODES.length - 1; nodeIndex += 1) {
    const from = GRAPH_NODES[nodeIndex];
    const to = GRAPH_NODES[nodeIndex + 1];
    const start = new THREE.Vector3(from.x + portOffset, from.y, 0.02);
    const end = new THREE.Vector3(to.x - portOffset, to.y, 0.02);
    const curve = new THREE.CubicBezierCurve3(
      start,
      new THREE.Vector3(start.x + 0.22, start.y, 0.02),
      new THREE.Vector3(end.x - 0.22, end.y, 0.02),
      end,
    );
    edgeCurves.push(curve);
    marks.push(new THREE.TubeGeometry(curve, 40, 0.026, 10));
  }

  addMerged(group, bodies, materials.neutral);
  addMerged(group, marks, materials.contrast);
  addMerged(group, ports, materials.bright);
  const [firstNode] = GRAPH_NODES;
  addMesh(group, roundedBox(0.64, 0.11, 0.05, 0.05), materials.accent, [
    firstNode.x,
    firstNode.y + 0.17,
    frontZ,
  ]);
  const lastNode = GRAPH_NODES[GRAPH_NODES.length - 1];
  addMesh(
    group,
    new THREE.SphereGeometry(GRAPH_PORT_RADIUS, 20, 20),
    materials.highlight,
    [lastNode.x + portOffset, lastNode.y, 0.02],
  );
  const signal = edgeCurves[1].getPoint(0.5);
  addMesh(group, new THREE.SphereGeometry(0.055, 20, 20), materials.highlight, [
    signal.x,
    signal.y,
    signal.z + 0.04,
  ]);
  return group;
}

const HEATMAP_COLUMNS = 6;
const HEATMAP_ROWS = 4;
const HEATMAP_CELL = 0.3;
const HEATMAP_STEP = 0.36;
// 가장 높은 칸. 한 곳만 라임으로 켜서 어디가 위험한지 먼저 보이게 한다
const HEATMAP_HOT_CELL = { column: 4, row: 1 };

// 구역 히트맵. 칸의 높이가 값이고, 색은 낮음과 높음과 가장 높음 세 단계만 쓴다
function createZoneHeatmap(materials: PartMaterials): THREE.Group {
  const group = new THREE.Group();
  const lowCells = [placed(roundedBox(2.5, 1.8, 0.12, 0.1, 4), [0, 0, 0])];
  const highCells: THREE.BufferGeometry[] = [];
  for (let column = 0; column < HEATMAP_COLUMNS; column += 1) {
    for (let row = 0; row < HEATMAP_ROWS; row += 1) {
      const isHot =
        column === HEATMAP_HOT_CELL.column && row === HEATMAP_HOT_CELL.row;
      const value = isHot
        ? 1
        : 0.5 +
          0.42 *
            Math.sin(column * 1.3 + row * 0.7) *
            Math.cos(row * 1.1 - column * 0.4);
      const height = 0.05 + 0.44 * value;
      const cell = placed(
        roundedBox(HEATMAP_CELL, HEATMAP_CELL, height, 0.05, 2),
        [
          (column - (HEATMAP_COLUMNS - 1) / 2) * HEATMAP_STEP,
          (row - (HEATMAP_ROWS - 1) / 2) * HEATMAP_STEP,
          0.06 + height / 2,
        ],
      );
      if (isHot) {
        addMesh(group, cell, materials.highlight);
      } else if (value > 0.55) {
        highCells.push(cell);
      } else {
        lowCells.push(cell);
      }
    }
  }
  addMerged(group, lowCells, materials.neutral);
  addMerged(group, highCells, materials.accent);
  return group;
}

const PHASE_COLUMNS = 16;
const PHASE_CYCLES = 5;

// 위상 패턴 지형. 한 주기를 위상으로 펼치고 여러 주기를 앞뒤로 쌓은 막대 지형이다.
// 바닥에 누운 부품이라 정의의 회전에서 앞으로 기울여 윗면이 보이게 한다
function createPhaseTerrain(materials: PartMaterials): THREE.Group {
  const group = new THREE.Group();
  addMesh(group, roundedBox(2.9, 0.1, 1.5, 0.05, 4), materials.neutral);

  // 뒤쪽의 기준 사인 곡선. 봉우리가 한 주기의 어디에 서는지 읽는 눈금이다
  const guidePoints: THREE.Vector3[] = [];
  const guideSamples = 60;
  for (let sampleIndex = 0; sampleIndex <= guideSamples; sampleIndex += 1) {
    const ratio = sampleIndex / guideSamples;
    guidePoints.push(
      new THREE.Vector3(
        -1.3 + 2.6 * ratio,
        0.32 + 0.2 * Math.sin(ratio * Math.PI * 2),
        -0.66,
      ),
    );
  }
  addMesh(
    group,
    new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3(guidePoints),
      120,
      0.02,
      8,
    ),
    materials.contrast,
  );

  const bars: { geometry: THREE.BufferGeometry; height: number }[] = [];
  for (let column = 0; column < PHASE_COLUMNS; column += 1) {
    const phase = column / (PHASE_COLUMNS - 1);
    // 두 봉우리가 반 주기 떨어져 서는 모양이다. 뒤쪽이 조금 낮다
    const shape =
      Math.exp(-(((phase - 0.26) / 0.08) ** 2)) +
      0.75 * Math.exp(-(((phase - 0.76) / 0.08) ** 2));
    for (let cycle = 0; cycle < PHASE_CYCLES; cycle += 1) {
      // 난수 대신 고정된 흔들림을 써서 새로고침마다 지형이 바뀌지 않게 한다
      const jitter =
        0.55 + 0.45 * Math.abs(Math.sin(column * 12.9898 + cycle * 78.233));
      const height = 0.04 + 0.74 * shape * jitter;
      bars.push({
        height,
        geometry: placed(roundedBox(0.08, height, 0.08, 0.03, 2), [
          -1.2 + column * 0.16,
          0.05 + height / 2,
          -0.45 + cycle * 0.225,
        ]),
      });
    }
  }
  const tallestIndex = bars.reduce(
    (bestIndex, bar, barIndex) =>
      bar.height > bars[bestIndex].height ? barIndex : bestIndex,
    0,
  );
  addMesh(group, bars[tallestIndex].geometry, materials.highlight);
  addMerged(
    group,
    bars
      .filter((_, barIndex) => barIndex !== tallestIndex)
      .map((bar) => bar.geometry),
    materials.accent,
  );
  return group;
}

const TOKEN_CARD_WIDTH = 0.46;
const TOKEN_CARD_HEIGHT = 1.05;
const TOKEN_FAN_ANGLE = 0.34;
// 뒤에서 앞 순서다. 가장 앞의 카드가 강조색이다
const TOKEN_SWATCHES: PartRole[] = ["contrast", "highlight", "accent"];

// 토큰 팔레트. 색 토큰 카드 세 장이 아래쪽 핀을 축으로 부채처럼 펼쳐져 있다
function createDesignTokens(materials: PartMaterials): THREE.Group {
  const group = new THREE.Group();
  const pivotY = -0.55;
  const cards: THREE.BufferGeometry[] = [];
  const lines: THREE.BufferGeometry[] = [];
  const pointOnCard = (
    angle: number,
    offsetX: number,
    offsetY: number,
    z: number,
  ): Vector3Tuple => [
    offsetX * Math.cos(angle) - offsetY * Math.sin(angle),
    pivotY + offsetX * Math.sin(angle) + offsetY * Math.cos(angle),
    z,
  ];

  TOKEN_SWATCHES.forEach((role, cardIndex) => {
    const angle = (1 - cardIndex) * TOKEN_FAN_ANGLE;
    const cardZ = cardIndex * 0.07;
    const faceZ = cardZ + 0.035;
    const rotation: Vector3Tuple = [0, 0, angle];
    cards.push(
      placed(
        roundedBox(TOKEN_CARD_WIDTH, TOKEN_CARD_HEIGHT, 0.05, 0.06, 4),
        pointOnCard(angle, 0, TOKEN_CARD_HEIGHT / 2 - 0.08, cardZ),
        rotation,
      ),
    );
    lines.push(
      placed(
        roundedBox(0.28, 0.05, 0.03, 0.02, 1),
        pointOnCard(angle, -0.05, 0.4, faceZ),
        rotation,
      ),
      placed(
        roundedBox(0.18, 0.05, 0.03, 0.02, 1),
        pointOnCard(angle, -0.1, 0.3, faceZ),
        rotation,
      ),
    );
    addMesh(
      group,
      roundedBox(0.36, 0.44, 0.03, 0.04, 2),
      materials[role],
      pointOnCard(angle, 0, 0.7, faceZ),
      rotation,
    );
  });
  addMerged(group, cards, materials.neutral);
  addMerged(group, lines, materials.contrast);
  // 원통은 기본 축이 y라서 화면 앞을 보도록 세운다
  addMesh(
    group,
    new THREE.CylinderGeometry(0.06, 0.06, 0.3, 24),
    materials.bright,
    [0, pivotY + 0.08, 0.1],
    [Math.PI / 2, 0, 0],
  );
  return group;
}

const SITE_WALL_HEIGHT = 0.18;
// [x1, z1, x2, z2]. 바깥 벽의 위쪽 가운데에 출입구를 비워 둔다
const SITE_WALLS: [number, number, number, number][] = [
  [-1.1, -0.72, 1.1, -0.72],
  [-1.1, 0.72, 0.05, 0.72],
  [0.42, 0.72, 1.1, 0.72],
  [-1.1, -0.72, -1.1, 0.72],
  [1.1, -0.72, 1.1, 0.72],
  [0.12, -0.72, 0.12, 0.04],
  [0.12, 0.04, 1.1, 0.04],
];
// [x, z]. 마지막 핀이 이상을 알리는 센서다
const SITE_PINS: [number, number][] = [
  [-0.7, -0.34],
  [-0.5, 0.4],
  [0.74, 0.42],
  [0.64, -0.38],
];

// 현장 도면. 벽으로 나뉜 평면에 센서 핀이 꽂혀 있고, 그중 하나만 켜져 발밑에 고리가 둘러 있다.
// 바닥에 누운 부품이라 정의의 회전에서 앞으로 기울여 윗면이 보이게 한다
function createSitePlan(materials: PartMaterials): THREE.Group {
  const group = new THREE.Group();
  addMesh(group, roundedBox(2.4, 0.08, 1.6, 0.04, 4), materials.neutral);

  const floorTop = 0.04;
  const structure = SITE_WALLS.map(([x1, z1, x2, z2]) =>
    placed(
      roundedBox(
        Math.max(Math.abs(x2 - x1), 0.05),
        SITE_WALL_HEIGHT,
        Math.max(Math.abs(z2 - z1), 0.05),
        0.02,
        1,
      ),
      [(x1 + x2) / 2, floorTop + SITE_WALL_HEIGHT / 2, (z1 + z2) / 2],
    ),
  );
  const pinHeight = 0.3;
  SITE_PINS.forEach(([x, z]) => {
    structure.push(
      placed(new THREE.CylinderGeometry(0.026, 0.026, pinHeight, 12), [
        x,
        floorTop + pinHeight / 2,
        z,
      ]),
    );
  });
  addMerged(group, structure, materials.contrast);

  const headY = floorTop + pinHeight + 0.06;
  const quietPins = SITE_PINS.slice(0, -1);
  const [alertX, alertZ] = SITE_PINS[SITE_PINS.length - 1];
  addMerged(
    group,
    quietPins.map(([x, z]) =>
      placed(new THREE.SphereGeometry(0.085, 20, 20), [x, headY, z]),
    ),
    materials.accent,
  );
  addMesh(group, new THREE.SphereGeometry(0.085, 20, 20), materials.highlight, [
    alertX,
    headY,
    alertZ,
  ]);
  // 고리는 기본으로 화면을 보고 서 있어서 바닥에 눕힌다
  addMesh(
    group,
    new THREE.TorusGeometry(0.2, 0.016, 8, 48),
    materials.highlight,
    [alertX, floorTop + 0.02, alertZ],
    [Math.PI / 2, 0, 0],
  );
  return group;
}

// 가장 작은 두 부품(토큰 팔레트, 현장 도면)을 가장 좁은 Work와 Lab 사이에 둔다
export const PART_DEFINITIONS: PartDefinition[] = [
  {
    key: "live-waveform",
    create: createLiveWaveform,
    halfWidth: 1.5,
    clump: [0.5, 0.55, -0.6],
    rotation: [-0.25, 0.45, 0.08],
    side: [-1, 0.42, -0.5],
    gap: [0, -1],
  },
  {
    key: "scenario-graph",
    create: createScenarioGraph,
    halfWidth: 1.55,
    clump: [-2.0, -2.0, 0.9],
    rotation: [0.2, -0.4, -0.06],
    side: [1, -0.52, 0.4],
    gap: [1, 1],
  },
  {
    key: "zone-heatmap",
    create: createZoneHeatmap,
    halfWidth: 1.25,
    // 앞으로 나와 있어 원근 때문에 더 크게, 더 바깥으로 보인다. 화면 오른쪽 끝에 붙지 않게 x를 덜 준다
    clump: [1.8, -1.9, 1.0],
    // 흩어지면 y로 0.6만큼 더 돌기 때문에, 판이 납작하게 눕지 않도록 반대쪽으로 돌려 둔다
    rotation: [-0.12, -0.3, 0.08],
    side: [-1, -0.5, 0.6],
    gap: [1, -1],
  },
  {
    key: "phase-terrain",
    create: createPhaseTerrain,
    halfWidth: 1.5,
    clump: [-1.4, 2.65, 0.6],
    // 흩어지면 y로 0.6만큼 더 돌기 때문에, 그때 정면에 가깝게 보이도록 반대쪽으로 돌려 둔다
    rotation: [0.7, -0.4, -0.06],
    // 세로 비율은 맞은편의 실시간 파형과 같은 값이라 둘이 같은 높이에 놓인다
    side: [1, 0.42, 0.2],
    gap: [0, 1],
  },
  {
    key: "design-tokens",
    create: createDesignTokens,
    halfWidth: 0.6,
    clump: [2.9, 1.9, 0.4],
    rotation: [0.2, -0.5, 0.1],
    // 세로 비율은 맞은편의 현장 도면과 같은 값이라 둘이 같은 높이에 놓인다
    side: [1, -0.04, -0.3],
    gap: [2, 1],
  },
  {
    key: "site-plan",
    create: createSitePlan,
    halfWidth: 1.2,
    clump: [-3.2, 0.3, -0.2],
    rotation: [0.8, 0.35, 0.06],
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
