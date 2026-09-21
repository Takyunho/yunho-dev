interface SectionHeadingProps {
  title: string;
  caption: string;
}

export default function SectionHeading({
  title,
  caption,
}: SectionHeadingProps) {
  return (
    // 측정용 표식과 reveal 변형을 분리한다. 같은 요소에 두면 아직 드러나지 않은 제목의 transform이 측정에 섞인다
    <div data-scene-text className="mb-10 md:mb-16">
      <div data-reveal>
        <h2 className="display text-[clamp(3rem,8vw,7rem)] leading-none text-fg">
          {title}
        </h2>
        <p className="mt-3 text-base text-muted">{caption}</p>
      </div>
    </div>
  );
}
