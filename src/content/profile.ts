export interface Principle {
  title: string;
  description: string;
}

export interface Profile {
  nameKorean: string;
  nameEnglish: string;
  role: string;
  company: string;
  location: string;
  tagline: string;
  introduction: string;
  principles: Principle[];
  email: string;
  githubUrl: string;
}

export const PROFILE: Profile = {
  nameKorean: "탁윤호",
  nameEnglish: "Yunho Tak",
  role: "Frontend Engineer",
  company: "IDB",
  location: "Namyangju, Korea",
  tagline: "사용자가 머무르고 싶은 화면을 만듭니다.",
  introduction: "사용자 경험을 중요하게 생각하는 프론트엔드 개발자입니다.",
  principles: [
    {
      title: "확장 가능한 구조",
      description:
        "언제나 확장 가능한 구조를 고민하고, 더 나은 설계를 위해 노력합니다.",
    },
    {
      title: "인터랙티브한 UI",
      description:
        "실시간으로 반응하는 인터랙티브한 UI를 만드는 것을 좋아합니다.",
    },
  ],
  email: "tyh1819@gmail.com",
  githubUrl: "https://github.com/Takyunho",
};
