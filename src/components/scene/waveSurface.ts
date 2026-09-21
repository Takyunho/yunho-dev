import { clamp, type ViewportUnits } from "@/components/scene/sceneLayout";

// 웅덩이 수면을 이 개수의 칸으로 나눠서 파도를 계산한다
export const WAVE_COLUMNS = 64;

const WAVE_RESTORE = 20; // 수면이 제 높이로 돌아가려는 힘. 클수록 파인 자리가 빨리 채워진다
const WAVE_TENSION = 90; // 옆 칸으로 출렁임이 번지는 힘. 클수록 수면이 매끄럽게 이어진다
const WAVE_DAMPING = 3; // 클수록 빨리 잦아든다
const WAVE_SPLASH = 26; // 점에 닿아 움직이는 커서가 물을 밀어 올리는 힘
const FLING_FULL_SPEED = 10; // 커서의 가로 속도(초당 장면 단위)가 이만큼이면 물이 진행 방향으로 가장 세게 튕겨 나간다
const WAVE_REACH = 2.2; // 부풀어 오르는 너울의 가로 범위 (장면 단위). 좁으면 물마루가 뾰족해진다
const PUSH_LEAD = 1.1; // 너울이 서는 자리. 커서가 가는 쪽으로 이만큼 앞서 있다 (장면 단위)
const WAVE_MIN_HEIGHT_RATIO = 0.3; // 파도의 골이 깊어도 수면은 평소 높이의 이 비율 아래로 내려가지 않는다
const WAVE_CONTACT_MARGIN = 0.5; // 수면보다 이만큼 위까지는 점에 닿은 것으로 본다
const WAVE_CONTACT_DEPTH = 1.5; // 이 깊이까지는 잠길수록 세게 밀고, 더 깊어도 같은 힘이다
const WAVE_CEILING_RATIO = 0.45; // 화면 높이 중 이 비율에 닿으면 미는 힘이 0이 된다
const WAVE_MAX_HEIGHT_RATIO = 0.9; // 관성으로 더 올라가도 수면은 화면 높이의 이 비율을 넘지 않는다. 점이 화면 밖으로 나가지 않는다
const WAVE_CEILING_FADE = 0.35; // 상한의 이 비율 아래부터 힘이 줄기 시작한다
const DROP_IMPACT = 0.22; // 떨어진 점 하나가 수면을 끌어내리는 속도 (장면 단위/초)
const DROP_IMPACT_REACH = 1.1; // 점 하나가 남기는 자국의 가로 범위 (장면 단위)
const POOL_REST_HEIGHT_RATIO = 0.24; // 평소 수면 높이 (화면 높이 비율)
const SUBSTEPS = 2;
const MAX_STEP_SECONDS = 1 / 30;

// 3D 쪽이 매 프레임 갱신하고 Contact의 글자가 gsap.ticker에서 읽는다
export const waveSurface = {
  heights: new Float32Array(WAVE_COLUMNS),
  velocities: new Float32Array(WAVE_COLUMNS),
  restHeight: 1,
  floorY: -1,
  halfWidth: 1,
  // 마지막 구간 진행도. 0보다 클 때만 글자가 출렁인다
  pool: 0,
  // 커서의 가로 속도를 구하려고 직전 위치를 남긴다
  lastPointerX: 0,
};

export function resetWaveSurface() {
  waveSurface.heights.fill(waveSurface.restHeight);
  waveSurface.velocities.fill(0);
}

export function configureWaveSurface(viewport: ViewportUnits) {
  waveSurface.floorY = -viewport.halfHeight - 0.15;
  waveSurface.restHeight = viewport.halfHeight * 2 * POOL_REST_HEIGHT_RATIO;
  waveSurface.halfWidth = viewport.halfWidth * 1.04;
  resetWaveSurface();
}

// 셰이더의 sampleWave와 같은 선형 보간
export function sampleWaveHeight(u: number): number {
  const position = clamp(
    (u * 0.5 + 0.5) * (WAVE_COLUMNS - 1),
    0,
    WAVE_COLUMNS - 1,
  );
  const index0 = Math.floor(position);
  const index1 = Math.min(index0 + 1, WAVE_COLUMNS - 1);
  const { heights } = waveSurface;
  return (
    heights[index0] + (heights[index1] - heights[index0]) * (position - index0)
  );
}

// 커서가 수면 아래로 얼마나 잠겼는지. 허공에 있으면 0이고, 점을 스치기만 해도 조금은 잠긴 것으로 본다
export function readCursorImmersion(
  pointerX: number,
  pointerY: number,
): number {
  const cursorSurfaceY =
    waveSurface.floorY + sampleWaveHeight(pointerX / waveSurface.halfWidth);
  return clamp(
    (cursorSurfaceY + WAVE_CONTACT_MARGIN - pointerY) / WAVE_CONTACT_DEPTH,
    0,
    1,
  );
}

// 물에 떨어진 점 하나가 수면을 아래로 끌어내린다. 점이 우수수 쏟아지면 그 자리가 파이고 물결이 양옆으로 퍼진다
export function splashWaveSurface(dropX: number) {
  const { velocities, halfWidth } = waveSurface;
  for (let index = 0; index < WAVE_COLUMNS; index += 1) {
    const x = ((index / (WAVE_COLUMNS - 1)) * 2 - 1) * halfWidth;
    const distanceRatio = (x - dropX) / DROP_IMPACT_REACH;
    velocities[index] -= DROP_IMPACT * Math.exp(-distanceRatio * distanceRatio);
  }
}

export function stepWaveSurface(
  delta: number,
  elapsedTime: number,
  pointerX: number,
  pointerY: number,
  pointerActivity: number,
  ceilingHeight: number,
) {
  const { heights, velocities, restHeight, halfWidth } = waveSurface;
  const stepSeconds = Math.min(delta, MAX_STEP_SECONDS) / SUBSTEPS;
  const damping = Math.exp(-WAVE_DAMPING * stepSeconds);
  // 커서가 점 위 허공에 있으면 수면은 반응하지 않는다. 점에 닿아 움직일 때만 커서 양옆에서 물이 솟는다
  const splash =
    pointerActivity * readCursorImmersion(pointerX, pointerY) * WAVE_SPLASH;
  const ceiling = ceilingHeight * WAVE_CEILING_RATIO;
  const pointerSpeedX =
    (pointerX - waveSurface.lastPointerX) / Math.max(delta, 0.001);
  waveSurface.lastPointerX = pointerX;
  // 커서가 빠르게 갈수록 너울이 진행 방향으로 더 앞서 선다
  const pushCenterX =
    pointerX + clamp(pointerSpeedX / FLING_FULL_SPEED, -1, 1) * PUSH_LEAD;

  for (let substep = 0; substep < SUBSTEPS; substep += 1) {
    for (let index = 0; index < WAVE_COLUMNS; index += 1) {
      const u = (index / (WAVE_COLUMNS - 1)) * 2 - 1;
      const x = u * halfWidth;
      // 가만히 있어도 수면이 아주 천천히 일렁인다
      const idleHeight =
        restHeight +
        0.12 * Math.sin(x * 0.6 + elapsedTime * 0.8) +
        0.08 * Math.sin(x * 1.3 - elapsedTime * 1.1);
      const left = heights[Math.max(index - 1, 0)];
      const right = heights[Math.min(index + 1, WAVE_COLUMNS - 1)];
      let acceleration =
        -WAVE_RESTORE * (heights[index] - idleHeight) +
        WAVE_TENSION * (left + right - 2 * heights[index]);
      if (splash > 0.001) {
        // 물은 커서가 밀고 가는 쪽에서 완만하게 부풀어 오르고, 커서가 지나가면 그 자리가 다시 내려앉는다
        const distanceRatio = (x - pushCenterX) / WAVE_REACH;
        // 계속 흔들어도 수면이 화면 꼭대기에 벽처럼 붙지 않게 위로 갈수록 힘을 줄인다
        const headroom = clamp(
          (ceiling - heights[index]) / (ceiling * WAVE_CEILING_FADE),
          0,
          1,
        );
        acceleration +=
          splash * headroom * Math.exp(-distanceRatio * distanceRatio);
      }
      velocities[index] =
        (velocities[index] + acceleration * stepSeconds) * damping;
    }
    for (let index = 0; index < WAVE_COLUMNS; index += 1) {
      heights[index] = clamp(
        heights[index] + velocities[index] * stepSeconds,
        restHeight * WAVE_MIN_HEIGHT_RATIO,
        ceilingHeight * WAVE_MAX_HEIGHT_RATIO,
      );
    }
  }
}
