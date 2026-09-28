import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["three"],
  experimental: {
    // 목록의 제목이 상세 페이지의 제목으로 이어지는 전환에 쓴다.
    // 이 스위치를 켜면 App Router가 React 실험 채널 빌드로 바뀐다. 3D 장면도 함께 확인할 것
    viewTransition: true,
  },
  turbopack: {
    // 홈 디렉터리에 있는 다른 lockfile을 보고 그쪽을 작업 폴더로 잡는 일이 있다. 이 폴더로 못 박는다
    root: path.resolve(import.meta.dirname),
  },
};

export default nextConfig;
