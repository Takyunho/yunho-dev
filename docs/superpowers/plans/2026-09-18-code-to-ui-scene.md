# 코드가 UI 부품이 되는 장면 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** v1.0.0의 물리 덩어리 장면을, 코드 글자 입자가 UI 부품으로 굳어졌다가 본문 옆이나 문구 사이에 머물고 마지막에 점으로 풀려 파도치는 장면으로 교체한다.

**Architecture:** 고정된 투명 R3F `Canvas` 하나에 `GlyphParticles`(Points 하나, 정점 셰이더가 기둥, 모임, 웅덩이 단계를 계산)와 `UiParts`(코드로 만든 부품 group 여섯 개)가 있고, 둘은 부품 행렬 배열을 공유한다. DOM 쪽 `SceneStateSync`가 스크롤 진행도, 포인터, 포인터 에너지, 본문 여백과 문구 사이 빈 공간을 `sceneState`에 쓰고, 3D 쪽은 `sectionChoreography`로 진행도를 단계 값으로 바꾸고 `sceneLayout`으로 부품 자리를 계산한다. 파도 높이는 `waveSurface` 모듈의 배열을 3D가 쓰고 Contact의 글자가 읽는다.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, Tailwind CSS 4, three 0.183, @react-three/fiber 9, @react-three/drei 10, gsap(ScrollTrigger), lenis, next-themes

**Spec:** `docs/superpowers/specs/2026-09-18-code-to-ui-scene-design.md`

## Global Constraints

- `@react-three/rapier` 패키지는 `package.json`에서 지우지 않는다. 장면 코드에서 import하는 곳만 없앤다.
- 새 패키지를 추가하지 않는다. `MeshSurfaceSampler`와 `RoundedBoxGeometry`는 `three/addons`에서 가져온다.
- Next.js는 15.5.x를 유지하고 후처리 패키지를 넣지 않는다.
- 카메라는 z 18, fov 35로 고정한다. 섹션별 카메라 거리를 두지 않는다.
- 저장소에 테스트 러너가 없다. 각 Task의 검증은 `pnpm lint`와 `pnpm build`다. **`pnpm build` 전에 `lsof -i :3000`으로 dev 서버가 떠 있는지 확인한다.** Next.js 15는 dev와 build가 같은 `.next`를 써서 build가 실행 중인 dev 서버를 망가뜨린다. 떠 있으면 사용자에게 알리고 `pnpm exec tsc --noEmit`으로 타입 검사만 한 뒤, 사용자가 서버를 내린 후 build한다. 사용자가 띄운 프로세스를 직접 죽이지 않는다.
- 커밋, 푸시, PR은 사용자가 요청할 때만 한다. 계획에 커밋 단계를 두지 않는다.
- 변수와 파라미터 이름은 축약하지 않는다 (`e` 대신 `event`, `el` 대신 `element`).
- 주석은 코드만으로 읽히지 않는 사실만 한 줄로 쓴다. 파일 안의 주석은 한국어다.
- 섹션의 DOM `id`는 `SectionId` 값과 같다: `hero`, `about`, `stack`, `work`, `lab`, `contact`.
- 참고했던 외부 사이트 이름을 코드, 주석, 문서 어디에도 쓰지 않는다.
- 파일 삭제는 설계에서 승인된 네 파일(`PhysicsCluster.tsx`, `PointerCollider.tsx`, `clusterBodies.ts`, `useClusterMaterials.ts`)만 한다.

## 파일 구조

| 파일                                          | 책임                                                                      |
| :-------------------------------------------- | :------------------------------------------------------------------------ |
| `src/components/scene/sceneState.ts`          | DOM과 3D가 공유하는 가변 상태와 섹션 id                                   |
| `src/components/scene/themePalette.ts`        | 테마별 부품 재질색, 입자색, 혼합 방식, 조명 강도                          |
| `src/components/scene/sceneLayout.ts`         | 장면 단위 변환, 배치 방식 선택, 옆 배치와 문구 사이 배치 계산 (순수 함수) |
| `src/components/scene/partDefinitions.ts`     | 부품 여섯 개의 생성 함수와 배치 속성, 높이 측정                           |
| `src/components/scene/usePartMaterials.ts`    | 역할별 재질 3개와 테마 보간                                               |
| `src/components/scene/usePartGroups.ts`       | 부품 group, 높이, 행렬 배열을 한 번 만들어 공유                           |
| `src/components/scene/sectionChoreography.ts` | 섹션 진행도를 단계 값으로 바꾸는 타임라인                                 |
| `src/components/scene/UiParts.tsx`            | 부품 렌더링, 매 프레임 자리와 재질, 커서 반응, 안개 불투명도              |
| `src/components/scene/waveSurface.ts`         | 1차원 수면 시뮬레이션과 높이 배열                                         |
| `src/components/scene/glyphAtlas.ts`          | 글자판 텍스처와 코드 코퍼스                                               |
| `src/components/scene/glyphShaders.ts`        | 입자 정점 셰이더와 조각 셰이더 문자열                                     |
| `src/components/scene/GlyphParticles.tsx`     | Points 생성, 속성 채우기, 매 프레임 uniform과 파도 갱신                   |
| `src/components/scene/Scene.tsx`              | Canvas와 하위 조립                                                        |
| `src/components/layout/Atmosphere.tsx`        | 안개 층                                                                   |
| `src/components/layout/SceneStateSync.tsx`    | 스크롤, 포인터와 에너지, 레이아웃 측정                                    |
| `src/components/sections/WaveText.tsx`        | 문자열을 단어와 글자 span으로 렌더링                                      |
| `src/hooks/useWaveText.ts`                    | 글자 자리 측정과 매 틱 transform 적용                                     |

설계 문서의 `glyphParticles.glsl.ts`는 이 계획에서 `glyphShaders.ts`로 이름만 단순하게 했다.

---

### Task 1: 상태 확장, 레이아웃 측정, 안개 층, 스크롤 옵션

이 Task는 기존 장면을 깨지 않는 추가 작업만 한다. 끝나면 DOM 쪽이 새 상태를 채우고 안개 층이 보이지만 3D는 아직 v1.0.0 그대로다.

**Files:**

- Modify: `src/components/scene/sceneState.ts`
- Modify: `src/components/scene/themePalette.ts`
- Modify: `src/components/layout/SceneStateSync.tsx`
- Modify: `src/components/layout/SmoothScroll.tsx`
- Create: `src/components/layout/Atmosphere.tsx`
- Modify: `src/app/globals.css`
- Modify: `src/app/page.tsx`
- Modify: `src/components/sections/SectionHeading.tsx`, `AboutSection.tsx`, `StackSection.tsx`, `WorkSection.tsx`, `LabSection.tsx`, `HeroSection.tsx`

**Interfaces:**

- Produces: `sceneState.pointerEnergy: number`, `sceneState.layout: { contentMarginPixels: number; gaps: SceneTextGap[]; contactTopPixels: number }`, `SceneTextGap { top; bottom; band }`, `GAP_PADDING_RATIO`, `SCENE_PALETTES[theme].glyphDim | glyphBright | dot | glow | additive`.
- CSS 변수 `--atmosphere-opacity`(기본 1), `--atmosphere-a`, `--atmosphere-b`, `--title-shade`.

- [ ] **Step 1: `sceneState.ts`를 아래로 바꾼다**

```ts
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
    // Contact 섹션의 문서 기준 위쪽 y. 휴대폰에서 다시 뭉치는 덩어리를 이 섹션에 고정하는 데 쓴다
    contactTopPixels: 0,
  },
};
```

- [ ] **Step 2: `themePalette.ts`를 아래로 바꾼다**

```ts
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

// accent 값은 globals.css의 --accent와 맞춘다
export const SCENE_PALETTES: Record<ThemeName, ScenePalette> = {
  light: {
    neutral: "#ffffff",
    contrast: "#0d0e12",
    accent: "#1a2ffb",
    highlight: "#84cc16",
    bright: "#ffffff",
    glow: "#1a2ffb",
    glyphDim: "#3c4f9c",
    glyphBright: "#0b1450",
    dot: "#1a2ffb",
    additive: false,
    environmentIntensity: 0.9,
    keyLightIntensity: 2.2,
    ambientIntensity: 0.9,
  },
  dark: {
    neutral: "#15171e",
    contrast: "#eceef3",
    accent: "#5b6cff",
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
```

- [ ] **Step 3: 섹션에 측정용 표식을 단다**

`SectionHeading.tsx`의 측정용 표식과 reveal 변형을 분리한다. 바깥 `div`는 `data-scene-text`와 여백 클래스를 유지하고, `<p>`와 `<h2>`를 감싸는 안쪽 `div`를 새로 두어 거기에 `data-reveal`을 단다.

```tsx
<div data-scene-text className="mb-12 md:mb-20">
  <div data-reveal>
    <p className="font-mono text-xs tracking-[0.2em] text-muted uppercase">
      {index} / {caption}
    </p>
    <h2 className="mt-3 text-[clamp(2.75rem,8vw,7rem)] leading-none font-semibold tracking-tighter text-fg">
      {title}
    </h2>
  </div>
</div>
```

`AboutSection.tsx`의 `<div className="md:w-1/2">`를 `<div data-scene-text className="md:w-1/2">`로 바꾼다.

`StackSection.tsx`의 `<ul className="border-b border-line">`를 `<ul data-scene-text className="border-b border-line">`로 바꾼다.

`WorkSection.tsx`의 `<div className="space-y-8 md:space-y-12">`를 `<div data-scene-text className="space-y-8 md:space-y-12">`로 바꾼다.

`LabSection.tsx`의 `<ul className="border-b border-line">`를 `<ul data-scene-text className="border-b border-line">`로 바꾼다.

`HeroSection.tsx`에서 제목과 문구를 감싸는 `<div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">`를 아래로 바꾼다. 뒤로 지나가는 글자 기둥을 눌러 제목이 읽히게 하는 가림 배경이다.

```tsx
<div className="relative flex flex-col gap-8 before:absolute before:-inset-x-[8%] before:-inset-y-[18%] before:-z-10 before:rounded-[50%] before:bg-[radial-gradient(ellipse_at_50%_60%,var(--title-shade),transparent_72%)] before:content-[''] md:flex-row md:items-end md:justify-between">
```

- [ ] **Step 4: `globals.css`에 토큰과 안개 층 스타일을 더한다**

`:root` 블록 끝에 추가한다.

```css
--atmosphere-a: rgba(26, 47, 251, 0.1);
--atmosphere-b: rgba(0, 150, 170, 0.1);
--atmosphere-vignette: transparent;
--title-shade: rgba(240, 241, 245, 0.85);
```

`[data-theme="dark"]` 블록 끝에 추가한다.

```css
--atmosphere-a: rgba(30, 138, 150, 0.5);
--atmosphere-b: rgba(88, 66, 176, 0.44);
--atmosphere-vignette: rgba(0, 0, 0, 0.35);
--title-shade: rgba(10, 11, 15, 0.78);
```

파일 끝에 추가한다.

```css
/* 몽환적인 색은 셰이더가 아니라 이 안개 층이 만든다. 부품이 굳어지면 3D 쪽이 --atmosphere-opacity를 낮춘다 */
.atmosphere {
  opacity: var(--atmosphere-opacity, 1);
  background:
    radial-gradient(
      ellipse 70% 60% at 24% 86%,
      var(--atmosphere-a),
      transparent 70%
    ),
    radial-gradient(
      ellipse 60% 55% at 80% 12%,
      var(--atmosphere-b),
      transparent 70%
    ),
    radial-gradient(
      ellipse 120% 90% at 50% 50%,
      transparent 55%,
      var(--atmosphere-vignette) 100%
    );
}
```

- [ ] **Step 5: `Atmosphere.tsx`를 만든다**

```tsx
export default function Atmosphere() {
  return (
    <div
      aria-hidden="true"
      className="atmosphere pointer-events-none fixed inset-0 z-0"
    />
  );
}
```

- [ ] **Step 6: `page.tsx`에서 `SceneLoader` 앞에 `Atmosphere`를 둔다**

```tsx
import Atmosphere from "@/components/layout/Atmosphere";
```

```tsx
      <SmoothScroll />
      <SceneStateSync />
      <Atmosphere />
      <SceneLoader />
```

둘 다 `fixed z-0`이라 DOM 순서대로 안개가 뒤, Canvas가 앞에 그려진다.

- [ ] **Step 7: `SmoothScroll.tsx`의 Lenis 옵션을 바꾼다**

```ts
// lerp가 작을수록 멈출 때까지 길게 미끄러지고, wheelMultiplier가 작을수록 휠 한 번에 덜 움직인다
const lenis = new Lenis({
  autoRaf: false,
  anchors: true,
  lerp: 0.05,
  wheelMultiplier: 0.7,
});
```

- [ ] **Step 8: `SceneStateSync.tsx`를 아래로 바꾼다**

```tsx
"use client";

import { useEffect } from "react";
import {
  GAP_PADDING_RATIO,
  SECTION_IDS,
  sceneState,
  type SceneTextGap,
  type SectionId,
} from "@/components/scene/sceneState";
import { useReducedMotion } from "@/hooks/useReducedMotion";

// 부품이 둘씩 들어가는 문구 사이 빈 공간. 순서가 partDefinitions의 gap 번호다
const TEXT_GAP_PAIRS: [SectionId, SectionId][] = [
  ["about", "stack"],
  ["stack", "work"],
  ["work", "lab"],
];
const POINTER_ENERGY_PER_DISTANCE = 6;
const POINTER_ENERGY_MAX = 1.5;

function measureSectionCenters(): number[] {
  return SECTION_IDS.map((sectionId) => {
    const sectionElement = document.getElementById(sectionId);
    if (!sectionElement) return 0;
    const sectionRect = sectionElement.getBoundingClientRect();
    return sectionRect.top + window.scrollY + sectionRect.height / 2;
  });
}

function computeSectionProgress(sectionCenters: number[]): number {
  const viewportCenter = window.scrollY + window.innerHeight / 2;
  const lastIndex = sectionCenters.length - 1;

  if (viewportCenter <= sectionCenters[0]) return 0;
  if (viewportCenter >= sectionCenters[lastIndex]) return lastIndex;

  for (let index = 0; index < lastIndex; index += 1) {
    const currentCenter = sectionCenters[index];
    const nextCenter = sectionCenters[index + 1];
    if (viewportCenter < nextCenter) {
      return (
        index + (viewportCenter - currentCenter) / (nextCenter - currentCenter)
      );
    }
  }
  return lastIndex;
}

interface TextBounds {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

// 섹션 안의 data-scene-text 요소들을 합친 사각형. 제목과 목록처럼 나뉘어 있어도 하나로 본다
function measureTextBounds(sectionId: SectionId): TextBounds | null {
  const sectionElement = document.getElementById(sectionId);
  if (!sectionElement) return null;
  const textElements = sectionElement.querySelectorAll("[data-scene-text]");
  if (textElements.length === 0) return null;

  let top = Infinity;
  let bottom = -Infinity;
  let left = Infinity;
  let right = -Infinity;
  textElements.forEach((textElement) => {
    const rect = textElement.getBoundingClientRect();
    top = Math.min(top, rect.top);
    bottom = Math.max(bottom, rect.bottom);
    left = Math.min(left, rect.left);
    right = Math.max(right, rect.right);
  });
  return { top, bottom, left, right };
}

function measureTextGaps(): SceneTextGap[] {
  const padding = window.innerHeight * GAP_PADDING_RATIO;
  return TEXT_GAP_PAIRS.map(([aboveId, belowId]) => {
    const aboveSection = document.getElementById(aboveId);
    const belowSection = document.getElementById(belowId);
    const aboveText = measureTextBounds(aboveId);
    const belowText = measureTextBounds(belowId);
    if (!aboveSection || !belowSection || !aboveText || !belowText) {
      return { top: 0, bottom: 0, band: 0 };
    }
    // 위 섹션이 정렬됐을 때 문구 아래에 남는 여백과 아래 섹션이 정렬됐을 때 문구 위에 남는 여백 중 좁은 쪽
    const spaceBelowAbove =
      aboveSection.getBoundingClientRect().bottom - aboveText.bottom;
    const spaceAboveBelow =
      belowText.top - belowSection.getBoundingClientRect().top;
    return {
      top: aboveText.bottom + window.scrollY,
      bottom: belowText.top + window.scrollY,
      band: Math.min(spaceBelowAbove, spaceAboveBelow) - padding * 2,
    };
  });
}

function measureLayout() {
  sceneState.layout.contentMarginPixels = measureTextBounds("stack")?.left ?? 0;
  sceneState.layout.aboutTextRightPixels =
    measureTextBounds("about")?.right ?? 0;
  sceneState.layout.gaps = measureTextGaps();
  const contactSection = document.getElementById("contact");
  sceneState.layout.contactTopPixels = contactSection
    ? contactSection.getBoundingClientRect().top + window.scrollY
    : 0;
}

export default function SceneStateSync() {
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) {
      sceneState.sectionProgress = 0;
      measureLayout();
      return;
    }

    let sectionCenters = measureSectionCenters();
    let disposed = false;

    const updateSectionProgress = () => {
      sceneState.sectionProgress = computeSectionProgress(sectionCenters);
    };
    const remeasure = () => {
      sectionCenters = measureSectionCenters();
      measureLayout();
      updateSectionProgress();
    };

    // 글꼴 로딩처럼 resize 없이 섹션 높이가 바뀌는 경우까지 잡는다
    const resizeObserver = new ResizeObserver(remeasure);
    resizeObserver.observe(document.body);
    window.addEventListener("resize", remeasure);
    window.addEventListener("scroll", updateSectionProgress, { passive: true });
    document.fonts.ready.then(() => {
      if (!disposed) remeasure();
    });
    remeasure();

    return () => {
      disposed = true;
      resizeObserver.disconnect();
      window.removeEventListener("resize", remeasure);
      window.removeEventListener("scroll", updateSectionProgress);
    };
  }, [reducedMotion]);

  useEffect(() => {
    if (reducedMotion) {
      sceneState.pointerActive = false;
      return;
    }

    const setPointerFromEvent = (event: PointerEvent) => {
      sceneState.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
      sceneState.pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
      sceneState.pointerActive = true;
    };
    const handlePointerMove = (event: PointerEvent) => {
      const previousX = sceneState.pointer.x;
      const previousY = sceneState.pointer.y;
      const wasActive = sceneState.pointerActive;
      setPointerFromEvent(event);
      // 창 밖에서 다시 들어온 첫 이동은 옛 좌표와의 거리라서 에너지로 쌓지 않는다
      if (wasActive) {
        // 많이 움직일수록 파도를 세게 일으킨다
        const movedDistance = Math.hypot(
          sceneState.pointer.x - previousX,
          sceneState.pointer.y - previousY,
        );
        sceneState.pointerEnergy = Math.min(
          sceneState.pointerEnergy +
            movedDistance * POINTER_ENERGY_PER_DISTANCE,
          POINTER_ENERGY_MAX,
        );
      }
    };
    // 터치 스크롤 중에는 pointermove가 오지 않으므로 탭이 그 자리에서 파도를 일으킨다
    const handlePointerDown = (event: PointerEvent) => {
      if (event.pointerType === "mouse") return;
      setPointerFromEvent(event);
      sceneState.pointerEnergy = 1;
    };
    const deactivatePointer = () => {
      sceneState.pointerActive = false;
    };
    // 터치는 손가락을 떼면 포인터가 사라진다
    const handlePointerUp = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") deactivatePointer();
    };

    window.addEventListener("pointermove", handlePointerMove, {
      passive: true,
    });
    window.addEventListener("pointerdown", handlePointerDown, {
      passive: true,
    });
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", deactivatePointer);
    window.addEventListener("blur", deactivatePointer);
    document.documentElement.addEventListener(
      "pointerleave",
      deactivatePointer,
    );

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", deactivatePointer);
      window.removeEventListener("blur", deactivatePointer);
      document.documentElement.removeEventListener(
        "pointerleave",
        deactivatePointer,
      );
    };
  }, [reducedMotion]);

  return null;
}
```

- [ ] **Step 9: lint와 타입 검사**

Run: `pnpm lint`
Expected: 오류 없음.

Run: `lsof -i :3000` 으로 dev 서버 확인 후, 없으면 `pnpm build`, 있으면 `pnpm exec tsc --noEmit`
Expected: 오류 없음. 기존 `PhysicsCluster`는 `themePalette`의 새 필드를 쓰지 않으므로 그대로 컴파일된다.

---

### Task 2: 부품 정의, 재질, 배치 계산

이 Task도 추가만 한다. 새 모듈은 아직 아무도 import하지 않는다.

**Files:**

- Create: `src/components/scene/sceneLayout.ts`
- Create: `src/components/scene/partDefinitions.ts`
- Create: `src/components/scene/usePartMaterials.ts`
- Create: `src/components/scene/usePartGroups.ts`

**Interfaces:**

- Consumes: `sceneState.layout`, `GAP_PADDING_RATIO`, `SceneTextGap`, `SCENE_PALETTES`.
- Produces:
  - `sceneLayout`: `CAMERA_DISTANCE`, `FIELD_OF_VIEW`, `ViewportUnits { halfWidth; halfHeight; pixelsPerUnit }`, `computeViewportUnits(widthPixels, heightPixels, output)`, `computeClumpScale(halfWidth)`, `isSideLayout(contentMarginUnits, clumpScale)`, `SceneProfile`, `resolveSceneProfile(isMobile, contentMarginPixels, viewport)`, `PartPlacement { x; y; z; fitScale }`, `placeAtSide(definition, viewport, contentMarginUnits, clumpScale, output)`, `placeBetweenTexts(definition, partHeight, gap, viewport, clumpScale, scrollY, output)`, `clamp(value, minimum, maximum)`.
  - `partDefinitions`: `PartRole`, `PartMaterials`, `PartDefinition`, `PART_DEFINITIONS`, `PART_COUNT`, `WIDEST_PART_WIDTH`, `measurePartHeight(group, definition)`.
  - `usePartMaterials(themeName, instant): PartMaterials`.
  - `usePartGroups(materials): PartSet { groups: THREE.Group[]; heights: number[]; matrices: THREE.Matrix4[] }`.

- [ ] **Step 1: `sceneLayout.ts`를 만든다**

```ts
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
```

- [ ] **Step 2: `partDefinitions.ts`를 만든다**

```ts
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

// highlight는 포인트 색(라임)이라 작은 요소에만 쓴다. bright는 테마가 바뀌어도 밝게 남는 색이다
export type PartRole =
  | "neutral"
  | "contrast"
  | "accent"
  | "highlight"
  | "bright";
export type PartMaterials = Record<PartRole, THREE.MeshPhysicalMaterial>;

export interface PartDefinition {
  key: string;
  create: (materials: PartMaterials) => THREE.Group;
  // 옆 배치에서 화면 끝에서 얼마나 들여놓을지 정하는 부품의 반너비 (장면 단위)
  halfWidth: number;
  // 뭉쳤을 때 중심에서의 상대 위치
  clump: [number, number, number];
  rotation: [number, number, number];
  // 옆 배치의 방향(-1 왼쪽, 1 오른쪽), 세로 비율, 깊이
  side: [number, number, number];
  // 문구 사이 배치의 빈 공간 번호(0은 About과 Stack 사이)와 좌우
  gap: [number, -1 | 1];
}

const UP_DIRECTION = new THREE.Vector3(0, 1, 0);

// 한쪽 테마에서만 보이는 메시에 붙이는 표식. UiParts가 테마에 맞춰 보이기를 바꾸고, 입자는 이런 메시에 내려앉지 않는다
export const THEME_ONLY_KEY = "themeOnly";
export type ThemeOnly = "light" | "dark";

function showOnlyIn(meshes: THREE.Mesh[], themeOnly: ThemeOnly) {
  meshes.forEach((mesh) => {
    mesh.userData[THEME_ONLY_KEY] = themeOnly;
  });
}

function addMesh(
  group: THREE.Group,
  geometry: THREE.BufferGeometry,
  material: THREE.Material,
  position: [number, number, number] = [0, 0, 0],
  rotation: [number, number, number] = [0, 0, 0],
): THREE.Mesh {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(...position);
  mesh.rotation.set(...rotation);
  group.add(mesh);
  return mesh;
}

function addCapsuleBetween(
  group: THREE.Group,
  material: THREE.Material,
  start: [number, number],
  end: [number, number],
  radius: number,
  depth = 0,
): THREE.Mesh {
  const startPoint = new THREE.Vector3(start[0], start[1], depth);
  const endPoint = new THREE.Vector3(end[0], end[1], depth);
  const direction = endPoint.clone().sub(startPoint);
  const mesh = new THREE.Mesh(
    new THREE.CapsuleGeometry(radius, direction.length(), 8, 16),
    material,
  );
  mesh.position.copy(startPoint).add(endPoint).multiplyScalar(0.5);
  mesh.quaternion.setFromUnitVectors(UP_DIRECTION, direction.normalize());
  group.add(mesh);
  return mesh;
}

function createBrowserWindow(materials: PartMaterials): THREE.Group {
  const group = new THREE.Group();
  addMesh(
    group,
    new RoundedBoxGeometry(3.0, 2.0, 0.22, 5, 0.16),
    materials.neutral,
  );
  const dotGeometry = new THREE.SphereGeometry(0.075, 16, 16);
  addMesh(group, dotGeometry, materials.accent, [-1.23, 0.77, 0.13]);
  addMesh(group, dotGeometry, materials.contrast, [-1.02, 0.77, 0.13]);
  addMesh(group, dotGeometry, materials.contrast, [-0.8, 0.77, 0.13]);
  addMesh(
    group,
    new RoundedBoxGeometry(1.58, 0.17, 0.06, 3, 0.08),
    materials.contrast,
    [0.38, 0.77, 0.12],
  );
  addMesh(
    group,
    new RoundedBoxGeometry(1.12, 0.96, 0.08, 3, 0.1),
    materials.accent,
    [-0.75, -0.18, 0.13],
  );
  addMesh(
    group,
    new RoundedBoxGeometry(1.2, 0.14, 0.06, 3, 0.06),
    materials.contrast,
    [0.68, 0.17, 0.12],
  );
  addMesh(
    group,
    new RoundedBoxGeometry(1.2, 0.14, 0.06, 3, 0.06),
    materials.contrast,
    [0.68, -0.12, 0.12],
  );
  addMesh(
    group,
    new RoundedBoxGeometry(0.75, 0.14, 0.06, 3, 0.06),
    materials.contrast,
    [0.45, -0.4, 0.12],
  );
  return group;
}

interface DeviceSpec {
  center: [number, number, number];
  // 기기 몸체의 너비와 높이
  size: [number, number];
  cornerRadius: number;
  // 넓은 화면은 그림과 글줄이 나란히, 좁은 화면은 위아래로 쌓인다
  stacked: boolean;
}

// 기기 하나. 몸체, 화면, 그리고 화면 안의 같은 레이아웃(상단 바, 그림 블록, 글줄, 버튼)이다
function addDevice(
  group: THREE.Group,
  materials: PartMaterials,
  { center, size, cornerRadius, stacked }: DeviceSpec,
) {
  const [centerX, centerY, centerZ] = center;
  const [bodyWidth, bodyHeight] = size;
  const bezel = 0.07;
  const screenWidth = bodyWidth - bezel * 2;
  const screenHeight = bodyHeight - bezel * 2;
  addMesh(
    group,
    new RoundedBoxGeometry(bodyWidth, bodyHeight, 0.12, 4, cornerRadius),
    materials.neutral,
    center,
  );
  addMesh(
    group,
    new RoundedBoxGeometry(screenWidth, screenHeight, 0.04, 3, 0.04),
    materials.contrast,
    [centerX, centerY, centerZ + 0.06],
  );

  const contentZ = centerZ + 0.095;
  const padding = screenWidth * 0.08;
  const contentWidth = screenWidth - padding * 2;
  const contentLeft = centerX - contentWidth / 2;
  const barHeight = screenHeight * 0.09;
  const barY = centerY + screenHeight / 2 - padding - barHeight / 2;
  const addBlock = (
    material: THREE.Material,
    left: number,
    top: number,
    width: number,
    height: number,
  ) => {
    addMesh(
      group,
      new RoundedBoxGeometry(width, height, 0.04, 2, Math.min(0.03, height / 3)),
      material,
      [left + width / 2, top - height / 2, contentZ],
    );
  };
  addBlock(
    materials.neutral,
    contentLeft,
    barY + barHeight / 2,
    contentWidth,
    barHeight,
  );

  const bodyTop = barY - barHeight / 2 - padding;
  const bodyBottom = centerY - screenHeight / 2 + padding;
  const bodyHeightAvailable = bodyTop - bodyBottom;
  const lineHeight = Math.min(0.08, bodyHeightAvailable * 0.1);
  if (stacked) {
    const heroHeight = bodyHeightAvailable * 0.45;
    addBlock(materials.accent, contentLeft, bodyTop, contentWidth, heroHeight);
    const linesTop = bodyTop - heroHeight - padding;
    addBlock(materials.neutral, contentLeft, linesTop, contentWidth, lineHeight);
    addBlock(
      materials.neutral,
      contentLeft,
      linesTop - lineHeight * 2,
      contentWidth * 0.7,
      lineHeight,
    );
    addBlock(
      materials.highlight,
      contentLeft,
      bodyBottom + lineHeight * 1.6,
      contentWidth * 0.5,
      lineHeight * 1.6,
    );
  } else {
    const heroWidth = contentWidth * 0.46;
    addBlock(
      materials.accent,
      contentLeft,
      bodyTop,
      heroWidth,
      bodyHeightAvailable,
    );
    const linesLeft = contentLeft + heroWidth + padding;
    const linesWidth = contentWidth - heroWidth - padding;
    addBlock(materials.neutral, linesLeft, bodyTop, linesWidth, lineHeight);
    addBlock(
      materials.neutral,
      linesLeft,
      bodyTop - lineHeight * 2,
      linesWidth,
      lineHeight,
    );
    addBlock(
      materials.neutral,
      linesLeft,
      bodyTop - lineHeight * 4,
      linesWidth * 0.6,
      lineHeight,
    );
    addBlock(
      materials.highlight,
      linesLeft,
      bodyBottom + lineHeight * 1.8,
      linesWidth * 0.5,
      lineHeight * 1.8,
    );
  }
}

// 반응형 기기 묶음. 모니터, 태블릿, 휴대폰이 앞으로 나오며 겹쳐 있고 세 화면에 같은 레이아웃이 크기에 맞게 들어 있다
function createResponsiveDevices(materials: PartMaterials): THREE.Group {
  const group = new THREE.Group();
  const monitorX = -0.4;
  addDevice(group, materials, {
    center: [monitorX, 0.22, -0.2],
    size: [2.0, 1.3],
    cornerRadius: 0.1,
    stacked: false,
  });
  // 모니터 받침
  addMesh(
    group,
    new RoundedBoxGeometry(0.22, 0.34, 0.1, 3, 0.04),
    materials.neutral,
    [monitorX, -0.58, -0.25],
  );
  addMesh(
    group,
    new RoundedBoxGeometry(0.9, 0.1, 0.42, 3, 0.05),
    materials.neutral,
    [monitorX, -0.78, -0.2],
  );
  addDevice(group, materials, {
    center: [0.68, -0.18, 0.2],
    size: [0.92, 1.24],
    cornerRadius: 0.1,
    stacked: true,
  });
  addDevice(group, materials, {
    center: [1.24, -0.36, 0.55],
    size: [0.5, 0.94],
    cornerRadius: 0.09,
    stacked: true,
  });
  return group;
}

// 모달. 내용이 있는 페이지 한가운데에 제목 바와 닫기(X), 본문, 버튼을 가진 창이 떠 있다
function createModal(materials: PartMaterials): THREE.Group {
  const group = new THREE.Group();
  // 뒤의 페이지. 창 둘레로 상단 바와 카드가 비쳐 보여야 빈 판이 아니라 페이지로 읽힌다
  const pageDepth = -0.28;
  addMesh(
    group,
    new RoundedBoxGeometry(2.5, 1.8, 0.1, 4, 0.05),
    materials.neutral,
    [0, 0, pageDepth],
  );
  const pageContentDepth = pageDepth + 0.06;
  addMesh(
    group,
    new RoundedBoxGeometry(2.2, 0.1, 0.04, 2, 0.02),
    materials.contrast,
    [0, 0.74, pageContentDepth],
  );
  const pageCards: [number, number][] = [
    [-0.78, -0.72],
    [0, -0.72],
    [0.78, -0.72],
  ];
  pageCards.forEach(([cardX, cardY]) => {
    addMesh(
      group,
      new RoundedBoxGeometry(0.64, 0.16, 0.04, 2, 0.03),
      materials.accent,
      [cardX, cardY, pageContentDepth],
    );
  });

  // 떠 있는 창
  const windowDepth = 0.12;
  const windowFront = windowDepth + 0.08;
  addMesh(
    group,
    new RoundedBoxGeometry(1.9, 1.2, 0.16, 5, 0.08),
    materials.contrast,
    [0, -0.02, windowDepth],
  );
  // 제목 바
  addMesh(
    group,
    new RoundedBoxGeometry(1.9, 0.3, 0.2, 5, 0.08),
    materials.accent,
    [0, 0.43, windowDepth + 0.01],
  );
  const headerFront = windowDepth + 0.11;
  addMesh(
    group,
    new RoundedBoxGeometry(0.7, 0.08, 0.04, 2, 0.03),
    materials.bright,
    [-0.48, 0.43, headerFront + 0.01],
  );
  addCapsuleBetween(
    group,
    materials.bright,
    [0.71, 0.5],
    [0.85, 0.36],
    0.028,
    headerFront + 0.02,
  );
  addCapsuleBetween(
    group,
    materials.bright,
    [0.85, 0.5],
    [0.71, 0.36],
    0.028,
    headerFront + 0.02,
  );
  // 본문 두 줄
  addMesh(
    group,
    new RoundedBoxGeometry(1.55, 0.09, 0.04, 2, 0.03),
    materials.neutral,
    [-0.02, 0.12, windowFront + 0.01],
  );
  addMesh(
    group,
    new RoundedBoxGeometry(1.1, 0.09, 0.04, 2, 0.03),
    materials.neutral,
    [-0.245, -0.06, windowFront + 0.01],
  );
  // 창 안쪽 오른쪽 아래의 취소와 확인 버튼
  addMesh(
    group,
    new RoundedBoxGeometry(0.5, 0.2, 0.08, 3, 0.07),
    materials.neutral,
    [0.0, -0.4, windowFront + 0.02],
  );
  addMesh(
    group,
    new RoundedBoxGeometry(0.5, 0.2, 0.08, 3, 0.07),
    materials.highlight,
    [0.58, -0.4, windowFront + 0.02],
  );
  return group;
}

// 초승달. 큰 원에서 비스듬히 놓인 작은 원을 뺀 모양을 두께를 줘서 세운다
function createCrescentGeometry(): THREE.BufferGeometry {
  const outerRadius = 0.3;
  const innerRadius = 0.25;
  const innerCenter = new THREE.Vector2(0.13, 0.07);
  const centerDistance = innerCenter.length();
  // 두 원이 만나는 두 점
  const alongDistance =
    (outerRadius * outerRadius -
      innerRadius * innerRadius +
      centerDistance * centerDistance) /
    (2 * centerDistance);
  const sideDistance = Math.sqrt(
    outerRadius * outerRadius - alongDistance * alongDistance,
  );
  const direction = innerCenter.clone().normalize();
  const normal = new THREE.Vector2(-direction.y, direction.x);
  const upperPoint = direction
    .clone()
    .multiplyScalar(alongDistance)
    .addScaledVector(normal, sideDistance);
  const lowerPoint = direction
    .clone()
    .multiplyScalar(alongDistance)
    .addScaledVector(normal, -sideDistance);

  const shape = new THREE.Shape();
  shape.moveTo(upperPoint.x, upperPoint.y);
  // 바깥 원은 달의 등 쪽으로, 안쪽 원은 같은 쪽으로 되돌아오며 파인 면을 만든다
  shape.absarc(
    0,
    0,
    outerRadius,
    Math.atan2(upperPoint.y, upperPoint.x),
    Math.atan2(lowerPoint.y, lowerPoint.x),
    false,
  );
  shape.absarc(
    innerCenter.x,
    innerCenter.y,
    innerRadius,
    Math.atan2(lowerPoint.y - innerCenter.y, lowerPoint.x - innerCenter.x),
    Math.atan2(upperPoint.y - innerCenter.y, upperPoint.x - innerCenter.x),
    true,
  );
  return new THREE.ExtrudeGeometry(shape, {
    depth: 0.08,
    bevelEnabled: true,
    bevelSize: 0.025,
    bevelThickness: 0.025,
    bevelSegments: 3,
    curveSegments: 32,
  });
}

// 양 끝이 반원인 알약 윤곽을 두께만큼 밀어 올린다. RoundedBoxGeometry는 반지름이 두께의 절반으로 제한되어 알약이 되지 않는다
function createPillGeometry(
  width: number,
  height: number,
  depth: number,
): THREE.BufferGeometry {
  const bevel = Math.min(0.06, depth / 3);
  const endRadius = height / 2 - bevel;
  const straightHalf = width / 2 - height / 2;
  const shape = new THREE.Shape();
  shape.moveTo(-straightHalf, -endRadius);
  shape.lineTo(straightHalf, -endRadius);
  shape.absarc(straightHalf, 0, endRadius, -Math.PI / 2, Math.PI / 2, false);
  shape.lineTo(-straightHalf, endRadius);
  shape.absarc(-straightHalf, 0, endRadius, Math.PI / 2, -Math.PI / 2, false);
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: depth - bevel * 2,
    bevelEnabled: true,
    bevelSize: bevel,
    bevelThickness: bevel,
    bevelSegments: 4,
    curveSegments: 32,
  });
  // 밀어 올린 두께의 가운데가 원점에 오게 한다
  geometry.translate(0, 0, -(depth - bevel * 2) / 2);
  return geometry;
}

// 구름 하나를 이루는 구들의 [x, y, 반지름]
const CLOUD_PUFFS: [number, number, number][] = [
  [-0.13, -0.02, 0.09],
  [-0.02, 0.04, 0.13],
  [0.11, 0.01, 0.1],
  [0.04, -0.05, 0.09],
];
const TOGGLE_CLOUDS: [number, number][] = [
  [-0.28, -0.17],
  [0.22, 0.2],
];
const TOGGLE_STARS: [number, number][] = [
  [-0.62, -0.3],
  [-0.45, 0.3],
  [-0.05, 0.33],
  [0.1, -0.32],
  [0.5, -0.12],
  [-1.2, -0.28],
];

const SUN_RAY_COUNT = 8;

// 테마 토글. 알약형 트레이 안에 하늘이 있고 왼쪽에 초승달(라이트 모드에서는 해), 가운데에 구름과 별,
// 오른쪽에 원통 손잡이가 있다
function createThemeToggle(materials: PartMaterials): THREE.Group {
  const group = new THREE.Group();
  addMesh(
    group,
    createPillGeometry(3.0, 1.3, 0.42),
    materials.neutral,
  );
  const skyDepth = 0.23;
  addMesh(
    group,
    createPillGeometry(2.72, 1.02, 0.1),
    materials.accent,
    [0, 0, skyDepth - 0.04],
  );
  const surfaceDepth = skyDepth + 0.01;
  const celestialX = -0.95;
  const moon = addMesh(group, createCrescentGeometry(), materials.highlight, [
    celestialX,
    0.04,
    surfaceDepth,
  ]);
  showOnlyIn([moon], "dark");

  const sunMeshes: THREE.Mesh[] = [];
  const sunCore = addMesh(
    group,
    new THREE.SphereGeometry(0.19, 24, 24),
    materials.highlight,
    [celestialX, 0, surfaceDepth + 0.04],
  );
  // 하늘 판에 붙은 볼록한 원반처럼 보이게 앞뒤로 누른다
  sunCore.scale.z = 0.5;
  sunMeshes.push(sunCore);
  for (let rayIndex = 0; rayIndex < SUN_RAY_COUNT; rayIndex += 1) {
    const angle = (rayIndex / SUN_RAY_COUNT) * Math.PI * 2;
    sunMeshes.push(
      addCapsuleBetween(
        group,
        materials.highlight,
        [celestialX + Math.cos(angle) * 0.27, Math.sin(angle) * 0.27],
        [celestialX + Math.cos(angle) * 0.36, Math.sin(angle) * 0.36],
        0.035,
        surfaceDepth + 0.04,
      ),
    );
  }
  showOnlyIn(sunMeshes, "light");

  TOGGLE_CLOUDS.forEach(([cloudX, cloudY]) => {
    CLOUD_PUFFS.forEach(([puffX, puffY, puffRadius]) => {
      addMesh(
        group,
        new THREE.SphereGeometry(puffRadius, 16, 16),
        materials.bright,
        [cloudX + puffX, cloudY + puffY, surfaceDepth + puffRadius * 0.7],
      );
    });
  });
  const starGeometry = new THREE.SphereGeometry(0.025, 8, 8);
  showOnlyIn(
    TOGGLE_STARS.map(([starX, starY]) =>
      addMesh(group, starGeometry, materials.highlight, [
        starX,
        starY,
        surfaceDepth + 0.01,
      ]),
    ),
    "dark",
  );
  // 원통은 기본 축이 y라서 화면 앞을 보도록 세운다
  addMesh(
    group,
    new THREE.CylinderGeometry(0.4, 0.4, 0.08, 32),
    materials.bright,
    [0.9, 0, surfaceDepth + 0.04],
    [Math.PI / 2, 0, 0],
  );
  addMesh(
    group,
    new THREE.CylinderGeometry(0.34, 0.34, 0.26, 32),
    materials.bright,
    [0.9, 0, surfaceDepth + 0.17],
    [Math.PI / 2, 0, 0],
  );
  return group;
}

function createCheckbox(materials: PartMaterials): THREE.Group {
  const group = new THREE.Group();
  addMesh(
    group,
    new RoundedBoxGeometry(1.15, 1.15, 0.4, 5, 0.24),
    materials.accent,
  );
  addCapsuleBetween(
    group,
    materials.contrast,
    [-0.3, 0.0],
    [-0.08, -0.24],
    0.075,
    0.23,
  );
  addCapsuleBetween(
    group,
    materials.contrast,
    [-0.08, -0.24],
    [0.32, 0.26],
    0.075,
    0.23,
  );
  return group;
}

function createCodeBrackets(materials: PartMaterials): THREE.Group {
  const group = new THREE.Group();
  addCapsuleBetween(group, materials.contrast, [-0.75, 0.42], [-1.2, 0], 0.11);
  addCapsuleBetween(group, materials.contrast, [-1.2, 0], [-0.75, -0.42], 0.11);
  addCapsuleBetween(
    group,
    materials.accent,
    [0.18, 0.55],
    [-0.18, -0.55],
    0.11,
  );
  addCapsuleBetween(group, materials.contrast, [0.75, 0.42], [1.2, 0], 0.11);
  addCapsuleBetween(group, materials.contrast, [1.2, 0], [0.75, -0.42], 0.11);
  return group;
}

// 가장 작은 두 부품(체크박스, 코드 괄호)을 가장 좁은 Work와 Lab 사이에 둔다
export const PART_DEFINITIONS: PartDefinition[] = [
  {
    key: "browser-window",
    create: createBrowserWindow,
    halfWidth: 1.5,
    clump: [0.2, 0.5, -0.6],
    rotation: [-0.25, 0.45, 0.08],
    side: [-1, 0.42, -0.5],
    gap: [0, -1],
  },
  {
    key: "responsive-devices",
    create: createResponsiveDevices,
    halfWidth: 1.5,
    clump: [-1.9, -1.4, 0.9],
    rotation: [0.2, -0.4, -0.06],
    side: [1, -0.52, 0.4],
    gap: [1, 1],
  },
  {
    key: "modal",
    create: createModal,
    halfWidth: 1.25,
    clump: [2.0, -1.5, 1.0],
    // 흩어지면 y로 0.6만큼 더 돌기 때문에, 창이 납작하게 눕지 않도록 반대쪽으로 돌려 둔다
    rotation: [-0.12, -0.3, 0.08],
    side: [-1, -0.5, 0.6],
    gap: [1, -1],
  },
  {
    key: "theme-toggle",
    create: createThemeToggle,
    halfWidth: 1.5,
    clump: [-1.3, 2.1, 0.6],
    // 흩어지면 y로 0.6만큼 더 돌기 때문에, 그때 정면에 가깝게 보이도록 반대쪽으로 돌려 둔다
    rotation: [0.15, -0.4, -0.12],
    // 세로 비율은 맞은편의 브라우저 창과 같은 값이라 둘이 같은 높이에 놓인다
    side: [1, 0.42, 0.2],
    gap: [0, 1],
  },
  {
    key: "checkbox",
    create: createCheckbox,
    halfWidth: 0.6,
    clump: [2.5, 1.6, 0.4],
    rotation: [0.4, -0.5, 0.3],
    // 세로 비율은 맞은편의 코드 괄호와 같은 값이라 둘이 같은 높이에 놓인다
    side: [1, -0.04, -0.3],
    gap: [2, 1],
  },
  {
    key: "code-brackets",
    create: createCodeBrackets,
    halfWidth: 1.2,
    clump: [-3.0, 0.3, -0.2],
    rotation: [0.1, 0.35, 0.12],
    side: [-1, -0.04, 0.1],
    gap: [2, -1],
  },
];

export const PART_COUNT = PART_DEFINITIONS.length;
export const WIDEST_PART_WIDTH =
  Math.max(...PART_DEFINITIONS.map((definition) => definition.halfWidth)) * 2;

// 뭉친 덩어리가 중심에서 좌우로 차지하는 너비 (배율 1 기준). About에서 문구 옆 영역에 맞출 때 쓴다
export const CLUMP_LEFT_EXTENT = Math.max(
  ...PART_DEFINITIONS.map(
    (definition) => definition.halfWidth - definition.clump[0],
  ),
);
export const CLUMP_RIGHT_EXTENT = Math.max(
  ...PART_DEFINITIONS.map(
    (definition) => definition.halfWidth + definition.clump[0],
  ),
);

// 문구 사이 배치에서 세로로 얼마나 차지하는지 알기 위해 기본 회전 상태의 높이를 잰다 (배율 1 기준)
export function measurePartHeight(
  group: THREE.Group,
  definition: PartDefinition,
): number {
  group.rotation.set(...definition.rotation);
  group.updateMatrixWorld(true);
  const bounds = new THREE.Box3().setFromObject(group);
  return bounds.max.y - bounds.min.y;
}
```

- [ ] **Step 3: `usePartMaterials.ts`를 만든다**

```ts
"use client";

import { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import type { PartMaterials } from "@/components/scene/partDefinitions";
import { sceneState } from "@/components/scene/sceneState";
import {
  SCENE_PALETTES,
  type ScenePalette,
  type ThemeName,
} from "@/components/scene/themePalette";

const COLOR_FOLLOW_SPEED = 4;

function createMaterial(
  color: string,
  glow: string,
): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    color,
    emissive: glow,
    emissiveIntensity: 0,
    roughness: 0.35,
    metalness: 0.1,
    clearcoat: 1,
    clearcoatRoughness: 0.15,
    // 점 단위로 채워지듯 나타나서 입자 표현과 이어진다. opacity는 UiParts가 매 프레임 solid 값으로 둔다
    alphaHash: true,
    opacity: 0,
  });
}

function createPartMaterials(palette: ScenePalette): PartMaterials {
  return {
    neutral: createMaterial(palette.neutral, palette.glow),
    contrast: createMaterial(palette.contrast, palette.glow),
    accent: createMaterial(palette.accent, palette.glow),
    highlight: createMaterial(palette.highlight, palette.glow),
    bright: createMaterial(palette.bright, palette.glow),
  };
}

// 역할별 재질 5개를 모든 부품이 공유하므로, 테마 전환 시 색 5개만 보간하면 된다
export function usePartMaterials(
  themeName: ThemeName,
  instant: boolean,
): PartMaterials {
  const [materials] = useState(() =>
    createPartMaterials(SCENE_PALETTES[themeName]),
  );
  const targetColor = useMemo(() => new THREE.Color(), []);
  const materialList = useMemo(() => Object.values(materials), [materials]);

  useEffect(() => {
    return () => {
      Object.values(materials).forEach((material) => material.dispose());
    };
  }, [materials]);

  useFrame((_, delta) => {
    const palette = SCENE_PALETTES[themeName];
    const blendRatio = instant ? 1 : 1 - Math.exp(-delta * COLOR_FOLLOW_SPEED);

    materials.neutral.color.lerp(targetColor.set(palette.neutral), blendRatio);
    materials.contrast.color.lerp(
      targetColor.set(palette.contrast),
      blendRatio,
    );
    materials.accent.color.lerp(
      targetColor.set(sceneState.accentOverride ?? palette.accent),
      blendRatio,
    );
    materials.highlight.color.lerp(
      targetColor.set(palette.highlight),
      blendRatio,
    );
    materials.bright.color.lerp(targetColor.set(palette.bright), blendRatio);
    materialList.forEach((material) => {
      material.emissive.lerp(targetColor.set(palette.glow), blendRatio);
    });
  });

  return materials;
}
```

- [ ] **Step 4: `usePartGroups.ts`를 만든다**

```ts
"use client";

import { useEffect, useState } from "react";
import * as THREE from "three";
import {
  PART_DEFINITIONS,
  measurePartHeight,
  type PartMaterials,
} from "@/components/scene/partDefinitions";

export interface PartSet {
  groups: THREE.Group[];
  // 배율 1 기준 장면 단위 높이
  heights: number[];
  // 매 프레임 UiParts가 채우고 GlyphParticles가 uniform으로 넘기는 부품 행렬
  matrices: THREE.Matrix4[];
}

export function usePartGroups(materials: PartMaterials): PartSet {
  const [partSet] = useState<PartSet>(() => {
    const groups = PART_DEFINITIONS.map((definition) =>
      definition.create(materials),
    );
    return {
      groups,
      heights: groups.map((group, partIndex) =>
        measurePartHeight(group, PART_DEFINITIONS[partIndex]),
      ),
      matrices: groups.map(() => new THREE.Matrix4()),
    };
  });

  useEffect(() => {
    return () => {
      partSet.groups.forEach((group) => {
        group.traverse((child) => {
          if (child instanceof THREE.Mesh) child.geometry.dispose();
        });
      });
    };
  }, [partSet]);

  return partSet;
}
```

- [ ] **Step 5: lint와 타입 검사**

Run: `pnpm lint`
Expected: 오류 없음. `sceneLayout.ts`와 `partDefinitions.ts`는 서로 import하지만 순환이 아니다(`sceneLayout` → `partDefinitions` 한 방향).

Run: `lsof -i :3000` 확인 후 `pnpm build` 또는 `pnpm exec tsc --noEmit`
Expected: 오류 없음.

---

### Task 3: 타임라인, UiParts, Scene 교체, 물리 파일 삭제

끝나면 사이트에 입자 없이 부품만 보인다. 부품이 히어로에서 굳은 채 나타나 About에서 오른쪽으로 가고 Stack부터 흩어지며 Contact에서 다시 뭉쳤다가 풀려 사라진다.

**Files:**

- Rewrite: `src/components/scene/sectionChoreography.ts`
- Create: `src/components/scene/UiParts.tsx`
- Rewrite: `src/components/scene/Scene.tsx`
- Modify: `src/components/scene/SceneLoader.tsx` (주석 한 줄)
- Delete: `src/components/scene/PhysicsCluster.tsx`, `src/components/scene/PointerCollider.tsx`, `src/components/scene/clusterBodies.ts`, `src/components/scene/useClusterMaterials.ts`

**Interfaces:**

- Consumes: Task 2의 `sceneLayout`, `partDefinitions`, `usePartMaterials`, `usePartGroups`.
- Produces: `ScenePhases { morph; clumpShift; solid; particleFade; spread; regather; dissolve; pool }`, `createScenePhases()`, `samplePhases(sectionProgress, profile, output)`, `REDUCED_MOTION_PHASES`, `LaneRoute { descend; traverse; settle }`, `createLaneRoute()`, `computeLaneRoute(regather, output)`, `computeClumpCenter(phases, viewport, profile, scrollY, layout, output)`, `UiParts` props `{ parts: PartSet; materials: PartMaterials; isMobile: boolean; isFrozen: boolean }`.

- [ ] **Step 1: `sectionChoreography.ts`를 아래로 바꾼다**

```ts
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
const SIDE_STOPS: PhaseStops = {
  morph: [0.2, 0.9],
  clumpShift: [0.2, 0.95],
  solid: [0.75, 1.05],
  fadeOut: [0.9, 1.2],
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
  profile: SceneProfile,
  output: ScenePhases,
): ScenePhases {
  const stops = STOPS_BY_PROFILE[profile];
  const regather = smooth(range(sectionProgress, stops.regather));
  const dissolve = smooth(range(sectionProgress, stops.dissolve));

  output.morph = range(sectionProgress, stops.morph);
  output.clumpShift = stops.clumpShift
    ? smooth(range(sectionProgress, stops.clumpShift))
    : 0;
  output.solid = smooth(range(sectionProgress, stops.solid)) * (1 - dissolve);
  output.particleFade = Math.min(
    1,
    1 -
      smooth(range(sectionProgress, stops.fadeOut)) +
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
```

- [ ] **Step 2: `UiParts.tsx`를 만든다**

```tsx
"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import {
  PART_DEFINITIONS,
  THEME_ONLY_KEY,
  type PartMaterials,
} from "@/components/scene/partDefinitions";
import {
  computeViewportUnits,
  createPartPlacement,
  createViewportUnits,
  placeAtSide,
  placeBetweenTexts,
  resolveSceneProfile,
} from "@/components/scene/sceneLayout";
import { sceneState } from "@/components/scene/sceneState";
import {
  REDUCED_MOTION_PHASES,
  computeClumpCenter,
  computeLaneRoute,
  createLaneRoute,
  createScenePhases,
  samplePhases,
  type ClumpCenter,
} from "@/components/scene/sectionChoreography";
import type { ThemeName } from "@/components/scene/themePalette";
import type { PartSet } from "@/components/scene/usePartGroups";

interface UiPartsProps {
  parts: PartSet;
  materials: PartMaterials;
  themeName: ThemeName;
  isMobile: boolean;
  isFrozen: boolean;
  castShadows: boolean;
}

const MAX_FRAME_DELTA = 0.1;
// 커서가 부품 반너비의 이 배수 안에 오면 부품이 커서 반대쪽으로 밀리고 기운다
const LEAN_REACH_RATIO = 1.5;
const LEAN_MAX_OFFSET = 0.5;
const LEAN_MAX_TILT = (12 * Math.PI) / 180;
const LEAN_FOLLOW_SPEED = 6;
// Lab과 Contact 사이 빈 줄은 섹션 여백 두 개 높이라서, 가장 큰 부품이 들어가도록 건너가는 동안 이만큼 줄인다
const LANE_CROSS_SHRINK = 0.3;
const EMPTY_GAP = { top: 0, bottom: 0, band: 0 };

export default function UiParts({
  parts,
  materials,
  themeName,
  isMobile,
  isFrozen,
  castShadows,
}: UiPartsProps) {
  const phases = useMemo(() => createScenePhases(), []);
  const viewport = useMemo(() => createViewportUnits(), []);
  const placement = useMemo(() => createPartPlacement(), []);
  const clumpCenter = useMemo<ClumpCenter>(
    () => ({ x: 0, y: 0, scale: 1 }),
    [],
  );
  const leanOffsets = useMemo(
    () => PART_DEFINITIONS.map(() => new THREE.Vector2()),
    [],
  );
  const leanTarget = useMemo(() => new THREE.Vector2(), []);
  const laneRoute = useMemo(() => createLaneRoute(), []);
  const lastAtmosphereOpacity = useRef("");
  const materialList = useMemo(() => Object.values(materials), [materials]);

  // 부품 메시는 코드로 만들어져 JSX prop으로 그림자를 켤 수 없어서 여기서 직접 켠다
  useEffect(() => {
    parts.groups.forEach((group) => {
      group.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = castShadows;
          child.receiveShadow = castShadows;
        }
      });
    });
  }, [parts, castShadows]);

  // 테마 토글의 해와 달처럼 한쪽 테마에서만 보이는 메시를 바꿔 보인다
  useEffect(() => {
    parts.groups.forEach((group) => {
      group.children.forEach((child) => {
        const themeOnly = child.userData[THEME_ONLY_KEY];
        if (themeOnly) child.visible = themeOnly === themeName;
      });
    });
  }, [parts, themeName]);

  useFrame((state, delta) => {
    // 높이가 0이면 단위 환산이 0으로 나뉘어 NaN이 된다
    if (state.size.height === 0) return;
    const frameDelta = Math.min(delta, MAX_FRAME_DELTA);
    computeViewportUnits(state.size.width, state.size.height, viewport);
    const profile = resolveSceneProfile(
      isMobile,
      sceneState.layout.contentMarginPixels,
      viewport,
    );
    const currentPhases = isFrozen
      ? REDUCED_MOTION_PHASES
      : samplePhases(sceneState.sectionProgress, profile, phases);
    const scrollY = window.scrollY;
    computeClumpCenter(
      currentPhases,
      viewport,
      profile,
      isFrozen ? 0 : scrollY,
      sceneState.layout,
      clumpCenter,
    );

    const contentMarginUnits =
      sceneState.layout.contentMarginPixels / viewport.pixelsPerUnit;
    const sideLayout = profile === "side";
    // Lab 목록 아래 여백과 Contact 위 여백이 같아서 섹션 경계가 둘 사이 빈 줄의 가운데다
    const laneY =
      viewport.halfHeight -
      (sceneState.layout.contactTopPixels - scrollY) / viewport.pixelsPerUnit;
    computeLaneRoute(currentPhases.regather, laneRoute);
    const elapsedTime = state.clock.elapsedTime;
    const cursorX = sceneState.pointer.x * viewport.halfWidth;
    const cursorY = sceneState.pointer.y * viewport.halfHeight;
    const canLean =
      sceneState.pointerActive &&
      currentPhases.solid > 0.999 &&
      currentPhases.pool < 0.001;

    parts.groups.forEach((group, partIndex) => {
      const definition = PART_DEFINITIONS[partIndex];
      const clumpScale = clumpCenter.scale;
      const clumpX = clumpCenter.x + definition.clump[0] * clumpScale;
      const clumpY = clumpCenter.y + definition.clump[1] * clumpScale;
      const clumpZ = definition.clump[2] * clumpScale;

      if (sideLayout) {
        placeAtSide(
          definition,
          viewport,
          contentMarginUnits,
          clumpScale,
          placement,
        );
      } else {
        placeBetweenTexts(
          definition,
          parts.heights[partIndex],
          sceneState.layout.gaps[definition.gap[0]] ?? EMPTY_GAP,
          viewport,
          clumpScale,
          scrollY,
          placement,
        );
      }

      const spread = currentPhases.spread;
      let baseX: number;
      let baseY: number;
      let baseZ: number;
      let crossShrink = 1;
      if (sideLayout && currentPhases.regather > 0) {
        // 다시 뭉칠 때는 spread가 1에서 줄어드는 값이라 자리와 덩어리 자리를 경로 단계별로 직접 잇는다
        baseX = placement.x + (clumpX - placement.x) * laneRoute.traverse;
        const laneArrivalY =
          placement.y + (laneY - placement.y) * laneRoute.descend;
        baseY = laneArrivalY + (clumpY - laneArrivalY) * laneRoute.settle;
        baseZ = placement.z + (clumpZ - placement.z) * laneRoute.traverse;
        crossShrink =
          1 - Math.sin(laneRoute.traverse * Math.PI) * LANE_CROSS_SHRINK;
      } else if (currentPhases.regather > 0) {
        // 문구 사이 자리는 이때 화면 위쪽 밖이다. 거기서 내려오면 Lab 목록과 Contact 제목을 가로지르므로,
        // 화면 아래 밖에서 덩어리 자리로 올라온다. 덩어리 자리 아래에는 문구가 없다
        const belowScreenY =
          -viewport.halfHeight - parts.heights[partIndex] * clumpScale;
        baseX = clumpX;
        baseY = belowScreenY + (clumpY - belowScreenY) * currentPhases.regather;
        baseZ = clumpZ;
      } else {
        // 휴대폰은 문구를 가로질러 날아가지 않게 화면 옆으로 돌아 나갔다가 자리로 들어온다
        const sidewaysArc = isMobile
          ? definition.side[0] *
            viewport.halfWidth *
            1.3 *
            Math.sin(spread * Math.PI)
          : 0;
        baseX = clumpX + (placement.x - clumpX) * spread + sidewaysArc;
        baseY = clumpY + (placement.y - clumpY) * spread;
        baseZ = clumpZ + (placement.z - clumpZ) * spread;
      }
      const scale =
        clumpScale * (1 + (placement.fitScale - 1) * spread) * crossShrink;

      // 커서 반대 방향으로 밀렸다가 스프링처럼 돌아온다
      const leanOffset = leanOffsets[partIndex];
      leanTarget.set(0, 0);
      if (canLean) {
        const reach = definition.halfWidth * scale * LEAN_REACH_RATIO;
        const awayX = baseX - cursorX;
        const awayY = baseY - cursorY;
        const distance = Math.hypot(awayX, awayY);
        if (distance < reach && distance > 0.0001) {
          const strength = (1 - distance / reach) * LEAN_MAX_OFFSET;
          leanTarget.set(
            (awayX / distance) * strength,
            (awayY / distance) * strength,
          );
        }
      }
      leanOffset.lerp(
        leanTarget,
        1 - Math.exp(-frameDelta * LEAN_FOLLOW_SPEED),
      );
      // 밀린 방향으로 기운다. 최대로 밀렸을 때 LEAN_MAX_TILT만큼이다
      const tiltX = (leanOffset.y / LEAN_MAX_OFFSET) * LEAN_MAX_TILT;
      const tiltY = -(leanOffset.x / LEAN_MAX_OFFSET) * LEAN_MAX_TILT;

      group.position.set(baseX + leanOffset.x, baseY + leanOffset.y, baseZ);
      group.rotation.set(
        definition.rotation[0] +
          Math.sin(elapsedTime * 0.5 + partIndex) * 0.14 +
          tiltX,
        definition.rotation[1] +
          Math.cos(elapsedTime * 0.4 + partIndex * 2) * 0.2 +
          spread * 0.6 +
          tiltY,
        definition.rotation[2] + Math.sin(elapsedTime * 0.3 + partIndex) * 0.08,
      );
      group.scale.setScalar(scale);
      group.visible = currentPhases.solid > 0.001;
      group.updateMatrixWorld(true);
      parts.matrices[partIndex].copy(group.matrixWorld);
    });

    // 굳어지는 순간에만 빛이 돌았다가 사라진다
    const glowPulse = Math.sin(currentPhases.solid * Math.PI) * 0.55;
    materialList.forEach((material) => {
      material.opacity = currentPhases.solid;
      material.emissiveIntensity = glowPulse;
    });

    // 3D 쪽이 DOM에 쓰는 유일한 값. 같은 값이면 쓰지 않는다
    const atmosphereOpacity = (1 - currentPhases.solid * 0.7).toFixed(3);
    if (atmosphereOpacity !== lastAtmosphereOpacity.current) {
      document.documentElement.style.setProperty(
        "--atmosphere-opacity",
        atmosphereOpacity,
      );
      lastAtmosphereOpacity.current = atmosphereOpacity;
    }
  });

  return (
    <>
      {parts.groups.map((group, partIndex) => (
        <primitive key={PART_DEFINITIONS[partIndex].key} object={group} />
      ))}
    </>
  );
}
```

- [ ] **Step 3: `Scene.tsx`를 아래로 바꾼다**

```tsx
"use client";

import { useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { useTheme } from "next-themes";
import SceneLighting from "@/components/scene/SceneLighting";
import UiParts from "@/components/scene/UiParts";
import { CAMERA_DISTANCE, FIELD_OF_VIEW } from "@/components/scene/sceneLayout";
import type { ThemeName } from "@/components/scene/themePalette";
import { usePartGroups } from "@/components/scene/usePartGroups";
import { usePartMaterials } from "@/components/scene/usePartMaterials";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface SceneContentsProps {
  themeName: ThemeName;
  isMobile: boolean;
  isFrozen: boolean;
}

function SceneContents({ themeName, isMobile, isFrozen }: SceneContentsProps) {
  const invalidate = useThree((state) => state.invalidate);
  const materials = usePartMaterials(themeName, isFrozen);
  const parts = usePartGroups(materials);
  const castShadows = !isMobile;

  // frameloop이 demand인 동안에는 테마가 바뀌어도 스스로 다시 그리지 않는다
  useEffect(() => {
    invalidate();
  }, [invalidate, themeName, isFrozen]);

  return (
    <>
      <SceneLighting
        themeName={themeName}
        instantTheme={isFrozen}
        castShadows={castShadows}
      />
      <UiParts
        parts={parts}
        materials={materials}
        themeName={themeName}
        isMobile={isMobile}
        isFrozen={isFrozen}
      />
    </>
  );
}

export default function Scene() {
  // Canvas 안은 별도 렌더러라서 context 전달에 기대지 않고 밖에서 읽어 props로 내려준다
  const { resolvedTheme } = useTheme();
  const themeName: ThemeName = resolvedTheme === "dark" ? "dark" : "light";
  const isMobile = useMediaQuery("(max-width: 768px)");
  const reducedMotion = useReducedMotion();

  // reduced motion에서는 굳은 덩어리를 히어로에 정지시켜 두고 렌더 루프를 멈춘다
  const isFrozen = reducedMotion;

  return (
    <Canvas
      shadows={!isMobile}
      dpr={isMobile ? [1, 1.5] : [1, 2]}
      frameloop={isFrozen ? "demand" : "always"}
      gl={{ alpha: true, antialias: true }}
      camera={{
        position: [0, 0, CAMERA_DISTANCE],
        fov: FIELD_OF_VIEW,
        near: 0.1,
        far: 100,
      }}
    >
      <SceneContents
        themeName={themeName}
        isMobile={isMobile}
        isFrozen={isFrozen}
      />
    </Canvas>
  );
}
```

- [ ] **Step 4: `SceneLoader.tsx`의 주석을 고친다**

`// three와 rapier 번들을 첫 HTML과 텍스트가 기다리지 않게 한다` 를 `// three 번들을 첫 HTML과 텍스트가 기다리지 않게 한다` 로 바꾼다.

- [ ] **Step 5: 물리 파일 네 개를 삭제한다**

```bash
rm src/components/scene/PhysicsCluster.tsx src/components/scene/PointerCollider.tsx src/components/scene/clusterBodies.ts src/components/scene/useClusterMaterials.ts
```

작업 트리에서만 지운다. 스테이징과 커밋은 사용자가 요청할 때 한다. `package.json`은 건드리지 않는다.

- [ ] **Step 6: lint와 타입 검사**

Run: `pnpm lint`
Expected: 오류 없음.

Run: `grep -rn "rapier\|clusterBodies\|useClusterMaterials\|PhysicsCluster\|PointerCollider" src`
Expected: 결과 없음.

Run: `lsof -i :3000` 확인 후 `pnpm build` 또는 `pnpm exec tsc --noEmit`
Expected: 오류 없음.

- [ ] **Step 7: 브라우저에서 부품만 확인한다**

dev 서버(`pnpm dev`)를 브라우저 미리보기 도구로 열고 다음을 본다. 콘솔은 `pattern`이나 `limit`을 주고 읽는다.

- 첫 화면에서 부품이 보이지 않는다(`solid`가 0). About으로 내리면 굳은 부품 덩어리가 오른쪽 절반에 나타난다.
- Stack에서 부품이 본문 양옆(1440×900)에 온전히 보이고 본문 글자와 겹치지 않는다.
- 창을 1024×768로 줄이면 부품이 문구 위아래에 둘씩 보이고, 스크롤해도 문구 위를 지나가지 않는다.
- Contact로 내리면 부품이 다시 뭉쳤다가 점이 빠지듯 사라진다.
- 콘솔 오류가 없다.

---

### Task 4: 수면 시뮬레이션

**Files:**

- Create: `src/components/scene/waveSurface.ts`

**Interfaces:**

- Produces: `WAVE_COLUMNS`, `waveSurface { heights: Float32Array; velocities: Float32Array; restHeight; floorY; halfWidth; pool }`, `configureWaveSurface(viewport)`, `resetWaveSurface()`, `sampleWaveHeight(u)`, `readCursorImmersion(pointerX, pointerY)`, `stepWaveSurface(delta, elapsedTime, pointerX, pointerY, pointerActivity, ceilingHeight)`.

- [ ] **Step 1: `waveSurface.ts`를 만든다**

```ts
import { clamp, type ViewportUnits } from "@/components/scene/sceneLayout";

// 웅덩이 수면을 이 개수의 칸으로 나눠서 파도를 계산한다
export const WAVE_COLUMNS = 64;

const WAVE_RESTORE = 6; // 수면이 제 높이로 돌아가려는 힘
const WAVE_TENSION = 60; // 옆 칸으로 출렁임이 번지는 힘
const WAVE_DAMPING = 1.0; // 클수록 빨리 잦아든다
const WAVE_SPLASH = 70; // 점에 닿은 커서가 수면을 밀어 올리는 힘
const WAVE_REACH = 2.8; // 커서가 영향을 주는 가로 범위 (장면 단위)
const WAVE_CONTACT_MARGIN = 0.5; // 수면보다 이만큼 위까지는 점에 닿은 것으로 본다
const WAVE_CONTACT_DEPTH = 1.5; // 이 깊이까지는 잠길수록 세게 밀고, 더 깊어도 같은 힘이다
const WAVE_CEILING_RATIO = 0.85; // 화면 높이 중 이 비율에 닿으면 미는 힘이 0이 된다
const WAVE_CEILING_FADE = 0.35; // 상한의 이 비율 아래부터 힘이 줄기 시작한다
const POOL_REST_HEIGHT_RATIO = 0.24; // 평소 수면 높이 (화면 높이 비율)
const SUBSTEPS = 2;
const MAX_STEP_SECONDS = 1 / 30;

// 3D 쪽이 매 프레임 갱신하고 Contact의 글자가 gsap.ticker에서 읽는다
export const waveSurface = {
  heights: new Float32Array(WAVE_COLUMNS),
  velocities: new Float32Array(WAVE_COLUMNS),
  restHeight: 1,
  floorY: -1,
  halfWidth: 1,
  // 마지막 구간 진행도. 0보다 클 때만 글자가 출렁인다
  pool: 0,
};

export function resetWaveSurface() {
  waveSurface.heights.fill(waveSurface.restHeight);
  waveSurface.velocities.fill(0);
}

export function configureWaveSurface(viewport: ViewportUnits) {
  waveSurface.floorY = -viewport.halfHeight - 0.15;
  waveSurface.restHeight = viewport.halfHeight * 2 * POOL_REST_HEIGHT_RATIO;
  waveSurface.halfWidth = viewport.halfWidth * 1.04;
  resetWaveSurface();
}

// 셰이더의 sampleWave와 같은 선형 보간
export function sampleWaveHeight(u: number): number {
  const position = clamp(
    (u * 0.5 + 0.5) * (WAVE_COLUMNS - 1),
    0,
    WAVE_COLUMNS - 1,
  );
  const index0 = Math.floor(position);
  const index1 = Math.min(index0 + 1, WAVE_COLUMNS - 1);
  const { heights } = waveSurface;
  return (
    heights[index0] + (heights[index1] - heights[index0]) * (position - index0)
  );
}

// 커서가 수면 아래로 얼마나 잠겼는지. 허공에 있으면 0이고, 점을 스치기만 해도 조금은 잠긴 것으로 본다
export function readCursorImmersion(
  pointerX: number,
  pointerY: number,
): number {
  const cursorSurfaceY =
    waveSurface.floorY + sampleWaveHeight(pointerX / waveSurface.halfWidth);
  return clamp(
    (cursorSurfaceY + WAVE_CONTACT_MARGIN - pointerY) / WAVE_CONTACT_DEPTH,
    0,
    1,
  );
}

export function stepWaveSurface(
  delta: number,
  elapsedTime: number,
  pointerX: number,
  pointerY: number,
  pointerActivity: number,
  ceilingHeight: number,
) {
  const { heights, velocities, restHeight, halfWidth } = waveSurface;
  const stepSeconds = Math.min(delta, MAX_STEP_SECONDS) / SUBSTEPS;
  const damping = Math.exp(-WAVE_DAMPING * stepSeconds);
  // 커서가 점 위 허공에 있으면 수면은 반응하지 않는다. 점에 닿아 움직일 때만 그 자리에서 물이 솟는다
  const splash =
    pointerActivity * readCursorImmersion(pointerX, pointerY) * WAVE_SPLASH;
  const ceiling = ceilingHeight * WAVE_CEILING_RATIO;

  for (let substep = 0; substep < SUBSTEPS; substep += 1) {
    for (let index = 0; index < WAVE_COLUMNS; index += 1) {
      const u = (index / (WAVE_COLUMNS - 1)) * 2 - 1;
      const x = u * halfWidth;
      // 가만히 있어도 수면이 아주 천천히 일렁인다
      const idleHeight =
        restHeight +
        0.12 * Math.sin(x * 0.6 + elapsedTime * 0.8) +
        0.08 * Math.sin(x * 1.3 - elapsedTime * 1.1);
      const left = heights[Math.max(index - 1, 0)];
      const right = heights[Math.min(index + 1, WAVE_COLUMNS - 1)];
      let acceleration =
        -WAVE_RESTORE * (heights[index] - idleHeight) +
        WAVE_TENSION * (left + right - 2 * heights[index]);
      if (splash > 0.001) {
        const distanceRatio = (x - pointerX) / WAVE_REACH;
        // 계속 흔들어도 수면이 화면 꼭대기에 벽처럼 붙지 않게 위로 갈수록 힘을 줄인다
        const headroom = clamp(
          (ceiling - heights[index]) / (ceiling * WAVE_CEILING_FADE),
          0,
          1,
        );
        acceleration +=
          splash * headroom * Math.exp(-distanceRatio * distanceRatio);
      }
      velocities[index] =
        (velocities[index] + acceleration * stepSeconds) * damping;
    }
    for (let index = 0; index < WAVE_COLUMNS; index += 1) {
      heights[index] = clamp(
        heights[index] + velocities[index] * stepSeconds,
        restHeight * 0.3,
        ceilingHeight,
      );
    }
  }
}
```

- [ ] **Step 2: lint와 타입 검사**

Run: `pnpm lint`
Expected: 오류 없음.

Run: `pnpm exec tsc --noEmit`
Expected: 오류 없음.

---

### Task 5: 글자판, 셰이더, GlyphParticles

끝나면 장면이 완성된다. 히어로에 코드 기둥이 오르고, 입자가 부품으로 모여 굳고, Contact에서 점으로 풀려 고이고 파도친다.

**Files:**

- Create: `src/components/scene/glyphAtlas.ts`
- Create: `src/components/scene/glyphShaders.ts`
- Create: `src/components/scene/GlyphParticles.tsx`
- Modify: `src/components/scene/Scene.tsx`

**Interfaces:**

- Consumes: `PartSet`, `waveSurface`, `samplePhases`, `computeClumpCenter`, `computeViewportUnits`, `SCENE_PALETTES`.
- Produces: `GlyphParticles` props `{ parts: PartSet; themeName: ThemeName; isMobile: boolean }`.

- [ ] **Step 1: `glyphAtlas.ts`를 만든다**

```ts
import * as THREE from "three";

export const ATLAS_COLUMNS = 10;
export const ATLAS_ROWS = 10;
export const FIRST_CHARACTER_CODE = 32;
export const GLYPH_COUNT = 95;

// 기둥에 흐르는 글자는 무작위 기호가 아니라 이 사이트의 코드다. 글자판이 ASCII뿐이라 한글은 넣지 않는다
export const CODE_CORPUS = [
  '<section id="hero" className="flex min-h-svh flex-col justify-end">',
  'const [theme, setTheme] = useState<"light" | "dark">("dark")',
  "useEffect(() => { document.documentElement.dataset.theme = theme }, [theme])",
  '<ThemeToggle onToggle={() => setTheme(theme === "dark" ? "light" : "dark")} />',
  ".line-mask { display: block; overflow: hidden; padding-bottom: 0.15em }",
  "@media (prefers-reduced-motion: reduce) { .line-mask > span { transform: none } }",
  "PROJECTS.map((project) => <ProjectCard key={project.id} project={project} />)",
  "sceneState.pointer.x = (event.clientX / window.innerWidth) * 2 - 1",
  "a:hover { color: var(--accent); text-decoration-color: var(--accent) }",
  "type Project = { id: string; title: string; techStack: string[] }",
  "export default function Home() { return <main><HeroSection /></main> }",
].join("   ");

export function glyphIndexForCharacterCode(characterCode: number): number {
  return Math.min(
    Math.max(characterCode - FIRST_CHARACTER_CODE, 0),
    GLYPH_COUNT - 1,
  );
}

// 10×10 격자에 ASCII 32부터 126까지를 그린 텍스처. 외부 이미지 파일을 두지 않는다
export function createGlyphAtlasTexture(): THREE.CanvasTexture {
  const cellSize = 64;
  const atlasCanvas = document.createElement("canvas");
  atlasCanvas.width = cellSize * ATLAS_COLUMNS;
  atlasCanvas.height = cellSize * ATLAS_ROWS;
  const context = atlasCanvas.getContext("2d");
  if (context) {
    context.fillStyle = "#ffffff";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.font = `600 46px ui-monospace, "SF Mono", Menlo, Consolas, monospace`;
    for (let glyphIndex = 0; glyphIndex < GLYPH_COUNT; glyphIndex += 1) {
      const column = glyphIndex % ATLAS_COLUMNS;
      const row = Math.floor(glyphIndex / ATLAS_COLUMNS);
      context.fillText(
        String.fromCharCode(FIRST_CHARACTER_CODE + glyphIndex),
        column * cellSize + cellSize / 2,
        row * cellSize + cellSize / 2 + 2,
      );
    }
  }
  const texture = new THREE.CanvasTexture(atlasCanvas);
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;
  return texture;
}
```

- [ ] **Step 2: `glyphShaders.ts`를 만든다**

```ts
export const STREAM_HALF_HEIGHT = 11;
export const STREAM_HALF_WIDTH = 18;
export const STREAM_DEPTH_FAR = -14;
export const STREAM_DEPTH_NEAR = 3;

// defines로 PART_COUNT와 WAVE_COLUMNS를 받는다
export const GLYPH_VERTEX_SHADER = /* glsl */ `
  uniform float uTime;
  uniform float uMorph;
  uniform float uPixelScale;
  uniform float uDotScale;
  uniform vec2 uFrustum;
  uniform vec2 uPointerNdc;
  uniform float uPointerStrength;
  uniform mat4 uPartMatrices[PART_COUNT];
  uniform float uPool;
  uniform float uPoolHalfWidth;
  uniform float uPoolFloorY;
  uniform float uWaveHeight[WAVE_COLUMNS];
  uniform float uWaveVelocity[WAVE_COLUMNS];

  attribute vec3 aStream;
  attribute vec3 aPool;
  attribute vec2 aPoolMeta;
  attribute vec4 aRandom;
  attribute vec3 aTarget;
  attribute float aGlyph;

  varying float vGlyph;
  varying float vMorph;
  varying float vBright;
  varying float vBlur;
  varying float vIntensity;

  const float STREAM_HALF_HEIGHT = ${STREAM_HALF_HEIGHT.toFixed(1)};
  const float DEPTH_FAR = ${STREAM_DEPTH_FAR.toFixed(1)};
  const float DEPTH_NEAR = ${STREAM_DEPTH_NEAR.toFixed(1)};
  const float GLYPH_WORLD_SIZE = 0.36;
  const float DOT_WORLD_SIZE = 0.085;

  float hash(float value) {
    return fract(sin(value * 127.1) * 43758.5453123);
  }

  // 수면 칸 사이를 선형 보간해서 매끈한 파도 곡선을 만든다
  float sampleWave(float u, bool velocity) {
    float position = clamp((u * 0.5 + 0.5) * float(WAVE_COLUMNS - 1), 0.0, float(WAVE_COLUMNS - 1));
    int index0 = int(floor(position));
    int index1 = min(index0 + 1, WAVE_COLUMNS - 1);
    float value0 = velocity ? uWaveVelocity[index0] : uWaveHeight[index0];
    float value1 = velocity ? uWaveVelocity[index1] : uWaveHeight[index1];
    return mix(value0, value1, fract(position));
  }

  // 웅덩이에서 글자로 보이는 입자가 쓰는 기호. 순서대로 + < > / { } ; = 이다
  float poolSymbol(float pick) {
    if (pick < 0.125) return 11.0;
    if (pick < 0.25) return 28.0;
    if (pick < 0.375) return 30.0;
    if (pick < 0.5) return 15.0;
    if (pick < 0.625) return 91.0;
    if (pick < 0.75) return 93.0;
    if (pick < 0.875) return 27.0;
    return 29.0;
  }

  void main() {
    float columnSpeed = aRandom.x;
    float seed = aRandom.y;
    float columnSeed = aRandom.w;

    // 아래에서 위로 올라가다가 끝에 닿으면 아래에서 다시 시작한다
    float travel = fract(aStream.y + uTime * columnSpeed);
    vec3 streamPosition = vec3(aStream.x, mix(-STREAM_HALF_HEIGHT, STREAM_HALF_HEIGHT, travel), aStream.z);

    int partIndex = int(aRandom.z + 0.5);
    vec3 targetPosition = (uPartMatrices[partIndex] * vec4(aTarget, 1.0)).xyz;

    // 입자마다 출발 시점을 달리해서 글자가 한꺼번에 움직이지 않고 차례로 떨어져 나오게 한다
    float delay = seed * 0.5;
    float localMorph = smoothstep(delay, delay + 0.5, uMorph);
    float eased = localMorph * localMorph * (3.0 - 2.0 * localMorph);

    vec3 worldPosition = mix(streamPosition, targetPosition, eased);
    float arc = sin(eased * 3.14159265);
    worldPosition += vec3(
      sin(seed * 40.0 + uTime * 0.6),
      cos(seed * 31.0 + uTime * 0.4),
      sin(seed * 17.0)
    ) * arc * 1.5;
    // 내려앉은 점이 완전히 멈춰 있으면 죽은 그림처럼 보여서 아주 조금 떨리게 둔다
    worldPosition += vec3(sin(uTime * 2.0 + seed * 90.0), cos(uTime * 1.7 + seed * 70.0), 0.0) * 0.012 * eased;

    // 마지막 구간: 부품에서 풀려난 입자가 바닥에 고인다
    float poolU = aPool.x;
    float columnHeight = sampleWave(poolU, false);
    float columnVelocity = sampleWave(poolU, true);
    float slope = (sampleWave(poolU + 0.02, false) - sampleWave(poolU - 0.02, false)) / (0.04 * uPoolHalfWidth);
    // 물결이 높은 쪽으로 입자가 쏠려서 마루가 성기지 않게 한다
    float poolX = (poolU + slope * 0.05 * aPool.y) * uPoolHalfWidth;
    float poolY = uPoolFloorY + aPool.y * columnHeight;
    // 마루 근처의 입자는 수면이 솟는 속도만큼 물방울처럼 튄다
    poolY += max(columnVelocity, 0.0) * smoothstep(0.7, 1.0, aPool.y) * (0.4 + 0.6 * hash(seed * 4.4)) * 0.35;
    vec3 poolPosition = vec3(poolX, poolY, aPool.z);
    poolPosition += vec3(sin(uTime * 1.3 + seed * 50.0), cos(uTime * 1.1 + seed * 60.0), 0.0) * 0.015;

    float poolDelay = hash(seed * 2.3) * 0.45;
    float poolLocal = smoothstep(poolDelay, poolDelay + 0.55, uPool);
    float poolSettle = poolLocal * poolLocal * (3.0 - 2.0 * poolLocal);
    // 떨어질 때는 중력처럼 점점 빨라진다
    float fallEase = poolLocal * poolLocal;
    worldPosition = vec3(
      mix(worldPosition.x, poolPosition.x, poolSettle),
      mix(worldPosition.y, poolPosition.y, fallEase),
      mix(worldPosition.z, poolPosition.z, poolSettle)
    );
    float poolIsGlyph = step(0.6, aPoolMeta.y);

    vec4 viewPosition = modelViewMatrix * vec4(worldPosition, 1.0);

    // 깊이가 달라도 화면에서 같은 자리에 있는 글자가 밀려나도록 뷰 공간에서 커서 위치를 구한다
    float viewDepth = -viewPosition.z;
    vec2 pointerView = uPointerNdc * uFrustum * viewDepth;
    vec2 away = viewPosition.xy - pointerView;
    float pointerRadius = 0.11 * viewDepth;
    float push = smoothstep(pointerRadius, 0.0, length(away)) * uPointerStrength * (1.0 - eased);
    viewPosition.xy += normalize(away + vec2(0.0001)) * push * pointerRadius * 0.7;

    gl_Position = projectionMatrix * viewPosition;

    float depthRatio = clamp((aStream.z - DEPTH_FAR) / (DEPTH_NEAR - DEPTH_FAR), 0.0, 1.0);
    vBlur = (1.0 - depthRatio) * 0.85 * (1.0 - eased) * (1.0 - poolLocal);

    float formedSize = mix(GLYPH_WORLD_SIZE * (1.0 + vBlur * 0.7), DOT_WORLD_SIZE * uDotScale, eased);
    float poolSize = mix(0.075, 0.24, poolIsGlyph);
    float worldSize = mix(formedSize, poolSize, poolLocal);
    gl_PointSize = worldSize * uPixelScale / viewDepth;

    // 대부분은 어둡고 몇 개만 밝다. 기둥을 따라 올라가는 밝은 띠를 하나 더 얹는다
    float flicker = step(0.985, hash(seed * 13.1 + floor(uTime * 1.5 + seed * 20.0)));
    float wave = pow(max(0.0, sin((travel * 2.0 - uTime * 0.12 + columnSeed * 5.0) * 6.2831853)), 10.0);
    vBright = clamp(flicker + wave * 0.55, 0.0, 1.0) * mix(0.25, 1.0, depthRatio);

    float edgeFade = smoothstep(0.0, 0.1, travel) * smoothstep(1.0, 0.9, travel);
    float baseIntensity = (0.16 + 0.3 * hash(seed * 91.7)) * mix(0.4, 1.0, depthRatio);
    float streamIntensity = (baseIntensity + vBright * 0.9) * edgeFade;
    // 나는 동안에는 어둡게, 내려앉은 뒤에는 겹쳐도 하얗게 타지 않을 만큼만 밝게 한다
    float flightDim = 1.0 - 0.55 * sin(eased * 3.14159265);
    float participates = step(hash(seed * 3.7), 0.6);
    // 부품으로 모일 때 사라졌던 입자도 웅덩이로 풀릴 때는 다시 나타난다
    float leaveBehind = 1.0 - (1.0 - participates) * smoothstep(0.0, 0.55, uMorph) * (1.0 - poolLocal);
    float formedIntensity = mix(streamIntensity, 0.34, eased) * flightDim * leaveBehind;
    float poolIntensity = (0.5 + flicker * 0.5) * aPoolMeta.x;
    vIntensity = mix(formedIntensity, poolIntensity, poolLocal);

    // 몇몇 글자는 잠깐씩 다른 글자로 바뀐다
    float scramble = step(0.95, hash(seed * 7.3 + floor(uTime * 3.0 + seed * 30.0)));
    float scrambledGlyph = floor(hash(seed + floor(uTime * 8.0)) * 93.0) + 1.0;
    float formedGlyph = mix(aGlyph, scrambledGlyph, scramble);
    vGlyph = poolLocal > 0.5 ? poolSymbol(fract(aPoolMeta.y * 7.0)) : formedGlyph;
    vMorph = mix(eased, 1.0 - poolIsGlyph, poolLocal);
  }
`;

export const GLYPH_FRAGMENT_SHADER = /* glsl */ `
  uniform sampler2D uAtlas;
  uniform vec2 uGrid;
  uniform vec3 uColorDim;
  uniform vec3 uColorBright;
  uniform vec3 uColorDot;
  uniform float uFade;
  uniform float uInk;

  varying float vGlyph;
  varying float vMorph;
  varying float vBright;
  varying float vBlur;
  varying float vIntensity;

  // 점 하나의 가운데에 글자를 그리고 바깥쪽 여백을 빛 번짐에 쓴다
  const float HALO_SCALE = 1.8;

  void main() {
    vec2 pointCoordinate = gl_PointCoord;
    vec2 glyphCoordinate = (pointCoordinate - 0.5) * HALO_SCALE + 0.5;
    float insideGlyph = step(0.0, glyphCoordinate.x) * step(glyphCoordinate.x, 1.0)
      * step(0.0, glyphCoordinate.y) * step(glyphCoordinate.y, 1.0);

    float glyphIndex = floor(vGlyph + 0.5);
    float atlasColumn = mod(glyphIndex, uGrid.x);
    float atlasRow = floor(glyphIndex / uGrid.x);
    vec2 atlasCoordinate = vec2(
      (atlasColumn + glyphCoordinate.x) / uGrid.x,
      1.0 - (atlasRow + glyphCoordinate.y) / uGrid.y
    );
    float glyphAlpha = texture2D(uAtlas, atlasCoordinate).a * insideGlyph;

    float distanceFromCenter = length(pointCoordinate - 0.5);
    float softDisc = smoothstep(0.5, 0.0, distanceFromCenter);
    float halo = softDisc * softDisc;
    float dotAlpha = smoothstep(0.5, 0.2, distanceFromCenter);

    // 먼 기둥은 글자 대신 흐릿한 얼룩에 가깝게 그려서 초점이 나간 것처럼 보이게 한다
    float glyphLayer = mix(glyphAlpha, halo * 0.3, vBlur);
    float glowLayer = halo * vBright * 0.22 * (1.0 - uInk);

    float alpha = mix((glyphLayer + glowLayer) * vIntensity, dotAlpha * vIntensity, vMorph);
    vec3 color = mix(mix(uColorDim, uColorBright, vBright), uColorDot, vMorph);

    gl_FragColor = vec4(color, alpha * uFade);
    #include <colorspace_fragment>
  }
`;
```

- [ ] **Step 3: `GlyphParticles.tsx`를 만든다**

```tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { MeshSurfaceSampler } from "three/addons/math/MeshSurfaceSampler.js";
import { useFrame } from "@react-three/fiber";
import {
  ATLAS_COLUMNS,
  ATLAS_ROWS,
  CODE_CORPUS,
  createGlyphAtlasTexture,
  glyphIndexForCharacterCode,
} from "@/components/scene/glyphAtlas";
import {
  GLYPH_FRAGMENT_SHADER,
  GLYPH_VERTEX_SHADER,
  STREAM_DEPTH_FAR,
  STREAM_DEPTH_NEAR,
  STREAM_HALF_WIDTH,
} from "@/components/scene/glyphShaders";
import {
  PART_COUNT,
  THEME_ONLY_KEY,
} from "@/components/scene/partDefinitions";
import {
  FIELD_OF_VIEW,
  computeViewportUnits,
  createViewportUnits,
  resolveSceneProfile,
} from "@/components/scene/sceneLayout";
import { sceneState } from "@/components/scene/sceneState";
import {
  computeClumpCenter,
  createScenePhases,
  samplePhases,
  type ClumpCenter,
} from "@/components/scene/sectionChoreography";
import {
  SCENE_PALETTES,
  type ScenePalette,
  type ThemeName,
} from "@/components/scene/themePalette";
import type { PartSet } from "@/components/scene/usePartGroups";
import {
  WAVE_COLUMNS,
  configureWaveSurface,
  resetWaveSurface,
  stepWaveSurface,
  waveSurface,
} from "@/components/scene/waveSurface";

interface GlyphParticlesProps {
  parts: PartSet;
  themeName: ThemeName;
  isMobile: boolean;
}

const MAX_FRAME_DELTA = 0.1;
const COLOR_FOLLOW_SPEED = 4;
// 커서가 멈추면 에너지가 반 초 정도에 걸쳐 빠지면서 파도도 잦아든다
const POINTER_ENERGY_DECAY = 2.5;
// 웅덩이의 가로세로 비율 근사값. 격자 칸을 정사각형에 가깝게 만드는 데만 쓴다
const POOL_ASPECT = 6.5;

interface ParticleLayout {
  columnCount: number;
  slotsPerColumn: number;
  poolMemberCount: number;
}

const DESKTOP_LAYOUT: ParticleLayout = {
  columnCount: 112,
  slotsPerColumn: 104,
  poolMemberCount: 5200,
};
const MOBILE_LAYOUT: ParticleLayout = {
  columnCount: 48,
  slotsPerColumn: 84,
  poolMemberCount: 1800,
};

interface SurfaceTarget {
  x: number;
  y: number;
  z: number;
  partIndex: number;
}

function computeSurfaceArea(mesh: THREE.Mesh): number {
  const positionAttribute = mesh.geometry.attributes.position;
  const indexAttribute = mesh.geometry.index;
  const triangleCount = indexAttribute
    ? indexAttribute.count / 3
    : positionAttribute.count / 3;
  const vertexA = new THREE.Vector3();
  const vertexB = new THREE.Vector3();
  const vertexC = new THREE.Vector3();
  let area = 0;
  for (
    let triangleIndex = 0;
    triangleIndex < triangleCount;
    triangleIndex += 1
  ) {
    const offset = triangleIndex * 3;
    const indexA = indexAttribute ? indexAttribute.getX(offset) : offset;
    const indexB = indexAttribute
      ? indexAttribute.getX(offset + 1)
      : offset + 1;
    const indexC = indexAttribute
      ? indexAttribute.getX(offset + 2)
      : offset + 2;
    vertexA.fromBufferAttribute(positionAttribute, indexA);
    vertexB.fromBufferAttribute(positionAttribute, indexB);
    vertexC.fromBufferAttribute(positionAttribute, indexC);
    area += vertexB.sub(vertexA).cross(vertexC.sub(vertexA)).length() * 0.5;
  }
  return area;
}

// 부품 표면에서 넓이에 비례하는 수의 목표점을 뽑는다. 부품 로컬 좌표라서 부품이 어디에 있든 쓸 수 있다
function sampleSurfaceTargets(
  groups: THREE.Group[],
  totalCount: number,
): SurfaceTarget[] {
  const meshEntries: { mesh: THREE.Mesh; partIndex: number; area: number }[] =
    [];
  groups.forEach((group, partIndex) => {
    group.children.forEach((child) => {
      // 한쪽 테마에서만 보이는 메시는 뺀다. 입자가 보이지 않는 표면에 내려앉으면 안 된다
      if (child instanceof THREE.Mesh && !child.userData[THEME_ONLY_KEY]) {
        child.updateMatrix();
        meshEntries.push({
          mesh: child,
          partIndex,
          area: computeSurfaceArea(child),
        });
      }
    });
  });
  const totalArea = meshEntries.reduce((sum, entry) => sum + entry.area, 0);

  const targets: SurfaceTarget[] = [];
  const sampledPosition = new THREE.Vector3();
  meshEntries.forEach((entry) => {
    const sampler = new MeshSurfaceSampler(entry.mesh).build();
    const sampleCount = Math.max(
      12,
      Math.round((entry.area / totalArea) * totalCount),
    );
    for (let sampleIndex = 0; sampleIndex < sampleCount; sampleIndex += 1) {
      sampler.sample(sampledPosition);
      sampledPosition.applyMatrix4(entry.mesh.matrix);
      targets.push({
        x: sampledPosition.x,
        y: sampledPosition.y,
        z: sampledPosition.z,
        partIndex: entry.partIndex,
      });
    }
  });
  // 같은 기둥의 글자가 한 부품으로만 몰리지 않게 섞는다
  for (let index = targets.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [targets[index], targets[swapIndex]] = [targets[swapIndex], targets[index]];
  }
  return targets;
}

function createParticleGeometry(
  layout: ParticleLayout,
  groups: THREE.Group[],
): THREE.BufferGeometry {
  const particleCount = layout.columnCount * layout.slotsPerColumn;
  const targets = sampleSurfaceTargets(groups, particleCount);
  const streamAttribute = new Float32Array(particleCount * 3);
  const randomAttribute = new Float32Array(particleCount * 4);
  const targetAttribute = new Float32Array(particleCount * 3);
  const glyphAttribute = new Float32Array(particleCount);

  for (
    let columnIndex = 0;
    columnIndex < layout.columnCount;
    columnIndex += 1
  ) {
    const columnX = (Math.random() * 2 - 1) * STREAM_HALF_WIDTH;
    const columnZ =
      STREAM_DEPTH_FAR +
      Math.pow(Math.random(), 0.8) * (STREAM_DEPTH_NEAR - STREAM_DEPTH_FAR);
    const columnSpeed = 0.012 + Math.random() * 0.03;
    const corpusOffset = Math.floor(Math.random() * CODE_CORPUS.length);

    for (let slotIndex = 0; slotIndex < layout.slotsPerColumn; slotIndex += 1) {
      const particleIndex = columnIndex * layout.slotsPerColumn + slotIndex;
      const target = targets[particleIndex % targets.length];

      streamAttribute[particleIndex * 3] = columnX;
      streamAttribute[particleIndex * 3 + 1] =
        slotIndex / layout.slotsPerColumn;
      streamAttribute[particleIndex * 3 + 2] = columnZ;

      randomAttribute[particleIndex * 4] = columnSpeed;
      randomAttribute[particleIndex * 4 + 1] = Math.random();
      randomAttribute[particleIndex * 4 + 2] = target.partIndex;
      randomAttribute[particleIndex * 4 + 3] = columnIndex / layout.columnCount;

      targetAttribute[particleIndex * 3] = target.x;
      targetAttribute[particleIndex * 3 + 1] = target.y;
      targetAttribute[particleIndex * 3 + 2] = target.z;

      // 기둥이 위로 올라가도 위에서 아래로 읽히도록 위쪽 칸일수록 앞 글자를 둔다
      const corpusIndex =
        (corpusOffset + (layout.slotsPerColumn - 1 - slotIndex)) %
        CODE_CORPUS.length;
      glyphAttribute[particleIndex] = glyphIndexForCharacterCode(
        CODE_CORPUS.charCodeAt(corpusIndex),
      );
    }
  }

  // 웅덩이에 들어가는 입자만 육각 격자에 배치한다. 나머지는 웅덩이로 변할 때 사라진다
  const poolAttribute = new Float32Array(particleCount * 3);
  const poolMetaAttribute = new Float32Array(particleCount * 2);
  const shuffledIndices = Array.from(
    { length: particleCount },
    (_, index) => index,
  );
  for (let index = shuffledIndices.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffledIndices[index], shuffledIndices[swapIndex]] = [
      shuffledIndices[swapIndex],
      shuffledIndices[index],
    ];
  }
  const poolMemberCount = Math.min(layout.poolMemberCount, particleCount);
  const poolGridColumns = Math.round(Math.sqrt(poolMemberCount * POOL_ASPECT));
  const poolGridRows = Math.ceil(poolMemberCount / poolGridColumns);
  shuffledIndices.forEach((particleIndex, order) => {
    const isMember = order < poolMemberCount;
    const gridColumn = order % poolGridColumns;
    const gridRow = Math.floor(order / poolGridColumns);
    const hexOffset = gridRow % 2 === 0 ? 0 : 0.5;
    const jitterX = (Math.random() - 0.5) * 0.5;
    const jitterY = (Math.random() - 0.5) * 0.5;
    poolAttribute[particleIndex * 3] = isMember
      ? ((gridColumn + hexOffset + 0.5 + jitterX) / poolGridColumns) * 2 - 1
      : Math.random() * 2 - 1;
    poolAttribute[particleIndex * 3 + 1] = isMember
      ? (gridRow + 0.5 + jitterY) / poolGridRows
      : Math.random();
    poolAttribute[particleIndex * 3 + 2] = (Math.random() - 0.5) * 0.8;
    poolMetaAttribute[particleIndex * 2] = isMember ? 1 : 0;
    poolMetaAttribute[particleIndex * 2 + 1] = Math.random();
  });

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(new Float32Array(particleCount * 3), 3),
  );
  geometry.setAttribute(
    "aStream",
    new THREE.BufferAttribute(streamAttribute, 3),
  );
  geometry.setAttribute(
    "aRandom",
    new THREE.BufferAttribute(randomAttribute, 4),
  );
  geometry.setAttribute(
    "aTarget",
    new THREE.BufferAttribute(targetAttribute, 3),
  );
  geometry.setAttribute("aGlyph", new THREE.BufferAttribute(glyphAttribute, 1));
  geometry.setAttribute("aPool", new THREE.BufferAttribute(poolAttribute, 3));
  geometry.setAttribute(
    "aPoolMeta",
    new THREE.BufferAttribute(poolMetaAttribute, 2),
  );
  return geometry;
}

function createParticleMaterial(
  partMatrices: THREE.Matrix4[],
  palette: ScenePalette,
): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    blending: palette.additive ? THREE.AdditiveBlending : THREE.NormalBlending,
    uniforms: {
      uTime: { value: 0 },
      uMorph: { value: 0 },
      uFade: { value: 1 },
      uInk: { value: palette.additive ? 0 : 1 },
      uPixelScale: { value: 1 },
      uDotScale: { value: 1 },
      uFrustum: { value: new THREE.Vector2(1, 1) },
      uPointerNdc: { value: new THREE.Vector2(0, 0) },
      uPointerStrength: { value: 0 },
      uAtlas: { value: createGlyphAtlasTexture() },
      uGrid: { value: new THREE.Vector2(ATLAS_COLUMNS, ATLAS_ROWS) },
      uColorDim: { value: new THREE.Color(palette.glyphDim) },
      uColorBright: { value: new THREE.Color(palette.glyphBright) },
      uColorDot: { value: new THREE.Color(palette.dot) },
      uPartMatrices: { value: partMatrices },
      uPool: { value: 0 },
      uPoolHalfWidth: { value: 1 },
      uPoolFloorY: { value: -1 },
      uWaveHeight: { value: waveSurface.heights },
      uWaveVelocity: { value: waveSurface.velocities },
    },
    transparent: true,
    depthWrite: false,
    depthTest: false,
    toneMapped: false,
    defines: { PART_COUNT, WAVE_COLUMNS },
    vertexShader: GLYPH_VERTEX_SHADER,
    fragmentShader: GLYPH_FRAGMENT_SHADER,
  });
}

export default function GlyphParticles({
  parts,
  themeName,
  isMobile,
}: GlyphParticlesProps) {
  const layout = isMobile ? MOBILE_LAYOUT : DESKTOP_LAYOUT;
  const geometry = useMemo(
    () => createParticleGeometry(layout, parts.groups),
    [layout, parts],
  );
  // 색은 테마 전환 때 useFrame이 보간하므로 처음 팔레트만 여기서 심는다
  const [material] = useState(() =>
    createParticleMaterial(parts.matrices, SCENE_PALETTES[themeName]),
  );
  const phases = useMemo(() => createScenePhases(), []);
  const viewport = useMemo(() => createViewportUnits(), []);
  const clumpCenter = useMemo<ClumpCenter>(
    () => ({ x: 0, y: 0, scale: 1 }),
    [],
  );
  const targetColor = useMemo(() => new THREE.Color(), []);
  const pointsRef = useRef<THREE.Points>(null);
  const configuredViewportKey = useRef("");

  useEffect(() => {
    return () => geometry.dispose();
  }, [geometry]);

  useEffect(() => {
    return () => {
      (material.uniforms.uAtlas.value as THREE.Texture).dispose();
      material.dispose();
    };
  }, [material]);

  // 혼합 모드는 보간할 수 없어서 테마가 바뀌면 즉시 바꾼다. 색은 useFrame에서 보간한다
  useEffect(() => {
    const palette = SCENE_PALETTES[themeName];
    material.blending = palette.additive
      ? THREE.AdditiveBlending
      : THREE.NormalBlending;
    material.uniforms.uInk.value = palette.additive ? 0 : 1;
    material.needsUpdate = true;
  }, [material, themeName]);

  useFrame((state, delta) => {
    // 높이가 0이면 단위 환산이 0으로 나뉘어 NaN이 된다
    if (state.size.height === 0) return;
    const frameDelta = Math.min(delta, MAX_FRAME_DELTA);
    const elapsedTime = state.clock.elapsedTime;
    computeViewportUnits(state.size.width, state.size.height, viewport);
    const profile = resolveSceneProfile(
      isMobile,
      sceneState.layout.contentMarginPixels,
      viewport,
    );
    samplePhases(sceneState.sectionProgress, profile, phases);
    computeClumpCenter(
      phases,
      viewport,
      profile,
      window.scrollY,
      sceneState.layout,
      clumpCenter,
    );

    // 화면 크기가 바뀔 때만 웅덩이 바닥과 너비를 다시 잡는다
    const viewportKey = `${state.size.width}x${state.size.height}`;
    if (viewportKey !== configuredViewportKey.current) {
      configureWaveSurface(viewport);
      material.uniforms.uPoolFloorY.value = waveSurface.floorY;
      material.uniforms.uPoolHalfWidth.value = waveSurface.halfWidth;
      configuredViewportKey.current = viewportKey;
    }

    const tangentHalfFov = Math.tan(((FIELD_OF_VIEW / 2) * Math.PI) / 180);
    const { uniforms } = material;
    uniforms.uTime.value = elapsedTime;
    uniforms.uMorph.value = phases.morph;
    uniforms.uFade.value = phases.particleFade;
    uniforms.uPool.value = phases.pool;
    uniforms.uDotScale.value = clumpCenter.scale * (isMobile ? 1.5 : 1);
    uniforms.uFrustum.value.set(
      tangentHalfFov * (state.size.width / state.size.height),
      tangentHalfFov,
    );
    uniforms.uPixelScale.value =
      (state.size.height * state.gl.getPixelRatio()) / (2 * tangentHalfFov);
    uniforms.uPointerNdc.value.set(sceneState.pointer.x, sceneState.pointer.y);
    uniforms.uPointerStrength.value +=
      ((sceneState.pointerActive ? 1 : 0) - uniforms.uPointerStrength.value) *
      (1 - Math.exp(-frameDelta * 8));

    const palette = SCENE_PALETTES[themeName];
    const blendRatio = 1 - Math.exp(-frameDelta * COLOR_FOLLOW_SPEED);
    uniforms.uColorDim.value.lerp(
      targetColor.set(palette.glyphDim),
      blendRatio,
    );
    uniforms.uColorBright.value.lerp(
      targetColor.set(palette.glyphBright),
      blendRatio,
    );
    uniforms.uColorDot.value.lerp(targetColor.set(palette.dot), blendRatio);

    // 파도. 커서 에너지는 여기서 줄이고, 글자 출렁임을 위해 진행도를 waveSurface에 남긴다
    const pointerActivity = sceneState.pointerActive
      ? Math.min(sceneState.pointerEnergy, 1)
      : 0;
    sceneState.pointerEnergy *= Math.exp(-frameDelta * POINTER_ENERGY_DECAY);
    waveSurface.pool = phases.pool;
    if (phases.pool > 0.001) {
      stepWaveSurface(
        frameDelta,
        elapsedTime,
        sceneState.pointer.x * viewport.halfWidth,
        sceneState.pointer.y * viewport.halfHeight,
        pointerActivity,
        viewport.halfHeight * 2,
      );
    } else if (waveSurface.velocities[0] !== 0) {
      resetWaveSurface();
    }

    if (pointsRef.current) {
      pointsRef.current.visible = phases.particleFade > 0.001;
    }
  });

  return (
    <points
      ref={pointsRef}
      geometry={geometry}
      material={material}
      frustumCulled={false}
      renderOrder={2}
    />
  );
}
```

- [ ] **Step 4: `Scene.tsx`의 `SceneContents`에 입자를 넣는다**

import를 더한다.

```tsx
import GlyphParticles from "@/components/scene/GlyphParticles";
```

`SceneContents`의 반환에서 `UiParts` 뒤에 추가한다. reduced motion에서는 입자를 켜지 않는다.

```tsx
{
  !isFrozen && (
    <GlyphParticles parts={parts} themeName={themeName} isMobile={isMobile} />
  );
}
```

- [ ] **Step 5: lint와 타입 검사**

Run: `pnpm lint`
Expected: 오류 없음.

Run: `lsof -i :3000` 확인 후 `pnpm build` 또는 `pnpm exec tsc --noEmit`
Expected: 오류 없음. `three/addons/math/MeshSurfaceSampler.js`의 타입이 없다고 나오면 `@types/three`가 `three/addons/*`를 매핑하는지 확인한다. 같은 저장소에서 `three/addons/geometries/RoundedBoxGeometry.js`를 이미 쓰고 있으므로 매핑은 있다.

- [ ] **Step 6: 브라우저에서 전체 흐름을 확인한다**

- 첫 화면에서 코드 글자 기둥이 아래에서 위로 올라간다. 몇 글자만 밝고 대부분 어둡다. 다크 모드에서 청록과 보라 안개가 보인다.
- 히어로에서 About으로 내리면 글자가 날아가 부품 표면에 내려앉고, 부품이 점이 채워지듯 굳으면서 안개가 옅어진다. 굳는 순간 빛이 잠깐 돈다.
- 테마를 라이트로 바꾸면 글자가 남색 잉크처럼 보이고 부품 색이 부드럽게 바뀐다.
- Contact로 내리면 부품이 뭉쳤다가 점과 기호로 풀려 화면 아래 4분의 1에 고인다. 커서를 허공에서 움직이면 아무 일도 없고, 점 위에서 움직이면 그 자리에서 솟았다가 양옆으로 갈라져 가라앉는다.
- 창을 1024×768로 줄여 Stack에서 부품이 문구 위아래에 있는지 본다.
- 콘솔에 셰이더 컴파일 오류가 없다.

---

### Task 6: Contact 글자 출렁임과 푸터

**Files:**

- Create: `src/components/sections/WaveText.tsx`
- Create: `src/hooks/useWaveText.ts`
- Modify: `src/components/sections/ContactSection.tsx`

**Interfaces:**

- Consumes: `waveSurface`, `sampleWaveHeight`, `computeViewportUnits`, `gsap`.
- Produces: `WaveText` props `{ text: string }`, `useWaveText(containerRef)`.

- [ ] **Step 1: `WaveText.tsx`를 만든다**

```tsx
import { Fragment } from "react";

interface WaveTextProps {
  text: string;
}

// 글자마다 span을 두어 파도를 따라 따로 움직일 수 있게 한다. 원문은 스크린 리더용으로 따로 둔다
export default function WaveText({ text }: WaveTextProps) {
  const words = text.split(" ");

  return (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((word, wordIndex) => (
          <Fragment key={`${wordIndex}-${word}`}>
            {wordIndex > 0 && " "}
            <span className="inline-block whitespace-nowrap">
              {Array.from(word).map((character, characterIndex) => (
                <span
                  key={characterIndex}
                  data-wave-letter
                  className="inline-block will-change-transform"
                >
                  {character}
                </span>
              ))}
            </span>
          </Fragment>
        ))}
      </span>
    </>
  );
}
```

- [ ] **Step 2: `useWaveText.ts`를 만든다**

```ts
"use client";

import { useEffect, type RefObject } from "react";
import { gsap } from "@/lib/gsap";
import {
  clamp,
  computeViewportUnits,
  createViewportUnits,
} from "@/components/scene/sceneLayout";
import { sampleWaveHeight, waveSurface } from "@/components/scene/waveSurface";
import { useReducedMotion } from "@/hooks/useReducedMotion";

// 수면이 글자 밑선에서 이 거리 안으로 오면 글자가 반응하기 시작한다 (장면 단위)
const LETTER_APPROACH = 3;
// 파도가 멀리 있을 때와 글자에 닿았을 때, 물결 높이 중 글자에 전해지는 비율.
// 줄마다 비슷하게 움직여야 줄끼리 겹치지 않으므로 잠긴 깊이만큼 띄우는 항은 두지 않는다
const LETTER_LIFT_FAR = 0.05;
const LETTER_LIFT_NEAR = 0.3;
const LETTER_MAX_TILT = 0.35;

interface WaveLetter {
  element: HTMLElement;
  documentCenterX: number;
  documentBottom: number;
}

// 컨테이너 안의 WaveText 글자를 마지막 구간에서 파도를 따라 들어 올리고 기울인다
export function useWaveText(containerRef: RefObject<HTMLElement | null>) {
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const container = containerRef.current;
    if (reducedMotion || !container) return;

    const letters: WaveLetter[] = Array.from(
      container.querySelectorAll<HTMLElement>("[data-wave-letter]"),
    ).map((element) => ({ element, documentCenterX: 0, documentBottom: 0 }));
    const viewport = createViewportUnits();
    let displaced = false;
    let disposed = false;

    const clearTransforms = () => {
      letters.forEach((letter) => {
        letter.element.style.transform = "";
      });
      displaced = false;
    };

    // 변형을 지운 상태에서 문서 기준 자리를 재 둔다. data-reveal의 transform이 rect에는 섞이므로 offset 체인으로 잰다
    const measure = () => {
      if (disposed) return;
      clearTransforms();
      letters.forEach((letter) => {
        let documentLeft = 0;
        let documentTop = 0;
        let offsetElement: HTMLElement | null = letter.element;
        while (offsetElement) {
          documentLeft += offsetElement.offsetLeft;
          documentTop += offsetElement.offsetTop;
          offsetElement = offsetElement.offsetParent as HTMLElement | null;
        }
        letter.documentCenterX = documentLeft + letter.element.offsetWidth / 2;
        letter.documentBottom = documentTop + letter.element.offsetHeight;
      });
    };

    const update = () => {
      if (waveSurface.pool < 0.001) {
        if (displaced) clearTransforms();
        return;
      }
      displaced = true;
      computeViewportUnits(window.innerWidth, window.innerHeight, viewport);
      const {
        pool,
        restHeight,
        floorY,
        halfWidth: poolHalfWidth,
      } = waveSurface;

      letters.forEach((letter) => {
        const screenBottom = letter.documentBottom - window.scrollY;
        const sceneX =
          (letter.documentCenterX / window.innerWidth) *
            2 *
            viewport.halfWidth -
          viewport.halfWidth;
        const sceneBottomY =
          viewport.halfHeight - screenBottom / viewport.pixelsPerUnit;
        const u = sceneX / poolHalfWidth;
        const height = sampleWaveHeight(u);
        const swell = Math.max(0, height - restHeight);
        // 수면과 글자 밑선 사이 거리. 음수면 글자가 수면에 잠긴 것이다
        const gap = sceneBottomY - (floorY + height);
        const proximity = 1 - clamp(gap / LETTER_APPROACH, 0, 1);
        const lift =
          swell *
          (LETTER_LIFT_FAR + (LETTER_LIFT_NEAR - LETTER_LIFT_FAR) * proximity);
        // 수면의 기울기를 따라 글자도 기운다. CSS는 시계 방향이 양수라서 부호를 뒤집는다
        const slope =
          (sampleWaveHeight(u + 0.02) - sampleWaveHeight(u - 0.02)) /
          (0.04 * poolHalfWidth);
        const tilt = clamp(
          Math.atan(slope) * 0.5 * proximity,
          -LETTER_MAX_TILT,
          LETTER_MAX_TILT,
        );
        letter.element.style.transform = `translate3d(0, ${(
          -lift *
          pool *
          viewport.pixelsPerUnit
        ).toFixed(1)}px, 0) rotate(${(-tilt * pool).toFixed(3)}rad)`;
      });
    };

    measure();
    document.fonts.ready.then(measure);
    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(container);
    window.addEventListener("resize", measure);
    gsap.ticker.add(update);

    return () => {
      disposed = true;
      gsap.ticker.remove(update);
      resizeObserver.disconnect();
      window.removeEventListener("resize", measure);
      clearTransforms();
    };
  }, [containerRef, reducedMotion]);
}
```

- [ ] **Step 3: `ContactSection.tsx`를 아래로 바꾼다**

```tsx
"use client";

import { useRef } from "react";
import WaveText from "@/components/sections/WaveText";
import { useRevealOnScroll } from "@/hooks/useRevealOnScroll";
import { useWaveText } from "@/hooks/useWaveText";
import { PROFILE } from "@/content/profile";

const CURRENT_YEAR = new Date().getFullYear();

export default function ContactSection() {
  const sectionRef = useRef<HTMLElement>(null);
  useRevealOnScroll(sectionRef);
  useWaveText(sectionRef);

  return (
    // 뷰포트보다 짧으면 sectionProgress가 마지막 값에 닿지 못해 마무리 연출이 나오지 않는다
    <section
      id="contact"
      ref={sectionRef}
      className="flex min-h-svh flex-col justify-between px-5 pt-32 pb-8 md:px-10"
    >
      <div>
        <p
          data-reveal
          className="font-mono text-xs tracking-[0.2em] text-muted uppercase"
        >
          05 / 연락처
        </p>
        <h2
          data-reveal
          className="mt-3 text-[clamp(3.5rem,12vw,11rem)] leading-[0.9] font-semibold tracking-tighter text-fg"
        >
          <WaveText text="Let's talk" />
        </h2>

        <div data-reveal className="mt-10 flex flex-col items-start gap-3">
          <a
            href={`mailto:${PROFILE.email}`}
            className="text-2xl font-medium tracking-tight text-fg underline decoration-line decoration-1 underline-offset-8 transition-colors hover:text-accent hover:decoration-accent md:text-4xl"
          >
            <WaveText text={PROFILE.email} />
          </a>
          <a
            href={PROFILE.githubUrl}
            target="_blank"
            rel="noreferrer"
            className="text-base text-muted transition-colors hover:text-accent md:text-lg"
          >
            github.com/Takyunho ↗
          </a>
        </div>
      </div>

      {/* 웅덩이 위에 놓이므로 반투명 띠를 깔아 읽히게 한다 */}
      <footer className="flex flex-col gap-2 rounded-xl bg-bg/60 px-4 py-3 font-mono text-xs text-muted backdrop-blur-sm md:flex-row md:justify-between">
        <p>
          © {CURRENT_YEAR} {PROFILE.nameEnglish}
        </p>
        <p>Built with Next.js, React Three Fiber</p>
      </footer>
    </section>
  );
}
```

- [ ] **Step 4: lint와 타입 검사**

Run: `pnpm lint`
Expected: 오류 없음.

Run: `lsof -i :3000` 확인 후 `pnpm build` 또는 `pnpm exec tsc --noEmit`
Expected: 오류 없음.

- [ ] **Step 5: 브라우저에서 확인한다**

- Contact에서 "Let's talk"와 이메일이 한 줄로 온전히 보이고(글자 사이가 벌어지거나 줄이 바뀌지 않는다), 밑줄이 유지된다.
- 웅덩이 위에서 커서를 움직이면 파도가 지나가는 자리의 글자가 들리고 마루 양옆 글자가 기운다. 두 줄이 겹치지 않는다.
- 커서를 멈추면 1~2초 안에 글자가 제자리로 돌아온다.
- 스크롤을 올려 `pool`이 0이 되면 글자 변형이 남지 않는다.
- 푸터가 점 위에서도 읽힌다.

---

### Task 7: README 갱신과 최종 확인

**Files:**

- Modify: `README.md`

- [ ] **Step 1: README의 주요 특징 두 번째 항목을 바꾼다**

```markdown
- **코드가 UI 부품이 되는 3D 장면**이 있습니다. 첫 화면에서 실제 코드 글자가 기둥처럼 올라가고, 스크롤을 내리면 글자 입자가 브라우저 창, 버튼, 토글 같은 UI 부품의 표면에 내려앉아 광택 있는 입체로 굳어집니다. 부품은 본문 양옆에 머물다가 마지막에 점으로 풀려 화면 아래에 고이고, 커서가 점에 닿으면 파도처럼 솟았다 가라앉습니다.
```

- [ ] **Step 2: 기술 스택 표의 3D 행을 바꾼다**

```markdown
| 3D | three.js, React Three Fiber, drei |
```

- [ ] **Step 3: 폴더 구조 표의 scene 행을 바꾼다**

```markdown
| `src/components/scene/` | 3D 장면 (코드 글자 입자, UI 부품, 배치 규칙, 수면 시뮬레이션, 조명, 연출 타임라인) |
```

- [ ] **Step 4: "3D 장면이 동작하는 방식" 절을 아래로 바꾼다**

```markdown
## 3D 장면이 동작하는 방식

화면 뒤에 고정된 투명 `Canvas` 하나가 있고, 그 위에서 DOM 섹션이 스크롤됩니다. 두 영역은 `src/components/scene/sceneState.ts`의 가변 객체 하나로 이어져 있습니다. 스크롤 진행도와 포인터 좌표처럼 매 프레임 바뀌는 값을 React state로 두면 불필요한 리렌더가 생기기 때문에, DOM 쪽이 이 객체에 값을 쓰고 3D 쪽이 매 프레임 읽는 방식을 택했습니다.

장면은 두 가지로 이루어집니다.

- `GlyphParticles`는 코드 글자 입자 전부를 `Points` 하나로 그립니다. 정점 셰이더가 기둥, 부품 표면으로 모이기, 웅덩이의 세 단계를 계산하고, 글자판은 실행 시 canvas로 만듭니다.
- `UiParts`는 코드로 만든 UI 부품 여섯 개입니다. 입자가 내려앉을 표면이자 굳어진 뒤의 모습이며, 매 프레임 부품의 행렬을 입자 셰이더에 넘깁니다.

연출을 조정할 때 보는 파일은 다음과 같습니다.

- `sectionChoreography.ts`에는 섹션 진행도에 따라 모이기, 굳기, 흩어지기, 다시 뭉치기, 풀리기, 고이기가 일어나는 구간이 데스크톱과 휴대폰으로 나뉘어 있습니다.
- `sceneLayout.ts`에는 부품이 흩어질 때의 자리 규칙이 있습니다. 본문 옆 여백이 넓으면 여백 한가운데에 두고, 좁으면(태블릿, 휴대폰, 세로로 긴 창) 섹션 문구 사이 빈 공간에 둘씩 두어 문구를 가리지 않게 합니다. 어느 쪽인지는 미디어 쿼리가 아니라 실제로 잰 여백으로 정합니다.
- `partDefinitions.ts`에는 부품의 형태와 덩어리 안의 자리, 흩어질 때 향하는 자리가 있습니다.
- `waveSurface.ts`에는 마지막 구간의 파도를 만드는 1차원 수면 시뮬레이션이 있습니다. Contact의 글자도 이 높이를 읽어 함께 출렁입니다.
- `themePalette.ts`에는 테마별 부품 재질색, 입자색, 조명 강도가 있습니다. 라이트 모드는 입자를 잉크처럼 일반 혼합으로 그립니다. 여기의 `accent` 값은 `globals.css`의 `--accent`와 같은 색으로 맞춰야 합니다.

섹션을 추가하거나 순서를 바꿀 때는 `sceneState.ts`의 `SECTION_IDS`와 섹션 요소의 `id`를 함께 맞추고, `sectionChoreography.ts`의 구간과 `SceneStateSync.tsx`의 문구 사이 빈 공간 목록을 다시 정합니다.
```

- [ ] **Step 5: 남은 rapier 언급을 확인한다**

Run: `grep -rn "Rapier\|rapier" README.md src`
Expected: 결과 없음. `package.json`의 의존성은 남아 있어야 하므로 검사 대상에서 뺀다.

- [ ] **Step 6: lint와 build**

Run: `pnpm lint`
Expected: 오류 없음.

Run: `lsof -i :3000` 확인 후 `pnpm build`
Expected: 오류 없음. 사용자가 dev 서버를 내리기 전에는 build하지 않는다.

- [ ] **Step 7: 최종 브라우저 확인**

브라우저 미리보기 도구로 아래 크기에서 확인한다. 창이 가려지면 `requestAnimationFrame`이 멈추므로 확인 중에는 미리보기 창이 보이는 상태로 둔다.

| 크기      | 확인할 것                                                                          |
| :-------- | :--------------------------------------------------------------------------------- |
| 1440×900  | Stack, Work, Lab에서 부품이 본문 양옆에 온전히 보이고 본문 글자와 겹치지 않는다    |
| 1324×2000 | 부품이 문구 위아래에 둘씩 보이고, 스크롤 중 문구 위를 지나가지 않는다              |
| 1024×768  | 같은 확인. 부품이 화면 위아래 끝에 잘리지 않는다                                   |
| 390×844   | 히어로 위쪽에서 덩어리가 굳고, About 문구와 겹치지 않으며, 문구 사이에 둘씩 보인다 |

공통으로 다음을 본다.

- 라이트 모드와 다크 모드 모두에서 첫 화면 제목이 읽힌다.
- Contact에서 커서가 허공일 때 파도가 없고, 점에 닿았을 때 솟는다. 글자가 함께 출렁인다.
- 브라우저의 동작 줄이기 설정(개발자 도구 렌더링 탭에서 `prefers-reduced-motion: reduce` 에뮬레이션)에서 굳은 덩어리가 히어로에 정지해 있고 입자가 없다.
- 콘솔 오류가 없다. 콘솔은 `pattern`이나 `limit`을 주고 읽는다.
- 데스크톱에서 프레임이 눈에 띄게 떨어지지 않는다.

- [ ] **Step 8: 최종 보고**

변경 파일 목록, lint와 build 결과, 브라우저에서 확인한 것과 확인하지 못한 것(직접 마우스로 느껴야 하는 파도의 리듬 등)을 사용자에게 보고한다. 커밋은 사용자가 요청할 때 한다.
