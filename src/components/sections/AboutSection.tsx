"use client";

import { useRef } from "react";
import SectionHeading from "@/components/sections/SectionHeading";
import { useRevealOnScroll } from "@/hooks/useRevealOnScroll";
import { CAREER } from "@/content/career";
import { PROFILE } from "@/content/profile";

// 회사와 시작 연도는 아래 경력에 적혀 있어 여기서 빼고, 거기서 알 수 없는 것만 남긴다
const PROFILE_FACTS = [
  { label: "Role", value: PROFILE.role },
  { label: "Based in", value: PROFILE.location },
];

export default function AboutSection() {
  const sectionRef = useRef<HTMLElement>(null);
  useRevealOnScroll(sectionRef);

  return (
    <section
      id="about"
      ref={sectionRef}
      className="flex min-h-svh flex-col justify-center px-5 py-24 md:px-10 md:py-32"
    >
      {/* 데스크톱에서는 오른쪽 절반을 3D 덩어리 자리로 비워둔다 */}
      <div data-scene-text className="md:w-1/2">
        <SectionHeading title="About" caption="소개" />

        <p
          data-reveal
          className="text-2xl leading-snug font-medium tracking-tight text-fg md:text-[2rem] md:leading-[1.4]"
        >
          {PROFILE.introduction}
        </p>

        {/* 어디서 얼마나 일했는지, 그동안 맡은 일이 어떻게 달라졌는지.
            Work의 프로젝트 목록은 분류로 묶여 있어 이 순서가 드러나지 않는다.
            3D 부품이 이 글자 옆을 지나가므로 섹션이 길어지면 겹친다. 내용을 더할 때는 높이를 확인할 것 */}
        <div data-reveal className="mt-12 border-t border-line pt-6">
          <h3 className="text-2xl font-semibold text-fg">{CAREER.company}</h3>
          <p className="label mt-1 flex flex-wrap items-center gap-x-3">
            <span className="font-mono tabular-nums">{CAREER.period}</span>
            <span aria-hidden="true" className="h-3 w-px bg-line" />
            <span>{CAREER.role}</span>
          </p>
          <p className="mt-3 max-w-(--measure) text-(length:--text-body) leading-relaxed text-muted">
            {CAREER.companyDescription}
          </p>

          {/* 세로선이 시기를 하나로 꿰고, 선 위의 점이 시기가 시작하는 자리를 짚는다. 최근이 위에 온다.
              점은 기간 글자의 가운데 높이(9.5px)에 맞추고, 가로로는 pl-5에서 선 두께의 절반을 뺀 만큼 당겨 선 한가운데에 둔다.
              선은 테두리 대신 따로 그려 첫 점의 가운데에서 시작한다. 테두리로 두면 첫 점 위로 선이 삐져나온다 */}
          <ol className="relative mt-8 space-y-10 pl-5 before:absolute before:top-[9.5px] before:bottom-0 before:left-0 before:w-px before:bg-line">
            {CAREER.phases.map((phase) => (
              <li
                key={phase.title}
                className="relative before:absolute before:top-[5px] before:-left-[24px] before:size-[9px] before:rounded-full before:bg-accent"
              >
                <p className="label font-mono tabular-nums">{phase.period}</p>
                <h4 className="mt-1 text-[1.375rem] leading-snug font-semibold text-fg">
                  {phase.title}
                </h4>
                {/* 이름 붙은 묶음은 점 두 겹이 겹쳐 보이므로, 이름은 점 없이 두고 항목에만 점을 찍는다.
                    이름이 항목과 같은 크기라 색으로 구분하고, 묶음 사이를 항목 사이보다 넓게 띄워 어디서 나뉘는지 보이게 한다 */}
                <div className="mt-3 space-y-5">
                  {phase.groups.map((group) => (
                    <div key={group.label ?? group.items[0]}>
                      {group.label && (
                        <p className="text-(length:--text-body) font-semibold text-accent">
                          {group.label}
                        </p>
                      )}
                      <ul
                        className={`list-disc space-y-2 pl-4 ${group.label ? "mt-1.5" : ""}`}
                      >
                        {group.items.map((item) => (
                          <li
                            key={item}
                            className="max-w-(--measure) text-(length:--text-body) leading-relaxed text-muted"
                          >
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </li>
            ))}
          </ol>
        </div>

        <dl
          data-reveal
          className="mt-12 grid grid-cols-2 gap-x-6 gap-y-7 border-t border-line pt-6"
        >
          {PROFILE_FACTS.map((profileFact) => (
            <div key={profileFact.label}>
              <dt className="label">{profileFact.label}</dt>
              <dd className="mt-2 text-base font-medium text-fg">
                {profileFact.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
