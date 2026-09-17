# 포트폴리오 전면 개편 설계 (lusion 스타일 3D 인터랙티브)

작성일: 2026-09-17

## 목표

`yunho-dev`를 전면 개편해서 세 가지를 만족시킨다.

- 라이트 모드와 다크 모드를 모두 지원하고, 3D 장면도 테마에 맞춰 함께 바뀐다.
- https://lusion.co 처럼 화면 전체가 하나의 3D 무대로 이어지고, 커서와 스크롤에 반응한다.
- 콘텐츠는 GitHub 프로필 README(https://github.com/Takyunho)를 정본으로 삼는다.

## 범위에서 제외하는 것

- Next.js 16 메이저 업그레이드는 하지 않는다. 15.5.x를 유지한다.
- 후처리(`@react-three/postprocessing`)는 넣지 않는다. `@react-three/fiber`를 9.7 이상으로 올려야 하고, 재질과 조명만으로 목표 품질을 낼 수 있기 때문이다.
- GitHub API 실시간 연동은 하지 않는다. Lab 목록은 정적 데이터로 둔다.
- 프로젝트 상세 페이지와 페이지 전환 애니메이션은 만들지 않는다. 단일 페이지다.
- 회사 제품의 내부 화면 캡처는 쓰지 않는다. 공개된 설명과 공식 링크만 쓴다.

## 기술 스택

기존 스택을 유지한다: Next.js 15 App Router, React 19, TypeScript, Tailwind CSS 4, `three`, `@react-three/fiber` 9, `@react-three/drei` 10, `gsap`, `lenis`.

추가하는 패키지는 세 개다.

- `@react-three/rapier` 2.2.x: 히어로 오브젝트의 물리 시뮬레이션에 쓴다. peer가 React 19, R3F 9라서 현재 스택과 맞는다.
- `next-themes` 0.4.x: 시스템 설정 추종, 깜빡임 없는 초기 테마 적용, 토글 상태 저장을 맡긴다.
- `pretendard`: 한글 글꼴이다. Geist는 라틴 글자만 있어서, 이것이 없으면 Windows에서 본문이 맑은 고딕으로 보인다.

제거하는 패키지는 `framer-motion`이다. DOM 애니메이션을 GSAP 하나로 통일해서 애니메이션 라이브러리 중복을 없앤다.

## 아키텍처

### 레이어 구조

화면은 두 레이어로 나뉜다.

- 뒤쪽 레이어에는 `position: fixed`인 전체 화면 `Canvas` 하나가 있다. WebGL 컨텍스트는 이것 하나뿐이다. `Canvas`는 투명하고 배경색은 `body`의 CSS가 담당하므로, 테마 전환 시 배경이 DOM과 어긋나지 않는다.
- 앞쪽 레이어에는 일반 DOM 섹션들이 있고 Lenis로 부드럽게 스크롤된다. 모든 텍스트 콘텐츠는 DOM에 있으므로 SEO와 접근성은 3D 유무와 무관하게 유지된다.

`Canvas`는 `aria-hidden`이고 자체 포인터 이벤트를 받지 않는다. 커서 좌표는 `window`의 `pointermove`에서 읽기 때문에 DOM의 링크와 버튼은 그대로 클릭된다.

### DOM과 3D 사이의 상태 전달

`src/components/scene/sceneState.ts`에 렌더링을 일으키지 않는 가변 객체 하나를 둔다.

```ts
export const sceneState = {
  sectionProgress: 0, // 0은 hero 중앙, 1은 about 중앙처럼 섹션 중앙을 정수로 하는 연속 값
  pointer: { x: 0, y: 0 }, // NDC 좌표 (-1~1)
  pointerActive: false,
  accentOverride: null, // 프로젝트 카드 hover 시 그 프로젝트의 색
};
```

DOM 쪽(Lenis 콜백, ScrollTrigger, 카드 hover 핸들러)이 값을 쓰고, 3D 쪽은 `useFrame` 안에서 읽는다. 매 프레임 바뀌는 값이라서 React state로 두면 불필요한 리렌더가 생기기 때문이다.

### 3D 장면

`PhysicsCluster`가 장면의 주인공이다.

- 강체(rigid body) 개수는 데스크톱 약 40개, 모바일 약 14개다. 형태는 구, 캡슐, 둥근 박스, 토러스를 섞는다.
- 매 프레임 각 강체에 끌개(attractor) 지점을 향하는 힘을 가해서 덩어리로 뭉치게 한다.
- 충돌체는 형태별 기본 도형(구, 캡슐, 직육면체, 원기둥)을 직접 지정한다. 메시에서 자동 생성하는 hull 충돌체는 초기화에 몇 초가 걸려서 쓰지 않는다.
- 커서 위치를 따라다니는 보이지 않는 kinematic 구체 충돌체가 오브젝트들을 밀어낸다. 이것이 "만지는 듯한" 인터랙션이다.
- 재질은 clearcoat가 있는 `MeshPhysicalMaterial`이고, drei `Environment`와 `Lightformer`로 만든 조명 환경을 쓴다. 외부 HDR 파일을 받지 않는다.
- 대부분은 중립색이고 일부만 accent 색이다.

스크롤에 따른 연출은 섹션별로 끌개의 중심, 퍼짐 정도, 힘, 카메라 거리를 정해두고 그 사이를 보간하는 방식이다. 오브젝트마다 화면 왼쪽이나 오른쪽 가장자리의 고정된 자리가 있고, 퍼짐 정도가 0이면 모두 중심 한 점으로 뭉치며 1에 가까우면 각자의 자리로 흩어져 본문 양옆을 채운다. 자리를 현재 위치가 아니라 오브젝트에 고정한 이유는, 덩어리가 한쪽에 있다가 퍼질 때 전부 같은 쪽으로 몰리는 것을 막기 위해서다.

| 섹션    | 끌개와 카메라                                            |
| :------ | :------------------------------------------------------- |
| Hero    | 화면 중앙에 단단히 뭉친다                                |
| About   | 오른쪽으로 이동하고 약간 작아진다                        |
| Stack   | 화면 좌우 가장자리로 퍼져서 본문 양옆을 채운다           |
| Work    | 가장자리에 머물고, hover한 프로젝트의 색으로 accent가 바뀐다 |
| Lab     | Work와 같고 accent만 기본으로 돌아온다                   |
| Contact | 화면 아래쪽에 크게 다시 뭉친다                           |

### 테마

- `next-themes`를 `attribute="data-theme"`, `defaultTheme="system"`으로 설정한다.
- `globals.css`에 라이트와 다크 두 벌의 CSS 변수 토큰을 정의하고 Tailwind 4의 `@theme inline`으로 연결한다.
- 3D 쪽은 `themePalette.ts`에 테마별 중립 재질색, 대비 재질색, accent색, 조명 강도를 정의한다. `useFrame`에서 현재 값에서 목표 값으로 보간하기 때문에 토글하면 장면이 부드럽게 넘어간다.

| 토큰         | 라이트    | 다크      |
| :----------- | :-------- | :-------- |
| 배경         | `#f0f1f5` | `#0a0b0f` |
| 본문 텍스트  | `#0d0e12` | `#eceef3` |
| 보조 텍스트  | `#5b6070` | `#8a90a2` |
| accent       | `#1a2ffb` | `#5b6cff` |
| 3D 중립 재질 | `#ffffff` | `#15171e` |

### 섹션 구성

언어는 본문 한국어, 큰 제목은 영어다.

1. Header: 로고, 앵커 내비게이션, 테마 토글, GitHub 링크
2. Hero: 큰 타이포 "Frontend Engineer", README의 문구 "사용자가 머무르고 싶은 화면을 만듭니다.", 스크롤 안내
3. About: README 자기소개와 두 가지 지향점, 소속(IDB)
4. Stack: README의 5개 분류(언어, 프레임워크, 라이브러리, 스타일링, 도구)를 타이포 중심으로 나열한다. 숙련도 막대는 두지 않는다
5. Work: ProtectGO AI Enterprise, IDB 홈페이지. 큰 카드와 공식 링크
6. Lab: 공개 저장소 목록 (ARAndVR, React-Flow, i18n, onebite-books, TypeScript-Study, vue3-webpack-template, basic-webpack-template)
7. Contact: 이메일, GitHub

데스크톱의 정밀 포인터 환경에서만 커서를 따라다니는 작은 커스텀 커서를 둔다.

### 콘텐츠 데이터

콘텐츠는 `src/content/`에 타입과 함께 모은다. 나중에 프로젝트를 추가할 때는 배열에 항목 하나를 더하면 화면에 반영된다.

```ts
// src/content/projects.ts
export interface Project {
  id: string;
  title: string;
  period?: string;
  summary: string;
  highlights?: string[];
  techStack: string[];
  links: { label: string; url: string }[];
  accentColor: string; // hover 시 3D accent로 쓰인다
}
```

`profile.ts`, `stack.ts`, `projects.ts`, `lab.ts` 네 파일로 나눈다.

## 파일 구조

```
src/app/            layout.tsx, page.tsx, globals.css
src/content/        profile.ts, stack.ts, projects.ts, lab.ts
src/components/
  layout/           Header, ThemeToggle, ThemeProvider, SmoothScroll, CustomCursor
  sections/         HeroSection, AboutSection, StackSection, WorkSection, LabSection, ContactSection
  scene/            SceneLoader, Scene, PhysicsCluster, PointerCollider, SceneLighting,
                    sceneState.ts, sectionChoreography.ts, themePalette.ts,
                    clusterBodies.ts, useClusterMaterials.ts
src/hooks/          useMediaQuery.ts, useReducedMotion.ts
```

### 삭제하는 기존 파일

전면 개편이라서 아래 파일들은 새 구조로 대체되며 삭제한다.

- `src/components/three/` 전체 (FloatingShapes, HeroModel, ParticleField, ProjectGallery3D)
- `src/components/sections/`의 기존 5개 파일 (같은 이름은 새로 작성)
- `src/components/ui/ProjectModal.tsx`
- `src/styles/` 전체 (hero, projects, sections CSS Module)
- `src/lib/constants.ts` (가짜 예시 데이터. `src/content/`로 대체)
- `src/hooks/useMousePosition.ts` (`sceneState.pointer`로 대체)
- `public/`의 Next.js 기본 SVG 5개

## 성능과 대체 처리

- `Scene`은 `next/dynamic`의 `ssr: false`로 불러와서 첫 HTML과 텍스트가 3D 번들을 기다리지 않게 한다.
- 모바일에서는 강체 수를 줄이고 `dpr`을 1.5로 제한한다.
- `prefers-reduced-motion`이면 Lenis를 끄고, 물리는 초기 정착 후 멈추며, 스크롤 연출 없이 정적인 장면만 보여준다.
- WebGL을 쓸 수 없으면 `Canvas` 대신 CSS 그라데이션 배경을 보여준다. 콘텐츠는 DOM이라서 그대로 읽힌다.

## 검증

저장소에 테스트 러너가 없으므로 `pnpm lint`와 `pnpm build`(타입 검사 포함)로 검증한다. 화면 동작 확인 방식은 승인 시 정한다.

## 후속 항목 (이번에 하지 않음)

- Next.js 16 업그레이드
- 프로젝트 카드 커버를 같은 Canvas 안의 셰이더 평면(drei `View`)으로 렌더링
- 후처리(AO, bloom) 추가
- 사용자가 제공할 추가 프로젝트 내용 반영
