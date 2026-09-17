import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { PROFILE } from "@/content/profile";
import { BRAND_COLORS } from "@/lib/brandMark";

export const alt = `${PROFILE.nameKorean} | ${PROFILE.role}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// satori는 woff2를 읽지 못한다. 웹에서 쓰는 Pretendard는 woff2라서 같은 패키지의 정적 OTF를 읽는다
const FONT_PATH = join(
  process.cwd(),
  "node_modules/pretendard/dist/public/static/Pretendard-SemiBold.otf",
);

type ShapeTone = "light" | "dark" | "accent";

interface ClusterShape {
  tone: ShapeTone;
  left: number;
  top: number;
  diameter: number;
  // 0.5면 원, 그보다 작으면 둥근 사각형
  roundness: number;
}

// 빛이 왼쪽 위에서 들어오는 것처럼 보이도록 밝은 점을 중심에서 벗어난 곳에 둔다
const SHAPE_GRADIENTS: Record<ShapeTone, string> = {
  light:
    "radial-gradient(circle at 32% 28%, #ffffff 0%, #c9cdd8 45%, #7d8394 100%)",
  dark: "radial-gradient(circle at 32% 28%, #5a5f70 0%, #1a1c24 38%, #050608 100%)",
  accent:
    "radial-gradient(circle at 32% 28%, #b3bbff 0%, #5b6cff 42%, #1e2aa8 100%)",
};

// 3D 장면의 오브젝트 덩어리를 평면 도형으로 옮긴 것. 뒤에 있는 도형부터 그린다
const CLUSTER_SHAPES: ClusterShape[] = [
  { tone: "dark", left: 150, top: 30, diameter: 190, roundness: 0.26 },
  { tone: "accent", left: 20, top: 120, diameter: 170, roundness: 0.26 },
  { tone: "light", left: 270, top: 150, diameter: 170, roundness: 0.5 },
  { tone: "dark", left: 40, top: 270, diameter: 150, roundness: 0.5 },
  { tone: "light", left: 130, top: 140, diameter: 210, roundness: 0.5 },
  { tone: "accent", left: 260, top: 300, diameter: 140, roundness: 0.5 },
  { tone: "dark", left: 160, top: 310, diameter: 170, roundness: 0.26 },
  { tone: "light", left: 60, top: 60, diameter: 110, roundness: 0.5 },
  { tone: "dark", left: 330, top: 90, diameter: 100, roundness: 0.5 },
];

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
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          flexGrow: 1,
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
          position: "relative",
          width: 470,
          height: 486,
        }}
      >
        {CLUSTER_SHAPES.map((clusterShape) => (
          <div
            key={`${clusterShape.left}-${clusterShape.top}`}
            style={{
              position: "absolute",
              left: clusterShape.left,
              top: clusterShape.top,
              width: clusterShape.diameter,
              height: clusterShape.diameter,
              borderRadius: clusterShape.diameter * clusterShape.roundness,
              backgroundImage: SHAPE_GRADIENTS[clusterShape.tone],
            }}
          />
        ))}
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
