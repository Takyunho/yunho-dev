export interface LabItem {
  name: string;
  description: string;
  language: string;
  year: string;
  url: string;
}

const GITHUB_BASE_URL = "https://github.com/Takyunho";

export const LAB_ITEMS: LabItem[] = [
  {
    name: "yunho-dev",
    description: "지금 보고 있는 3D 인터랙티브 포트폴리오",
    language: "TypeScript",
    year: "2026",
    url: `${GITHUB_BASE_URL}/yunho-dev`,
  },
  {
    name: "TypeScript-Study",
    description: "TypeScript 공부용 저장소",
    language: "TypeScript",
    year: "2026",
    url: `${GITHUB_BASE_URL}/TypeScript-Study`,
  },
  {
    name: "i18n",
    description:
      "react-i18next 다국어 환경과 번역 키 추출, t() 래핑 스크립트 실험",
    language: "JavaScript",
    year: "2025",
    url: `${GITHUB_BASE_URL}/i18n`,
  },
  {
    name: "onebite-books",
    description: "Next.js 학습 프로젝트",
    language: "TypeScript",
    year: "2025",
    url: `${GITHUB_BASE_URL}/onebite-books`,
  },
  {
    name: "React-Flow",
    description: "reactflow 라이브러리로 노드 기반 UI를 실험한 저장소",
    language: "JavaScript",
    year: "2023",
    url: `${GITHUB_BASE_URL}/React-Flow`,
  },
  {
    name: "vue3-webpack-template",
    description: "Vue 3와 webpack 기본 템플릿",
    language: "JavaScript",
    year: "2023",
    url: `${GITHUB_BASE_URL}/vue3-webpack-template`,
  },
  {
    name: "ARAndVR",
    description: "AR과 VR 예제, 테스트 파일 모음",
    language: "JavaScript",
    year: "2022",
    url: `${GITHUB_BASE_URL}/ARAndVR`,
  },
  {
    name: "Study",
    description:
      "JavaScript, React, Vue, Three.js, 번들러 등 공부한 것을 기록한 저장소",
    language: "JavaScript",
    year: "2021",
    url: `${GITHUB_BASE_URL}/Study`,
  },
];
