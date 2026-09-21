export interface ProjectLink {
  label: string;
  url: string;
}

export type ProjectCategoryId =
  "product" | "platform" | "rnd" | "client" | "demo";

export interface ProjectCategory {
  id: ProjectCategoryId;
  label: string;
}

export const PROJECT_CATEGORIES: ProjectCategory[] = [
  { id: "product", label: "자사 제품" },
  { id: "platform", label: "사내 플랫폼" },
  { id: "rnd", label: "국가 R&D" },
  { id: "client", label: "고객사" },
  { id: "demo", label: "전시와 데모" },
];

// 색상환을 고르게 돌며 고른 색이다. 밝기와 선명도를 비슷하게 맞춰 두 테마에서 모두 읽힌다
const ACCENT_PALETTE = [
  "#ff7a1a", // 주황
  "#4f7cff", // 파랑
  "#3fbf6f", // 초록
  "#e05fc0", // 자주
  "#f0b429", // 노랑
  "#28b4d8", // 하늘
  "#a855f7", // 보라
  "#b4d334", // 연두
  "#f2557a", // 분홍
  "#1fbfa8", // 청록
  "#7c6bf0", // 남보라
  "#ef5b4c", // 주홍
  "#5bb890", // 풀색
  "#c98b3a", // 황토
  "#39c0ff", // 하늘빛
  "#d46ef0", // 연보라
];

export interface Project {
  id: string;
  title: string;
  period: string;
  categoryId: ProjectCategoryId;
  // 어떤 자리에서 맡았는지. 목록에서 제목 옆에 붙는다
  role: string;
  summary: string;
  techStack: string[];
  links: ProjectLink[];
  // 카드에 마우스를 올리면 3D 오브젝트와 카드의 강조색이 이 색이 된다
  accentColor: string;
}

type ProjectSeed = Omit<Project, "accentColor">;

// 최근 시작한 순서다. 고객사와 기관의 실명은 업종으로 바꿔 적는다
const PROJECT_SEEDS: ProjectSeed[] = [
  {
    id: "power-equipment-ai",
    title: "전력설비 AI 안전진단과 통합관제",
    period: "2026.07 ~ 현재",
    categoryId: "client",
    role: "프론트엔드 개발",
    summary:
      "전력설비 기업의 수배전반 구간에서 부분방전과 온도, 전류 데이터를 함께 읽어 이상 징후와 원인을 분석하는 정부 지원 과제입니다. 설비 그룹 분석 화면과 부분방전 위상 패턴 히트맵을 맡았습니다.",
    techStack: ["React", "React Flow", "ApexCharts", "Three.js"],
    links: [],
  },
  {
    id: "design-system-guide",
    title: "디자인 시스템 가이드 페이지",
    period: "2026.07 ~ 2026.08",
    categoryId: "platform",
    role: "단독 개발",
    summary:
      "디자인 시스템의 실제 컴포넌트를 문서 안에서 바로 눌러 볼 수 있는 공식 문서 사이트입니다. 색과 타이포, 간격 토큰과 아이콘 갤러리를 함께 담았습니다.",
    techStack: ["Next.js", "Nextra", "TypeScript"],
    links: [],
  },
  {
    id: "design-system",
    title: "사내 디자인 시스템",
    period: "2026.03 ~ 현재",
    categoryId: "platform",
    role: "컴포넌트 개발과 문서화",
    summary:
      "여러 제품이 함께 쓰는 React 컴포넌트 라이브러리입니다. Select와 Dropdown, Modal 같은 피드백 계열을 주로 맡았고 접근성과 문서를 함께 손봤습니다.",
    techStack: ["React", "TypeScript", "Vite", "디자인 토큰 CSS"],
    links: [],
  },
  {
    id: "protectgo-admin-auth",
    title: "ProtectGO Admin과 Auth",
    period: "2026.01 ~ 현재",
    categoryId: "product",
    role: "공동 개발",
    summary:
      "프로젝트와 엣지 디바이스, 센서를 관리하는 관리자 앱과 인증 및 프로젝트 진입을 맡는 앱입니다. 관리 화면을 디자인 시스템 컴포넌트로 옮기는 일을 했습니다.",
    techStack: ["React", "TypeScript", "TanStack Query", "TanStack Table"],
    links: [],
  },
  {
    id: "gs-certification",
    title: "소프트웨어 품질인증 1등급 대응",
    period: "2025.11 ~ 2025.12",
    categoryId: "product",
    role: "프론트엔드 결함 대응",
    summary:
      "공인 시험기관의 소프트웨어 품질인증에서 1등급을 받기 위한 대응입니다. 시험 범위에 맞춘 전용 환경을 꾸리고 결함보고서의 프론트엔드 항목을 고쳤습니다.",
    techStack: ["React"],
    links: [],
  },
  {
    id: "kwater-dashboard",
    title: "공공기관 대시보드와 챗봇",
    period: "2025.08",
    categoryId: "client",
    role: "단기 지원",
    summary:
      "위젯을 얹어 쓰는 대시보드와 데이터를 물어보는 챗봇입니다. 챗봇 세션과 웹소켓 통신을 붙이고 응답으로 받은 차트를 대시보드에 올리는 흐름을 만들었습니다.",
    techStack: ["React", "ApexCharts", "WebSocket"],
    links: [],
  },
  {
    id: "company-homepage",
    title: "회사 공식 홈페이지 리뉴얼",
    period: "2025.02 ~ 2025.09",
    categoryId: "platform",
    role: "2인 공동 개발",
    summary:
      "한국어와 영어, 일본어를 지원하는 회사 홈페이지입니다. 문의 페이지와 연혁, 미디어 영역을 맡고 반응형과 검색 노출을 함께 다뤘습니다.",
    techStack: ["Next.js", "TypeScript", "Tailwind CSS", "GSAP"],
    links: [{ label: "사이트 방문", url: "https://idb.ai/" }],
  },
  {
    id: "protectgo-mini",
    title: "ProtectGO Mini",
    period: "2025.01 ~ 2025.05",
    categoryId: "product",
    role: "초기 핵심 개발",
    summary:
      "영상 기반 탐지 설정과 알림 제어에 집중한 경량 제품입니다. 영역을 직접 그려 탐지 범위를 잡는 단계형 설정 모달과 알림 설정을 만들었습니다.",
    techStack: ["React", "Konva", "hls.js", "Socket.IO"],
    links: [],
  },
  {
    id: "amos",
    title: "AMOS 에너지 자산관리 AIoT 엣지",
    period: "2024.11 ~ 현재",
    categoryId: "rnd",
    role: "프론트엔드 개발",
    summary:
      "한국과 영국이 함께 하는 국제공동 연구개발 과제입니다. 모델 버전 이력과 엣지 디바이스 배포 관리, 이상 상황 모니터링 화면을 맡았습니다.",
    techStack: ["React", "TanStack Query", "ApexCharts", "Socket.IO"],
    links: [],
  },
  {
    id: "cape",
    title: "CAPE 제조현장 재난안전 엣지",
    period: "2024.08 ~ 현재",
    categoryId: "rnd",
    role: "사용자 시스템 개발",
    summary:
      "생성형 AI를 쓰는 제조현장 재난안전 시스템을 목표로 한 유레카 국제공동 과제입니다. 영상과 열화상, 환경, 가스 센서를 한 화면에서 다루는 사용자 시스템을 만들었습니다.",
    techStack: ["React", "React Flow", "wavesurfer.js", "hls.js"],
    links: [],
  },
  {
    id: "protectgo-ent",
    title: "ProtectGO ENT",
    period: "2024.08 ~ 현재",
    categoryId: "product",
    role: "프론트엔드 핵심 기여자",
    summary:
      "센서와 영상을 실시간으로 지켜보다가 AI 모델이 이상 징후를 잡아내는 산업 안전 플랫폼입니다. 프로젝트 초기 세팅부터 참여해 노드 기반 시나리오 에디터와 다국어 자동화를 주도했습니다.",
    techStack: ["React", "React Flow", "TanStack Query", "Konva", "i18next"],
    links: [
      { label: "제품 소개", url: "https://idb.ai/products/protect-go-ai" },
    ],
  },
  {
    id: "exhibition-protectgo",
    title: "전시용 ProtectGO",
    period: "2024.07 ~ 2024.09",
    categoryId: "demo",
    role: "주 개발",
    summary:
      "전시와 시연 환경에 맞춘 데모 버전입니다. 화재 수신기 노드를 새로 만들고 내부망에서 바로 띄울 수 있는 실행 환경을 꾸렸습니다.",
    techStack: ["React", "Vite"],
    links: [],
  },
  {
    id: "manufacturing-bigdata",
    title: "디지털제조 빅데이터 플랫폼",
    period: "2024.06 ~ 2024.09",
    categoryId: "client",
    role: "프론트엔드 주 개발",
    summary:
      "부품 연구기관의 포털로, 기업 회원이 빅데이터 서비스를 신청하고 관리자가 승인과 이용 현황을 관리합니다. 인증 흐름과 역할별 라우팅, 신청 관리 화면을 맡았습니다.",
    techStack: ["React", "TanStack Query", "ApexCharts", "MSW"],
    links: [],
  },
  {
    id: "protectgo-v1",
    title: "ProtectGO 첫 버전",
    period: "2024.01 ~ 2024.08",
    categoryId: "product",
    role: "프론트엔드 단독 개발",
    summary:
      "영상 등록부터 실시간 탐지와 이력 조회, 모델 재학습까지 담은 제품의 첫 버전입니다. 인증과 컨텍스트, 역할별 메뉴 같은 앱의 기반 구조를 설계했습니다.",
    techStack: ["React", "React Router", "React Flow", "Konva", "hls.js"],
    links: [],
  },
  {
    id: "aci-solution",
    title: "AI CCTV 통합 솔루션",
    period: "2023.05 ~ 2024.01",
    categoryId: "product",
    role: "웹 프론트엔드 주 개발",
    summary:
      "카메라 등록부터 알고리즘 적용, 라벨링, 모델 재학습까지 웹 하나에서 처리하는 영상 AI 솔루션입니다. 탐지 영역을 그리는 캔버스와 재학습 단계 화면을 만들었습니다.",
    techStack: ["Vue 2", "Vuex", "Fabric.js", "Plotly.js"],
    links: [],
  },
  {
    id: "smart-factory-3d",
    title: "스마트팩토리 3D 전시 콘텐츠",
    period: "2023.03 ~ 2023.04",
    categoryId: "demo",
    role: "단독 개발",
    summary:
      "전시 부스에서 시연한 웹 3D 콘텐츠입니다. 3D 모델과 환경맵을 올리고 로봇 팔 제어, 설비 정보 안내창 같은 인터랙션을 붙였습니다.",
    techStack: ["Three.js", "cannon-es", "GLTF"],
    links: [],
  },
  {
    id: "auto-parts-ai",
    title: "제조 공정 AI 분석 시스템",
    period: "2022.08 ~ 2023.08",
    categoryId: "client",
    role: "프론트엔드 주 개발",
    summary:
      "자동차 부품 제조사의 공정 데이터를 단계별로 시각화하고 AI 분석 결과를 보여 주는 시스템입니다. 설비 모니터링과 분석 화면, 자동 학습 화면을 2년에 걸쳐 만들었습니다.",
    techStack: ["JavaScript", "Plotly.js", "jqGrid"],
    links: [],
  },
  {
    id: "monitoring-screens",
    title: "고객사 설비 모니터링 화면",
    period: "2022.03 ~ 2022.12",
    categoryId: "client",
    role: "프론트엔드 개발",
    summary:
      "디지털트윈 시각화 솔루션에 얹히는 화면들입니다. 제조와 화학, 공공 분야 여러 고객사의 게이지와 차트, 알람 이력, 예지보전 화면을 만들었습니다.",
    techStack: ["JavaScript", "Plotly.js", "Chart.js"],
    links: [],
  },
  {
    id: "poc-modules",
    title: "기술 검증과 공통 코드 모듈",
    period: "2022 ~ 2025",
    categoryId: "platform",
    role: "단독 진행",
    summary:
      "제품에 넣기 전에 따로 확인한 것들입니다. 번역 키 자동 추출은 이후 제품의 다국어 작업으로 이어졌고, 모달과 탭 같은 공통 모듈은 여러 화면에서 다시 썼습니다.",
    techStack: ["React", "Three.js", "Mapbox"],
    links: [],
  },
];

// 분류별로 묶으면 다섯 가지 색만 돌아간다. 목록 순서대로 색을 돌려 옆자리끼리 같은 색이 나오지 않게 한다.
// 난수를 쓰면 서버와 화면이 다른 색을 그려 hydration이 어긋난다
export const PROJECTS: Project[] = PROJECT_SEEDS.map((seed, seedIndex) => ({
  ...seed,
  accentColor: ACCENT_PALETTE[seedIndex % ACCENT_PALETTE.length],
}));
