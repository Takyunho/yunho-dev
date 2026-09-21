import { Fragment } from "react";

interface WaveTextProps {
  text: string;
}

// 글자마다 span을 두어 파도를 따라 따로 움직일 수 있게 한다. 원문은 스크린 리더용으로 따로 둔다
export default function WaveText({ text }: WaveTextProps) {
  const words = text.split(" ");

  return (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((word, wordIndex) => (
          <Fragment key={`${wordIndex}-${word}`}>
            {wordIndex > 0 && " "}
            <span className="inline-block whitespace-nowrap">
              {Array.from(word).map((character, characterIndex) => (
                <span
                  key={characterIndex}
                  data-wave-letter
                  className="inline-block will-change-transform"
                >
                  {character}
                </span>
              ))}
            </span>
          </Fragment>
        ))}
      </span>
    </>
  );
}
