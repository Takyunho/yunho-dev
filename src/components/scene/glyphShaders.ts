export const STREAM_HALF_HEIGHT = 11;
export const STREAM_HALF_WIDTH = 18;
export const STREAM_DEPTH_FAR = -14;
export const STREAM_DEPTH_NEAR = 3;

// defines로 PART_COUNT와 WAVE_COLUMNS를 받는다
export const GLYPH_VERTEX_SHADER = /* glsl */ `
  uniform float uTime;
  uniform float uMorph;
  uniform float uPixelScale;
  uniform float uDotScale;
  uniform vec2 uFrustum;
  uniform vec2 uPointerNdc;
  uniform float uPointerStrength;
  uniform mat4 uPartMatrices[PART_COUNT];
  uniform float uPool;
  uniform float uPoolHalfWidth;
  uniform float uPoolFloorY;
  uniform float uWaveHeight[WAVE_COLUMNS];
  uniform float uWaveVelocity[WAVE_COLUMNS];

  attribute vec3 aStream;
  attribute vec3 aPool;
  attribute vec2 aPoolMeta;
  attribute vec4 aRandom;
  attribute vec3 aTarget;
  attribute float aGlyph;

  varying float vGlyph;
  varying float vMorph;
  varying float vBright;
  varying float vBlur;
  varying float vIntensity;

  const float STREAM_HALF_HEIGHT = ${STREAM_HALF_HEIGHT.toFixed(1)};
  const float DEPTH_FAR = ${STREAM_DEPTH_FAR.toFixed(1)};
  const float DEPTH_NEAR = ${STREAM_DEPTH_NEAR.toFixed(1)};
  const float GLYPH_WORLD_SIZE = 0.36;
  const float DOT_WORLD_SIZE = 0.085;

  float hash(float value) {
    return fract(sin(value * 127.1) * 43758.5453123);
  }

  // 수면 칸 사이를 선형 보간해서 매끈한 파도 곡선을 만든다
  float sampleWave(float u, bool velocity) {
    float position = clamp((u * 0.5 + 0.5) * float(WAVE_COLUMNS - 1), 0.0, float(WAVE_COLUMNS - 1));
    int index0 = int(floor(position));
    int index1 = min(index0 + 1, WAVE_COLUMNS - 1);
    float value0 = velocity ? uWaveVelocity[index0] : uWaveHeight[index0];
    float value1 = velocity ? uWaveVelocity[index1] : uWaveHeight[index1];
    return mix(value0, value1, fract(position));
  }

  // 웅덩이에서 글자로 보이는 입자가 쓰는 기호. 순서대로 + < > / { } ; = 이다
  float poolSymbol(float pick) {
    if (pick < 0.125) return 11.0;
    if (pick < 0.25) return 28.0;
    if (pick < 0.375) return 30.0;
    if (pick < 0.5) return 15.0;
    if (pick < 0.625) return 91.0;
    if (pick < 0.75) return 93.0;
    if (pick < 0.875) return 27.0;
    return 29.0;
  }

  void main() {
    float columnSpeed = aRandom.x;
    float seed = aRandom.y;
    float columnSeed = aRandom.w;

    // 아래에서 위로 올라가다가 끝에 닿으면 아래에서 다시 시작한다
    float travel = fract(aStream.y + uTime * columnSpeed);
    vec3 streamPosition = vec3(aStream.x, mix(-STREAM_HALF_HEIGHT, STREAM_HALF_HEIGHT, travel), aStream.z);

    int partIndex = int(aRandom.z + 0.5);
    vec3 targetPosition = (uPartMatrices[partIndex] * vec4(aTarget, 1.0)).xyz;

    // 입자마다 출발 시점을 달리해서 글자가 한꺼번에 움직이지 않고 차례로 떨어져 나오게 한다
    float delay = seed * 0.5;
    float localMorph = smoothstep(delay, delay + 0.5, uMorph);
    float eased = localMorph * localMorph * (3.0 - 2.0 * localMorph);

    vec3 worldPosition = mix(streamPosition, targetPosition, eased);
    float arc = sin(eased * 3.14159265);
    worldPosition += vec3(
      sin(seed * 40.0 + uTime * 0.6),
      cos(seed * 31.0 + uTime * 0.4),
      sin(seed * 17.0)
    ) * arc * 1.5;
    // 내려앉은 점이 완전히 멈춰 있으면 죽은 그림처럼 보여서 아주 조금 떨리게 둔다
    worldPosition += vec3(sin(uTime * 2.0 + seed * 90.0), cos(uTime * 1.7 + seed * 70.0), 0.0) * 0.012 * eased;

    // 마지막 구간: 부품에서 풀려난 입자가 바닥에 고인다
    float poolU = aPool.x;
    float columnHeight = sampleWave(poolU, false);
    float columnVelocity = sampleWave(poolU, true);
    float slope = (sampleWave(poolU + 0.02, false) - sampleWave(poolU - 0.02, false)) / (0.04 * uPoolHalfWidth);
    // 물결이 높은 쪽으로 입자가 쏠려서 마루가 성기지 않게 한다
    float poolX = (poolU + slope * 0.05 * aPool.y) * uPoolHalfWidth;
    float poolY = uPoolFloorY + aPool.y * columnHeight;
    // 마루 근처의 입자는 수면이 솟는 속도만큼 물방울처럼 튄다
    poolY += max(columnVelocity, 0.0) * smoothstep(0.7, 1.0, aPool.y) * (0.4 + 0.6 * hash(seed * 4.4)) * 0.35;
    vec3 poolPosition = vec3(poolX, poolY, aPool.z);
    poolPosition += vec3(sin(uTime * 1.3 + seed * 50.0), cos(uTime * 1.1 + seed * 60.0), 0.0) * 0.015;

    float poolDelay = hash(seed * 2.3) * 0.45;
    float poolLocal = smoothstep(poolDelay, poolDelay + 0.55, uPool);
    float poolSettle = poolLocal * poolLocal * (3.0 - 2.0 * poolLocal);
    // 떨어질 때는 중력처럼 점점 빨라진다
    float fallEase = poolLocal * poolLocal;
    worldPosition = vec3(
      mix(worldPosition.x, poolPosition.x, poolSettle),
      mix(worldPosition.y, poolPosition.y, fallEase),
      mix(worldPosition.z, poolPosition.z, poolSettle)
    );
    float poolIsGlyph = step(0.6, aPoolMeta.y);

    vec4 viewPosition = modelViewMatrix * vec4(worldPosition, 1.0);

    // 깊이가 달라도 화면에서 같은 자리에 있는 글자가 밀려나도록 뷰 공간에서 커서 위치를 구한다
    float viewDepth = -viewPosition.z;
    vec2 pointerView = uPointerNdc * uFrustum * viewDepth;
    vec2 away = viewPosition.xy - pointerView;
    float pointerRadius = 0.11 * viewDepth;
    float push = smoothstep(pointerRadius, 0.0, length(away)) * uPointerStrength * (1.0 - eased);
    viewPosition.xy += normalize(away + vec2(0.0001)) * push * pointerRadius * 0.7;

    gl_Position = projectionMatrix * viewPosition;

    float depthRatio = clamp((aStream.z - DEPTH_FAR) / (DEPTH_NEAR - DEPTH_FAR), 0.0, 1.0);
    vBlur = (1.0 - depthRatio) * 0.85 * (1.0 - eased) * (1.0 - poolLocal);

    float formedSize = mix(GLYPH_WORLD_SIZE * (1.0 + vBlur * 0.7), DOT_WORLD_SIZE * uDotScale, eased);
    float poolSize = mix(0.075, 0.24, poolIsGlyph);
    float worldSize = mix(formedSize, poolSize, poolLocal);
    gl_PointSize = worldSize * uPixelScale / viewDepth;

    // 대부분은 어둡고 몇 개만 밝다. 기둥을 따라 올라가는 밝은 띠를 하나 더 얹는다
    float flicker = step(0.985, hash(seed * 13.1 + floor(uTime * 1.5 + seed * 20.0)));
    float wave = pow(max(0.0, sin((travel * 2.0 - uTime * 0.12 + columnSeed * 5.0) * 6.2831853)), 10.0);
    vBright = clamp(flicker + wave * 0.55, 0.0, 1.0) * mix(0.25, 1.0, depthRatio);

    float edgeFade = smoothstep(0.0, 0.1, travel) * smoothstep(1.0, 0.9, travel);
    float baseIntensity = (0.16 + 0.3 * hash(seed * 91.7)) * mix(0.4, 1.0, depthRatio);
    float streamIntensity = (baseIntensity + vBright * 0.9) * edgeFade;
    // 나는 동안에는 어둡게, 내려앉은 뒤에는 겹쳐도 하얗게 타지 않을 만큼만 밝게 한다
    float flightDim = 1.0 - 0.55 * sin(eased * 3.14159265);
    float participates = step(hash(seed * 3.7), 0.6);
    // 부품으로 모일 때 사라졌던 입자도 웅덩이로 풀릴 때는 다시 나타난다
    float leaveBehind = 1.0 - (1.0 - participates) * smoothstep(0.0, 0.55, uMorph) * (1.0 - poolLocal);
    float formedIntensity = mix(streamIntensity, 0.34, eased) * flightDim * leaveBehind;
    float poolIntensity = (0.5 + flicker * 0.5) * aPoolMeta.x;
    vIntensity = mix(formedIntensity, poolIntensity, poolLocal);

    // 몇몇 글자는 잠깐씩 다른 글자로 바뀐다
    float scramble = step(0.95, hash(seed * 7.3 + floor(uTime * 3.0 + seed * 30.0)));
    float scrambledGlyph = floor(hash(seed + floor(uTime * 8.0)) * 93.0) + 1.0;
    float formedGlyph = mix(aGlyph, scrambledGlyph, scramble);
    vGlyph = poolLocal > 0.5 ? poolSymbol(fract(aPoolMeta.y * 7.0)) : formedGlyph;
    vMorph = mix(eased, 1.0 - poolIsGlyph, poolLocal);
  }
`;

export const GLYPH_FRAGMENT_SHADER = /* glsl */ `
  uniform sampler2D uAtlas;
  uniform vec2 uGrid;
  uniform vec3 uColorDim;
  uniform vec3 uColorBright;
  uniform vec3 uColorDot;
  uniform float uFade;
  uniform float uInk;

  varying float vGlyph;
  varying float vMorph;
  varying float vBright;
  varying float vBlur;
  varying float vIntensity;

  // 점 하나의 가운데에 글자를 그리고 바깥쪽 여백을 빛 번짐에 쓴다
  const float HALO_SCALE = 1.8;

  void main() {
    vec2 pointCoordinate = gl_PointCoord;
    vec2 glyphCoordinate = (pointCoordinate - 0.5) * HALO_SCALE + 0.5;
    float insideGlyph = step(0.0, glyphCoordinate.x) * step(glyphCoordinate.x, 1.0)
      * step(0.0, glyphCoordinate.y) * step(glyphCoordinate.y, 1.0);

    float glyphIndex = floor(vGlyph + 0.5);
    float atlasColumn = mod(glyphIndex, uGrid.x);
    float atlasRow = floor(glyphIndex / uGrid.x);
    vec2 atlasCoordinate = vec2(
      (atlasColumn + glyphCoordinate.x) / uGrid.x,
      1.0 - (atlasRow + glyphCoordinate.y) / uGrid.y
    );
    float glyphAlpha = texture2D(uAtlas, atlasCoordinate).a * insideGlyph;

    float distanceFromCenter = length(pointCoordinate - 0.5);
    float softDisc = smoothstep(0.5, 0.0, distanceFromCenter);
    float halo = softDisc * softDisc;
    float dotAlpha = smoothstep(0.5, 0.2, distanceFromCenter);

    // 먼 기둥은 글자 대신 흐릿한 얼룩에 가깝게 그려서 초점이 나간 것처럼 보이게 한다
    float glyphLayer = mix(glyphAlpha, halo * 0.3, vBlur);
    float glowLayer = halo * vBright * 0.22 * (1.0 - uInk);

    float alpha = mix((glyphLayer + glowLayer) * vIntensity, dotAlpha * vIntensity, vMorph);
    vec3 color = mix(mix(uColorDim, uColorBright, vBright), uColorDot, vMorph);

    gl_FragColor = vec4(color, alpha * uFade);
    #include <colorspace_fragment>
  }
`;
