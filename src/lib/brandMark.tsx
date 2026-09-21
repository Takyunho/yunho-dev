import type { ReactElement } from "react";

// globals.css의 다크 테마 토큰과 같은 값이다. ImageResponse는 CSS 변수를 읽지 못해서 따로 둔다
export const BRAND_COLORS = {
  background: "#0a0b0f",
  foreground: "#eceef3",
  muted: "#8a90a2",
  accent: "#5b6cff",
} as const;

const MARK_VIEW_BOX_SIZE = 32;

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
        viewBox={`0 0 ${MARK_VIEW_BOX_SIZE} ${MARK_VIEW_BOX_SIZE}`}
        fill="none"
      >
        <path
          d="M8.5 7 L16 17 L23.5 7 M16 17 L16 25"
          stroke={BRAND_COLORS.foreground}
          strokeWidth="3.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
