export type ThemeName = "light" | "dark";

export interface ScenePalette {
  neutral: string;
  contrast: string;
  accent: string;
  // 포인트 색. 해, 확인 버튼, 입력 커서처럼 작은 요소에만 쓴다
  highlight: string;
  // 구름과 손잡이처럼 두 테마 모두에서 밝아야 하는 요소의 색
  bright: string;
  // 부품이 굳어지는 순간 도는 빛의 색
  glow: string;
  glyphDim: string;
  glyphBright: string;
  dot: string;
  // 가산 혼합은 밝은 배경에서 보이지 않아서 라이트 모드는 잉크처럼 일반 혼합으로 그린다
  additive: boolean;
  environmentIntensity: number;
  keyLightIntensity: number;
  ambientIntensity: number;
}

// accent 값은 tokens.css의 --accent(OKLCH)를 hex로 바꾼 값이다. three가 oklch 문자열을 읽지 못해서 여기만 hex다
export const SCENE_PALETTES: Record<ThemeName, ScenePalette> = {
  light: {
    neutral: "#ffffff",
    contrast: "#0d0e12",
    accent: "#0e4ec8",
    highlight: "#84cc16",
    bright: "#ffffff",
    glow: "#0e4ec8",
    glyphDim: "#3c4f9c",
    glyphBright: "#0b1450",
    dot: "#0e4ec8",
    additive: false,
    environmentIntensity: 0.9,
    keyLightIntensity: 2.2,
    ambientIntensity: 0.9,
  },
  dark: {
    neutral: "#15171e",
    contrast: "#eceef3",
    accent: "#5fa1f3",
    highlight: "#b4f03a",
    bright: "#eef1f7",
    glow: "#58e6e0",
    glyphDim: "#2b93b0",
    glyphBright: "#aef3ff",
    dot: "#57c8f2",
    additive: true,
    environmentIntensity: 1.3,
    keyLightIntensity: 1.5,
    ambientIntensity: 0.3,
  },
};
