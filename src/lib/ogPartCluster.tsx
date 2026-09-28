import type { ReactElement } from "react";
import { SCENE_PALETTES } from "@/components/scene/themePalette";

// 링크 미리보기 이미지의 오른쪽 그림. 3D 장면에서 뭉친 부품 여섯 개를 평면 SVG로 옮긴 것이다.
// ImageResponse는 three를 돌릴 수 없어서 partDefinitions.ts의 치수를 장면 단위 그대로 가져와 투영만 직접 한다.
// satori는 svg 안쪽의 함수 컴포넌트를 빼고 그리며 Fragment에서는 멈춘다. 그래서 그리기 함수를 직접 부르고 <g>로 묶는다

const PALETTE = SCENE_PALETTES.dark;
// 장면 1단위를 몇 픽셀로 그릴지
const UNIT = 58;
const BODY_GRADIENT_ID = "part-body";
const SHADOW_FILTER_ID = "part-shadow";
const BODY_STROKE = "#2a2e3b";
const RAISED_CELL = "#252935";

type Point = [number, number];

// 장면 좌표는 y가 위쪽이라 화면 좌표로 바꿀 때 뒤집는다
function toScreen(x: number, y: number): Point {
  return [x * UNIT, -y * UNIT];
}

function formatPoints(points: Point[]): string {
  return points.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
}

interface BarProps {
  key?: string | number;
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  // 없으면 짧은 변의 절반이라 양 끝이 둥근 막대가 된다
  radius?: number;
}

// 장면 좌표의 가운데와 크기로 둥근 막대를 그린다
function drawBar({ key, x, y, width, height, fill, radius }: BarProps) {
  const [left, top] = toScreen(x - width / 2, y + height / 2);
  return (
    <rect
      key={key}
      x={left}
      y={top}
      width={width * UNIT}
      height={height * UNIT}
      rx={(radius ?? Math.min(width, height) / 2) * UNIT}
      fill={fill}
    />
  );
}

function drawCardBody(width: number, height: number) {
  const [left, top] = toScreen(-width / 2, height / 2);
  return (
    <rect
      x={left}
      y={top}
      width={width * UNIT}
      height={height * UNIT}
      rx={0.16 * UNIT}
      fill={`url(#${BODY_GRADIENT_ID})`}
      stroke={BODY_STROKE}
      strokeWidth={1.5}
    />
  );
}

function drawPulseRings(center: Point, radius: number) {
  return (
    <g>
      <circle
        cx={center[0]}
        cy={center[1]}
        r={radius * UNIT}
        fill="none"
        stroke={PALETTE.highlight}
        strokeWidth={2}
      />
      <circle
        cx={center[0]}
        cy={center[1]}
        r={radius * 1.7 * UNIT}
        fill="none"
        stroke={PALETTE.highlight}
        strokeWidth={1.5}
        strokeOpacity={0.35}
      />
    </g>
  );
}

// 실시간 파형. 선이 점선 기준선을 한 번 넘고 넘은 자리에서 고리가 퍼진다
function drawLiveWaveform() {
  const spikeX = 0.55;
  const valueAt = (x: number) =>
    -0.16 +
    0.1 * Math.sin(x * 5.1) +
    0.06 * Math.sin(x * 11.3 + 1) +
    0.66 * Math.exp(-(((x - spikeX) / 0.075) ** 2));
  const wavePoints: Point[] = [];
  for (let sampleIndex = 0; sampleIndex <= 120; sampleIndex += 1) {
    const x = -1.3 + (2.6 * sampleIndex) / 120;
    wavePoints.push(toScreen(x, valueAt(x)));
  }
  const dashes = Array.from({ length: 13 }, (_, dashIndex) =>
    drawBar({
      key: dashIndex,
      x: -1.26 + dashIndex * 0.21,
      y: 0.3,
      width: 0.11,
      height: 0.03,
      fill: PALETTE.contrast,
    }),
  );

  return (
    <g>
      {drawCardBody(3.0, 1.8)}
      {drawBar({
        x: -0.98,
        y: 0.68,
        width: 0.62,
        height: 0.09,
        fill: PALETTE.contrast,
      })}
      {drawBar({
        x: 1.1,
        y: 0.68,
        width: 0.34,
        height: 0.14,
        fill: PALETTE.accent,
      })}
      {drawBar({
        x: 0,
        y: -0.64,
        width: 2.64,
        height: 0.026,
        fill: PALETTE.contrast,
      })}
      {dashes}
      <polyline
        points={formatPoints(wavePoints)}
        fill="none"
        stroke={PALETTE.accent}
        strokeWidth={0.072 * UNIT}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {drawPulseRings(toScreen(spikeX, valueAt(spikeX)), 0.17)}
      <circle
        cx={toScreen(spikeX, valueAt(spikeX))[0]}
        cy={toScreen(spikeX, valueAt(spikeX))[1]}
        r={0.085 * UNIT}
        fill={PALETTE.highlight}
      />
    </g>
  );
}

const GRAPH_NODES: { x: number; y: number }[] = [
  { x: -1.08, y: 0.4 },
  { x: 0, y: -0.4 },
  { x: 1.08, y: 0.4 },
];
const GRAPH_PORT_OFFSET = 0.39;

// 시나리오 그래프. 첫 노드의 머리는 강조색, 마지막 출력 단자는 라임이고 두 번째 선 위에 신호가 있다
function drawScenarioGraph() {
  const edges = GRAPH_NODES.slice(0, -1).map((from, nodeIndex) => {
    const to = GRAPH_NODES[nodeIndex + 1];
    const [startX, startY] = toScreen(from.x + GRAPH_PORT_OFFSET, from.y);
    const [endX, endY] = toScreen(to.x - GRAPH_PORT_OFFSET, to.y);
    const bend = 0.22 * UNIT;
    return (
      <path
        key={nodeIndex}
        d={`M${startX},${startY} C${startX + bend},${startY} ${endX - bend},${endY} ${endX},${endY}`}
        fill="none"
        stroke={PALETTE.contrast}
        strokeWidth={0.052 * UNIT}
      />
    );
  });
  const lastNode = GRAPH_NODES[GRAPH_NODES.length - 1];
  const [outputX, outputY] = toScreen(
    lastNode.x + GRAPH_PORT_OFFSET,
    lastNode.y,
  );
  // 두 번째 선의 가운데. 3D 장면이 멈춰 있을 때 신호가 놓이는 자리다
  const [signalX, signalY] = toScreen(0.54, 0);

  return (
    <g>
      {edges}
      {GRAPH_NODES.map(({ x, y }, nodeIndex) => {
        const [left, top] = toScreen(x - 0.39, y + 0.3);
        const [inputX, portY] = toScreen(x - GRAPH_PORT_OFFSET, y);
        return (
          <g key={nodeIndex}>
            <rect
              x={left}
              y={top}
              width={0.78 * UNIT}
              height={0.6 * UNIT}
              rx={0.1 * UNIT}
              fill={`url(#${BODY_GRADIENT_ID})`}
              stroke={BODY_STROKE}
              strokeWidth={1.5}
            />
            {drawBar({
              x: x,
              y: y + 0.17,
              width: 0.64,
              height: 0.11,
              fill: nodeIndex === 0 ? PALETTE.accent : PALETTE.contrast,
            })}
            {drawBar({
              x: x - 0.1,
              y: y - 0.03,
              width: 0.44,
              height: 0.06,
              fill: PALETTE.contrast,
            })}
            {drawBar({
              x: x - 0.18,
              y: y - 0.15,
              width: 0.28,
              height: 0.06,
              fill: PALETTE.contrast,
            })}
            <circle
              cx={inputX}
              cy={portY}
              r={0.065 * UNIT}
              fill={PALETTE.bright}
            />
            {nodeIndex < GRAPH_NODES.length - 1 && (
              <circle
                cx={toScreen(x + GRAPH_PORT_OFFSET, y)[0]}
                cy={portY}
                r={0.065 * UNIT}
                fill={PALETTE.bright}
              />
            )}
          </g>
        );
      })}
      <circle
        cx={outputX}
        cy={outputY}
        r={0.065 * UNIT}
        fill={PALETTE.highlight}
      />
      <circle
        cx={signalX}
        cy={signalY}
        r={0.07 * UNIT}
        fill={PALETTE.highlight}
      />
    </g>
  );
}

const HEATMAP_COLUMNS = 6;
const HEATMAP_ROWS = 4;
const HEATMAP_HOT_CELL = { column: 4, row: 1 };

// 구역 히트맵. 3D에서는 칸 높이가 값이라, 평면에서는 값만큼 오른쪽 아래로 옆면을 내려 높이를 나타낸다
function drawZoneHeatmap() {
  const cells: ReactElement[] = [];
  for (let row = HEATMAP_ROWS - 1; row >= 0; row -= 1) {
    for (let column = 0; column < HEATMAP_COLUMNS; column += 1) {
      const isHot =
        column === HEATMAP_HOT_CELL.column && row === HEATMAP_HOT_CELL.row;
      const value = isHot
        ? 1
        : 0.5 +
          0.42 *
            Math.sin(column * 1.3 + row * 0.7) *
            Math.cos(row * 1.1 - column * 0.4);
      const fill = isHot
        ? PALETTE.highlight
        : value > 0.55
          ? PALETTE.accent
          : RAISED_CELL;
      const lift = (0.05 + 0.44 * value) * 0.28 * UNIT;
      const [left, top] = toScreen(
        (column - (HEATMAP_COLUMNS - 1) / 2) * 0.36 - 0.15,
        (row - (HEATMAP_ROWS - 1) / 2) * 0.36 + 0.15,
      );
      const size = 0.3 * UNIT;
      cells.push(
        <g key={`${column}-${row}`}>
          <rect
            x={left}
            y={top}
            width={size}
            height={size}
            rx={3}
            fill="#07080b"
          />
          <rect
            x={left - lift}
            y={top - lift}
            width={size}
            height={size}
            rx={3}
            fill={fill}
          />
        </g>,
      );
    }
  }
  return (
    <g>
      {drawCardBody(2.5, 1.8)}
      {cells}
    </g>
  );
}

const TOKEN_CARD_WIDTH = 0.46;
const TOKEN_CARD_HEIGHT = 1.05;
const TOKEN_FAN_ANGLE = 0.34;
const TOKEN_PIVOT_Y = -0.55;
// 뒤에서 앞 순서다. 가장 앞의 카드가 강조색이다
const TOKEN_SWATCHES = [PALETTE.contrast, PALETTE.highlight, PALETTE.accent];

// 토큰 팔레트. 색 토큰 카드 세 장이 아래쪽 핀을 축으로 부채처럼 펼쳐져 있다
function drawDesignTokens() {
  const [pivotX, pivotY] = toScreen(0, TOKEN_PIVOT_Y);
  return (
    <g>
      {TOKEN_SWATCHES.map((swatch, cardIndex) => {
        // 장면은 반시계 방향이 양수이고 SVG는 시계 방향이 양수다
        const degrees = (-(1 - cardIndex) * TOKEN_FAN_ANGLE * 180) / Math.PI;
        const cardCenterY = TOKEN_PIVOT_Y + TOKEN_CARD_HEIGHT / 2 - 0.08;
        const [left, top] = toScreen(
          -TOKEN_CARD_WIDTH / 2,
          cardCenterY + TOKEN_CARD_HEIGHT / 2,
        );
        return (
          <g key={swatch} transform={`rotate(${degrees} ${pivotX} ${pivotY})`}>
            <rect
              x={left}
              y={top}
              width={TOKEN_CARD_WIDTH * UNIT}
              height={TOKEN_CARD_HEIGHT * UNIT}
              rx={0.06 * UNIT}
              fill={`url(#${BODY_GRADIENT_ID})`}
              stroke={BODY_STROKE}
              strokeWidth={1.5}
            />
            {drawBar({
              x: 0,
              y: TOKEN_PIVOT_Y + 0.7,
              width: 0.36,
              height: 0.44,
              fill: swatch,
              radius: 0.04,
            })}
            {drawBar({
              x: -0.05,
              y: TOKEN_PIVOT_Y + 0.4,
              width: 0.28,
              height: 0.05,
              fill: PALETTE.contrast,
            })}
            {drawBar({
              x: -0.1,
              y: TOKEN_PIVOT_Y + 0.3,
              width: 0.18,
              height: 0.05,
              fill: PALETTE.contrast,
            })}
          </g>
        );
      })}
      <circle
        cx={pivotX}
        cy={toScreen(0, TOKEN_PIVOT_Y + 0.08)[1]}
        r={0.06 * UNIT}
        fill={PALETTE.bright}
      />
    </g>
  );
}

// 바닥에 누운 부품을 비스듬히 내려다본 모습으로 옮긴다. yaw는 세로축 회전, tilt는 내려다보는 각도다
function createFloorProjector(yaw: number, tilt: number) {
  return (x: number, y: number, z: number): Point => {
    const turnedX = x * Math.cos(yaw) + z * Math.sin(yaw);
    const turnedZ = -x * Math.sin(yaw) + z * Math.cos(yaw);
    return [
      turnedX * UNIT,
      (turnedZ * Math.sin(tilt) - y * Math.cos(tilt)) * UNIT,
    ];
  };
}

function drawFloorPlate(
  project: (x: number, y: number, z: number) => Point,
  width: number,
  depth: number,
  thickness: number,
) {
  const halfWidth = width / 2;
  const halfDepth = depth / 2;
  const top = [
    project(-halfWidth, 0, -halfDepth),
    project(halfWidth, 0, -halfDepth),
    project(halfWidth, 0, halfDepth),
    project(-halfWidth, 0, halfDepth),
  ];
  const front = [
    project(-halfWidth, 0, halfDepth),
    project(halfWidth, 0, halfDepth),
    project(halfWidth, -thickness, halfDepth),
    project(-halfWidth, -thickness, halfDepth),
  ];
  const side = [
    project(halfWidth, 0, -halfDepth),
    project(halfWidth, 0, halfDepth),
    project(halfWidth, -thickness, halfDepth),
    project(halfWidth, -thickness, -halfDepth),
  ];
  return (
    <g>
      <polygon points={formatPoints(side)} fill="#0c0d12" />
      <polygon points={formatPoints(front)} fill="#101218" />
      <polygon
        points={formatPoints(top)}
        fill={`url(#${BODY_GRADIENT_ID})`}
        stroke={BODY_STROKE}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
    </g>
  );
}

const PHASE_COLUMNS = 16;
const PHASE_CYCLES = 5;

// 위상 패턴 지형. 한 주기를 위상으로 펼치고 여러 주기를 앞뒤로 쌓은 막대 지형이다
function drawPhaseTerrain() {
  const project = createFloorProjector(-0.35, 0.62);
  const guidePoints: Point[] = [];
  for (let sampleIndex = 0; sampleIndex <= 60; sampleIndex += 1) {
    const ratio = sampleIndex / 60;
    guidePoints.push(
      project(
        -1.3 + 2.6 * ratio,
        0.32 + 0.2 * Math.sin(ratio * Math.PI * 2),
        -0.66,
      ),
    );
  }

  const bars: { x: number; z: number; height: number }[] = [];
  for (let column = 0; column < PHASE_COLUMNS; column += 1) {
    const phase = column / (PHASE_COLUMNS - 1);
    const shape =
      Math.exp(-(((phase - 0.26) / 0.08) ** 2)) +
      0.75 * Math.exp(-(((phase - 0.76) / 0.08) ** 2));
    for (let cycle = 0; cycle < PHASE_CYCLES; cycle += 1) {
      const jitter =
        0.55 + 0.45 * Math.abs(Math.sin(column * 12.9898 + cycle * 78.233));
      bars.push({
        x: -1.2 + column * 0.16,
        z: -0.45 + cycle * 0.225,
        height: 0.04 + 0.74 * shape * jitter,
      });
    }
  }
  const tallest = bars.reduce((best, bar) =>
    bar.height > best.height ? bar : best,
  );
  // 멀리 있는 막대부터 그려야 가까운 막대가 앞을 가린다
  const depthOf = (bar: { x: number; z: number }) =>
    project(bar.x, 0, bar.z)[1];
  const sortedBars = [...bars].sort(
    (first, second) => depthOf(first) - depthOf(second),
  );

  return (
    <g>
      {drawFloorPlate(project, 2.9, 1.5, 0.1)}
      <polyline
        points={formatPoints(guidePoints)}
        fill="none"
        stroke={PALETTE.contrast}
        strokeWidth={0.04 * UNIT}
        strokeLinecap="round"
      />
      {sortedBars.map((bar) => {
        const [baseX, baseY] = project(bar.x, 0, bar.z);
        const [, topY] = project(bar.x, bar.height, bar.z);
        return (
          <line
            key={`${bar.x}-${bar.z}`}
            x1={baseX}
            y1={baseY}
            x2={baseX}
            y2={topY}
            stroke={bar === tallest ? PALETTE.highlight : PALETTE.accent}
            strokeWidth={0.08 * UNIT}
            strokeLinecap="round"
          />
        );
      })}
    </g>
  );
}

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

// 현장 도면. 벽으로 나뉜 평면에 센서 핀이 꽂혀 있고, 그중 하나만 켜져 발밑에서 고리가 퍼진다
function drawSitePlan() {
  const project = createFloorProjector(0.35, 0.72);
  const wallHeight = 0.18;
  const pinHeight = 0.3;
  const [alertX, alertZ] = SITE_PINS[SITE_PINS.length - 1];
  const [rippleX, rippleY] = project(alertX, 0, alertZ);
  const rippleRadius = 0.22 * UNIT;

  return (
    <g>
      {drawFloorPlate(project, 2.4, 1.6, 0.08)}
      {SITE_WALLS.map(([x1, z1, x2, z2]) => {
        const face = [
          project(x1, 0, z1),
          project(x2, 0, z2),
          project(x2, wallHeight, z2),
          project(x1, wallHeight, z1),
        ];
        return (
          <polygon
            key={`${x1}-${z1}-${x2}-${z2}`}
            points={formatPoints(face)}
            fill={PALETTE.contrast}
            fillOpacity={0.85}
            stroke={PALETTE.contrast}
            strokeWidth={1.5}
            strokeLinejoin="round"
          />
        );
      })}
      <ellipse
        cx={rippleX}
        cy={rippleY}
        rx={rippleRadius}
        ry={rippleRadius * Math.sin(0.72)}
        fill="none"
        stroke={PALETTE.highlight}
        strokeWidth={2}
      />
      {SITE_PINS.map(([x, z], pinIndex) => {
        const [baseX, baseY] = project(x, 0, z);
        const [, headY] = project(x, pinHeight + 0.06, z);
        const isAlert = pinIndex === SITE_PINS.length - 1;
        return (
          <g key={`${x}-${z}`}>
            <line
              x1={baseX}
              y1={baseY}
              x2={baseX}
              y2={headY}
              stroke={PALETTE.contrast}
              strokeWidth={0.052 * UNIT}
            />
            <circle
              cx={baseX}
              cy={headY}
              r={0.085 * UNIT}
              fill={isAlert ? PALETTE.highlight : PALETTE.accent}
            />
          </g>
        );
      })}
    </g>
  );
}

interface ClusterPart {
  key: string;
  render: () => ReactElement;
  // 칸 안에서 부품 가운데의 픽셀 위치와 기울기(도), 크기 배율
  x: number;
  y: number;
  rotate: number;
  scale: number;
}

// 3D 장면에서 뭉친 덩어리의 배치를 따르되, 칸에 들어오도록 위치를 좁혔다. 뒤에 있는 부품부터 그린다
const CLUSTER_PARTS: ClusterPart[] = [
  {
    key: "live-waveform",
    render: drawLiveWaveform,
    x: 292,
    y: 228,
    rotate: -4,
    scale: 1,
  },
  {
    key: "site-plan",
    render: drawSitePlan,
    x: 102,
    y: 240,
    rotate: 0,
    scale: 0.92,
  },
  {
    key: "design-tokens",
    render: drawDesignTokens,
    x: 402,
    y: 96,
    rotate: 8,
    scale: 1.2,
  },
  {
    key: "phase-terrain",
    render: drawPhaseTerrain,
    x: 184,
    y: 98,
    rotate: 0,
    scale: 0.95,
  },
  {
    key: "scenario-graph",
    render: drawScenarioGraph,
    x: 148,
    y: 392,
    rotate: 3,
    scale: 0.95,
  },
  {
    key: "zone-heatmap",
    render: drawZoneHeatmap,
    x: 360,
    y: 384,
    rotate: -3,
    scale: 1,
  },
];

export function OgPartCluster({
  width,
  height,
}: {
  width: number;
  height: number;
}) {
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <defs>
        <linearGradient id={BODY_GRADIENT_ID} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#232733" />
          <stop offset="1" stopColor={PALETTE.neutral} />
        </linearGradient>
        <filter
          id={SHADOW_FILTER_ID}
          x="-20%"
          y="-20%"
          width="140%"
          height="160%"
        >
          <feDropShadow
            dx="0"
            dy="10"
            stdDeviation="10"
            floodColor="#000000"
            floodOpacity="0.6"
          />
        </filter>
      </defs>
      {CLUSTER_PARTS.map((part) => (
        <g
          key={part.key}
          filter={`url(#${SHADOW_FILTER_ID})`}
          transform={`translate(${part.x} ${part.y}) rotate(${part.rotate}) scale(${part.scale})`}
        >
          {part.render()}
        </g>
      ))}
    </svg>
  );
}
