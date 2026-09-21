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

  return (
    // 읽는 화면이라 3D 장면과 부드러운 스크롤은 두지 않는다
    <div className="relative">
      <Header />

      <main className="mx-auto max-w-4xl px-5 pt-32 pb-24 md:px-10 md:pt-40 md:pb-32">
        <p className="label">
          <Link href="/#work" className="text-link">
            ← Work
          </Link>
        </p>

        <div
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

          <h1 className="display mt-4 text-[clamp(2.5rem,7vw,4.5rem)] leading-[1.05] text-fg">
            {project.title}
          </h1>
          <p className="label mt-3">{project.role}</p>

          <p className="mt-8 max-w-(--measure) text-(length:--text-body) leading-relaxed text-muted md:text-lg">
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
        </div>

        <div className="mt-16 border-b border-line">
          {detail.sections.map((section) => (
            <section
              key={section.title}
              className="grid grid-cols-1 gap-x-8 gap-y-3 border-t border-line py-8 md:grid-cols-[14rem_1fr] md:py-10"
            >
              <h2 className="text-lg font-semibold text-fg md:pt-1">
                {section.title}
              </h2>
              <ul className="max-w-(--measure) space-y-3">
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

        <p className="label mt-12">
          <Link href="/#work" className="text-link">
            ← 다른 프로젝트 보기
          </Link>
        </p>
      </main>
    </div>
  );
}
