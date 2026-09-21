export interface StackCategory {
  label: string;
  labelKorean: string;
  items: string[];
}

// 실제 제품에 써 본 것만 적는다. 학습만 한 것은 Lab 섹션에 둔다
export const STACK_CATEGORIES: StackCategory[] = [
  {
    label: "Core",
    labelKorean: "주력",
    items: ["React", "JavaScript", "TypeScript", "Next.js"],
  },
  {
    label: "State & Data",
    labelKorean: "상태와 데이터",
    items: [
      "TanStack Query",
      "TanStack Table",
      "Zustand",
      "Axios",
      "Socket.IO",
      "WebSocket",
    ],
  },
  {
    label: "Visualization",
    labelKorean: "시각화",
    items: [
      "React Flow",
      "ApexCharts",
      "Konva",
      "Three.js",
      "hls.js",
      "wavesurfer.js",
    ],
  },
  {
    label: "UI & Styling",
    labelKorean: "UI와 스타일",
    items: ["Design Tokens", "Tailwind CSS", "CSS Modules", "GSAP"],
  },
  {
    label: "i18n",
    labelKorean: "국제화",
    items: [
      "i18next",
      "react-i18next",
      "next-i18n-router",
      "번역 키 자동 추출",
    ],
  },
  {
    label: "Build & Workflow",
    labelKorean: "빌드와 협업",
    items: [
      "Vite",
      "ESLint",
      "Prettier",
      "GitHub Actions",
      "npm 패키지 배포",
      "MSW",
    ],
  },
  {
    label: "Also used",
    labelKorean: "그 외 경험",
    items: ["Vue 2", "Plotly.js", "Chart.js", "Fabric.js"],
  },
];
