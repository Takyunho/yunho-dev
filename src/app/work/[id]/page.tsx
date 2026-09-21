import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ExternalLink from "@/components/layout/ExternalLink";
import Header from "@/components/layout/Header";
import { PROJECT_DETAILS } from "@/content/projectDetails";
import { PROJECTS, PROJECT_CATEGORIES } from "@/content/projects";

interface ProjectPageProps {
  params: Promise<{ id: string }>;
}

// 상세가 있는 프로젝트만 주소를 만든다. 나머지는 목록의 요약까지만 보여 준다
export function generateStaticParams() {
  return Object.keys(PROJECT_DETAILS).map((id) => ({ id }));
}

function findProject(id: string) {
  const project = PROJECTS.find((candidate) => candidate.id === id);
  const detail = PROJECT_DETAILS[id];
  if (!project || !detail) return null;
  const category = PROJECT_CATEGORIES.find(
    (candidate) => candidate.id === project.categoryId,
  );
  if (!category) return null;
  return { project, detail, category };
}

// 이어 읽을 수 있는 것은 상세를 쓴 프로젝트뿐이다. 목록과 같은 순서(최근 시작 순)로 잇고,
// 양 끝에서는 한쪽을 비워 둔다. 처음과 끝이 없이 돌면 어디까지 읽었는지 알 수 없다
function findNeighbours(id: string) {
  const readable = PROJECTS.filter(
    (candidate) => PROJECT_DETAILS[candidate.id],
  );
  const position = readable.findIndex((candidate) => candidate.id === id);
  return {
    previous: position > 0 ? readable[position - 1] : null,
    next: position < readable.length - 1 ? readable[position + 1] : null,
  };
}

export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const { id } = await params;
  const found = findProject(id);
  if (!found) return {};
  return {
    title: `${found.project.title} | 탁윤호`,
    description: found.project.summary,
    openGraph: {
      title: `${found.project.title} | 탁윤호`,
      description: found.project.summary,
      url: `/work/${id}`,
      type: "article",
    },
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { id } = await params;
  const found = findProject(id);
  if (!found) notFound();
  const { project, detail, category } = found;
  const { previous, next } = findNeighbours(id);

  return (
    // 읽는 화면이라 3D 장면과 부드러운 스크롤은 두지 않는다
    <div className="relative">
      <Header />

      {/* 읽는 화면이라 한 칼럼으로 좁게 짠다. 본문은 그 안에서 다시 measure로 묶는다 */}
      <main className="mx-auto max-w-3xl px-5 pt-32 pb-24 md:px-10 md:pt-40 md:pb-32">
        {/* 이 페이지에서 나가는 유일한 길이라 본문 크기로 둔다.
            위아래 여백은 손가락으로 누를 높이를 만들려는 것이다 */}
        <p>
          <Link
            href="/#work"
            className="text-link inline-block py-2 text-(length:--text-body) whitespace-nowrap text-muted"
          >
            ← Work
          </Link>
        </p>

        <header
          data-project-accent
          className="mt-10 border-t border-line pt-8"
          style={
            {
              "--project-accent-light": project.accentColor.light,
              "--project-accent-dark": project.accentColor.dark,
            } as React.CSSProperties
          }
        >
          {/* 목록 카드와 같은 표기를 쓴다. 기간은 모노, 분류는 테두리 칩이다 */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <p className="label font-mono tabular-nums">{project.period}</p>
            <p className="label rounded-full border border-line bg-surface px-2 py-1 whitespace-nowrap">
              {category.label}
            </p>
          </div>

          {/* 제목이 한글이라 세리프 글리프가 없어 본문 글꼴로 떨어진다. 세리프에 맞춘 큰 크기를
              그대로 두면 획이 가늘어 흐릿하게 읽히므로, 크기를 낮추고 굵기로 위계를 만든다 */}
          <h1 className="mt-5 text-[clamp(1.875rem,4.5vw,2.75rem)] leading-[1.2] font-semibold tracking-tight break-words text-fg">
            {project.title}
          </h1>
          <p className="label mt-2">{project.role}</p>

          {/* 여는 문단은 본문보다 한 단계 크고 진하게 둔다. 제목 다음으로 먼저 읽히는 자리다 */}
          <p className="mt-8 max-w-(--measure) text-lg leading-relaxed text-fg md:text-xl">
            {detail.overview}
          </p>

          <ul className="mt-8 flex flex-wrap gap-x-3 gap-y-1">
            {project.techStack.map((technology) => (
              <li
                key={technology}
                className="font-mono text-(length:--text-label) text-muted"
              >
                {technology}
              </li>
            ))}
          </ul>

          {project.links.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
              {project.links.map((projectLink) => (
                <ExternalLink
                  key={projectLink.url}
                  href={projectLink.url}
                  label={projectLink.label}
                  className="text-link text-base font-medium whitespace-nowrap text-fg"
                />
              ))}
            </div>
          )}
        </header>

        {/* 제목을 왼쪽 여백에 라벨처럼 두지 않고 본문 흐름 안에 둔다. 좁은 왼쪽 열에 갇히면
            제목과 본문의 폭이 달라져 읽는 줄이 매번 끊긴다 */}
        <div className="mt-20 border-b border-line">
          {detail.sections.map((section) => (
            <section
              key={section.title}
              className="border-t border-line py-10 md:py-12"
            >
              <h2 className="text-xl font-semibold tracking-tight text-fg">
                {section.title}
              </h2>
              {/* 항목 하나가 한 문장이라 단락처럼 띄워야 어디서 끊기는지 보인다 */}
              <ul className="mt-5 max-w-(--measure) space-y-5">
                {section.items.map((item) => (
                  <li
                    key={item}
                    className="text-(length:--text-body) leading-relaxed text-muted"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        {/* 다 읽은 사람이 갈 곳이다. 목록으로 가는 길은 맨 위 ← Work 하나로 충분해서 여기에는 두지 않는다.
            아래 선이 페이지의 마지막 선이 되어 글이 끝났다는 것을 닫아 준다.
            양 끝 프로젝트는 한쪽만 나오므로, 다음만 있을 때는 오른쪽 자리로 보낸다 */}
        {(previous || next) && (
          <nav
            aria-label="프로젝트 이어 보기"
            className="grid gap-4 pt-10 sm:grid-cols-2 md:pt-12"
          >
            {previous && (
              <Link
                href={`/work/${previous.id}`}
                // 목록 카드가 쓰는 것과 같은 방식이다. 갈 곳의 색을 미리 보여 준다
                data-project-accent
                style={
                  {
                    "--project-accent-light": previous.accentColor.light,
                    "--project-accent-dark": previous.accentColor.dark,
                  } as React.CSSProperties
                }
                className="group block rounded-xl border border-line p-5 transition-colors duration-(--dur-short) hover:border-(--project-accent)"
              >
                <span className="label">이전</span>
                <span className="mt-2 block text-lg leading-snug font-medium text-fg transition-colors duration-(--dur-short) group-hover:text-(--project-accent)">
                  ← {previous.title}
                </span>
              </Link>
            )}

            {next && (
              <Link
                href={`/work/${next.id}`}
                data-project-accent
                style={
                  {
                    "--project-accent-light": next.accentColor.light,
                    "--project-accent-dark": next.accentColor.dark,
                  } as React.CSSProperties
                }
                className={`group block rounded-xl border border-line p-5 transition-colors duration-(--dur-short) hover:border-(--project-accent) sm:text-right ${
                  previous ? "" : "sm:col-start-2"
                }`}
              >
                <span className="label">다음</span>
                <span className="mt-2 block text-lg leading-snug font-medium text-fg transition-colors duration-(--dur-short) group-hover:text-(--project-accent)">
                  {next.title} →
                </span>
              </Link>
            )}
          </nav>
        )}
      </main>
    </div>
  );
}
