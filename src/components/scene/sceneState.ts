export const SECTION_IDS = [
  "hero",
  "about",
  "stack",
  "work",
  "lab",
  "contact",
] as const;

export type SectionId = (typeof SECTION_IDS)[number];

// 문구 사이 빈 공간. 문서 기준 픽셀이다
export interface SceneTextGap {
  top: number;
  bottom: number;
  // 위아래 섹션이 화면에 정렬됐을 때 부품이 잘리지 않고 들어갈 수 있는 높이
  band: number;
}

// 부품과 문구, 부품과 화면 끝 사이에 남기는 간격 (화면 높이 비율)
export const GAP_PADDING_RATIO = 0.05;

export interface SceneLayoutMeasurements {
  contentMarginPixels: number;
  aboutTextRightPixels: number;
  gaps: SceneTextGap[];
  contactTopPixels: number;
}

// 매 프레임 바뀌는 값이라 React state로 두지 않는다. DOM 쪽이 쓰고 3D 쪽이 useFrame에서 읽는다
export const sceneState = {
  // 0은 hero 중앙, 1은 about 중앙처럼 섹션 중앙을 정수로 하는 연속 값
  sectionProgress: 0,
  // About 섹션의 위쪽이 화면 위쪽에 맞춰졌을 때(헤더의 About을 눌러 도착하는 위치)의 sectionProgress.
  // 섹션이 화면보다 길수록 1보다 작아진다
  aboutArrivalProgress: 1,
  // NDC 좌표 (-1~1, 위쪽이 +y)
  pointer: { x: 0, y: 0 },
  pointerActive: false,
  // 커서가 움직인 NDC 거리를 쌓은 값. 파도의 세기이고 3D 쪽이 프레임마다 줄인다
  pointerEnergy: 0,
  accentOverride: null as string | null,
  layout: {
    // Stack 문구가 실제로 시작하는 x. 부품을 본문 옆에 둘 수 있는지 판단하는 여백이다
    contentMarginPixels: 0,
    // About 문구의 오른쪽 끝 x. 덩어리를 그 오른쪽에 남는 영역 안에 넣는 데 쓴다
    aboutTextRightPixels: 0,
    gaps: [] as SceneTextGap[],
    // Contact 섹션의 문서 기준 위쪽 y. 다시 뭉치는 덩어리를 이 섹션에 고정하고, 옆 배치에서는 부품이 건너가는
    // Lab과 Contact 사이 빈 줄의 위치로도 쓴다
    contactTopPixels: 0,
  },
};
