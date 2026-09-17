import { SECTION_IDS, type SectionId } from "@/components/scene/sceneState";

export interface SceneKeyframe {
  // 끌개 중심. 뷰포트 너비와 높이에 대한 비율이다 (0이 화면 중앙)
  centerX: number;
  centerY: number;
  // 각자의 자리로 흩어지는 정도. 뷰포트 반너비와 반높이에 대한 비율이고, 0이면 한 점으로 뭉친다.
  // spreadX가 1이면 오브젝트 중심이 화면 좌우 끝에 놓여서 절반만 보인다
  spreadX: number;
  spreadY: number;
  attractionStrength: number;
  cameraDistance: number;
}

const DESKTOP_KEYFRAMES: Record<SectionId, SceneKeyframe> = {
  hero: {
    centerX: 0,
    centerY: 0.1,
    spreadX: 0,
    spreadY: 0,
    attractionStrength: 0.22,
    cameraDistance: 18,
  },
  about: {
    centerX: 0.26,
    centerY: 0,
    spreadX: 0,
    spreadY: 0,
    attractionStrength: 0.22,
    cameraDistance: 21,
  },
  stack: {
    centerX: 0,
    centerY: 0,
    spreadX: 1.0,
    spreadY: 1.05,
    attractionStrength: 0.12,
    cameraDistance: 22,
  },
  work: {
    centerX: 0,
    centerY: 0,
    spreadX: 1.0,
    spreadY: 1.05,
    attractionStrength: 0.12,
    cameraDistance: 22,
  },
  lab: {
    centerX: 0,
    centerY: 0,
    spreadX: 1.0,
    spreadY: 1.05,
    attractionStrength: 0.12,
    cameraDistance: 22,
  },
  contact: {
    centerX: 0,
    centerY: -0.22,
    spreadX: 0,
    spreadY: 0,
    attractionStrength: 0.24,
    cameraDistance: 15,
  },
};

// 모바일은 본문이 화면 너비를 다 쓰기 때문에 hero와 contact 외에는 가장자리로 퍼뜨리고,
// 좁은 화면에서 오브젝트가 본문을 덮지 않도록 카메라를 멀리 빼서 작게 보이게 한다
const MOBILE_KEYFRAMES: Record<SectionId, SceneKeyframe> = {
  hero: {
    centerX: 0,
    centerY: 0.16,
    spreadX: 0,
    spreadY: 0,
    attractionStrength: 0.22,
    cameraDistance: 24,
  },
  about: {
    centerX: 0,
    centerY: 0,
    spreadX: 1.1,
    spreadY: 1.0,
    attractionStrength: 0.12,
    cameraDistance: 40,
  },
  stack: {
    centerX: 0,
    centerY: 0,
    spreadX: 1.1,
    spreadY: 1.0,
    attractionStrength: 0.12,
    cameraDistance: 40,
  },
  work: {
    centerX: 0,
    centerY: 0,
    spreadX: 1.1,
    spreadY: 1.0,
    attractionStrength: 0.12,
    cameraDistance: 40,
  },
  lab: {
    centerX: 0,
    centerY: 0,
    spreadX: 1.1,
    spreadY: 1.0,
    attractionStrength: 0.12,
    cameraDistance: 40,
  },
  contact: {
    centerX: 0,
    centerY: -0.2,
    spreadX: 0,
    spreadY: 0,
    attractionStrength: 0.24,
    cameraDistance: 22,
  },
};

const KEYFRAME_FIELDS: (keyof SceneKeyframe)[] = [
  "centerX",
  "centerY",
  "spreadX",
  "spreadY",
  "attractionStrength",
  "cameraDistance",
];

export function createSceneKeyframe(): SceneKeyframe {
  return { ...DESKTOP_KEYFRAMES.hero };
}

function smoothstep(ratio: number): number {
  return ratio * ratio * (3 - 2 * ratio);
}

// 프레임마다 객체를 새로 만들지 않도록 결과를 output에 덮어쓴다
export function sampleChoreography(
  sectionProgress: number,
  isMobile: boolean,
  output: SceneKeyframe,
): SceneKeyframe {
  const keyframes = isMobile ? MOBILE_KEYFRAMES : DESKTOP_KEYFRAMES;
  const lastIndex = SECTION_IDS.length - 1;
  const clampedProgress = Math.min(Math.max(sectionProgress, 0), lastIndex);
  const currentIndex = Math.min(Math.floor(clampedProgress), lastIndex - 1);
  const easedRatio = smoothstep(clampedProgress - currentIndex);

  const currentKeyframe = keyframes[SECTION_IDS[currentIndex]];
  const nextKeyframe = keyframes[SECTION_IDS[currentIndex + 1]];

  for (const field of KEYFRAME_FIELDS) {
    output[field] =
      currentKeyframe[field] +
      (nextKeyframe[field] - currentKeyframe[field]) * easedRatio;
  }
  return output;
}
