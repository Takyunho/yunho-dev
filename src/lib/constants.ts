export interface Skill {
  name: string;
  category: "frontend" | "3d" | "tool" | "etc";
  level: number; // 1-5
  description: string;
  color: string;
}

export const SKILLS: Skill[] = [
  // 기본 언어
  {
    name: "HTML",
    category: "frontend",
    level: 4,
    description: "시맨틱 마크업, 접근성, SEO 최적화",
    color: "#e34f26",
  },
  {
    name: "CSS",
    category: "frontend",
    level: 4,
    description: "Flexbox, Grid, 반응형 디자인, 애니메이션",
    color: "#264de4",
  },
  {
    name: "JavaScript",
    category: "frontend",
    level: 4,
    description: "ES6+, 비동기 처리, DOM 조작, 함수형 프로그래밍",
    color: "#f7df1e",
  },
  {
    name: "TypeScript",
    category: "frontend",
    level: 3,
    description: "타입 시스템, 제네릭, 유틸리티 타입 활용",
    color: "#3178c6",
  },
  // 프레임워크 / 라이브러리
  {
    name: "React",
    category: "frontend",
    level: 4,
    description: "컴포넌트 설계, 상태 관리, 커스텀 훅, 성능 최적화",
    color: "#61dafb",
  },
  {
    name: "Next.js",
    category: "frontend",
    level: 2,
    description: "App Router, SSR/SSG, 미들웨어, API Routes",
    color: "#ffffff",
  },
  {
    name: "Tailwind CSS",
    category: "frontend",
    level: 3,
    description: "유틸리티 기반 스타일링, 디자인 시스템 구축",
    color: "#06b6d4",
  },
  {
    name: "Three.js",
    category: "3d",
    level: 2,
    description: "React Three Fiber, 셰이더, 3D 모델링 연동",
    color: "#ffffff",
  },
  {
    name: "GSAP",
    category: "frontend",
    level: 2,
    description: "ScrollTrigger, 타임라인 애니메이션, 인터랙션",
    color: "#88ce02",
  },
  {
    name: "Framer Motion",
    category: "frontend",
    level: 1,
    description: "레이아웃 애니메이션, 제스처, 전환 효과",
    color: "#e84ece",
  },
  // 도구
  {
    name: "Git / GitHub",
    category: "tool",
    level: 4,
    description: "브랜치 전략, 코드 리뷰, CI/CD 파이프라인",
    color: "#f05032",
  },
];

export const SKILL_CATEGORIES = {
  frontend: "프론트엔드",
  "3d": "3D / 그래픽",
  tool: "도구",
  etc: "기타",
} as const;

// ─── Projects ───────────────────────────────────────────

export interface Project {
  id: string;
  title: string;
  description: string;
  techStack: string[];
  thumbnailUrl: string;
  liveUrl: string;
  githubUrl: string;
  color: string;
}

export const PROJECTS: Project[] = [
  {
    id: "portfolio-3d",
    title: "3D Portfolio",
    description:
      "Three.js와 React Three Fiber로 구축한 인터랙티브 3D 포트폴리오. Blueprint 컨셉의 몰입형 웹 경험.",
    techStack: ["Next.js", "Three.js", "GSAP", "Tailwind CSS"],
    thumbnailUrl: "/images/projects/portfolio.png",
    liveUrl: "https://yunho.dev",
    githubUrl: "https://github.com/yunho/portfolio",
    color: "#3b82f6",
  },
  {
    id: "dashboard-analytics",
    title: "Analytics Dashboard",
    description:
      "실시간 데이터 시각화 대시보드. 차트, 필터링, 다크모드를 지원하는 관리자 패널.",
    techStack: ["React", "TypeScript", "Recharts", "Zustand"],
    thumbnailUrl: "/images/projects/dashboard.png",
    liveUrl: "https://dashboard.example.com",
    githubUrl: "https://github.com/yunho/dashboard",
    color: "#10b981",
  },
  {
    id: "ecommerce-store",
    title: "E-Commerce Store",
    description:
      "풀스택 이커머스 플랫폼. 장바구니, 결제, 주문 관리 등 핵심 커머스 기능 구현.",
    techStack: ["Next.js", "Prisma", "Stripe", "Tailwind CSS"],
    thumbnailUrl: "/images/projects/ecommerce.png",
    liveUrl: "https://store.example.com",
    githubUrl: "https://github.com/yunho/store",
    color: "#f59e0b",
  },
  {
    id: "chat-realtime",
    title: "Realtime Chat",
    description:
      "WebSocket 기반 실시간 채팅 애플리케이션. 1:1 채팅, 그룹 채팅, 읽음 확인 지원.",
    techStack: ["React", "Socket.io", "Node.js", "MongoDB"],
    thumbnailUrl: "/images/projects/chat.png",
    liveUrl: "https://chat.example.com",
    githubUrl: "https://github.com/yunho/chat",
    color: "#8b5cf6",
  },
];
