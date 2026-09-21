export interface LabItem {
  name: string;
  description: string;
  language: string;
  year: string;
  url: string;
}

const GITHUB_BASE_URL = "https://github.com/Takyunho";

// 제품에 넣기 전에 따로 만들어 본 것들이다. 여기서 확인한 방식이 실제 업무로 이어진 경우도 있다
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
    description: "타입으로 도메인을 좁히는 방법을 정리한 저장소",
    language: "TypeScript",
    year: "2026",
    url: `${GITHUB_BASE_URL}/TypeScript-Study`,
  },
  {
    name: "i18n",
    description:
      "번역 키를 코드에서 자동으로 뽑아내는 실험. 이 방식을 다듬어 실제 제품의 다국어 작업에 적용했다",
    language: "JavaScript",
    year: "2025",
    url: `${GITHUB_BASE_URL}/i18n`,
  },
  {
    name: "onebite-books",
    description: "Next.js의 렌더링 방식을 예제로 익힌 학습 프로젝트",
    language: "TypeScript",
    year: "2025",
    url: `${GITHUB_BASE_URL}/onebite-books`,
  },
  {
    name: "React-Flow",
    description:
      "노드 기반 UI를 처음 만져 본 저장소. 이후 제품의 시나리오 에디터로 이어졌다",
    language: "JavaScript",
    year: "2023",
    url: `${GITHUB_BASE_URL}/React-Flow`,
  },
  {
    name: "vue3-webpack-template",
    description: "Vue 3와 webpack으로 직접 짠 기본 템플릿",
    language: "JavaScript",
    year: "2023",
    url: `${GITHUB_BASE_URL}/vue3-webpack-template`,
  },
  {
    name: "ARAndVR",
    description: "웹에서 AR과 VR을 어디까지 할 수 있는지 살펴본 예제 모음",
    language: "JavaScript",
    year: "2022",
    url: `${GITHUB_BASE_URL}/ARAndVR`,
  },
  {
    name: "Study",
    description:
      "JavaScript, React, Vue, Three.js, 번들러를 공부하며 기록한 저장소",
    language: "JavaScript",
    year: "2021",
    url: `${GITHUB_BASE_URL}/Study`,
  },
];
