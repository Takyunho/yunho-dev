import ThemeToggle from "@/components/layout/ThemeToggle";
import { PROFILE } from "@/content/profile";

const NAVIGATION_ITEMS = [
  { label: "About", href: "#about" },
  { label: "Stack", href: "#stack" },
  { label: "Work", href: "#work" },
  { label: "Lab", href: "#lab" },
  { label: "Contact", href: "#contact" },
];

export default function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-30 flex items-center justify-between px-5 py-4 md:px-10 md:py-6">
      <a
        href="#hero"
        // 가장자리로 퍼진 3D 오브젝트와 겹쳐도 읽히도록 내비게이션과 같은 배경을 준다
        className="flex h-10 items-center rounded-full border border-line bg-surface/70 px-4 text-base font-semibold tracking-tight text-fg backdrop-blur"
      >
        yunho<span className="text-accent">.dev</span>
      </a>

      <div className="flex items-center gap-2">
        <nav
          aria-label="섹션 이동"
          className="hidden items-center gap-1 rounded-full border border-line bg-surface/70 px-2 py-1 backdrop-blur md:flex"
        >
          {NAVIGATION_ITEMS.map((navigationItem) => (
            <a
              key={navigationItem.href}
              href={navigationItem.href}
              className="rounded-full px-3 py-1.5 text-sm text-muted transition-colors hover:text-fg"
            >
              {navigationItem.label}
            </a>
          ))}
        </nav>

        <a
          href={PROFILE.githubUrl}
          target="_blank"
          rel="noreferrer"
          className="flex h-10 items-center rounded-full border border-line bg-surface/70 px-4 text-sm text-fg backdrop-blur transition-colors hover:border-accent hover:text-accent"
        >
          GitHub
        </a>
        <ThemeToggle />
      </div>
    </header>
  );
}
