"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Portfolio" },
  { href: "/alerts", label: "Alerts" },
  { href: "/about", label: "How it works" },
];

export function Nav() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-[1000] border-b border-border bg-bg/80 backdrop-blur">
      <div className="mx-auto flex max-w-[1400px] items-center gap-6 px-4 py-3 md:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <Logo />
          <div className="leading-tight">
            <div className="text-sm font-semibold tracking-tight text-text">
              Relave<span className="text-brand"> AI</span>
            </div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-muted">
              Tailings early warning
            </div>
          </div>
        </Link>

        <nav className="ml-2 flex items-center gap-1">
          {LINKS.map((l) => {
            const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                  active ? "bg-surface-2 text-text" : "text-muted hover:text-text"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto hidden items-center gap-2 text-xs text-muted sm:flex">
          <span className="inline-flex h-1.5 w-1.5 rounded-full bg-stable" />
          Sentinel-1 feed live
        </div>
      </div>
    </header>
  );
}

function Logo() {
  return (
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden>
      <rect width="32" height="32" rx="8" fill="#111722" stroke="#233047" />
      <path d="M6 22 L13 12 L19 19 L26 9" stroke="#1f9d8f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="26" cy="9" r="2.4" fill="#2dd4a7" />
    </svg>
  );
}
