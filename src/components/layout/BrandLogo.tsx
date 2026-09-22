import type { CSSProperties } from "react";
import Link from "next/link";
import {
  BRAND_MARK_PATH,
  BRAND_MARK_STROKE_WIDTH,
  BRAND_MARK_VIEW_BOX_SIZE,
} from "@/lib/brandMark";

const WORDMARK_PARTS = [
  { text: "yunho", className: "" },
  { text: ".dev", className: "text-accent" },
];

// 펼칠 때 글자가 하나씩 떠오르도록 글자마다 순서를 매긴다
const WORDMARK_LETTERS = WORDMARK_PARTS.flatMap((part) =>
  [...part.text].map((character) => ({
    character,
    className: part.className,
  })),
);

// 평소에는 Y 마크를 담은 유리 원이고, 마우스를 올리거나 키보드로 닿으면 유리가 늘어나며 yunho.dev로 풀린다.
// 움직임은 globals.css의 .brand-logo 규칙이 맡는다
export default function BrandLogo() {
  return (
    <Link
      href="/#hero"
      aria-label="yunho.dev"
      className="brand-logo liquid-glass relative flex h-12 min-w-12 items-center rounded-full text-fg"
    >
      <span
        aria-hidden="true"
        className="absolute inset-y-0 left-0 flex w-12 items-center justify-center"
      >
        <svg
          width="28"
          height="28"
          viewBox={`0 0 ${BRAND_MARK_VIEW_BOX_SIZE} ${BRAND_MARK_VIEW_BOX_SIZE}`}
          fill="none"
          className="brand-logo-mark"
        >
          <path
            d={BRAND_MARK_PATH}
            stroke="currentColor"
            strokeWidth={BRAND_MARK_STROKE_WIDTH}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>

      <span aria-hidden="true" className="brand-logo-reveal">
        {/* 세로로는 잘리지 않게 가로만 자른다. y의 꼬리가 글자 상자 아래로 내려온다 */}
        <span className="min-w-0 overflow-x-clip">
          <span className="display block px-4 text-2xl leading-none whitespace-nowrap">
            {WORDMARK_LETTERS.map((letter, letterIndex) => (
              <span
                key={letterIndex}
                className={`brand-logo-letter ${letter.className}`}
                style={{ "--letter-index": letterIndex } as CSSProperties}
              >
                {letter.character}
              </span>
            ))}
          </span>
        </span>
      </span>
    </Link>
  );
}
