import type { ReactElement } from "react";

// tokens.css의 다크 테마 토큰과 같은 값이다. ImageResponse는 CSS 변수를 읽지 못해서 따로 둔다
export const BRAND_COLORS = {
  background: "#0a0b0f",
  foreground: "#eceef3",
  muted: "#b9bec6",
  accent: "#5fa1f3",
} as const;

// 헤더 로고도 같은 마크를 그린다
export const BRAND_MARK_VIEW_BOX_SIZE = 32;
export const BRAND_MARK_PATH = "M8.5 7 L16 17 L23.5 7 M16 17 L16 25";
export const BRAND_MARK_STROKE_WIDTH = 3.6;

interface BrandMarkOptions {
  size: number;
  // iOS는 홈 화면 아이콘에 자체 마스크를 씌우므로 apple-icon은 모서리를 둥글리지 않는다
  cornerRadius: number;
}

// 글꼴에 기대지 않고 SVG 경로로 그려서 16px로 줄어도 획 굵기가 유지된다
export function renderBrandMark({
  size,
  cornerRadius,
}: BrandMarkOptions): ReactElement {
  return (
    <div
      style={{
        display: "flex",
        width: size,
        height: size,
        borderRadius: cornerRadius,
        background: BRAND_COLORS.background,
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${BRAND_MARK_VIEW_BOX_SIZE} ${BRAND_MARK_VIEW_BOX_SIZE}`}
        fill="none"
      >
        <path
          d={BRAND_MARK_PATH}
          stroke={BRAND_COLORS.foreground}
          strokeWidth={BRAND_MARK_STROKE_WIDTH}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
