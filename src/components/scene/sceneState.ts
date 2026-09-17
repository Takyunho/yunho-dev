export const SECTION_IDS = [
  "hero",
  "about",
  "stack",
  "work",
  "lab",
  "contact",
] as const;

export type SectionId = (typeof SECTION_IDS)[number];

// 매 프레임 바뀌는 값이라 React state로 두지 않는다. DOM 쪽이 쓰고 3D 쪽이 useFrame에서 읽는다
export const sceneState = {
  // 0은 hero 중앙, 1은 about 중앙처럼 섹션 중앙을 정수로 하는 연속 값
  sectionProgress: 0,
  // NDC 좌표 (-1~1, 위쪽이 +y)
  pointer: { x: 0, y: 0 },
  pointerActive: false,
  accentOverride: null as string | null,
};
