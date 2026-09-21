import {
  CLUMP_LEFT_EXTENT,
  CLUMP_RIGHT_EXTENT,
} from "@/components/scene/partDefinitions";
import {
  computeClumpScale,
  type SceneProfile,
  type ViewportUnits,
} from "@/components/scene/sceneLayout";
import type { SceneLayoutMeasurements } from "@/components/scene/sceneState";

// 각 값은 0에서 1까지 올라간다. sectionProgress는 0이 hero 중앙, 5가 contact 중앙이다
export interface ScenePhases {
  // 입자가 기둥에서 부품 표면으로 날아간다 (입자마다 출발이 늦춰지므로 셰이더가 다시 완만하게 만든다)
  morph: number;
  // 덩어리가 About의 오른쪽 절반으로 이동한다
  clumpShift: number;
  // 부품이 점이 채워지듯 굳는다. dissolve가 진행되면 그만큼 뺀다
  solid: number;
  // 부품으로 모이지 않은 입자가 보이는 정도. 사라졌다가 마지막에 돌아온다
  particleFade: number;
  // 덩어리에서 각자의 자리로 흩어진 정도. regather가 진행되면 그만큼 뺀다
  spread: number;
  regather: number;
  // 굳은 표면이 점 단위로 빠져 점묘로 돌아간다
  dissolve: number;
  // 점이 떨어져 바닥에 고인다. 0보다 크면 파도를 계산한다
  pool: number;
}

type Stop = [number, number];

interface PhaseStops {
  morph: Stop;
  clumpShift: Stop | null;
  solid: Stop;
  fadeOut: Stop;
  fadeIn: Stop;
  spread: Stop;
  regather: Stop;
  dissolve: Stop;
  pool: Stop;
}

// 옆 배치는 부품이 여백에 있어서 Lab 목록이 아직 화면에 있을 때 Lab과 Contact 사이 빈 줄을 따라 건너갈 수 있다.
// 그래서 다시 뭉치기를 일찍 끝내고, 풀려서 고이는 구간을 길게 둔다
// 모이기부터 입자가 사라지기까지는 About에 도착하는 진행도에 대한 비율이다. 헤더의 About을 누르면 섹션 위쪽이
// 화면 위쪽에 맞춰지는데, 그 위치에서 부품이 다 굳어 있어야 한다
const SIDE_STOPS: PhaseStops = {
  morph: [0.2, 0.8],
  clumpShift: [0.2, 0.85],
  solid: [0.65, 0.95],
  fadeOut: [0.75, 1],
  fadeIn: [4.7, 4.84],
  spread: [1.1, 1.6],
  regather: [4.15, 4.5],
  dissolve: [4.72, 4.92],
  pool: [4.74, 4.99],
};

// 문구 사이 배치는 부품이 Lab 목록 위쪽(화면 밖)에서 내려온다. 덩어리 자리가 화면에 들어오는 4.5부터 천천히 내려와
// 다 모인 뒤에 풀리기 시작한다
const STACKED_STOPS: PhaseStops = {
  ...SIDE_STOPS,
  fadeIn: [4.74, 4.88],
  regather: [4.5, 4.78],
  dissolve: [4.76, 4.94],
  pool: [4.78, 4.99],
};

// 휴대폰은 About 문구가 화면 너비를 다 써서 덩어리가 머무를 자리가 없다. 히어로 위쪽에서 굳자마자 흩어진다
const MOBILE_STOPS: PhaseStops = {
  morph: [0.05, 0.4],
  clumpShift: null,
  solid: [0.3, 0.5],
  fadeOut: [0.4, 0.6],
  fadeIn: [4.74, 4.88],
  spread: [0.8, 1.3],
  regather: [4.5, 4.78],
  dissolve: [4.76, 4.94],
  pool: [4.78, 4.99],
};

// 휴대폰의 구간은 About에 닿기 한참 전에 끝나는 절대값이라 비율로 다루지 않는다
const USES_ARRIVAL_RATIO: Record<SceneProfile, boolean> = {
  side: true,
  stacked: true,
  mobile: false,
};
// About이 화면보다 아주 길어도 연출이 히어로 안에서 너무 급하게 끝나지 않게 하는 하한
const MIN_ARRIVAL_PROGRESS = 0.6;

const STOPS_BY_PROFILE: Record<SceneProfile, PhaseStops> = {
  side: SIDE_STOPS,
  stacked: STACKED_STOPS,
  mobile: MOBILE_STOPS,
};

export const REDUCED_MOTION_PHASES: ScenePhases = {
  morph: 1,
  clumpShift: 0,
  solid: 1,
  particleFade: 0,
  spread: 0,
  regather: 0,
  dissolve: 0,
  pool: 0,
};

export function createScenePhases(): ScenePhases {
  return {
    morph: 0,
    clumpShift: 0,
    solid: 0,
    particleFade: 1,
    spread: 0,
    regather: 0,
    dissolve: 0,
    pool: 0,
  };
}

function range(value: number, [start, end]: Stop): number {
  return Math.min(Math.max((value - start) / (end - start), 0), 1);
}

function smooth(value: number): number {
  return value * value * (3 - 2 * value);
}

// 프레임마다 객체를 새로 만들지 않도록 결과를 output에 덮어쓴다
export function samplePhases(
  sectionProgress: number,
  aboutArrivalProgress: number,
  profile: SceneProfile,
  output: ScenePhases,
): ScenePhases {
  const stops = STOPS_BY_PROFILE[profile];
  const introProgress = USES_ARRIVAL_RATIO[profile]
    ? sectionProgress /
      Math.min(Math.max(aboutArrivalProgress, MIN_ARRIVAL_PROGRESS), 1)
    : sectionProgress;
  const regather = smooth(range(sectionProgress, stops.regather));
  const dissolve = smooth(range(sectionProgress, stops.dissolve));

  output.morph = range(introProgress, stops.morph);
  output.clumpShift = stops.clumpShift
    ? smooth(range(introProgress, stops.clumpShift))
    : 0;
  output.solid = smooth(range(introProgress, stops.solid)) * (1 - dissolve);
  output.particleFade = Math.min(
    1,
    1 -
      smooth(range(introProgress, stops.fadeOut)) +
      smooth(range(sectionProgress, stops.fadeIn)),
  );
  output.spread = smooth(range(sectionProgress, stops.spread)) * (1 - regather);
  output.regather = regather;
  output.dissolve = dissolve;
  output.pool = range(sectionProgress, stops.pool);
  return output;
}

export interface LaneRoute {
  // 자리에서 Lab과 Contact 사이 빈 줄로 내려오는 정도
  descend: number;
  // 빈 줄을 따라 덩어리 자리의 x까지 건너가는 정도
  traverse: number;
  // 빈 줄에서 덩어리 자리로 들어가는 정도
  settle: number;
}

const LANE_DESCEND: Stop = [0, 0.35];
const LANE_TRAVERSE: Stop = [0.3, 0.8];
const LANE_SETTLE: Stop = [0.65, 1];

export function createLaneRoute(): LaneRoute {
  return { descend: 0, traverse: 0, settle: 0 };
}

// 옆 배치에서 다시 뭉칠 때의 경로. 곧장 가면 위쪽 부품이 Lab 목록을, 왼쪽 부품이 올라오는 Contact 제목을 가로지른다.
// 그래서 먼저 목록과 제목 사이 빈 줄로 내려오고, 그 줄을 따라 옆으로 건너간 뒤, 덩어리 자리로 들어간다
export function computeLaneRoute(
  regather: number,
  output: LaneRoute,
): LaneRoute {
  output.descend = smooth(range(regather, LANE_DESCEND));
  output.traverse = smooth(range(regather, LANE_TRAVERSE));
  output.settle = smooth(range(regather, LANE_SETTLE));
  return output;
}

export interface ClumpCenter {
  x: number;
  y: number;
  scale: number;
}

// Contact 덩어리를 섹션 위쪽에서 얼마나 아래에 두는지 (화면 높이 비율). 옆 배치는 Lab이 아직 화면에 있을 때 뭉치므로
// 그때 화면에 들어와 있는 높은 자리에 두고, 나머지는 제목과 링크가 지나간 뒤에 뭉치므로 그 아래에 둔다
const CONTACT_ANCHOR_RATIO: Record<SceneProfile, number> = {
  side: 0.32,
  stacked: 0.6,
  mobile: 0.6,
};
// 데스크톱 Contact 덩어리의 x (화면 반너비 비율). 옆 배치는 제목 "Let's talk"의 오른쪽 끝을 넘겨야 하고,
// 문구 사이 배치는 화면이 좁아서 오른쪽 부품이 화면 밖으로 나가지 않는 자리다
const CONTACT_X_RATIO: Record<SceneProfile, number> = {
  side: 0.6,
  stacked: 0.5,
  mobile: 0,
};

// 덩어리와 문구, 덩어리와 화면 끝 사이에 남기는 간격 (장면 단위)
const CLUMP_EDGE_GAP = 0.5;
// Contact에서 다시 뭉친 덩어리는 이만큼 크다
const CONTACT_CLUMP_GROWTH = 1.1;
const MIN_ABOUT_CLUMP_RATIO = 0.35;

// 데스크톱은 히어로 중앙 조금 위에서 About 문구의 오른쪽에 남는 영역으로 간다. 세로로 긴 창처럼 그 영역이 덩어리보다
// 좁으면 덩어리를 영역에 맞춰 줄인다. 화면 반너비의 비율로 자리를 정하면 좁은 화면에서 덩어리가 문구를 덮는다. 휴대폰은 문구가 화면을 다 채우므로 덩어리를
// 히어로에 문서 기준으로 고정하고, 스크롤이 화면 높이의 22%를 넘으면 히어로와 함께 밀려 올라간다.
// Contact에서는 모두 섹션과 함께 올라오는 자리에 뭉친다. 화면에 고정하면 섹션이 들어오는 동안 제목이 덩어리를
// 지나가기 때문이다
export function computeClumpCenter(
  phases: ScenePhases,
  viewport: ViewportUnits,
  profile: SceneProfile,
  scrollY: number,
  layout: SceneLayoutMeasurements,
  output: ClumpCenter,
): ClumpCenter {
  const viewportHeightPixels = viewport.halfHeight * 2 * viewport.pixelsPerUnit;
  const baseScale = computeClumpScale(viewport.halfWidth);
  const contactScreenY =
    layout.contactTopPixels +
    viewportHeightPixels * CONTACT_ANCHOR_RATIO[profile] -
    scrollY;
  const contactY =
    viewport.halfHeight - contactScreenY / viewport.pixelsPerUnit;
  if (profile === "mobile") {
    const scrolledPastHero = Math.max(0, scrollY - viewportHeightPixels * 0.22);
    // 히어로와 함께 위로 밀려 올라가되, 화면 밖으로 완전히 나간 뒤에는 더 멀어지지 않게 한다
    const liftedUnits = Math.min(
      scrolledPastHero / viewport.pixelsPerUnit,
      viewport.halfHeight * 2.5,
    );
    const heroY = viewport.halfHeight * 0.35 + liftedUnits;
    output.x = 0;
    // 다시 뭉칠 때는 부품이 화면 아래 밖에서 올라오므로 도착점을 처음부터 Contact 자리로 둔다
    output.y = phases.regather > 0 ? contactY : heroY;
    output.scale =
      baseScale * (1 + phases.regather * (CONTACT_CLUMP_GROWTH - 1));
    return output;
  }

  const aboutTextRight =
    layout.aboutTextRightPixels / viewport.pixelsPerUnit - viewport.halfWidth;
  const freeWidth = viewport.halfWidth - aboutTextRight - CLUMP_EDGE_GAP * 2;
  const clumpWidth = (CLUMP_LEFT_EXTENT + CLUMP_RIGHT_EXTENT) * baseScale;
  const aboutRatio = Math.min(
    1,
    Math.max(MIN_ABOUT_CLUMP_RATIO, freeWidth / clumpWidth),
  );
  const aboutScale = baseScale * aboutRatio;
  // 남는 영역의 가운데에 둔다
  const aboutX =
    aboutTextRight +
    CLUMP_EDGE_GAP +
    Math.max(0, freeWidth - clumpWidth * aboutRatio) / 2 +
    CLUMP_LEFT_EXTENT * aboutScale;
  // 줄인 배율은 덩어리로 있는 동안에만 쓴다. 흩어진 부품의 크기는 자리 계산이 따로 정한다
  const aboutWeight =
    phases.clumpShift * Math.max(0, 1 - phases.spread - phases.regather);
  // 세로로 긴 창에서는 반너비의 비율로 둔 덩어리의 오른쪽 부품이 화면 밖으로 나가므로 화면 안으로 당긴다
  const contactX = Math.min(
    viewport.halfWidth * CONTACT_X_RATIO[profile],
    viewport.halfWidth -
      CLUMP_EDGE_GAP -
      CLUMP_RIGHT_EXTENT * baseScale * CONTACT_CLUMP_GROWTH,
  );
  if (profile === "stacked" && phases.regather > 0) {
    // 문구 사이 배치도 화면 아래 밖에서 올라오므로 도착점을 처음부터 Contact 자리로 둔다
    output.x = contactX;
    output.y = contactY;
  } else {
    output.x =
      aboutX * phases.clumpShift * (1 - phases.regather) +
      contactX * phases.regather;
    output.y = 0.4 * (1 - phases.regather) + contactY * phases.regather;
  }
  output.scale =
    baseScale *
    (1 + (aboutRatio - 1) * aboutWeight) *
    (1 + phases.regather * (CONTACT_CLUMP_GROWTH - 1));
  return output;
}
