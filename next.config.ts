import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["three"],
  turbopack: {
    // 홈 디렉터리에 있는 다른 lockfile을 보고 그쪽을 작업 폴더로 잡는 일이 있다. 이 폴더로 못 박는다
    root: path.resolve(import.meta.dirname),
  },
};

export default nextConfig;
