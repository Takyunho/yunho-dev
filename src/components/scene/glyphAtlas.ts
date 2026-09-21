import * as THREE from "three";

export const ATLAS_COLUMNS = 10;
export const ATLAS_ROWS = 10;
export const FIRST_CHARACTER_CODE = 32;
export const GLYPH_COUNT = 95;

// 기둥에 흐르는 글자는 무작위 기호가 아니라 이 사이트의 코드다. 글자판이 ASCII뿐이라 한글은 넣지 않는다
export const CODE_CORPUS = [
  '<section id="hero" className="flex min-h-svh flex-col justify-end">',
  'const [theme, setTheme] = useState<"light" | "dark">("dark")',
  "useEffect(() => { document.documentElement.dataset.theme = theme }, [theme])",
  '<ThemeToggle onToggle={() => setTheme(theme === "dark" ? "light" : "dark")} />',
  ".line-mask { display: block; overflow: hidden; padding-bottom: 0.15em }",
  "@media (prefers-reduced-motion: reduce) { .line-mask > span { transform: none } }",
  "PROJECTS.map((project) => <ProjectCard key={project.id} project={project} />)",
  "sceneState.pointer.x = (event.clientX / window.innerWidth) * 2 - 1",
  "a:hover { color: var(--accent); text-decoration-color: var(--accent) }",
  "type Project = { id: string; title: string; techStack: string[] }",
  "export default function Home() { return <main><HeroSection /></main> }",
].join("   ");

export function glyphIndexForCharacterCode(characterCode: number): number {
  return Math.min(
    Math.max(characterCode - FIRST_CHARACTER_CODE, 0),
    GLYPH_COUNT - 1,
  );
}

// 10×10 격자에 ASCII 32부터 126까지를 그린 텍스처. 외부 이미지 파일을 두지 않는다
export function createGlyphAtlasTexture(): THREE.CanvasTexture {
  const cellSize = 64;
  const atlasCanvas = document.createElement("canvas");
  atlasCanvas.width = cellSize * ATLAS_COLUMNS;
  atlasCanvas.height = cellSize * ATLAS_ROWS;
  const context = atlasCanvas.getContext("2d");
  if (context) {
    context.fillStyle = "#ffffff";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.font = `600 46px ui-monospace, "SF Mono", Menlo, Consolas, monospace`;
    for (let glyphIndex = 0; glyphIndex < GLYPH_COUNT; glyphIndex += 1) {
      const column = glyphIndex % ATLAS_COLUMNS;
      const row = Math.floor(glyphIndex / ATLAS_COLUMNS);
      context.fillText(
        String.fromCharCode(FIRST_CHARACTER_CODE + glyphIndex),
        column * cellSize + cellSize / 2,
        row * cellSize + cellSize / 2 + 2,
      );
    }
  }
  const texture = new THREE.CanvasTexture(atlasCanvas);
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;
  return texture;
}
