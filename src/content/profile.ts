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
  // "읽기 쉬운"은 한 덩어리라 줄바꿈하지 않는 공백으로 잇는다. 좁은 화면에서 두 줄로 나뉠 때 "읽기 / 쉬운"으로 끊기지 않는다
  tagline: "산업 현장의 데이터를 읽기\u00A0쉬운 화면으로 만듭니다.",
  introduction:
    "산업 안전 모니터링 플랫폼의 첫 버전부터 성장을 이끌어온 5년 차 프론트엔드 개발자입니다.",
  email: "tyh1819@gmail.com",
  githubUrl: "https://github.com/Takyunho",
  // Vercel이 자동으로 만드는 -takyunhos-projects 주소는 로그인 보호에 걸려서 공개 주소로 쓸 수 없다
  siteUrl: "https://yunho-dev.vercel.app",
};
