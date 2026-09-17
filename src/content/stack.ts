export interface StackCategory {
  label: string;
  labelKorean: string;
  items: string[];
}

export const STACK_CATEGORIES: StackCategory[] = [
  {
    label: "Languages",
    labelKorean: "언어",
    items: ["HTML5", "CSS3", "JavaScript", "TypeScript"],
  },
  {
    label: "Frameworks",
    labelKorean: "프레임워크",
    items: ["React", "Next.js", "Vue.js"],
  },
  {
    label: "Libraries",
    labelKorean: "라이브러리",
    items: [
      "TanStack Query",
      "Zustand",
      "Socket.IO",
      "i18next",
      "xy-flow",
      "Three.js",
    ],
  },
  {
    label: "Styling",
    labelKorean: "스타일링",
    items: ["CSS Modules", "Tailwind CSS"],
  },
  {
    label: "Tools",
    labelKorean: "도구",
    items: ["Node.js", "Git", "GitHub", "Figma", "Docker"],
  },
];
