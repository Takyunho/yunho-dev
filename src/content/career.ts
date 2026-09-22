export interface CareerPointGroup {
  // "국제화 (i18n)"처럼 아래 항목들을 묶는 이름. 없으면 항목만 바로 나온다
  label?: string;
  items: string[];
}

export interface CareerPhase {
  period: string;
  title: string;
  groups: CareerPointGroup[];
}

export interface CareerRecord {
  company: string;
  // 무엇을 만드는 회사인지 한 줄. 회사 이름만으로는 무슨 일을 하는 곳인지 알 수 없다
  companyDescription: string;
  role: string;
  period: string;
  phases: CareerPhase[];
}

// 회사는 하나지만 맡은 일은 달라져 왔다. 프로젝트 목록(Work)으로는 그 순서가 보이지 않아 여기에 따로 적는다.
// 재직 중이라 개월 수는 적지 않는다. 적어 두면 매달 틀린 값이 된다
export const CAREER: CareerRecord = {
  company: "아이디비 (IDB)",
  companyDescription:
    "센서와 영상 데이터를 AI로 분석하여 현장의 위험을 실시간으로 감지하고 알리는 플랫폼을 개발합니다.",
  role: "프론트엔드 개발",
  period: "2022.03 ~ 현재",
  phases: [
    {
      period: "2024.08 ~ 현재",
      title: "공통 아키텍처 및 시스템 기반 구축",
      groups: [
        {
          label: "주요 개발",
          items: [
            "산업 안전 플랫폼 ProtectGO ENT의 프론트엔드를 초기부터 전담하였으며, 노드 기반 시나리오 에디터를 개발했습니다.",
            "팀 내 불필요한 중복 작업을 줄이고 개발 생산성을 높이기 위해 공통 개발 환경과 모듈을 지속적으로 개선하고 있습니다.",
          ],
        },
        {
          label: "국제화 (i18n)",
          items: [
            "한글 문자열을 번역 함수로 감싸는 스크립트를 작성하고, 번역 스프레드시트와 코드를 자동 연동하여 현재 3개 국어를 지원합니다.",
          ],
        },
        {
          label: "디자인 시스템",
          items: [
            "피드백 계열 컴포넌트 개발을 담당하였으며, NPM 패키지 배포 및 문서화 사이트를 관리하고 있습니다.",
          ],
        },
      ],
    },
    {
      period: "2023.05 ~ 2024.07",
      title: "자사 제품의 첫 버전 구축 및 제품 고도화",
      groups: [
        {
          items: [
            "AI CCTV 통합 솔루션 및 산업 안전 플랫폼의 V1(첫 버전)을 구축했습니다.",
            "단순 수주/구현 중심의 작업 방식에서 벗어나, 자사 핵심 제품을 주도적으로 지속 고도화하고 확장하는 전환점을 만들었습니다.",
          ],
        },
      ],
    },
    {
      period: "2022.03 ~ 2023.04",
      title: "현장 화면 구축 및 기술 검증",
      groups: [
        {
          items: [
            "제조 및 에너지 산업 현장의 설비 모니터링 화면을 다수 개발했습니다.",
            "대규모 실시간 센서 데이터를 차트 및 테이블 형태로 효과적으로 시각화하고 처리하는 노하우를 습득했습니다.",
          ],
        },
      ],
    },
  ],
};
