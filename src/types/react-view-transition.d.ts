// next.config의 experimental.viewTransition을 켜면 App Router가 React 실험 채널로 바뀌고
// 거기에만 unstable_ViewTransition이 있다. @types/react는 아직 이 이름을 모르므로 여기서 알려 준다
import type { ExoticComponent, ReactNode } from "react";

declare module "react" {
  export const unstable_ViewTransition: ExoticComponent<{
    children?: ReactNode;
    // 이 이름이 같은 두 요소를 이어 하나가 다른 하나로 변형된다
    name?: string;
  }>;
}
