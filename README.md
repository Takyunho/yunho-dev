# yunho.dev

프론트엔드 개발자 탁윤호의 포트폴리오 사이트입니다. 커서와 스크롤에 반응하는 3D 장면 위에 소개, 기술 스택, 프로젝트, 연락처를 담았습니다.

- 배포 주소: https://yunho-dev.vercel.app
- GitHub 프로필: https://github.com/Takyunho

## 주요 특징

- **라이트와 다크 모드**를 지원합니다. 처음에는 시스템 설정을 따르고, 토글하면 화면 색과 3D 오브젝트의 재질, 조명이 함께 부드럽게 바뀝니다.
- **물리 기반 3D 인터랙션**이 있습니다. 광택이 있는 오브젝트들이 한 덩어리로 뭉쳐 있다가 커서에 밀려나고, 스크롤에 따라 섹션마다 다른 위치로 모이거나 화면 양옆으로 흩어집니다.
- **텍스트는 모두 서버 렌더링되는 DOM**에 있습니다. 3D 장면만 클라이언트에서 따로 불러오기 때문에, 3D가 꺼져 있어도 내용을 읽을 수 있고 검색 엔진에도 그대로 노출됩니다.
- **환경에 맞춰 연출을 줄입니다.** 모바일에서는 오브젝트 수와 해상도를 낮추고, 동작 줄이기(`prefers-reduced-motion`) 설정에서는 스크롤 연출과 물리 움직임을 멈추며, WebGL을 쓸 수 없으면 CSS 그라데이션 배경으로 대체합니다.

## 기술 스택

| 분류                | 사용 기술                                                         |
| :------------------ | :---------------------------------------------------------------- |
| 프레임워크          | Next.js (App Router), React, TypeScript                           |
| 3D                  | three.js, React Three Fiber, drei, Rapier (`@react-three/rapier`) |
| 애니메이션과 스크롤 | GSAP (ScrollTrigger), Lenis                                       |
| 스타일과 테마       | Tailwind CSS 4, next-themes, Pretendard와 Geist 글꼴              |
| 배포                | Vercel                                                            |

정확한 버전은 `package.json`을 기준으로 합니다.

## 시작하기

Node.js 18.18 이상과 pnpm이 필요합니다.

```bash
pnpm install
```

```bash
pnpm dev
```

브라우저에서 http://localhost:3000 을 엽니다. 커밋 전에는 아래 두 명령이 통과하는지 확인합니다. 테스트 러너는 따로 없습니다.

```bash
pnpm lint
```

```bash
pnpm build
```

## 폴더 구조

| 경로                       | 역할                                                            |
| :------------------------- | :-------------------------------------------------------------- |
| `src/app/`                 | 레이아웃, 페이지 조립, 테마 토큰이 있는 `globals.css`           |
| `src/content/`             | 화면에 표시되는 모든 콘텐츠 데이터                              |
| `src/components/sections/` | Hero, About, Stack, Work, Lab, Contact 섹션                     |
| `src/components/layout/`   | 헤더, 테마 토글, 부드러운 스크롤, 커스텀 커서, 장면 상태 동기화 |
| `src/components/scene/`    | 3D 장면 (물리 오브젝트, 포인터 충돌체, 조명, 섹션별 연출)       |
| `src/hooks/`               | 미디어 쿼리, 동작 줄이기 감지, 스크롤 진입 애니메이션           |
| `docs/superpowers/`        | 개편 설계 문서와 구현 계획                                      |

## 콘텐츠 수정하기

문구와 목록은 컴포넌트가 아니라 `src/content/`의 배열에 모여 있습니다. 항목을 추가하면 화면에 바로 반영됩니다.

| 파일          | 내용                                         |
| :------------ | :------------------------------------------- |
| `profile.ts`  | 이름, 소개 문구, 지향점, 이메일, GitHub 주소 |
| `stack.ts`    | 분류별 기술 스택                             |
| `projects.ts` | Work 섹션의 프로젝트 카드                    |
| `lab.ts`      | Lab 섹션의 저장소 목록                       |

프로젝트를 추가할 때는 `PROJECTS` 배열에 항목을 하나 더합니다. `period`와 `highlights`는 선택 항목이고, `accentColor`는 카드에 마우스를 올렸을 때 3D 오브젝트의 강조색으로도 쓰입니다.

```ts
{
  id: "my-project",
  title: "프로젝트 이름",
  period: "2026.01 ~ 2026.06",
  summary: "한두 문장으로 된 프로젝트 설명입니다.",
  highlights: ["맡은 역할이나 성과를 한 줄씩 적습니다."],
  techStack: ["React", "TypeScript"],
  links: [{ label: "사이트 방문", url: "https://example.com" }],
  accentColor: "#ff5a1f",
}
```

## 3D 장면이 동작하는 방식

화면 뒤에 고정된 투명 `Canvas` 하나가 있고, 그 위에서 DOM 섹션이 스크롤됩니다. 두 영역은 `src/components/scene/sceneState.ts`의 가변 객체 하나로 이어져 있습니다. 스크롤 진행도와 포인터 좌표처럼 매 프레임 바뀌는 값을 React state로 두면 불필요한 리렌더가 생기기 때문에, DOM 쪽이 이 객체에 값을 쓰고 3D 쪽이 매 프레임 읽는 방식을 택했습니다.

연출을 조정할 때 보는 파일은 다음과 같습니다.

- `sectionChoreography.ts`에는 섹션마다 오브젝트가 모이는 중심, 흩어지는 정도, 끌어당기는 힘, 카메라 거리가 데스크톱과 모바일 표로 나뉘어 있습니다.
- `themePalette.ts`에는 테마별 3D 재질색과 조명 강도가 있습니다. 여기의 `accent` 값은 `globals.css`의 `--accent`와 같은 색으로 맞춰야 합니다.
- `clusterBodies.ts`에는 오브젝트의 형태, 색 역할의 비율, 흩어질 때 향하는 자리가 있습니다.

섹션을 추가하거나 순서를 바꿀 때는 `sceneState.ts`의 `SECTION_IDS`와 섹션 요소의 `id`를 함께 맞춰야 합니다. 키프레임 표가 `SectionId`를 키로 하는 타입이라서, 새 섹션의 키프레임을 빠뜨리면 타입 오류로 알려줍니다.

## 배포

저장소가 Vercel에 연결되어 있어서 PR을 열면 미리보기 배포가 만들어집니다. 기본 브랜치는 `develop`이고 PR도 `develop`을 대상으로 엽니다.
