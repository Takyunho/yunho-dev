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
  // 카드에 hover하면 3D 오브젝트의 accent 색이 이 색으로 바뀐다
  accentColor: string;
}

// 항목을 추가하면 Work 섹션에 카드가 하나 더 생긴다
export const PROJECTS: Project[] = [
  {
    id: "protectgo-ai-enterprise",
    title: "ProtectGO AI Enterprise",
    summary:
      "현장의 CCTV, 센서, IoT 장비를 연결해 AI로 위험 상황을 실시간 탐지하고 관제하며, 안전 점검과 통계까지 관리하는 산업 안전 관제 플랫폼입니다. 실시간 관제에 특화된 경량 버전 Mini도 함께 개발했습니다.",
    techStack: ["React", "JavaScript"],
    links: [
      { label: "제품 소개", url: "https://idb.ai/products/protect-go-ai" },
    ],
    accentColor: "#ff5a1f",
  },
  {
    id: "idb-homepage",
    title: "IDB 홈페이지",
    summary: "IDB 공식 홈페이지 웹사이트를 구현했습니다.",
    techStack: ["Next.js", "TypeScript", "Tailwind CSS"],
    links: [{ label: "사이트 방문", url: "https://idb.ai/" }],
    accentColor: "#00b89c",
  },
];
