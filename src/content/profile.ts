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
  // 경력을 시작한 해. About의 요약 줄에 쓴다
  careerSince: string;
  tagline: string;
  introduction: string;
  principles: Principle[];
  email: string;
  githubUrl: string;
  siteUrl: string;
}

export const PROFILE: Profile = {
  nameKorean: "탁윤호",
  nameEnglish: "Yunho Tak",
  role: "Frontend Engineer",
  company: "IDB",
  location: "Namyangju, Korea",
  careerSince: "2022",
  tagline: "산업 현장의 데이터를 읽기 쉬운 화면으로 만듭니다.",
  introduction:
    "AI 기반 산업 안전 모니터링 플랫폼의 프론트엔드를 첫 버전부터 만들어 온 5년차 개발자입니다.",
  principles: [
    {
      title: "제품의 기반을 만듭니다",
      description:
        "노드 기반 시나리오 에디터, 사내 디자인 시스템, 다국어 자동화처럼 여러 화면이 함께 쓰는 토대를 주로 맡았습니다.",
    },
    {
      title: "실시간 데이터를 읽히게 만듭니다",
      description:
        "센서와 영상에서 쏟아지는 값을 차트와 히트맵, 노드 그래프로 옮겨 현장이 상황을 빨리 알아볼 수 있게 합니다.",
    },
    {
      title: "반복을 줄이는 쪽을 좋아합니다",
      description:
        "번역 키를 자동으로 뽑는 스크립트, 공통 컴포넌트, 온보딩 문서처럼 팀이 같은 일을 다시 하지 않게 하는 일을 자주 합니다.",
    },
  ],
  email: "tyh1819@gmail.com",
  githubUrl: "https://github.com/Takyunho",
  // Vercel이 자동으로 만드는 -takyunhos-projects 주소는 로그인 보호에 걸려서 공개 주소로 쓸 수 없다
  siteUrl: "https://yunho-dev.vercel.app",
};
