import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { PROFILE } from "@/content/profile";
import { BRAND_COLORS } from "@/lib/brandMark";
import { OgPartCluster } from "@/lib/ogPartCluster";

export const alt = `${PROFILE.nameKorean} | ${PROFILE.role}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// satori는 woff2를 읽지 못한다. 웹에서 쓰는 Pretendard는 woff2라서 같은 패키지의 정적 OTF를 읽는다
const FONT_PATH = join(
  process.cwd(),
  "node_modules/pretendard/dist/public/static/Pretendard-SemiBold.otf",
);

const CLUSTER_WIDTH = 470;
const CLUSTER_HEIGHT = 486;

export default async function OpenGraphImage() {
  const fontData = await readFile(FONT_PATH);
  const titleLines = PROFILE.role.split(" ");

  return new ImageResponse(
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        padding: 72,
        background: BRAND_COLORS.background,
        color: BRAND_COLORS.foreground,
        fontFamily: "Pretendard",
      }}
    >
      {/* satori는 글자 칸의 최소 폭을 문구 한 줄 폭으로 잡아서, 줄어들 수 있게 두지 않으면 소개 문구가 한 줄로 뻗어 도형 칸을 밀어낸다 */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          flexGrow: 1,
          flexBasis: 0,
          minWidth: 0,
        }}
      >
        <div style={{ display: "flex", fontSize: 34 }}>
          <span>yunho</span>
          <span style={{ color: BRAND_COLORS.accent }}>.dev</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: 124,
              lineHeight: 0.98,
              letterSpacing: -5,
            }}
          >
            {titleLines.map((titleLine) => (
              <span key={titleLine}>{titleLine}</span>
            ))}
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 36,
              fontSize: 34,
              // satori는 기본으로 한글을 글자 단위로 끊는다
              wordBreak: "keep-all",
              color: BRAND_COLORS.muted,
            }}
          >
            {PROFILE.tagline}
          </div>
          <div style={{ display: "flex", marginTop: 14, fontSize: 26 }}>
            {PROFILE.nameKorean} / {PROFILE.nameEnglish}
          </div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          width: CLUSTER_WIDTH,
          height: CLUSTER_HEIGHT,
          flexShrink: 0,
        }}
      >
        <OgPartCluster width={CLUSTER_WIDTH} height={CLUSTER_HEIGHT} />
      </div>
    </div>,
    {
      ...size,
      fonts: [
        { name: "Pretendard", data: fontData, weight: 600, style: "normal" },
      ],
    },
  );
}
