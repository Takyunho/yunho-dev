export type ThemeName = "light" | "dark";

export interface ScenePalette {
  neutral: string;
  contrast: string;
  accent: string;
  environmentIntensity: number;
  keyLightIntensity: number;
  ambientIntensity: number;
}

// accent 값은 globals.css의 --accent와 맞춘다
export const SCENE_PALETTES: Record<ThemeName, ScenePalette> = {
  light: {
    neutral: "#ffffff",
    contrast: "#0d0e12",
    accent: "#1a2ffb",
    environmentIntensity: 0.9,
    keyLightIntensity: 2.2,
    ambientIntensity: 0.9,
  },
  dark: {
    neutral: "#15171e",
    contrast: "#eceef3",
    accent: "#5b6cff",
    environmentIntensity: 1.3,
    keyLightIntensity: 1.4,
    ambientIntensity: 0.25,
  },
};
