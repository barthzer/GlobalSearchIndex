import Link from "next/link";
import AWILogo from "./AWILogo";
import UplifyLogo from "./UplifyLogo";

const links = [
  { label: "Privacy Policy", href: "#" },
  { label: "Terms of Service", href: "#" },
];

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-border-subtle bg-bg-primary px-6 py-4">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 sm:flex-row sm:justify-between sm:gap-0">
        <div className="flex items-center gap-2">
          <AWILogo className="h-5 w-auto" style={{ color: "var(--text-muted)" }} />
          <span className="text-[12px] text-text-muted">member of</span>
          <UplifyLogo className="h-4 w-auto text-text-muted" />
          <span className="text-[12px] text-text-muted">
            &copy; 2026 All rights reserved
          </span>
        </div>
        <div className="flex items-center gap-4">
          {links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-[12px] text-text-muted transition-colors duration-200 hover:text-text-secondary"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
