import ExternalLink from "@/components/layout/ExternalLink";
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
    // 로고는 맨바탕에 두고, 오른쪽 메뉴 묶음만 떠 있는 유리 위에 올린다. 3D 오브젝트와 겹쳐도 메뉴 글자가 읽히게 하려는 것이다
    <header className="fixed inset-x-5 top-3 z-30 flex items-center justify-between md:inset-x-10 md:top-4">
      <a href="#hero" className="display text-2xl leading-none text-fg">
        yunho<span className="text-accent">.dev</span>
      </a>

      <div className="liquid-glass relative flex items-center gap-5 rounded-full py-1 pr-2 pl-6 md:gap-7 md:pr-3 md:pl-7">
        <nav
          aria-label="섹션 이동"
          className="hidden items-center gap-6 md:flex"
        >
          {NAVIGATION_ITEMS.map((navigationItem) => (
            <a
              key={navigationItem.href}
              href={navigationItem.href}
              className="text-[0.9375rem] whitespace-nowrap text-muted transition-colors duration-(--dur-short) hover:text-fg"
            >
              {navigationItem.label}
            </a>
          ))}
        </nav>

        <ExternalLink
          href={PROFILE.githubUrl}
          label="GitHub"
          className="text-link text-[0.9375rem] whitespace-nowrap text-fg"
        />
        <ThemeToggle />
      </div>
    </header>
  );
}
