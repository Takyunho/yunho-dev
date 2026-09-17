export type BodyShape = "sphere" | "capsule" | "box" | "torus";
export type BodyRole = "neutral" | "contrast" | "accent";

export interface ClusterBodyDescriptor {
  key: string;
  shape: BodyShape;
  role: BodyRole;
  scale: number;
  position: [number, number, number];
  rotation: [number, number, number];
  // 퍼짐 연출에서 이 오브젝트가 향하는 자리. x는 왼쪽(-1)이나 오른쪽(1) 가장자리, y와 z는 -1~1
  home: [number, number, number];
}

const BODY_SHAPES: BodyShape[] = ["sphere", "capsule", "box", "torus"];
const INITIAL_SPREAD = 9;
const RANDOM_SEED = 20260917;

// 새로고침해도 같은 배치가 나오도록 시드가 고정된 난수를 쓴다
function createSeededRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let mixed = Math.imul(state ^ (state >>> 15), 1 | state);
    mixed = (mixed + Math.imul(mixed ^ (mixed >>> 7), 61 | mixed)) ^ mixed;
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
  };
}

function pickRole(randomValue: number): BodyRole {
  if (randomValue < 0.5) return "neutral";
  if (randomValue < 0.75) return "contrast";
  return "accent";
}

export function createClusterBodies(count: number): ClusterBodyDescriptor[] {
  const random = createSeededRandom(RANDOM_SEED);
  const randomSpread = (range: number) => (random() - 0.5) * 2 * range;
  const slotCountPerSide = Math.ceil(count / 2);

  // 현재 위치와 무관하게 자리가 정해져 있어야 어디서 출발하든 좌우로 고르게 나뉜다
  const createHome = (bodyIndex: number): [number, number, number] => {
    const side = bodyIndex % 2 === 0 ? -1 : 1;
    const slotIndex = Math.floor(bodyIndex / 2);
    const verticalRatio =
      slotCountPerSide > 1 ? slotIndex / (slotCountPerSide - 1) : 0.5;
    return [side, verticalRatio * 2 - 1, randomSpread(1)];
  };

  return Array.from({ length: count }, (_, bodyIndex) => ({
    key: `cluster-body-${bodyIndex}`,
    // 좌우 자리를 짝수와 홀수로 나누기 때문에, 형태를 순번으로 고르면 한쪽에 같은 형태만 모인다
    shape: BODY_SHAPES[Math.floor(random() * BODY_SHAPES.length)],
    role: pickRole(random()),
    scale: 0.7 + random() * 0.6,
    // 화면 밖에 흩어진 상태로 시작해서 안쪽으로 몰려드는 것이 인트로 연출이 된다
    position: [
      randomSpread(INITIAL_SPREAD),
      randomSpread(INITIAL_SPREAD),
      randomSpread(INITIAL_SPREAD * 0.5),
    ],
    rotation: [
      randomSpread(Math.PI),
      randomSpread(Math.PI),
      randomSpread(Math.PI),
    ],
    home: createHome(bodyIndex),
  }));
}
