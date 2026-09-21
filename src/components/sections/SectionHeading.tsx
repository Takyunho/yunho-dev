interface SectionHeadingProps {
  index: string;
  title: string;
  caption: string;
}

export default function SectionHeading({
  index,
  title,
  caption,
}: SectionHeadingProps) {
  return (
    // 측정용 표식과 reveal 변형을 분리한다. 같은 요소에 두면 아직 드러나지 않은 제목의 transform이 측정에 섞인다
    <div data-scene-text className="mb-12 md:mb-20">
      <div data-reveal>
        <p className="font-mono text-xs tracking-[0.2em] text-muted uppercase">
          {index} / {caption}
        </p>
        <h2 className="mt-3 text-[clamp(2.75rem,8vw,7rem)] leading-none font-semibold tracking-tighter text-fg">
          {title}
        </h2>
      </div>
    </div>
  );
}
