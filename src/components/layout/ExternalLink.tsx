"use client";

import { useEffect, useState } from "react";

// 새 탭이 뒤에서 열리거나 열기가 막히면 이 페이지가 가려지지 않는다. 그때 스피너가 계속 돌지 않게 하는 상한이다
const SPINNER_TIMEOUT_MILLISECONDS = 4000;

interface ExternalLinkProps {
  href: string;
  label: string;
  className?: string;
}

// 새 탭으로 여는 외부 링크. 누른 뒤 새 탭으로 넘어가기 전까지 화살표 자리에 스피너를 보여 준다
export default function ExternalLink({
  href,
  label,
  className,
}: ExternalLinkProps) {
  const [isOpening, setIsOpening] = useState(false);

  useEffect(() => {
    if (!isOpening) return;
    const stopSpinner = () => setIsOpening(false);
    // 새 탭에서 돌아왔을 때 스피너가 남아 있으면 안 된다
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") stopSpinner();
    };
    const timeoutId = window.setTimeout(
      stopSpinner,
      SPINNER_TIMEOUT_MILLISECONDS,
    );
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", stopSpinner);
    return () => {
      window.clearTimeout(timeoutId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", stopSpinner);
    };
  }, [isOpening]);

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-busy={isOpening}
      onClick={() => setIsOpening(true)}
      className={className}
    >
      {label}
      {/* 화살표는 글자와 같은 줄의 텍스트여야 밑줄이 끊기지 않는다. 스피너가 돌 때도 화살표를 지우지 않고 투명하게만 해서
          밑줄과 너비를 그대로 둔다 */}
      {"\u00A0"}
      <span aria-hidden="true" className="relative">
        <span className={isOpening ? "text-transparent" : undefined}>↗</span>
        {isOpening && (
          <span className="absolute top-1/2 left-1/2 size-[0.75em] -translate-x-1/2 -translate-y-1/2">
            <span className="block size-full animate-spin rounded-full border-[1.5px] border-current border-t-transparent" />
          </span>
        )}
      </span>
    </a>
  );
}
