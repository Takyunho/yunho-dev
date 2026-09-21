import { clamp, type ViewportUnits } from "@/components/scene/sceneLayout";

// 웅덩이 수면을 이 개수의 칸으로 나눠서 파도를 계산한다
export const WAVE_COLUMNS = 64;

const WAVE_RESTORE = 6; // 수면이 제 높이로 돌아가려는 힘
const WAVE_TENSION = 60; // 옆 칸으로 출렁임이 번지는 힘
const WAVE_DAMPING = 1.0; // 클수록 빨리 잦아든다
const WAVE_SPLASH = 70; // 점에 닿은 커서가 수면을 밀어 올리는 힘
const WAVE_REACH = 2.8; // 커서가 영향을 주는 가로 범위 (장면 단위)
const WAVE_CONTACT_MARGIN = 0.5; // 수면보다 이만큼 위까지는 점에 닿은 것으로 본다
const WAVE_CONTACT_DEPTH = 1.5; // 이 깊이까지는 잠길수록 세게 밀고, 더 깊어도 같은 힘이다
const WAVE_CEILING_RATIO = 0.85; // 화면 높이 중 이 비율에 닿으면 미는 힘이 0이 된다
const WAVE_CEILING_FADE = 0.35; // 상한의 이 비율 아래부터 힘이 줄기 시작한다
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
  // 커서가 점 위 허공에 있으면 수면은 반응하지 않는다. 점에 닿아 움직일 때만 그 자리에서 물이 솟는다
  const splash =
    pointerActivity * readCursorImmersion(pointerX, pointerY) * WAVE_SPLASH;
  const ceiling = ceilingHeight * WAVE_CEILING_RATIO;

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
        const distanceRatio = (x - pointerX) / WAVE_REACH;
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
        restHeight * 0.3,
        ceilingHeight,
      );
    }
  }
}
