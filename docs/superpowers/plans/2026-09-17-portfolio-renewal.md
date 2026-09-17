# 포트폴리오 전면 개편 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `yunho-dev`를 라이트와 다크 테마를 지원하는 3D 인터랙티브 단일 페이지 포트폴리오로 전면 개편한다.

**Architecture:** 화면 뒤에 고정된 투명 R3F `Canvas` 하나가 있고, 그 위에서 서버 렌더링된 DOM 섹션이 Lenis로 스크롤된다. DOM 쪽이 렌더링을 일으키지 않는 가변 객체 `sceneState`에 스크롤 진행도, 포인터, accent 색을 쓰면 3D 쪽이 `useFrame`에서 읽어서 물리 오브젝트의 끌개, 카메라, 재질색을 보간한다.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, Tailwind CSS 4, three, @react-three/fiber 9, @react-three/drei 10, @react-three/rapier 2, gsap(ScrollTrigger), lenis, next-themes, pretendard

**Spec:** `docs/superpowers/specs/2026-09-17-portfolio-renewal-design.md`

## Global Constraints

- Next.js는 15.5.x를 유지한다. 메이저 업그레이드를 하지 않는다.
- `@react-three/postprocessing`을 추가하지 않는다.
- 추가 패키지는 `@react-three/rapier`, `next-themes`, `pretendard` 세 개뿐이고, `framer-motion`은 제거한다.
- 회사 제품의 내부 화면이나 비공개 정보를 쓰지 않는다. GitHub 프로필 README에 공개된 문구와 공식 링크만 쓴다.
- 저장소에 테스트 러너가 없다. 각 Task의 검증은 `pnpm lint`와 `pnpm build`이고, 마지막 Task에서 브라우저 미리보기로 확인한다. TDD 단계는 두지 않는다.
- 커밋, 푸시, PR은 사용자가 요청할 때만 한다. 계획에 커밋 단계를 두지 않는다.
- 변수와 파라미터 이름은 축약하지 않는다 (`e` 대신 `event`, `el` 대신 `element`).
- 주석은 코드만으로 읽히지 않는 사실만 한 줄로 쓴다.
- 섹션의 DOM `id`는 `SectionId` 값과 같다: `hero`, `about`, `stack`, `work`, `lab`, `contact`.

---

### Task 1: 기반 정리 (브랜치, 의존성, 기존 파일 삭제, 테마 토큰, 레이아웃)

**Files:**

- Delete: `src/components/three/` 전체, `src/components/sections/` 기존 5개, `src/components/ui/ProjectModal.tsx`, `src/styles/` 전체, `src/lib/constants.ts`, `src/hooks/useMousePosition.ts`, `public/*.svg` 5개
- Modify: `package.json`, `next.config.ts`, `src/app/globals.css`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/hooks/useMediaQuery.ts`
- Create: `src/components/layout/ThemeProvider.tsx`, `src/hooks/useReducedMotion.ts`

**Interfaces:**

- Produces: Tailwind 색 유틸리티 `bg-bg`, `bg-surface`, `text-fg`, `text-muted`, `text-accent`, `border-line`. `useMediaQuery(query: string): boolean`, `useReducedMotion(): boolean`. `<ThemeProvider>`.

- [ ] **Step 1:** `develop`에서 작업 브랜치를 새로 만든다.
- [ ] **Step 2:** `pnpm remove framer-motion && pnpm add @react-three/rapier next-themes pretendard`
- [ ] **Step 3:** 위 Delete 목록을 삭제한다.
- [ ] **Step 4:** `next.config.ts`에서 쓰이지 않게 된 glb webpack 규칙을 제거하고 `transpilePackages: ["three"]`만 남긴다. `next dev --turbopack`에서 webpack 설정은 경고만 낸다.
- [ ] **Step 5:** `globals.css`를 두 벌의 토큰으로 다시 쓴다.

```css
@import "tailwindcss";
@import "pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css";

:root {
  --bg: #f0f1f5;
  --surface: #ffffff;
  --fg: #0d0e12;
  --muted: #5b6070;
  --accent: #1a2ffb;
  --line: rgba(13, 14, 18, 0.12);
}

[data-theme="dark"] {
  --bg: #0a0b0f;
  --surface: #12141a;
  --fg: #eceef3;
  --muted: #8a90a2;
  --accent: #5b6cff;
  --line: rgba(236, 238, 243, 0.14);
}

@theme inline {
  --color-bg: var(--bg);
  --color-surface: var(--surface);
  --color-fg: var(--fg);
  --color-muted: var(--muted);
  --color-accent: var(--accent);
  --color-line: var(--line);
  --font-sans:
    var(--font-geist-sans), "Pretendard Variable", Pretendard, system-ui,
    sans-serif;
  --font-mono: var(--font-geist-mono), ui-monospace, monospace;
}
```

그 아래에 Lenis 규칙(기존 그대로), `body`의 `background-color`와 `color`에 0.6초 transition, `::selection`, 히어로 제목 마스크용 `.line-mask`와 `.line-mask > span` (초기 `transform: translateY(110%)`, `prefers-reduced-motion: reduce`에서는 `transform: none`)을 둔다.

- [ ] **Step 6:** `ThemeProvider.tsx`는 `next-themes`의 `ThemeProvider`를 `attribute="data-theme"`, `defaultTheme="system"`, `enableSystem`으로 감싼 클라이언트 컴포넌트다.
- [ ] **Step 7:** `layout.tsx`의 `<html>`에 `suppressHydrationWarning`을 달고 `<body>`를 `ThemeProvider`로 감싼다. `<noscript><style>.line-mask > span { transform: none }</style></noscript>`을 넣는다. metadata 설명을 새 컨셉에 맞게 고친다.
- [ ] **Step 8:** `useMediaQuery`를 `useSyncExternalStore` 기반으로 바꾼다. 클라이언트 전용인 Scene이 첫 렌더부터 올바른 값을 받아서 강체 개수가 바뀌며 다시 마운트되는 일이 없게 하기 위해서다.

```ts
"use client";

import { useCallback, useSyncExternalStore } from "react";

export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const mediaQueryList = window.matchMedia(query);
      mediaQueryList.addEventListener("change", onStoreChange);
      return () => mediaQueryList.removeEventListener("change", onStoreChange);
    },
    [query],
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}
```

`useReducedMotion`은 `useMediaQuery("(prefers-reduced-motion: reduce)")`를 돌려준다.

- [ ] **Step 9:** `page.tsx`를 빈 `<main>`으로 두고 `pnpm lint && pnpm build`가 통과하는지 확인한다.

---

### Task 2: 콘텐츠 데이터

**Files:**

- Create: `src/content/profile.ts`, `src/content/stack.ts`, `src/content/projects.ts`, `src/content/lab.ts`

**Interfaces:**

- Produces:

```ts
// profile.ts
export const PROFILE: {
  nameKorean: string;
  nameEnglish: string;
  role: string;
  company: string;
  location: string;
  tagline: string;
  introduction: string;
  principles: { title: string; description: string }[];
  email: string;
  githubUrl: string;
};

// stack.ts
export interface StackCategory {
  label: string;
  labelKorean: string;
  items: string[];
}
export const STACK_CATEGORIES: StackCategory[];

// projects.ts
export interface ProjectLink {
  label: string;
  url: string;
}
export interface Project {
  id: string;
  title: string;
  period?: string;
  summary: string;
  highlights?: string[];
  techStack: string[];
  links: ProjectLink[];
  accentColor: string;
}
export const PROJECTS: Project[];

// lab.ts
export interface LabItem {
  name: string;
  description: string;
  language: string;
  year: string;
  url: string;
}
export const LAB_ITEMS: LabItem[];
```

- [ ] **Step 1:** README의 자기소개, 지향점 두 가지, 연락처를 `profile.ts`에 옮긴다. tagline은 "사용자가 머무르고 싶은 화면을 만듭니다."이다.
- [ ] **Step 2:** README 기술 스택 표의 5개 분류를 `stack.ts`에 그대로 옮긴다.
- [ ] **Step 3:** README 프로젝트 표의 2개를 `projects.ts`에 옮긴다. `highlights`는 사용자가 나중에 제공하므로 비워둔다. accentColor는 ProtectGO `#ff5a1f`, IDB 홈페이지 `#00b89c`다.
- [ ] **Step 4:** GitHub API로 공개 저장소의 실제 내용(README, 파일 목록)을 확인한 뒤 `lab.ts`를 쓴다. 설명을 확인할 수 없는 저장소는 추측해서 쓰지 않고 저장소 description만 쓴다.
- [ ] **Step 5:** `pnpm lint`

---

### Task 3: 장면 상태와 레이아웃 요소

**Files:**

- Create: `src/components/scene/sceneState.ts`, `src/lib/gsap.ts`, `src/components/layout/SmoothScroll.tsx`, `src/components/layout/SceneStateSync.tsx`, `src/components/layout/Header.tsx`, `src/components/layout/ThemeToggle.tsx`, `src/components/layout/CustomCursor.tsx`

**Interfaces:**

- Produces:

```ts
// sceneState.ts
export const SECTION_IDS = [
  "hero",
  "about",
  "stack",
  "work",
  "lab",
  "contact",
] as const;
export type SectionId = (typeof SECTION_IDS)[number];

export const sceneState = {
  // 0은 hero 중앙, 1은 about 중앙처럼 섹션 중앙을 정수로 하는 연속 값
  sectionProgress: 0,
  pointer: { x: 0, y: 0 }, // NDC (-1~1)
  pointerActive: false,
  accentOverride: null as string | null,
};

// lib/gsap.ts
export { gsap, ScrollTrigger }; // registerPlugin 완료된 상태
```

- [ ] **Step 1:** `sceneState.ts`와 `lib/gsap.ts`를 쓴다.
- [ ] **Step 2:** `SmoothScroll.tsx`는 reduced motion이 아닐 때만 `new Lenis({ autoRaf: false, anchors: true })`를 만들고, `lenis.on("scroll", ScrollTrigger.update)`, `gsap.ticker.add`로 `lenis.raf(time * 1000)`을 돌리고, `gsap.ticker.lagSmoothing(0)`을 건다. cleanup에서 ticker 콜백을 제거하고 `lenis.destroy()`를 부른다. 렌더 결과는 `null`이다.
- [ ] **Step 3:** `SceneStateSync.tsx`는 `null`을 렌더하는 클라이언트 컴포넌트다.
  - 섹션 중앙의 문서 Y좌표 배열을 `resize`와 `document.body`의 `ResizeObserver`에서 다시 잰다.
  - `scroll`에서 `window.scrollY + innerHeight / 2`가 어느 두 섹션 중앙 사이에 있는지 찾아 `sectionProgress = index + ratio`로 쓴다. 범위는 `[0, SECTION_IDS.length - 1]`로 자른다.
  - `pointermove`에서 NDC로 바꿔 `pointer`에 쓰고 `pointerActive = true`, `pointerleave`(document)와 `pointercancel`, `blur`에서 `false`로 돌린다.
  - reduced motion이면 스크롤 추적을 하지 않고 `sectionProgress`를 0으로 둔다.
- [ ] **Step 4:** `ThemeToggle.tsx`는 `useTheme()`의 `resolvedTheme`으로 해와 달 인라인 SVG를 바꾸는 버튼이다. 마운트 전에는 같은 크기의 빈 버튼을 렌더해서 hydration 불일치를 피한다. `aria-label`은 "다크 모드로 전환" 또는 "라이트 모드로 전환"이다.
- [ ] **Step 5:** `Header.tsx`는 `fixed` 상단 바다. 왼쪽에 워드마크 `yunho.dev`, 오른쪽에 알약 모양 내비게이션(About, Stack, Work, Lab, Contact 앵커. `md` 미만에서는 숨김), GitHub 링크, `ThemeToggle`을 둔다. 알약은 `bg-surface/70 backdrop-blur border border-line`이다.
- [ ] **Step 6:** `CustomCursor.tsx`는 `(pointer: fine)`이고 reduced motion이 아닐 때만 렌더한다. `requestAnimationFrame`에서 링의 위치를 포인터 쪽으로 보간해 `transform`에 쓰고, `a, button` 위에서는 크기를 키운다. `mix-blend-mode: difference`와 흰색 테두리로 두 테마 모두에서 보이게 한다. 네이티브 커서는 숨기지 않는다.
- [ ] **Step 7:** `pnpm lint`

---

### Task 4: DOM 섹션과 페이지 조립

**Files:**

- Create: `src/hooks/useRevealOnScroll.ts`, `src/components/sections/SectionHeading.tsx`, `src/components/sections/HeroSection.tsx`, `AboutSection.tsx`, `StackSection.tsx`, `WorkSection.tsx`, `ProjectCard.tsx`, `LabSection.tsx`, `ContactSection.tsx`
- Modify: `src/app/page.tsx`

**Interfaces:**

- Consumes: Task 2의 콘텐츠, `sceneState.accentOverride`, `gsap`, `ScrollTrigger`, `useReducedMotion`
- Produces: `useRevealOnScroll(containerRef: RefObject<HTMLElement | null>): void`. 컨테이너 안의 `[data-reveal]` 요소마다 `gsap.from({ y: 48, autoAlpha: 0, duration: 1, ease: "power3.out", scrollTrigger: { trigger: element, start: "top 88%" } })`를 걸고 `gsap.context`로 정리한다. reduced motion이면 아무것도 하지 않는다.

- [ ] **Step 1:** `useRevealOnScroll`과 `SectionHeading`(작은 mono 번호 라벨과 큰 영어 제목)을 쓴다.
- [ ] **Step 2:** `HeroSection`은 `min-h-screen`이고 내용은 아래쪽에 붙는다. 왼쪽에 `line-mask` 두 줄로 된 거대한 "Frontend / Engineer"(`clamp(3.5rem, 12vw, 11rem)`), 오른쪽에 이름, tagline, 스크롤 안내를 둔다. 마운트 후 GSAP로 `.line-mask > span`을 `y: 0`으로 stagger한다.
- [ ] **Step 3:** `AboutSection`은 데스크톱에서 왼쪽 절반만 쓴다(오른쪽은 3D 덩어리 자리). 큰 소개 문장, 지향점 두 개, 소속과 위치 정보 줄을 둔다.
- [ ] **Step 4:** `StackSection`은 분류마다 한 줄이다. 왼쪽에 mono 라벨, 오른쪽에 큰 글씨의 항목들을 두고 줄 사이를 `border-line`으로 나눈다.
- [ ] **Step 5:** `ProjectCard`는 `bg-surface/70 backdrop-blur`의 큰 카드다. `onPointerEnter`와 `onFocus`에서 `sceneState.accentOverride = project.accentColor`, `onPointerLeave`와 `onBlur`에서 `null`로 돌린다. 번호, 제목, summary, `highlights`가 있으면 목록, 기술 칩, 링크를 보여준다. `WorkSection`은 `PROJECTS`를 순회한다.
- [ ] **Step 6:** `LabSection`은 `LAB_ITEMS`를 행 목록으로 보여준다. 각 행은 저장소로 가는 링크다.
- [ ] **Step 7:** `ContactSection`은 `min-h-screen`이다(`sectionProgress`가 마지막 값에 닿으려면 뷰포트보다 짧으면 안 된다). 거대한 "Let's talk", 이메일 `mailto:` 링크, GitHub 링크, 저작권 줄을 둔다.
- [ ] **Step 8:** `page.tsx`에서 `Header`, `SmoothScroll`, `SceneStateSync`, `CustomCursor`, `<main className="relative z-10">` 안의 섹션 6개를 조립한다.
- [ ] **Step 9:** `pnpm lint && pnpm build`

---

### Task 5: 3D 장면

> **구현 중 변경 (2026-09-17):** 브라우저 검증에서 두 가지를 고쳤다. 첫째, 타원 위의 "현재 방향" 지점을 목표로 삼는 공식은 About에서 오른쪽에 있던 덩어리가 전부 오른쪽 가장자리로만 퍼지는 문제가 있어서, `ClusterBodyDescriptor.home`(좌우 가장자리의 고정된 자리)을 목표로 삼는 방식으로 바꿨다. 둘째, 캡슐과 토러스의 자동 `hull` 충돌체가 초기화를 7초 이상 지연시켜서 `BodyCollider`의 기본 도형 충돌체로 바꿨다. 아래 Task 5의 Step 1, 3, 5에 적힌 타원 공식과 `hull` 설정은 이 변경 이전의 내용이다.

**Files:**

- Create: `src/components/scene/sectionChoreography.ts`, `themePalette.ts`, `clusterBodies.ts`, `useClusterMaterials.ts`, `PhysicsCluster.tsx`, `PointerCollider.tsx`, `SceneLighting.tsx`, `Scene.tsx`, `SceneLoader.tsx`
- Modify: `src/app/page.tsx` (`SceneLoader` 추가)

**Interfaces:**

- Consumes: `sceneState`, `SECTION_IDS`, `useMediaQuery`, `useReducedMotion`, `useTheme`
- Produces:

```ts
// sectionChoreography.ts
export interface SceneKeyframe {
  centerX: number; // 뷰포트 너비 대비 비율
  centerY: number; // 뷰포트 높이 대비 비율
  spreadX: number; // 뷰포트 반너비 대비 타원 반지름. 0이면 한 점으로 뭉친다
  spreadY: number;
  attractionStrength: number;
  cameraDistance: number;
}
export function sampleChoreography(
  sectionProgress: number,
  isMobile: boolean,
  output: SceneKeyframe,
): SceneKeyframe;

// themePalette.ts
export type ThemeName = "light" | "dark";
export interface ScenePalette {
  neutral: string;
  contrast: string;
  accent: string;
  environmentIntensity: number;
  keyLightIntensity: number;
  ambientIntensity: number;
}
export const SCENE_PALETTES: Record<ThemeName, ScenePalette>;

// clusterBodies.ts
export type BodyShape = "sphere" | "capsule" | "box" | "torus";
export type BodyRole = "neutral" | "contrast" | "accent";
export interface ClusterBodyDescriptor {
  key: string;
  shape: BodyShape;
  role: BodyRole;
  scale: number;
  position: [number, number, number];
  rotation: [number, number, number];
}
export function createClusterBodies(count: number): ClusterBodyDescriptor[]; // 시드 고정 난수
```

- [ ] **Step 1:** `sectionChoreography.ts`. 키프레임 표는 다음 값에서 시작하고 브라우저에서 조정한다.

| 섹션    | 데스크톱 (centerX, centerY, spreadX, spreadY, strength, camera) | 모바일                    |
| :------ | :-------------------------------------------------------------- | :------------------------ |
| hero    | 0, 0.1, 0, 0, 0.22, 18                                          | 0, 0.16, 0, 0, 0.22, 24   |
| about   | 0.26, 0, 0, 0, 0.22, 21                                         | 0, 0, 1.1, 1.05, 0.12, 24 |
| stack   | 0, 0, 1.05, 1.1, 0.12, 22                                       | 0, 0, 1.1, 1.05, 0.12, 24 |
| work    | 0, 0, 1.1, 1.15, 0.12, 22                                       | 0, 0, 1.15, 1.1, 0.12, 24 |
| lab     | 0, 0, 1.1, 1.15, 0.12, 22                                       | 0, 0, 1.15, 1.1, 0.12, 24 |
| contact | 0, -0.22, 0, 0, 0.24, 15                                        | 0, -0.2, 0, 0, 0.24, 22   |

`sampleChoreography`는 `index = floor(progress)`, `ratio = smoothstep(progress - index)`로 인접 키프레임의 각 필드를 선형 보간해 `output`에 쓴다(프레임마다 객체를 새로 만들지 않기 위해서다).

- [ ] **Step 2:** `themePalette.ts`

```ts
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
```

- [ ] **Step 3:** `clusterBodies.ts`는 mulberry32 시드 난수로 기술자를 만든다. 역할 비율은 neutral 60%, contrast 20%, accent 20%이고 초기 위치는 ±9 범위의 상자 안이다(로드 직후 안쪽으로 몰려드는 것이 인트로 연출이 된다).
- [ ] **Step 4:** `useClusterMaterials(themeName, instant)`는 역할별 `MeshPhysicalMaterial` 3개(`clearcoat: 1`, `clearcoatRoughness: 0.15`, `roughness: 0.35`, `metalness: 0.1`)를 `useMemo`로 만들고, `useFrame`에서 `color.lerp(target, 1 - Math.exp(-delta * 4))`로 팔레트를 따라간다. accent의 목표색은 `sceneState.accentOverride ?? palette.accent`다. `instant`가 참이면 보간 없이 바로 대입한다. 언마운트 때 dispose한다.
- [ ] **Step 5:** `PhysicsCluster.tsx`. 강체마다 `RigidBody`(`linearDamping={4}`, `angularDamping={1.2}`, `friction={0.1}`, colliders는 sphere `ball`, box `cuboid`, 나머지 `hull`)를 만들고 ref 배열에 모은다. `useFrame` 하나에서 전부 처리한다.

```ts
useFrame((state, delta) => {
  const frameScale = Math.min(delta, 0.1) * 60;
  sampleChoreography(sceneState.sectionProgress, isMobile, keyframe);

  const viewportSize = state.viewport.getCurrentViewport(state.camera, ORIGIN);
  const elapsedTime = state.clock.elapsedTime;
  const centerX =
    keyframe.centerX * viewportSize.width + Math.sin(elapsedTime * 0.6) * 0.35;
  const centerY =
    keyframe.centerY * viewportSize.height +
    Math.cos(elapsedTime * 0.45) * 0.25;
  const radiusX = keyframe.spreadX * viewportSize.width * 0.5;
  const radiusY = keyframe.spreadY * viewportSize.height * 0.5;

  for (const rigidBody of rigidBodies.current) {
    if (!rigidBody) continue;
    const position = rigidBody.translation();
    const normalizedX = (position.x - centerX) / Math.max(radiusX, EPSILON);
    const normalizedY = (position.y - centerY) / Math.max(radiusY, EPSILON);
    const normalizedLength = Math.hypot(normalizedX, normalizedY);
    // 타원 위에서 이 강체와 같은 방향에 있는 점이 목표다. 반지름이 0이면 중심 한 점이 된다
    const targetX =
      normalizedLength > EPSILON
        ? centerX + (normalizedX / normalizedLength) * radiusX
        : centerX;
    const targetY =
      normalizedLength > EPSILON
        ? centerY + (normalizedY / normalizedLength) * radiusY
        : centerY;
    const impulseScale =
      keyframe.attractionStrength * frameScale * rigidBody.mass();
    impulse.set(
      (targetX - position.x) * impulseScale,
      (targetY - position.y) * impulseScale,
      -position.z * impulseScale,
    );
    rigidBody.applyImpulse(impulse, true);
  }

  state.camera.position.z = THREE.MathUtils.damp(
    state.camera.position.z,
    keyframe.cameraDistance,
    3,
    delta,
  );
});
```

- [ ] **Step 6:** `PointerCollider.tsx`는 `kinematicPosition` 강체와 `BallCollider`(반지름 1.3)다. `pointerActive`일 때 `pointer`를 z=0 평면의 월드 좌표로 바꿔 `setNextKinematicTranslation`하고, 아니면 장면 밖(y=1000)에 세워둔다.
- [ ] **Step 7:** `SceneLighting.tsx`는 `ambientLight`, 그림자를 드리우는 `directionalLight`(데스크톱만 `castShadow`, 그림자 카메라 범위 ±16, mapSize 2048), drei `Environment resolution={256}` 안의 `Lightformer` 4개로 구성된다. `useFrame`에서 조명 강도와 `scene.environmentIntensity`를 팔레트 목표값으로 damp한다.
- [ ] **Step 8:** `Scene.tsx`는 `useTheme().resolvedTheme`, `useMediaQuery("(max-width: 768px)")`, `useReducedMotion()`을 Canvas 밖에서 읽어 props로 내려준다(Canvas 안은 별도 렌더러라서 context 전달에 기대지 않는다). `Canvas`는 `gl={{ alpha: true, antialias: true }}`, `camera={{ position: [0, 0, 18], fov: 35 }}`, `dpr`은 모바일 `[1, 1.5]`와 데스크톱 `[1, 2]`, `shadows`는 데스크톱만 켠다. 강체는 데스크톱 40개, 모바일 14개다. reduced motion이면 3초 뒤 `Physics paused`와 `frameloop="demand"`로 바꾸고, 테마가 바뀔 때 `invalidate()`한다.
- [ ] **Step 9:** `SceneLoader.tsx`는 `next/dynamic`의 `ssr: false`로 `Scene`을 불러온다. 컨테이너는 `pointer-events-none fixed inset-0 z-0`이고 `aria-hidden`이다. reduced motion이면 `absolute top-0 h-screen`으로 바꿔 히어로와 함께 스크롤되어 사라지게 한다. WebGL 컨텍스트를 만들 수 없으면 CSS radial-gradient 배경으로 대체한다.
- [ ] **Step 10:** `page.tsx`에 `SceneLoader`를 넣고 `pnpm lint && pnpm build`

---

### Task 6: 브라우저 검증과 조정

**Files:**

- Create: `.claude/launch.json` (`pnpm dev`, port 3000)
- Modify: 조정이 필요한 파일

- [ ] **Step 1:** 미리보기를 띄우고 콘솔 오류가 없는지 확인한다.
- [ ] **Step 2:** 데스크톱 라이트 모드에서 Hero부터 Contact까지 스크롤하며 각 섹션에서 텍스트가 3D 오브젝트에 가려지지 않는지 확인하고, 키프레임 값을 조정한다.
- [ ] **Step 3:** 테마를 토글해서 DOM과 3D가 함께 전환되는지, 다크 모드에서 오브젝트의 윤곽이 읽히는지 확인한다.
- [ ] **Step 4:** Work 카드에 hover해서 accent 색이 바뀌는지 확인한다.
- [ ] **Step 5:** 모바일 크기(375x812)에서 레이아웃과 가독성을 확인한다.
- [ ] **Step 6:** 최종 `pnpm lint && pnpm build`를 돌리고 스크린샷을 남긴다.
