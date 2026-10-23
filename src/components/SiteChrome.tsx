"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconBall, IconShield, IconTable, IconTrend } from "./Icons";

const LINKS = [
  { href: "/", label: "Partidos", icon: IconBall, match: (p: string) => p === "/" || p.startsWith("/partido") },
  { href: "/ascenso", label: "Ascenso", icon: IconTrend, match: (p: string) => p.startsWith("/ascenso") },
  { href: "/liga/128", label: "Tablas", icon: IconTable, match: (p: string) => p.startsWith("/liga") },
  { href: "/mis-equipos", label: "Mis equipos", icon: IconShield, match: (p: string) => p.startsWith("/mis-equipos") },
];

export function SiteHeader() {
  const path = usePathname() || "/";
  return (
    <header className="site-header">
      <div className="container">
        <Link href="/" className="logo" aria-label="Gambeta, inicio">
          <span>gambeta</span>
          <span className="dot" />
        </Link>
        <nav className="top-nav" aria-label="Principal">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} aria-current={l.match(path) ? "page" : undefined}>
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

export function BottomNav() {
  const path = usePathname() || "/";
  return (
    <nav className="bottom-nav" aria-label="Principal">
      {LINKS.map((l) => {
        const I = l.icon;
        return (
          <Link key={l.href} href={l.href} aria-current={l.match(path) ? "page" : undefined}>
            <I />
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
