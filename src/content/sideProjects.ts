export interface SideProject {
  name: string;
  description: string;
  language: string;
  year: string;
  url: string;
}

const GITHUB_BASE_URL = "https://github.com/Takyunho";

// 제품에 넣기 전에 따로 만들어 본 것들이다. 여기서 확인한 방식이 실제 업무로 이어진 경우도 있다.
// 강의를 따라가거나 공부한 것을 모아 둔 저장소는 두지 않는다. 직접 만들어 보고 알아낸 것만 남긴다.
// 저장소를 열어 본 사람이 여기 적힌 한 줄보다 더 알 수 있어야 링크를 걸 값어치가 있다
export const SIDE_PROJECTS: SideProject[] = [
  {
    name: "yunho-dev",
    description: "지금 보고 계신 3D 인터랙티브 포트폴리오입니다.",
    language: "TypeScript",
    year: "2026",
    url: `${GITHUB_BASE_URL}/yunho-dev`,
  },
  {
    name: "i18n",
    description:
      "코드에서 번역 키를 자동으로 뽑아내는 프로토타입입니다. 이 방식을 다듬어 실제 제품의 다국어 작업에 적용했습니다.",
    language: "JavaScript",
    year: "2025",
    url: `${GITHUB_BASE_URL}/i18n`,
  },
  {
    name: "React-Flow",
    description:
      "노드 기반 UI를 처음 다뤄 본 저장소입니다. 여기서 익힌 내용을 제품의 시나리오 에디터 개발에 활용했습니다.",
    language: "JavaScript",
    year: "2023",
    url: `${GITHUB_BASE_URL}/React-Flow`,
  },
  {
    name: "ARAndVR",
    description: "웹에서 AR과 VR을 어디까지 구현할 수 있는지 살펴본 예제 모음입니다.",
    language: "JavaScript",
    year: "2022",
    url: `${GITHUB_BASE_URL}/ARAndVR`,
  },
];
