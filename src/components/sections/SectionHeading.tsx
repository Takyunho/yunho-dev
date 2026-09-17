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
    <div data-reveal className="mb-12 md:mb-20">
      <p className="font-mono text-xs tracking-[0.2em] text-muted uppercase">
        {index} / {caption}
      </p>
      <h2 className="mt-3 text-[clamp(2.75rem,8vw,7rem)] leading-none font-semibold tracking-tighter text-fg">
        {title}
      </h2>
    </div>
  );
}
