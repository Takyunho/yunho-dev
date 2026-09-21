import {
  GAP_PADDING_RATIO,
  type SceneTextGap,
} from "@/components/scene/sceneState";
import {
  WIDEST_PART_WIDTH,
  type PartDefinition,
} from "@/components/scene/partDefinitions";

export const CAMERA_DISTANCE = 18;
export const FIELD_OF_VIEW = 35;
// 옆 배치에서 부품과 화면 끝 사이 기준 간격 (장면 단위)
export const EDGE_GAP = 0.7;
// 여백에 맞추려고 부품을 줄일 때의 하한. 이 배율로도 안 들어가면 문구 사이 배치로 바꾼다
export const MIN_SIDE_FIT_SCALE = 0.6;
export const MIN_STACKED_FIT_SCALE = 0.5;
// 문구 사이 부품이 머물려는 화면 높이 (위에서부터의 비율)
export const STICKY_VIEWPORT_RATIO = 0.3;

export interface ViewportUnits {
  halfWidth: number;
  halfHeight: number;
  // z = 0 평면에서 장면 단위 1이 몇 픽셀인지
  pixelsPerUnit: number;
}

export interface PartPlacement {
  x: number;
  y: number;
  z: number;
  fitScale: number;
}

export function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum);
}

export function createViewportUnits(): ViewportUnits {
  return { halfWidth: 1, halfHeight: 1, pixelsPerUnit: 1 };
}

export function createPartPlacement(): PartPlacement {
  return { x: 0, y: 0, z: 0, fitScale: 1 };
}

export function computeViewportUnits(
  widthPixels: number,
  heightPixels: number,
  output: ViewportUnits,
): ViewportUnits {
  const tangentHalfFov = Math.tan(((FIELD_OF_VIEW / 2) * Math.PI) / 180);
  output.halfHeight = tangentHalfFov * CAMERA_DISTANCE;
  output.halfWidth = output.halfHeight * (widthPixels / heightPixels);
  output.pixelsPerUnit = heightPixels / (2 * output.halfHeight);
  return output;
}

// 좁은 화면에서 덩어리가 화면을 넘지 않게 줄이는 배율
export function computeClumpScale(halfWidth: number): number {
  return Math.min(1, halfWidth / 5);
}

// 가장 넓은 부품을 하한 배율로 줄이고 최소 간격을 더한 너비가 여백에 들어가야 옆 배치다
export function isSideLayout(
  contentMarginUnits: number,
  clumpScale: number,
): boolean {
  return (
    contentMarginUnits >=
    WIDEST_PART_WIDTH * clumpScale * MIN_SIDE_FIT_SCALE + EDGE_GAP * 0.6
  );
}

// 부품이 어디에 머무는지에 따라 마지막 구간의 연출이 달라진다. side는 본문 양옆 여백, stacked는 문구 사이(태블릿)다
export type SceneProfile = "side" | "stacked" | "mobile";

export function resolveSceneProfile(
  isMobile: boolean,
  contentMarginPixels: number,
  viewport: ViewportUnits,
): SceneProfile {
  if (isMobile) return "mobile";
  const contentMarginUnits = contentMarginPixels / viewport.pixelsPerUnit;
  return isSideLayout(contentMarginUnits, computeClumpScale(viewport.halfWidth))
    ? "side"
    : "stacked";
}

export function placeAtSide(
  definition: PartDefinition,
  viewport: ViewportUnits,
  contentMarginUnits: number,
  clumpScale: number,
  output: PartPlacement,
): PartPlacement {
  const fullPartWidth = definition.halfWidth * 2 * clumpScale;
  const fitScale = clamp(
    contentMarginUnits / (fullPartWidth + EDGE_GAP),
    MIN_SIDE_FIT_SCALE,
    1,
  );
  const partHalfWidth = (fullPartWidth * fitScale) / 2;
  // 기본은 여백 한가운데다. 화면 끝에 닿지 않는 최소 거리와, 넓은 화면에서 본문 쪽으로 너무 들어오지 않는 최대 거리를 지킨다
  const edgeInset = clamp(
    contentMarginUnits / 2,
    partHalfWidth + EDGE_GAP * 0.6,
    partHalfWidth + EDGE_GAP * 2.5,
  );
  const z = definition.side[2] * 3;
  // 카메라에 가까운 부품은 원근 때문에 바깥으로 밀려 보이므로 깊이만큼 안쪽으로 당긴다
  const depthRatio = (CAMERA_DISTANCE - z) / CAMERA_DISTANCE;
  output.x = definition.side[0] * (viewport.halfWidth - edgeInset) * depthRatio;
  output.y = definition.side[1] * viewport.halfHeight * 1.3 * depthRatio;
  output.z = z;
  output.fitScale = fitScale;
  return output;
}

// 문구 사이 빈 공간에 둘씩 나란히 둔다. CSS sticky처럼 빈 공간 안에서는 정해진 화면 높이에 머물고,
// 빈 공간 끝에 닿으면 문구에 밀려 함께 스크롤된다
export function placeBetweenTexts(
  definition: PartDefinition,
  partHeight: number,
  gap: SceneTextGap,
  viewport: ViewportUnits,
  clumpScale: number,
  scrollY: number,
  output: PartPlacement,
): PartPlacement {
  const viewportHeightPixels = viewport.halfHeight * 2 * viewport.pixelsPerUnit;
  const fullPartWidth = definition.halfWidth * 2 * clumpScale;
  const partHeightPixels = partHeight * clumpScale * viewport.pixelsPerUnit;
  const padding = viewportHeightPixels * GAP_PADDING_RATIO;
  const fitScale = clamp(
    Math.min(
      (viewport.halfWidth * 0.8) / fullPartWidth,
      gap.band / partHeightPixels,
    ),
    MIN_STACKED_FIT_SCALE,
    1,
  );
  const partHalfHeightPixels = (partHeightPixels * fitScale) / 2;
  const lowestY = gap.top + padding + partHalfHeightPixels;
  const highestY = gap.bottom - padding - partHalfHeightPixels;
  const documentY =
    lowestY <= highestY
      ? clamp(
          scrollY + viewportHeightPixels * STICKY_VIEWPORT_RATIO,
          lowestY,
          highestY,
        )
      : (gap.top + gap.bottom) / 2;
  const screenY = documentY - scrollY;
  output.x = definition.gap[1] * viewport.halfWidth * 0.45;
  output.y = viewport.halfHeight - screenY / viewport.pixelsPerUnit;
  output.z = 0;
  output.fitScale = fitScale;
  return output;
}
